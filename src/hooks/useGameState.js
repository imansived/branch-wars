import { useState, useEffect, useCallback, useRef } from "react";
import { SIZE, initGame, addRandom, moveGrid, hasMovesLeft, findMergedCell, getHighest } from "../game/gridLogic";
import { applyCollegeEvent, rollHasEffect } from "../game/events";
import { COLLEGE_EVENTS } from "../data/flavorText";
import { BRANCH_MAP } from "../data/branches";
import { pickRandom } from "../utils/helpers";
import { SFX, unlockAudio } from "../audio/sfx";

const GAP = 8;
const EVENT_INTERVAL_MIN = 25;
const EVENT_INTERVAL_RANGE = 16; // fires every 25-40 moves

function randomEventInterval(){
  return EVENT_INTERVAL_MIN + Math.floor(Math.random() * EVENT_INTERVAL_RANGE);
}

// 70px tile size is tuned for screens >= 400px wide (320px grid + 56px left
// gutter for punch holes + 24px right padding). Narrower phones drop to 60px
// so the grid+gutters fit without horizontal overflow or edge clipping.
function computeTileSize(){
  if(typeof window === "undefined") return 70;
  return window.innerWidth < 400 ? 60 : 70;
}

export function useGameState(){
  const [screen, setScreen] = useState("front");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCSBanner, setShowCSBanner] = useState(false);
  const csBannerShown = useRef(false);

  const [grid, setGrid] = useState(() => initGame());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [popups, setPopups] = useState([]);
  const [highestValue, setHighestValue] = useState(1);
  const [flashId, setFlashId] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventResult, setEventResult] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [ktUsed, setKtUsed] = useState(false);
  const [ktToast, setKtToast] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);

  const mutedRef = useRef(false);
  const lastSnapshot = useRef(null); // { grid, score, highestValue } before the most recent move
  const milestones = useRef(new Set());
  const touchStart = useRef(null);
  const moveCount = useRef(0);
  const nextEventAt = useRef(randomEventInterval());

  const [TILE, setTILE] = useState(computeTileSize);
  const gridW = TILE * SIZE + GAP * (SIZE + 1);

  const playSfx = useCallback((name, ...args) => {
    if(!mutedRef.current) SFX[name]?.(...args);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      mutedRef.current = next;
      if(!next) SFX.click(); // audible confirmation when turning sound back on
      return next;
    });
  }, []);

  // Recompute tile size on resize/orientation change so rotating a phone or
  // resizing a browser window doesn't leave a stale tile size.
  useEffect(() => {
    const update = () => setTILE(computeTileSize());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // Mobile browsers (esp. iOS Safari) can silently drop the very first sound
  // unless the audio pipeline is warmed up inside an early user gesture.
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("touchstart", unlock, { once:true, passive:true });
    window.addEventListener("mousedown", unlock, { once:true });
    window.addEventListener("keydown", unlock, { once:true });
    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("mousedown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const addPopup = useCallback((text, row, col) => {
    const id = Math.random().toString(36).slice(2);
    setPopups(s => [...s.slice(-1), { id, text, row, col, onDone: () => setPopups(s => s.filter(x => x.id !== id)) }]);
  }, []);

  const triggerCollegeEvent = useCallback((currentHighest) => {
    const event = pickRandom(COLLEGE_EVENTS);
    setActiveEvent(event);
    setEventResult(null);
    if(event.tone === "bad") playSfx("eventBad");
    else if(event.tone === "shuffle") playSfx("shuffle");
    else playSfx("eventGood");

    // 30-40% chance of an actual gameplay effect; otherwise just the banner fires (flavor only)
    if(!rollHasEffect()){
      setTimeout(() => setEventResult("No real impact this time — just paperwork. 📋"), 900);
      return;
    }

    setTimeout(() => {
      setGrid(g => {
        const { grid: ng, resultMsg, scoreBonus, shouldShake } = applyCollegeEvent(g, event, currentHighest);
        if(scoreBonus) setScore(s => { const ns = s + scoreBonus; if(ns > best) setBest(ns); return ns; });
        if(shouldShake){ setShaking(true); setTimeout(() => setShaking(false), 650); }
        setTimeout(() => setEventResult(resultMsg), 100);
        setHighestValue(getHighest(ng));
        return ng;
      });
    }, 700);
  }, [best, playSfx]);

  // ─── KT EXAM (one-time backlog clear) ───────────────────────────────────
  // While playing: undo the last move entirely.
  // When board is locked (game over): delete the lowest-value tile to free a slot.
  const clearBacklog = useCallback(() => {
    if(ktUsed) return;

    if(gameState === "over"){
      setGrid(g => {
        let lowestVal = Infinity, lowestPos = null;
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
          if(g[r][c] && g[r][c].value < lowestVal){ lowestVal = g[r][c].value; lowestPos = [r,c]; }
        }
        if(!lowestPos) return g;
        const ng = g.map(row => [...row]);
        const [r,c] = lowestPos;
        ng[r][c] = null;
        return ng;
      });
      setGameState("playing");
      setKtUsed(true);
      playSfx("backlog");
      setKtToast(true);
      setTimeout(() => setKtToast(false), 3200);
      return;
    }

    if(gameState === "playing" && lastSnapshot.current){
      const snap = lastSnapshot.current;
      setGrid(snap.grid);
      setScore(snap.score);
      setHighestValue(snap.highestValue);
      lastSnapshot.current = null;
      setHasSnapshot(false);
      setKtUsed(true);
      playSfx("backlog");
      setKtToast(true);
      setTimeout(() => setKtToast(false), 3200);
    }
  }, [ktUsed, gameState, playSfx]);

  const handleMove = useCallback((dir) => {
    if(gameState !== "playing") return;
    const { grid: ng, score: gained, moved, merged } = moveGrid(grid, dir);
    if(!moved) return;
    playSfx("move");
    if(merged.length) playSfx("merge", Math.max(...merged));

    // snapshot BEFORE this move resolves, so KT can fully undo it
    lastSnapshot.current = { grid, score, highestValue };
    setHasSnapshot(true);
    const withNew = addRandom(ng);
    const highest = getHighest(withNew);

    if(highest > highestValue){ setFlashId(highest); setTimeout(() => setFlashId(null), 1600); }
    if(highest >= 8 && !csBannerShown.current){ csBannerShown.current = true; setTimeout(() => setShowCSBanner(true), 500); }
    setHighestValue(highest);
    setGrid(withNew);
    setScore(s => { const ns = s + gained; if(ns > best) setBest(ns); return ns; });

    merged.forEach(val => {
      if(!milestones.current.has(val) && val <= 8){
        milestones.current.add(val);
        const branch = BRANCH_MAP[val];
        if(branch?.roasts?.length){
          const pos = findMergedCell(withNew, val);
          setTimeout(() => addPopup(pickRandom(branch.roasts), pos.row, pos.col), 80);
        }
      }
    });

    // CS+CS merge triggers placement win directly (value 9 = "Ultimate Package")
    if(merged.includes(9)){ setTimeout(() => setGameState("won"), 340); return; }

    if(!hasMovesLeft(withNew)){ setTimeout(() => setGameState("over"), 340); return; }

    moveCount.current += 1;
    if(moveCount.current >= nextEventAt.current){
      moveCount.current = 0;
      nextEventAt.current = randomEventInterval();
      setTimeout(() => triggerCollegeEvent(highest), 250);
    }
  }, [grid, gameState, best, highestValue, score, addPopup, triggerCollegeEvent, playSfx]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const map = { ArrowUp:"up", ArrowDown:"down", ArrowLeft:"left", ArrowRight:"right" };
      if(map[e.key]){ e.preventDefault(); handleMove(map[e.key]); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleMove]);

  useEffect(() => { if(showCSBanner) playSfx("csUnlock"); }, [showCSBanner, playSfx]);
  useEffect(() => {
    if(gameState === "won") playSfx("win");
    else if(gameState === "over") playSfx("gameOver");
  }, [gameState, playSfx]);

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touchStart.current = { x:t.clientX, y:t.clientY };
  }, []);

  const onTouchEnd = useCallback((e) => {
    if(!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if(Math.max(adx, ady) < 26) return;
    handleMove(adx > ady ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    touchStart.current = null;
  }, [handleMove]);

  const restart = useCallback(() => {
    playSfx("click");
    setGrid(initGame());
    setScore(0);
    setHighestValue(1);
    setGameState("playing");
    setPopups([]);
    milestones.current = new Set();
    moveCount.current = 0;
    nextEventAt.current = randomEventInterval();
    setFlashId(null);
    setActiveEvent(null);
    setEventResult(null);
    setShaking(false);
    csBannerShown.current = false;
    setShowCSBanner(false);
    setKtUsed(false);
    setKtToast(false);
    lastSnapshot.current = null;
    setHasSnapshot(false);
    setScreen("game");
  }, [playSfx]);

  const startGame = useCallback(() => {
    playSfx("click");
    setScreen("game");
    setShowWelcome(true);
  }, [playSfx]);

  const dismissKtToast = useCallback(() => setKtToast(false), []);

  return {
    screen, startGame,
    showWelcome, setShowWelcome,
    showCSBanner, setShowCSBanner,
    grid, score, best, gameState, popups,
    highestValue, flashId,
    activeEvent, eventResult, setActiveEvent, setEventResult,
    shaking, ktUsed, ktToast, muted, toggleMute, hasSnapshot, dismissKtToast,
    TILE, GAP, gridW,
    handleMove, clearBacklog, restart,
    onTouchStart, onTouchEnd,
  };
}

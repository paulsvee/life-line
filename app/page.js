"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { signIn, signOut } from "next-auth/react";

const PALETTE = [
  "#FFEA00",
  "#00E5FF",
  "#FF3D00",
  "#00E676",
  "#B388FF",
  "#FF80AB",
  "#FFD180",
  "#69F0AE",
  "#82B1FF",
  "#FFFFFF",
];

const DEFAULT_STATE = {
  id: "default",
  anchor: "",
  keywordsInput: "",
  chips: [""],
  colors: [null],
};

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createInspirationMotion() {
  return {
    grid: {
      "--grid-duration": `${randomBetween(13, 21).toFixed(2)}s`,
      "--grid-x": `${randomBetween(-58, -28).toFixed(1)}px`,
      "--grid-y": `${randomBetween(14, 30).toFixed(1)}px`,
    },
    paths: [
      {
        "--flow-duration": `${randomBetween(10, 16).toFixed(2)}s`,
        "--flow-delay": `${randomBetween(-6, 0).toFixed(2)}s`,
      },
      {
        "--flow-duration": `${randomBetween(8, 13).toFixed(2)}s`,
        "--flow-delay": `${randomBetween(-5, 0).toFixed(2)}s`,
      },
      {
        "--flow-duration": `${randomBetween(12, 19).toFixed(2)}s`,
        "--flow-delay": `${randomBetween(-7, 0).toFixed(2)}s`,
      },
    ],
    glows: [
      {
        "--glow-duration": `${randomBetween(5.5, 8.5).toFixed(2)}s`,
        "--glow-delay": `${randomBetween(-4, 0).toFixed(2)}s`,
        "--glow-x": `${randomBetween(-10, 10).toFixed(1)}px`,
        "--glow-y": `${randomBetween(-14, -4).toFixed(1)}px`,
        "--glow-x2": `${randomBetween(-6, 14).toFixed(1)}px`,
        "--glow-y2": `${randomBetween(-4, -1).toFixed(1)}px`,
        "--glow-x3": `${randomBetween(-12, 4).toFixed(1)}px`,
        "--glow-y3": `${randomBetween(-16, -6).toFixed(1)}px`,
      },
      {
        "--glow-duration": `${randomBetween(6.5, 10.5).toFixed(2)}s`,
        "--glow-delay": `${randomBetween(-5, 0).toFixed(2)}s`,
        "--glow-x": `${randomBetween(-12, 12).toFixed(1)}px`,
        "--glow-y": `${randomBetween(-16, -6).toFixed(1)}px`,
        "--glow-x2": `${randomBetween(-4, 16).toFixed(1)}px`,
        "--glow-y2": `${randomBetween(-6, -1).toFixed(1)}px`,
        "--glow-x3": `${randomBetween(-14, 2).toFixed(1)}px`,
        "--glow-y3": `${randomBetween(-18, -8).toFixed(1)}px`,
      },
    ],
    nodes: Array.from({ length: 3 }, () => ({
      "--node-duration": `${randomBetween(3.8, 7.5).toFixed(2)}s`,
      "--node-delay": `${randomBetween(-5, 0).toFixed(2)}s`,
      "--node-x": `${randomBetween(4, 14).toFixed(1)}px`,
      "--node-y": `${randomBetween(-10, -2).toFixed(1)}px`,
      "--node-scale": randomBetween(1.12, 1.38).toFixed(2),
      "--node-opacity": randomBetween(0.4, 0.62).toFixed(2),
      "--node-x2": `${randomBetween(-8, -2).toFixed(1)}px`,
      "--node-y2": `${randomBetween(-12, -5).toFixed(1)}px`,
      "--node-scale2": randomBetween(1.04, 1.18).toFixed(2),
      "--node-x3": `${randomBetween(6, 16).toFixed(1)}px`,
      "--node-y3": `${randomBetween(-4, 2).toFixed(1)}px`,
      "--node-scale3": randomBetween(1.1, 1.28).toFixed(2),
    })),
    clouds: [
      {
        "--cloud-duration": `${randomBetween(7.5, 13).toFixed(2)}s`,
        "--cloud-delay": `${randomBetween(-6, 0).toFixed(2)}s`,
        "--cloud-x": `${randomBetween(12, 32).toFixed(1)}px`,
        "--cloud-y": `${randomBetween(-14, -4).toFixed(1)}px`,
        "--cloud-opacity": randomBetween(0.24, 0.38).toFixed(2),
        "--cloud-x2": `${randomBetween(-16, -6).toFixed(1)}px`,
        "--cloud-y2": `${randomBetween(-6, -2).toFixed(1)}px`,
        "--cloud-x3": `${randomBetween(18, 36).toFixed(1)}px`,
        "--cloud-y3": `${randomBetween(-18, -8).toFixed(1)}px`,
      },
      {
        "--cloud-duration": `${randomBetween(8.5, 14.5).toFixed(2)}s`,
        "--cloud-delay": `${randomBetween(-7, 0).toFixed(2)}s`,
        "--cloud-x": `${randomBetween(14, 36).toFixed(1)}px`,
        "--cloud-y": `${randomBetween(-16, -5).toFixed(1)}px`,
        "--cloud-opacity": randomBetween(0.22, 0.36).toFixed(2),
        "--cloud-x2": `${randomBetween(-18, -8).toFixed(1)}px`,
        "--cloud-y2": `${randomBetween(-8, -2).toFixed(1)}px`,
        "--cloud-x3": `${randomBetween(20, 40).toFixed(1)}px`,
        "--cloud-y3": `${randomBetween(-20, -10).toFixed(1)}px`,
      },
    ],
  };
}

function normalizeKeywords(input) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildChips(anchor, keywordsInput) {
  return [anchor.trim(), ...normalizeKeywords(keywordsInput)];
}

function normalizeColors(colors, chipCount) {
  return Array.from({ length: chipCount }, (_, index) => {
    const color = colors?.[index];
    return typeof color === "string" && color ? color : null;
  });
}

function chipStyle(color, isAnchor) {
  if (!color) return {};
  return {
    "--chip-handle-bg": `linear-gradient(rgba(0,0,0,0.34), rgba(0,0,0,0.34)), ${color}`,
    "--chip-handle-text": "rgba(255,255,255,0.72)",
    borderColor: `${color}99`,
    background: `linear-gradient(rgba(0,0,0,0.40), rgba(0,0,0,0.40)), ${color}`,
    color: "rgba(255,255,255,0.92)",
    ...(isAnchor ? { boxShadow: `0 0 0 1px ${color}26` } : {}),
  };
}

function DotsIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor" />
      <path d="M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor" />
      <path d="M12 20.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor" />
    </svg>
  );
}

function SunIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.2 2.2M7.5 16.5l-2.2 2.2M18.7 18.7l-2.2-2.2M7.5 7.5 5.3 5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18.5 14.8A7.8 7.8 0 0 1 9.2 5.5 8.6 8.6 0 1 0 18.5 14.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function LineViewIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function WrapViewIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 8.5h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5 15.5h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.3 10.7 15.7 6.3M8.3 13.3l7.4 4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Page() {
  const [lineId, setLineId] = useState(DEFAULT_STATE.id);
  const [anchor, setAnchor] = useState(DEFAULT_STATE.anchor);
  const [keywordsInput, setKeywordsInput] = useState(DEFAULT_STATE.keywordsInput);
  const [chips, setChips] = useState(DEFAULT_STATE.chips);
  const [colors, setColors] = useState(DEFAULT_STATE.colors);
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chipMenuIndex, setChipMenuIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [wrapMode, setWrapMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("wrapMode") === "1";
  });
  const [viewer, setViewer] = useState({ authenticated: false });
  const [canWrite, setCanWrite] = useState(false);
  const [inspirationMotion] = useState(() => createInspirationMotion());
  const [chipRows, setChipRows] = useState(null);

  const anchorInputRef = useRef(null);
  const scrollerRef = useRef(null);
  const linePanelRef = useRef(null);
  const panelCleanupRef = useRef(null);
  const chipRefs = useRef([]);
  const historyRef = useRef([]);
  const chipsRef = useRef(chips);
  const colorsRef = useRef(colors);
  const persistLineRef = useRef(null);

  chipsRef.current = chips;
  colorsRef.current = colors;
  const dragStateRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    activeIndex: null,
    started: false,
  });
  const scrollDragRef = useRef({
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    dragging: false,
  });
  const touchScrollRef = useRef({
    startX: 0,
    startScrollLeft: 0,
    active: false,
  });

  useEffect(() => {
    localStorage.setItem("wrapMode", wrapMode ? "1" : "0");
  }, [wrapMode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        const history = historyRef.current;
        if (!history.length) return;
        event.preventDefault();
        const prev = history.pop();
        setChips(prev.chips);
        setColors(prev.colors);
        persistLineRef.current?.(prev.chips, prev.colors);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch("/api/bootstrap", { cache: "no-store" });
        if (!response.ok) throw new Error("bootstrap failed");
        const data = await response.json();
        const nextChips = Array.isArray(data.line?.chips) && data.line.chips.length > 0 ? data.line.chips : [""];
        setLineId(data.line.id);
        setChips(nextChips);
        setColors(normalizeColors(data.line?.colors, nextChips.length));
        setViewer(data.viewer || { authenticated: false });
        setCanWrite(Boolean(data.canWrite));
      } finally {
        setHydrated(true);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const drag = dragStateRef.current;
      if (drag.pointerId !== event.pointerId || drag.activeIndex == null) return;
      event.preventDefault();

      const dx = Math.abs(event.clientX - drag.startX);
      const dy = Math.abs(event.clientY - drag.startY);
      const delta = Math.max(dx, dy);
      if (!drag.started && delta > 5) {
        drag.started = true;
        setDraggingIndex(drag.activeIndex);
        setDropIndex(drag.activeIndex);
        setIsDragging(true);
      }

      if (!drag.started) return;

      if (!wrapMode) {
        const scroller = scrollerRef.current;
        if (scroller) {
          const rect = scroller.getBoundingClientRect();
          if (event.clientX > rect.right - 56) scroller.scrollLeft += 18;
          if (event.clientX < rect.left + 56) scroller.scrollLeft -= 18;
        }
      }

      const movableRefs = chipRefs.current.slice(1);
      let nextIndex = chips.length;

      if (wrapMode) {
        for (let i = 0; i < movableRefs.length; i += 1) {
          const node = movableRefs[i];
          if (!node) continue;
          const rect = node.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const midX = rect.left + rect.width / 2;
          if (event.clientY < midY || (event.clientY <= rect.bottom && event.clientX < midX)) {
            nextIndex = i + 1;
            break;
          }
        }
      } else {
        for (let i = 0; i < movableRefs.length; i += 1) {
          const node = movableRefs[i];
          if (!node) continue;
          const chipRect = node.getBoundingClientRect();
          const midpoint = chipRect.left + chipRect.width / 2;
          if (event.clientX < midpoint) {
            nextIndex = i + 1;
            break;
          }
        }
      }

      setDropIndex(nextIndex);
    };

    const handlePointerUp = async (event) => {
      const drag = dragStateRef.current;
      if (drag.pointerId !== event.pointerId) return;

      if (drag.started && drag.activeIndex != null && dropIndex != null) {
        pushHistory();
        const nextChips = [...chips];
        const nextColors = [...colors];
        const [movedChip] = nextChips.splice(drag.activeIndex, 1);
        const [movedColor] = nextColors.splice(drag.activeIndex, 1);
        const insertIndex = drag.activeIndex < dropIndex ? dropIndex - 1 : dropIndex;
        const safeIndex = Math.max(1, insertIndex);
        nextChips.splice(safeIndex, 0, movedChip);
        nextColors.splice(safeIndex, 0, movedColor ?? null);
        setChips(nextChips);
        setColors(nextColors);
        await persistLine(nextChips, nextColors);
      }

      dragStateRef.current = {
        pointerId: null,
        startX: 0,
        startY: 0,
        activeIndex: null,
        started: false,
      };
      setDraggingIndex(null);
      setDropIndex(null);
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [chips, colors, dropIndex, wrapMode]);

  // Reset row measurement when chips or wrap mode changes
  useLayoutEffect(() => {
    if (wrapMode) setChipRows(null);
  }, [chips, wrapMode]);

  // Measure chip positions and group into rows
  useLayoutEffect(() => {
    if (!wrapMode || chipRows !== null) return;

    const rowMap = [];
    chips.forEach((_, index) => {
      const el = chipRefs.current[index];
      if (!el) return;
      const top = Math.round(el.getBoundingClientRect().top);
      const existing = rowMap.find((r) => Math.abs(r.top - top) < 8);
      if (existing) {
        existing.indices.push(index);
      } else {
        rowMap.push({ top, indices: [index] });
      }
    });
    rowMap.sort((a, b) => a.top - b.top);
    setChipRows(rowMap.map((r) => r.indices));
  }, [wrapMode, chips, chipRows]);

  // Re-measure on window resize while in wrap mode
  useEffect(() => {
    if (!wrapMode) return;
    const onResize = () => setChipRows(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [wrapMode]);

  const pushHistory = () => {
    const history = historyRef.current;
    history.push({ chips: [...chipsRef.current], colors: [...colorsRef.current] });
    if (history.length > 50) history.shift();
  };

  const persistLine = async (nextChips, nextColors) => {
    if (!canWrite) return;
    await fetch(`/api/line/${lineId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: lineId,
        anchor: nextChips[0] ?? "",
        keywordsInput: nextChips.slice(1).join(", "),
        chips: nextChips,
        colors: normalizeColors(nextColors, nextChips.length),
      }),
    });
  };

  persistLineRef.current = persistLine;

  const applyInputs = async (nextAnchor = anchor, nextKeywords = keywordsInput) => {
    if (!canWrite) return;
    const trimmedAnchor = nextAnchor.trim();
    const nextKeywordList = normalizeKeywords(nextKeywords);
    const existingAnchor = chips[0] ?? "";
    const existingKeywordList = chips.slice(1);
    const existingColors = normalizeColors(colors, chips.length);

    const mergedAnchor = isEditing
      ? trimmedAnchor
      : trimmedAnchor
        ? (existingAnchor ? `${existingAnchor} ${trimmedAnchor}`.trim() : trimmedAnchor)
        : existingAnchor;

    const mergedKeywordList = isEditing
      ? nextKeywordList
      : [...existingKeywordList, ...nextKeywordList];

    const effectiveKeywords = mergedKeywordList.join(", ");
    if (!mergedAnchor && !effectiveKeywords) return;

    const nextChips = buildChips(mergedAnchor, effectiveKeywords);
    let nextColors;

    if (isEditing) {
      const keywordColorPool = new Map();
      existingKeywordList.forEach((keyword, index) => {
        const color = existingColors[index + 1] ?? null;
        const bucket = keywordColorPool.get(keyword) ?? [];
        bucket.push(color);
        keywordColorPool.set(keyword, bucket);
      });

      nextColors = [existingColors[0] ?? null];
      mergedKeywordList.forEach((keyword) => {
        const bucket = keywordColorPool.get(keyword);
        nextColors.push(bucket?.length ? bucket.shift() ?? null : null);
      });
    } else {
      nextColors = [
        existingColors[0] ?? null,
        ...existingColors.slice(1, existingKeywordList.length + 1),
        ...new Array(nextKeywordList.length).fill(null),
      ];
    }

    const safeColors = normalizeColors(nextColors, nextChips.length);
    pushHistory();
    setChips(nextChips);
    setColors(safeColors);
    setAnchor("");
    setKeywordsInput("");
    setIsEditing(false);
    await persistLine(nextChips, safeColors);
  };

  const handleDragStart = (index, event) => {
    if (!canWrite) return;
    if (index === 0) return;
    event.preventDefault();
    event.stopPropagation();
    scrollDragRef.current = {
      pointerId: null,
      startX: 0,
      startScrollLeft: 0,
      dragging: false,
    };
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      activeIndex: index,
      started: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleScrollerPointerDown = (event) => {
    if (wrapMode) return;
    if (event.pointerType === "touch") return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (dragStateRef.current.pointerId !== null) return;
    const target = event.target;
    if (target instanceof Element && target.closest(".chip-handle")) return;

    scrollDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: scroller.scrollLeft,
      dragging: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleScrollerPointerMove = (event) => {
    if (wrapMode) return;
    if (event.pointerType === "touch") return;
    const scroller = scrollerRef.current;
    const scrollDrag = scrollDragRef.current;
    if (dragStateRef.current.pointerId !== null) return;
    if (!scroller || scrollDrag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - scrollDrag.startX;
    if (!scrollDrag.dragging && Math.abs(deltaX) > 4) {
      scrollDrag.dragging = true;
    }

    if (!scrollDrag.dragging) return;
    event.preventDefault();
    scroller.scrollLeft = scrollDrag.startScrollLeft - deltaX;
  };

  const handleScrollerPointerUp = (event) => {
    if (event.pointerType === "touch") return;
    if (dragStateRef.current.pointerId === event.pointerId) return;
    if (scrollDragRef.current.pointerId !== event.pointerId) return;
    scrollDragRef.current = {
      pointerId: null,
      startX: 0,
      startScrollLeft: 0,
      dragging: false,
    };
  };

  const handleScrollerWheel = (event) => {
    if (wrapMode) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    scroller.scrollLeft += delta;
  };

  const handleScrollerTouchStart = (event) => {
    if (wrapMode) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const target = event.target;
    if (target instanceof Element && target.closest(".chip-handle")) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    touchScrollRef.current = {
      startX: touch.clientX,
      startScrollLeft: scroller.scrollLeft,
      active: true,
    };
  };

  const handleScrollerTouchMove = (event) => {
    if (wrapMode) return;
    const scroller = scrollerRef.current;
    const touchState = touchScrollRef.current;
    if (!scroller || !touchState.active) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchState.startX;
    scroller.scrollLeft = touchState.startScrollLeft - deltaX;
  };

  const handleScrollerTouchEnd = () => {
    touchScrollRef.current = {
      startX: 0,
      startScrollLeft: 0,
      active: false,
    };
  };

  const handleToggleWrapMode = () => {
    const panel = linePanelRef.current;

    if (!panel) {
      setWrapMode((prev) => !prev);
      return;
    }

    // Cancel any in-progress transition
    if (panelCleanupRef.current) {
      panel.removeEventListener("transitionend", panelCleanupRef.current);
      panelCleanupRef.current = null;
      panel.style.cssText = "";
    }

    const startH = panel.offsetHeight;
    panel.style.height = `${startH}px`;
    panel.style.overflow = "hidden";

    // Flush React update + all layout effects synchronously
    flushSync(() => {
      setWrapMode((prev) => !prev);
    });

    // Measure natural height after DOM update
    panel.style.height = "auto";
    const endH = panel.scrollHeight;
    panel.style.height = `${startH}px`;

    // Force reflow so the browser registers the start height
    void panel.offsetHeight;

    panel.style.transition = "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    panel.style.height = `${endH}px`;

    const cleanup = () => {
      panel.style.cssText = "";
      panelCleanupRef.current = null;
      panel.removeEventListener("transitionend", cleanup);
    };
    panelCleanupRef.current = cleanup;
    panel.addEventListener("transitionend", cleanup);
  };

  const handleEdit = () => {
    if (!canWrite) return;
    setAnchor(chips[0] ?? "");
    setKeywordsInput(chips.slice(1).join(", "));
    setIsEditing(true);
    setMenuOpen(false);
    setTimeout(() => {
      anchorInputRef.current?.focus();
      anchorInputRef.current?.select();
    }, 0);
  };

  const handleDelete = async () => {
    if (!canWrite) return;
    if (!window.confirm("Are you sure you want to delete?")) return;
    const nextChips = [""];
    const nextColors = [null];
    setAnchor("");
    setKeywordsInput("");
    setChips(nextChips);
    setColors(nextColors);
    setIsEditing(false);
    setMenuOpen(false);
    setChipMenuIndex(null);
    await persistLine(nextChips, nextColors);
  };

  const handleDeleteChip = async (index) => {
    if (!canWrite) return;
    pushHistory();
    const nextChips = chips.filter((_, i) => i !== index);
    const nextColors = colors.filter((_, i) => i !== index);
    const safeChips = nextChips.length ? nextChips : [""];
    const safeColors = nextColors.length ? nextColors : [null];
    setChips(safeChips);
    setColors(safeColors);
    setChipMenuIndex(null);
    await persistLine(safeChips, safeColors);
  };

  const handlePickColor = async (index, color) => {
    if (!canWrite) return;
    pushHistory();
    const nextColors = normalizeColors(colors, chips.length);
    nextColors[index] = color;
    setColors(nextColors);
    setChipMenuIndex(null);
    await persistLine(chips, nextColors);
  };

  const renderChipCluster = (index) => {
    const chip = chips[index];
    const locked = index === 0;
    const isGhost = draggingIndex === index;
    const showDropIndicator = isDragging && dropIndex === index && draggingIndex !== index;

    return (
      <div className="chip-cluster" key={`${chip}-${index}`}>
        {index === 1 ? <div className="line-separator" aria-hidden="true">|</div> : null}
        <div className="chip-slot">
          {showDropIndicator ? <div className="drop-indicator" /> : null}
          <div
            ref={(node) => {
              chipRefs.current[index] = node;
            }}
            className={`life-chip${locked ? " is-anchor" : ""}${isGhost ? " is-ghost" : ""}`}
            style={chipStyle(colors[index], locked)}
          >
            <button
              className={`chip-handle${locked ? " is-locked" : ""}`}
              onPointerDown={(event) => handleDragStart(index, event)}
              type="button"
              aria-label={locked ? "Anchor keyword (fixed)" : `Move keyword ${index}`}
            >
              {index}
            </button>
            <span className="chip-text">{chip}</span>
            {chip ? (
              <button
                type="button"
                className={`chip-dots${chipMenuIndex === index ? " is-open" : ""}`}
                onClick={(event) => {
                  if (!canWrite) return;
                  event.stopPropagation();
                  setChipMenuIndex(index);
                  setMenuOpen(false);
                }}
                disabled={!canWrite}
                aria-label={`Color menu for ${index}`}
              >
                <DotsIcon size={14} />
              </button>
            ) : null}
          </div>
        </div>
        {index === 0 ? (
          <div className="chip-menu-wrap">
            <button
              className={`chip-menu-button${menuOpen ? " is-open" : ""}`}
              type="button"
              onClick={() => canWrite && setMenuOpen((prev) => !prev)}
              disabled={!canWrite}
              aria-label="Line menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  if (!hydrated) return null;

  return (
    <main className={`page-shell${wrapMode ? " is-wrapped" : ""}`} data-theme={theme}>
      <div className="inspiration-band" aria-hidden="true">
        <div className="inspiration-grid" style={inspirationMotion.grid} />
        <svg className="inspiration-svg" viewBox="0 0 1600 360" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lifeFlowA" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="35%" stopColor="rgba(255,163,127,0.34)" />
              <stop offset="70%" stopColor="rgba(123,176,255,0.28)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id="lifeFlowB" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.16)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="lifeGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path className="flow-path path-a" style={inspirationMotion.paths[0]} d="M-320 258 C -72 148, 198 330, 468 228 S 934 120, 1216 214 S 1564 304, 1900 150" />
          <path className="flow-path path-b" style={inspirationMotion.paths[1]} d="M-340 304 C -62 206, 276 354, 610 266 S 1144 176, 1456 256 S 1742 320, 1950 216" />
          <path className="flow-path path-c" style={inspirationMotion.paths[2]} d="M-260 126 C 38 70, 404 186, 760 146 S 1304 78, 1880 142" />
          <path className="flow-glow glow-a" style={inspirationMotion.glows[0]} d="M-260 212 C -12 146, 278 298, 592 232 S 1088 148, 1562 222" />
          <path className="flow-glow glow-b" style={inspirationMotion.glows[1]} d="M-120 286 C 146 226, 528 320, 878 250 S 1368 172, 1888 238" />
          <circle className="flow-node node-a" style={inspirationMotion.nodes[0]} cx="468" cy="232" r="5" />
          <circle className="flow-node node-b" style={inspirationMotion.nodes[1]} cx="1046" cy="184" r="4" />
          <circle className="flow-node node-c" style={inspirationMotion.nodes[2]} cx="1328" cy="208" r="6" />
        </svg>
        <div className="inspiration-glow-cloud cloud-a" style={inspirationMotion.clouds[0]} />
        <div className="inspiration-glow-cloud cloud-b" style={inspirationMotion.clouds[1]} />
        <div className="inspiration-bottom-fade" />
      </div>

      <section className="line-frame">
        <div className="line-brand-row">
          <div>
            <p className="eyebrow">Life</p>
            <p className="auth-status">
              {viewer.authenticated ? `${viewer.email} personal line` : "Sample line"}
            </p>
          </div>
          <p className="brand-hint">터치스크린 UX로 제작되어, 터치 기기에서 가장 잘 작동합니다.</p>
          <button
            type="button"
            className="auth-button"
            onClick={() => viewer.authenticated ? signOut({ callbackUrl: "/" }) : signIn("google")}
          >
            {viewer.authenticated ? "Logout" : "Google Login"}
          </button>
        </div>

        <div className="composer composer-inline">
          <label className="field field-compact field-anchor">
            <span>0</span>
            <input
              ref={anchorInputRef}
              value={anchor}
              onChange={(event) => setAnchor(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void applyInputs(event.currentTarget.value, keywordsInput);
                }
              }}
              placeholder="Most important keyword"
              disabled={!canWrite}
            />
          </label>

          <div className="inline-divider" aria-hidden="true">|</div>

          <label className="field field-compact field-keywords">
            <span>1+</span>
            <input
              value={keywordsInput}
              onChange={(event) => setKeywordsInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void applyInputs(anchor, event.currentTarget.value);
                }
              }}
              placeholder="Life priority keywords, separate with commas. Press Enter to add"
              disabled={!canWrite}
            />
          </label>

          <div className="view-controls composer-controls">
            <button
              type="button"
              className="theme-toggle"
              onClick={handleToggleWrapMode}
              aria-label={wrapMode ? "Single line view" : "Wrap view"}
            >
              {wrapMode ? <LineViewIcon /> : <WrapViewIcon />}
            </button>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>

        <div className="line-panel" ref={linePanelRef}>
          {wrapMode && chipRows !== null ? (
            <div className="line-rows">
              {chipRows.map((rowIndices, rowIdx) => (
                <div key={rowIdx} className="line-row">
                  {rowIndices.map((index) => renderChipCluster(index))}
                  {isDragging && dropIndex === chips.length && rowIdx === chipRows.length - 1 ? (
                    <div className="drop-indicator tail" />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`line-scroller${wrapMode ? " is-wrapped" : ""}`}
              ref={scrollerRef}
              style={wrapMode && chipRows === null ? { visibility: "hidden" } : undefined}
              onPointerDown={handleScrollerPointerDown}
              onPointerMove={handleScrollerPointerMove}
              onPointerUp={handleScrollerPointerUp}
              onPointerCancel={handleScrollerPointerUp}
              onWheel={handleScrollerWheel}
              onTouchStart={handleScrollerTouchStart}
              onTouchMove={handleScrollerTouchMove}
              onTouchEnd={handleScrollerTouchEnd}
              onTouchCancel={handleScrollerTouchEnd}
            >
              <div className={`line-track${wrapMode ? " is-wrapped" : ""}`}>
                {chips.map((_, index) => renderChipCluster(index))}
                {isDragging && dropIndex === chips.length ? <div className="drop-indicator tail" /> : null}
              </div>
            </div>
          )}
        </div>
      </section>

      {menuOpen ? (
        <div className="menu-modal-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="menu-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="menu-modal-action is-disabled" disabled aria-label="Share (coming soon)">
              <ShareIcon size={15} />
            </button>
            <button type="button" className="menu-modal-action" onClick={handleEdit}>
              Edit
            </button>
            <button type="button" className="menu-modal-action is-danger" onClick={() => void handleDelete()}>
              Delete
            </button>
          </div>
        </div>
      ) : null}

      {chipMenuIndex != null ? (
        <div className="color-modal-backdrop" onClick={() => setChipMenuIndex(null)}>
          <div className="color-modal" onClick={(event) => event.stopPropagation()}>
            <div className="color-swatch-row">
              {PALETTE.map((color) => {
                const active = colors[chipMenuIndex] === color;
                return (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch${active ? " is-active" : ""}`}
                    style={{ background: color }}
                    onClick={() => void handlePickColor(chipMenuIndex, color)}
                    aria-label={color}
                  />
                );
              })}
            </div>
            <div className="color-modal-actions">
              <button type="button" className="color-modal-button" onClick={() => void handlePickColor(chipMenuIndex, null)}>
                No color
              </button>
              <button type="button" className="color-modal-button is-danger" onClick={() => void handleDeleteChip(chipMenuIndex)}>
                Delete
              </button>
              <button type="button" className="color-modal-close" onClick={() => setChipMenuIndex(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

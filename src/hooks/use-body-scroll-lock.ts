"use client";

import * as React from "react";

let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

function lockBody() {
  const body = document.body;
  const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
  previousOverflow = body.style.overflow;
  previousPaddingRight = body.style.paddingRight;
  body.style.overflow = "hidden";
  if (scrollbarGap > 0) {
    body.style.paddingRight = `${scrollbarGap}px`;
  }
}

function unlockBody() {
  const body = document.body;
  body.style.overflow = previousOverflow;
  body.style.paddingRight = previousPaddingRight;
}

/** Prevents the page behind a modal/popup from scrolling. Nested locks are counted. */
export function useBodyScrollLock(locked: boolean) {
  React.useEffect(() => {
    if (!locked) return;

    if (lockCount === 0) lockBody();
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) unlockBody();
    };
  }, [locked]);
}

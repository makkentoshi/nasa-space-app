"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // registration successful
          // console.log('Service worker registered.', reg);
        })
        .catch((err) => {
          // console.warn('Service worker registration failed:', err);
        });
    }
  }, []);

  return null;
}

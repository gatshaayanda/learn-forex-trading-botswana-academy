"use client";

import { useEffect, useState } from "react";

export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);

    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!installEvent) return null;

  return (
    <button
      onClick={async () => {
        const event = installEvent as Event & { prompt?: () => Promise<void>; userChoice?: Promise<unknown> };
        await event.prompt?.();
        setInstallEvent(null);
      }}
      className="fixed bottom-20 left-4 z-50 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold shadow-xl sm:left-6"
    >
      Install Academy
    </button>
  );
}

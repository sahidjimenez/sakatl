"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushNotificationToggle() {
  const [supported] = useState(
    () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window,
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready.then(async (registration) => {
      const sub = await registration.pushManager.getSubscription();
      setSubscribed(Boolean(sub));
    });
  }, [supported]);

  async function subscribe() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      setSubscribed(true);
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
      <p className="mb-1 text-base font-bold text-[#f1f3f4]">Recordatorios</p>
      <p className="mb-4 text-sm text-[#9099a3]">
        Recibe una notificación cuando tengas una rutina agendada para hoy.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={subscribed ? unsubscribe : subscribe}
        className={`rounded-[10px] px-5 py-2.5 text-sm font-bold disabled:opacity-60 ${
          subscribed
            ? "border border-[#2a2f37] text-[#f1f3f4] hover:border-red-500 hover:text-red-400"
            : "bg-[#22c55e] text-[#08150d]"
        }`}
      >
        {busy ? "…" : subscribed ? "Desactivar recordatorios" : "Activar recordatorios"}
      </button>
    </div>
  );
}

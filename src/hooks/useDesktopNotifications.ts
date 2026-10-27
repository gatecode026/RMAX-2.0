"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export function useDesktopNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Play subtle notification chime using Web Audio API
  const playChime = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy might prevent playback silently
    }
  }, []);

  // Dispatch browser desktop notification
  const triggerDesktopNotification = useCallback((notif: { title: string; message: string; link?: string }) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        const desktopNotif = new Notification(notif.title, {
          body: notif.message,
          icon: "/images/logo-navy.png",
          badge: "/favicon.ico",
          tag: notif.title + Date.now(),
        });

        desktopNotif.onclick = () => {
          window.focus();
          if (notif.link) {
            window.location.href = notif.link;
          }
          desktopNotif.close();
        };
      } catch {
        // Fallback silently if browser restricts Notification creation
      }
    }
  }, []);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Offline or network error
    } finally {
      setLoading(false);
    }
  }, []);

  // Request browser desktop permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === "granted") {
        // Test notification
        triggerDesktopNotification({
          title: "Desktop Alerts Active",
          message: "You will now receive instant desktop notifications for lead activities and assignments.",
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [triggerDesktopNotification]);

  // Mark single notification read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // Network error
    }
  }, []);

  // Mark all notifications read
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch {
      // Network error
    }
  }, []);

  // Setup SSE stream and initial state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = "Notification" in window;
      setIsSupported(supported);
      if (supported) {
        setPermission(Notification.permission);
      }
    }

    fetchNotifications();

    // SSE connection function
    function connectSSE() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource("/api/notifications/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "connected") {
            setIsConnected(true);
            return;
          }

          if (data.type === "new_notification" && data.notification) {
            const newNotif: AppNotification = data.notification;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((c) => c + 1);

            // Play sound and show desktop alert
            playChime();
            triggerDesktopNotification({
              title: newNotif.title,
              message: newNotif.message,
              link: newNotif.link,
            });
          }
        } catch {
          // Parse error
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        // Reconnect after 6 seconds
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connectSSE, 6000);
      };
    }

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchNotifications, playChime, triggerDesktopNotification]);

  return {
    notifications,
    unreadCount,
    permission,
    isSupported,
    isConnected,
    loading,
    requestPermission,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
}

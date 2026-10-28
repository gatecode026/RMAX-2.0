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
  metadata?: Record<string, unknown>;
}

export function useDesktopNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const [isSupported] = useState<boolean>(
    () => typeof window !== "undefined" && "Notification" in window
  );
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
        const mapped: AppNotification[] = (data.notifications || []).map(
          (n: {
            _id?: string;
            id?: string;
            title: string;
            message: string;
            type: string;
            link?: string;
            read?: boolean;
            isRead?: boolean;
            createdAt: string;
            metadata?: Record<string, unknown>;
          }) => ({
          _id: n._id || n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          link: n.link,
          read: Boolean(n.read ?? n.isRead),
          createdAt: n.createdAt,
          metadata: n.metadata,
        }));
        setNotifications(mapped);
        setUnreadCount(Number(data.unreadCount) || 0);
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
    if (!id) return;
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notificationId: id }),
      });
    } catch {
      // Network error
    }
  }, []);

  // Mark all notifications read
  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update: instantly clear all unread dots and count
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, markAllAsRead: true }),
      });
      if (!res.ok) {
        fetchNotifications();
      }
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Setup SSE stream and fetch initial notifications
  useEffect(() => {

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

      function handleNotificationPayload(raw: unknown) {
        if (!raw || typeof raw !== "object") return;
        const record = raw as Record<string, unknown>;
        const n = (record.notification && typeof record.notification === "object"
          ? record.notification
          : record) as Record<string, unknown>;
        const idVal = n._id ? String(n._id) : n.id ? String(n.id) : String(Date.now());
        const titleVal = String(n.title);
        const messageVal = n.message ? String(n.message) : "";
        const typeVal = typeof n.type === "string" ? n.type : "system";
        const linkVal = typeof n.link === "string" ? n.link : undefined;
        const metaVal = n.metadata && typeof n.metadata === "object" ? (n.metadata as Record<string, unknown>) : undefined;

        const newNotif: AppNotification = {
          _id: idVal,
          title: titleVal,
          message: messageVal,
          type: typeVal,
          link: linkVal,
          read: false,
          createdAt: n.createdAt ? String(n.createdAt) : new Date().toISOString(),
          metadata: metaVal,
        };

        setNotifications((prev) => {
          if (prev.some((existing) => existing._id === newNotif._id)) return prev;
          return [newNotif, ...prev];
        });
        setUnreadCount((c) => c + 1);

        playChime();
        triggerDesktopNotification({
          title: newNotif.title,
          message: newNotif.message,
          link: newNotif.link,
        });
      }

      es.onmessage = (event) => {
        try {
          if (!event.data || event.data === "keep-alive") return;
          const data = JSON.parse(event.data);
          if (data.type === "connected" || data === "connected") {
            setIsConnected(true);
            return;
          }
          handleNotificationPayload(data);
        } catch {
          // Parse error or non-json message
        }
      };

      es.addEventListener("notification", (event: MessageEvent) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);
          handleNotificationPayload(data);
        } catch {
          // Parse error
        }
      });

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

# RMAX Solutions — Quote Booking & Notification Reliability Audit

**Generated:** October 28, 2026  
**Auditor / Engineering Lead:** Antigravity Engineering System  
**Repository:** `r:\RMAX2`  

---

## 1. Quote Booking End-to-End Pipeline

The quote booking subsystem connects public interest directly with sales managers and executive dashboards.

```text
Customer Submission
  │  (Payload: Institution, Contact Name, Email, Phone, Preferred Model, Quantity, Location)
  ▼
Client Validation (Zod Schema in /institutional-quote)
  │
  ▼
POST /api/quote-requests
  ├── Atomic sequence generation: Counter ("QUO-2026-XXXX", "LEAD-2026-XXXX")
  ├── Persist QuoteRequest document in MongoDB
  ├── Persist Lead document in MongoDB with initial status: "new"
  └── Trigger publishNotification()
        ├── Write Notification document to MongoDB
        └── Broadcast event via NotificationStream (Server-Sent Events)
              │
              ├── Super Admin Dashboard receives instant SSE push
              └── Manager Portal receives instant SSE push
                    ├── Audio Chime synthesized via Web Audio API
                    ├── Browser Desktop Notification displayed (if granted)
                    └── Unread badge count increments without page refresh
```

---

## 2. Notification Reliability & SSE Architecture

### Server-Sent Events (`src/app/api/notifications/stream/route.ts`)
- Persistent HTTP connection streaming `text/event-stream`.
- Periodically emits keep-alive comments (`: keep-alive\n\n`) every 25 seconds to prevent cloud proxies, reverse proxies, or Cloudflare from terminating idle sockets.
- Decoupled from database writes: even if an SSE delivery fails (e.g. client temporarily offline), the notification is permanently stored in the `Notification` collection.

### Client-Side Engine (`src/hooks/useDesktopNotifications.ts`)
- Initial bootstrap: Executes a GET request to `/api/notifications` to fetch persistent notification history on page mount.
- Real-time connection: Connects to `/api/notifications/stream` for immediate updates.
- Audio Synthesis: Uses HTML5 Audio / Web Audio API to play an alert chime when a new quotation or lead arrives.
- Desktop Notifications: Requests `Notification.requestPermission()`. If granted, displays native OS desktop popups linking directly to the quote or lead details.

---

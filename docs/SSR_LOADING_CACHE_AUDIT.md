# RMAX Solutions — SSR, Rendering, Hydration & Loading Audit

**Generated:** October 28, 2026  
**Auditor / Engineering Lead:** Antigravity Engineering System  
**Repository:** `r:\RMAX2`  

---

## 1. Next.js 16 Rendering & Prerendering Architecture

The project leverages Next.js 16.4.2 Partial Prerendering (PPR) alongside Cache Components:

```text
Next.js 16 Build Output Distribution (79 Routes)
├── Static Pages (○): 5 routes (robots.txt, sitemap.xml, /api/products, icon/apple-icon)
├── Partial Prerendered Pages (◐): 47 routes (Public showcase, product detail, account shells)
└── Dynamic On-Demand Routes (ƒ): 27 routes (Staff dashboards, mutations, SSE stream)
```

---

## 2. Hydration & Skeleton Loading States

### Layout Shift Prevention
- Skeletons are rendered during suspense fallback states with exact geometric dimensions corresponding to loaded content cards, avoiding layout shifts (CLS < 0.02).
- Dynamic product galleries reserve aspect ratios (`aspect-video`, `aspect-square`) before image assets resolve.

### Cache Invalidation & Mutations
- Administrative mutations (`/api/admin/products`, `/api/admin/leads`, `/api/admin/quotations`) trigger `revalidatePath()` or `revalidateTag()`, ensuring public pages and manager lists refresh their data caches without stale reads.

---

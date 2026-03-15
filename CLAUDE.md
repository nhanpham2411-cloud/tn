# BredarStudio Templates — Project Context

## Overview
Premium SaaS UI templates (Figma + React) sold on UI8/Gumroad. Built on SprouX Design System.

## Key Directories
```
tn/
├── .claude/commands/       ← Skills (slash commands)
├── _pipeline/              ← Process docs & templates
│   ├── process.md          ← Master 11-phase pipeline
│   └── templates/          ← 5 phase templates
├── _bmad/                  ← BMAD agent framework
├── products/               ← One folder per product
│   └── 001-analytics-dashboard/
│       ├── STATUS.md       ← Current phase & progress
│       ├── saas-app/       ← React app (Phase 5)
│       └── figma-specs/    ← JSON specs for Figma plugin (Phase 7)
├── plugins/                ← Figma plugins: Generate SaaS Template + HTML to Figma
├── tools/                  ← DOM extraction pipeline (figma-extractor)
└── common-mistakes.md      ← 96 lessons, read before every session
```

## Pipeline (11 phases)
```
1. Research → 2. Spec → 3. Art Direction → 4. Design System → 5. Build App
→ 6. Review → 6.5. Test → 7. Figma Gen → 8. Polish → 9. Package → 10. Publish → 11. Post-launch
```

## Products

| # | Product | Phase | Status |
|---|---------|-------|--------|
| 001 | ShopPulse — E-commerce Analytics Dashboard | 7. Figma Gen | 🔄 In Progress |

## Product 001 — ShopPulse Quick Facts
- **Style**: Dark-first, violet accent (#7C3AED), glassmorphism + bento
- **Fonts**: Plus Jakarta Sans + Inter + JetBrains Mono
- **Typography prefix**: `sp-*` (e.g. `sp-body-semibold`) — NEVER `text-*` or `typo-*`
- **Price**: $79 Figma / $149 Figma + React
- **React app**: `products/001-analytics-dashboard/saas-app/` (React 19, TS, Tailwind v4, Vite)
- **Build status**: Phase 5 complete (17 pages, 22+ states), Phase 6 review done (91% test score)
- **Figma status**: Foundation done (variables, text styles, effects), Design System page done (38 components), Component JSONs done (43 files), Foundation docs done (7 files) — Next: screen/page generation (Type 8)

## Tech Stack (React App)
- React 19, TypeScript 5.9, Tailwind v4, Vite 7
- Recharts (charts), react-router-dom (routing), sonner (toasts)
- SprouX DS forked: 47 UI components in `src/components/ui/`
- Dark mode: `.dark` class on `<html>`, default dark, localStorage persisted
- FOUC prevention: inline `<script>` in `index.html`
- `PageTransition` wraps `<Outlet />` in both layouts (NOT `<Routes>`)
- `<Toaster />` mounted at root in `main.tsx`

## Critical Rules
1. **SprouX Independence**: Each product forks SprouX — NEVER modify the source SprouX repo
2. **Typography**: Use product prefix (`sp-*`) — `text-*` gets stripped by tailwind-merge
3. **⛔ 100% Foundation Token Binding (ABSOLUTE)**: MỌI visual property (color, spacing, radius, typography, effect) PHẢI 100% bind từ foundation tokens — web React, Figma JSON, plugin output. TUYỆT ĐỐI KHÔNG: raw hex/rgb, Tailwind color scale names (violet-*, zinc-*, amber-*), hardcoded pixel (`gap-[12px]`), manual font override. Foundation = SINGLE SOURCE OF TRUTH. Nếu cần token chưa có → TẠO MỚI trong foundation TRƯỚC. No `opacity-*` to dim individual element colors — use semantic token (`text-muted-foreground`) or `color-mix()`. Exception: `disabled:opacity-50` (whole component), `opacity-0/100` (visibility toggle), installation code blocks (cosmetic hardcoded). (common-mistake #177)
4. **DS components only**: `<Button>` not `<button>`, `<Input>` not `<input>`
5. **Management pages**: Must have loading skeleton, offline banner, bulk select, empty state, save guard
6. **Read `common-mistakes.md`** before touching React app code
7. **Component docs**: ALWAYS read `_refs/component-docs-pattern.md` before adjusting any component in the design system page
8. **Image/asset consistency**: All images (product, avatar, icon) must use the SAME source across web app, DS page, and Figma JSON. Product=`cdn.dummyjson.com`, Avatar=`i.pravatar.cc`. No mixing services (common-mistake #181). CORS check: `curl -sI url | grep access-control` — plugin has `fetchWithCorsProxy()` fallback (common-mistake #188)
9. **No raw indicators**: Mọi visual element (dot, badge, label) PHẢI dùng DS component — `<BadgeDot>` not raw `<div>`, Badge instance not raw frame. JSON mirror web 1:1 (common-mistake #186-187)
10. **Group instance imageOverrides**: Item trong group parent (Item List, Table) có custom image PHẢI có explicit `overrides.imageOverrides` — không dựa vào component base `imageUrl` (common-mistake #190)
11. **⛔ Plugin upsert KHÔNG BAO GIỜ xóa children**: Upsert variant giữ nguyên children — `_processChildren` tìm by name → update in-place. Xóa children = phá hủy TẤT CẢ instances của component trong toàn file. KHÔNG BAO GIỜ thêm code `comp.children[i].remove()` trong upsert path (common-mistake #192)

## Skills (slash commands)
| Command | Role |
|---------|------|
| `/commands` | BredarStudio Template Pipeline (Nhan) |
| `/business-analyst` | Business Analyst |
| `/software-architect` | Software Architect |
| `/developer` | Developer |
| `/product-manager` | Product Manager |
| `/scrum-master` | Scrum Master |
| `/technical-engineering-advisor` | Technical Engineering Advisor |
| `/solo-dev-quick-flow` | Solo Developer Quick Flow |

## References
All general reference files are in `_refs/`:
- `_refs/process.md` — full 11-phase pipeline detail
- `_refs/common-mistakes.md` — 96 recurring mistakes to avoid
- `_refs/component-docs-pattern.md` — 10-section standard for Figma component docs
- `_refs/plugin-json-pattern.md` — 8-type pattern doc for Figma plugin JSON specs (variables, text styles, effects, icons, components, showcase, foundation docs)

Product-specific (per product in `products/{NNN}/`):
- `STATUS.md` — current phase & progress
- `art-direction.md` — visual specs (colors, typography, effects)
- `design-system.md` — DS token docs

## Compact Instructions

When compacting context, prioritize keeping:
- Code changes made in this session (file paths + what changed)
- Errors encountered and how they were fixed
- Current task state (what's done, what's pending)
- Key decisions made

Drop from context:
- Full file reads that haven't been edited
- Verbose command output (keep only errors/key results)
- Repeated tool call results for the same file

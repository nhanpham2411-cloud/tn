# BredarStudio Templates

Premium SaaS UI templates built with [SprouX Design System](https://sprou-x.vercel.app/).

## Pipeline

Full A-to-Z process: [_pipeline/process.md](_pipeline/process.md)

```
Research → Spec → Build App → Review → Figma Gen → Polish → Package → Publish → Post-launch
```

## Products

| # | Product | Phase | Status | React App | Marketplace |
|---|---------|-------|--------|-----------|-------------|
| 001 | Analytics Dashboard (ShopPulse) | 7 — Figma Gen | 🔄 In Progress | [sproux-saas-templates](https://github.com/thanhnhan-evol/sproux-saas-templates) | — |

## Quick Start

Use the Claude Code skill:

```
/bredar-templates new {product-name}    # Start new product
/bredar-templates research {product}     # Run market research
/bredar-templates spec {product}         # Write product spec
/bredar-templates build {product}        # Build React app
/bredar-templates review {product}       # Review & iterate
/bredar-templates quality {product}      # Run quality checklist
/bredar-templates listing {product}      # Prepare marketplace listing
/bredar-templates status                 # Show all products status
/bredar-templates list                   # List all products
```

## Tech Stack

- **Design System**: SprouX (47 components, 1000+ tokens)
- **React Apps**: React 19, TypeScript 5.9, Tailwind v4, Vite 7
- **Charts**: Recharts
- **Figma Plugin**: Generate SaaS Template (auto-generate from JSON specs)

## Shared References

| File | Purpose |
|------|---------|
| [common-mistakes.md](common-mistakes.md) | Training reference — 33 lessons to avoid repeated mistakes |
| [_pipeline/process.md](_pipeline/process.md) | Full A-to-Z production process |
| [_pipeline/templates/quality-checklist.md](_pipeline/templates/quality-checklist.md) | Quality checklist template |

Per-product references:
| File | Purpose |
|------|---------|
| `component-docs-pattern.md` | 10-section pattern for component documentation |
| `STATUS.md` | Current phase & deliverables tracker |

## Directory Structure

```
BredarStudio_Templates/
├── _pipeline/              ← Process + templates
│   ├── process.md
│   ├── competitor-analysis/
│   └── templates/
├── common-mistakes.md      ← Shared training reference (mistakes & fixes)
├── plugins/                ← Figma plugins
│   └── Generate SaaS Template/
├── products/               ← One folder per product
│   └── 001-analytics-dashboard/
│       ├── component-docs-pattern.md  ← Component docs standard
│       ├── figma-specs/               ← JSON specs for Figma plugin
│       └── STATUS.md
└── README.md
```

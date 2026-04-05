# ai-pipelines

A collection of interactive demos exploring AI-powered workflows for design and development.

## Pipelines

### [`ui-design-pipeline`](./ui-design-pipeline)

An end-to-end demo of a design system pipeline driven by AI:

```
Figma Layout → AI Audit → Tokens JSON → Tailwind Config → React Components
```

Each step is interactive — click any stage in the flow bar to see what the AI does at that point. Tabs expose the full output: audit results with WCAG contrast checks, extracted semantic tokens (colors, typography, spacing), generated `tailwind.config.ts`, and a typed `Button.tsx` component.

**Stack:** React 19 + Vite 8

## Running locally

```bash
cd ui-design-pipeline
npm install
npm run dev
```

## Adding a new pipeline

Each pipeline lives in its own folder at the root. No shared dependencies — each is a self-contained project.

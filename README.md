# Ledger HUD Graphic Generator

A Next.js + TypeScript playground for converting abstract prompts into dystopian, HUD-style presentation graphics (SVG/PNG). The AI layer is mocked and isolated so you can later plug in your own vector/image generation API.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to use the interface. The UI is fully client-side and calls the `/api/generate` endpoint to mock generation.

## Where to plug in real AI

- Core payload builder: `src/lib/generator.ts` (`buildAIPayload`). It composes the user prompt, selected color, and fixed style directives for a dystopian/HUD look.
- Mock generation: `src/lib/generator.ts` (`mockGenerateGraphic`). Swap this for your real API call, or wrap the API response to match the `GeneratedGraphic` type from `src/types.ts`.
- API surface: `src/app/api/generate/route.ts`. Replace the mock call with your model invocation (keep the contract `{ graphic, payload }`). Use `process.env.GRAPHICS_MODEL_API_KEY` for credentials.

## UI/UX notes

- Tech/grotesk font pairing with HUD chrome, subtle grids, and glow accents.
- Primary accent comes from the color picker and is threaded through the SVG output.
- Gallery keeps the current session’s renders for easy recall.
- SVG downloads are raw; PNG downloads render the SVG to a transparent canvas on the client.

## Libraries

- [Next.js 16](https://nextjs.org/) with the App Router.
- [React 19](https://react.dev/) + TypeScript.
- [Tailwind CSS v4](https://tailwindcss.com/) for styling.
- No external UI or color-picker packages—native elements only for easier theming.

## Project structure

- `src/app/page.tsx` – Main HUD UI and client-side interactions.
- `src/app/api/generate/route.ts` – API endpoint that prepares the payload and returns mocked graphics.
- `src/lib/generator.ts` – Prompt payload helper and deterministic mock archetypes (network/timeline/funnel/abstract).
- `src/types.ts` – Shared TypeScript contracts used across the app.
- `src/app/globals.css` – Tailwind entrypoint + global HUD theming.

## Production considerations

- Wire your model inside the API route and keep the shape of `GeneratedGraphic` stable for the frontend.
- Add caching or persistence if you want the gallery to survive reloads.
- Tailor fonts/colors in `layout.tsx` and `globals.css` to match your brand system.

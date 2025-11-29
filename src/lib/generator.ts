import { AIPayload, GeneratedGraphic } from "@/types";

const STYLE_DIRECTIVE =
  "dystopian, minimal, HUD-like, generous negative space, thin luminous lines, subtle motion, presentation-ready overlay";

export function buildAIPayload(prompt: string, color: string): AIPayload {
  return {
    prompt,
    color,
    styleDirectives: [STYLE_DIRECTIVE],
    mood: "precise, cinematic, systems-oriented, ledger-inspired",
    targetFormat: "svg",
  };
}

function baseSVGWrapper(content: string, color: string, title: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="${title}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.35" />
      <stop offset="70%" stop-color="${color}" stop-opacity="0.05" />
      <stop offset="100%" stop-color="${color}" stop-opacity="0" />
    </radialGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="1200" height="720" fill="none" />
  <g fill="url(#glow)" opacity="0.65">
    <rect x="120" y="80" width="960" height="560" rx="24" />
  </g>
  <g stroke="${color}" stroke-width="1" opacity="0.4">
    <path d="M160 120 H1040" />
    <path d="M160 600 H1040" />
    <path d="M180 140 V580" />
    <path d="M1020 140 V580" />
  </g>
  ${content}
</svg>`;
}

function generateNetwork(prompt: string, color: string): GeneratedGraphic {
  const nodes = Array.from({ length: 11 }).map((_, i) => {
    const angle = (i / 11) * Math.PI * 2;
    const radius = 200 + 80 * Math.sin(i * 0.7);
    const cx = 600 + Math.cos(angle) * radius;
    const cy = 360 + Math.sin(angle) * radius * 0.7;
    const size = 8 + (i % 4);
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${size}" fill="${color}" fill-opacity="0.6" stroke="${color}" stroke-opacity="0.8" stroke-width="1.2" />`;
  });

  const links: string[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const next = (i + 3) % nodes.length;
    const control = (i + 6) % nodes.length;
    links.push(`<path d="M${getCoord(i).cx},${getCoord(i).cy} Q${getCoord(control).cx},${getCoord(control).cy} ${getCoord(next).cx},${getCoord(next).cy}" stroke="${color}" stroke-width="1.25" stroke-opacity="0.55" fill="none" />`);
  }

  function getCoord(i: number) {
    const angle = (i / 11) * Math.PI * 2;
    const radius = 200 + 80 * Math.sin(i * 0.7);
    const cx = 600 + Math.cos(angle) * radius;
    const cy = 360 + Math.sin(angle) * radius * 0.7;
    return { cx: cx.toFixed(1), cy: cy.toFixed(1) };
  }

  const content = `
    <g filter="url(#softGlow)">
      ${links.join("\n")}
      ${nodes.join("\n")}
    </g>
    <text x="160" y="160" fill="${color}" font-family="'Share Tech Mono', 'DM Mono', monospace" font-size="16" letter-spacing="2">NETWORK FIELD</text>
    <text x="160" y="188" fill="${color}" opacity="0.7" font-family="'Inter', 'Space Grotesk', sans-serif" font-size="14">${prompt.slice(0, 48)}...</text>
  `;

  return {
    svg: baseSVGWrapper(content, color, "Network schematic"),
    title: "Network schematic",
    tags: ["network", "graph", "interconnected"],
    styleDescription: "Layered orbital network with glowing links and clustered nodes",
    color,
    prompt,
    createdAt: Date.now(),
  };
}

function generateTimeline(prompt: string, color: string): GeneratedGraphic {
  const steps = ["T0", "T1", "T2", "T3", "T4"];
  const stepEls = steps
    .map((label, index) => {
      const x = 220 + index * 190;
      return `<g>
        <circle cx="${x}" cy="360" r="32" fill="none" stroke="${color}" stroke-width="1.8" />
        <circle cx="${x}" cy="360" r="6" fill="${color}" />
        <text x="${x}" y="360" fill="#0f0f0f" font-family="'Space Grotesk', 'Inter', sans-serif" font-size="14" font-weight="600" text-anchor="middle" dy="5">${index + 1}</text>
        <text x="${x}" y="410" fill="${color}" opacity="0.75" font-family="'Share Tech Mono', monospace" font-size="13" text-anchor="middle">${label}</text>
      </g>`;
    })
    .join("\n");

  const connectors = steps
    .slice(0, -1)
    .map((_, index) => {
      const x = 220 + index * 190 + 32;
      return `<path d="M${x} 360 L${x + 126} 360" stroke="${color}" stroke-width="1.2" stroke-dasharray="6 6" />`;
    })
    .join("\n");

  const content = `
    <g filter="url(#softGlow)">
      <path d="M180 360 H1020" stroke="${color}" stroke-width="0.8" stroke-opacity="0.45" />
      ${connectors}
      ${stepEls}
    </g>
    <text x="160" y="160" fill="${color}" font-family="'Share Tech Mono', 'DM Mono', monospace" font-size="16" letter-spacing="2">TIMELINE / PROGRESSION</text>
    <text x="160" y="188" fill="${color}" opacity="0.7" font-family="'Inter', 'Space Grotesk', sans-serif" font-size="14">${prompt.slice(0, 48)}...</text>
  `;

  return {
    svg: baseSVGWrapper(content, color, "Timeline progression"),
    title: "Timeline progression",
    tags: ["timeline", "steps", "sequence"],
    styleDescription: "Linear HUD track with milestone beacons and dotted connective tissue",
    color,
    prompt,
    createdAt: Date.now(),
  };
}

function generateFunnel(prompt: string, color: string): GeneratedGraphic {
  const content = `
    <g filter="url(#softGlow)">
      <path d="M380 220 L820 220 L660 520 L540 520 Z" fill="none" stroke="${color}" stroke-width="1.6" />
      <path d="M420 260 L780 260 L640 480 L580 480 Z" fill="${color}" fill-opacity="0.06" stroke="${color}" stroke-width="1.1" />
      <path d="M460 300 L740 300 L630 440 L610 440 Z" fill="${color}" fill-opacity="0.08" />
      <circle cx="600" cy="360" r="12" fill="${color}" />
      <circle cx="600" cy="360" r="38" stroke="${color}" stroke-dasharray="10 8" fill="none" />
      <path d="M600 360 L600 520" stroke="${color}" stroke-width="1.2" stroke-dasharray="4 6" />
    </g>
    <text x="160" y="160" fill="${color}" font-family="'Share Tech Mono', 'DM Mono', monospace" font-size="16" letter-spacing="2">FLOW / FUNNEL</text>
    <text x="160" y="188" fill="${color}" opacity="0.7" font-family="'Inter', 'Space Grotesk', sans-serif" font-size="14">${prompt.slice(0, 48)}...</text>
  `;

  return {
    svg: baseSVGWrapper(content, color, "Signal funnel"),
    title: "Signal funnel",
    tags: ["funnel", "flow", "conversion"],
    styleDescription: "Layered funnel geometry with concentric resonance and venting trail",
    color,
    prompt,
    createdAt: Date.now(),
  };
}

function generateAbstract(prompt: string, color: string): GeneratedGraphic {
  const rings = Array.from({ length: 5 }).map((_, i) => {
    const radius = 70 + i * 40;
    return `<circle cx="600" cy="360" r="${radius}" stroke="${color}" stroke-width="${1 + i * 0.4}" stroke-opacity="${0.8 - i * 0.12}" fill="none" />`;
  });

  const triangles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 8;
    const inner = 210;
    const outer = 310;
    const x1 = 600 + Math.cos(angle) * inner;
    const y1 = 360 + Math.sin(angle) * inner;
    const x2 = 600 + Math.cos(angle + 0.16) * outer;
    const y2 = 360 + Math.sin(angle + 0.16) * outer;
    const x3 = 600 + Math.cos(angle - 0.16) * outer;
    const y3 = 360 + Math.sin(angle - 0.16) * outer;
    return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} Z" fill="${color}" fill-opacity="0.08" stroke="${color}" stroke-width="0.9" />`;
  });

  const content = `
    <g filter="url(#softGlow)">
      ${rings.join("\n")}
      ${triangles.join("\n")}
      <circle cx="600" cy="360" r="14" fill="${color}" />
      <circle cx="600" cy="360" r="48" stroke="${color}" stroke-dasharray="6 10" fill="none" />
    </g>
    <text x="160" y="160" fill="${color}" font-family="'Share Tech Mono', 'DM Mono', monospace" font-size="16" letter-spacing="2">ABSTRACT VECTOR CORE</text>
    <text x="160" y="188" fill="${color}" opacity="0.7" font-family="'Inter', 'Space Grotesk', sans-serif" font-size="14">${prompt.slice(0, 48)}...</text>
  `;

  return {
    svg: baseSVGWrapper(content, color, "Abstract signal"),
    title: "Abstract signal",
    tags: ["abstract", "geometric", "oscillation"],
    styleDescription: "Radial interference pattern with layered vector shards",
    color,
    prompt,
    createdAt: Date.now(),
  };
}

export function mockGenerateGraphic(prompt: string, color: string): GeneratedGraphic {
  const lower = prompt.toLowerCase();
  if (/network|graph|mesh|grid|interconnect/.test(lower)) {
    return generateNetwork(prompt, color);
  }
  if (/timeline|roadmap|progress|phase/.test(lower)) {
    return generateTimeline(prompt, color);
  }
  if (/funnel|flow|pipeline|stream/.test(lower)) {
    return generateFunnel(prompt, color);
  }
  return generateAbstract(prompt, color);
}

import type {CardGridProps} from './types';

// Sample A: fitted to the reference clip (BV1hp4y1f7B5_03) — geometry by automatic mask fitting
// (scripts/fit), camera path measured against the reference by frame-to-frame registration
// (v9, smooth camera with stop keys, ease-out opening), card timings auto-fitted then hand-checked against reference frames. Icons are self-drawn; none is a real flag.
export const sampleA: CardGridProps = {
  "durationInFrames": 273,
  "palette": {
    "background": "#f9f9f9",
    "dots": "rgba(60,60,90,0.08)",
    "panel": "#f4f4f4",
    "face": "#ffffff",
    "border": "#4b4599",
    "sideDark": "#4b4599",
    "sideLight": "#554fa6",
    "text": "#3c3a7a",
    "shadow": "rgba(40,30,90,0.22)"
  },
  "card": {
    "width": 212,
    "height": 160,
    "thickness": 18,
    "gapX": 54,
    "gapY": 50,
    "radius": 5,
    "border": 2,
    "inset": 0.12
  },
  "text": {
    "titleSize": 0.34,
    "subtitleSize": 0.2,
    "titleTracking": 0.375,
    "subtitleTracking": 0.24,
    "weight": 700
  },
  "flyShadow": false,
  "panel": {
    "keys": [
      {
        "frame": 0,
        "width": 494,
        "top": 66
      },
      {
        "frame": 4,
        "width": 587,
        "top": 51
      },
      {
        "frame": 8,
        "width": 648,
        "top": 51
      },
      {
        "frame": 16,
        "width": 690,
        "top": 51
      }
    ],
    "bottom": 420
  },
  "tilt": {
    "start": 11,
    "end": 24,
    "rotateX": 58,
    "rotateZ": -39.75,
    "perspective": 1262.5
  },
  "camera": [
    {
      "frame": 0,
      "x": 434,
      "y": 145,
      "zoom": 1.18
    },
    {
      "frame": 12,
      "x": 426,
      "y": 222,
      "zoom": 1.16,
      "stop": true,
      "easing": [
        0.2,
        0.8,
        0.2,
        1
      ]
    },
    {
      "frame": 24,
      "x": 435,
      "y": 244,
      "zoom": 1.14,
      "stop": true
    },
    {
      "frame": 28,
      "x": 435,
      "y": 244,
      "zoom": 1.14
    },
    {
      "frame": 56,
      "x": 391,
      "y": 210,
      "zoom": 1.1
    },
    {
      "frame": 88,
      "x": 298,
      "y": 156,
      "zoom": 1.01
    },
    {
      "frame": 108,
      "x": 268,
      "y": 137,
      "zoom": 0.955
    },
    {
      "frame": 172,
      "x": 267,
      "y": 138,
      "zoom": 0.95
    },
    {
      "frame": 272,
      "x": 267,
      "y": 136,
      "zoom": 0.97
    }
  ],
  "cards": [
    {
      "id": "hero",
      "row": 0,
      "col": 1,
      "hero": true,
      "icon": {
        "kind": "sun-corner",
        "colors": [
          "#e3262e",
          "#ffd23f"
        ]
      }
    },
    {
      "id": "b",
      "row": 1,
      "col": 0,
      "icon": {
        "kind": "diagonal",
        "colors": [
          "#2a4bb8",
          "#1f3d9c",
          "#e3262e"
        ]
      },
      "enter": {
        "at": 28,
        "dur": 26,
        "from": [
          1.8,
          -2
        ],
        "lift": 260
      }
    },
    {
      "id": "c",
      "row": 0,
      "col": 0,
      "icon": {
        "kind": "stripes-diag",
        "colors": [
          "#202020",
          "#e3262e",
          "#ffcc00"
        ]
      },
      "enter": {
        "at": 58,
        "dur": 12,
        "from": [
          -1.3,
          0
        ]
      }
    },
    {
      "id": "d",
      "row": 2,
      "col": 0,
      "icon": {
        "kind": "stripes-diag",
        "colors": [
          "#ff9933",
          "#ffffff",
          "#1fa64a"
        ]
      },
      "enter": {
        "at": 57,
        "dur": 17,
        "from": [
          1.2,
          -2.1
        ],
        "lift": 300
      }
    },
    {
      "id": "e",
      "row": 1,
      "col": 1,
      "icon": {
        "kind": "bars",
        "colors": [
          "#e3262e",
          "#ffffff"
        ]
      },
      "enter": {
        "at": 60,
        "dur": 13,
        "from": [
          1.2,
          -1.5
        ],
        "lift": 80
      },
      "iconReveal": [
        66,
        96
      ],
      "iconRevealMode": "corner"
    },
    {
      "id": "f",
      "row": 0,
      "col": 2,
      "icon": {
        "kind": "quad",
        "colors": [
          "#ffffff",
          "#e3262e",
          "#e3262e"
        ]
      },
      "enter": {
        "at": 98,
        "dur": 14,
        "from": [
          2.2,
          -1.6
        ]
      }
    },
    {
      "id": "g",
      "row": 1,
      "col": 2,
      "icon": {
        "kind": "dots",
        "colors": [
          "#132f7a",
          "#ffffff"
        ]
      },
      "enter": {
        "at": 115,
        "dur": 24,
        "from": [
          1.5,
          -1.5
        ]
      }
    },
    {
      "id": "h",
      "row": 2,
      "col": 2,
      "icon": {
        "kind": "wedge",
        "colors": [
          "#ffffff",
          "#1f48d1"
        ]
      },
      "enter": {
        "at": 144,
        "dur": 19,
        "from": [
          1.4,
          -0.7
        ]
      }
    },
    {
      "id": "focus",
      "row": 2,
      "col": 1,
      "title": "AV1",
      "subtitle": "10 BIT",
      "enter": {
        "at": 168,
        "dur": 28,
        "from": [
          2.2,
          -1.9
        ],
        "lift": 50
      },
      "subtitleReveal": [
        240,
        246
      ]
    }
  ],
  "cameraPath": "smooth"
};

// Sample B: same component, only data changed — 4x3 grid, other colours, other text,
// different focus slot and entry order. Camera keys were re-framed by hand.
export const sampleB: CardGridProps = {
  ...sampleA,
  cameraPath: 'eased',
  flyShadow: true,
  palette: {
    background: '#f5f8f8',
    dots: 'rgba(20,70,70,0.10)',
    panel: '#ecf2f2',
    face: '#ffffff',
    border: '#0f5c5c',
    sideDark: '#127070',
    sideLight: '#1a8585',
    text: '#0f4f4f',
    shadow: 'rgba(10,60,60,0.22)',
  },
  camera: [
    {frame: 0, x: 426, y: 150, zoom: 1.08},
    {frame: 12, x: 426, y: 222, zoom: 1.08},
    {frame: 24, x: 435, y: 240, zoom: 1.2},
    {frame: 30, x: 435, y: 240, zoom: 1.2},
    {frame: 124, x: 215, y: 215, zoom: 0.9},
    {frame: 272, x: 207, y: 210, zoom: 0.89},
  ],
  cards: [
    {id: 'hero', row: 0, col: 1, hero: true, icon: {kind: 'disc', colors: ['#14b8a6', '#ffffff']}},
    {id: 'a', row: 1, col: 1, icon: {kind: 'chevron', colors: ['#f59e0b', '#1f2937']}, enter: {at: 33, dur: 24, from: [1.6, -2.6], lift: 240}},
    {id: 'b', row: 0, col: 0, icon: {kind: 'bands-v', colors: ['#0ea5e9', '#ffffff', '#0369a1']}, enter: {at: 52, dur: 12, from: [-1.3, 0]}},
    {id: 'c', row: 1, col: 0, icon: {kind: 'quad', colors: ['#e5e7eb', '#8b5cf6', '#22c55e']}, enter: {at: 60, dur: 15, from: [1.6, -3.0], lift: 240}},
    {id: 'd', row: 0, col: 2, icon: {kind: 'plus', colors: ['#ef4444', '#fde68a']}, enter: {at: 70, dur: 12, from: [0.4, -1.3]}, iconReveal: [82, 104]},
    {id: 'e', row: 2, col: 0, icon: {kind: 'diagonal', colors: ['#111827', '#fde047', '#111827']}, enter: {at: 84, dur: 14, from: [-1.2, 0.4]}},
    {id: 'f', row: 0, col: 3, icon: {kind: 'wedge', colors: ['#fef3c7', '#d97706']}, enter: {at: 100, dur: 17, from: [1.2, -0.8]}},
    {id: 'g', row: 1, col: 3, icon: {kind: 'corner-star', colors: ['#0f766e', '#fde68a']}, enter: {at: 112, dur: 17, from: [1.4, -0.5]}},
    {id: 'h', row: 2, col: 1, icon: {kind: 'bands-h', colors: ['#16a34a', '#bbf7d0', '#14532d']}, enter: {at: 126, dur: 16, from: [0, 1.5]}},
    {id: 'i', row: 2, col: 3, icon: {kind: 'disc', colors: ['#1e3a8a', '#fbbf24']}, enter: {at: 141, dur: 18, from: [1.4, 0.2]}},
    {
      id: 'focus',
      row: 1,
      col: 2,
      title: 'API',
      subtitle: 'V2.0',
      enter: {at: 171, dur: 20, from: [0.9, -2.6], lift: 70},
      subtitleReveal: [240, 246],
    },
  ],
};

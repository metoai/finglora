# Finglora 💅

> **Create your nail moment** — From inspiration on hands to your hands. Customize each individual finger, try them on live or with samples, and share a clean Design Passport with your technician.

---

## 📁 Modular Project Structure

The project has been refactored into a clean, maintainable architecture:

```
Desktop/Finglora/
├── app/
│   ├── globals.css                       # Tailwind CSS base & custom utilities
│   ├── layout.tsx                        # Root HTML & metadata layout
│   └── page.tsx                          # App state & surface orchestration
├── components/
│   ├── common/                           # Shared UI primitives
│   │   ├── BrandLogo.tsx                 # Finglora logo & tagline badge
│   │   ├── ApplyAllModal.tsx             # 5-finger overwrite confirmation dialog
│   │   └── ToastContainer.tsx            # Floating reactive notifications
│   ├── magicui/                          # Free Magic UI animated components
│   │   ├── animated-gradient-text.tsx   # Smooth animated gradient text & badge
│   │   ├── border-beam.tsx               # Traveling border beam light effect
│   │   ├── marquee.tsx                   # Infinite scrolling marquee ticker
│   │   ├── shimmer-button.tsx            # Shimmering interactive CTA button
│   │   └── shine-border.tsx              # Rotating border shine effect
│   ├── visuals/                          # Hand & nail SVG rendering
│   │   ├── NailCanvasPreview.tsx         # Procedural individual SVG nail
│   │   ├── EditorialHandVisual.tsx       # 5-finger hand illustration & geometry
│   │   └── InspirationPhotoCard.tsx      # Photo card with detection pins
│   └── surfaces/                         # Application views
│       ├── LandingSurface.tsx            # Marketing landing page
│       ├── OnboardingSurface.tsx         # 2-step style calibration wizard
│       ├── customer/                     # Customer web app
│       │   ├── CustomerApp.tsx           # Customer layout & route container
│       │   ├── CustomerSidebar.tsx       # Desktop side nav & active set mini-view
│       │   ├── CustomerSignupView.tsx    # Customer registration form
│       │   ├── HomeHubView.tsx           # Home hub & prompt generator
│       │   ├── ExploreGalleryView.tsx    # Inspiration gallery with filters
│       │   ├── UploadInspirationView.tsx # Photo upload & extraction animation
│       │   ├── StudioView.tsx            # 5-finger editor, color palette, swapping
│       │   ├── TryOnView.tsx             # Live camera, photo upload, sample hand
│       │   └── PassportView.tsx          # Design Passport shareable view
│       └── tech/                         # Nail technician portal (/tech)
│           ├── TechApp.tsx               # Tech layout & navigation
│           ├── TechSidebar.tsx           # Technician portal navigation
│           ├── TechSignupView.tsx        # Technician profile & studio setup
│           ├── TechWorkspaceView.tsx     # Client link & WhatsApp photo decoder
│           └── TechGuideView.tsx         # Step-by-step layer formulas & station view
├── constants/
│   └── nail-data.ts                      # Shapes, lengths, finishes, palettes, sample sets
├── types/
│   └── nail.ts                           # Domain TypeScript interfaces & types
└── utils/
    └── tech-formula.ts                   # Nail art layer step & curing algorithm
```

---

## 🚀 Getting Started

Run the development server:

```bash
cd ~/Desktop/Finglora
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **Animated Components**: Magic UI (Free tier: ShimmerButton, BorderBeam, Marquee, AnimatedGradientText, ShineBorder)
- **Transitions & Physics**: Framer Motion & Anime.js
- **Icons**: Lucide React
- **MCP Integration**: Mobbin MCP configured in `.mcp.json`

# Reports Dashboard — Project Guidelines

## Tech Stack
- React 19 + TypeScript + Vite
- Highcharts + highcharts-react-official (charts)
- GSAP + ScrollTrigger (scroll-driven animations)
- Lucide React (icons)
- Plain CSS (no framework — custom glass morphism design system)

## Architecture: Company-Agnostic Reports

The `/reports` page is a **multi-tenant report viewer**. Each report is a self-contained data object. The page renders whatever report data is passed to it. Future: auth gate + company selector.

```
src/pages/
  Reports.tsx          — Main page component (layout, nav, sections)
  Reports.css          — All styles for the reports page
  reports/
    types.ts           — TypeScript interfaces for report data
    jnm-data.ts        — JNM Fermentation report (data + content)
    chart-configs.ts   — Highcharts config generators per analysis type
```

### Data Shape (types.ts)
```ts
interface ReportData {
  company: { name: string; logo?: string }
  title: string
  subtitle: string
  problemStatement: { heading: string; body: string; kpis: KPI[] }
  hypotheses: Hypothesis[]
  recommendations: Recommendation[]
  executiveSummary: { heading: string; bullets: string[] }
}

interface Hypothesis {
  id: string
  title: string
  description: string
  verdict: 'supported' | 'partially' | 'refuted'
  evidence: Evidence[]
}

interface Evidence {
  type: 'chart' | 'table' | 'text'
  title: string
  description: string
  chartConfig?: Highcharts.Options  // for chart type
  tableData?: { headers: string[]; rows: string[][] }  // for table type
}
```

## Design System (from Figma Reference)

### Colors
- **Background**: `#f4f6fa` (light gray-blue)
- **Sidebar**: `#ffffff` with left border
- **Cards**: `rgba(255, 255, 255, 0.7)` with `backdrop-filter: blur(16px)` (glass)
- **Primary accent**: `#1a3a7a` (deep navy blue)
- **Secondary accent**: `#2563eb` (bright blue)
- **Success**: `#16a34a`
- **Alert/Warning**: `#dc2626`
- **Text primary**: `#1e293b`
- **Text secondary**: `#64748b`
- **Border**: `rgba(0, 0, 0, 0.06)`

### Typography
- Font: Inter (already loaded in project)
- Headings: 600 weight, `#1e293b`
- Body: 400 weight, `#475569`
- Labels/badges: 500 weight, uppercase, letter-spacing 0.05em

### Glass Card Pattern
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}
```

### Layout
- Sidebar: 240px fixed left, white, nav items with icons
- Content: fluid right, max-width 1200px, padding 40px
- Navbar top: "Lemnisca x {Company}" left, "Ask AVIRA" button right
- Sections: full-viewport scroll-snap sections
- Hypothesis sections: alternating left-right (text | chart, chart | text)

## Animation Principles (web-animation-design skill)

### Easing
- **Enter/exit**: `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out-quint)
- **On-screen movement**: `cubic-bezier(0.645, 0.045, 0.355, 1)` (ease-in-out-cubic)
- **Hover**: `ease` with 150ms

### Durations
- Micro-interactions: 100-150ms
- Card/section entrances: 200-300ms
- Scroll-triggered reveals: 400-600ms (staggered)

### Scroll-Driven Storytelling
- Each major section fades + slides in via GSAP ScrollTrigger
- Cards stagger in with 100ms delay between siblings
- Charts animate their data on scroll-into-view (Highcharts animation)
- Sidebar active state updates on scroll position

### Reduced Motion
- Every animation gets `@media (prefers-reduced-motion: reduce)` override
- Disable GSAP ScrollTrigger animations for reduced-motion users

### Rules
- Only animate `transform` and `opacity` (GPU-accelerated)
- Use `will-change: transform` on animated elements
- Never animate from `scale(0)` — start from `scale(0.95)`
- Paired elements (card + overlay) share same easing + duration
- `button:active { transform: scale(0.97) }` for click feedback

## Content: Derived Hypotheses (from JNM PPT)

These are the 7 hypotheses derived factually from the analysis deck:

1. **H1**: Volume-corrected biomass reveals true productivity differences between batches
   → Evidence: Analysis 1 (Volume Corrected Biomass)

2. **H2**: Growth phase segmentation and inoculum concentration determine batch performance
   → Evidence: Analysis 2 (Growth Phases) + Analysis 3 (Specific Growth Rate μ)

3. **H3**: Dissolved oxygen above 20% saturation does not limit growth rate
   → Evidence: Analysis 4 (pO₂–μ Cross-Correlation)

4. **H4**: Carbon balance efficiency (Yx/s) predicts overall batch quality
   → Evidence: Analysis 5 (Carbon Balance Envelope)

5. **H5**: Specific glucose feed rate determines Crabtree effect risk and maintenance burden
   → Evidence: Analysis 6 (qs Zones + Maintenance Tax)

6. **H6**: Nutritional supplements and in-situ extraction improve yield and extend viability
   → Evidence: Analysis 7 (Qualitative Supplement Effects) + OD/WCW Ratio

7. **H7**: Oxygen uptake shifts from growth to maintenance in late fermentation phases
   → Evidence: Analysis 8 (OUR Pirt Decomposition + kLa Estimates)

## Chart Strategy

### Multi-batch overlays (single metric)
When a chart shows one metric across all 6 batches (e.g., OD600 vs Time), overlay all 6 as separate series on one chart. Use batch-specific colors.

### Batch color palette
- B01: `#94a3b8` (slate)
- B02: `#a78bfa` (violet)
- B03: `#38bdf8` (sky)
- B04: `#f97316` (orange) — best performer highlight
- B05: `#22c55e` (green)
- B06: `#ec4899` (pink)

### Chart interaction
- Tooltip on hover with batch details
- Click to isolate/highlight a single batch
- Toggle batches on/off via legend

## Navbar
- Left: "lemnisca" logo + " x " + company name
- Right: Collapsible "Ask AVIRA" button (placeholder — no chatbot impl yet)

## Future Considerations (DO NOT implement now)
- Auth login gate on `/reports`
- Company selector / multi-report listing
- "Ask AVIRA" chatbot integration
- PDF export / "Generate Report" button

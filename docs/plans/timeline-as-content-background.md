# Timeline as content background

Implementation plan for README UX **#1**. Prerequisite for UX **#2** (uncertainty spans) and UX **#6** (timeline navigator).

## Goal

Replace the current stacked layout (`Content` above `TimelineZone` in [`Main.svelte`](../../src/lib/components/main/Main.svelte)) with a single content canvas where timeline ticks are a **full-height background grid** and date labels sit on a **reserved bottom band**. Geological periods and events render as foreground layers above the grid; they may cover ticks freely except the label band.

## Chosen design

### Tick lines — full height

Vertical tick lines run from the **top of the content container** down to the **top of the label band** (not to the physical bottom of the canvas). Tall lines act as a year grid behind geological periods and events. Most of each line will be covered by opaque foreground fills — that is expected and acceptable.

### Labels — bottom edge only

Major and minor date labels stay along the **bottom edge**, same mental model as today. Labels live entirely inside the reserved label band.

### Reserved label band — never covered

A fixed-height strip at the bottom of the content container is **off-limits to foreground content**:

- Geological period cards must not extend into it.
- Event cards, markers, and (later) uncertainty spans must not extend into it.
- Empty-state overlays should not obscure labels (or should leave the band clear).

Proposed constant: `TIMELINE_LABEL_BAND_HEIGHT_PX` (~40px) in [`layout.ts`](../../src/lib/constants/layout.ts), tunable after visual check. Must fit major labels (`text-xs`) and minor labels (`text-[10px]`) when minor labels are shown.

### Foreground zones — above the label band

Geological and events zones share only the area **above** the label band:

```text
┌─────────────────────────────────────┐
│  Geological periods (top 50%*)      │  opaque OK — covers ticks
├─────────────────────────────────────┤
│  Events (bottom 50%* of remainder)  │  opaque OK — covers ticks
├─────────────────────────────────────┤
│  LABEL BAND (fixed ~40px)           │  labels + tick bottoms only
│  │    │    2020    │    │           │  foreground must not overlap
└─────────────────────────────────────┘
* Percentages apply to the area above the label band, not the full container.
```

### Z-index (bottom → top)

1. `TimelineZone` background — `pointer-events-none`, lowest z-index
2. Geological period cards
3. Event cards / markers
4. Geological period popover

### Event markers

Triangles/lines may end at the **top of the label band** rather than the container bottom, so they point at the axis without covering date text. Dropping markers entirely is an optional follow-up once bottom ticks are stable.

### Transparency

Not required for v1. Optional later: slight opacity on geological period and event span fills so grid lines show through the middle of the canvas.

## Current layout

```text
┌─────────────────────────────┐
│  Content (periods + events) │
├─────────────────────────────┤
│  TimelineZone (ticks)       │  ← dedicated strip, flex-[1] / flex-[4]
└─────────────────────────────┘
```

## Target layout

```text
┌─────────────────────────────┐
│  [bg] full-height tick grid │
│  [fg] geological periods    │
│  [fg] events                │
│  [bg] label band (reserved) │
└─────────────────────────────┘
        ↓ freed vertical space (flex ratio)
┌─────────────────────────────┐
│  Navigator strip (UX #6)    │  future, below pan-container
└─────────────────────────────┘
```

## Implementation outline

1. **Add `TIMELINE_LABEL_BAND_HEIGHT_PX`** to [`layout.ts`](../../src/lib/constants/layout.ts) and export from [`constants/index.ts`](../../src/lib/constants/index.ts).
2. **Refactor `TimelineZone.svelte`** for background mode:
   - Root: `absolute inset-0`, `pointer-events-none`, no `flex-[1]` / `border-t` (parent supplies bounds).
   - Tick lines: `top: 0` → `bottom: TIMELINE_LABEL_BAND_HEIGHT_PX` (full height above band).
   - Labels: positioned inside the bottom band (major + minor, same rules as today).
3. **Move `TimelineZone` inside `Content.svelte`** as the bottom-most layer.
4. **Pass viewport props from `Main.svelte`** — add `zoomLevel` and `viewportYearSpan` to `Content` (today only `Main` has the full set).
5. **Remove `TimelineZone` from `Main.svelte`**; `Content` becomes sole child of `pan-container` (plus arrows). Change `Content` from `flex-[4]` to `flex-1` so it fills the freed space.
6. **Constrain foreground to area above the label band:**
   - Geological periods zone: `height` = `(contentHeight - TIMELINE_LABEL_BAND_HEIGHT_PX) * GEOLOGICAL_PERIODS_ZONE_HEIGHT_RATIO`, anchored from top.
   - Events: position cards/markers with `bottom >= TIMELINE_LABEL_BAND_HEIGHT_PX` (events zone sits between geological band and label band).
7. **Revisit empty/hidden states** so they do not cover the label band.

## Impact on UX #2

When implementing uncertainty spans, the events zone split is **above the label band**, not the full container height. Update [`geological-periods-and-uncertainty-spans.md`](geological-periods-and-uncertainty-spans.md) zone math accordingly.

## Exit criteria

- `bun run check` and `bun run build` pass
- Pan, zoom, and tick alignment behave identically to today
- Date labels remain visible with geological periods and events at maximum density
- Vertical space previously occupied by `TimelineZone` is reclaimed inside the content flex area (ready for UX #6 navigator below)

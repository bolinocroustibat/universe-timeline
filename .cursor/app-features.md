# Prehistory Timeline App

## Project Overview
An interactive web application for exploring and visualizing prehistory through a zoomable timeline interface. Built with Svelte 5, TypeScript, and Tailwind CSS.

## Core Features

### Timeline Visualization
- **Interactive Timeline**: A horizontal timeline spanning from -1 billion years to present day
- **Zoomable Interface**: Multiple zoom levels from billion-year scale to century scale
- **Dynamic Tick Marks**: Automatically generated time markers based on current zoom level
- **Year Formatting**: Intelligent year display (e.g., "1.2 billion years ago", "500,000 years ago")

### Navigation & Interaction
- **Mouse Dragging**: Click and drag to pan horizontally through time
- **Mouse Wheel**: Scroll to navigate through different time periods
- **Zoom Controls**: 
  - Plus/minus buttons for zoom level adjustment
  - Visual zoom level indicators (dots)
  - Mouse wheel zoom support
- **Responsive Design**: Adapts to different viewport sizes

### Zoom Levels & Scales
The app supports 13 zoom levels with different time spans:
- Level 1: 1 billion years per viewport
- Level 2: 300 million years per viewport
- Level 3: 100 million years per viewport
- ... (continuing to finer scales)
- Level 13: 1,000 years per viewport (century scale)

### Data Structure
- **Time Constants**: Start year (-1 billion), End year (current year)
- **Zoom Scales**: Predefined configurations for each zoom level
- **Timeline Ticks**: Generated dynamically based on current position and zoom
- **Events Data**: JSON-based event storage (planned/implemented)

### UI Components
- **Header**: Fixed top navigation with app title
- **Main Timeline**: Interactive timeline visualization
- **Footer**: Fixed bottom bar with zoom controls and copyright
- **Debug Panel**: Development-only information display (when PUBLIC_DEBUG=true)

### Technical Architecture
- **Svelte 5**: Using modern Svelte 5 syntax ($state, $derived, onclick, etc.)
- **TypeScript**: Strict mode enabled for type safety
- **Tailwind CSS**: Utility-first styling approach
- **SvelteKit**: Full-stack framework with SSR support
- **Responsive Design**: Mobile-first approach with breakpoint support

### State Management
- **Zoom Store**: Centralized zoom level state management
- **Reactive Updates**: Automatic UI updates based on zoom level changes
- **Viewport Tracking**: Real-time viewport width monitoring for responsive calculations

### Development Features
- **Debug Mode**: Optional debug information panel
- **Hot Reload**: Development server with live updates
- **Type Safety**: Full TypeScript integration
- **Cursor Rules**: Project-specific development guidelines

## File Structure
```
src/
├── lib/
│   ├── components/
│   │   ├── Header.svelte          # Top navigation
│   │   ├── Main.svelte            # Timeline visualization
│   │   ├── Footer.svelte          # Bottom bar with zoom controls
│   │   ├── footer/
│   │   │   └── Zoom.svelte        # Zoom control component
│   │   └── main/
│   │       └── DebugInfo.svelte   # Debug information panel
│   ├── stores/
│   │   └── zoomStore.ts           # Zoom level state management
│   ├── constants.ts               # Time constants and zoom scales
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── utils/
│       └── formatters.ts          # Year formatting utilities
├── data/
│   ├── events.json                # Timeline events data
│   └── periods.json               # Historical periods data
└── routes/
    ├── +layout.svelte             # App layout with header/footer
    └── +page.svelte               # Main page content
```

## Development Guidelines
- Use Svelte 5 syntax (onclick, $derived, $state)
- Follow TypeScript strict mode
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Follow the established component structure

## Future Enhancements
- Event markers on timeline
- Period highlighting
- Search functionality
- Filtering options
- Mobile touch gestures
- Accessibility improvements 
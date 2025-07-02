# The Timeline of the Universe App

## Project Overview
An interactive web application for exploring and visualizing the complete history of the universe from the Big Bang to present day through a zoomable timeline interface. Built with Svelte 5, TypeScript, and Tailwind CSS.

## Core Features

### Timeline Visualization
- **Interactive Timeline**: A horizontal timeline spanning from -13.8 billion years to present day
- **Zoomable Interface**: Multiple zoom levels from billion-year scale to century scale
- **Dynamic Tick Marks**: Automatically generated time markers based on current zoom level
- **Year Formatting**: Intelligent year display with French locale support (e.g., "1.2 billion years ago", "500,000 years ago")

### Event System
- **Historical Events**: Interactive event cards displaying historical information
- **Event Positioning**: Events are positioned at their precise time points on the timeline
- **Overlap Detection**: Automatic detection and vertical stacking of overlapping events
- **Event Markers**: Blue vertical lines connecting events to their exact time points
- **Event Data**: JSON-based event storage with French content support

### Navigation & Interaction
- **Mouse Dragging**: Click and drag to pan horizontally through time
- **Mouse Wheel**: Scroll to navigate through different time periods
- **Zoom Controls**: 
  - Plus/minus buttons for zoom level adjustment
  - Visual zoom level indicators (dots)
  - Mouse wheel zoom support
  - Pinch-to-zoom support on trackpads
- **Responsive Design**: Adapts to different viewport sizes

### Zoom Levels & Scales
The app supports 15 zoom levels with different time spans:
- Level 1: 13.8 billion years per viewport (full universe timeline)
- Level 2: 5 billion years per viewport
- Level 3: 1 billion years per viewport
- Level 4: 300 million years per viewport
- Level 5: 100 million years per viewport
- ... (continuing to finer scales)
- Level 15: 1,000 years per viewport (century scale)

### Data Structure
- **Periods**: Geological and cosmological time periods with hierarchical structure
- **Events**: Historical events with precise dates and uncertainty ranges
- **Localization**: French and English content support
- **Uncertainty Handling**: Both periods and events support uncertainty ranges for scientific accuracy

### UI Components
- **Header**: Fixed top navigation with app title
- **Main Timeline**: Interactive timeline visualization with events
- **Events Zone**: Area displaying historical events with overlap handling
- **Timeline Zone**: Time markers and tick display
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
- **Event Positioning**: Dynamic event positioning with overlap detection

### Development Features
- **Debug Mode**: Optional debug information panel with zoom and positioning details
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
│   │       ├── DebugInfo.svelte   # Debug information panel
│   │       ├── EventsZone.svelte  # Event display with overlap handling
│   │       └── TimelineZone.svelte # Timeline ticks and markers
│   ├── stores/
│   │   └── zoomStore.ts           # Zoom level state management
│   ├── constants.ts               # Time constants and zoom scales
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── utils/
│       └── formatters.ts          # Year formatting utilities
├── static/
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
- Use French locale for year formatting
- Implement proper overlap detection for events

## Recent Improvements
- **Event System**: Added interactive event cards with historical data
- **Overlap Detection**: Automatic vertical stacking of overlapping events
- **Precise Alignment**: Blue event markers aligned with timeline ticks
- **Locale Support**: French year formatting throughout the application
- **Enhanced Zoom**: Added pinch-to-zoom support for trackpads
- **Improved Positioning**: Fixed event positioning with proper overlap handling

## Future Enhancements
- Period highlighting
- Search functionality
- Filtering options
- Mobile touch gestures
- Accessibility improvements
- Event categories and filtering
- Export/sharing functionality 
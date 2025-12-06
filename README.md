# Timeline Editor - Standalone

A standalone video timeline editor extracted from Flick. Features a professional video editing interface with clip arrangement, trimming, playback controls, and visual keyframe previews.

![Timeline Editor Screenshot](screenshot.png)

## Features

- ✅ **Multi-clip Timeline** - Arrange videos and images on a timeline
- ✅ **Drag & Drop** - Rearrange clips by dragging
- ✅ **Trim Controls** - Trim clips with left/right handles
- ✅ **Video Playback** - Play/pause with master timeline clock
- ✅ **Zoom Controls** - 5 zoom levels for precise editing
- ✅ **Keyframe Thumbnails** - Visual preview strips showing video frames
- ✅ **Ripple Editing** - See how changes affect subsequent clips
- ✅ **Keyboard Shortcuts** - Space to play/pause, Esc to exit modes
- ✅ **Click-to-Seek** - Click timeline to jump to any position

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Upload Media**: Click "Upload Videos & Images" in the left panel
2. **Add to Timeline**: Click "Add" next to any media file
3. **Edit Clips**:
   - Drag clips to rearrange
   - Use trim handles to adjust duration
   - Click timeline to seek
   - Press Space to play/pause

## Architecture

### Core Components

```
src/
├── components/SceneEditor/
│   ├── SceneEditor.tsx              # Main container
│   ├── VideoPreviewArea.tsx         # Video player (65% height)
│   ├── VideoPlaybackPanel.tsx       # Play/pause controls
│   ├── TimelineArea.tsx             # Timeline editor (31% height)
│   ├── TimelineCanvas.tsx           # Clips, ruler, playhead
│   ├── TimelineClip.tsx             # Individual clip rendering
│   ├── VirtualTimelineManager.ts    # Master clock & time mapping
│   ├── zoomSystem.ts                # Zoom level calculations
│   └── timelineUtils.ts             # Duration & validation utils
│
├── contexts/
│   ├── TimelineContext.tsx          # State management
│   ├── SceneEditorPanelContext.tsx  # Panel visibility
│   └── TimelineModeContext.tsx      # Trim/Rearrange modes
│
├── services/
│   ├── mediaService.ts              # Blob URL management
│   ├── keyframeCache.ts             # Video thumbnail caching
│   └── videoFrameExtractor.ts       # Frame extraction
│
└── types/
    └── timeline.ts                  # TypeScript definitions
```

### State Architecture

```
TimelineContext (React State)
    ↓
SimpleStateManager (Pure Logic)
    ↓
VirtualTimelineManager (Time Calculations)
    ↓
Components (UI Rendering)
```

### Key Design Patterns

1. **Pure Business Logic**: `VirtualTimelineManager` has no React dependencies
2. **Event System**: Subscription-based updates for playhead, time changes
3. **Command Pattern**: Operations for undo/redo support (simplified)
4. **Blob URLs**: All media uses local File objects with blob URLs

## Interview Tasks & Challenges

This project is designed for technical interviews. Here are some suggested tasks:

### Bug Fixes
- [ ] Fix playback stopping at clip boundaries
- [ ] Improve trim handle cursor precision
- [ ] Fix timeline scrolling with many clips

### New Features
- [ ] Add delete key support for clips
- [ ] Implement clip duplication (Cmd/Ctrl + D)
- [ ] Add snap-to-grid when dragging
- [ ] Implement multi-select with Shift+Click
- [ ] Add volume controls for videos
- [ ] Implement fade in/out transitions

### Performance
- [ ] Optimize keyframe rendering for 10+ clips
- [ ] Implement virtual scrolling for 100+ clips
- [ ] Debounce trim operations for smoothness
- [ ] Lazy load video thumbnails

### UX Polish
- [ ] Add keyboard shortcuts panel (? key)
- [ ] Improve drag visual feedback
- [ ] Add timeline minimap
- [ ] Implement timeline markers
- [ ] Add clip labels/names

## Technical Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **ReactFlow** - Provider only (for panel context)
- **Lucide React** - Icons

## Project Structure Details

### Time Management

- **Clip Duration**: Calculated from video metadata or default 3s for images
- **Start Time**: Automatically calculated based on previous clips
- **Trimming**: Adjusts visible duration without affecting source
- **Ripple Effect**: Subsequent clips shift when trimming

### Editing Modes

1. **Trim Mode** (default): Show trim handles, click to seek
2. **Rearrange Mode**: Drag clips to new positions, show spacing

## Known Limitations

- Video export not implemented (could be added via WebCodecs API)
- Audio tracks not supported yet
- No transitions between clips
- Single timeline track only

## Development

```bash
# Run with type checking
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## License

MIT

---

**Note**: This is a standalone extraction of the timeline editor from the Flick project. The UI/UX is identical to the original full-screen Scene Editor mode.

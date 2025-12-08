# Timeline Editor - Standalone

A toy video timeline editor.

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

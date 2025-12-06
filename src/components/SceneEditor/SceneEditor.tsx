import React, { useMemo, useEffect, useRef } from 'react';
import { useCanvas } from '../../contexts/TimelineContext';
import { useSceneEditorPanel } from '../../contexts/SceneEditorPanelContext';
import VideoPreviewArea from './VideoPreviewArea';
import TimelineArea from './TimelineArea';
import VideoPlaybackPanel from './VideoPlaybackPanel';
import { createVirtualTimelineManager } from './VirtualTimelineManager';
import { createZoomSystem } from './zoomSystem';
import { updateTimelineState } from './timelineUtils';
import { TimelineModeProvider } from './TimelineModeContext';
import './sceneEditor.css';

const SceneEditor: React.FC = () => {
    const { stateManager, nodes } = useCanvas();
    const { panelVisibility } = useSceneEditorPanel();
    const sceneEditorRef = useRef<HTMLDivElement>(null);

    // Get scene editor data and migrate to time-based layout
    const sceneEditor = stateManager.getSceneEditor();
    const migratedSceneEditor = useMemo(() => {
        if (!sceneEditor) return null;
        return updateTimelineState(sceneEditor, nodes);
    }, [sceneEditor, nodes]);

    // Create shared VirtualTimelineManager instance for synchronization
    const virtualTimelineManager = useMemo(() => {
        if (!migratedSceneEditor?.cells) return null;

        // Create with normal zoom level initially
        const zoomSystem = createZoomSystem('normal');
        return createVirtualTimelineManager(zoomSystem, migratedSceneEditor.cells);
    }, [migratedSceneEditor?.cells]);

    // Keyboard shortcuts for scene editor
    useEffect(() => {
        if (!virtualTimelineManager) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle keyboard shortcuts when scene editor is active
            if (!sceneEditorRef.current) return;

            // Check if user is typing in an input field
            const activeElement = document.activeElement;
            if (activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.getAttribute('contenteditable') === 'true'
            )) {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault(); // Prevent page scrolling
                    e.stopPropagation();

                    // Toggle play/pause
                    const isCurrentlyPlaying = virtualTimelineManager.isPlaying();
                    virtualTimelineManager.setPlaying(!isCurrentlyPlaying);
                    break;

                // Future keyboard shortcuts can be added here:
                // case 'ArrowLeft':
                // case 'ArrowRight':
                // case 'Home':
                // case 'End':

                default:
                    break;
            }
        };

        // Add keyboard event listener to document
        document.addEventListener('keydown', handleKeyDown);

        // Focus the scene editor container to ensure it can receive keyboard events
        if (sceneEditorRef.current) {
            sceneEditorRef.current.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [virtualTimelineManager]);

    return (
        <TimelineModeProvider>
            <div
                ref={sceneEditorRef}
                className={`scene-editor-container ${!panelVisibility.bottom ? 'no-timeline' : ''}`}
                tabIndex={0} // Make container focusable for keyboard events
                style={{ outline: 'none' }} // Remove focus outline
            >
                <VideoPreviewArea virtualTimeline={virtualTimelineManager} />
                {virtualTimelineManager && (
                    <VideoPlaybackPanel
                        virtualTimeline={virtualTimelineManager}
                        onTogglePlayback={() => virtualTimelineManager.setPlaying(!virtualTimelineManager.isPlaying())}
                        onSkipPrevious={() => {
                            const currentClip = virtualTimelineManager.getCurrentClip();
                            if (currentClip) {
                                if (currentClip.clipTime > 2) {
                                    virtualTimelineManager.setCurrentTime(currentClip.clipStartTime);
                                } else {
                                    const prevTime = Math.max(0, currentClip.clipStartTime - 0.1);
                                    virtualTimelineManager.setCurrentTime(prevTime);
                                }
                            }
                        }}
                        onSkipNext={() => {
                            const currentClip = virtualTimelineManager.getCurrentClip();
                            if (currentClip) {
                                const nextTime = currentClip.clipEndTime;
                                virtualTimelineManager.setCurrentTime(nextTime);
                            }
                        }}
                    />
                )}
                {panelVisibility.bottom && (
                    <TimelineArea virtualTimelineManager={virtualTimelineManager} />
                )}
            </div>
        </TimelineModeProvider>
    );
};

export default SceneEditor; 
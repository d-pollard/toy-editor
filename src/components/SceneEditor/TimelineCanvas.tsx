import React, { useState } from 'react';
import { useCanvas } from '../../contexts/TimelineContext';
import { SceneEditorCell as SceneEditorCellType } from '../../types/timeline';
import { NodeType } from '../../types/timeline';
import TimelineRuler from './TimelineRuler';
import TimelineClip from './TimelineClip';
import TimelinePlayhead from './TimelinePlayhead';
import { ZoomLevel, createZoomSystem } from './zoomSystem';
import { VirtualTimelineManager } from './VirtualTimelineManager';
import { MoveTimelineClipOperation, MoveSceneEditorCellOperation } from '../../operations/SceneEditorOperations';
import { TimelineMode, useTimelineMode } from './TimelineModeContext';
import { useRearrangeDragHandler } from './RearrangeDragHandler';
import RearrangeIndicators from './RearrangeIndicators';

interface TimelineCanvasProps {
    totalDuration: number;
    zoomLevel: ZoomLevel;
    migratedCells?: SceneEditorCellType[];
    virtualTimeline?: VirtualTimelineManager;
    timelineMode: TimelineMode;
    // Phase 2: Ripple preview support
    ripplePreview?: {
        isActive: boolean;
        clipId: string;
        trimStart: number;
        trimEnd: number;
        originalTrimStart: number;
        originalTrimEnd: number;
        ripplePositions?: Array<{
            clipId: string;
            originalStartTime: number;
            newStartTime: number;
            left: number;
        }>;
    } | null;
    // Phase 2: Trim event handlers for ripple preview
    onTrimUpdate?: (clipId: string, trimStart: number, trimEnd: number) => void;
    onTrimEnd?: () => void;
    // Phase 2.5: Enhanced trim handler with playhead sync
    onTrimUpdateWithPlayhead?: (clipId: string, trimStart: number, trimEnd: number, handle: 'left' | 'right') => void;
}

const TimelineCanvas: React.FC<TimelineCanvasProps> = ({
    totalDuration,
    zoomLevel,
    migratedCells,
    virtualTimeline,
    timelineMode,
    ripplePreview,
    onTrimUpdate,
    onTrimEnd,
    onTrimUpdateWithPlayhead
}) => {
    const { stateManager, nodes } = useCanvas();
    const { exitRearrangeMode, mode: hookTimelineMode } = useTimelineMode();
    const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
    // Note: dropIndicatorPosition, proposedDropIndex, and mousePosition moved to dragState for batched updates

    // Get the scene editor data
    const sceneEditor = stateManager.getSceneEditor();

    // Create zoom system for this zoom level
    const zoomSystem = createZoomSystem(zoomLevel);

    // Use migrated cells if available, otherwise fall back to original cells
    const cellsToRender = migratedCells || sceneEditor?.cells || [];

    // Calculate timeline width for the container
    const timelineWidth = zoomSystem.getTimelineWidth(totalDuration);

    // Rearrange drag handler for spaced layout
    const rearrangeDragHandler = useRearrangeDragHandler({
        cells: cellsToRender,
        zoomSystem,
        onDragStart: () => {
            console.log('🎯 Rearrange drag started');
        },
        onDragEnd: () => {
            console.log('🎯 Rearrange drag ended - about to exit rearrange mode');
            // Exit rearrange mode after successful rearrange
            console.log('🎯 Calling exitRearrangeMode()...');
            exitRearrangeMode();
            console.log('🎯 exitRearrangeMode() called');
        }
        // onInsertionChange, onStateCleanup, onMouseMove removed - all state now in dragState
    });

    // Handle clip drag start - only for rearrange mode
    const handleClipDragStart = (clipId: string, dragStartTime: number, forcedMode?: 'rearrange') => {
        console.log('🎬 Timeline drag start:', clipId, 'from time:', dragStartTime);
        console.log('🎬 Mode from prop:', timelineMode, '| Mode from hook:', hookTimelineMode, '| Forced mode:', forcedMode);

        // Only handle rearrange mode drags - trim mode should not have drag functionality
        if (forcedMode === 'rearrange' || hookTimelineMode === 'rearrange') {
            console.log('🎬 Delegating to RearrangeDragHandler');
            rearrangeDragHandler.startRearrangeDrag(clipId, 0, 0); // clientX/Y not needed for our implementation
            return;
        }

        // Trim mode should not have drag functionality - only trim handles should work
        console.log('🎬 Trim mode - drag not supported, use trim handles instead');
    };

    // Handle clip drag end - only for rearrange mode
    const handleClipDragEnd = () => {
        console.log('🎬 Timeline drag end - RearrangeDragHandler handles this');
        // RearrangeDragHandler handles all drag end logic
    };

    // Find media node for dragged clip (for drag ghost)
    const draggedMediaNode = rearrangeDragHandler.dragState.draggedClipData ? nodes.find(node =>
        node.id === rearrangeDragHandler.dragState.draggedClipData!.mediaNodeId &&
        (node.type === NodeType.IMAGE || node.type === NodeType.VIDEO)
    ) : null;

    return (
        <div className={`timeline-canvas ${timelineMode}-mode`}>
            {/* Shared scroll container for ruler and clips */}
            <div className="timeline-scroll-container">
                {/* Timeline Ruler - Sticky at top */}
                <div className="timeline-ruler-container">
                    <TimelineRuler
                        totalDuration={totalDuration}
                        zoomLevel={zoomLevel}
                        virtualTimeline={virtualTimeline}
                        timelineMode={timelineMode}
                    />
                </div>

                {/* Clips Track */}
                <div className="timeline-track-container">
                <div
                    className={`timeline-clips-track ${rearrangeDragHandler.dragState.isDragging ? 'timeline-track-drag-active' : ''}`}
                    style={{
                        position: 'relative',
                        width: `${Math.max(timelineWidth, window.innerWidth * 0.9)}px`,
                        height: '80px',
                        overflow: 'visible'
                    }}
                >
                    {/* Render clips with absolute positioning */}
                    {cellsToRender.map((cell) => {
                        // Get spaced position for rearrange mode
                        const spacedPosition = timelineMode === 'rearrange'
                            ? rearrangeDragHandler.getClipSpacedPosition(cell.id)
                            : null;

                        // Check if this clip is being dragged in rearrange mode
                        const isBeingDraggedInRearrange = timelineMode === 'rearrange' &&
                            rearrangeDragHandler.dragState.isDragging &&
                            rearrangeDragHandler.dragState.draggedClipId === cell.id;

                        // Phase 2: Check if this clip should show ripple preview
                        const shouldShowRipplePreview = ripplePreview?.isActive &&
                            ripplePreview.clipId !== cell.id &&
                            ripplePreview.ripplePositions?.some(rp => rp.clipId === cell.id);

                        const ripplePosition = shouldShowRipplePreview
                            ? ripplePreview.ripplePositions?.find(rp => rp.clipId === cell.id)
                            : null;

                        return (
                            <TimelineClip
                                key={cell.id}
                                cell={cell}
                                zoomSystem={zoomSystem}
                                onSelect={setSelectedClipId}
                                isSelected={selectedClipId === cell.id}
                                onDragStart={handleClipDragStart}
                                onDragEnd={timelineMode === 'trim' ? handleClipDragEnd : undefined}
                                timelineMode={timelineMode}
                                spacedPosition={spacedPosition}
                                isBeingDragged={isBeingDraggedInRearrange}
                                // Phase 2: Ripple preview support
                                ripplePreview={ripplePosition ? {
                                    isActive: true,
                                    newLeft: ripplePosition.left,
                                    originalLeft: zoomSystem.getPixelFromTime(ripplePosition.originalStartTime)
                                } : null}
                                // Phase 2: Pass trim handlers for ripple preview
                                onTrimUpdate={onTrimUpdate}
                                onTrimEnd={onTrimEnd}
                                // Phase 2.5: Pass enhanced trim handler with playhead sync
                                onTrimUpdateWithPlayhead={onTrimUpdateWithPlayhead}
                            />
                        );
                    })}

                    {/* Drop indicator line */}
                    {rearrangeDragHandler.dragState.isDragging && rearrangeDragHandler.dragState.insertionPixelPosition !== null && (
                        <div
                            className="timeline-drop-indicator"
                            style={{
                                position: 'absolute',
                                left: `${rearrangeDragHandler.dragState.insertionPixelPosition}px`,
                                top: '0',
                                bottom: '0',
                                width: '4px',
                                background: 'linear-gradient(to bottom, #10b981, #059669)',
                                borderRadius: '2px',
                                boxShadow: '0 0 12px rgba(16, 185, 129, 0.8)',
                                zIndex: 500,
                                opacity: 1,
                                animation: 'pulseDropIndicator 1.2s ease-in-out infinite',
                                transform: 'translateX(-2px)' // Center the line
                            }}
                        >
                            {/* Position indicator label with smart text */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '12px',
                                    transform: 'translateY(-50%)',
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                {(() => {
                                    const position = rearrangeDragHandler.dragState.insertionIndex || 0;
                                    const totalClips = cellsToRender.length;

                                    if (position === 0) {
                                        return 'Move to start';
                                    } else if (position >= totalClips) {
                                        return 'Move to end';
                                    } else {
                                        return `Position ${position + 1}`;
                                    }
                                })()}
                            </div>
                        </div>
                    )}

                    {/* TODO: Add "Add Clip" functionality back in future phase */}
                </div>

                {/* Drag ghost - follows cursor */}
                {rearrangeDragHandler.dragState.isDragging && rearrangeDragHandler.dragState.draggedClipData && (
                    <div
                        className="timeline-drag-ghost"
                        style={{
                            position: 'fixed',
                            left: `${rearrangeDragHandler.dragState.mousePosition.x - 60}px`, // Offset to center on cursor
                            top: `${rearrangeDragHandler.dragState.mousePosition.y - 40}px`,
                            width: '120px', // Fixed width for ghost
                            height: '80px',
                            background: 'var(--card)',
                            border: '2px solid var(--primary)',
                            borderRadius: '4px',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                            opacity: 0.9,
                            zIndex: 9999,
                            pointerEvents: 'none',
                            transform: 'rotate(5deg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: 'var(--primary)',
                            fontWeight: '600'
                        }}
                    >
                        🎬 {draggedMediaNode?.type === NodeType.VIDEO ? 'Video' : 'Image'}
                        <br />
                        {Math.round((rearrangeDragHandler.dragState.draggedClipData?.duration || 0) * 10) / 10}s
                    </div>
                )}
                </div>

                {/* Timeline Playhead - Inside scroll container so it scrolls with content */}
                {virtualTimeline && (
                    <TimelinePlayhead
                        virtualTimeline={virtualTimeline}
                        zoomLevel={zoomLevel}
                        totalDuration={totalDuration}
                        timelineWidth={timelineWidth} // Use actual content width, not screen-based width
                    />
                )}
            </div>
        </div>
    );
};

export default TimelineCanvas; 
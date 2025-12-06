import React, { useState, useCallback, useRef } from 'react';
import { SceneEditorCell } from '../../types/timeline';
import { ZoomSystem } from './zoomSystem';
import { MoveSceneEditorCellOperation } from '../../operations/SceneEditorOperations';
import { useCanvas } from '../../contexts/TimelineContext';

export interface SpacedLayoutPosition {
    originalIndex: number;
    spacedPixelStart: number;
    spacedPixelEnd: number;
    gapPixels: number;
}

export interface RearrangeDragState {
    isDragging: boolean;
    isActuallyMoving: boolean; // Only true when mouse has moved
    draggedClipId: string | null;
    draggedClipData: SceneEditorCell | null;
    insertionIndex: number | null;
    insertionPixelPosition: number | null;
    spacedPositions: SpacedLayoutPosition[];
    mousePosition: { x: number; y: number }; // Batched into state to avoid separate updates
}

export interface RearrangeDragHandlerProps {
    cells: SceneEditorCell[];
    zoomSystem: ZoomSystem;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    // onInsertionChange, onStateCleanup, onMouseMove removed - all state batched into dragState for better performance
}

/**
 * RearrangeDragHandler - Independent drag system for rearrange mode
 *
 * Handles spaced layout calculations, insertion detection, and rearrange operations
 * completely separate from trim functionality.
 */
export const useRearrangeDragHandler = ({
    cells,
    zoomSystem,
    onDragStart,
    onDragEnd
}: RearrangeDragHandlerProps) => {
    const { stateManager } = useCanvas();
    const [dragState, setDragState] = useState<RearrangeDragState>({
        isDragging: false,
        isActuallyMoving: false,
        draggedClipId: null,
        draggedClipData: null,
        insertionIndex: null,
        insertionPixelPosition: null,
        spacedPositions: [],
        mousePosition: { x: 0, y: 0 }
    });

    // Configuration
    const CLIP_GAP_PIXELS = 20; // Space between clips in rearrange mode
    const CLIP_MIN_WIDTH = 40; // Minimum clip width for visibility

    /**
     * Calculate spaced layout positions for all clips
     * This creates the visual gaps between clips in rearrange mode
     */
    const calculateSpacedPositions = useCallback((
        cellsToPosition: SceneEditorCell[],
        excludeClipId?: string
    ): SpacedLayoutPosition[] => {
        // Always include ALL clips to maintain their original positions
        const sortedCells = [...cellsToPosition]
            .sort((a, b) => (a.position || 0) - (b.position || 0));

        const spacedPositions: SpacedLayoutPosition[] = [];
        let currentPixelPosition = 10; // Start with 10px margin

        sortedCells.forEach((cell, index) => {
            // Calculate clip width based on effective duration (accounting for trim)
            const effectiveDuration = getEffectiveDuration(cell);
            const clipWidth = Math.max(
                zoomSystem.getPixelFromTime(effectiveDuration),
                CLIP_MIN_WIDTH
            );

            spacedPositions.push({
                originalIndex: cell.position || 0,
                spacedPixelStart: currentPixelPosition,
                spacedPixelEnd: currentPixelPosition + clipWidth,
                gapPixels: CLIP_GAP_PIXELS
            });

            // Move to next position with gap
            currentPixelPosition += clipWidth + CLIP_GAP_PIXELS;
        });

        return spacedPositions;
    }, [zoomSystem, CLIP_GAP_PIXELS, CLIP_MIN_WIDTH]);

    /**
     * Helper function to calculate effective duration (accounting for trim)
     */
    const getEffectiveDuration = (cell: SceneEditorCell): number => {
        const originalDuration = cell.duration || 0;
        const trimStart = cell.trimStart || 0;
        const trimEnd = cell.trimEnd || 0;
        return Math.max(0.1, originalDuration - trimStart - trimEnd);
    };

    /**
     * Calculate insertion position based on mouse position in spaced layout
     * Always returns a position in a gap, never inside clips
     */
    const calculateInsertionPosition = useCallback((
        mouseX: number,
        spacedPositions: SpacedLayoutPosition[]
    ): { index: number; pixelPosition: number } => {
        // Handle empty timeline
        if (spacedPositions.length === 0) {
            return { index: 0, pixelPosition: 10 };
        }

        // Before first clip
        if (mouseX < spacedPositions[0].spacedPixelStart) {
            return { index: 0, pixelPosition: 10 };
        }

        // After last clip
        const lastClip = spacedPositions[spacedPositions.length - 1];
        if (mouseX > lastClip.spacedPixelEnd) {
            const insertionX = lastClip.spacedPixelEnd + CLIP_GAP_PIXELS / 2;
            return { index: spacedPositions.length, pixelPosition: insertionX };
        }

        // Find the nearest gap when cursor is inside clips
        for (let i = 0; i < spacedPositions.length - 1; i++) {
            const currentClip = spacedPositions[i];
            const nextClip = spacedPositions[i + 1];
            const gapStart = currentClip.spacedPixelEnd;
            const gapEnd = nextClip.spacedPixelStart;

            // If cursor is directly in this gap
            if (mouseX >= gapStart && mouseX <= gapEnd) {
                const insertionX = gapStart + (gapEnd - gapStart) / 2;
                return { index: i + 1, pixelPosition: insertionX };
            }

            // If cursor is inside currentClip, show indicator in gap before this clip
            if (mouseX >= currentClip.spacedPixelStart && mouseX <= currentClip.spacedPixelEnd) {
                // Determine which side of the clip the cursor is on
                const clipMidpoint = (currentClip.spacedPixelStart + currentClip.spacedPixelEnd) / 2;

                if (mouseX <= clipMidpoint) {
                    // Cursor in left half - show indicator in gap before this clip
                    if (i === 0) {
                        // First clip - show before it
                        return { index: 0, pixelPosition: 10 };
                    } else {
                        // Show in gap before current clip
                        const prevClip = spacedPositions[i - 1];
                        const gapCenter = prevClip.spacedPixelEnd + (currentClip.spacedPixelStart - prevClip.spacedPixelEnd) / 2;
                        return { index: i, pixelPosition: gapCenter };
                    }
                } else {
                    // Cursor in right half - show indicator in gap after this clip
                    const gapCenter = currentClip.spacedPixelEnd + (nextClip.spacedPixelStart - currentClip.spacedPixelEnd) / 2;
                    return { index: i + 1, pixelPosition: gapCenter };
                }
            }
        }

        // Fallback - should not reach here, but if it does, show after last clip
        return { index: spacedPositions.length, pixelPosition: lastClip.spacedPixelEnd + CLIP_GAP_PIXELS / 2 };
    }, [CLIP_GAP_PIXELS]);

    /**
     * Start rearrange drag operation
     */
    const startRearrangeDrag = useCallback((
        clipId: string,
        clientX: number,
        clientY: number
    ) => {
        const draggedCell = cells.find(cell => cell.id === clipId);
        if (!draggedCell) return;

        console.log('🎯 RearrangeDragHandler: Starting drag for clip:', clipId);

        // Calculate spaced positions including ALL clips to maintain their positions
        const spacedPositions = calculateSpacedPositions(cells);

        setDragState({
            isDragging: true,
            isActuallyMoving: false, // Not moving yet, just clicked
            draggedClipId: clipId,
            draggedClipData: draggedCell,
            insertionIndex: null,
            insertionPixelPosition: null,
            spacedPositions,
            mousePosition: { x: clientX, y: clientY }
        });

        onDragStart?.();

        // PERFORMANCE FIX: Cache DOM reference and rect to avoid reflows on every mouse move
        const timelineContainer = document.querySelector('.timeline-clips-track');
        if (!timelineContainer) return;

        // Cache the initial bounding rect
        let containerRect = timelineContainer.getBoundingClientRect();

        // Update rect on window resize (rare event)
        const handleResize = () => {
            containerRect = timelineContainer.getBoundingClientRect();
        };
        window.addEventListener('resize', handleResize);

        // Set up global mouse events
        const handleMouseMove = (e: MouseEvent) => {
            // Use cached rect instead of querying DOM every mouse move
            const mouseX = e.clientX - containerRect.left;

            // Calculate insertion position
            const insertion = calculateInsertionPosition(mouseX, spacedPositions);

            // Adjust insertion index to account for the fact that dragged clip is still in the list
            // We need to calculate the correct position index for the move operation
            let adjustedInsertionIndex = insertion.index;

            // If the insertion point is after the dragged clip's original position, 
            // we need to subtract 1 because the dragged clip will be removed from that position
            const draggedCell = cells.find(c => c.id === clipId);
            if (draggedCell && insertion.index > draggedCell.position) {
                adjustedInsertionIndex = insertion.index - 1;
            }

            // PERFORMANCE FIX: Single batched state update - no separate callbacks
            // Reduces from 3+ re-renders per mouse move to just 1
            setDragState(prev => ({
                ...prev,
                isActuallyMoving: true,
                insertionIndex: adjustedInsertionIndex,
                insertionPixelPosition: insertion.pixelPosition,
                mousePosition: { x: e.clientX, y: e.clientY }
            }));
        };

        const handleMouseUp = (e: MouseEvent) => {
            console.log('🎯 RearrangeDragHandler: Ending drag');

            // Use the current state at time of mouse up
            setDragState(currentState => {
                // Apply the rearrange operation if position changed
                if (currentState.insertionIndex !== null && currentState.insertionIndex !== draggedCell.position) {
                    const moveOperation = new MoveSceneEditorCellOperation(
                        clipId,
                        currentState.insertionIndex
                    );
                    stateManager.getOperationManager().executeWithContext(moveOperation, stateManager);
                }

                return currentState; // Return current state, we'll clean up below
            });

            // Clean up drag state
            setDragState({
                isDragging: false,
                isActuallyMoving: false,
                draggedClipId: null,
                draggedClipData: null,
                insertionIndex: null,
                insertionPixelPosition: null,
                spacedPositions: [],
                mousePosition: { x: 0, y: 0 }
            });

            onDragEnd?.();

            // Remove event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
        };

        // Add global event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [
        cells,
        calculateSpacedPositions,
        calculateInsertionPosition,
        stateManager,
        onDragStart,
        onDragEnd
    ]);

    /**
     * Get spaced position for a specific clip (for rendering)
     * PERFORMANCE FIX: Use pre-calculated positions from dragState instead of recalculating
     */
    const getClipSpacedPosition = useCallback((clipId: string): { left: number; width: number } | null => {
        // Use pre-calculated positions from dragState (calculated once at drag start)
        // This changes from O(n²) to O(n) - no recalculation per clip!
        const { spacedPositions } = dragState;

        // If not dragging yet, calculate positions once
        if (spacedPositions.length === 0) {
            const positions = calculateSpacedPositions(cells);
            const cell = cells.find(c => c.id === clipId);
            if (!cell) return null;

            const position = positions.find(pos => pos.originalIndex === cell.position);
            if (!position) return null;

            return {
                left: position.spacedPixelStart,
                width: position.spacedPixelEnd - position.spacedPixelStart
            };
        }

        // During drag, use cached positions - O(1) lookup instead of O(n) recalculation
        const cell = cells.find(c => c.id === clipId);
        if (!cell) return null;

        const position = spacedPositions.find(pos => pos.originalIndex === cell.position);
        if (!position) return null;

        return {
            left: position.spacedPixelStart,
            width: position.spacedPixelEnd - position.spacedPixelStart
        };
    }, [dragState.spacedPositions, cells, calculateSpacedPositions]);

    return {
        dragState,
        startRearrangeDrag,
        getClipSpacedPosition,
        calculateSpacedPositions
    };
}; 
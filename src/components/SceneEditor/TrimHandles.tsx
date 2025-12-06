import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { SceneEditorCell } from '../../types/timeline';
import { ZoomSystem } from './zoomSystem';
import { formatTime } from './timelineUtils';

interface TrimHandlesProps {
    cell: SceneEditorCell;
    clipWidth: number;
    clipHeight: number;
    zoomSystem: ZoomSystem;
    onTrimStart?: (handle: 'left' | 'right', initialValue: number) => void;
    onTrimUpdate?: (trimStart: number, trimEnd: number) => void;
    onTrimEnd?: () => void;
    isVisible: boolean;
    showTooltip?: boolean;
    // Phase 2.5: Enhanced trim update with handle information
    onTrimUpdateWithHandle?: (trimStart: number, trimEnd: number, handle: 'left' | 'right') => void;
}

interface TrimTooltipProps {
    position: { x: number; y: number };
    newPosition: string; // "01:29:22" 
    trimAmount: string;  // "-00:05:16"
    isVisible: boolean;
}

interface CurvedBracketHandleProps {
    side: 'left' | 'right';
    position: 'left' | 'right';
    height: number;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    isHovered?: boolean;
    isDragging?: boolean;
}

const TrimTooltip: React.FC<TrimTooltipProps> = ({
    position,
    newPosition,
    trimAmount,
    isVisible
}) => {
    if (!isVisible) return null;

    // Step 1B.3: Enhanced positioning - center tooltip exactly on dragging edge
    const tooltipWidth = 160; // Compact tooltip width
    const tooltipHeight = 50; // Compact tooltip height
    const arrowOffset = 15; // Distance above the dragging edge

    // Center tooltip exactly on the dragging edge position
    let adjustedX = position.x - (tooltipWidth / 2); // Center horizontally on edge
    let adjustedY = position.y - tooltipHeight - arrowOffset; // Position above edge

    // Viewport boundary detection
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Keep tooltip within horizontal bounds
    if (adjustedX < 10) adjustedX = 10;
    if (adjustedX + tooltipWidth > viewportWidth - 10) {
        adjustedX = viewportWidth - tooltipWidth - 10;
    }

    // Keep tooltip within vertical bounds  
    if (adjustedY < 10) {
        adjustedY = position.y + arrowOffset; // Position below edge if no room above
    }


    // Use createPortal to render tooltip directly to document.body
    return createPortal(
        <div
            className="trim-tooltip"
            style={{
                position: 'fixed',
                left: `${adjustedX}px`,
                top: `${adjustedY}px`,
                width: `${tooltipWidth}px`,
                height: `${tooltipHeight}px`,
                zIndex: 1000,
                backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark professional background
                color: 'white',
                padding: '6px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'Jost, sans-serif',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <div className="trim-tooltip-content">
                <div style={{ marginBottom: '2px' }}>New Position: {newPosition}</div>
                <div>Trim Amount: {trimAmount}</div>
            </div>

            {/* Arrow pointing down to the dragging edge */}
            <div
                className="trim-tooltip-arrow"
                style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid rgba(0, 0, 0, 0.8)'
                }}
            />
        </div>,
        document.body
    );
};

const VerticalBracketHandle: React.FC<CurvedBracketHandleProps> = ({
    side,
    position,
    height,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    isHovered = false,
    isDragging = false
}) => {
    const bracketWidth = 16; // Wider bracket for better visibility
    const bracketThickness = 4; // Thick yellow lines
    const horizontalLength = 7; // Length of horizontal bracket arms

    return (
        <div
            className={`trim-handle trim-handle-${side} ${isHovered ? 'trim-handle-hovered' : ''} ${isDragging ? 'trim-handle-dragging' : ''}`}
            style={{
                position: 'absolute',
                [position]: side === 'left' ? '-1px' : '-1px', // Move handles slightly inward
                top: '0px', // Perfect alignment with clip top
                width: `${bracketWidth}px`,
                height: `${height}px`, // Exact clip height - no extension
                cursor: 'col-resize',
                zIndex: 50,
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseDown={onMouseDown}
        >
            {/* Thick yellow bracket */}
            <svg
                width={bracketWidth}
                height={height}
                viewBox={`0 0 ${bracketWidth} ${height}`}
                className="trim-bracket"
            >
                {/* Thick bracket shape */}
                <g fill="none" stroke="#FFD700" strokeWidth={bracketThickness} strokeLinecap="square">
                    {side === 'left' ? (
                        // Left bracket: [ 
                        <>
                            {/* Vertical line on the left */}
                            <line x1="2" y1="2" x2="2" y2={height - 2} />
                            {/* Top horizontal line */}
                            <line x1="2" y1="2" x2={2 + horizontalLength} y2="2" />
                            {/* Bottom horizontal line */}
                            <line x1="2" y1={height - 2} x2={2 + horizontalLength} y2={height - 2} />
                        </>
                    ) : (
                        // Right bracket: ]
                        <>
                            {/* Vertical line on the right */}
                            <line x1={bracketWidth - 2} y1="2" x2={bracketWidth - 2} y2={height - 2} />
                            {/* Top horizontal line */}
                            <line x1={bracketWidth - 2 - horizontalLength} y1="2" x2={bracketWidth - 2} y2="2" />
                            {/* Bottom horizontal line */}
                            <line x1={bracketWidth - 2 - horizontalLength} y1={height - 2} x2={bracketWidth - 2} y2={height - 2} />
                        </>
                    )}
                </g>
            </svg>
        </div>
    );
};

const TrimHandles: React.FC<TrimHandlesProps> = ({
    cell,
    clipWidth,
    clipHeight,
    zoomSystem,
    onTrimStart,
    onTrimUpdate,
    onTrimEnd,
    isVisible,
    showTooltip = false,
    onTrimUpdateWithHandle
}) => {
    const [hoveredHandle, setHoveredHandle] = useState<'left' | 'right' | null>(null);
    const [draggingHandle, setDraggingHandle] = useState<'left' | 'right' | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [currentDragDelta, setCurrentDragDelta] = useState(0);

    // Helper function to calculate effective duration (visible duration after trimming)
    const getEffectiveDuration = (cell: SceneEditorCell): number => {
        const originalDuration = cell.duration || 0;
        const trimStart = cell.trimStart || 0;
        const trimEnd = cell.trimEnd || 0;
        return Math.max(0.1, originalDuration - trimStart - trimEnd);
    };

    // Helper function to format time with frames (MM:SS:FF at 30fps)
    const formatTimeWithFrames = (seconds: number): string => {
        const totalFrames = Math.round(seconds * 30); // 30 fps with proper rounding
        const minutes = Math.floor(totalFrames / (30 * 60));
        const remainingFrames = totalFrames % (30 * 60);
        const secs = Math.floor(remainingFrames / 30);
        const frames = remainingFrames % 30;

        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    };

    // Helper function to format time with sign for trim amounts
    const formatTimeWithSign = (seconds: number): string => {
        const absSeconds = Math.abs(seconds);
        const timeStr = formatTimeWithFrames(absSeconds);
        return seconds >= 0 ? `+${timeStr}` : `-${timeStr}`;
    };

    if (!isVisible) return null;

    const handleMouseEnter = (handle: 'left' | 'right') => {
        setHoveredHandle(handle);
    };

    const handleMouseLeave = () => {
        if (!draggingHandle) {
            setHoveredHandle(null);
        }
    };

    const handleMouseDown = (handle: 'left' | 'right') => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();


        setDraggingHandle(handle);
        setTooltipPosition({ x: e.clientX, y: e.clientY });

        const initialMouseX = e.clientX;
        let dragPixelDelta = 0;

        // Get the initial handle position relative to the clip
        const clipRect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
        const initialHandleX = handle === 'left' ? (clipRect?.left || 0) : (clipRect?.right || 0);

        // Add global mouse event listeners for drag tracking
        const handleMouseMove = (moveEvent: MouseEvent) => {
            dragPixelDelta = moveEvent.clientX - initialMouseX;
            setCurrentDragDelta(dragPixelDelta); // Store for tooltip calculations

            // Convert pixel delta to time delta
            const timeDelta = zoomSystem.getTimeFromPixel(Math.abs(dragPixelDelta));

            // Calculate what the new trim values would be
            const currentTrimStart = cell.trimStart || 0;
            const currentTrimEnd = cell.trimEnd || 0;

            let newTrimStart = currentTrimStart;
            let newTrimEnd = currentTrimEnd;

            if (handle === 'left') {
                // Left handle: dragging right INCREASES trimStart (trim more from beginning)
                const adjustment = dragPixelDelta > 0 ? timeDelta : -timeDelta;
                newTrimStart = Math.max(0, currentTrimStart + adjustment);
            } else {
                // Right handle: dragging left INCREASES trimEnd (trim more from end)  
                const adjustment = dragPixelDelta > 0 ? -timeDelta : timeDelta;
                newTrimEnd = Math.max(0, currentTrimEnd + adjustment);
            }

            // Validate trim constraints (don't allow trimming beyond content)
            const originalDuration = cell.duration || 0;
            const maxTotalTrim = originalDuration - 0.1; // Minimum 0.1s remaining

            if (newTrimStart + newTrimEnd > maxTotalTrim) {
                // If we hit the limit, cap the trim values
                if (handle === 'left') {
                    newTrimStart = Math.max(0, maxTotalTrim - currentTrimEnd);
                } else {
                    newTrimEnd = Math.max(0, maxTotalTrim - currentTrimStart);
                }
            }

            // Phase 2.5: Use enhanced callback with handle information if available
            if (onTrimUpdateWithHandle) {
                onTrimUpdateWithHandle(newTrimStart, newTrimEnd, handle);
            } else {
                // Fallback to original callback
                onTrimUpdate?.(newTrimStart, newTrimEnd);
            }

            // Update tooltip position to follow the dragging edge, not the cursor
            const currentHandleX = initialHandleX + dragPixelDelta;
            setTooltipPosition({ x: currentHandleX, y: moveEvent.clientY });
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            setDraggingHandle(null);
            setHoveredHandle(null);
            setCurrentDragDelta(0); // Reset drag delta

            // Remove global event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            onTrimEnd?.();
        };

        // Add global event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        onTrimStart?.(handle, handle === 'left' ? (cell.trimStart || 0) : (cell.trimEnd || 0));
    };

    // Step 1B.5: Calculate real tooltip values with left/right trim logic differences
    const calculateNewPosition = (): string => {
        if (!draggingHandle) return "00:00:00";

        // Convert drag pixel delta to time delta
        const timeDelta = zoomSystem.getTimeFromPixel(Math.abs(currentDragDelta));

        if (draggingHandle === 'left') {
            // Left trim: clip moves right, show new clip start position
            const trimAmount = currentDragDelta > 0 ? timeDelta : -timeDelta;
            const newClipStart = (cell.startTime || 0) + trimAmount; // Clip moves right
            return formatTimeWithFrames(Math.max(0, newClipStart));
        } else {
            // Right trim: clip end changes, show new clip end position
            const currentEnd = (cell.startTime || 0) + getEffectiveDuration(cell);
            const newClipEnd = currentEnd + (currentDragDelta > 0 ? timeDelta : -timeDelta);
            return formatTimeWithFrames(Math.max(0, newClipEnd));
        }
    };

    const calculateTrimAmount = (): string => {
        if (!draggingHandle) return "00:00:00";

        // Convert drag pixel delta to time delta
        const timeDelta = zoomSystem.getTimeFromPixel(Math.abs(currentDragDelta));

        if (draggingHandle === 'left') {
            // Left trim: always show negative (removing content from beginning)
            const trimAmount = currentDragDelta > 0 ? timeDelta : -timeDelta;
            return formatTimeWithSign(-Math.abs(trimAmount));
        } else {
            // Right trim: show negative for trimming, positive for restoring
            const trimAmount = currentDragDelta > 0 ? timeDelta : -timeDelta;
            return formatTimeWithSign(trimAmount);
        }
    };

    return (
        <>
            {/* Left trim handle */}
            <VerticalBracketHandle
                side="left"
                position="left"
                height={clipHeight}
                onMouseEnter={() => handleMouseEnter('left')}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown('left')}
                isHovered={hoveredHandle === 'left'}
                isDragging={draggingHandle === 'left'}
            />

            {/* Right trim handle */}
            <VerticalBracketHandle
                side="right"
                position="right"
                height={clipHeight}
                onMouseEnter={() => handleMouseEnter('right')}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown('right')}
                isHovered={hoveredHandle === 'right'}
                isDragging={draggingHandle === 'right'}
            />

            {/* Tooltip for drag feedback */}
            <TrimTooltip
                position={tooltipPosition}
                newPosition={calculateNewPosition()}
                trimAmount={calculateTrimAmount()}
                isVisible={showTooltip && draggingHandle !== null}
            />
        </>
    );
};

export default TrimHandles; 
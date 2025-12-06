import React, { useCallback } from 'react';
import { formatTime } from './timelineUtils';
import { ZoomLevel, timeToPixel, getTimeInterval } from './zoomSystem';
import { VirtualTimelineManager } from './VirtualTimelineManager';
import { TimelineMode } from './TimelineModeContext';

interface TimelineRulerProps {
    totalDuration: number;
    zoomLevel: ZoomLevel;
    virtualTimeline?: VirtualTimelineManager;
    timelineMode?: TimelineMode;
}

const TimelineRuler: React.FC<TimelineRulerProps> = ({
    totalDuration,
    zoomLevel,
    virtualTimeline,
    timelineMode = 'trim'
}) => {

    // Generate time markers using universal zoom system
    const generateTimeMarkers = () => {
        const interval = getTimeInterval(zoomLevel, totalDuration);
        const markers = [];

        // Always start with 00:00
        markers.push(0);

        // Add markers at intervals
        for (let time = interval; time <= totalDuration; time += interval) {
            markers.push(time);
        }

        // Add final marker at total duration if not already present
        if (markers[markers.length - 1] !== totalDuration && totalDuration > 0) {
            markers.push(totalDuration);
        }

        return markers;
    };

    const timeMarkers = generateTimeMarkers();
    const rulerWidth = Math.max(timeToPixel(totalDuration, zoomLevel), 300); // Minimum 300px width

    // Handle click-to-seek functionality
    const handleRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!virtualTimeline) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const pixelX = e.clientX - rect.left;

        // Convert pixel position to time using VTM
        const newTime = virtualTimeline.getTimeFromPixelClick(pixelX);

        // Clamp to valid timeline range
        const clampedTime = Math.max(0, Math.min(newTime, totalDuration));

        // Update VTM with new time (triggers video seek and all subscribers)
        virtualTimeline.setCurrentTime(clampedTime);
    }, [virtualTimeline, totalDuration]);

    return (
        <div
            className="timeline-ruler"
            style={{ width: `${rulerWidth}px`, cursor: virtualTimeline ? 'pointer' : 'default' }}
            onClick={handleRulerClick}
        >
            <div className="ruler-track">
                {timeMarkers.map((time, index) => {
                    const leftPosition = timeToPixel(time, zoomLevel);

                    return (
                        <div
                            key={index}
                            className="time-marker"
                            style={{ left: `${leftPosition}px` }}
                        >
                            <div className="marker-tick" />
                            {timelineMode !== 'rearrange' && (
                                <div className="marker-label">
                                    {formatTime(time)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineRuler; 
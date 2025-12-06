import React from 'react';

interface TimelineControlsProps {
    // Preview mode controls (optional - only shown in preview mode)
    previewControls?: React.ReactNode;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({ previewControls }) => {
    return (
        <div className="timeline-controls">
            {/* Preview mode controls (when in preview timeline overlay) */}
            {previewControls}
        </div>
    );
};

export default TimelineControls; 
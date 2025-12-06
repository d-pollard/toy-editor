import React from 'react';

interface RearrangeIndicatorsProps {
    insertionPosition?: number;
    showInsertionLine?: boolean;
    containerHeight?: number;
}

/**
 * RearrangeIndicators Component
 * 
 * Visual indicators for rearrange mode, including the vertical insertion line
 * that shows where a clip will be dropped.
 */
const RearrangeIndicators: React.FC<RearrangeIndicatorsProps> = ({
    insertionPosition,
    showInsertionLine = false,
    containerHeight = 80
}) => {
    if (!showInsertionLine || insertionPosition === undefined) {
        return null;
    }

    return (
        <div
            className="rearrange-insertion-indicator"
            style={{
                left: `${insertionPosition}px`,
                height: `${containerHeight}px`,
            }}
        />
    );
};

export default RearrangeIndicators; 
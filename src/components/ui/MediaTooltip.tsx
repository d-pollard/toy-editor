import React, { useState } from 'react';

interface MediaTooltipProps {
    children: React.ReactNode;
    content: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

const MediaTooltip: React.FC<MediaTooltipProps> = ({ 
    children, 
    content, 
    side = 'top' 
}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && (
                <div className={`absolute z-[9999] px-1.5 py-0.5 bg-white text-gray-800 text-xs rounded-sm border border-gray-400 whitespace-nowrap shadow-md pointer-events-none ${
                    side === 'top' ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2' :
                    side === 'bottom' ? 'top-full mt-1.5 left-1/2 -translate-x-1/2' :
                    side === 'left' ? 'right-full mr-1.5 top-1/2 -translate-y-1/2' :
                    'left-full ml-1.5 top-1/2 -translate-y-1/2'
                }`}>
                    {content}
                </div>
            )}
        </div>
    );
};

export default MediaTooltip;
import React from 'react';
import { Button } from '../ui/button';
import { ZoomLevel, ZOOM_METADATA } from './zoomSystem';

interface ZoomControlsProps {
    currentZoom: ZoomLevel;
    onZoomChange: (zoom: ZoomLevel) => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ currentZoom, onZoomChange }) => {
    const zoomLevels: ZoomLevel[] = ['overview', 'normal', 'detail'];

    return (
        <div className="zoom-controls">
            <div className="zoom-controls-label">
                <span className="text-xs text-muted-foreground">Zoom</span>
            </div>

            <div className="zoom-buttons">
                {zoomLevels.map((level) => {
                    const metadata = ZOOM_METADATA[level];
                    const isActive = currentZoom === level;

                    return (
                        <Button
                            key={level}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            className={`zoom-button ${isActive ? 'zoom-button-active' : ''}`}
                            onClick={() => onZoomChange(level)}
                            title={metadata.description}
                        >
                            <span className="zoom-icon">{metadata.icon}</span>
                            <span className="zoom-label">{metadata.label}</span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default ZoomControls; 
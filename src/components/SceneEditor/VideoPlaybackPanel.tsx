import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '../ui/button';
import { VirtualTimelineManager } from './VirtualTimelineManager';

interface VideoPlaybackPanelProps {
    virtualTimeline: VirtualTimelineManager;
    onTogglePlayback: () => void;
    onSkipPrevious: () => void;
    onSkipNext: () => void;
    exitButton?: React.ReactNode;
}

const VideoPlaybackPanel: React.FC<VideoPlaybackPanelProps> = ({
    virtualTimeline,
    onTogglePlayback,
    onSkipPrevious,
    onSkipNext,
    exitButton
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [globalTime, setGlobalTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);

    // Subscribe to VTM state changes
    useEffect(() => {
        if (!virtualTimeline) return;

        const unsubscribeTime = virtualTimeline.onCurrentTimeChange((time) => {
            setGlobalTime(time);
        });

        const unsubscribeState = virtualTimeline.onTimelineChange((state) => {
            setIsPlaying(state.isPlaying);
            setTotalDuration(state.totalDuration);
        });

        // Get initial state
        const initialState = virtualTimeline.getTimelineState();
        setGlobalTime(initialState.currentTime);
        setIsPlaying(initialState.isPlaying);
        setTotalDuration(initialState.totalDuration);

        return () => {
            unsubscribeTime();
            unsubscribeState();
        };
    }, [virtualTimeline]);
    return (
        <div className="video-playback-panel">
            <div className="flex items-center gap-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkipPrevious}
                    disabled={globalTime <= 0}
                    className="text-filmforge-text hover:bg-transparent"
                >
                    <SkipBack className="w-4 h-4" fill="currentColor" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onTogglePlayback}
                    className="text-filmforge-text hover:bg-transparent"
                >
                    {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4" fill="currentColor" />}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkipNext}
                    disabled={globalTime >= totalDuration}
                    className="text-filmforge-text hover:bg-transparent"
                >
                    <SkipForward className="w-4 h-4" fill="currentColor" />
                </Button>
            </div>
            
            {/* Time Display */}
            <div className="flex items-center gap-2 text-sm text-filmforge-text-secondary">
                <span>{globalTime.toFixed(1)}s</span>
                <span>/</span>
                <span>{totalDuration.toFixed(1)}s</span>
                {exitButton && (
                    <div className="ml-4">
                        {exitButton}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlaybackPanel;

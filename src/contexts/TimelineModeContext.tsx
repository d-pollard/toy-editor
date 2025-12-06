import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { flushSync } from 'react-dom';

/**
 * Timeline Mode Types
 */
export type TimelineMode = 'trim' | 'rearrange';

/**
 * Timeline Mode Context Interface
 */
export interface TimelineModeContextType {
    mode: TimelineMode;
    isRearrangeMode: boolean;
    isTrimMode: boolean;
    isTransitioning: boolean;
    activeRearrangeClipId?: string;

    // Mode transition functions
    enterRearrangeMode: (clipId: string) => void;
    exitRearrangeMode: () => void;
    setMode: (mode: TimelineMode) => void;
}

/**
 * Timeline Mode Context
 */
const TimelineModeContext = createContext<TimelineModeContextType | undefined>(undefined);

/**
 * Timeline Mode Provider Props
 */
interface TimelineModeProviderProps {
    children: ReactNode;
}

/**
 * Timeline Mode Provider
 * 
 * Manages the timeline editing mode state to separate trim and rearrange operations.
 * This prevents conflicts between trim handles and clip movement drag operations.
 */
export const TimelineModeProvider: React.FC<TimelineModeProviderProps> = ({ children }) => {
    const [mode, setMode] = useState<TimelineMode>('trim'); // Default to trim mode
    const [activeRearrangeClipId, setActiveRearrangeClipId] = useState<string | undefined>();
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Computed properties for convenience
    const isRearrangeMode = mode === 'rearrange';
    const isTrimMode = mode === 'trim';

    /**
 * Enter rearrange mode for a specific clip
 * This happens when user starts dragging a clip body (not trim handles)
 */
    const enterRearrangeMode = useCallback((clipId: string) => {
        console.log('🔄 Entering rearrange mode for clip:', clipId);

        // Use flushSync to force immediate React update
        flushSync(() => {
            setIsTransitioning(true);
            setMode('rearrange');
            setActiveRearrangeClipId(clipId);
        });

        // End transition after brief delay for visual smoothness
        setTimeout(() => {
            flushSync(() => {
                setIsTransitioning(false);
            });
        }, 100); // Short transition delay
    }, []);

    /**
     * Exit rearrange mode and return to trim mode
     * This happens when rearrange operation completes or is cancelled
     */
    const exitRearrangeMode = useCallback(() => {
        console.log('🔄 Exiting rearrange mode, returning to trim mode');
        setIsTransitioning(true);

        // Smooth transition back to trim mode
        setTimeout(() => {
            setMode('trim');
            setActiveRearrangeClipId(undefined);
            setIsTransitioning(false);
        }, 100); // Short transition delay
    }, []);

    const contextValue: TimelineModeContextType = {
        mode,
        isRearrangeMode,
        isTrimMode,
        isTransitioning,
        activeRearrangeClipId,
        enterRearrangeMode,
        exitRearrangeMode,
        setMode
    };

    return (
        <TimelineModeContext.Provider value={contextValue}>
            {children}
        </TimelineModeContext.Provider>
    );
};

/**
 * Hook to use Timeline Mode Context
 */
export const useTimelineMode = (): TimelineModeContextType => {
    const context = useContext(TimelineModeContext);
    if (context === undefined) {
        throw new Error('useTimelineMode must be used within a TimelineModeProvider');
    }
    return context;
};

/**
 * HOC to provide timeline mode context to any component
 */
export const withTimelineMode = <P extends object>(
    Component: React.ComponentType<P>
): React.ComponentType<P> => {
    return (props: P) => (
        <TimelineModeProvider>
            <Component {...props} />
        </TimelineModeProvider>
    );
}; 
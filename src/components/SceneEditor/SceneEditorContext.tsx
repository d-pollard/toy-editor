import React, { createContext, useContext, useState, useCallback } from 'react';
import { useCanvas } from '../../contexts/TimelineContext';
import { MediaNode } from '../../types/timeline';

interface SceneEditorContextType {
    isActive: boolean;
    currentMediaIndex: number;
    isPlaying: boolean;
    setCurrentMediaIndex: (index: number) => void;
    setIsPlaying: (playing: boolean) => void;
    addMediaToScene: (mediaNode: MediaNode) => void;
    exitSceneEditor: () => void;
    enterSceneEditor: () => void;
}

const SceneEditorContext = createContext<SceneEditorContextType | undefined>(undefined);

interface SceneEditorProviderProps {
    children: React.ReactNode;
}

export const SceneEditorProvider: React.FC<SceneEditorProviderProps> = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const { stateManager } = useCanvas();

    const addMediaToScene = useCallback((mediaNode: MediaNode) => {
        // This will be implemented when we integrate with the operations
        console.log('Adding media to scene:', mediaNode.id);
    }, []);

    const exitSceneEditor = useCallback(() => {
        setIsActive(false);
        setIsPlaying(false);
        setCurrentMediaIndex(0);
    }, []);

    const enterSceneEditor = useCallback(() => {
        setIsActive(true);
    }, []);

    const value: SceneEditorContextType = {
        isActive,
        currentMediaIndex,
        isPlaying,
        setCurrentMediaIndex,
        setIsPlaying,
        addMediaToScene,
        exitSceneEditor,
        enterSceneEditor,
    };

    return (
        <SceneEditorContext.Provider value={value}>
            {children}
        </SceneEditorContext.Provider>
    );
};

export const useSceneEditor = (): SceneEditorContextType => {
    const context = useContext(SceneEditorContext);
    if (context === undefined) {
        throw new Error('useSceneEditor must be used within a SceneEditorProvider');
    }
    return context;
};

export default SceneEditorContext; 
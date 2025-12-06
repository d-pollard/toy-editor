import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PanelVisibility {
    left: boolean;
    bottom: boolean;
    right: boolean;
}

interface SceneEditorPanelContextType {
    panelVisibility: PanelVisibility;
    togglePanel: (panel: 'left' | 'bottom' | 'right') => void;
    setPanelVisibility: React.Dispatch<React.SetStateAction<PanelVisibility>>;
}

const SceneEditorPanelContext = createContext<SceneEditorPanelContextType | undefined>(undefined);

export const useSceneEditorPanel = () => {
    const context = useContext(SceneEditorPanelContext);
    if (!context) {
        throw new Error('useSceneEditorPanel must be used within a SceneEditorPanelProvider');
    }
    return context;
};

interface SceneEditorPanelProviderProps {
    children: ReactNode;
}

export const SceneEditorPanelProvider: React.FC<SceneEditorPanelProviderProps> = ({ children }) => {
    const [panelVisibility, setPanelVisibility] = useState<PanelVisibility>({
        left: true,
        bottom: true,
        right: true
    });

    const togglePanel = (panel: 'left' | 'bottom' | 'right') => {
        setPanelVisibility(prev => ({
            ...prev,
            [panel]: !prev[panel]
        }));
    };

    const value: SceneEditorPanelContextType = {
        panelVisibility,
        togglePanel,
        setPanelVisibility
    };

    return (
        <SceneEditorPanelContext.Provider value={value}>
            {children}
        </SceneEditorPanelContext.Provider>
    );
};

import React from 'react';
import { useSceneEditorPanel } from '../../contexts/SceneEditorPanelContext';

const SceneEditorHeader: React.FC = () => {
    const { panelVisibility, togglePanel } = useSceneEditorPanel();

    const handleExport = () => {
        alert('Export feature coming soon! This would export your timeline to a video file.');
    };

    console.log('SceneEditorHeader rendering, panelVisibility:', panelVisibility);

    return (
        <div className="h-12 bg-red-500 border-b border-filmforge-border-light flex items-center justify-between px-4 z-50 relative">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-white">Timeline Editor TEST</h1>
            </div>


            {/* Right Section */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <button
                        className={`px-2 py-1 text-xs border border-filmforge-border-light rounded hover:bg-gray-50 ${
                            panelVisibility.left ? 'bg-gray-100' : 'bg-white'
                        }`}
                        onClick={() => togglePanel('left')}
                    >
                        Left
                    </button>
                    <button
                        className={`px-2 py-1 text-xs border border-filmforge-border-light rounded hover:bg-gray-50 ${
                            panelVisibility.right ? 'bg-gray-100' : 'bg-white'
                        }`}
                        onClick={() => togglePanel('right')}
                    >
                        Right
                    </button>
                </div>

                <div className="h-6 w-px bg-filmforge-border-light"></div>

                <button
                    className="bg-[#1C0F09] text-white px-4 py-2 hover:bg-[#1C0F09]/90 transition-all duration-200 text-sm rounded-sm"
                    onClick={handleExport}
                >
                    Export
                </button>
            </div>
        </div>
    );
};

export default SceneEditorHeader;

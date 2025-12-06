import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { useCanvas } from '../../contexts/TimelineContext';
import { useSceneEditorPanel } from '../../contexts/SceneEditorPanelContext';
import { videoExportService } from '../../services/videoExportService';

const SceneEditorHeader: React.FC = () => {
    const { toggleSceneEditorVisibility, stateManager } = useCanvas();
    const { panelVisibility, togglePanel } = useSceneEditorPanel();
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState<string>('');

    const handleExport = async () => {
        setIsExporting(true);
        setExportProgress('');
        
        try {
            // Get scene editor data
            const sceneEditor = stateManager.getSceneEditor();
            if (!sceneEditor || !sceneEditor.cells || sceneEditor.cells.length === 0) {
                alert('No timeline content to export. Please add some clips to the timeline first.');
                return;
            }

            // Get export options
            const options = videoExportService.getDefaultOptions();
            
            // Export to MP4
            const blob = await videoExportService.exportToMP4(
                sceneEditor.cells,
                options,
                (progress) => {
                    setExportProgress(`${progress.stage}: ${progress.message} (${progress.progress}%)`);
                }
            );

            // Download the video
            videoExportService.downloadVideo(blob, `flick-video-${Date.now()}.mp4`);
            
            // Clear progress message after successful export
            setExportProgress('');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setExportProgress('');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="h-12 bg-white border-b border-filmforge-border-light flex items-center justify-between px-4">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSceneEditorVisibility}
                    className="bg-[#1C0F09] text-white px-4 py-2 hover:bg-[#1C0F09]/90 transition-all duration-200 font-jost font-normal text-[14px] rounded-sm flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Canvas
                </button>
                
                <div className="h-6 w-px bg-filmforge-border-light"></div>
                
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-filmforge-text-secondary hover:text-filmforge-text-primary"
                >
                    Import from Canvas
                </Button>
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
                            panelVisibility.bottom ? 'bg-gray-100' : 'bg-white'
                        }`}
                        onClick={() => togglePanel('bottom')}
                    >
                        Bottom
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
                
                <div className="flex items-center gap-2">
                    <button
                        className="bg-[#1C0F09] text-white px-4 py-2 hover:bg-[#1C0F09]/90 transition-all duration-200 font-jost font-normal text-[14px] rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                    {exportProgress && (
                        <div className="text-xs text-filmforge-text-secondary max-w-xs truncate" title={exportProgress}>
                            {exportProgress}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SceneEditorHeader;

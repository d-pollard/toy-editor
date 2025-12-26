import React, { useState, useRef } from 'react';
import { useCanvas } from '../../contexts/TimelineContext';
import { Upload } from 'lucide-react';

const SceneEditorInspector: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Media');
    const { addMediaFromFile, addMediaToTimeline, nodes } = useCanvas();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const mediaNodeId = await addMediaFromFile(file);
            // Automatically add to timeline after uploading
            if (mediaNodeId) {
                addMediaToTimeline(mediaNodeId);
            }
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddToTimeline = (e: React.MouseEvent, mediaNodeId: string) => {
        e.preventDefault();
        e.stopPropagation();
        addMediaToTimeline(mediaNodeId);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header with Tabs */}
            <div className="p-4 border-b border-filmforge-border-light">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('Media')}
                        className={`px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                            activeTab === 'Media' ? 'bg-gray-100 text-filmforge-text' : 'text-filmforge-text-secondary'
                        }`}
                    >
                        Media
                    </button>
                    <button
                        onClick={() => setActiveTab('Audio')}
                        className={`px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                            activeTab === 'Audio' ? 'bg-gray-100 text-filmforge-text' : 'text-filmforge-text-secondary'
                        }`}
                    >
                        Audio
                    </button>
                    <button
                        onClick={() => setActiveTab('Text')}
                        className={`px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                            activeTab === 'Text' ? 'bg-gray-100 text-filmforge-text' : 'text-filmforge-text-secondary'
                        }`}
                    >
                        Text
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'Media' ? (
                    <div className="space-y-4">
                        {/* Upload Section */}
                        <div className="space-y-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*,image/*"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                id="media-upload"
                            />
                            <label
                                htmlFor="media-upload"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-filmforge-text cursor-pointer transition-colors border border-filmforge-border-light rounded"
                            >
                                <Upload className="w-4 h-4" />
                                <span className="text-sm font-medium">Upload Media</span>
                            </label>
                            <p className="text-xs text-filmforge-text-muted text-center">
                                Supports MP4, MOV, JPG, PNG
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-filmforge-text-secondary mt-8">
                        <p className="text-xs opacity-60">
                            {activeTab} tools will appear here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SceneEditorInspector;

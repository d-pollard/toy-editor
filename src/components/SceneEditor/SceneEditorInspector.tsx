import React, { useState, useRef } from 'react';
import { useCanvas } from '../../contexts/TimelineContext';
import { Upload, Film, Image as ImageIcon, Plus } from 'lucide-react';

const SceneEditorInspector: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Media');
    const { addMediaFromFile, addMediaToTimeline, nodes } = useCanvas();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            await addMediaFromFile(file);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddToTimeline = (mediaNodeId: string) => {
        addMediaToTimeline(mediaNodeId);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header with Tabs and Upload Button */}
            <div className="p-4 border-b border-filmforge-border-light">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-filmforge-text">Media</h2>
                    <button
                        onClick={handleUploadClick}
                        className="flex items-center justify-center w-8 h-8 bg-black hover:bg-gray-700 text-white transition-all rounded-full shadow-md hover:shadow-lg"
                        title="Upload media"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
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
                            <h3 className="text-sm font-medium text-filmforge-text">Upload Media</h3>
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
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-filmforge-btn-bg hover:bg-filmforge-btn-bg/90 text-filmforge-text cursor-pointer transition-colors border border-filmforge-border-light"
                            >
                                <Upload className="w-4 h-4" />
                                <span className="text-sm font-medium">Upload Videos & Images</span>
                            </label>
                            <p className="text-xs text-filmforge-text-muted">
                                Supports MP4, MOV, JPG, PNG
                            </p>
                        </div>

                        {/* Media Library */}
                        {nodes.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-filmforge-text">Media Library</h3>
                                <div className="space-y-2">
                                    {nodes.map(node => (
                                        <div
                                            key={node.id}
                                            className="flex items-center gap-2 p-2 border border-filmforge-border-light hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex-shrink-0">
                                                {node.type === 'video' ? (
                                                    <Film className="w-8 h-8 text-filmforge-text-muted" />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-filmforge-text-muted" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-filmforge-text truncate">
                                                    {node.label}
                                                </p>
                                                <p className="text-xs text-filmforge-text-muted">
                                                    {node.type === 'video'
                                                        ? `${node.data.duration?.toFixed(1)}s`
                                                        : `${node.data.width} × ${node.data.height}`
                                                    }
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleAddToTimeline(node.id)}
                                                className="px-2 py-1 text-xs bg-filmforge-btn-bg hover:bg-filmforge-btn-bg/90 text-filmforge-text transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {nodes.length === 0 && (
                            <div className="text-center text-filmforge-text-secondary mt-8">
                                <Upload className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm opacity-60">
                                    Upload videos and images to get started
                                </p>
                            </div>
                        )}
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

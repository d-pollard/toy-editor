import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { useCanvas } from '../../contexts/TimelineContext';

const SceneEditorInspectorHeader: React.FC = () => {
    const { toggleSceneEditorVisibility } = useCanvas();

    return (
        <div className="p-4 border-b border-filmforge-border-light bg-white">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSceneEditorVisibility}
                    className="flex items-center gap-2 text-filmforge-text-secondary hover:text-filmforge-text-primary"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Canvas
                </Button>
            </div>
        </div>
    );
};

export default SceneEditorInspectorHeader; 
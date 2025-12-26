import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { useCanvas } from '../../contexts/TimelineContext';
import { Download, Loader2 } from 'lucide-react';
import { VideoExportService } from '../../services/videoExportService';

const resolutionMap = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


const ExportModal: React.FC<ExportModalProps> = ({ open, onOpenChange }) => {
  const { canvas, nodes } = useCanvas();
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [format, setFormat] = useState<'mp4' | 'webm' | 'mov'>('mp4');
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      const exportService = new VideoExportService();
      await exportService.exportTimeline(canvas, nodes, {
        resolution,
        format,
        quality,
        onProgress: (prog) => setProgress(Math.round(prog)),
      });

      // Show success message briefly
      setTimeout(() => {
        setIsExporting(false);
        onOpenChange(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExporting(false);
      setProgress(0);
    }
  };

  const totalClips = canvas.sceneEditor?.cells.length || 0;
  const totalDuration = canvas.sceneEditor?.cells.reduce((acc, cell) => {
    const duration = cell.duration || 0;
    const trimStart = cell.trimStart || 0;
    const trimEnd = cell.trimEnd || 0;
    return acc + (duration - trimStart - trimEnd);
  }, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Video</DialogTitle>
          <DialogDescription>
            Configure your export settings and download your timeline as a video file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Timeline Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Clips:</span>
              <span className="font-medium">{totalClips}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{totalDuration.toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Aspect Ratio:</span>
              <span className="font-medium">{canvas.sceneEditor?.aspectRatio || '16:9'}</span>
            </div>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {(['720p', '1080p', '4k'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`px-4 py-2 text-sm rounded border transition-colors ${
                    resolution === res
                      ? 'bg-[#1C0F09] text-white border-[#1C0F09]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {res}
                  <div className="text-xs opacity-70 mt-0.5">
                    {resolutionMap[res].width}×{resolutionMap[res].height}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['mp4', 'webm', 'mov'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-2 text-sm rounded border transition-colors uppercase ${
                    format === fmt
                      ? 'bg-[#1C0F09] text-white border-[#1C0F09]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quality</label>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'medium', 'low'] as const).map((qual) => (
                <button
                  key={qual}
                  onClick={() => setQuality(qual)}
                  className={`px-4 py-2 text-sm rounded border transition-colors capitalize ${
                    quality === qual
                      ? 'bg-[#1C0F09] text-white border-[#1C0F09]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {qual}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Exporting...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#1C0F09] h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || totalClips === 0}
            className="bg-[#1C0F09] text-white px-4 py-2 hover:bg-[#1C0F09]/90 transition-all duration-200 text-sm rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Canvas, Node, NodeType } from '../types/timeline';

interface ExportOptions {
  resolution: '720p' | '1080p' | '4k';
  format: 'mp4' | 'webm' | 'mov';
  quality: 'high' | 'medium' | 'low';
  onProgress?: (progress: number) => void;
}

const resolutionMap = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

const qualityMap = {
  high: '23', // CRF value (lower = better quality)
  medium: '28',
  low: '33',
};

export class VideoExportService {
  private ffmpeg: FFmpeg;
  private loaded = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  private async loadFFmpeg(onProgress?: (progress: number) => void): Promise<void> {
    if (this.loaded) return;

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

    this.ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    this.ffmpeg.on('progress', ({ progress }) => {
      // FFmpeg progress is 0-1, scale to 0-90 (leave 10% for finalization)
      onProgress?.(progress * 90);
    });

    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.loaded = true;
  }

  async exportTimeline(
    timelineCanvas: Canvas,
    nodes: Node[],
    options: ExportOptions
  ): Promise<void> {
    const { resolution, format, quality, onProgress } = options;
    const { width, height } = resolutionMap[resolution];
    const cells = timelineCanvas.sceneEditor?.cells || [];

    if (cells.length === 0) {
      throw new Error('No clips to export');
    }

    // Load FFmpeg
    onProgress?.(5);
    await this.loadFFmpeg((prog) => onProgress?.(5 + prog * 0.1)); // 5-15%
    onProgress?.(15);

    // Create filter complex for concatenating clips
    const filterParts: string[] = [];
    const inputs: string[] = [];

    // Process each cell
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const node = nodes.find((n) => n.id === cell.mediaNodeId);

      if (!node) continue;

      const inputName = `input${i}`;
      const trimStart = cell.trimStart || 0;
      const trimEnd = cell.trimEnd || 0;
      const duration = cell.duration || 0;
      const effectiveDuration = duration - trimStart - trimEnd;

      // Write input file to FFmpeg filesystem
      const fileData = await fetchFile(node.data.url);
      const extension = node.type === NodeType.VIDEO ? 'mp4' : 'jpg';
      await this.ffmpeg.writeFile(`${inputName}.${extension}`, fileData);

      if (node.type === NodeType.VIDEO) {
        // Video: trim and scale
        filterParts.push(
          `[${i}:v]trim=start=${trimStart}:end=${trimStart + effectiveDuration},setpts=PTS-STARTPTS,scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2[v${i}]`
        );
      } else {
        // Image: loop for duration and scale
        filterParts.push(
          `[${i}:v]loop=loop=-1:size=1:start=0,trim=duration=${effectiveDuration},setpts=PTS-STARTPTS,scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2[v${i}]`
        );
      }

      inputs.push(`-i ${inputName}.${extension}`);
    }

    // Concatenate all clips
    const concatFilter = filterParts.join(';') + ';' +
      cells.map((_, i) => `[v${i}]`).join('') +
      `concat=n=${cells.length}:v=1:a=0[outv]`;

    // Build FFmpeg command
    const crf = qualityMap[quality];
    const outputFile = `output.${format}`;

    const args = [
      ...inputs.flatMap(i => i.split(' ')),
      '-filter_complex', concatFilter,
      '-map', '[outv]',
      '-c:v', 'libx264',
      '-crf', crf,
      '-preset', 'medium',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      outputFile
    ];

    onProgress?.(20);
    await this.ffmpeg.exec(args);
    onProgress?.(95);

    // Read output file and download
    const data = await this.ffmpeg.readFile(outputFile);
    const blob = new Blob([data as BlobPart], { type: this.getMimeType(format) });
    this.downloadBlob(blob, `timeline-export.${format}`);

    // Cleanup
    await this.cleanup(cells.length, outputFile);
    onProgress?.(100);
  }

  private async cleanup(inputCount: number, outputFile: string): Promise<void> {
    try {
      for (let i = 0; i < inputCount; i++) {
        try {
          await this.ffmpeg.deleteFile(`input${i}.mp4`);
        } catch {}
        try {
          await this.ffmpeg.deleteFile(`input${i}.jpg`);
        } catch {}
      }
      await this.ffmpeg.deleteFile(outputFile);
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'mov':
        // MOV not supported by MediaRecorder, fallback to mp4
        return 'video/mp4';
      default:
        return 'video/webm';
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
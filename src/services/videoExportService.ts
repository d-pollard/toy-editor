/**
 * Video Export Service - Stub for standalone version
 * Export functionality not implemented yet
 */

export const videoExportService = {
  exportVideo: async () => {
    console.warn('Video export not implemented in standalone version');
    alert('Video export feature is not available in standalone mode.\n\nTo implement this, you could use:\n- WebCodecs API for browser-based encoding\n- FFmpeg.wasm for client-side video processing\n- Server-side encoding service');
  }
};

/**
 * Stub for VideoFrameExtractOperation
 * Not used in standalone version
 */

export class VideoFrameExtractOperation {
  constructor(
    private videoNodeId: string,
    private timestamp: number,
    private position: { x: number; y: number }
  ) {}

  execute(context: any) {
    // Not implemented in standalone version
    console.warn('VideoFrameExtractOperation not implemented in standalone version');
  }
}

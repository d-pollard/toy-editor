/**
 * Media Service - Simplified for standalone timeline editor
 * Handles blob URLs for local files
 */

class MediaService {
  private urlCache: Map<string, string> = new Map();

  /**
   * Get media URL (blob URL in standalone version)
   * Compatible with original mediaService interface
   */
  async getMediaUrl(url: string): Promise<string> {
    // In standalone version, URLs are already blob URLs
    // Just return them as-is
    return url;
  }

  /**
   * Create blob URL from file
   */
  createBlobUrl(file: File): string {
    const blobUrl = URL.createObjectURL(file);
    this.urlCache.set(file.name, blobUrl);
    return blobUrl;
  }

  /**
   * Revoke blob URL to free memory
   */
  revokeBlobUrl(url: string): void {
    URL.revokeObjectURL(url);
    // Remove from cache
    for (const [key, value] of this.urlCache.entries()) {
      if (value === url) {
        this.urlCache.delete(key);
        break;
      }
    }
  }

  /**
   * Clean up all blob URLs
   */
  cleanup(): void {
    this.urlCache.forEach(url => URL.revokeObjectURL(url));
    this.urlCache.clear();
  }
}

// Export singleton instance
const mediaService = new MediaService();
export default mediaService;

// Keyframe Cache Service for Scene Editor
// Pre-extracts and caches video keyframes to eliminate timeline delays

import { extractVideoFrames, generateKeyframeTimestamps, getVideoMetadata } from './videoFrameExtractor';
import { ZoomLevel, ZOOM_SCALES } from './zoomSystem';

interface CachedKeyframes {
    [zoomLevel: string]: {
        timestamps: number[];
        frameUrls: string[];
        extractedAt: number; // timestamp when extracted
    };
}

interface VideoCache {
    [videoUrl: string]: {
        metadata: {
            duration: number;
            width: number;
            height: number;
        };
        keyframes: CachedKeyframes;
    };
}

class KeyframeCacheService {
    private cache: VideoCache = {};
    private extractionPromises: Map<string, Promise<void>> = new Map();
    private readonly STORAGE_KEY = 'flick-keyframe-cache';

    constructor() {
        this.loadCacheFromStorage();
    }

    /**
     * Pre-extract keyframes for all zoom levels when video is added to scene
     */
    async preExtractKeyframes(
        videoUrl: string,
        clipDuration?: number,
        trimStart: number = 0,
        trimEnd: number = 0
    ): Promise<void> {
        // Avoid duplicate extractions for the same video
        const cacheKey = this.getCacheKey(videoUrl, trimStart, trimEnd);
        
        if (this.extractionPromises.has(cacheKey)) {
            return this.extractionPromises.get(cacheKey)!;
        }

        // Check if already cached
        if (this.cache[cacheKey]?.keyframes?.overview && 
            this.cache[cacheKey]?.keyframes?.normal && 
            this.cache[cacheKey]?.keyframes?.detail) {
            return;
        }

        const extractionPromise = this.performExtraction(videoUrl, clipDuration, trimStart, trimEnd);
        this.extractionPromises.set(cacheKey, extractionPromise);

        try {
            await extractionPromise;
        } catch (error) {
            console.error('❌ Pre-extraction failed:', error);
            throw error;
        } finally {
            this.extractionPromises.delete(cacheKey);
        }
    }

    private async performExtraction(
        videoUrl: string,
        clipDuration?: number,
        trimStart: number = 0,
        trimEnd: number = 0
    ): Promise<void> {
        try {
            // Get video metadata
            const metadata = await getVideoMetadata(videoUrl);
            const videoDuration = clipDuration || metadata.duration;

            // Initialize cache for this video
            const cacheKey = this.getCacheKey(videoUrl, trimStart, trimEnd);
            
            if (!this.cache[cacheKey]) {
                this.cache[cacheKey] = {
                    metadata,
                    keyframes: {}
                };
            }

            // Extract keyframes for all zoom levels
            const zoomLevels: ZoomLevel[] = ['overview', 'normal', 'detail'];

            for (const zoomLevel of zoomLevels) {
                // Always extract keyframes for the full original video
                // Trim will be handled visually by hiding portions of these keyframes
                const keyframeCount = this.getKeyframeCount(videoDuration, zoomLevel);

                // Generate timestamps for the full video duration
                const timestamps = generateKeyframeTimestamps(
                    videoDuration,
                    keyframeCount,
                    0, // Always start from beginning of video
                    0  // Always go to end of video
                );

                // Extract frames
                const frameUrls = await extractVideoFrames(videoUrl, timestamps, {
                    width: 160,
                    height: 90,
                    quality: 0.7
                });

                // Store in cache
                this.cache[cacheKey].keyframes[zoomLevel] = {
                    timestamps,
                    frameUrls,
                    extractedAt: Date.now()
                };
            }

            // Save to localStorage after all extractions complete
            this.saveCacheToStorage();

        } catch (error) {
            console.error('Error pre-extracting keyframes:', error);
            // Don't throw - we want to gracefully fall back to on-demand extraction
        }
    }

    /**
     * Load cache from localStorage
     */
    private loadCacheFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsedCache = JSON.parse(stored);
                this.cache = parsedCache;
            }
        } catch (error) {
            console.warn('Failed to load keyframe cache from storage:', error);
            this.cache = {};
        }
    }

    /**
     * Save cache to localStorage
     */
    private saveCacheToStorage(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cache));
        } catch (error) {
            console.warn('Failed to save keyframe cache to storage:', error);
            // If localStorage is full, clear old cache and try again
            if (error instanceof DOMException && error.code === 22) {
                this.clearOldCache();
                try {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cache));
                } catch {
                    console.warn('Cache too large for localStorage, keeping in memory only');
                }
            }
        }
    }

    /**
     * Get cached keyframes for a specific video and zoom level
     */
    getCachedKeyframes(
        videoUrl: string,
        zoomLevel: ZoomLevel,
        trimStart: number = 0,
        trimEnd: number = 0
    ): { timestamps: number[]; frameUrls: string[] } | null {
        const cacheKey = this.getCacheKey(videoUrl, trimStart, trimEnd);
        const cached = this.cache[cacheKey]?.keyframes[zoomLevel];

        if (cached) {
            return {
                timestamps: cached.timestamps,
                frameUrls: cached.frameUrls
            };
        }

        return null;
    }

    /**
     * Check if keyframes are cached for a video
     */
    isVideoCached(
        videoUrl: string,
        zoomLevel: ZoomLevel,
        trimStart: number = 0,
        trimEnd: number = 0
    ): boolean {
        const cacheKey = this.getCacheKey(videoUrl, trimStart, trimEnd);
        return !!this.cache[cacheKey]?.keyframes[zoomLevel];
    }

    /**
     * Check if extraction is in progress for a video
     */
    isExtractionInProgress(
        videoUrl: string,
        trimStart: number = 0,
        trimEnd: number = 0
    ): boolean {
        const cacheKey = this.getCacheKey(videoUrl, trimStart, trimEnd);
        return this.extractionPromises.has(cacheKey);
    }

    /**
     * Get video metadata from cache
     */
    getVideoMetadata(
        videoUrl: string,
        trimStart: number = 0,
        trimEnd: number = 0
    ): { duration: number; width: number; height: number } | null {
        const cacheKey = this.getCacheKey(videoUrl, trimStart, trimEnd);
        return this.cache[cacheKey]?.metadata || null;
    }

    /**
     * Clear old cache entries (older than 7 days)
     */
    private clearOldCache(): void {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        Object.keys(this.cache).forEach(cacheKey => {
            const videoCache = this.cache[cacheKey];
            const hasOldFrames = Object.values(videoCache.keyframes).some(
                zoom => zoom.extractedAt < sevenDaysAgo
            );
            
            if (hasOldFrames) {
                delete this.cache[cacheKey];
            }
        });
    }

    /**
     * Clear cache for memory management
     */
    clearCache(): void {
        this.cache = {};
        this.extractionPromises.clear();
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Clear specific video from cache
     */
    clearVideoCache(videoUrl: string): void {
        Object.keys(this.cache).forEach(key => {
            if (key.startsWith(videoUrl)) {
                delete this.cache[key];
            }
        });
        this.saveCacheToStorage();
    }

    /**
     * Get cache statistics for debugging
     */
    getCacheStats(): {
        videoCount: number;
        totalKeyframes: number;
        cacheSize: string;
    } {
        const videoCount = Object.keys(this.cache).length;
        let totalKeyframes = 0;

        Object.values(this.cache).forEach(video => {
            Object.values(video.keyframes).forEach(zoom => {
                totalKeyframes += zoom.frameUrls.length;
            });
        });

        // Rough cache size estimation (data URLs are about 10-20KB each)
        const estimatedSize = totalKeyframes * 15; // KB
        const cacheSize = estimatedSize > 1024
            ? `${(estimatedSize / 1024).toFixed(1)}MB`
            : `${estimatedSize}KB`;

        return {
            videoCount,
            totalKeyframes,
            cacheSize
        };
    }

    /**
     * Debug method to dump current cache state
     */
    dumpCacheState(): void {
        console.log('🗂️ Current cache state:');
        console.log('Cache keys:', Object.keys(this.cache));
        
        Object.entries(this.cache).forEach(([cacheKey, videoCache]) => {
            console.log(`📹 Video: ${cacheKey.substring(0, 50)}...`);
            console.log(`   Metadata: ${videoCache.metadata.duration}s, ${videoCache.metadata.width}x${videoCache.metadata.height}`);
            console.log(`   Zoom levels: ${Object.keys(videoCache.keyframes)}`);
            
            Object.entries(videoCache.keyframes).forEach(([zoomLevel, keyframeData]) => {
                console.log(`   ${zoomLevel}: ${keyframeData.frameUrls.length} frames, extracted at ${new Date(keyframeData.extractedAt).toLocaleTimeString()}`);
            });
        });
        
        console.log('Cache stats:', this.getCacheStats());
    }

    private getCacheKey(videoUrl: string, _trimStart: number, _trimEnd: number): string {
        // Always use just the video URL as cache key
        // Trim operations should reuse the same keyframes, not generate new ones
        // Visual trimming is handled by the UI layer, not keyframe extraction
        return videoUrl;
    }

    private getKeyframeCount(duration: number, zoomLevel: ZoomLevel): number {
        switch (zoomLevel) {
            case 'overview':
                return 1;
            case 'normal':
                return Math.min(5, Math.max(1, Math.floor(duration)));
            case 'detail':
                return Math.min(10, Math.max(1, Math.floor(duration * 2)));
            default:
                return 1;
        }
    }
}

// Singleton instance
export const keyframeCacheService = new KeyframeCacheService();

// Export for use in operations and components
export default keyframeCacheService; 
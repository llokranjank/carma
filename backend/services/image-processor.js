/**
 * Image processing utilities for ¢arma
 */
class ImageProcessor {
    /**
     * Validate image data
     */
    static validateImage(imageData) {
        if (!imageData) {
            throw new Error('No image data provided');
        }

        // Check if it's a valid data URL
        if (!imageData.startsWith('data:image/')) {
            throw new Error('Invalid image format - must be a data URL');
        }

        // Check supported formats
        const supportedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        const format = imageData.split(';')[0].replace('data:', '');

        if (!supportedFormats.includes(format)) {
            throw new Error(`Unsupported image format: ${format}`);
        }

        // Check approximate size (base64 is ~33% larger than binary)
        const base64Data = imageData.split(',')[1];
        if (!base64Data) {
            throw new Error('Invalid image data URL');
        }

        const approximateSize = (base64Data.length * 3) / 4;
        const maxSize = 20 * 1024 * 1024; // 20MB

        if (approximateSize > maxSize) {
            throw new Error('Image size exceeds maximum allowed (20MB)');
        }

        return true;
    }

    /**
     * Extract base64 data from data URL
     */
    static extractBase64(dataUrl) {
        if (!dataUrl.includes(',')) {
            throw new Error('Invalid data URL format');
        }
        return dataUrl.split(',')[1];
    }

    /**
     * Get media type from data URL
     */
    static getMediaType(dataUrl) {
        const match = dataUrl.match(/^data:(image\/[a-z]+);base64,/);
        if (!match) {
            return 'image/png'; // Default
        }
        return match[1];
    }

    /**
     * Resize image if needed (placeholder for future enhancement)
     */
    static async resizeIfNeeded(imageData, maxWidth = 2048, maxHeight = 2048) {
        // For now, just return the original image
        // In production, you might want to use sharp or jimp for resizing
        return imageData;
    }

    /**
     * Compress image (placeholder for future enhancement)
     */
    static async compress(imageData, quality = 0.8) {
        // For now, just return the original image
        // In production, you might want to use sharp or jimp for compression
        return imageData;
    }
}

module.exports = ImageProcessor;

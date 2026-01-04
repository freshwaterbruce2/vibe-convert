import { DocImage } from '../types';

/**
 * Pure function to determine which images should be processed.
 * Separating this logic allows for easy unit testing and prevents 
 * regression in selection behavior.
 */
export const filterActiveImages = (images: DocImage[], selectedIds: Set<string>): DocImage[] => {
  if (selectedIds.size === 0) {
    return images;
  }
  return images.filter(img => selectedIds.has(img.id));
};

/**
 * Validates and sanitizes a filename to prevent system errors.
 */
export const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9-_]/gi, '_').toLowerCase() || 'document';
};

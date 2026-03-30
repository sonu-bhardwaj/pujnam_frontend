// Utility function to generate placeholder image data URI
export const getPlaceholderImage = (width: number = 400, height: number = 400, text: string = 'Image'): string => {
  // Create a simple SVG placeholder as data URI
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Predefined placeholders for common use cases
export const placeholders = {
  product: getPlaceholderImage(400, 400, 'Product'),
  category: getPlaceholderImage(200, 200, 'Category'),
  small: getPlaceholderImage(80, 80, 'Image'),
  medium: getPlaceholderImage(200, 200, 'Image'),
  large: getPlaceholderImage(400, 400, 'Image'),
  xlarge: getPlaceholderImage(600, 600, 'Image'),
};

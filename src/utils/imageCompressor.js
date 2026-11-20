/**
 * Compresses and scales an image file in the browser using HTML5 Canvas.
 * Drastically reduces payload size (from 5-10 MB raw phone camera/screenshots down to 60-150 KB)
 * to stay safely within Vercel's strict 4.5 MB request ceiling and speed up mobile page loads.
 *
 * @param {File} file - Raw input File object
 * @param {number} maxWidth - Maximum bounding width
 * @param {number} maxHeight - Maximum bounding height
 * @param {number} quality - Quality compression ratio (0.0 to 1.0)
 * @returns {Promise<string>} Base64 Data URL
 */
export function compressImage(file, maxWidth = 1080, maxHeight = 1920, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Scale down proportionally if larger than maximum bounds
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Keep PNG format for logos/icons to preserve alpha transparency, JPEG for photos/screenshots
      const isIconWithTransparency = file.type === 'image/png' && width <= 512 && height <= 512;
      const outputType = isIconWithTransparency ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(outputType, quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to FileReader if Canvas parsing fails
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

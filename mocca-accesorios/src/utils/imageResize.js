/**
 * Redimensiona y comprime una imagen en el navegador antes de subirla,
 * para no gastar de más en almacenamiento ni hacer lento el catálogo.
 * Devuelve un Blob JPEG con el lado más largo limitado a maxDim.
 */
export function resizeImage(file, maxDim = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'))),
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen'));
    };

    img.src = objectUrl;
  });
}

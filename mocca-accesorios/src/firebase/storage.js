import { app } from './config.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const storage = getStorage(app);

/**
 * Sube una foto ya redimensionada (Blob) a Storage bajo productos/{codigo}/...
 * y devuelve { url, path }. Guarda siempre el path junto con la url en el
 * producto: lo necesitamos para poder borrar la foto de Storage más tarde.
 */
export async function uploadProductPhoto(codigo, blob, filename = 'foto.jpg') {
  const path = `productos/${codigo}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function deleteProductPhoto(path) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (err) {
    // Si ya no existe en Storage, no es un error real para el usuario.
    console.warn('No se pudo borrar la foto de Storage:', err);
  }
}

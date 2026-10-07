const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const MAX_DATA_URL_BYTES = 320_000;
const OUTPUT_WIDTH = 640;
const OUTPUT_HEIGHT = 480;

function cargarImagen(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const imagen = new Image();
    imagen.onload = () => {
      URL.revokeObjectURL(url);
      resolve(imagen);
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No pudimos leer la imagen seleccionada."));
    };
    imagen.src = url;
  });
}

export async function prepararImagenProducto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Elegí una imagen PNG o JPG.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('La imagen original no puede superar 5 MB.');
  }

  const imagen = await cargarImagen(file);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const contexto = canvas.getContext('2d');
  if (!contexto) throw new Error('El navegador no pudo procesar la imagen.');

  contexto.fillStyle = '#ffffff';
  contexto.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const escala = Math.max(OUTPUT_WIDTH / imagen.naturalWidth, OUTPUT_HEIGHT / imagen.naturalHeight);
  const ancho = imagen.naturalWidth * escala;
  const alto = imagen.naturalHeight * escala;
  contexto.drawImage(imagen, (OUTPUT_WIDTH - ancho) / 2, (OUTPUT_HEIGHT - alto) / 2, ancho, alto);

  for (const calidad of [0.84, 0.76, 0.68, 0.58]) {
    const dataUrl = canvas.toDataURL('image/jpeg', calidad);
    if (dataUrl.length <= MAX_DATA_URL_BYTES) return dataUrl;
  }

  throw new Error('La imagen sigue siendo demasiado pesada. Probá con otra de menor resolución.');
}

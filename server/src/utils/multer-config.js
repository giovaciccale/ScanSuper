import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Si necesitas "__dirname"
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'img/'); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para evitar conflictos
  },
});

// Filtro para validar el tipo de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const img = multer({ storage, fileFilter });

export default img;

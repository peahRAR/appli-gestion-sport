import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const multerOptions = {
  interceptor: FileInterceptor('file', {
    storage: memoryStorage(), // Utilisez memoryStorage ici
    limits: {
      fileSize: 3 * 1024 * 1024, // Limite de 3MB pour la taille du fichier
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new Error('Seuls les fichiers jpeg ou png sont autorisés!'),
          false,
        );
      }
      cb(null, true);
    },
  }),
};

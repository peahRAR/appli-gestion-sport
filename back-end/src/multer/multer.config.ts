import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions = {
  interceptor: FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 3 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(
          new Error('Seuls les fichiers jpeg, jpg ou png sont autorisés!'),
          false,
        );
      }
      cb(null, true);
    },
  }),
};

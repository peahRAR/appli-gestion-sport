import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsersGuard } from './users.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';


@Controller('users')
export class UsersController {
  // Créez une instance de Storage avec vos informations d'authentification
  private storage = new Storage({
    projectId: this.configService.get('PROJECT_ID'),
    keyFilename: this.configService.get('GOOGLE_APPLICATION_CREDENTIALS'), // Chemin vers votre fichier de clé d'authentification
  });

  // Définissez le nom de votre bucket GCS
  private bucketName = this.configService.get('BUCKET_NAME');

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  // Utilisez cette fonction pour uploader un fichier sur GCS
  private async uploadFileToGCS(
    file: Express.Multer.File,
    destination: string,
  ): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const fileUpload = bucket.file(destination);

    // Créez un stream à partir du fichier uploadé par Multer
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    // Retourne une promesse pour suivre le succès ou l'échec de l'upload
    return new Promise<string>((resolve, reject) => {
      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('finish', () => {
        const publicUrl = `https://${this.configService.get('PUBLIC_URL')}/${this.bucketName}/${destination}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer); // Envoie les données du fichier dans le stream
    });
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(UsersGuard)
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log(file);
    console.log(body);

    // Si un avatar est envoyé, uploadez-le sur GCS et mettez à jour l'URL de l'avatar dans les données de l'utilisateur
    if (file) {
      const destination = `avatars/${id}/avatar`;

      const avatarUrl = await this.uploadFileToGCS(file, destination);
      body.avatar = avatarUrl;
    }

    // Mettez à jour l'utilisateur dans la base de données
    return this.usersService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(UsersGuard)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

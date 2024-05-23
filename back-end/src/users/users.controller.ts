import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  UseGuards,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Storage } from '@google-cloud/storage';
import { multerOptions } from '../multer/multer.config';
import { Public } from 'src/decorators/public.decorator';
import { UserIdOradminRoleGuard } from './users.guard';
import { ListsMembersService } from 'src/lists-members/lists-members.service';
import { SecretsService } from 'src/secrets/secrets.service';
import { ResetPasswordDto } from './dto/reset-password.dto';



@Controller('users')
export class UsersController {
  // Créez une instance de Storage avec vos informations d'authentification
  private storage: Storage; 
  private bucketName: string;


  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ListsMembersService))
    private listsMembersService: ListsMembersService,
    private readonly secretsService: SecretsService,
  ) {
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    const projectId = await this.secretsService.getSecret('PROJECT_ID');
    const keyFilename = await this.secretsService.getSecret('GOOGLE_APPLICATION_CREDENTIALS');
    const bucketName = await this.secretsService.getSecret('BUCKET_NAME');

    this.storage = new Storage({
      projectId: projectId,
      keyFilename: keyFilename,
    });

    this.bucketName = bucketName;
  }

  // Utilisez cette fonction pour uploader un fichier sur GCS
  private async uploadFileToGCS(
    file: Express.Multer.File,
    destination: string,
  ): Promise<string> {
    console.log('UPLOAD');
    console.log(file);
    console.log(destination);
    const bucket = this.storage.bucket(this.bucketName);
    const fileUpload = bucket.file(destination);

    // Créez un stream à partir du fichier uploadé par Multer
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });
    console.log(file);
    // Retourne une promesse pour suivre le succès ou l'échec de l'upload
    return new Promise<string>((resolve, reject) => {
      stream.on('error', (err) => {
        reject(err);
        console.log(err);
      });

      stream.on('finish', () => {
        const publicUrl = `https://${this.secretsService.getSecret('PUBLIC_URL')}/${this.bucketName}/${destination}`;
        resolve(publicUrl);
      });

      if (file.buffer) {
        stream.end(file.buffer);
      } else {
        reject(new Error('Le buffer du fichier est vide.'));
      }
    });
  }

  async emptyGCSFolder(folderPath: string) {
    const storage = new Storage();
    const bucketName = await this.secretsService.getSecret('BUCKET_NAME');

    const options = {
      prefix: folderPath,
    };

    // Récupérez tous les fichiers dans le dossier
    const [files] = await storage.bucket(bucketName).getFiles(options);

    // Supprimez chaque fichier dans le dossier
    await Promise.all(files.map((file) => file.delete()));
  }

  // Creer User
  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log("CREATE")
    return this.usersService.create(createUserDto);
  }

  // Réinitialiser le mot de passe
  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    await this.usersService.resetPassword(token, newPassword);
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  // Liste des Users
  @Get()
  findAll() {
    console.log("find all")
    return this.usersService.findAll();
  }

  // Trouver un User
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log("find by id")
    return this.usersService.findOne(+id);
  }

  // Modifier un User
  @UseGuards(UserIdOradminRoleGuard)
  @Patch(':id')
  @UseInterceptors(multerOptions.interceptor)
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log('Fichier reçu:', file);
    if (!file) {
      console.log('Aucun fichier reçu.');
    } else {
      console.log('Type MIME du fichier:', file.mimetype);
      console.log('Taille du buffer:', file.buffer?.length);
    }
    let data;
    // On parse le body user pour récuperer un objet
    if (body.user) {
      data = JSON.parse(body.user);
    } else {
      data = body;
    }

    // Si un avatar est envoyé, uploadez-le sur GCS et mettez à jour l'URL de l'avatar dans les données de l'utilisateur
    if (file) {
      console.log('Fichier');
      console.log(file);
      const timestamp = Date.now(); // Obtenez le timestamp actuel
      const destination = `avatars/${id}/${timestamp}`;

      // Vider le dossier de l'utilisateur avant d'uploader la nouvelle image
      const userFolder = `avatars/${id}`;
      await this.emptyGCSFolder(userFolder);

      const avatarUrl = await this.uploadFileToGCS(file, destination);
      data.avatar = avatarUrl;
    }
    console.log(file);
    // Mettez à jour l'utilisateur dans la base de données
    return this.usersService.update(+id, data);
  }

  // Supprimer un User
  @UseGuards(UserIdOradminRoleGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Récupérer l'utilisateur à partir de la base de données pour obtenir le chemin de l'image
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const lists = await this.listsMembersService.findAllByIdUser(id);
    lists.forEach((element) => {
      this.listsMembersService.remove(element.eventId, element.userId);
    });

    // Vérifier si l'utilisateur a une photo avant de tenter de la supprimer
    if (user.avatar) {
      const avatarPath = `avatars/${id}`; // Chemin de l'image sur GCS
      await this.deleteFolderFromGCS(avatarPath);
    }

    // Supprimer l'utilisateur de la base de données
    return this.usersService.remove(+id);
  }

  private async deleteFolderFromGCS(folderPath: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);

    // Récupérer la liste des fichiers dans le dossier
    const [files] = await bucket.getFiles({
      prefix: folderPath,
    });

    // Supprimer chaque fichier dans le dossier
    await Promise.all(files.map((file) => file.delete()));

    // Supprimer le dossier lui-même
    await bucket.deleteFiles({
      prefix: folderPath,
    });
  }
}

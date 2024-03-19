import {
  Controller,
  Body,
  Post,
  Get,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private usersService: UsersService) {}

  @Post('login')
  async signIn(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.signIn(email, password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard) // Utiliser le guard JWT pour authentifier l'utilisateur
  getProfile(@Request() req) {
    // Récupérer les informations de l'utilisateur à partir du token JWT
    return req.user;
  }

  @Post('reset-password')
  requestPasswordReset(@Param('id') id: string) {
    return this.usersService.requestPasswordReset(id);
  }
}

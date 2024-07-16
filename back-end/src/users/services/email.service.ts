import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) { }

    async sendConfirmationEmail(email: string): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Confirmation de compte',
                template: 'confirmation',
                context: {
                    email,
                },
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email :', error);
            throw new InternalServerErrorException('Erreur lors de l\'envoi de l\'email.');
        }
    }

    async sendResetPasswordEmail(email: string, resetUrl: string): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Réinitialisation du mot de passe',
                template: 'reset-password',
                context: {
                    email,
                    resetUrl,
                },
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email :', error);
            throw new InternalServerErrorException('Erreur lors de l\'envoi de l\'email.');
        }
    }
}

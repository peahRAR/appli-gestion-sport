import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_RULE_MESSAGE } from '../../common/validators/password-policy';

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    @IsString()
    @Matches(PASSWORD_REGEX, { message: PASSWORD_RULE_MESSAGE })
    newPassword: string;
}

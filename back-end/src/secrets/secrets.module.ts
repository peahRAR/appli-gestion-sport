import { Module, Global } from '@nestjs/common';
import { SecretsService } from './secrets.service';

@Global()  // Making it global makes it available in all modules without needing to import explicitly
@Module({
    providers: [SecretsService],
    exports: [SecretsService],
})
export class SecretsModule { }
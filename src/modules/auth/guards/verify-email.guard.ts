import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
export const VerifyEmailGuard = NestAuthGuard('verify-email');

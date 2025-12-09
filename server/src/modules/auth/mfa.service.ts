import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MfaService {
    constructor(
        private usersService: UsersService,
        private prisma: PrismaService
    ) { }

    async generateMfaSecret(user: any) {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 'Antigravity ERP', secret);

        return {
            secret,
            otpauthUrl,
        };
    }

    async generateQrCode(otpauthUrl: string) {
        return toDataURL(otpauthUrl);
    }

    verifyMfaToken(token: string, secret: string) {
        return authenticator.verify({
            token,
            secret,
        });
    }

    async enableMfaForUser(userId: string, secret: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                mfaSecret: secret,
                isMfaEnabled: true,
            },
        });
    }
}

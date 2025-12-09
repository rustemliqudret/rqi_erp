import { Controller, Request, Post, UseGuards, Body, Get, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MfaService } from './mfa.service';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard'; // Assuming this exists or using AuthGuard('local')

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private mfaService: MfaService
    ) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req, @Res({ passthrough: true }) response: Response) {
        if (req.user.isMfaEnabled) {
            // Return early if MFA is enabled but not yet verified
            // In a real flow, we'd return a partial token or specific response code 
            // to prompt the frontend to ask for OTP.
            // For simplicity here, we return a flag.
            return { mfaRequired: true, userId: req.user.id };
        }

        const rememberMe = req.body.rememberMe === true;
        const { access_token, refresh_token, expiresIn } = await this.authService.login(req.user, rememberMe);

        const days = expiresIn === '30d' ? 30 : 7;
        const maxAge = days * 24 * 60 * 60 * 1000;

        response.cookie('Refresh', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: maxAge,
        });

        return { access_token };
    }

    @Post('mfa/verify')
    async verifyMfaLogin(@Body() body: { userId: string; token: string }, @Res({ passthrough: true }) response: Response) {
        // This is a simplified "step 2" login.
        // We need to fetch the user (we don't have req.user yet because not logged in).
        // This logic belongs in Service ideally, but putting here for brevity.
        const result = await this.authService.loginWithMfa(body.userId, body.token);

        const { access_token, refresh_token, expiresIn } = result;
        const days = expiresIn === '30d' ? 30 : 7;
        const maxAge = days * 24 * 60 * 60 * 1000;

        response.cookie('Refresh', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: maxAge,
        });
        return { access_token };
    }

    @Post('mfa/generate')
    @UseGuards(AuthGuard('jwt'))
    async generateMfa(@Request() req) {
        return this.mfaService.generateMfaSecret(req.user);
    }

    @Post('mfa/enable')
    @UseGuards(AuthGuard('jwt'))
    async enableMfa(@Request() req, @Body() body: { token: string; secret: string }) {
        const isValid = this.mfaService.verifyMfaToken(body.token, body.secret);
        if (!isValid) {
            throw new UnauthorizedException('Invalid Token');
        }
        await this.mfaService.enableMfaForUser(req.user.userId, body.secret);
        return { message: 'MFA Enabled' };
    }

    @Post('register')
    async register(@Body() createUserDto: Prisma.UserCreateInput) {
        return { message: 'Use UsersService to register' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}

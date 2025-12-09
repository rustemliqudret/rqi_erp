import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AccessControlGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.id) {
            return true; // Allow if no user (AuthGuard handles authentication)
        }

        // Fetch Access Policies
        const policy = await this.prisma.accessPolicy.findFirst({
            where: { userId: user.id },
        });

        if (!policy) {
            return true; // No restrictions
        }

        const now = new Date();
        const dayOfWeek = now.getDay(); // 0-6
        const currentHour = now.getHours();
        const clientIp = request.ip;

        // 1. Check Days
        if (policy.allowedDays.length > 0 && !policy.allowedDays.includes(dayOfWeek)) {
            throw new ForbiddenException('Access denied on this day of the week.');
        }

        // 2. Check Hours
        if (policy.allowedStartHour !== null && currentHour < policy.allowedStartHour) {
            throw new ForbiddenException(`Access allowed only after ${policy.allowedStartHour}:00.`);
        }

        if (policy.allowedEndHour !== null && currentHour >= policy.allowedEndHour) {
            throw new ForbiddenException(`Access allowed only before ${policy.allowedEndHour}:00.`);
        }

        // 3. Check IP
        if (policy.allowedIps.length > 0) {
            // Simple string match for CDIR/IP (in real app use ip-range-check)
            // For matching exact IPs:
            if (!policy.allowedIps.includes(clientIp)) {
                throw new ForbiddenException('Access denied from this IP address.');
            }
        }

        return true;
    }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, user, ip } = req;

        // Only log mutations (POST, PUT, PATCH, DELETE) to avoid noise
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle().pipe(
                tap(async () => {
                    if (user) {
                        await this.auditService.logAction({
                            userId: user.userId, // JWT payload has userId
                            action: method,
                            module: url.split('/')[2] || 'unknown', // /api/users -> users
                            method: method,
                            endpoint: url,
                            tenantId: user.tenantId, // From JWT or Middleware
                            branchId: null, // TODO: Extract if available
                            ipAddress: ip,
                            details: req.body, // Log payload (be careful with passwords!)
                        });
                    }
                }),
            );
        }

        return next.handle();
    }
}

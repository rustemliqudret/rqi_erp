import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tenant.findMany();
    }

    async findOne(id: string) {
        return this.prisma.tenant.findUnique({
            where: { id },
        });
    }

    async create(data: any) {
        return this.prisma.tenant.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.prisma.tenant.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.tenant.delete({
            where: { id },
        });
    }
}

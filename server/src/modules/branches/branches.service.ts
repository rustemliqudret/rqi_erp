import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class BranchesService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.branch.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.branch.findMany();
    }

    async findOne(id: string) {
        return this.prisma.branch.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.branch.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.branch.delete({
            where: { id },
        });
    }
}

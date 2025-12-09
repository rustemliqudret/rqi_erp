import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assume this exists or will be created
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() createUserDto: any) {
        // In a real scenario, we extract tenantId from the user's JWT (request.user)
        // For now, we assume the DTO might contain it, or we rely on the Service to handle it.
        // If the user is a Tenant Admin, we would force the tenantId.
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return "This action returns all users (filtered by tenant)";
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }
}

import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post()
    create(@Body() createTenantDto: any) {
        return this.tenantsService.create(createTenantDto);
    }

    @Get()
    findAll() {
        return this.tenantsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tenantsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTenantDto: any) {
        return this.tenantsService.update(id, updateTenantDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tenantsService.remove(id);
    }
}

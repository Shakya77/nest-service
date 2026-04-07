import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowedRoles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Request() req) {
    return await this.usersService.getMe(req.user.id);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('staff')
  async listStaff() {
    return await this.usersService.listStaff();
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return user;
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch('/:role/:id')
  async changeStatus(
    @Param('id') id: string,
    @Param('role') role: string,
    @Body('isActive') isActive: boolean,
  ) {
    return await this.usersService.changeStatus(+id, role, isActive);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('staff')
  async createStaff(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createStaff(createUserDto);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('staff/:id')
  async getStaff(@Param('id') id: string) {
    return await this.usersService.getStaff(+id);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch('staff/:id')
  async updateStaff(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await   this.usersService.updateStaff(+id, updateUserDto);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('staff/:id')
  async deleteStaff(@Param('id') id: string) {
    return await this.usersService.deleteStaff(+id);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  async findAll(
    @Request() req,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('role') role: Roles,
  ) {
    const userId = req.user.id;
    return await this.usersService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      role,
      userId,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(+id);
  }

  @Get('/customer')
  async getCustomer() {
    return await this.usersService.findCustomer();
  }
}

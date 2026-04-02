import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  Put,
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
  getMe(@Request() req) {
    return this.usersService.getMe(req.user.id);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('staff')
  listStaff() {
    return this.usersService.listStaff();
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return user;
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('staff')
  async createStaff(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createStaff(createUserDto);
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
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch('/:role/:id')
  async changeStatus(
    @Param('id') id: string,
    @Param('role') role: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.changeStatus(+id, role, isActive);
  }
}

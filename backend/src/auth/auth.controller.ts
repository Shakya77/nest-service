import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from './decorators/user-role.decorator';
import { AllowedRoles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: CreateUserDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req, @UserRole() role: string) {
    return {
      ...req.user,
      role,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('role')
  getRole(@UserRole() role: string) {
    return { role };
  }

  @AllowedRoles(Roles.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('admin-only')
  getAdminOnlyData(@Request() req) {
    return { message: 'Admin action allowed', user: req.user };
  }
}

import { SetMetadata } from '@nestjs/common';
import { Roles } from 'src/users/entities/user.entity';

// used to set the role in the metadata
export const ROLES_KEY = 'roles';
export const AllowedRoles = (...roles: Roles[]) =>
  SetMetadata(ROLES_KEY, roles);

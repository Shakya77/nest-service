import { createParamDecorator } from '@nestjs/common';

export const UserRole = createParamDecorator(
  (_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.role;
  },
);

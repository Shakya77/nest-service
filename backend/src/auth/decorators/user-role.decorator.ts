import { createParamDecorator } from '@nestjs/common';

// used to get the role from the request
export const UserRole = createParamDecorator((_data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user?.role;
});

import { Injectable } from '@nestjs/common';
import type { AuthProvider } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  create(data: {
    email: string;
    name: string;
    authProvider: AuthProvider;
    passwordHash?: string;
    googleId?: string;
  }) {
    return this.prisma.user.create({ data });
  }

  /** Returns the same shape as `GET /auth/me`: the user minus passwordHash. */
  updateSettings(userId: string, data: UpdateSettingsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      omit: { passwordHash: true },
    });
  }

  linkGoogleId(userId: string, googleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { googleId, authProvider: 'GOOGLE' },
    });
  }
}

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { isPrismaError } from '../prisma/prisma-errors';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10); // scramble the password
    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email.toLowerCase(), name: dto.name, passwordHash },
      });
      return this.buildAuthResponse(user);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    const passwordOk = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !passwordOk) {
      // same message for both cases, so attackers can't tell which part was wrong
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: { id: number; email: string; name: string; role: string }) {
    const token = this.jwt.sign({ sub: user.id, role: user.role }); // the wristband
    return {
      access_token: token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}

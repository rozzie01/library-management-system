import { ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GenresModule } from './genres/genres.module';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';

@Module({
imports: [
  ThrottlerModule.forRoot([
    {
      ttl: 60000,
      limit: 20,
    },
  ]),
  PrismaModule,
  AuthModule,
  GenresModule,
  BooksModule,
  UsersModule,
],  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


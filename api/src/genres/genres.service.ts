import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isPrismaError } from '../prisma/prisma-errors';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({ data: dto });
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new ConflictException('A genre with this name or slug already exists');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!genre) throw new NotFoundException(`Genre ${id} not found`);
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.findOne(id); // throws 404 if missing
    try {
      return await this.prisma.genre.update({ where: { id }, data: dto });
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new ConflictException('A genre with this name or slug already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.genre.delete({ where: { id } });
    } catch (error) {
      if (isPrismaError(error, 'P2003')) {
        throw new ConflictException('Cannot delete a genre that still has books');
      }
      throw error;
    }
  }
}

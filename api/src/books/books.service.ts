import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isPrismaError } from '../prisma/prisma-errors';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(genreId?: string, search?: string, page?: string, limit?: string) {
    if (genreId && Number.isNaN(Number(genreId))) {
      throw new BadRequestException('genreId must be a number');
    }

    // pagination: page 1 is the first page; limit is capped so nobody asks for 1,000,000 rows
    const currentPage = Math.max(Number(page) || 1, 1);
    const take = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (currentPage - 1) * take;

    // build the filter only from what the client actually sent
    const where: Prisma.BookWhereInput = {
      ...(genreId ? { genreId: Number(genreId) } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { author: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where, include: { genre: true }, orderBy: { title: 'asc' }, skip, take,
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: { total, page: currentPage, limit: take, totalPages: Math.ceil(total / take) },
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id }, include: { genre: true } });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async create(dto: CreateBookDto) {
    await this.ensureGenreExists(dto.genreId);
    try {
      return await this.prisma.book.create({
        data: { ...dto, availableCopies: dto.totalCopies }, // a new book starts fully available
        include: { genre: true },
      });
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new ConflictException('A book with this ISBN already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);
    if (dto.genreId !== undefined) await this.ensureGenreExists(dto.genreId);
    try {
      return await this.prisma.book.update({ where: { id }, data: dto, include: { genre: true } });
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new ConflictException('A book with this ISBN already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }

  private async ensureGenreExists(genreId: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id: genreId } });
    if (!genre) throw new BadRequestException(`Genre ${genreId} does not exist`);
  }
}
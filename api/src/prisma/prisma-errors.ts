import { Prisma } from '@prisma/client';

// P2002 = unique value already exists, P2003 = foreign key blocks the action
export function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}
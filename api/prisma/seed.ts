import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genres = [
  { name: 'Fiction', slug: 'fiction' },
  { name: 'Science', slug: 'science' },
  { name: 'History', slug: 'history' },
  { name: 'Technology', slug: 'technology' },
];

const books = [
  // Fiction
  { title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9780000000001', genre: 'fiction' },
  { title: 'Weep Not, Child', author: 'Ngũgĩ wa Thiong’o', isbn: '9780000000002', genre: 'fiction' },
  { title: 'Petals of Blood', author: 'Ngũgĩ wa Thiong’o', isbn: '9780000000003', genre: 'fiction' },
  { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', isbn: '9780000000004', genre: 'fiction' },
  // Science
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780000000005', genre: 'science' },
  { title: 'Cosmos', author: 'Carl Sagan', isbn: '9780000000006', genre: 'science' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '9780000000007', genre: 'science' },
  { title: 'Silent Spring', author: 'Rachel Carson', isbn: '9780000000008', genre: 'science' },
  // History
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780000000009', genre: 'history' },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780000000010', genre: 'history' },
  { title: 'Long Walk to Freedom', author: 'Nelson Mandela', isbn: '9780000000011', genre: 'history' },
  { title: 'The Fall of the Roman Empire', author: 'Peter Heather', isbn: '9780000000012', genre: 'history' },
  // Technology
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780000000013', genre: 'technology' },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780000000014', genre: 'technology' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9780000000015', genre: 'technology' },
  { title: 'The Phoenix Project', author: 'Gene Kim', isbn: '9780000000016', genre: 'technology' },
];

async function main() {
  // 1. Create genres first (books need them to exist)
  for (const g of genres) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
  }

  // 2. Create books, linking each to its genre
  for (const b of books) {
    const genre = await prisma.genre.findUniqueOrThrow({ where: { slug: b.genre } });
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        totalCopies: 3,
        availableCopies: 3,
        genreId: genre.id,
      },
    });
  }

  console.log('Seeded 4 genres and 16 books');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
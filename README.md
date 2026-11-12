# Library Management System

A library system that keeps track of books, the genres they belong to, and the people who use the library (patrons and librarians).

## Schema Decisions

### Why Book references Genre instead of embedding it

Each book does not carry the full genre inside it. It only stores a small number called `genreId`, which points to a row in the Genre table. Think of it like a library card that says "see shelf 2" instead of rewriting everything about shelf 2 on every card.

- **No duplication:** The word "Fiction" is saved only once, in the Genre table. If we decide to rename it to "Fictional Works", we change one row and every book is updated. If we had copied the genre into every book, we would have to fix hundreds of books one by one.
- **Consistency:** The database checks the `genreId`. A book can only point to a genre that really exists. This stops mistakes like typing "Ficton" or "Fiction " (with an extra space) on one book, which would make the same genre look like two different ones.
- **Easy queries:** Because books and genres are linked, it is simple to ask "show me all the books in Science", or "show me every genre with its books".

### Why Role is an enum

An enum is a fixed list of allowed choices. A user's role can only be `PATRON` or `LIBRARIAN`, and nothing else. This means nobody can save a wrong or misspelled role such as "Libarian" or "admin123". New users start as `PATRON` by default, which is the safest choice because patrons have the fewest permissions.

### Embedding vs referencing

Embedding means copying data inside another record. This can make sense in a document database like MongoDB, where records are flexible and the data is usually read together. In a relational database like PostgreSQL, embedding causes the same information to be repeated in many places, and over time the copies can end up different from each other. Referencing keeps one trusted copy and links to it, so the data stays clean.

## Prisma vs a Document Database

In Prisma, I had to describe the shape of my data and the links between tables first. For example, a Review must point to a real Book and a real User, and the database refuses anything else. In a document database like MongoDB, I would normally nest or copy the data, and the database would not stop me from saving mistakes. It felt stricter at the start, but it protects the data later.
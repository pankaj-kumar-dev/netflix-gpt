const { PrismaClient } = require("@prisma/client");

// Singleton — prevents multiple connections during nodemon hot-reloads
const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

module.exports = prisma;

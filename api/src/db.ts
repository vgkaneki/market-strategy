import * as PrismaClientModule from "@prisma/client";
import { Redis } from "ioredis";
import { config } from "./config.js";

const PrismaClient = (PrismaClientModule as any).PrismaClient as new () => any;

export const prisma = new PrismaClient();
export const redis = new Redis(config.REDIS_URL, {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 0
});

import { Queue } from 'bullmq';
import redis from './redis.js';

export const assignmentQueue = new Queue('assignment-generation', {
  connection: redis,
});

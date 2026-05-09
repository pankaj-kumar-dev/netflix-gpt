// BullMQ requires Redis. Queues disabled gracefully if REDIS_URL not set.
let embeddingQueue = null;

if (process.env.REDIS_URL) {
  const { Queue } = require("bullmq");
  embeddingQueue = new Queue("embeddings", {
    connection: { url: process.env.REDIS_URL },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
  console.log("Embedding queue initialized");
}

module.exports = { embeddingQueue };

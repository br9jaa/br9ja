'use strict';

const fs = require('fs');
const path = require('path');

const { MongoMemoryReplSet } = require('mongodb-memory-server');

const outputPath = path.join('/tmp', 'br9-dev-mongo-uri.txt');

async function main() {
  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });

  const uri = replSet.getUri();
  fs.writeFileSync(outputPath, uri, 'utf8');
  console.log(uri);

  const shutdown = async () => {
    try {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    } catch (_) {
      // Best-effort cleanup only.
    }
    await replSet.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

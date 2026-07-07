import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

async function main() {
  try {
    await prisma.$connect();
    console.log("Conected to the database successfully!");
    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

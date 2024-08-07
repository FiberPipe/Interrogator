const fs = require("fs");

const inputFile = "data.json";
const outputFile = "current.json";
const batchSize = 1;
const totalLines = 560;
let currentLine = 0;

async function processBatch() {
  const data = await fs.promises.readFile(inputFile, "utf-8");
  const lines = data.split("\n");
  const batch = lines.slice(currentLine, currentLine + batchSize);

  if (batch.length > 0) {
    const batchContent = batch.join("\n") + "\n";
    await fs.promises.appendFile(outputFile, batchContent, "utf-8");
  }

  currentLine += batchSize;

  if (currentLine < totalLines) {
    setTimeout(processBatch, 1000);
  } else {
    console.log("Processing completed!");
  }
}

processBatch().catch((error) => {
  console.error("Error processing data:", error);
});

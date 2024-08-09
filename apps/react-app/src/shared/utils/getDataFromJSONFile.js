const fs = require("fs");

const readLastLinesFromFile = (filePath, lineCount) => {
  return new Promise((resolve, reject) => {
    const lines = [];
    let lineReader = require("readline").createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    lineReader.on("line", (line) => {
      lines.push(line);
      if (lines.length > lineCount) {
        lines.shift();
      }
    });

    lineReader.on("close", () => {
      resolve(lines.join("\n"));
    });

    lineReader.on("error", (err) => {
      reject(err);
    });
  });
};

console.log(
  await readLastLinesFromFile(
    "../../../../../packages/data-generator/current.txt",
    10
  )
);

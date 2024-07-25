const fs = require("fs");

const dataFilePath = "/Users/iani.kuli/Desktop/alg_v4/Sensors_Data/data.json";
const apiUrl = "https://fiberpipe-production-888c.up.railway.app/test";
// const apiUrl = "http://localhost:4000/test";

async function postData(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Response:", responseData);
  } catch (error) {
    console.error("Error sending POST request:", error);
  }
}

function readLastLinesFromFile(filePath, lineCount) {
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
}

async function convertDataToJSON(lastLines) {
  const modifiedData = lastLines.replace(/;/g, ",");
  const lines = modifiedData.split("\n");
  const processedLines = lines.map((line) => line.trim());
  return processedLines;
}
async function sendDataPeriodically() {
  try {
    const lastLines = await readLastLinesFromFile(dataFilePath, 20);
    const jsonLines = await convertDataToJSON(lastLines);

    const jsonArray = "[" + jsonLines + "]";
    await postData(apiUrl, jsonArray);

    console.log("Data sent successfully.");
  } catch (error) {
    console.error("Error processing data:", error);
  }
}

setInterval(sendDataPeriodically, 100);
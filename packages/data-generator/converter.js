const fs = require("fs");

const inputFile = "data.json";
const outputFile = "data.json";

async function processFile() {
  try {
    // Чтение содержимого файла A
    const data = await fs.promises.readFile(inputFile, "utf-8");

    // Замена всех ";" на ","
    const modifiedData = data.replace(/;/g, ",");

    // Разбиение содержимого на строки
    const lines = modifiedData.split("\n");

    // Преобразование каждой строки: добавление "," в конец
    const processedLines = lines.map((line) => line.trim() + ",");

    // Соединение строк обратно в одну строку
    const outputContent = processedLines.join("\n");

    // Запись обработанного содержимого в файл B
    await fs.promises.writeFile(outputFile, outputContent, "utf-8");

    console.log(`File ${outputFile} successfully created.`);
  } catch (error) {
    console.error("Error processing file:", error);
  }
}

processFile();

import * as fs from "fs";
import * as path from "path";

const dataFilePath = path.join(__dirname, "data.json");

export const saveData = (data: any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

export const loadData = (): any => {
  if (fs.existsSync(dataFilePath)) {
    const rawData = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(rawData);
  }
  return null;
};

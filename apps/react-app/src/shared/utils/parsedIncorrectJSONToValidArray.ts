import { TData } from "../types";

export const convertDataToJSON = (lastLines: string) => {
    const modifiedData = lastLines.replace(/;/g, ",");
    const lines = modifiedData.split("\n");
  
    const processedLines: TData[] = lines.map((line: string) => JSON.parse(line));
  
    return processedLines;
  }
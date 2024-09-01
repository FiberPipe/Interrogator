import {TData} from "../types";

export const convertDataToJSON = (lastLines: string) => {
    const modifiedData = lastLines.replace(/;/g, ",");
    const lines = modifiedData.split("\n");

    const processedLines: TData[] = lines.flatMap((line: string) => {
      const correctLine = makeKeysValidJSON(line)

      if(correctLine.length === 0){
       return []
      }

      return JSON.parse(correctLine);
    });

    return processedLines;
}

function makeKeysValidJSON(str: string) {
 const regex = /([{,]\s*)([a-zA-Z0-9_]+)\s*:/g;
 return str.replace(regex, '$1"$2":');
}

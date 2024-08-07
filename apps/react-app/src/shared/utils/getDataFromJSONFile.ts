export const readLastLinesFromFile = (
  file: File,
  lineCount: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const lines = (reader.result as string).split("\n");
      const lastLines = lines.slice(-lineCount).join("\n");
      resolve(lastLines);
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsText(file);
  });
};

export type OutputRecord = {
  name: string;
  [key: string]: number | string | undefined;
};

export type ProcessedData = {
  uniqueIds: string[];    
  resultData: OutputRecord[];
};

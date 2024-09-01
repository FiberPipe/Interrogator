export type OutputRecord = {
    name: string;
    [key: number]: number | undefined;
};

export type ProcessedData = {
    uniqueIds: number[];
    resultData: OutputRecord[];
};
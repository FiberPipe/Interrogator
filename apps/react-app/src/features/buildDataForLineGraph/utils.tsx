import { TData, TTransformedData } from "../../shared";

export const transformData = (data: TData[]): { resultData: any[], uniqueIds: number[] } => {
  const groupedData: { [key: string]: { [key: number]: number } } = {};
  const uniqueIds: number[] = [];

  data.forEach((item) => {
    // Collect unique IDs
    if (!uniqueIds.includes(item.id)) {
      uniqueIds.push(item.id);
    }

    // Group data by time
    if (!groupedData[item.time]) {
      groupedData[item.time] = {};
    }
    groupedData[item.time][item.id] = item.wavelength; // Using wavelength as an example data
  });

  // Transform grouped data into desired format
  const resultData = Object.keys(groupedData).map((time) => ({
    name: time,
    ...groupedData[time],
  }));

  return { resultData, uniqueIds };
};
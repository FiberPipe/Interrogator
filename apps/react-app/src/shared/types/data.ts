export type PowerFields = {
  [key: `P${number}`]: number | undefined;
};

export type StdDevFields = {
  [key: `stdDev${number}`]: number | undefined;
};

export type WavelengthFields = {
  [key: `wavelength${number}`]: number | undefined;
};

export type BaseFields = {
  id_record: number;
  time: string;
};

export type ReceivedData = BaseFields & PowerFields & StdDevFields & WavelengthFields;

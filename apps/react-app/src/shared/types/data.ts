export type TData = {
  id_record: number;
  id_sensor: number;
  time: string;
  wavelength: number;
  displacement: number;
  Pn: number;
  Pn_plus_1: number;
};

export type TTransformedData = {
  name: string;
  [key: string]: string | number;
};

export type TBarGraphTransformedData = {
  name: string | number;
  value: number;
};

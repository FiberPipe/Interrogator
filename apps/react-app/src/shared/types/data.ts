export type TData = {
  id: number;
  time: string;
  wavelength: number;
  displacement: number;
  potPin1: number;
  potPin2: number;
};

export type TTransformedData = {
  name: string;
  [key: string]: string | number;
};

export type TBarGraphTransformedData = {
  name: string | number;
  value: number;
};

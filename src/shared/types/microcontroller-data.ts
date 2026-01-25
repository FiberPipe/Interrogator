export interface RowData extends Power, Deviation {
  id: string;
  time: string;
  normalized: NormalizedPower;
  wavelengths: Wavelength;
}

export interface Power {
  [key: `P${number}`]: number;
}

export interface Deviation {
  [key: `P${number}`]: number;
}

export interface Wavelength {
  [key: `wavelength${number}`]: number;
}

export interface NormalizedPower extends Power {}

export interface RowData extends Power, Deviation {
  id: string;
  time: string;
}

export interface Power{
  [key: `P${number}`]: number;
}

export interface Deviation {
  [key: `P${number}`]: number;
}

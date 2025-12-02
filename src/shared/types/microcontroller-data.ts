interface IdPower {
  id: string;
}

export interface Power extends IdPower {
  [key: `P${number}`]: number;
}

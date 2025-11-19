export {};

declare global {
  interface Window {
    portPicker: {
      list: () => Promise<Array<{
        path: string;
        manufacturer?: string;
        serialNumber?: string;
        vendorId?: string;
        productId?: string;
        friendlyName?: string;
      }>>;
      choose: (p: string) => Promise<void>;
      cancel: () => Promise<void>;
    };
  }
}

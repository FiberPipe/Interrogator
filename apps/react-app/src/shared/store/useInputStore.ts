import create from "zustand";

type InputValues = {
  [key: string]: string;
};

type Store = {
  inputValues: InputValues;
  updateInputValue: (key: string, value: string) => void;
};

export const useInputStore = create<Store>((set) => ({
  inputValues: {},
  updateInputValue: (key, value) =>
    set((state) => ({
      inputValues: {
        ...state.inputValues,
        [key]: value,
      },
    })),
}));

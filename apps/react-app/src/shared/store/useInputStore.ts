import create from "zustand";

type InputStore = {
  inputValues: { [key: string]: string };
  updateInputValue: (key: string, value: string) => void;
  initializeInputValues: (initialValues: { [key: string]: string }) => void;
};

export const useInputStore = create<InputStore>((set) => ({
  inputValues: {},
  updateInputValue: (key, value) =>
    set((state) => ({
      inputValues: { ...state.inputValues, [key]: value },
    })),
  initializeInputValues: (initialValues) => {
    console.log("Initial values:", initialValues); // Добавим отладочный вывод
    set({ inputValues: initialValues });
  },
}));
"use client";

import { useEffect } from "react";
import { useInputStore } from "../../shared";

export const useInputs = () => {
  const { inputValues, updateInputValue, initializeInputValues } = useInputStore();

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputs = await window.electron.getInputs();
        initializeInputValues(inputs);
      } catch (err) {
        console.error("Failed to load inputs", err);
      }
    };
    fetchInputs();
  }, [initializeInputValues]);

  const handleInputChange = async (key: string, value: string) => {
    updateInputValue(key, value);
    await window.electron.insertInput(key, value);
  };

  return { inputValues, handleInputChange };
};

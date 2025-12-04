import { addToast } from '@heroui/react';

export const addDangerToaster = (title: string, description: string) =>
  addToast({
    title,
    description,
    radius: 'sm',
    timeout: 3000,
    color: 'danger',
  });

export const addSuccessToaster = (title: string, description: string) =>
  addToast({
    title: title,
    description,
    radius: 'sm',
    timeout: 3000,
    color: 'success',
  });

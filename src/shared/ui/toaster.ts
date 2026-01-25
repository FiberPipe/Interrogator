/* eslint-disable no-console */
import { addToast } from '@heroui/react';

function formatDescription(desc: unknown): string {
  try {
    if (typeof desc === 'string') {
      try {
        const parsed = JSON.parse(desc);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return desc;
      }
    } else {
      return JSON.stringify(desc, null, 2);
    }
  } catch {
    return String(desc);
  }
}

async function sendToBackend(title: string, description: string, type: 'danger' | 'success') {
  try {
    await fetch('/api/frontend-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `[Frontend][${type.toUpperCase()}] ${title} - ${description}`,
        level: type,
      }),
    });
  } catch (err) {
    console.error('[Toaster] Failed to send log to backend:', err);
  }
}

type ToasterOptions = { showToast?: boolean };

export const addDangerToaster = (...args: unknown[]) => {
  let options: ToasterOptions = { showToast: true };

  // Если последний аргумент объект с showToast, вытаскиваем его
  const lastArg = args[args.length - 1];
  if (typeof lastArg === 'object' && lastArg !== null && 'showToast' in lastArg) {
    options = args.pop() as ToasterOptions;
  }

  const title = typeof args[0] === 'string' ? args[0] : 'Error';
  const description = args.slice(1).map(formatDescription).join(' ');

  console.error('[Toaster][DANGER]', title, description);

  if (options.showToast) {
    // addToast({
    //   title,
    //   description,
    //   radius: 'sm',
    //   timeout: 3000,
    //   color: 'danger',
    // });
  }

  sendToBackend(title, description, 'danger');
};

export const addSuccessToaster = (...args: unknown[]) => {
  let options: ToasterOptions = { showToast: true };

  const lastArg = args[args.length - 1];
  if (typeof lastArg === 'object' && lastArg !== null && 'showToast' in lastArg) {
    options = args.pop() as ToasterOptions;
  }

  const title = typeof args[0] === 'string' ? args[0] : 'Success';
  const description = args.slice(1).map(formatDescription).join(' ');

  console.log('[Toaster][SUCCESS]', title, description);

  if (options.showToast) {
    // addToast({
    //   title,
    //   description,
    //   radius: 'sm',
    //   timeout: 3000,
    //   color: 'success',
    // });
  }

  sendToBackend(title, description, 'success');
};

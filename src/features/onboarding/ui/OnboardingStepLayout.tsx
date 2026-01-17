import { ReactNode } from 'react';

export function OnboardingStepLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl px-2">
        {children}
      </div>
    </div>
  );
}

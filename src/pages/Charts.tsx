import { useState } from 'react';
import { Button } from '@heroui/react';

import {
  PowerChartWidget,
  PressureChartWidget,
  TemperatureChartWidget,
  WavelengthChartWidget,
} from '../widgets';

export const Charts = () => {
  const [activeSubTab, setActiveSubTab] = useState<'P' | 'Pressure' | 'Temperature' | 'Wavelength'>(
    'P',
  );

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <div className="flex gap-2 border-b border-default-200 pb-2">
        <Button
          variant={activeSubTab === 'P' ? 'solid' : 'flat'}
          onPress={() => setActiveSubTab('P')}
        >
          Power
        </Button>
        <Button
          variant={activeSubTab === 'Pressure' ? 'solid' : 'flat'}
          onPress={() => setActiveSubTab('Pressure')}
        >
          Pressure
        </Button>
        <Button
          variant={activeSubTab === 'Temperature' ? 'solid' : 'flat'}
          onPress={() => setActiveSubTab('Temperature')}
        >
          Temperature
        </Button>
        <Button
          variant={activeSubTab === 'Wavelength' ? 'solid' : 'flat'}
          onPress={() => setActiveSubTab('Wavelength')}
        >
          Wavelength
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {activeSubTab === 'P' && <PowerChartWidget />}
        {activeSubTab === 'Pressure' && <PressureChartWidget />}
        {activeSubTab === 'Temperature' && <TemperatureChartWidget />}
        {activeSubTab === 'Wavelength' && <WavelengthChartWidget />}
      </div>
    </div>
  );
};

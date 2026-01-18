import { useState, useEffect, useCallback } from 'react';

export const useTemperatureCoefficients = (sensorIndex: number) => {
    const [coefficients, setCoefficients] = useState({
        lambda0: 0,
        E: 0,
        D: 0,
        C: 0,
        B: 0,
        A: 0,
    });

    // Загрузка из appData
    useEffect(() => {
        const loadCoefficients = async () => {
            const data = await window.appData.getAll();
            const tempCoeffs = data?.[`temperatureCoefficients_${sensorIndex}`];

            if (tempCoeffs) {
                setCoefficients(tempCoeffs);
            }
        };

        loadCoefficients();
    }, [sensorIndex]);

    // Сохранение
    const saveCoefficients = useCallback(
        async (newCoeffs: typeof coefficients) => {
            setCoefficients(newCoeffs);
            await window.appData.set(`temperatureCoefficients_${sensorIndex}`, newCoeffs);
        },
        [sensorIndex]
    );

    return {
        coefficients,
        saveCoefficients,
    };
};

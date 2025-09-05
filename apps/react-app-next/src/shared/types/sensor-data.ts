export interface SensorData {
    idRecord: number,
    idSensor: number,
    time: string,
    systemTime: string,
    wavelength: number,
    P: number[],
    stdDev: number[],
}
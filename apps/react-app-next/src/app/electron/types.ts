export interface SensorData {
    idRecord: number,
    idSensor: number,
    time: string,
    systemTime: string,
    P: number[],
    stdDev: number[],
}
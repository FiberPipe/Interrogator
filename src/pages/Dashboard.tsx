import { DashboardWidget } from "../widgets/Dashboard"
import { mockSensorData } from "../widgets/Dashboard/model/mock"

export const DashboardPage = () => {
    return (<DashboardWidget data={mockSensorData}/>)
}
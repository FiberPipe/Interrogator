import { DataFilePathModal } from '../../widgets/DataFilePathModal';
import { PythonScriptManager } from '../../widgets/PythonScriptManager';

export const Settings = () => {
    return (
        <div className="p-4 space-y-4">
            <DataFilePathModal />

            {/* <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Python Scripts</h2>
                <PythonScriptManager
                    scriptName="Data Processing Script"
                    scriptKey="pythonScript1Path"
                />
                <PythonScriptManager
                    scriptName="Analysis Script"
                    scriptKey="pythonScript2Path"
                />
            </div> */}
        </div>
    );
};

import { TextInput } from "@gravity-ui/uikit"
import { useState } from "react";
import { Text } from "recharts"

export const DisplacementCoefficient = () => {
    const [amplifierOffset, setAmplifierOffset] = useState(0);
    return (
        <div>
            <Text className="mb-1">Коэффициент смещения (КС) ТИА</Text>
            <TextInput
                id="amplifier-offset"
                type="number"
                placeholder="0"
                value={amplifierOffset.toString()}
                onChange={(e) => setAmplifierOffset(Number(e.target.value))}
                disabled={false}
            />
        </div>
    )
}
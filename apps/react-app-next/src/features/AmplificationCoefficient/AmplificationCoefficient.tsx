import { TextInput } from "@gravity-ui/uikit"
import { useState } from "react";
import { Text } from "@gravity-ui/uikit";

export const AmplificationCoefficient = () => {
    const [amplifierGain, setAmplifierGain] = useState(1);

    return (
        <div>
            <Text className="mb-1">Коэффициент усиления (КУ) ТИА</Text>
            <TextInput
                id="amplifier-gain"
                type="number"
                placeholder="1.0"
                value={amplifierGain.toString()}
                onChange={(e) => setAmplifierGain(Number(e.target.value))}
                disabled={false}
                rightContent={<Text variant="body-3">x</Text>}
            />
        </div>
    )
}
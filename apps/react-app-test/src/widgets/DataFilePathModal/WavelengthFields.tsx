import React from "react";
import { Card, CardBody, CardHeader, Divider, Input } from "@nextui-org/react";

interface WavelengthFieldsProps {
	values: string[];
	onChange: (newValues: string[]) => void;
}

export const WavelengthFields: React.FC<WavelengthFieldsProps> = ({
	values,
	onChange,
}) => {
	const handleChange = async (i: number, newVal: string) => {
		const newValues = [...values];
		newValues[i] = newVal;
		onChange(newValues);

		// сразу пишем в inputs.json
		await window.electron.insertInput(`lambdas_central${i}`, newVal);
	};

	return (
		<Card className="w-[600px]">
			<CardHeader>Длины волн</CardHeader>
			<Divider />
			<CardBody className="grid grid-cols-2 gap-4">
				{values.map((val, i) => (
					<Input
						key={i}
						type="number"
						label={`λ${i}`}
						placeholder={`Введите λ${i}`}
						value={val}
						onChange={(e) => handleChange(i, e.target.value)}
					/>
				))}
			</CardBody>
		</Card>
	);
};

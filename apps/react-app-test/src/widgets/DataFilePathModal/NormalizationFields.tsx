import React from "react";
import { Card, CardBody, CardHeader, Divider, Input } from "@nextui-org/react";

interface NormalizationFieldsProps {
	values: string[];
	onChange: (newValues: string[]) => void;
}

export const NormalizationFields: React.FC<NormalizationFieldsProps> = ({
	values,
	onChange,
}) => {
	const handleChange = async (i: number, newVal: string) => {
		const newValues = [...values];
		newValues[i] = newVal;
		onChange(newValues);

		// сразу пишем в inputs.json
		await window.electron.insertInput(`field${i + 1}`, newVal);
	};

	return (
		<Card className="w-[600px]">
			<CardHeader>Нормализация</CardHeader>
			<Divider />
			<CardBody className="grid grid-cols-2 gap-4">
				{values.map((val, i) => (
					<Input
						key={i}
						type="number"
						label={`Поле ${i + 1}`}
						placeholder={`Введите значение ${i + 1}`}
						value={val}
						onChange={(e) => handleChange(i, e.target.value)}
					/>
				))}
			</CardBody>
		</Card>
	);
};

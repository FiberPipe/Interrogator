import { Flex, TextInput, Text, Button } from "@gravity-ui/uikit"
import block from 'bem-cn-lite';

const b = block('settings-form');

interface ValueField {
    name: string;
    disabled?: boolean;
    placeholder?: string;
    type: "email" | "number" | "password" | "search" | "tel" | "text" | "url";
}

interface ValueListProps {
    valuesList: ValueField[];
    onSubmit: (formData: FormData) => void | Promise<void>;
}

export const Form = ({ valuesList, onSubmit }: ValueListProps) => {
    return (
        <form action={onSubmit} className={b('form')}>
            {valuesList.map(({ name, disabled, placeholder, type }: ValueField) => (
                <Flex key={name} direction={"row"}>
                    <Text variant={"body-2"} color={"secondary"}>{name}</Text>
                    <TextInput
                        placeholder={placeholder}
                        disabled={disabled}
                        name={name}
                        hasClear={true}
                        type={type}
                    />
                </Flex>
            ))}

            <Button
                view="action"
                type="submit"
                loading={false}
            >
                Подключиться
            </Button>
        </form>
    )
}
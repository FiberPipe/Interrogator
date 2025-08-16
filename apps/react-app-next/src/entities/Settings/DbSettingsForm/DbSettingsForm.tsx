import { Flex, TextInput, Text, Button, Loader } from "@gravity-ui/uikit"

interface ValueField {
    name: string;
    disabled?: boolean;
    placeholder?: string;
}

interface ValueListProps {
    valuesList: ValueField[];
    onSubmit: (e: SubmitEvent) => void;
}

export const DbSettingsForm = ({ valuesList }: ValueListProps) => {
    return (
        <form>
            {valuesList.map(({ name, disabled, placeholder }: ValueField) => (
                <Flex key={name} direction={"row"}>
                    <Text variant={"body-2"} color={"secondary"}>{name}</Text>
                    <TextInput
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                </Flex>
            ))}

            <Flex>
                <Button
                    view="action"
                >
                    {false ? <Loader size="s" /> : 'Подключиться'}
                </Button>
            </Flex>
        </form>
    )
}
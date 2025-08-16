import { Button, Flex } from "@gravity-ui/uikit"
import type { DetailedHTMLProps } from "react";

interface FileFormProps {
    controlProps: DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    triggerProps: {
        onClick: () => void;
    };
}

export const FileForm = ({ controlProps, triggerProps }: FileFormProps) => {
    return (
        <Flex direction="column">
            <input {...controlProps} />
            <Button {...triggerProps}>Upload</Button>
        </Flex>
    )
}
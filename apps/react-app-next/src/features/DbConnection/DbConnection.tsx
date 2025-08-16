import { DbSettingsLabel, Form } from "@entities/Settings"
import { useDbConnection } from "./useDbConnection";
import { Flex } from "@gravity-ui/uikit";


export const DbConnection = () => {
    const { status, connect, disconnect } = useDbConnection();

    return (
        <Flex direction={"column"}>
            <DbSettingsLabel dbStatus={status} />
            <Form valuesList={[
                { name: 'host', placeholder: "localhost", disabled: ['loading', "connected"].includes(status), type: "number" },
                { name: 'port', placeholder: "6432", disabled: ['loading', "connected"].includes(status), type: "number" },
                { name: 'db', placeholder: "db1", disabled: ['loading', "connected"].includes(status), type: "text" },
                { name: 'username', placeholder: "Имя пользователя", disabled: ['loading', "connected"].includes(status), type: "text" },
                { name: 'password', placeholder: "*****", disabled: ['loading', "connected"].includes(status), type: "password" },
            ]} onSubmit={connect} />
        </Flex>

    )
}
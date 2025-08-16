import { DbSettingsForm, DbSettingsLabel } from "@entities/Settings"
import { useDbConnection } from "./useDbConnection";
import { Flex } from "@gravity-ui/uikit";


export const DbConnection = () => {
    const { status, connect, disconnect } = useDbConnection();

    return (
        <Flex direction={"column"}>
            <DbSettingsLabel dbStatus={status}/>
            <DbSettingsForm valuesList={[
                { name: 'Хост', placeholder: "localhost", disabled: ['loading', "connected"].includes(status) },
                { name: 'Порт', placeholder: "6432", disabled: ['loading', "connected"].includes(status) },
                { name: 'База данных', placeholder: "db1", disabled: ['loading', "connected"].includes(status) },
                { name: 'Имя пользователя', placeholder: "Имя пользователя", disabled: ['loading', "connected"].includes(status) },
                { name: 'Пароль', placeholder: "*****", disabled: ['loading', "connected"].includes(status) },
            ]} onSubmit={(e: SubmitEvent) => { e.stopPropagation(); connect(); }} />
        </Flex>

    )
}
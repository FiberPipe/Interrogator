import { Button, Flex, Icon, Text } from "@gravity-ui/uikit";
import { TriangleExclamation } from "@gravity-ui/icons";
import { useNavigate } from "react-router-dom";
import './NotFoundPage.scss';

import block from 'bem-cn-lite';

const b = block('not-found-page');

export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
            className={b()}
        >
            <Icon data={TriangleExclamation} size={64}/>

            <Text variant="display-2" color="secondary">
                404
            </Text>
            <Text variant="header-2">Страница не найдена</Text>
            <Text variant="body-2" color="secondary" className={b('text')}>
                К сожалению, такой страницы не существует.
                Возможно, вы ошиблись адресом или страница была удалена.
            </Text>

            <Button
                size="l"
                view="action"
                onClick={() => navigate("/")}
            >
                На главную
            </Button>
        </Flex>
    );
};

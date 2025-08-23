import { Flex } from '@gravity-ui/uikit';
import { InterrogatorLightManagement } from '@widgets/InterrogatorLightManagement';

export const InterrogatorSettings = () => {
    return (
        <Flex direction="column">
            <Flex>
                Доступные интеррогаторы
            </Flex>
            <InterrogatorLightManagement/>
        </Flex>
    );
};

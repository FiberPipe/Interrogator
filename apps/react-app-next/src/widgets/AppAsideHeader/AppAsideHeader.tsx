import { Text } from '@gravity-ui/uikit';
import { AntennaSignal, Bell, ChartBar, Display, Gear, SquareDashedText } from '@gravity-ui/icons';
import { AsideHeader } from '@gravity-ui/navigation';
import Logo from '@shared/assets/blue_logo_short.svg?url';
import block from "bem-cn-lite";
import './AppAsideHeader.scss';
import { useNavigate } from 'react-router-dom';


const LOGO = {
  iconSrc: Logo,
  text: 'FiberPipe',
  iconSize: 30,
  textSize: 16
}

const b = block('aside-header');

export const AppAsideHeader = () => {
  const navigate = useNavigate();

  return (
    <AsideHeader
      compact={true}
      logo={LOGO}
      hideCollapseButton={true}
      className={b()}
      menuItems={[
        {
          id: "monitoring",
          title: <Text>Мониторинг</Text>,
          icon: Display,
          onItemClick: () => { navigate('/monitoring') },
        },
        {
          id: "interrogator-setings",
          title: <Text>Настройка интеррогатора</Text>,
          icon: AntennaSignal,
          onItemClick: () => { navigate('/interrogator-settings') },
        },
        {
          id: "dashboard",
          title: <Text>Дашборды</Text>,
          icon: SquareDashedText,
          onItemClick: () => { },
        },
        {
          id: "charts",
          title: <Text>Графики</Text>,
          icon: ChartBar,
          onItemClick: () => { navigate('/charts') },
        },
        {
          id: "settings",
          title: <Text>Настройки</Text>,
          icon: Gear,
          onItemClick: () => { navigate('/settings') },
        },
        {
          id: "logs",
          title: <Text>Логи</Text>,
          icon: Bell,
          onItemClick: () => { navigate('/logs') },
        },
      ]}
    />
  )
}
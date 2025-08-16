import { TabProvider, TabList, Tab } from "@gravity-ui/uikit";
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export const SettingsHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const pathParts = location.pathname.split('/');
    const currentTab = pathParts[pathParts.length - 1];
    
    const validTabs = ['main', 'connection'];
    const initialTab = validTabs.includes(currentTab) ? currentTab : 'main';
    
    const handleTabUpdate = (newValue?: string) => {
        const basePath = validTabs.includes(currentTab) 
            ? location.pathname.slice(0, -currentTab.length - 1) 
            : location.pathname;
            
        navigate(`${basePath}/${newValue}`);
    };
    
    useEffect(() => {
        if (!validTabs.includes(currentTab)) {
            const basePath = location.pathname.endsWith('/') 
                ? location.pathname.slice(0, -1) 
                : location.pathname;
            navigate(`${basePath}/main`);
        }
    }, []);

    return (
        <TabProvider
            onUpdate={handleTabUpdate}
            value={initialTab}
        >
            <TabList>
                <Tab
                    title="Main"
                    value="main"
                >
                    База данных
                </Tab>
                <Tab
                    title="Connection"
                    value="connection"
                >
                    Файл (Устаревший)
                </Tab>
            </TabList>
        </TabProvider>
    )
}
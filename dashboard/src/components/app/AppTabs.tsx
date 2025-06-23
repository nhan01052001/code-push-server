import { Tabs, Box } from '@radix-ui/themes';
import AppList from './AppList';
import { App } from './AppCard';

interface AppTabsProps {
  allApps: App[];
  iosApps: App[];
  androidApps: App[];
  onAppClick: (appName: string) => void;
}

const AppTabs = ({ allApps, iosApps, androidApps, onAppClick }: AppTabsProps) => {
  return (
    <Tabs.Root defaultValue="all">
      <Tabs.List>
        <Tabs.Trigger value="all">Tất cả ({allApps.length})</Tabs.Trigger>
        <Tabs.Trigger value="ios">iOS ({iosApps.length})</Tabs.Trigger>
        <Tabs.Trigger value="android">Android ({androidApps.length})</Tabs.Trigger>
      </Tabs.List>

      <Box mt="4">
        <Tabs.Content value="all">
          <AppList 
            apps={allApps} 
            onAppClick={onAppClick} 
          />
        </Tabs.Content>

        <Tabs.Content value="ios">
          <AppList 
            apps={iosApps} 
            onAppClick={onAppClick} 
            emptyMessage="Không tìm thấy ứng dụng iOS nào." 
          />
        </Tabs.Content>

        <Tabs.Content value="android">
          <AppList 
            apps={androidApps} 
            onAppClick={onAppClick} 
            emptyMessage="Không tìm thấy ứng dụng Android nào." 
          />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
};

export default AppTabs; 
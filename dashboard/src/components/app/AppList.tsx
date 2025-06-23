import { Grid, Box, Text } from '@radix-ui/themes';
import AppCard, { App } from './AppCard';

interface AppListProps {
  apps: App[];
  onAppClick: (appName: string) => void;
  emptyMessage?: string;
}

const AppList = ({ apps, onAppClick, emptyMessage = "Không tìm thấy ứng dụng nào phù hợp." }: AppListProps) => {
  return (
    <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
      {apps.length > 0 ? (
        apps.map(app => <AppCard key={app.name} app={app} onClick={onAppClick} />)
      ) : (
        <Box style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
          <Text>{emptyMessage}</Text>
        </Box>
      )}
    </Grid>
  );
};

export default AppList; 
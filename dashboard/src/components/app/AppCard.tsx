import { Card, Flex, Heading, Badge, Text, Box } from '@radix-ui/themes';

export interface App {
  name: string;
  os?: string;
  platform?: string;
  collaborators: {
    [email: string]: {
      permission: string;
      isCurrentAccount?: boolean;
    }
  };
  deployments: string[];
  deploymentCount?: number;
}

interface AppCardProps {
  app: App;
  onClick: (appName: string) => void;
}

const AppCard = ({ app, onClick }: AppCardProps) => {
  return (
    <Card
      key={app.name}
      style={{ 
        width: '100%', 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onClick={() => onClick(app.name)}
      className="app-card"
    >
      <Flex direction="column" gap="2">
        <Flex justify="between" align="center">
          <Heading size="3">{app.name.replace('_IOS', '').replace('_Android', '')}</Heading>
          <Badge variant="soft" color={app.os === 'iOS' || app.name.includes('_IOS') ? 'blue' : 'green'}>
            {app.os || (app.name.includes('_IOS') ? 'iOS' : 'Android')}
          </Badge>
        </Flex>
        
        <Flex gap="3" mt="1">
          <Text size="1" color="gray">
            <strong>Deployments:</strong> {app.deployments.length}
          </Text>
          
          <Text size="1" color="gray">
            <strong>Collaborators:</strong> {Object.keys(app.collaborators).length}
          </Text>
        </Flex>
        
        {app.deployments.length > 0 && (
          <Box mt="1">
            <Flex gap="1" wrap="wrap">
              {app.deployments.slice(0, 3).map(dep => (
                <Badge key={dep} size="1" variant="surface">
                  {dep}
                </Badge>
              ))}
              {app.deployments.length > 3 && (
                <Badge size="1" variant="surface">
                  +{app.deployments.length - 3}
                </Badge>
              )}
            </Flex>
          </Box>
        )}
      </Flex>
    </Card>
  );
};

export default AppCard; 
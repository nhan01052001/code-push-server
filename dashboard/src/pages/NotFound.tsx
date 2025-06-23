import { Link } from 'react-router-dom';
import { Flex, Heading, Text, Button } from '@radix-ui/themes';

const NotFound = () => {
  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      style={{ height: '100vh', padding: '2rem' }}
    >
      <Heading size="8" style={{ marginBottom: '1rem' }}>404</Heading>
      <Heading size="6" style={{ marginBottom: '2rem' }}>Trang không tồn tại</Heading>
      <Text size="3" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </Text>
      <Link to="/apps">
        <Button size="3">Quay lại trang chính</Button>
      </Link>
    </Flex>
  );
};

export default NotFound; 
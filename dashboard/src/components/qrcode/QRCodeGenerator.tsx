import { useState } from 'react';
import { Box, Flex, Text, Button, Heading } from '@radix-ui/themes';

interface QRCodeGeneratorProps {
  username: string;
  password: string;
}

const QRCodeGenerator = ({ username, password }: QRCodeGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateQRCode = () => {
    if (!username || !password) return;
    
    setIsGenerating(true);
    
    // Giả lập việc tạo QR code
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };
  
  return (
    <Box style={{ padding: '2rem' }}>
      <Heading size="6" mb="4">Tạo QR Code</Heading>
      
      {username && password ? (
        <Flex direction="column" align="center" gap="4">
          <Box style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            border: '1px dashed var(--color-border)', 
            borderRadius: '8px',
            width: '100%',
            maxWidth: '400px'
          }}>
            {isGenerating ? (
              <Box style={{ 
                width: '200px', 
                height: '200px', 
                margin: '0 auto', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'var(--color-background)'
              }}>
                <Text>Đang tạo QR code...</Text>
              </Box>
            ) : (
              <>
                <Text size="3" mb="4">Quét mã QR để đăng nhập</Text>
                <Box style={{ 
                  width: '200px', 
                  height: '200px', 
                  backgroundColor: 'var(--color-border)', 
                  margin: '0 auto', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Đây sẽ là nơi hiển thị QR code thật */}
                  <svg 
                    width="160" 
                    height="160" 
                    viewBox="0 0 160 160" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ 
                      backgroundColor: 'white',
                      padding: '10px'
                    }}
                  >
                    <rect x="20" y="20" width="20" height="20" fill="black" />
                    <rect x="40" y="20" width="20" height="20" fill="black" />
                    <rect x="60" y="20" width="20" height="20" fill="black" />
                    <rect x="100" y="20" width="20" height="20" fill="black" />
                    <rect x="120" y="20" width="20" height="20" fill="black" />
                    <rect x="20" y="40" width="20" height="20" fill="black" />
                    <rect x="100" y="40" width="20" height="20" fill="black" />
                    <rect x="20" y="60" width="20" height="20" fill="black" />
                    <rect x="60" y="60" width="20" height="20" fill="black" />
                    <rect x="100" y="60" width="20" height="20" fill="black" />
                    <rect x="20" y="100" width="20" height="20" fill="black" />
                    <rect x="40" y="100" width="20" height="20" fill="black" />
                    <rect x="60" y="100" width="20" height="20" fill="black" />
                    <rect x="80" y="100" width="20" height="20" fill="black" />
                    <rect x="120" y="100" width="20" height="20" fill="black" />
                    <rect x="20" y="120" width="20" height="20" fill="black" />
                    <rect x="80" y="120" width="20" height="20" fill="black" />
                    <rect x="120" y="120" width="20" height="20" fill="black" />
                  </svg>
                </Box>
              </>
            )}
          </Box>
          
          <Button 
            onClick={handleGenerateQRCode} 
            disabled={isGenerating || !username || !password}
            style={{ width: '200px' }}
          >
            {isGenerating ? 'Đang tạo...' : 'Tạo QR Code'}
          </Button>
          
          <Text size="2" color="gray">
            Thông tin đăng nhập: {username}
          </Text>
        </Flex>
      ) : (
        <Text>Vui lòng nhập thông tin đăng nhập ở panel bên trái để tạo mã QR</Text>
      )}
    </Box>
  );
};

export default QRCodeGenerator; 
import { Dialog, Text, Flex, TextField, Select, Button } from '@radix-ui/themes';
import { useState, useEffect } from 'react';

interface CreateAppData {
  name: string;
  os: string;
  platform: string;
}

interface CreateAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateApp: (appData: CreateAppData) => Promise<void>;
}

const CreateAppDialog = ({ open, onOpenChange, onCreateApp }: CreateAppDialogProps) => {
  const [newApp, setNewApp] = useState<CreateAppData>({ 
    name: '', 
    os: 'iOS', 
    platform: 'React-Native' 
  });
  
  // Sử dụng useEffect để reset form khi dialog đóng hoàn toàn
  useEffect(() => {
    if (!open) {
      // Chỉ reset form sau khi dialog đã đóng hoàn toàn
      const timeoutId = setTimeout(() => {
        setNewApp({ name: '', os: 'iOS', platform: 'React-Native' });
      }, 200); // Đợi animation đóng dialog hoàn tất

      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const handleCreateApp = async () => {
    try {
      await onCreateApp(newApp);
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi tạo ứng dụng:", error);
      alert("Có lỗi xảy ra khi tạo ứng dụng");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Tạo ứng dụng mới</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Điền thông tin để tạo ứng dụng mới
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Tên ứng dụng
            </Text>
            <TextField.Root
              placeholder="Nhập tên ứng dụng"
              value={newApp.name}
              onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Hệ điều hành
            </Text>
            <Select.Root 
              value={newApp.os}
              onValueChange={(value) => setNewApp({ ...newApp, os: value })}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="iOS">iOS</Select.Item>
                <Select.Item value="Android">Android</Select.Item>
                <Select.Item value="Windows">Windows</Select.Item>
              </Select.Content>
            </Select.Root>
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Nền tảng
            </Text>
            <Select.Root 
              value={newApp.platform}
              onValueChange={(value) => setNewApp({ ...newApp, platform: value })}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="React-Native">React Native</Select.Item>
                <Select.Item value="Cordova">Cordova</Select.Item>
              </Select.Content>
            </Select.Root>
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Hủy
            </Button>
          </Dialog.Close>
          <Button 
            onClick={handleCreateApp} 
            disabled={!newApp.name.trim()}
          >
            Tạo ứng dụng
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreateAppDialog; 
import { Dialog, Button, Flex, Box, TextField, Text } from "@radix-ui/themes";
import { useState, useEffect } from "react";

interface CreateDeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDeployment: (
    name: string
  ) => Promise<{ name: string; key: string } | void>;
}

const CreateDeploymentDialog = ({
  open,
  onOpenChange,
  onCreateDeployment,
}: CreateDeploymentDialogProps) => {
  const [newDeploymentName, setNewDeploymentName] = useState("");

  // Sử dụng useEffect để reset form khi dialog đóng hoàn toàn
  useEffect(() => {
    if (!open) {
      // Chỉ reset form sau khi dialog đã đóng hoàn toàn
      const timeoutId = setTimeout(() => {
        setNewDeploymentName("");
      }, 200); // Đợi animation đóng dialog hoàn tất

      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const handleCreateDeployment = async () => {
    if (!newDeploymentName.trim()) return;
    
    try {
      await onCreateDeployment(newDeploymentName.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi tạo deployment:", error);
      alert("Có lỗi xảy ra khi tạo deployment");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Tạo Deployment Mới</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Nhập tên cho deployment mới.
        </Dialog.Description>

        <Box mb="4">
          <Text as="div" size="2" mb="1" weight="bold">
            Tên Deployment
          </Text>
          <TextField.Root
            placeholder="Tên deployment (vd: Production)"
            value={newDeploymentName}
            onChange={(e) => setNewDeploymentName(e.target.value)}
          />
        </Box>

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Hủy
            </Button>
          </Dialog.Close>
          <Button
            onClick={handleCreateDeployment}
            disabled={!newDeploymentName.trim()}
          >
            Tạo
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreateDeploymentDialog;

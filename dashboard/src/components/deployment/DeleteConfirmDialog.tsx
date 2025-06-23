import { useState } from "react";
import { Dialog, Flex, Text, Button } from "@radix-ui/themes";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  itemName?: string;
  confirmButtonText?: string;
}

const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  itemName,
  confirmButtonText = "Xóa"
}: DeleteConfirmDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {description}
          {itemName && <strong> "{itemName}"</strong>}?
        </Dialog.Description>
        <Text size="2" mb="4" color="gray">
          Thao tác này không thể hoàn tác.
        </Text>

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" disabled={isLoading}>
              Hủy
            </Button>
          </Dialog.Close>
          <Button 
            color="red" 
            onClick={handleConfirm} 
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : confirmButtonText}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default DeleteConfirmDialog; 
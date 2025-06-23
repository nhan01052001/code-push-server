import { Dialog, Flex, Box, Text, Button, IconButton } from "@radix-ui/themes";
import { Cross1Icon, ClipboardCopyIcon } from "@radix-ui/react-icons";
import { showSuccessToast, showErrorToast } from "@/components";
import copy from "copy-to-clipboard";

interface DeploymentInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deploymentName: string;
  deploymentKey: string;
  isQuickDeployment?: boolean;
  iosDeploymentKey?: string;
}

const DeploymentInfoModal = ({
  open,
  onOpenChange,
  deploymentName,
  deploymentKey,
  isQuickDeployment = false,
  iosDeploymentKey = "",
}: DeploymentInfoModalProps) => {
  const handleCopyDeploymentKey = (key: string, type?: string) => {
    try {
      const success = copy(key);
      if (success) {
        showSuccessToast(`Đã copy key deployment${type ? ` ${type}` : ""}`);
      } else {
        showErrorToast("Không thể copy key. Vui lòng thử lại");
      }
    } catch (error) {
      showErrorToast("Không thể copy key. Vui lòng thử lại");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 500 }}>
        <Flex justify="between" align="center">
          <Dialog.Title>Deployment đã tạo thành công</Dialog.Title>
          <Dialog.Close>
            <IconButton size="1" variant="ghost">
              <Cross1Icon />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <Box mt="4">
          <Text as="div" size="2" mb="1" weight="bold">
            Tên Deployment:
          </Text>
          <Text as="div" size="2" mb="3">
            {deploymentName}
          </Text>

          {isQuickDeployment ? (
            <>
              <Text as="div" size="2" mb="1" weight="bold">
                Android Deployment Key:
              </Text>
              <Flex gap="2" align="center" mb="3">
                <Box
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "var(--gray-3)",
                    borderRadius: "4px",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "monospace",
                  }}
                >
                  <Text size="2">{deploymentKey}</Text>
                </Box>
                <IconButton
                  onClick={() =>
                    handleCopyDeploymentKey(deploymentKey, "Android")
                  }
                >
                  <ClipboardCopyIcon />
                </IconButton>
              </Flex>

              <Text as="div" size="2" mb="1" weight="bold">
                iOS Deployment Key:
              </Text>
              <Flex gap="2" align="center">
                <Box
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "var(--gray-3)",
                    borderRadius: "4px",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "monospace",
                  }}
                >
                  <Text size="2">{iosDeploymentKey}</Text>
                </Box>
                <IconButton
                  onClick={() =>
                    handleCopyDeploymentKey(iosDeploymentKey, "iOS")
                  }
                >
                  <ClipboardCopyIcon />
                </IconButton>
              </Flex>
            </>
          ) : (
            <>
              <Text as="div" size="2" mb="1" weight="bold">
                Deployment Key:
              </Text>
              <Flex gap="2" align="center">
                <Box
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "var(--gray-3)",
                    borderRadius: "4px",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "monospace",
                  }}
                >
                  <Text size="2">{deploymentKey}</Text>
                </Box>
                <IconButton
                  onClick={() => handleCopyDeploymentKey(deploymentKey)}
                >
                  <ClipboardCopyIcon />
                </IconButton>
              </Flex>
            </>
          )}
        </Box>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default DeploymentInfoModal;

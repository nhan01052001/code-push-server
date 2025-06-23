import { useState, useEffect } from "react";
import {
  Dialog,
  Flex,
  Box,
  Text,
  Button,
  IconButton,
  TextField,
  Select,
} from "@radix-ui/themes";
import { Cross1Icon } from "@radix-ui/react-icons";
import { showErrorToast } from "@/components";
import { getApps, createDeployment } from "@/services/api";
import { App } from "@/components/app/AppCard";

interface CreateQuickDeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: (name: string, androidKey: string, iosKey: string) => void;
}

const CreateQuickDeploymentDialog = ({
  open,
  onOpenChange,
  onCreateSuccess,
}: CreateQuickDeploymentDialogProps) => {
  const [name, setName] = useState("");
  const [androidApp, setAndroidApp] = useState("");
  const [iosApp, setIosApp] = useState("");
  const [androidApps, setAndroidApps] = useState<App[]>([]);
  const [iosApps, setIosApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const fetchApps = async () => {
    try {
      const response = await getApps();
      if (response && response.apps) {
        const allApps = response.apps;
        setAndroidApps(
          allApps.filter(
            (app: App) =>
              app.os === "Android" || app.name.toLowerCase().includes("android")
          )
        );
        setIosApps(
          allApps.filter(
            (app: App) => app.os === "iOS" || app.name.toLowerCase().includes("ios")
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách ứng dụng:", error);
      showErrorToast("Không thể tải danh sách ứng dụng");
    }
  };

  useEffect(() => {
    if (open) {
      fetchApps();
      // Reset form khi mở dialog
      setName("");
      setAndroidApp("");
      setIosApp("");
    }
  }, [open]);

  // Validate form
  useEffect(() => {
    setFormValid(!!name && !!androidApp && !!iosApp);
  }, [name, androidApp, iosApp]);

  const handleSubmit = async () => {
    if (!formValid) return;

    setLoading(true);
    try {
      // Tạo deployment cho Android app
      const androidResponse = await createDeployment(androidApp, { name });
      
      // Tạo deployment cho iOS app
      const iosResponse = await createDeployment(iosApp, { name });
      
      // Thông báo thành công và đóng dialog
      onOpenChange(false);
      
      // Trả về key của cả hai deployment
      if (androidResponse?.deployment && iosResponse?.deployment) {
        onCreateSuccess(
          androidResponse.deployment.name,
          androidResponse.deployment.key,
          iosResponse.deployment.key
        );
      }
    } catch (error) {
      console.error("Lỗi khi tạo deployment:", error);
      showErrorToast("Không thể tạo deployment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Flex justify="between" align="center">
          <Dialog.Title>Tạo nhanh Deployment</Dialog.Title>
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
          <TextField.Root
            placeholder="Nhập tên deployment"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Text as="div" size="2" mb="1" mt="3" weight="bold">
            Ứng dụng Android:
          </Text>
          <Select.Root value={androidApp} onValueChange={setAndroidApp}>
            <Select.Trigger placeholder="Chọn ứng dụng Android" />
            <Select.Content>
              <Select.Group>
                {androidApps.map((app) => (
                  <Select.Item key={app.name} value={app.name}>
                    {app.name}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Text as="div" size="2" mb="1" mt="3" weight="bold">
            Ứng dụng iOS:
          </Text>
          <Select.Root value={iosApp} onValueChange={setIosApp}>
            <Select.Trigger placeholder="Chọn ứng dụng iOS" />
            <Select.Content>
              <Select.Group>
                {iosApps.map((app) => (
                  <Select.Item key={app.name} value={app.name}>
                    {app.name}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Box>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft">Hủy</Button>
          </Dialog.Close>
          <Button
            onClick={handleSubmit}
            disabled={!formValid || loading}
          >
            {loading ? "Đang tạo..." : "Tạo deployment"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreateQuickDeploymentDialog; 
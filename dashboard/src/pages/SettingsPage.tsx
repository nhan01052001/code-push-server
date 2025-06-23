import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Button,
  Flex,
  Text,
  TextField,
  Select,
  Grid,
  Card,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, ReloadIcon } from "@radix-ui/react-icons";
import { getConfigDashboard, getQRCodes } from "@/services/api_qrcode";
import { showErrorToast, showSuccessToast } from "@/components";

interface QRCodeData {
  ID: string;
  CusCode: string;
  CusName: string;
  UriPor: string;
  UriMain: string;
  UriHR: string;
  UriSys: string;
  UriCenter: string;
  UriIdentity: string | null;
  VersionCode: string;
  keyUpdateAndroid: string;
  keyUpdateIos: string;
  QRCodeBase64: string;
  DecAlgorithm?: string;
}

interface GroupItem {
  id: string;
  sort: number;
  type: string;
  title: string;
  description?: string;
  urlIcon?: string;
  listGroup: MenuItem[];
}

interface MenuItem {
  id: string;
  type: string;
  title: string;
  urlIcon: string;
  screenName: string;
  resource: {
    name: string;
    rule: string;
  };
  isTopNavigateDefault?: boolean;
  countWaitApprove?: string;
}

const SettingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [selectedProject, setSelectedProject] = useState<QRCodeData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState<GroupItem[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);

  const fetchQRCodes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getQRCodes(1, 100, searchTerm); // Fetch up to 100 QRCodes, adjust as needed
      setQrCodes(response.items);
    } catch (err) {
      showErrorToast("Error fetching QR codes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  const fetchConfigData = useCallback(async (portalLink: string) => {
    setLoadingConfig(true);
    setErrorConfig(null);
    try {
      // First try with configDashboard_spec.json
      let configUrl = `${portalLink}/apps/mobile/configDashboard_spec.json`;
      let response;
      try {
        response = await getConfigDashboard(configUrl);
      } catch (axiosError: any) {
        if (axiosError.response && axiosError.response.status === 403) {
          console.warn(
            `Access to ${configUrl} was forbidden (403). Trying fallback URL.`
          );
        } else {
          console.error(`Error fetching ${configUrl}:`, axiosError);
        }
        // If spec.json fails, try with configDashboard.json
        configUrl = `${portalLink}/apps/mobile/configDashboard.json`;
        response = await getConfigDashboard(configUrl);
      }

      setConfigData(response);
    } catch (err: any) {
      setErrorConfig(
        err.message ||
          "Project not configured. Please check: Portal/apps/mobile"
      );
      showErrorToast(
        err.message ||
          "Project not configured. Please check: Portal/apps/mobile"
      );
      console.error(err);
      setConfigData([]);
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  const handleProjectSelect = (value: string) => {
    const project = qrCodes.find((qr) => qr.ID === value);
    setSelectedProject(project || null);
    if (project && project.UriPor) {
      fetchConfigData(project.UriPor);
    } else {
      setConfigData([]);
      setErrorConfig("Selected project has no Portal Link.");
    }
  };

  const handleItemClick = (item: MenuItem) => {
    showSuccessToast(`Clicked on: ${item.title}`);
    console.log("Clicked item:", item);
    // You can add navigation logic here based on item.screenName or other properties
  };

  return (
    <Box p="4">
      <Heading size="6" mb="4">
        Cấu hình Dashboard
      </Heading>

      <Flex mb="4" gap="2" align="center">
        <TextField.Root
          placeholder="Tìm kiếm dự án..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1 }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
        <Button onClick={fetchQRCodes} disabled={loading}>
          <ReloadIcon />
          Tải lại
        </Button>
      </Flex>

      <Flex mb="4" align="center" gap="2">
        <Text style={{ minWidth: "80px" }}>Chọn dự án:</Text>
        <Select.Root
          value={selectedProject?.ID || ""}
          onValueChange={handleProjectSelect}
          disabled={loading || qrCodes.length === 0}
        >
          <Select.Trigger
            placeholder="Chọn một dự án"
            style={{ flexGrow: 1 }}
          />
          <Select.Content>
            {qrCodes.length === 0 && !loading ? (
              <Text style={{ padding: "8px 12px", color: "var(--gray-11)" }}>
                Không có dự án nào
              </Text>
            ) : (
              qrCodes.map((qr) => (
                <Select.Item key={qr.ID} value={qr.ID}>
                  {qr.CusName} ({qr.CusCode})
                </Select.Item>
              ))
            )}
          </Select.Content>
        </Select.Root>
      </Flex>

      {loadingConfig && <Text>Đang tải cấu hình...</Text>}
      {errorConfig && <Text color="red">{errorConfig}</Text>}

      {!loadingConfig && !errorConfig && configData.length > 0 && (
        <Box>
          {configData.map((group) => (
            <Box key={group.id} mb="6">
              <Heading size="4" mb="3">
                {group.title}
              </Heading>
              {group.description && (
                <Text size="2" color="gray" mb="3">
                  {group.description}
                </Text>
              )}
              <Grid
                columns={{ initial: "2", sm: "3", md: "4", lg: "6" }}
                gap="3"
              >
                {group.listGroup.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    style={{
                      cursor: "pointer",
                      textAlign: "center",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      backgroundColor: "var(--color-background-soft)",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--color-hover)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--color-background-soft)")
                    }
                  >
                    {item.urlIcon && (
                      <img
                        src={`${import.meta.env.VITE_SECONDARY_API_URL}/proxy/image-proxy?url=${selectedProject?.UriPor || ""}${item.urlIcon}`}
                        alt={item.title}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                    <Text size="2" weight="medium">
                      {item.title}
                    </Text>
                  </Card>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {!loadingConfig &&
        !errorConfig &&
        configData.length === 0 &&
        selectedProject && (
          <Text>Không có dữ liệu cấu hình cho dự án đã chọn.</Text>
        )}
    </Box>
  );
};

export default SettingsPage;

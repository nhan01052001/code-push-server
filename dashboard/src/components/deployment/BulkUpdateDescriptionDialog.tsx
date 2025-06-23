import { useState, useEffect } from "react";
import {
  Dialog,
  Flex,
  Text,
  Button,
  Box,
  Checkbox,
  ScrollArea,
  Badge,
  Separator,
  Card,
} from "@radix-ui/themes";
import { InfoCircledIcon, CheckIcon } from "@radix-ui/react-icons";
import { getDeployments, updateRelease } from "@/services/api";
import { showErrorToast, showSuccessToast } from "@/components";

interface Deployment {
  name: string;
  key: string;
  id: string;
  package?: {
    description: string;
    isDisabled: boolean;
    isMandatory: boolean;
    label: string;
    appVersion: string;
    [key: string]: any;
  };
}

interface BulkUpdateDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
}

// Hàm chuyển đổi Base64 sang JSON
const base64ToJSON = (base64: string): any => {
  try {
    const decodedString = decodeURIComponent(escape(atob(base64)));
    const jsonObject = JSON.parse(decodedString);
    return jsonObject;
  } catch (error) {
    return null;
  }
};

// Hàm chuyển đổi JSON sang Base64
const jsonToBase64 = (jsonObject: any): string => {
  try {
    const compactJsonString = JSON.stringify(jsonObject);
    return btoa(unescape(encodeURIComponent(compactJsonString)));
  } catch (error) {
    return "";
  }
};

const BulkUpdateDescriptionDialog = ({
  open,
  onOpenChange,
  appName,
}: BulkUpdateDescriptionDialogProps) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedDeployments, setSelectedDeployments] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateResults, setUpdateResults] = useState<
    Map<string, { success: boolean; message?: string }>
  >(new Map());
  const [previewMode, setPreviewMode] = useState(false);
  const [processedDescriptions, setProcessedDescriptions] = useState<
    Map<string, string>
  >(new Map());

  // Load deployments khi dialog mở
  useEffect(() => {
    if (open && appName) {
      loadDeployments();
    }
  }, [open, appName]);

  const loadDeployments = async () => {
    setLoading(true);
    try {
      const response = await getDeployments(appName);
      if (response.deployments) {
        setDeployments(response.deployments);
        // Xử lý descriptions và lưu vào processedDescriptions
        const processed = new Map<string, string>();
        response.deployments.forEach((dep: Deployment) => {
          if (dep.package?.description) {
            const jsonData = base64ToJSON(dep.package.description);
            if (jsonData) {
              // Loại bỏ field versionNameApp
              const { versionNameApp, ...restData } = jsonData;
              
              // Thêm mặc định description: [] nếu không có
              if (!restData.description) {
                restData.description = [];
              }
              
              // Chuyển lại thành base64
              const newBase64 = jsonToBase64(restData);
              processed.set(dep.name, newBase64);
            }
          }
        });
        setProcessedDescriptions(processed);
      }
    } catch (error) {
      showErrorToast("Không thể tải danh sách deployments");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedDeployments.size === deployments.length) {
      setSelectedDeployments(new Set());
    } else {
      const allDeploymentNames = deployments.map((d) => d.name);
      setSelectedDeployments(new Set(allDeploymentNames));
    }
  };

  const handleToggleDeployment = (deploymentName: string) => {
    const newSelected = new Set(selectedDeployments);
    if (newSelected.has(deploymentName)) {
      newSelected.delete(deploymentName);
    } else {
      newSelected.add(deploymentName);
    }
    setSelectedDeployments(newSelected);
  };

  const handleUpdate = async () => {
    if (selectedDeployments.size === 0) {
      showErrorToast("Vui lòng chọn ít nhất một deployment để cập nhật");
      return;
    }

    setUpdating(true);
    setUpdateResults(new Map());

    const results = new Map<string, { success: boolean; message?: string }>();

    for (const deploymentName of selectedDeployments) {
      const deployment = deployments.find((d) => d.name === deploymentName);
      if (!deployment?.package) continue;

      try {
        const newDescription = processedDescriptions.get(deploymentName);
        if (!newDescription) {
          results.set(deploymentName, {
            success: false,
            message: "Không thể xử lý description",
          });
          continue;
        }

        await updateRelease(
          appName,
          deploymentName,
          deployment.package.label,
          {
            description: newDescription,
            isDisabled: deployment.package.isDisabled,
            isMandatory: deployment.package.isMandatory,
          }
        );

        results.set(deploymentName, { success: true });
      } catch (error: any) {
        results.set(deploymentName, {
          success: false,
          message: error.response?.data?.message || "Lỗi không xác định",
        });
      }
    }

    setUpdateResults(results);
    setUpdating(false);

    // Hiển thị thông báo tổng kết
    const successCount = Array.from(results.values()).filter(
      (r) => r.success
    ).length;
    const failCount = results.size - successCount;

    if (successCount > 0 && failCount === 0) {
      showSuccessToast(`Cập nhật thành công ${successCount} deployment(s)`);
    } else if (successCount > 0 && failCount > 0) {
      showErrorToast(
        `Cập nhật thành công ${successCount}, thất bại ${failCount} deployment(s)`
      );
    } else {
      showErrorToast(`Cập nhật thất bại ${failCount} deployment(s)`);
    }
  };

  const renderDeploymentItem = (deployment: Deployment) => {
    const isSelected = selectedDeployments.has(deployment.name);
    const updateResult = updateResults.get(deployment.name);
    const processedDesc = processedDescriptions.get(deployment.name);

    return (
      <Card key={deployment.name} style={{ padding: "16px" }}>
        <Flex justify="between" align="start" gap="3">
          <Flex gap="3" align="start" style={{ flex: 1 }}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleToggleDeployment(deployment.name)}
              disabled={updating}
            />
            <Box style={{ flex: 1 }}>
              <Flex justify="between" align="center" mb="2">
                <Text weight="bold" size="3">
                  {deployment.name}
                </Text>
                {updateResult && (
                  <Badge
                    color={updateResult.success ? "green" : "red"}
                    variant="soft"
                  >
                    {updateResult.success ? (
                      <>
                        <CheckIcon /> Thành công
                      </>
                    ) : (
                      `Lỗi: ${updateResult.message}`
                    )}
                  </Badge>
                )}
              </Flex>

              {deployment.package && (
                <Box>
                  <Flex gap="2" mb="2">
                    <Badge variant="soft">
                      Phiên bản: {deployment.package.label}
                    </Badge>
                    <Badge variant="soft">
                      App: {deployment.package.appVersion}
                    </Badge>
                  </Flex>

                  {previewMode && processedDesc && (
                    <Box mt="3">
                      <Text size="2" weight="bold" color="gray">
                        Description sau khi xử lý:
                      </Text>
                      <Box
                        style={{
                          background: "#f5f5f5",
                          padding: "8px",
                          borderRadius: "4px",
                          marginTop: "4px",
                          fontSize: "12px",
                          fontFamily: "monospace",
                          overflow: "auto",
                          maxHeight: "100px",
                        }}
                      >
                        <pre style={{ margin: 0 }}>
                          {JSON.stringify(base64ToJSON(processedDesc), null, 2)}
                        </pre>
                      </Box>
                      {(() => {
                        const originalData = base64ToJSON(deployment.package?.description || "");
                        const processedData = base64ToJSON(processedDesc);
                        const hasAddedDescription = originalData && !originalData.description && processedData?.description;
                        
                        return hasAddedDescription ? (
                          <Text size="1" color="green" mt="1">
                            ✓ Đã thêm field "description: []" mặc định
                          </Text>
                        ) : null;
                      })()}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Flex>
        </Flex>
      </Card>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 700 }}>
        <Dialog.Title>Cập nhật hàng loạt Description</Dialog.Title>
        <Dialog.Description>
          Chọn các deployment cần cập nhật. Field versionNameApp sẽ được tự
          động loại bỏ khỏi description. Nếu không có field description, sẽ tự động thêm "description": [] mặc định.
        </Dialog.Description>

        <Box my="4">
          <Flex justify="between" align="center" mb="3">
            <Flex gap="2" align="center">
              <Button
                size="2"
                variant="soft"
                onClick={handleSelectAll}
                disabled={loading || updating}
              >
                {selectedDeployments.size === deployments.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
              <Text size="2" color="gray">
                Đã chọn {selectedDeployments.size}/{deployments.length}
              </Text>
            </Flex>
            <Button
              size="2"
              variant="ghost"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <InfoCircledIcon />
              {previewMode ? "Ẩn chi tiết" : "Xem chi tiết"}
            </Button>
          </Flex>

          <Separator size="4" mb="3" />

          {loading ? (
            <Flex justify="center" align="center" style={{ height: "200px" }}>
              <Text>Đang tải...</Text>
            </Flex>
          ) : deployments.length === 0 ? (
            <Box style={{ textAlign: "center", padding: "2rem" }}>
              <Text color="gray">Không có deployment nào</Text>
            </Box>
          ) : (
            <ScrollArea style={{ height: "400px" }}>
              <Flex direction="column" gap="2">
                {deployments.map((deployment) =>
                  renderDeploymentItem(deployment)
                )}
              </Flex>
            </ScrollArea>
          )}
        </Box>

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" disabled={updating}>
              Hủy
            </Button>
          </Dialog.Close>
          <Button
            onClick={handleUpdate}
            disabled={
              loading || updating || selectedDeployments.size === 0
            }
          >
            {updating
              ? "Đang cập nhật..."
              : `Cập nhật ${selectedDeployments.size} deployment(s)`}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default BulkUpdateDescriptionDialog; 
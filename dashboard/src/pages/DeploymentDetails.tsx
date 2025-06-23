import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Heading,
  Button,
  Flex,
  Text,
  Dialog,
  Box,
  Table,
  Badge,
  Select,
  Tabs,
  ScrollArea,
  Code,
  Grid,
  IconButton,
} from "@radix-ui/themes";
import {
  getDeploymentDetails,
  getDeploymentHistory,
  rollbackDeployment,
  promoteDeployment,
  updateRelease,
} from "../services/api";
import { Pencil1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { BackButton } from "@/components";
import { EditReleaseDialog } from "@/components";
import { UpdateReleaseData } from "@/components/deployment/EditReleaseDialog";
import { DeleteConfirmDialog } from "@/components";
import { showErrorToast, showSuccessToast } from "@/components";

interface Release {
  label: string;
  description: string;
  isDisabled: boolean;
  isMandatory: boolean;
  rollout: number | null;
  appVersion: string;
  packageHash: string;
  blobUrl: string;
  size: number;
  manifestBlobUrl: string;
  releaseMethod: string;
  uploadTime: number;
  releasedBy: string;
}

// Hàm giải mã Base64 thành JSON
const base64ToJSON = (base64String: string) => {
  try {
    const decodedString = decodeURIComponent(escape(atob(base64String)));
    const json = JSON.parse(decodedString);
    return json;
  } catch (error) {
    console.error("Lỗi khi giải mã Base64:", error);
    return null;
  }
};

// Hàm định dạng kích thước file
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const DeploymentDetails = () => {
  const { appName, deploymentName } = useParams<{
    appName: string;
    deploymentName: string;
  }>();
  const [deployment, setDeployment] = useState<any>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedReleaseLabel, setSelectedReleaseLabel] = useState("");
  const [promoteTo, setPromoteTo] = useState("");
  const [otherDeployments, setOtherDeployments] = useState<string[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [releaseDetailsOpen, setReleaseDetailsOpen] = useState(false);
  const [editReleaseDialogOpen, setEditReleaseDialogOpen] = useState(false);
  const [releaseToEdit, setReleaseToEdit] = useState<Release | null>(null);
  const [rollbackConfirmOpen, setRollbackConfirmOpen] = useState(false);
  const [promoteConfirmOpen, setPromoteConfirmOpen] = useState(false);

  useEffect(() => {
    if (appName && deploymentName) {
      loadDeploymentData();
    }
  }, [appName, deploymentName]);

  const loadDeploymentData = async () => {
    setLoading(true);
    try {
      const [deploymentData, historyData] = await Promise.all([
        getDeploymentDetails(appName as string, deploymentName as string),
        getDeploymentHistory(appName as string, deploymentName as string),
      ]);

      setDeployment(deploymentData.deployment);

      if (historyData && historyData.history) {
        // Sắp xếp các bản phát hành theo thời gian mới nhất (uploadTime lớn nhất) lên đầu
        const sortedReleases = [...historyData.history].sort((a, b) => b.uploadTime - a.uploadTime);
        setReleases(sortedReleases);
      }

      // Lấy danh sách các deployment khác để promote
      if (deploymentData.otherDeployments) {
        setOtherDeployments(
          deploymentData.otherDeployments.filter(
            (d: string) => d !== deploymentName
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin deployment", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    try {
      setLoading(true);
      await rollbackDeployment(
        appName as string,
        deploymentName as string,
        selectedReleaseLabel || undefined
      );
      setRollbackDialogOpen(false);
      setRollbackConfirmOpen(false);
      await loadDeploymentData();
      showSuccessToast("Đã rollback deployment thành công");
    } catch (error) {
      console.error("Lỗi khi rollback", error);
      showErrorToast("Có lỗi xảy ra khi rollback deployment");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!promoteTo) return;
    
    try {
      setLoading(true);
      await promoteDeployment(
        appName as string,
        deploymentName as string,
        promoteTo,
        {} // packageInfo có thể trống hoặc chứa thông tin bổ sung
      );
      setPromoteDialogOpen(false);
      setPromoteConfirmOpen(false);
      await loadDeploymentData();
      showSuccessToast(`Đã promote deployment tới "${promoteTo}" thành công`);
    } catch (error) {
      console.error("Lỗi khi promote deployment", error);
      showErrorToast("Có lỗi xảy ra khi promote deployment");
    } finally {
      setLoading(false);
    }
  };

  const handleRollbackConfirm = () => {
    setRollbackConfirmOpen(true);
  };

  const handlePromoteConfirm = () => {
    setPromoteConfirmOpen(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleViewReleaseDetails = (release: Release) => {
    setSelectedRelease(release);
    setReleaseDetailsOpen(true);
  };

  const handleEditRelease = (release: Release) => {
    setReleaseToEdit(release);
    setEditReleaseDialogOpen(true);
  };

  const handleSaveRelease = async (
    label: string,
    updates: UpdateReleaseData
  ) => {
    try {
      setLoading(true);
      await updateRelease(
        appName as string,
        deploymentName as string,
        label,
        updates
      );
      await loadDeploymentData();
    } catch (error) {
      console.error("Lỗi khi cập nhật phiên bản:", error);
      alert("Có lỗi xảy ra khi cập nhật phiên bản");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex style={{ height: "300px" }} justify="center" align="center">
        <Text>Đang tải...</Text>
      </Flex>
    );
  }

  if (!deployment) {
    return (
      <Flex style={{ height: "300px" }} justify="center" align="center">
        <Text>Không tìm thấy thông tin deployment</Text>
      </Flex>
    );
  }

  return (
    <div>
      <Box mb="4">
        <BackButton label={`Trở về chi tiết ứng dụng ${appName}`} />
      </Box>

      <div
        className="deployment-details-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          <Heading size="6">{deploymentName}</Heading>
          <div className="deployment-meta" style={{ marginTop: "8px" }}>
            <Badge>Key: {deployment.key}</Badge>
          </div>
        </div>
        <Flex gap="3">
          <Button
            onClick={() => setRollbackDialogOpen(true)}
            disabled={true}
          >
            Rollback
          </Button>
          <Button
            onClick={() => setPromoteDialogOpen(true)}
            disabled={true}
          >
            Promote
          </Button>
        </Flex>
      </div>

      <Box mt="6">
        <Heading size="4" mb="4">
          Lịch sử phát hành
        </Heading>

        {releases.length > 0 ? (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Phiên bản</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Mô tả</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Phiên bản App</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Kích thước</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Trạng thái</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Bắt buộc</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Thời gian</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Thao tác</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {releases.map((release) => (
                <Table.Row key={release.label}>
                  <Table.Cell>{release.label}</Table.Cell>
                  <Table.Cell>
                    <Text
                      size="2"
                      style={{
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {release.description.substring(0, 30)}
                      {release.description.length > 30 ? "..." : ""}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{release.appVersion || "N/A"}</Table.Cell>
                  <Table.Cell>{formatFileSize(release.size)}</Table.Cell>
                  <Table.Cell>
                    <Badge color={release.isDisabled ? "red" : "green"} style={{ 
                      width: "fit-content", 
                      display: "inline-block", 
                      borderRadius: "9999px", 
                      padding: "2px 10px",
                      backgroundColor: release.isDisabled ? "rgba(255, 0, 0, 0.15)" : "rgba(0, 128, 0, 0.15)",
                      color: release.isDisabled ? "#d00" : "#080",
                      fontWeight: "normal"
                    }}>
                      {release.isDisabled ? "Vô hiệu" : "Hoạt động"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={release.isMandatory ? "orange" : "gray"} style={{ 
                      width: "fit-content", 
                      display: "inline-block", 
                      borderRadius: "9999px", 
                      padding: "2px 10px",
                      backgroundColor: release.isMandatory ? "rgba(255, 165, 0, 0.15)" : "rgba(128, 128, 128, 0.15)",
                      color: release.isMandatory ? "#c60" : "#666",
                      fontWeight: "normal"
                    }}>
                      {release.isMandatory ? "Bắt buộc" : "Không"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{formatDate(release.uploadTime)}</Table.Cell>
                  <Table.Cell>
                    <Flex gap="2" align="center">
                      <IconButton
                        size="1"
                        variant="soft"
                        onClick={() => handleViewReleaseDetails(release)}
                      >
                        <MagnifyingGlassIcon width="14" height="14" />
                      </IconButton>
                      <Button
                        size="1"
                        variant="soft"
                        onClick={() => handleEditRelease(release)}
                      >
                        <Pencil1Icon />
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <Box style={{ textAlign: "center", padding: "2rem" }}>
            <Text>Chưa có bản cập nhật nào được phát hành.</Text>
          </Box>
        )}
      </Box>

      {/* Rollback Dialog */}
      <Dialog.Root
        open={rollbackDialogOpen}
        onOpenChange={setRollbackDialogOpen}
      >
        <Dialog.Content>
          <Dialog.Title>Rollback Deployment</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Chọn phiên bản để rollback, hoặc để trống để rollback về phiên bản
            gần nhất
          </Dialog.Description>

          <Box mb="4">
            <Select.Root
              value={selectedReleaseLabel}
              onValueChange={setSelectedReleaseLabel}
            >
              <Select.Trigger placeholder="Chọn phiên bản..." />
              <Select.Content>
                <Select.Group>
                  <Select.Item value="">Phiên bản gần nhất</Select.Item>
                  {releases.map((release) => (
                    <Select.Item key={release.label} value={release.label}>
                      {release.label}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </Box>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Hủy
              </Button>
            </Dialog.Close>
            <Button onClick={handleRollbackConfirm}>Rollback</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Rollback Confirmation Dialog */}
      <DeleteConfirmDialog
        open={rollbackConfirmOpen}
        onOpenChange={setRollbackConfirmOpen}
        title="Xác nhận rollback deployment"
        description="Bạn có chắc chắn muốn rollback deployment này không? Thao tác này sẽ phát hành lại phiên bản được chọn."
        itemName={selectedReleaseLabel || "phiên bản gần nhất"}
        onConfirm={handleRollback}
        confirmButtonText="Rollback"
      />

      {/* Promote Dialog */}
      <Dialog.Root open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Promote Deployment</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Chọn deployment đích để promote phiên bản mới nhất
          </Dialog.Description>

          <Box mb="4">
            <Select.Root value={promoteTo} onValueChange={setPromoteTo}>
              <Select.Trigger placeholder="Chọn deployment..." />
              <Select.Content>
                <Select.Group>
                  {otherDeployments.map((deploymentName) => (
                    <Select.Item key={deploymentName} value={deploymentName}>
                      {deploymentName}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </Box>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Hủy
              </Button>
            </Dialog.Close>
            <Button onClick={handlePromoteConfirm}>Promote</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Promote Confirmation Dialog */}
      <DeleteConfirmDialog
        open={promoteConfirmOpen}
        onOpenChange={setPromoteConfirmOpen}
        title="Xác nhận promote deployment"
        description={`Bạn có chắc chắn muốn promote deployment này tới "${promoteTo}" không?`}
        itemName={deploymentName || ""}
        onConfirm={handlePromote}
        confirmButtonText="Promote"
      />

      {/* Release Details Dialog */}
      <Dialog.Root
        open={releaseDetailsOpen}
        onOpenChange={setReleaseDetailsOpen}
      >
        <Dialog.Content style={{ maxWidth: "750px" }}>
          <Dialog.Title>
            Chi tiết phát hành: {selectedRelease?.label}
          </Dialog.Title>

          <ScrollArea style={{ height: "500px" }} scrollbars="vertical">
            <Tabs.Root defaultValue="info">
              <Tabs.List>
                <Tabs.Trigger value="info">Thông tin</Tabs.Trigger>
                <Tabs.Trigger value="description">Mô tả</Tabs.Trigger>
                <Tabs.Trigger value="advanced">Nâng cao</Tabs.Trigger>
              </Tabs.List>

              {/* Tab Thông tin cơ bản */}
              <Tabs.Content value="info">
                <Box mt="4">
                  <Grid columns="2" gap="4">
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Phiên bản:</Text>
                      <Text>{selectedRelease?.label}</Text>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Phiên bản ứng dụng:</Text>
                      <Text>{selectedRelease?.appVersion || "N/A"}</Text>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Kích thước:</Text>
                      <Text>
                        {selectedRelease &&
                          formatFileSize(selectedRelease.size)}
                      </Text>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Phương thức phát hành:</Text>
                      <Text>{selectedRelease?.releaseMethod}</Text>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Bắt buộc cập nhật:</Text>
                      <Badge
                        color={selectedRelease?.isMandatory ? "orange" : "gray"}
                        style={{ 
                          width: "fit-content", 
                          display: "inline-block", 
                          borderRadius: "9999px", 
                          padding: "2px 10px",
                          backgroundColor: selectedRelease?.isMandatory ? "rgba(255, 165, 0, 0.15)" : "rgba(128, 128, 128, 0.15)",
                          color: selectedRelease?.isMandatory ? "#c60" : "#666",
                          fontWeight: "normal"
                        }}
                      >
                        {selectedRelease?.isMandatory ? "Bắt buộc" : "Không"}
                      </Badge>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Trạng thái:</Text>
                      <Badge
                        color={selectedRelease?.isDisabled ? "red" : "green"}
                        style={{ 
                          width: "fit-content", 
                          display: "inline-block", 
                          borderRadius: "9999px", 
                          padding: "2px 10px",
                          backgroundColor: selectedRelease?.isDisabled ? "rgba(255, 0, 0, 0.15)" : "rgba(0, 128, 0, 0.15)",
                          color: selectedRelease?.isDisabled ? "#d00" : "#080",
                          fontWeight: "normal"
                        }}
                      >
                        {selectedRelease?.isDisabled ? "Vô hiệu" : "Hoạt động"}
                      </Badge>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Phân phối:</Text>
                      <Text>
                        {selectedRelease?.rollout === null
                          ? "100%"
                          : `${selectedRelease?.rollout}%`}
                      </Text>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Người phát hành:</Text>
                      <Text>{selectedRelease?.releasedBy}</Text>
                    </Flex>
                    <Flex
                      direction="column"
                      gap="2"
                      style={{ gridColumn: "1 / span 2" }}
                    >
                      <Text weight="bold">Thời gian tải lên:</Text>
                      <Text>
                        {selectedRelease &&
                          formatDate(selectedRelease.uploadTime)}
                      </Text>
                    </Flex>
                  </Grid>
                </Box>
              </Tabs.Content>

              {/* Tab Mô tả */}
              <Tabs.Content value="description">
                <Box mt="4">
                  <Text weight="bold" mb="2">
                    Mô tả (Base64):
                  </Text>
                  <Code
                    size="2"
                    style={{
                      display: "block",
                      padding: "10px",
                      overflow: "auto",
                      maxHeight: "100px",
                      marginBottom: "16px",
                    }}
                  >
                    {selectedRelease?.description}
                  </Code>

                  <Text weight="bold" mb="2">
                    Mô tả (JSON):
                  </Text>
                  <Box
                    style={{
                      background: "#f5f5f5",
                      padding: "12px",
                      borderRadius: "6px",
                      overflow: "auto",
                    }}
                  >
                    {selectedRelease ? (
                      <pre style={{ margin: 0 }}>
                        {JSON.stringify(
                          base64ToJSON(selectedRelease.description),
                          null,
                          2
                        )}
                      </pre>
                    ) : null}
                  </Box>
                </Box>
              </Tabs.Content>

              {/* Tab Thông tin nâng cao */}
              <Tabs.Content value="advanced">
                <Box mt="4">
                  <Grid columns="1" gap="4">
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Package Hash:</Text>
                      <Text style={{ wordBreak: "break-all" }}>
                        {selectedRelease?.packageHash}
                      </Text>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Blob URL:</Text>
                      <Text style={{ wordBreak: "break-all" }}>
                        {selectedRelease?.blobUrl}
                      </Text>
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Manifest Blob URL:</Text>
                      <Text style={{ wordBreak: "break-all" }}>
                        {selectedRelease?.manifestBlobUrl}
                      </Text>
                    </Flex>
                  </Grid>
                </Box>
              </Tabs.Content>
            </Tabs.Root>
          </ScrollArea>

          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft">Đóng</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Release Dialog */}
      <EditReleaseDialog
        open={editReleaseDialogOpen}
        onOpenChange={setEditReleaseDialogOpen}
        release={releaseToEdit}
        onSave={handleSaveRelease}
      />
    </div>
  );
};

export default DeploymentDetails;

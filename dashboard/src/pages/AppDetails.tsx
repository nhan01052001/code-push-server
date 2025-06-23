import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heading,
  Button,
  Flex,
  Text,
  Box,
  Tabs,
  Card,
  Badge,
  TextField,
} from "@radix-ui/themes";
import {
  getAppDetails,
  getDeployments,
  createDeployment,
  deleteDeployment,
} from "../services/api";
import "../styles/AppDetails.css";
import { DeploymentList } from "@/components";
import { CreateDeploymentDialog } from "@/components";
import { Deployment } from "@/components/deployment/DeploymentCard";
import { BackButton } from "@/components";
import { DeploymentSearchBar } from "@/components";
import { showErrorToast, showSuccessToast } from "@/components";
import { DeleteConfirmDialog } from "@/components";
import { DeploymentInfoModal } from "@/components";
import { BulkUpdateDescriptionDialog } from "@/components";
import { getConfigByApp, updateConfig } from "@/services/api_qrcode";

interface AppData {
  name: string;
  collaborators: {
    [email: string]: {
      permission: string;
      isCurrentAccount?: boolean;
    };
  };
  deployments: string[];
  os?: string;
  platform?: string;
}

interface ConfigurationData {
  VersionAndroid: string;
  VersionIOS: string;
  ID: string;
  UserCreate: string | null;
  DateCreate: string;
  UserUpdate: string | null;
  DateUpdate: string;
  IsDelete: boolean;
  NameAppAndroid: string;
  NameAppIOS: string;
  Source: string;
}

const AppDetails = () => {
  const { appName } = useParams<{ appName: string }>();
  const [app, setApp] = useState<AppData | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Trạng thái đã load xong dữ liệu
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deploymentSearchTerm, setDeploymentSearchTerm] = useState("");
  const [collaboratorSearchTerm, setCollaboratorSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("deployments");
  const [isNewDeployment, setIsNewDeployment] = useState(false);
  const [newDeploymentKey, setNewDeploymentKey] = useState("");
  const [newDeploymentName, setNewDeploymentName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deploymentToDelete, setDeploymentToDelete] = useState<string>("");
  const [configData, setConfigData] = useState<ConfigurationData | null>(null);
  const [editConfigForm, setEditConfigForm] = useState<
    Partial<ConfigurationData>
  >({});
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (appName) {
      loadAppData();
    }
  }, [appName]);

  const loadAppData = async () => {
    setLoading(true);
    setDataLoaded(false);

    try {
      const [appResponse, deploymentsResponse] = await Promise.all([
        getAppDetails(appName as string),
        getDeployments(appName as string),
      ]);

      // Determine isAndroid based on appName for getConfigByApp
      const isAndroidApp = !!appName?.includes("Android"); // Ensure boolean value
      const configResponse = await getConfigByApp(
        isAndroidApp,
        appName as string
      );
      if (configResponse) {
        setConfigData(configResponse);
        setEditConfigForm(configResponse);
      }

      // Kiểm tra cấu trúc dữ liệu response và xử lý phù hợp
      if (appResponse && appResponse.app) {
        setApp(appResponse.app);
      }

      if (deploymentsResponse && deploymentsResponse.deployments) {
        setDeployments(deploymentsResponse.deployments);
      }

      // Thêm timeout nhỏ để hiệu ứng mượt mà hơn
      setTimeout(() => {
        setDataLoaded(true);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error("Lỗi khi tải thông tin ứng dụng hoặc cấu hình", error);
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleCreateDeployment = async (name: string) => {
    try {
      const response = await createDeployment(appName as string, { name });

      setCreateDialogOpen(false);

      // Trả về đối tượng chứa name và key của deployment vừa tạo
      if (response && response.deployment) {
        // Cập nhật lại danh sách deployments và app => không cần gọi hàm gọi lại API
        setApp((prev: AppData | null) => {
          if (!prev) return null;
          return {
            ...prev,
            deployments: [
              ...(prev.deployments || []),
              response.deployment.name,
            ],
          };
        });
        setDeployments((prev: Deployment[]) => {
          if (!prev) return [];
          return [...prev, { ...response.deployment, package: null }];
        });
        setIsNewDeployment(true);
        setNewDeploymentKey(response.deployment.key);
        setNewDeploymentName(response.deployment.name);
        return {
          name: response.deployment.name,
          key: response.deployment.key,
        };
      }
      showErrorToast("Lỗi khi tạo deployment");
      return { name, key: "" }; // Trường hợp không có response đúng
    } catch (error) {
      throw error;
    }
  };

  const openDeleteDialog = (deploymentName: string) => {
    setDeploymentToDelete(deploymentName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDeployment = async () => {
    if (!deploymentToDelete) return;

    try {
      setLoading(true);
      await deleteDeployment(appName as string, deploymentToDelete);
      await loadAppData();
      showSuccessToast(`Đã xóa deployment "${deploymentToDelete}"`);
    } catch (error) {
      console.error("Lỗi khi xóa deployment", error);
      showErrorToast("Có lỗi xảy ra khi xóa deployment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeploymentClick = (deploymentName: string) => {
    navigate(`/apps/${appName}/deployments/${deploymentName}`);
  };

  const handleSaveConfig = async () => {
    if (!configData?.ID) {
      showErrorToast("Không tìm thấy ID cấu hình để cập nhật.");
      return;
    }
    setIsConfigSaving(true);
    try {
      const updated = await updateConfig(
        configData.ID,
        editConfigForm as ConfigurationData
      );
      setConfigData(updated);
      setEditConfigForm(updated);
      showSuccessToast("Cài đặt đã được lưu thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu cài đặt:", error);
      showErrorToast("Đã xảy ra lỗi khi lưu cài đặt.");
    } finally {
      setIsConfigSaving(false);
    }
  };

  // Render skeleton loader cho deployment cards
  const renderDeploymentSkeletons = () => {
    return Array(4)
      .fill(0)
      .map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="card-container"
          style={{ opacity: 1, animation: "none" }}
        >
          <div className="deployment-card" style={{ padding: "16px" }}>
            <div
              className="loading-skeleton"
              style={{ height: "24px", width: "70%", marginBottom: "12px" }}
            ></div>
            <div
              className="loading-skeleton"
              style={{ height: "16px", width: "50%", marginBottom: "8px" }}
            ></div>
            <div
              className="loading-skeleton"
              style={{ height: "16px", width: "80%", marginBottom: "16px" }}
            ></div>
            <div style={{ marginTop: "auto" }}>
              <div
                className="loading-skeleton"
                style={{ height: "30px", width: "100%" }}
              ></div>
            </div>
          </div>
        </div>
      ));
  };

  // Render skeleton loader cho collaborators
  const renderCollaboratorSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <div
          key={`collab-skeleton-${index}`}
          className="loading-skeleton"
          style={{ height: "60px", marginBottom: "8px" }}
        ></div>
      ));
  };

  const filteredDeployments = deployments.filter((deployment) =>
    deployment.name.toLowerCase().includes(deploymentSearchTerm.toLowerCase())
  );

  const filteredCollaborators = app
    ? Object.entries(app.collaborators).filter(([email]) =>
        email.toLowerCase().includes(collaboratorSearchTerm.toLowerCase())
      )
    : [];

  const getSearchProps = () => {
    switch (currentTab) {
      case "deployments":
        return {
          searchTerm: deploymentSearchTerm,
          onSearchChange: setDeploymentSearchTerm,
          placeholder: "Tìm kiếm deployment...",
          disabled: loading,
        };
      case "collaborators":
        return {
          searchTerm: collaboratorSearchTerm,
          onSearchChange: setCollaboratorSearchTerm,
          placeholder: "Tìm kiếm cộng tác viên...",
          disabled: loading,
        };
      case "settings":
        return {
          searchTerm: "",
          onSearchChange: () => {},
          placeholder: "Tìm kiếm...",
          disabled: true,
        };
      default:
        return {
          searchTerm: deploymentSearchTerm,
          onSearchChange: setDeploymentSearchTerm,
          placeholder: "Tìm kiếm deployment...",
          disabled: loading,
        };
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  if (!app && loading) {
    return (
      <Flex
        style={{ height: "300px" }}
        justify="center"
        align="center"
        direction="column"
        gap="3"
      >
        <div
          className="loading-skeleton"
          style={{ height: "24px", width: "200px" }}
        ></div>
        <div
          className="loading-skeleton"
          style={{ height: "16px", width: "300px" }}
        ></div>
      </Flex>
    );
  }

  if (!app) {
    return (
      <Flex style={{ height: "300px" }} justify="center" align="center">
        <Text>Không tìm thấy ứng dụng</Text>
      </Flex>
    );
  }

  return (
    <div className={dataLoaded ? "tab-content-loaded" : "tab-content-loading"}>
      <Box mb="4">
        <BackButton label="Trở về danh sách ứng dụng" />
      </Box>

      <div className="app-details-header">
        <div>
          <Heading size="6">{app.name}</Heading>
          <div className="app-meta">
            <Text size="2">
              OS: {app.os || (app.name.includes("_IOS") ? "iOS" : "Android")}
            </Text>
            <Text size="2">Platform: {app.platform || "React-Native"}</Text>
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} disabled={loading}>
          Tạo Deployment Mới
        </Button>
      </div>

      <DeploymentSearchBar {...getSearchProps()} />

      <Tabs.Root defaultValue="deployments" onValueChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Trigger value="deployments">Deployments</Tabs.Trigger>
          <Tabs.Trigger value="collaborators">Cộng tác viên</Tabs.Trigger>
          <Tabs.Trigger value="settings">Cài đặt</Tabs.Trigger>
        </Tabs.List>

        <Box px="4" pt="3" pb="2">
          <Tabs.Content
            value="deployments"
            className={
              dataLoaded ? "tab-content-loaded" : "tab-content-loading"
            }
          >
            <Box>
              {loading ? (
                <div className="deployment-card-grid">
                  {renderDeploymentSkeletons()}
                </div>
              ) : (
                <DeploymentList
                  deployments={filteredDeployments}
                  onDeploymentClick={handleDeploymentClick}
                  onDeleteDeployment={openDeleteDialog}
                />
              )}
            </Box>
          </Tabs.Content>

          <Tabs.Content
            value="collaborators"
            className={
              dataLoaded ? "tab-content-loaded" : "tab-content-loading"
            }
          >
            <Flex direction="column" gap="3">
              {loading ? (
                renderCollaboratorSkeletons()
              ) : filteredCollaborators.length === 0 ? (
                <Text>Không có cộng tác viên nào cho ứng dụng này.</Text>
              ) : (
                filteredCollaborators.map(([email, data]) => (
                  <Card key={email}>
                    <Flex gap="3" align="center">
                      <Box>
                        <Text as="div" size="2" weight="bold">
                          {email}
                        </Text>
                        <Text as="div" size="2" color="gray">
                          {data.permission}
                        </Text>
                      </Box>
                      <Badge color={data.isCurrentAccount ? "blue" : "gray"}>
                        {data.isCurrentAccount
                          ? "Tài khoản hiện tại"
                          : data.permission}
                      </Badge>
                    </Flex>
                  </Card>
                ))
              )}
            </Flex>
          </Tabs.Content>

          <Tabs.Content
            value="settings"
            className={
              dataLoaded ? "tab-content-loaded" : "tab-content-loading"
            }
          >
            {loading ? (
              <Text>Đang tải cài đặt...</Text>
            ) : configData ? (
              <Box mt="4">
                <Flex direction="column" gap="3">
                  <TextField.Root
                    value={editConfigForm.VersionAndroid || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditConfigForm({
                        ...editConfigForm,
                        VersionAndroid: e.target.value,
                      })
                    }
                  >
                    <TextField.Slot>Version Android:</TextField.Slot>
                  </TextField.Root>
                  <TextField.Root
                    value={editConfigForm.VersionIOS || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditConfigForm({
                        ...editConfigForm,
                        VersionIOS: e.target.value,
                      })
                    }
                  >
                    <TextField.Slot>Version iOS:</TextField.Slot>
                  </TextField.Root>
                  <TextField.Root
                    value={editConfigForm.NameAppAndroid || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditConfigForm({
                        ...editConfigForm,
                        NameAppAndroid: e.target.value,
                      })
                    }
                  >
                    <TextField.Slot>Tên ứng dụng Android:</TextField.Slot>
                  </TextField.Root>
                  <TextField.Root
                    value={editConfigForm.NameAppIOS || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditConfigForm({
                        ...editConfigForm,
                        NameAppIOS: e.target.value,
                      })
                    }
                  >
                    <TextField.Slot>Tên ứng dụng iOS:</TextField.Slot>
                  </TextField.Root>
                  <TextField.Root
                    value={editConfigForm.Source || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditConfigForm({
                        ...editConfigForm,
                        Source: e.target.value,
                      })
                    }
                  >
                    <TextField.Slot>Source:</TextField.Slot>
                  </TextField.Root>
                  <Flex gap={'2'}>
                    <Button
                      onClick={handleSaveConfig}
                      disabled={isConfigSaving || !configData?.ID}
                    >
                      {isConfigSaving ? "Đang lưu..." : "Lưu cài đặt"}
                    </Button>
                    <Button
                      variant="soft"
                      onClick={() => setBulkUpdateDialogOpen(true)}
                    >
                      Cập nhật hàng loạt Description
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ) : (
              !loading && (
                <Box mt="4">
                  <Text mb="3">Không tìm thấy cấu hình cho ứng dụng này.</Text>
                  <Button
                    variant="soft"
                    onClick={() => setBulkUpdateDialogOpen(true)}
                  >
                    Cập nhật hàng loạt Description
                  </Button>
                </Box>
              )
            )}
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      {/* Dialog tạo deployment mới */}
      <CreateDeploymentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateDeployment={handleCreateDeployment}
      />

      {/* Dialog xác nhận xóa deployment */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xác nhận xóa deployment"
        description="Bạn có chắc chắn muốn xóa deployment"
        itemName={deploymentToDelete}
        onConfirm={handleDeleteDeployment}
      />

      {/* Modal hiển thị thông tin deployment mới */}
      <DeploymentInfoModal
        open={isNewDeployment}
        onOpenChange={setIsNewDeployment}
        deploymentName={newDeploymentName}
        deploymentKey={newDeploymentKey}
      />

      {/* Dialog cập nhật hàng loạt description */}
      <BulkUpdateDescriptionDialog
        open={bulkUpdateDialogOpen}
        onOpenChange={setBulkUpdateDialogOpen}
        appName={appName || ""}
      />
    </div>
  );
};

export default AppDetails;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heading, Button, Flex, Text, Box, TextField } from "@radix-ui/themes";
import { getApps, createApp } from "../services/api";
import "../styles/Dashboard.css";
import { AppTabs } from "@/components";
import { App } from "@/components/app/AppCard";
import { CreateAppDialog } from "@/components";
import { CreateQuickDeploymentDialog } from "@/components";
import { DeploymentInfoModal } from "@/components";
import { CreateQRCodeDialog } from "@/components";
import { UpdateAppDialog } from "@/components";

const Dashboard = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [quickDeploymentDialogOpen, setQuickDeploymentDialogOpen] =
    useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [updateAppDialogOpen, setUpdateAppDialogOpen] = useState(false);
  const [deploymentInfoOpen, setDeploymentInfoOpen] = useState(false);
  const [newDeploymentName, setNewDeploymentName] = useState("");
  const [newDeploymentKey, setNewDeploymentKey] = useState("");
  const [newIosDeploymentKey, setNewIosDeploymentKey] = useState("");
  const [isQuickDeployment, setIsQuickDeployment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchApps = async () => {
    setLoading(true);
    try {
      const response = await getApps();
      if (response && response.apps) {
        setApps(response.apps);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách ứng dụng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateApp = async (newApp: {
    name: string;
    os: string;
    platform: string;
  }) => {
    try {
      await createApp(newApp);
      setAppDialogOpen(false);
      fetchApps();
    } catch (error) {
      console.error("Lỗi khi tạo ứng dụng mới", error);
    }
  };

  const handleDeploymentSuccess = (
    name: string,
    androidKey: string,
    iosKey: string
  ) => {
    setNewDeploymentName(name);
    setNewDeploymentKey(androidKey);
    setNewIosDeploymentKey(iosKey);
    setIsQuickDeployment(true);
    setDeploymentInfoOpen(true);
  };

  const handleAppCardClick = (appName: string) => {
    navigate(`/apps/${appName}`);
  };

  // Lọc và nhóm ứng dụng
  const filterApps = () => {
    return apps.filter((app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Nhóm ứng dụng theo OS
  const iosApps = filterApps().filter(
    (app) => app.os === "iOS" || app.name.includes("_IOS")
  );
  const androidApps = filterApps().filter(
    (app) => app.os === "Android" || app.name.includes("_Android")
  );

  return (
    <div>
      {/* Desktop header */}
      <div className="dashboard-header desktop-only">
        <Heading size="5">Quản lý ứng dụng CodePush</Heading>
        <Flex gap="3">
          <Button variant="outline" onClick={() => setQrCodeDialogOpen(true)}>
            Tạo QR Code
          </Button>
          <Button
            variant="outline"
            onClick={() => setQuickDeploymentDialogOpen(true)}
          >
            Tạo nhanh Deployment
          </Button>
          <Button variant="outline" onClick={() => setUpdateAppDialogOpen(true)}>
            Update App
          </Button>
          <Button onClick={() => setAppDialogOpen(true)}>
            Tạo ứng dụng mới
          </Button>
        </Flex>
      </div>

      {/* Mobile header và action buttons */}
      <div className="mobile-only">
        <Heading size="5" className="mobile-page-title">
          Quản lý ứng dụng CodePush
        </Heading>
        <div className="mobile-action-buttons">
          <Button variant="outline" onClick={() => setQrCodeDialogOpen(true)}>
            Tạo QR Code
          </Button>
          <Button
            variant="outline"
            onClick={() => setQuickDeploymentDialogOpen(true)}
          >
            Tạo nhanh Deployment
          </Button>
          <Button variant="outline" onClick={() => setUpdateAppDialogOpen(true)}>
            Update App
          </Button>
          <Button onClick={() => setAppDialogOpen(true)}>
            Tạo ứng dụng mới
          </Button>
        </div>
      </div>

      <Box mb="4">
        <TextField.Root
          placeholder="Tìm kiếm ứng dụng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {loading ? (
        <Flex style={{ height: "300px" }} justify="center" align="center">
          <Text>Đang tải...</Text>
        </Flex>
      ) : (
        <AppTabs
          allApps={filterApps()}
          iosApps={iosApps}
          androidApps={androidApps}
          onAppClick={handleAppCardClick}
        />
      )}

      <CreateAppDialog
        open={appDialogOpen}
        onOpenChange={setAppDialogOpen}
        onCreateApp={handleCreateApp}
      />

      <CreateQuickDeploymentDialog
        open={quickDeploymentDialogOpen}
        onOpenChange={setQuickDeploymentDialogOpen}
        onCreateSuccess={handleDeploymentSuccess}
      />

      <DeploymentInfoModal
        open={deploymentInfoOpen}
        onOpenChange={setDeploymentInfoOpen}
        deploymentName={newDeploymentName}
        deploymentKey={newDeploymentKey}
        isQuickDeployment={isQuickDeployment}
        iosDeploymentKey={newIosDeploymentKey}
      />

      <CreateQRCodeDialog
        open={qrCodeDialogOpen}
        onOpenChange={setQrCodeDialogOpen}
      />

      <UpdateAppDialog
        open={updateAppDialogOpen}
        onOpenChange={setUpdateAppDialogOpen}
      />
    </div>
  );
};

export default Dashboard;

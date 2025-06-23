import { useState, useEffect, useMemo, memo } from "react";
import { Box, Text, Flex } from "@radix-ui/themes";
import { getApps, getDeployments } from "@/services/api";
import { App } from "@/components/app/AppCard";
import { Deployment } from "@/components/deployment/DeploymentCard";
import { SearchableSelect } from "@/components";
import { showErrorToast } from "@/components";
import { useResponsive } from "@/components/qrcode/ResponsiveQRHelper";

interface DeploymentSelectorsProps {
  androidApp: string;
  setAndroidApp: (value: string) => void;
  androidDeployment: string;
  setAndroidDeployment: (value: string) => void;
  iosApp: string;
  setIosApp: (value: string) => void;
  iosDeployment: string;
  setIosDeployment: (value: string) => void;
  isHiddenIosApp?: boolean;
  callBackHiddenIosApp?: (isHidden: boolean) => void;
}

const DeploymentSelectors = memo(
  ({
    androidApp,
    setAndroidApp,
    androidDeployment,
    setAndroidDeployment,
    iosApp,
    setIosApp,
    iosDeployment,
    setIosDeployment,
    isHiddenIosApp = false,
    callBackHiddenIosApp,
  }: DeploymentSelectorsProps) => {
    // Apps and deployments data
    const [androidApps, setAndroidApps] = useState<App[]>([]);
    const [iosApps, setIosApps] = useState<App[]>([]);
    const [androidDeployments, setAndroidDeployments] = useState<Deployment[]>(
      []
    );
    const [iosDeployments, setIosDeployments] = useState<Deployment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { isMobile } = useResponsive();

    // Chuyển đổi dữ liệu cho SearchableSelect
    const androidAppOptions = useMemo(
      () =>
        androidApps.map((app) => ({
          value: app.name,
          label: app.name,
        })),
      [androidApps]
    );

    const iosAppOptions = useMemo(
      () =>
        iosApps.map((app) => ({
          value: app.name,
          label: app.name,
        })),
      [iosApps]
    );

    const androidDeploymentOptions = useMemo(
      () =>
        androidDeployments.map((deployment) => ({
          value: deployment.name,
          label: deployment.name,
        })),
      [androidDeployments]
    );

    const iosDeploymentOptions = useMemo(
      () =>
        iosDeployments.map((deployment) => ({
          value: deployment.name,
          label: deployment.name,
        })),
      [iosDeployments]
    );

    // Fetch apps
    const fetchApps = async () => {
      setIsLoading(true);
      try {
        const response = await getApps();
        if (response && response.apps) {
          const allApps = response.apps;
          setAndroidApps(
            allApps.filter(
              (app: App) =>
                app.os === "Android" ||
                app.name.toLowerCase().includes("android")
            )
          );
          setIosApps(
            allApps.filter(
              (app: App) =>
                app.os === "iOS" || app.name.toLowerCase().includes("ios")
            )
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách ứng dụng:", error);
        showErrorToast("Không thể tải danh sách ứng dụng");
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch deployments
    const fetchAndroidDeployments = async () => {
      if (!androidApp) {
        setAndroidDeployments([]);
        setAndroidDeployment("");
        return;
      }

      setIsLoading(true);
      try {
        const response = await getDeployments(androidApp);
        if (response && response.deployments) {
          setAndroidDeployments(response.deployments);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách deployment:", error);
        showErrorToast("Không thể tải danh sách deployment Android");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchIosDeployments = async () => {
      if (!iosApp) {
        setIosDeployments([]);
        setIosDeployment("");
        return;
      }

      setIsLoading(true);
      try {
        const response = await getDeployments(iosApp);
        if (response && response.deployments) {
          setIosDeployments(response.deployments);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách deployment:", error);
        showErrorToast("Không thể tải danh sách deployment iOS");
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    useEffect(() => {
      fetchApps();
    }, []);

    // Load deployments when apps change
    useEffect(() => {
      fetchAndroidDeployments();
    }, [androidApp]);

    useEffect(() => {
      fetchIosDeployments();
    }, [iosApp]);

    // Handler cho việc thay đổi app
    const handleAndroidAppChange = (value: string) => {
      setAndroidApp(value);
      setAndroidDeployment(""); // Reset deployment khi đổi app

      if (isHiddenIosApp) {
        const result = iosApps.find(
          (item) => value.split("_")[0] === item.name.split("_")[0]
        );
        if (result) {
          setIosApp(result.name);
          setIosDeployment(""); // Reset deployment khi đổi app
        } else {
          setIosApp("");
          setIosDeployment("");
          if (typeof callBackHiddenIosApp === "function")
            callBackHiddenIosApp(false);
          showErrorToast(
            "Không tìm thấy tên ứng dụng IOS. Vui lòng chọn tên ứng dụng iOS tương ứng."
          );
        }
      }
    };

    const handleIosAppChange = (value: string) => {
      setIosApp(value);
      setIosDeployment(""); // Reset deployment khi đổi app
    };

    const handleAndroidDeployment = (value: string) => {
      setAndroidDeployment(value);

      if (isHiddenIosApp && iosApp.length > 0) {
        const result = iosDeploymentOptions.find(
          (item) => item.value === value
        );
        if (result) {
          setIosDeployment(result.value);
        } else {
          setIosDeployment("");
          showErrorToast(
            "Không tìm thấy bảng deployment tương ứng với IOS. Vui lòng chọn bảng deployment IOS tương ứng."
          );
        }
      }
    };

    return (
      <Box>
        <Flex direction={isMobile ? "column" : "row"} gap="4">
          <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Tên ứng dụng Android:
            </Text>
            <SearchableSelect
              options={androidAppOptions}
              value={androidApp}
              onChange={handleAndroidAppChange}
              placeholder="Chọn ứng dụng Android"
              emptyMessage="Không tìm thấy ứng dụng Android"
            />
          </Box>

          {!isHiddenIosApp && (
            <Box style={{ flex: 1 }}>
              <Text as="div" size="2" mb="1" weight="bold">
                Tên ứng dụng iOS:
              </Text>
              <SearchableSelect
                options={iosAppOptions}
                value={iosApp}
                onChange={handleIosAppChange}
                placeholder="Chọn ứng dụng iOS"
                emptyMessage="Không tìm thấy ứng dụng iOS"
              />
            </Box>
          )}
        </Flex>

        <Flex direction={isMobile ? "column" : "row"} gap="4" mt="3">
          <Box style={{ flex: 1 }}>
            <Text as="div" size="2" mb="1" weight="bold">
              Tên deployment Android:
            </Text>
            <SearchableSelect
              options={androidDeploymentOptions}
              value={androidDeployment}
              onChange={handleAndroidDeployment}
              placeholder="Chọn deployment Android"
              disabled={!androidApp || isLoading}
              emptyMessage="Không tìm thấy deployment Android"
            />
          </Box>

          {!isHiddenIosApp && (
            <Box style={{ flex: 1 }}>
              <Text as="div" size="2" mb="1" weight="bold">
                Tên deployment iOS:
              </Text>
              <SearchableSelect
                options={iosDeploymentOptions}
                value={iosDeployment}
                onChange={setIosDeployment}
                placeholder="Chọn deployment iOS"
                disabled={!iosApp || isLoading}
                emptyMessage="Không tìm thấy deployment iOS"
              />
            </Box>
          )}
        </Flex>
      </Box>
    );
  }
);

DeploymentSelectors.displayName = "DeploymentSelectors";

export default DeploymentSelectors;

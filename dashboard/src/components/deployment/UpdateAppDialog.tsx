import { useState, useEffect } from "react";
import {
  Dialog,
  Flex,
  Box,
  Text,
  Button,
  IconButton,
  Tabs,
  TextArea,
  TextField,
  Tooltip,
  Checkbox,
} from "@radix-ui/themes";
import {
  CodeIcon,
  Cross1Icon,
  ReloadIcon,
  CopyIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { showErrorToast, showSuccessToast } from "@/components";
import DeploymentSelectors from "@/components/deployment/DeploymentSelectors";
import { getDeploymentHistory } from "@/services/api";
import { useResponsive } from "@/components/qrcode/ResponsiveQRHelper";
import { getConfigByApp, updateApp } from "@/services/api_qrcode";
import { encryptData } from "@/utils/crypto-utils";
import copy from "copy-to-clipboard";

interface UpdateAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Định nghĩa interface cho form data
interface FormState {
  updateMethod: {
    key: {
      android: string;
      ios: string;
      version: string;
    };
    deployment: {
      androidApp: string;
      androidDeployment: string;
      iosApp: string;
      iosDeployment: string;
      branch: string;
    };
    description: {
      iosDescription: string;
      iosDescriptionMode: "base64" | "json";
      iosDescriptionError: string;
      androidDescription: string;
      androidDescriptionMode: "base64" | "json";
      androidDescriptionError: string;
    };
    scripText: {
      android: string;
      ios: string;
    };
  };
}

const UpdateAppDialog = ({ open, onOpenChange }: UpdateAppDialogProps) => {
  const { isMobile } = useResponsive();

  // Khởi tạo form state
  const [formState, setFormState] = useState<FormState>({
    updateMethod: {
      key: {
        android: "",
        ios: "",
        version: "",
      },
      deployment: {
        androidApp: "",
        androidDeployment: "",
        iosApp: "",
        iosDeployment: "",
        branch: "",
      },
      description: {
        iosDescription: "",
        iosDescriptionMode: "json",
        iosDescriptionError: "",
        androidDescription: "",
        androidDescriptionMode: "json",
        androidDescriptionError: "",
      },
      scripText: {
        android: "",
        ios: "",
      },
    },
  });

  // State for latest update description
  const [loading, setLoading] = useState<boolean>(false);

  // State cho đồng bộ Android và iOS
  const [syncAndroidIOS, setSyncAndroidIOS] = useState(true);

  // State cho feedback copy
  const [copied, setCopied] = useState<{ android: boolean; ios: boolean }>({
    android: false,
    ios: false,
  });

  // Reset states when dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // Reset the form
  const resetForm = () => {
    setFormState({
      updateMethod: {
        key: {
          android: "",
          ios: "",
          version: "",
        },
        deployment: {
          androidApp: "",
          androidDeployment: "",
          iosApp: "",
          iosDeployment: "",
          branch: "",
        },
        description: {
          iosDescription: "",
          iosDescriptionMode: "json",
          iosDescriptionError: "",
          androidDescription: "",
          androidDescriptionMode: "json",
          androidDescriptionError: "",
        },
        scripText: {
          android: "",
          ios: "",
        },
      },
    });
    setCopied({ android: false, ios: false });
    setLoading(false);
  };

  // Load the latest update description when deployment is selected
  const fetchLatestUpdate = async (isAndroid: boolean) => {
    if (!open) return;
    if (
      isAndroid &&
      (formState.updateMethod.deployment.androidDeployment.length === 0 ||
        formState.updateMethod.deployment.androidApp.length === 0)
    ) {
      showErrorToast("Không thể lấy được thông tin bản cập nhật Android");
      return;
    }

    if (
      !isAndroid &&
      (formState.updateMethod.deployment.iosApp.length === 0 ||
        formState.updateMethod.deployment.iosDeployment.length === 0)
    ) {
      showErrorToast("Không thể lấy được thông tin bản cập nhật IOS");
      return;
    }

    // Determine which one to use (Android is preferred if both are set)
    const appName = isAndroid
      ? formState.updateMethod.deployment.androidApp
      : formState.updateMethod.deployment.iosApp;
    const deploymentName = isAndroid
      ? formState.updateMethod.deployment.androidDeployment
      : formState.updateMethod.deployment.iosDeployment;

    setLoading(true);
    try {
      // Fetch deployment history
      // const historyData = await getDeploymentHistory(appName, deploymentName);
      // const config = await getConfigByApp(isAndroid, appName, deploymentName);
      const [historyData, config] = await Promise.all([
        getDeploymentHistory(appName, deploymentName),
        getConfigByApp(isAndroid, appName),
      ]);
      if (
        historyData &&
        historyData.history &&
        historyData.history.length > 0
      ) {
        // Sort by upload time to get the latest
        const sortedHistory = [...historyData.history].sort(
          (a, b) => b.uploadTime - a.uploadTime
        );

        const desc = sortedHistory[0].description;

        if (!desc) {
          showErrorToast("Không thể lấy được thông tin bản cập nhật");
          return;
        }

        updateFormState(
          "updateMethod",
          base64ToJSON(desc),
          "description",
          isAndroid ? "androidDescription" : "iosDescription"
        );

        if (
          config?.NameAppAndroid &&
          config?.NameAppIOS &&
          config?.VersionAndroid &&
          config?.VersionIOS
        ) {
          if (formState.updateMethod.deployment.androidDeployment) {
            updateFormState(
              "updateMethod",
              `code-push-standalone release-react
            ${config?.NameAppAndroid} android -d
             ${formState.updateMethod.deployment.androidDeployment}
              --description "${desc}" -m -t "${config?.VersionAndroid}"`,
              "scripText",
              "android"
            );
          }

          if (formState.updateMethod.deployment.iosDeployment) {
            updateFormState(
              "updateMethod",
              `code-push-standalone release-react 
            ${config?.NameAppIOS} ios -d ${formState.updateMethod.deployment.iosDeployment} 
            --description "${desc}" -m -t ${config?.VersionIOS}`,
              "scripText",
              "ios"
            );
          }
        }
      }
    } catch (error) {
      showErrorToast("Không thể tải thông tin bản cập nhật");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formState.updateMethod.deployment.androidApp) fetchLatestUpdate(true);
  }, [formState.updateMethod.deployment.androidDeployment]);

  useEffect(() => {
    if (formState.updateMethod.deployment.iosApp) fetchLatestUpdate(false);
  }, [formState.updateMethod.deployment.iosDeployment]);

  // Load branch history when deployment changes
  useEffect(() => {
    const loadBranchHistory = () => {
      let branchKey = "";
      if (syncAndroidIOS) {
        if (
          formState.updateMethod.deployment.androidApp &&
          formState.updateMethod.deployment.androidDeployment
        ) {
          branchKey = `branch_history_${formState.updateMethod.deployment.androidApp}_${formState.updateMethod.deployment.androidDeployment}`;
        }
      } else {
        if (
          formState.updateMethod.deployment.androidApp &&
          formState.updateMethod.deployment.androidDeployment
        ) {
          branchKey = `branch_history_${formState.updateMethod.deployment.androidApp}_${formState.updateMethod.deployment.androidDeployment}`;
        } else if (
          formState.updateMethod.deployment.iosApp &&
          formState.updateMethod.deployment.iosDeployment
        ) {
          branchKey = `branch_history_${formState.updateMethod.deployment.iosApp}_${formState.updateMethod.deployment.iosDeployment}`;
        }
      }

      if (branchKey) {
        const storedBranch = localStorage.getItem(branchKey);
        if (storedBranch !== null) {
          setFormState((prevState) => ({
            ...prevState,
            updateMethod: {
              ...prevState.updateMethod,
              deployment: {
                ...prevState.updateMethod.deployment,
                branch: storedBranch,
              },
            },
          }));
        } else {
          // If no history, clear the branch field
          setFormState((prevState) => ({
            ...prevState,
            updateMethod: {
              ...prevState.updateMethod,
              deployment: {
                ...prevState.updateMethod.deployment,
                branch: "",
              },
            },
          }));
        }
      } else {
        // Clear branch if no valid app/deployment is selected
        setFormState((prevState) => ({
          ...prevState,
          updateMethod: {
            ...prevState.updateMethod,
            deployment: {
              ...prevState.updateMethod.deployment,
              branch: "",
            },
          },
        }));
      }
    };

    loadBranchHistory();
  }, [
    formState.updateMethod.deployment.androidApp,
    formState.updateMethod.deployment.androidDeployment,
    formState.updateMethod.deployment.iosApp,
    formState.updateMethod.deployment.iosDeployment,
    syncAndroidIOS,
  ]);

  // Validation check
  const isValid = () => {
    // Yêu cầu có ít nhất một cặp app và deployment (Android hoặc iOS) và branch phải có giá trị
    return (
      (formState.updateMethod.deployment.androidDeployment ||
        (!syncAndroidIOS && formState.updateMethod.deployment.iosDeployment)) &&
      formState.updateMethod.deployment.branch.trim() !== ""
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isValid()) {
      if (
        !formState.updateMethod.deployment.androidDeployment &&
        !syncAndroidIOS &&
        !formState.updateMethod.deployment.iosDeployment
      ) {
        showErrorToast("Vui lòng chọn ít nhất một ứng dụng và deployment");
      } else if (formState.updateMethod.deployment.branch.trim() === "") {
        showErrorToast("Vui lòng nhập tên branch");
      }
      return;
    }

    let descriptionAndroid =
      formState.updateMethod.description.androidDescription;
    let descriptionIOS = formState.updateMethod.description.iosDescription;

    // Kiểm tra thông tin bản update android có hợp lệ hay không
    if (descriptionAndroid.length > 0) {
      if (
        formState.updateMethod.description.androidDescriptionMode ===
          "base64" &&
        !isBase64JSON(descriptionAndroid)
      ) {
        updateFormState(
          "updateMethod",
          "Base64 không hợp lệ",
          "description",
          "androidDescriptionError"
        );
        return;
      } else if (
        formState.updateMethod.description.androidDescriptionMode === "json" &&
        !isValidJSON(descriptionAndroid)
      ) {
        updateFormState(
          "updateMethod",
          "Json không hợp lệ",
          "description",
          "androidDescriptionError"
        );
        return;
      }
    }

    // Kiểm tra thông tin bản update IOS có hợp lệ hay không
    if (descriptionIOS.length > 0) {
      if (
        formState.updateMethod.description.iosDescriptionError === "base64" &&
        !isBase64JSON(descriptionIOS)
      ) {
        updateFormState(
          "updateMethod",
          "Base64 không hợp lệ",
          "description",
          "iosDescriptionError"
        );
        return;
      } else if (
        formState.updateMethod.description.iosDescriptionError === "json" &&
        !isValidJSON(descriptionIOS)
      ) {
        updateFormState(
          "updateMethod",
          "Json không hợp lệ",
          "description",
          "iosDescriptionError"
        );
        return;
      }
    }

    setLoading(true);
    try {
      // Thông báo thành công

      const iosDescription = formState.updateMethod.description.iosDescription,
        androidDescription =
          formState.updateMethod.description.androidDescription;
      const accessKey = localStorage.getItem("token") || "";
      if (accessKey.length === 0) {
        showErrorToast("Không lấy được Access key từ Github");
        return;
      }

      const rs = await updateApp({
        iosApp: formState.updateMethod.deployment.iosApp,
        iosDeployment: formState.updateMethod.deployment.iosDeployment,
        iosDescription:
          formState.updateMethod.description.iosDescriptionMode === "json"
            ? jsonToBase64(iosDescription)
            : iosDescription,
        androidApp: formState.updateMethod.deployment.androidApp,
        androidDeployment: formState.updateMethod.deployment.androidDeployment,
        androidDescription:
          formState.updateMethod.description.androidDescriptionMode === "json"
            ? jsonToBase64(androidDescription)
            : androidDescription,
        branch: formState.updateMethod.deployment.branch,
        accessKey: encryptData(accessKey),
      });

      if (rs?.success && rs?.result) {
        showSuccessToast(rs?.result);

        // Save branch history
        const currentBranch = formState.updateMethod.deployment.branch;
        if (syncAndroidIOS) {
          if (
            formState.updateMethod.deployment.androidApp &&
            formState.updateMethod.deployment.androidDeployment
          ) {
            const key = `branch_history_${formState.updateMethod.deployment.androidApp}_${formState.updateMethod.deployment.androidDeployment}`;
            localStorage.setItem(key, currentBranch);
          }
        } else {
          if (
            formState.updateMethod.deployment.androidApp &&
            formState.updateMethod.deployment.androidDeployment
          ) {
            const key = `branch_history_${formState.updateMethod.deployment.androidApp}_${formState.updateMethod.deployment.androidDeployment}`;
            localStorage.setItem(key, currentBranch);
          }
          if (
            formState.updateMethod.deployment.iosApp &&
            formState.updateMethod.deployment.iosDeployment
          ) {
            const key = `branch_history_${formState.updateMethod.deployment.iosApp}_${formState.updateMethod.deployment.iosDeployment}`;
            localStorage.setItem(key, currentBranch);
          }
        }

        // Đóng dialog
        onOpenChange(false);
      } else if (typeof rs?.result === "string") {
        showErrorToast(rs?.result);
      } else {
        showErrorToast("Đã xảy ra lỗi khi cập nhật ứng dụng");
      }
    } catch (error) {
      showErrorToast("Đã xảy ra lỗi khi cập nhật ứng dụng");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật form state
  const updateFormState = (
    path: keyof FormState | string,
    value: any,
    subPath?: string,
    subSubPath?: string
  ) => {
    setFormState((prevState) => {
      const newState = { ...prevState };

      if (subPath && subSubPath) {
        // Cập nhật nested path như updateMethod.key.android
        (newState[path as keyof FormState] as any)[subPath][subSubPath] = value;
      } else if (subPath) {
        // Cập nhật nested path như customer.code
        (newState[path as keyof FormState] as any)[subPath] = value;
      } else {
        // Cập nhật path trực tiếp
        (newState as any)[path] = value;
      }

      return newState;
    });
  };

  // Hàm chuyển đổi Base64 sang JSON
  const base64ToJSON = (base64: string): string => {
    try {
      // Giải mã Base64 thành chuỗi
      const decodedString = decodeURIComponent(escape(atob(base64)));
      // Thử phân tích chuỗi thành đối tượng JSON
      const jsonObject = JSON.parse(decodedString);
      // Format JSON với 2 dấu cách
      return JSON.stringify(jsonObject, null, 2);
    } catch (error) {
      console.error("Lỗi khi chuyển đổi Base64 sang JSON:", error);
      return base64; // Trả về chuỗi gốc nếu có lỗi
    }
  };

  // Hàm chuyển đổi JSON sang Base64
  const jsonToBase64 = (jsonString: string): string => {
    try {
      // Phân tích chuỗi thành đối tượng JSON để đảm bảo cú pháp hợp lệ
      const jsonObject = JSON.parse(jsonString);
      // Chuyển đối tượng JSON thành chuỗi không có định dạng
      const compactJsonString = JSON.stringify(jsonObject);
      // Mã hóa chuỗi thành Base64
      return btoa(unescape(encodeURIComponent(compactJsonString)));
    } catch (error) {
      console.error("Lỗi khi chuyển đổi JSON sang Base64:", error);
      return jsonString; // Trả về chuỗi gốc nếu có lỗi
    }
  };

  // Hàm kiểm tra chuỗi có phải là Base64 hợp lệ và JSON không
  const isBase64JSON = (str: string): boolean => {
    try {
      if (!str) return false;

      // Kiểm tra xem có phải chuỗi Base64 không
      const decoded = decodeURIComponent(escape(atob(str)));
      // Kiểm tra xem có phải JSON không
      JSON.parse(decoded);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Hàm kiểm tra chuỗi có phải là JSON hợp lệ không
  const isValidJSON = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Chuyển đổi chế độ hiển thị và format nội dung tương ứng
  const toggleDescriptionMode = (isAndroid: boolean) => {
    const descriptionMode =
      formState.updateMethod.description[
        isAndroid ? "androidDescriptionMode" : "iosDescriptionMode"
      ];
    const description =
      formState.updateMethod.description[
        isAndroid ? "androidDescription" : "iosDescription"
      ];
    const error =
      formState.updateMethod.description[
        isAndroid ? "androidDescriptionError" : "iosDescriptionError"
      ];
    if (descriptionMode === "base64") {
      if (!isBase64JSON(description)) {
        updateFormState(
          "updateMethod",
          "Base64 không hợp lệ, không thể chuyển đổi sang Json",
          "description",
          isAndroid ? "androidDescriptionError" : "iosDescriptionError"
        );
        return;
      }

      // Chuyển từ base64 (đang hiển thị JSON) sang chế độ JSON
      updateFormState(
        "updateMethod",
        "json",
        "description",
        isAndroid ? "androidDescriptionMode" : "iosDescriptionMode"
      );
      updateFormState(
        "updateMethod",
        base64ToJSON(description),
        "description",
        isAndroid ? "androidDescription" : "iosDescription"
      );
    } else {
      if (!isValidJSON(description)) {
        updateFormState(
          "updateMethod",
          "Json không hợp lệ, không thể chuyển đổi sang Base64",
          "description",
          isAndroid ? "androidDescriptionError" : "iosDescriptionError"
        );
        return;
      }

      // Chuyển từ base64 (đang hiển thị JSON) sang chế độ JSON
      updateFormState(
        "updateMethod",
        "base64",
        "description",
        isAndroid ? "androidDescriptionMode" : "iosDescriptionMode"
      );
      updateFormState(
        "updateMethod",
        jsonToBase64(description),
        "description",
        isAndroid ? "androidDescription" : "iosDescription"
      );
    }

    if (error.length > 0) {
      updateFormState(
        "updateMethod",
        "",
        "description",
        isAndroid ? "androidDescriptionError" : "iosDescriptionError"
      );
    }
  };

  const renderDescription = (isAndroid: boolean) => {
    const descriptionMode =
      formState.updateMethod.description[
        isAndroid ? "androidDescriptionMode" : "iosDescriptionMode"
      ];
    const descriptionError =
      formState.updateMethod.description[
        isAndroid ? "androidDescriptionError" : "iosDescriptionError"
      ];
    return (
      <Box>
        <Flex justify="between" align="center" mb="1">
          <Text as="div" size="2" weight="bold">
            {isAndroid ? "Android" : "IOS"}
          </Text>
          <Flex gap="2" align="center">
            <Text size="1" color="gray">
              Chế độ: {descriptionMode === "base64" ? "Base64" : "JSON"}
            </Text>
            <Button
              variant="soft"
              size="1"
              onClick={() => toggleDescriptionMode(isAndroid)}
            >
              <CodeIcon />
              Chuyển đổi
            </Button>
          </Flex>
        </Flex>

        <TextArea
          placeholder={
            descriptionMode === "base64"
              ? "Nhập Base64 cho phiên bản này"
              : "Nhập JSON cho phiên bản này"
          }
          value={
            formState.updateMethod.description[
              isAndroid ? "androidDescription" : "iosDescription"
            ]
          }
          onChange={(e) => {
            debugger
            updateFormState(
              "updateMethod",
              e.target.value,
              "description",
              isAndroid ? "androidDescription" : "iosDescription"
            );

            if (descriptionMode === "base64") {
              if (isBase64JSON(e.target.value)) {
                const script = isAndroid
                  ? formState.updateMethod.scripText.android.split(/\s+/).join(' ').split(" ")
                  : formState.updateMethod.scripText.ios.split(/\s+/).join(' ').split(" ");
                if (script[7]) {
                  script[7] = `"${e.target.value}"`;
                  updateFormState(
                    "updateMethod",
                    script.join(" "),
                    "scripText",
                    isAndroid ? "android" : "ios"
                  );
                  updateFormState(
                    "updateMethod",
                    "",
                    "description",
                    isAndroid
                      ? "androidDescriptionError"
                      : "iosDescriptionError"
                  );
                }
              } else {
                updateFormState(
                  "updateMethod",
                  "Base64 không hợp lệ",
                  "description",
                  isAndroid ? "androidDescriptionError" : "iosDescriptionError"
                );
              }
            } else {
              if (isValidJSON(e.target.value)) {
                const script = isAndroid
                  ? formState.updateMethod.scripText.android.split(/\s+/).join(' ').split(" ")
                  : formState.updateMethod.scripText.ios.split(/\s+/).join(' ').split(" ");
                if (script[7]) {
                  script[7] = `"${jsonToBase64(e.target.value)}"`;
                  updateFormState(
                    "updateMethod",
                    script.join(" "),
                    "scripText",
                    isAndroid ? "android" : "ios"
                  );
                  updateFormState(
                    "updateMethod",
                    "",
                    "description",
                    isAndroid
                      ? "androidDescriptionError"
                      : "iosDescriptionError"
                  );
                }
              } else {
                updateFormState(
                  "updateMethod",
                  "Json không hợp lệ",
                  "description",
                  isAndroid ? "androidDescriptionError" : "iosDescriptionError"
                );
              }
            }
          }}
          style={{
            height: 100,
            minHeight: 100,
            fontFamily: "monospace",
            backgroundColor:
              descriptionMode === "base64" ? "#f8f9fc" : undefined,
          }}
        />

        {descriptionError.length > 0 && (
          <Text color="red" size="1" mt="1">
            {descriptionError}
          </Text>
        )}

        <Text as="div" size="1" color="gray" mt="1">
          {descriptionMode === "base64"
            ? "Đang hiển thị giá trị Base64 gốc"
            : "Dữ liệu sẽ được chuyển đổi về Base64 khi lưu"}
        </Text>
      </Box>
    );
  };

  // Hàm copy script
  const handleCopy = (text: string, type: "android" | "ios") => {
    try {
      const success = copy(text);
      if (success) {
        showSuccessToast(`Đã copy script của${type ? ` ${type}` : ""}`);
        setCopied((prev) => ({ ...prev, [type]: true }));
      } else {
        showErrorToast("Không thể copy. Vui lòng thử lại");
      }
    } catch (error) {
      showErrorToast("Không thể copy. Vui lòng thử lại");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{
          maxWidth: 800,
          width: isMobile ? "calc(100vw - 32px)" : "800px",
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          margin: "auto",
        }}
      >
        <Flex direction="column" style={{ height: "100%" }}>
          <Flex justify="between" mb="4">
            <Dialog.Title>Cập nhật ứng dụng</Dialog.Title>
            <Dialog.Close>
              <IconButton variant="ghost" color="gray">
                <Cross1Icon />
              </IconButton>
            </Dialog.Close>
          </Flex>

          <Flex direction="column" style={{ flex: 1 }}>
            <Tabs.Root defaultValue="update">
              <Tabs.List>
                <Tabs.Trigger value="update">Cập nhật</Tabs.Trigger>
              </Tabs.List>

              <Box p="3">
                <Tabs.Content value="update">
                  {/* Thêm radio đồng bộ Android và iOS */}
                  <Flex align="start" mb="3" gap="2">
                    <Checkbox
                      style={{ marginTop: "4px" }}
                      checked={syncAndroidIOS}
                      onCheckedChange={(checked) =>
                        setSyncAndroidIOS(!!checked)
                      }
                      id="sync-checkbox"
                    />
                    <div>
                      <label
                        htmlFor="sync-checkbox"
                        style={{ cursor: "pointer", userSelect: "none" }}
                      >
                        Đồng bộ Android và iOS
                      </label>
                      <Text
                        as="div"
                        size="1"
                        color="gray"
                        mt="1"
                        style={{ cursor: "pointer", userSelect: "none" }}
                      >
                        (Nếu chọn đồng bộ thì không cần chọn ứng dụng và
                        deployment IOS, hệ thống sẽ xử lý câu lệnh update cho
                        IOS)
                      </Text>
                    </div>
                  </Flex>
                  <Text as="div" size="2" weight="bold" mb="3">
                    Chọn ứng dụng và deployment để cập nhật:
                  </Text>

                  {/* Nếu đồng bộ thì chỉ hiển thị phần chọn Android */}
                  <DeploymentSelectors
                    androidApp={formState.updateMethod.deployment.androidApp}
                    setAndroidApp={(value) =>
                      updateFormState(
                        "updateMethod",
                        value,
                        "deployment",
                        "androidApp"
                      )
                    }
                    androidDeployment={
                      formState.updateMethod.deployment.androidDeployment
                    }
                    setAndroidDeployment={(value) =>
                      updateFormState(
                        "updateMethod",
                        value,
                        "deployment",
                        "androidDeployment"
                      )
                    }
                    iosApp={formState.updateMethod.deployment.iosApp}
                    setIosApp={(value) =>
                      updateFormState(
                        "updateMethod",
                        value,
                        "deployment",
                        "iosApp"
                      )
                    }
                    iosDeployment={
                      formState.updateMethod.deployment.iosDeployment
                    }
                    setIosDeployment={(value) =>
                      updateFormState(
                        "updateMethod",
                        value,
                        "deployment",
                        "iosDeployment"
                      )
                    }
                    isHiddenIosApp={syncAndroidIOS}
                    callBackHiddenIosApp={setSyncAndroidIOS}
                  />

                  {(formState.updateMethod.deployment.androidDeployment ||
                    formState.updateMethod.deployment.iosDeployment) && (
                    <>
                      <Text as="div" size="2" mb="1" mt="3" weight="bold">
                        Mô tả (Description):
                      </Text>

                      <Flex
                        direction={isMobile ? "column" : "row"}
                        gap="4"
                        mt="4"
                      >
                        <Box style={{ flex: 1 }}>
                          {formState.updateMethod.deployment
                            .androidDeployment && renderDescription(true)}
                        </Box>
                        <Box style={{ flex: 1 }}>
                          {formState.updateMethod.deployment.iosDeployment &&
                            renderDescription(false)}
                        </Box>
                      </Flex>

                      {formState.updateMethod.scripText.android.length > 0 && (
                        <Box mt="3">
                          <label>
                            <Flex align="center" mb="1" gap="2">
                              <Text as="div" size="2" weight="bold">
                                Script Android:
                              </Text>
                              <Tooltip
                                content={copied.android ? "Đã copy!" : "Copy"}
                              >
                                <IconButton
                                  variant="soft"
                                  size="1"
                                  onClick={() =>
                                    handleCopy(
                                      formState.updateMethod.scripText.android,
                                      "android"
                                    )
                                  }
                                >
                                  {copied.android ? (
                                    <CheckIcon />
                                  ) : (
                                    <CopyIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Flex>
                            <Flex direction="column" gap="2">
                              <Box
                                style={{
                                  backgroundColor: "#f4f4f4",
                                  padding: "10px",
                                  borderRadius: "4px",
                                  fontFamily: "monospace",
                                  overflowX: "auto",
                                }}
                              >
                                {formState.updateMethod.scripText.android}
                              </Box>
                            </Flex>
                          </label>
                        </Box>
                      )}

                      {formState.updateMethod.scripText.ios.length > 0 && (
                        <Box mt="3">
                          <label>
                            <Flex align="center" mb="1" gap="2">
                              <Text as="div" size="2" weight="bold">
                                Script IOS:
                              </Text>
                              <Tooltip
                                content={copied.ios ? "Đã copy!" : "Copy"}
                              >
                                <IconButton
                                  variant="soft"
                                  size="1"
                                  onClick={() =>
                                    handleCopy(
                                      formState.updateMethod.scripText.ios,
                                      "ios"
                                    )
                                  }
                                >
                                  {copied.ios ? <CheckIcon /> : <CopyIcon />}
                                </IconButton>
                              </Tooltip>
                            </Flex>
                            <Flex direction="column" gap="2">
                              <Box
                                style={{
                                  backgroundColor: "#f4f4f4",
                                  padding: "10px",
                                  borderRadius: "4px",
                                  fontFamily: "monospace",
                                  overflowX: "auto",
                                }}
                              >
                                {formState.updateMethod.scripText.ios}
                              </Box>
                            </Flex>
                          </label>
                        </Box>
                      )}

                      <Box mt="3">
                        <label>
                          <Text as="div" size="2" mb="1" weight="bold">
                            Tên branch (Git):
                          </Text>
                          <TextField.Root
                            placeholder="Nhập tên branch (ví dụ: main, develop...)"
                            value={formState.updateMethod.deployment.branch}
                            onChange={(e) =>
                              updateFormState(
                                "updateMethod",
                                e.target.value,
                                "deployment",
                                "branch"
                              )
                            }
                          />
                        </label>
                      </Box>
                    </>
                  )}
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Hủy</Button>
            </Dialog.Close>
            <Button disabled={!isValid() || loading} onClick={handleSubmit}>
              {loading ? (
                <>
                  <ReloadIcon className="spinner" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật ứng dụng"
              )}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default UpdateAppDialog;

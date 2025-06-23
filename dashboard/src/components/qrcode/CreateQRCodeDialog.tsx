import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  Flex,
  Box,
  Text,
  Button,
  IconButton,
  TextField,
  RadioGroup,
  Card,
  Tabs,
  Grid,
} from "@radix-ui/themes";
import {
  Cross1Icon,
  UploadIcon,
  TrashIcon,
  ReloadIcon,
  DownloadIcon,
  PersonIcon,
  Link2Icon,
  GearIcon,
} from "@radix-ui/react-icons";
import { showErrorToast, showSuccessToast } from "@/components";
import DeploymentSelectors from "@/components/deployment/DeploymentSelectors";
import { createQRCode, updateQRCode } from "@/services/api_qrcode";
import { useResponsive } from "@/components/qrcode/ResponsiveQRHelper";

// Interface cho QRCodeData
interface QRCodeData {
  ID: string;
  CusCode: string;
  CusName: string;
  UriHR: string;
  UriMain: string;
  UriPor: string;
  UriSys: string;
  UriCenter: string;
  UriIdentity: string | null;
  VersionCode: string;
  keyUpdateAndroid: string;
  keyUpdateIos: string;
  QRCodeBase64: string;
  DecAlgorithm?: string;
}

// Định nghĩa interface cho form data
interface FormState {
  customer: {
    code: string;
    name: string;
    image: File | null;
    imagePreview: string | null;
  };
  links: {
    main: string;
    hr: string;
    system: string;
    portal: string;
    center: string;
    identity: string;
  };
  updateMethod: {
    option: "key" | "deployment";
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
    };
  };
}

// Định nghĩa interface cho UI state
interface UIState {
  isDragging: boolean;
  loading: boolean;
  showForm: boolean;
  formValid: boolean;
  qrCodeBase64: string | null;
  createdCustomer: any | null;
  needRefresh?: boolean;
}

interface CreateQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean, refreshNeeded?: boolean) => void;
  editData?: QRCodeData; // Thêm props để nhận dữ liệu chỉnh sửa
  isEditing?: boolean; // Flag để xác định đang ở chế độ chỉnh sửa
}

const CreateQRCodeDialog = ({
  open,
  onOpenChange,
  editData,
  isEditing = false,
}: CreateQRCodeDialogProps) => {
  const { isMobile } = useResponsive();
  
  // Khởi tạo form state
  const [formState, setFormState] = useState<FormState>({
    customer: {
      code: "",
      name: "",
      image: null,
      imagePreview: null,
    },
    links: {
      main: "",
      hr: "",
      system: "",
      portal: "",
      center: "",
      identity: "",
    },
    updateMethod: {
      option: "key",
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
      },
    },
  });

  // Khởi tạo UI state
  const [uiState, setUIState] = useState<UIState>({
    isDragging: false,
    loading: false,
    showForm: true,
    formValid: false,
    qrCodeBase64: null,
    createdCustomer: null,
    needRefresh: false
  });

  // Initial load
  useEffect(() => {
    if (open) {
      if (isEditing && editData) {
        // Nếu đang ở chế độ chỉnh sửa và có dữ liệu, điền vào form
        fillFormWithEditData();
      } else {
        resetForm();
      }
    }
  }, [open, editData, isEditing]);

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

  // Cập nhật UI state
  const updateUIState = (key: keyof UIState, value: any) => {
    setUIState((prev) => ({ ...prev, [key]: value }));
  };

  // Điền form với dữ liệu chỉnh sửa
  const fillFormWithEditData = () => {
    if (!editData) return;

    // Cập nhật form state với dữ liệu chỉnh sửa
    setFormState({
      customer: {
        code: editData.CusCode || "",
        name: editData.CusName || "",
        image: null,
        imagePreview: null,
      },
      links: {
        main: editData.UriMain || "",
        hr: editData.UriHR || "",
        system: editData.UriSys || "",
        portal: editData.UriPor || "",
        center: editData.UriCenter || "",
        identity: editData.UriIdentity || "",
      },
      updateMethod: {
        option: "key",
        key: {
          android: editData.keyUpdateAndroid || "",
          ios: editData.keyUpdateIos || "",
          version: editData.VersionCode || "",
        },
        deployment: {
          androidApp: "",
          androidDeployment: "",
          iosApp: "",
          iosDeployment: "",
        },
      },
    });

    // Cập nhật UI state
    setUIState({
      ...uiState,
      showForm: true,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormState({
      customer: {
        code: "",
        name: "",
        image: null,
        imagePreview: null,
      },
      links: {
        main: "",
        hr: "",
        system: "",
        portal: "",
        center: "",
        identity: "",
      },
      updateMethod: {
        option: "key",
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
        },
      },
    });

    setUIState({
      isDragging: false,
      loading: false,
      showForm: true,
      formValid: false,
      qrCodeBase64: null,
      createdCustomer: null,
      needRefresh: false
    });
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          updateFormState("customer", {
            ...formState.customer,
            image: file,
            imagePreview: e.target.result as string,
          });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateUIState("isDragging", true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateUIState("isDragging", false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uiState.isDragging) {
        updateUIState("isDragging", true);
      }
    },
    [uiState.isDragging]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      updateUIState("isDragging", false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        // Kiểm tra xem file có phải là hình ảnh không
        if (file.type.match("image.*")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              updateFormState("customer", {
                ...formState.customer,
                image: file,
                imagePreview: e.target.result as string,
              });
            }
          };
          reader.readAsDataURL(file);
        } else {
          showErrorToast("File không phải là hình ảnh");
        }
      }
    },
    [formState.customer]
  );

  const handleRemoveImage = () => {
    updateFormState("customer", {
      ...formState.customer,
      image: null,
      imagePreview: null,
    });
  };

  // Validate form
  useEffect(() => {
    const { customer, links, updateMethod } = formState;

    const requiredFieldsValid =
      customer.code.trim() !== "" &&
      customer.name.trim() !== "" &&
      links.main.trim() !== "" &&
      links.hr.trim() !== "" &&
      links.system.trim() !== "" &&
      links.portal.trim() !== "";

    let optionFieldsValid = false;

    if (updateMethod.option === "key") {
      optionFieldsValid =
        updateMethod.key.android.trim() !== "" &&
        updateMethod.key.ios.trim() !== "" &&
        updateMethod.key.version.trim() !== "";
    } else {
      optionFieldsValid =
        updateMethod.deployment.androidApp.trim() !== "" &&
        updateMethod.deployment.androidDeployment.trim() !== "" &&
        updateMethod.deployment.iosApp.trim() !== "" &&
        updateMethod.deployment.iosDeployment.trim() !== "";
    }
    
    const isFormValid = requiredFieldsValid && optionFieldsValid;
    
    updateUIState("formValid", isFormValid);
  }, [formState]);

  const handleCreateQRCode = async () => {
    if (!uiState.formValid) return;

    updateUIState("loading", true);
    try {
      // Tạo FormData mới
      const formData = new FormData();

      // Tạo đối tượng customer data
      const { customer, links, updateMethod } = formState;
      const customerData = {
        CusCode: customer.code,
        CusName: customer.name,
        UriMain: links.main,
        UriHR: links.hr,
        UriSys: links.system,
        UriPor: links.portal,
        UriCenter: links.center || "",
        UriIdentity: links.identity || "",
        VersionCode:
          updateMethod.option === "key"
            ? updateMethod.key.version
            : updateMethod.deployment.androidDeployment,
        keyUpdateAndroid:
          updateMethod.option === "key"
            ? updateMethod.key.android
            : updateMethod.deployment.androidDeployment,
        keyUpdateIos:
          updateMethod.option === "key"
            ? updateMethod.key.ios
            : updateMethod.deployment.iosDeployment,
      };

      // Nếu đang chỉnh sửa, thêm ID vào dữ liệu
      if (isEditing && editData) {
        (customerData as any).ID = editData.ID;
      }

      // Thêm dữ liệu JSON vào FormData
      formData.append("data", JSON.stringify(customerData));

      // Thêm dữ liệu hình ảnh nếu có
      if (customer.image) {
        formData.append("logo", customer.image);
      }

      let response;
      if (isEditing && editData) {
        // Gọi API cập nhật QR Code
        response = await updateQRCode(formData);
      } else {
        // Gọi API tạo QR Code mới
        response = await createQRCode(formData);
      }

      if (response && response.status === "SUCCESS") {
        showSuccessToast(
          isEditing
            ? "Đã cập nhật QR Code thành công"
            : "Đã tạo QR Code thành công"
        );

        // Lưu thông tin QR code và customer để hiển thị
        if (response.data?.QRCodeBase64) {
          setUIState({
            ...uiState,
            qrCodeBase64: response.data.QRCodeBase64,
            createdCustomer: response.data,
            showForm: false,
            loading: false,
          });
        }
        
        // Đánh dấu cần refresh danh sách
        updateUIState("needRefresh", true);
      } else {
        if (response && response.status === "EXIST") {
          showErrorToast("Mã khách hàng đã tồn tại");
        } else {
          throw new Error("Phản hồi không hợp lệ từ máy chủ");
        }
      }
    } catch (error) {
      showErrorToast(
        isEditing && editData
          ? "Đã xảy ra lỗi khi chỉnh sửa QR Code"
          : "Đã xảy ra lỗi khi tạo QR Code"
      );
    } finally {
      updateUIState("loading", false);
    }
  };

  // Tải xuống QR code
  const handleDownloadQR = () => {
    if (!uiState.qrCodeBase64) return;

    const link = document.createElement("a");
    link.href = uiState.qrCodeBase64;
    link.download = `QRCode-${formState.customer.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chuyển đổi giữa hiển thị form và QR code
  const toggleView = () => {
    updateUIState("showForm", !uiState.showForm);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onOpenChange(isOpen, uiState.needRefresh);
        }
      }}
    >
      <Dialog.Content 
        style={{ 
          maxWidth: 800, 
          width: isMobile ? "calc(100vw - 32px)" : "800px",
          height: isMobile ? "calc(100vh - 64px)" : "600px",
          maxHeight: "calc(100vh - 64px)", 
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          margin: "auto"
        }}
      >
        <Flex direction="column" style={{ height: "100%" }}>
          <Flex justify="between" mb="4">
            <Dialog.Title>{isEditing ? "Chỉnh sửa QR Code" : "Tạo QR Code mới"}</Dialog.Title>
            <Dialog.Close>
              <IconButton variant="ghost" color="gray">
                <Cross1Icon />
              </IconButton>
            </Dialog.Close>
          </Flex>

          {/* Hiển thị QR Code đã tạo */}
          {!uiState.showForm && uiState.qrCodeBase64 && (
            <Box style={{ flex: 1, overflowY: "auto", textAlign: "center" }}>
              <Card style={{ padding: "20px", marginBottom: "20px" }}>
                <Flex direction="column" align="center" gap="3">
                  <img
                    src={uiState.qrCodeBase64}
                    alt="QR Code"
                    style={{ maxWidth: "250px", maxHeight: "250px" }}
                  />
                  <Text size="2" weight="bold">
                    QR Code đã được tạo thành công!
                  </Text>
                  <Flex gap="2">
                    <Button
                      size="1"
                      variant="soft"
                      color="blue"
                      onClick={handleDownloadQR}
                    >
                      <DownloadIcon />
                      Tải về
                    </Button>
                    <Button size="1" variant="soft" onClick={toggleView}>
                      Quay lại
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            </Box>
          )}

          {/* Form tạo QR Code */}
          {uiState.showForm && (
            <Flex direction="column" style={{ flex: 1, minHeight: 0 }}>
              <Tabs.Root 
                defaultValue="customer" 
                style={{ 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column",
                  minHeight: 0 
                }}
              >
                <Tabs.List>
                  <Tabs.Trigger value="customer">
                    <Flex gap="1" align="center">
                      <PersonIcon />
                      <Text>Thông tin KH</Text>
                    </Flex>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="links">
                    <Flex gap="1" align="center">
                      <Link2Icon />
                      <Text>Liên kết</Text>
                    </Flex>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="update">
                    <Flex gap="1" align="center">
                      <GearIcon />
                      <Text>Cập nhật</Text>
                    </Flex>
                  </Tabs.Trigger>
                </Tabs.List>

                <Box 
                  px="1" 
                  py="3" 
                  style={{ 
                    flex: 1, 
                    overflowY: "auto",
                    minHeight: 0,
                    position: "relative"
                  }}
                >
                  <Tabs.Content value="customer">
                    <Grid columns={isMobile ? "1" : "2"} gap="4">
                      <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                          Mã khách hàng:
                        </Text>
                        <TextField.Root
                          placeholder="Nhập mã khách hàng"
                          value={formState.customer.code}
                          onChange={(e) =>
                            updateFormState("customer", e.target.value, "code")
                          }
                        />

                        <Text as="div" size="2" mb="1" mt="3" weight="bold">
                          Tên khách hàng:
                        </Text>
                        <TextField.Root
                          placeholder="Nhập tên khách hàng"
                          value={formState.customer.name}
                          onChange={(e) =>
                            updateFormState("customer", e.target.value, "name")
                          }
                        />
                      </Box>

                      <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                          Hình ảnh khách hàng:
                        </Text>
                        <Box
                          onDragEnter={handleDragEnter}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          style={{
                            border: uiState.isDragging
                              ? "2px dashed #1E67FA"
                              : "2px dashed #ccc",
                            borderRadius: "6px",
                            padding: "20px",
                            textAlign: "center",
                            backgroundColor: uiState.isDragging
                              ? "rgba(30, 103, 250, 0.05)"
                              : "transparent",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            height: "100%",
                            minHeight: isMobile ? "150px" : "200px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {formState.customer.imagePreview ? (
                            <Flex direction="column" align="center" gap="2">
                              <Box
                                style={{
                                  position: "relative",
                                  maxWidth: "100%",
                                  maxHeight: isMobile ? "150px" : "200px",
                                }}
                              >
                                <img
                                  src={formState.customer.imagePreview}
                                  alt="Hình ảnh khách hàng"
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: isMobile ? "150px" : "200px",
                                    display: "block",
                                    borderRadius: "4px",
                                  }}
                                />
                                <IconButton
                                  size="1"
                                  variant="solid"
                                  color="red"
                                  style={{ position: "absolute", top: "5px", right: "5px" }}
                                  onClick={handleRemoveImage}
                                >
                                  <TrashIcon />
                                </IconButton>
                              </Box>
                              <Text size="1" color="gray">
                                {formState.customer.image?.name}
                              </Text>
                            </Flex>
                          ) : (
                            <Flex
                              direction="column"
                              align="center"
                              gap="2"
                              style={{ padding: isMobile ? "15px 0" : "30px 0" }}
                            >
                              <UploadIcon height={24} width={24} />
                              <Text size="2">
                                Kéo thả hình ảnh vào đây hoặc nhấp để chọn tệp
                              </Text>
                              <Text size="1" color="gray">
                                Hỗ trợ: JPG, PNG, GIF
                              </Text>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                                id="imageUpload"
                              />
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() =>
                                  document.getElementById("imageUpload")?.click()
                                }
                              >
                                Chọn hình ảnh
                              </Button>
                            </Flex>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Tabs.Content>

                  <Tabs.Content value="links">
                    <Grid columns={isMobile ? "1" : "2"} gap="4">
                      <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                          Link Main:
                        </Text>
                        <TextField.Root
                          placeholder="Nhập Link Main"
                          value={formState.links.main}
                          onChange={(e) => updateFormState("links", e.target.value, "main")}
                        />

                        <Text as="div" size="2" mb="1" mt="3" weight="bold">
                          Link HR Service:
                        </Text>
                        <TextField.Root
                          placeholder="Nhập Link HR Service"
                          value={formState.links.hr}
                          onChange={(e) => updateFormState("links", e.target.value, "hr")}
                        />

                        <Text as="div" size="2" mb="1" mt="3" weight="bold">
                          Link System Service:
                        </Text>
                        <TextField.Root
                          placeholder="Nhập Link System Service"
                          value={formState.links.system}
                          onChange={(e) =>
                            updateFormState("links", e.target.value, "system")
                          }
                        />
                      </Box>

                      <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                          Link Portal:
                        </Text>
                        <TextField.Root
                          placeholder="Nhập Link Portal"
                          value={formState.links.portal}
                          onChange={(e) =>
                            updateFormState("links", e.target.value, "portal")
                          }
                        />

                        <Text as="div" size="2" mb="1" mt="3" weight="bold">
                          Link Center Service (tùy chọn):
                        </Text>
                        <TextField.Root
                          placeholder="Nhập Link Center Service"
                          value={formState.links.center}
                          onChange={(e) =>
                            updateFormState("links", e.target.value, "center")
                          }
                        />

                        <Text as="div" size="2" mb="1" mt="3" weight="bold">
                          Link Identity Server (tùy chọn):
                        </Text>
                        <TextField.Root
                          placeholder="Nhập Link Identity Server"
                          value={formState.links.identity}
                          onChange={(e) =>
                            updateFormState("links", e.target.value, "identity")
                          }
                        />
                      </Box>
                    </Grid>
                  </Tabs.Content>

                  <Tabs.Content value="update">
                    <Box>
                      <Text as="div" size="2" mb="2" weight="bold">
                        Chọn phương thức cập nhật:
                      </Text>
                      <RadioGroup.Root
                        value={formState.updateMethod.option}
                        onValueChange={(value) =>
                          updateFormState(
                            "updateMethod",
                            value as "key" | "deployment",
                            "option"
                          )
                        }
                      >
                        <Flex direction={isMobile ? "column" : "row"} gap="4">
                          <Text as="label" size="2">
                            <Flex gap="2" align="center">
                              <RadioGroup.Item value="key" /> Key
                            </Flex>
                          </Text>
                          <Text as="label" size="2">
                            <Flex gap="2" align="center">
                              <RadioGroup.Item value="deployment" /> Danh sách
                              deployment
                            </Flex>
                          </Text>
                        </Flex>
                      </RadioGroup.Root>
                    </Box>

                    {/* Hiển thị các field tùy thuộc vào option */}
                    {formState.updateMethod.option === "key" ? (
                      // Option Key
                      <Grid columns={isMobile ? "1" : "3"} gap="4" mt="4">
                        <Box>
                          <Text as="div" size="2" mb="1" weight="bold">
                            Version Code:
                          </Text>
                          <TextField.Root
                            placeholder="Nhập Version Code"
                            value={formState.updateMethod.key.version}
                            onChange={(e) =>
                              updateFormState(
                                "updateMethod",
                                e.target.value,
                                "key",
                                "version"
                              )
                            }
                          />
                        </Box>
                        <Box>
                          <Text as="div" size="2" mb="1" weight="bold">
                            Key Update Android:
                          </Text>
                          <TextField.Root
                            placeholder="Nhập Key Update Android"
                            value={formState.updateMethod.key.android}
                            onChange={(e) =>
                              updateFormState(
                                "updateMethod",
                                e.target.value,
                                "key",
                                "android"
                              )
                            }
                          />
                        </Box>
                        <Box>
                          <Text as="div" size="2" mb="1" weight="bold">
                            Key Update iOS:
                          </Text>
                          <TextField.Root
                            placeholder="Nhập Key Update iOS"
                            value={formState.updateMethod.key.ios}
                            onChange={(e) =>
                              updateFormState(
                                "updateMethod",
                                e.target.value,
                                "key",
                                "ios"
                              )
                            }
                          />
                        </Box>
                      </Grid>
                    ) : (
                      // Option Danh sách deployment - Sử dụng DeploymentSelectors
                      <Box mt="4">
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
                        />
                      </Box>
                    )}
                  </Tabs.Content>
                </Box>
              </Tabs.Root>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft">Hủy</Button>
                </Dialog.Close>
                <Button
                  type="submit"
                  disabled={!uiState.formValid || uiState.loading}
                  onClick={handleCreateQRCode}
                >
                  {uiState.loading ? (
                    <>
                      <ReloadIcon className="spinner" />
                      {isEditing ? "Đang cập nhật..." : "Đang tạo..."}
                    </>
                  ) : isEditing ? (
                    "Cập Nhật"
                  ) : (
                    "Tạo QR Code"
                  )}
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreateQRCodeDialog;

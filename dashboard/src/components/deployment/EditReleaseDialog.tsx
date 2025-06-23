import { useState, useEffect } from "react";
import {
  Dialog,
  Flex,
  Text,
  Button,
  TextArea,
  Switch,
  Box,
} from "@radix-ui/themes";
import { CodeIcon } from "@radix-ui/react-icons";

interface Release {
  label: string;
  description: string;
  isDisabled: boolean;
  isMandatory: boolean;
  appVersion: string;
  rollout: number | null;
  packageHash: string;
  [key: string]: any;
}

interface EditReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  release: Release | null;
  onSave: (label: string, updates: UpdateReleaseData) => Promise<void>;
}

export interface UpdateReleaseData {
  description: string;
  isDisabled: boolean;
  isMandatory: boolean;
}

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

const EditReleaseDialog = ({
  open,
  onOpenChange,
  release,
  onSave,
}: EditReleaseDialogProps) => {
  const [description, setDescription] = useState("");
  const [displayDescription, setDisplayDescription] = useState("");
  const [descriptionMode, setDescriptionMode] = useState<"base64" | "json">(
    "base64"
  );
  const [isDisabled, setIsDisabled] = useState(false);
  const [isMandatory, setIsMandatory] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");

  // Cập nhật form khi release thay đổi
  useEffect(() => {
    if (release) {
      const desc = release.description || "";
      setDescription(desc);

      // Tự động phát hiện định dạng và hiển thị
      if (isBase64JSON(desc)) {
        setDescriptionMode("base64");
        setDisplayDescription(base64ToJSON(desc));
      } else {
        setDescriptionMode("json");
        setDisplayDescription(desc);
      }

      setIsDisabled(release.isDisabled || false);
      setIsMandatory(release.isMandatory || false);
    } else {
      // Reset form khi không có dữ liệu
      setDescription("");
      setDisplayDescription("");
      setDescriptionMode("base64");
      setIsDisabled(false);
      setIsMandatory(false);
    }

    // Reset error message
    setDescriptionError("");
  }, [release, open]);

  // Cập nhật description khi displayDescription hoặc mode thay đổi
  useEffect(() => {
    try {
      if (descriptionMode === "base64") {
        // Khi ở chế độ base64, chuyển đổi JSON hiển thị về base64 để lưu
        if (displayDescription && isValidJSON(displayDescription)) {
          setDescription(jsonToBase64(displayDescription));
          setDescriptionError("");
        } else if (displayDescription) {
          setDescriptionError("JSON không hợp lệ");
        }
      } else {
        // Ở chế độ JSON, sử dụng giá trị hiển thị trực tiếp
        setDescription(displayDescription);
        setDescriptionError("");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật description:", error);
      setDescriptionError("Lỗi khi xử lý dữ liệu");
    }
  }, [displayDescription, descriptionMode]);

  // Chuyển đổi chế độ hiển thị và format nội dung tương ứng
  const toggleDescriptionMode = () => {
    debugger
    if (descriptionMode === "base64") {
      // Chuyển từ base64 (đang hiển thị JSON) sang chế độ JSON
      setDescriptionMode("json");
      // Lấy giá trị base64 đã lưu (không phải giá trị hiển thị)
      setDisplayDescription(description);
    } else {
      // Chuyển từ chế độ JSON (đang hiển thị base64) sang chế độ base64
      if (isBase64JSON(displayDescription)) {
        // Nếu là base64 hợp lệ và chứa JSON
        setDescriptionMode("base64");
        // Format và hiển thị dưới dạng JSON
        setDisplayDescription(base64ToJSON(displayDescription));
        setDescription(displayDescription);
        setDescriptionError("");
      } else if (isValidJSON(displayDescription)) {
        // Là JSON hợp lệ, chuyển thành base64 rồi hiển thị dưới dạng JSON
        setDescriptionMode("base64");
        const base64Value = jsonToBase64(displayDescription);
        setDescription(base64Value);
        setDisplayDescription(base64ToJSON(base64Value));
        setDescriptionError("");
      } else {
        // Không phải base64 hợp lệ chứa JSON và cũng không phải JSON hợp lệ
        setDescriptionError("Không thể chuyển đổi sang định dạng JSON");
      }
    }
  };

  const handleSubmit = async () => {
    if (!release) return;

    // Kiểm tra lỗi trước khi submit
    if (descriptionError) {
      alert("Vui lòng sửa lỗi trước khi lưu!");
      return;
    }

    try {
      await onSave(release.label, {
        description,
        isDisabled,
        isMandatory,
      });
      onOpenChange(false);
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật phiên bản");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 600, minHeight: 400 }}>
        <Dialog.Title>Chỉnh sửa phiên bản: {release?.label}</Dialog.Title>

        <Flex direction="column" gap="3" my="4">
          <Box>
            <Flex justify="between" align="center" mb="1">
              <Text as="div" size="2" weight="bold">
                Mô tả (Description)
              </Text>
              <Flex gap="2" align="center">
                <Text size="1" color="gray">
                  Chế độ: {descriptionMode === "base64" ? "JSON" : "Base64"}
                </Text>
                <Button variant="soft" size="1" onClick={toggleDescriptionMode}>
                  <CodeIcon />
                  Chuyển đổi
                </Button>
              </Flex>
            </Flex>

            <TextArea
              placeholder={
                descriptionMode === "base64"
                  ? "Nhập JSON cho phiên bản này"
                  : "Nhập Base64 cho phiên bản này"
              }
              value={displayDescription}
              onChange={(e) => setDisplayDescription(e.target.value)}
              style={{
                height: 150,
                minHeight: 150,
                fontFamily: "monospace",
                backgroundColor:
                  descriptionMode === "base64" ? "#f8f9fc" : undefined,
              }}
            />

            {descriptionError && (
              <Text color="red" size="1" mt="1">
                {descriptionError}
              </Text>
            )}

            <Text as="div" size="1" color="gray" mt="1">
              {descriptionMode === "base64"
                ? "Dữ liệu sẽ được chuyển đổi về Base64 khi lưu"
                : "Đang hiển thị giá trị Base64 gốc"}
            </Text>
          </Box>

          <Box style={{ minHeight: 64 }}>
            <Flex gap="4" align="center">
              <Box style={{ flex: 1 }}>
                <Text as="div" size="2" weight="bold">
                  Tạm dừng (Disabled)
                </Text>
                <Text as="div" size="1" color="gray">
                  Khi bật, phiên bản này sẽ không được gửi đến người dùng
                </Text>
              </Box>
              <Switch checked={isDisabled} onCheckedChange={setIsDisabled} />
            </Flex>
          </Box>

          <Box style={{ minHeight: 64 }}>
            <Flex gap="4" align="center">
              <Box style={{ flex: 1 }}>
                <Text as="div" size="2" weight="bold">
                  Bắt buộc cập nhật (Mandatory)
                </Text>
                <Text as="div" size="1" color="gray">
                  Khi bật, ứng dụng sẽ bắt buộc người dùng phải cập nhật
                </Text>
              </Box>
              <Switch checked={isMandatory} onCheckedChange={setIsMandatory} />
            </Flex>
          </Box>
        </Flex>

        <Flex gap="3" justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Huỷ
            </Button>
          </Dialog.Close>
          <Button onClick={handleSubmit} disabled={!!descriptionError}>
            Lưu thay đổi
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default EditReleaseDialog;

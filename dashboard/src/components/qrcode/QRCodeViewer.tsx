import { Box, Card, Flex, Text, Button, Heading } from "@radix-ui/themes";
import { DownloadIcon } from "@radix-ui/react-icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useState, useEffect } from "react";
import { useResponsive } from "./ResponsiveQRHelper";

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

interface QRCodeViewerProps {
  qrCode: QRCodeData;
  onDownload: () => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
}

// Helper function để kiểm tra giá trị trống
const isEmptyOrNull = (value: any): boolean => {
  return value === null || value === undefined || value === '';
};

// Component hiển thị giá trị hoặc thông báo chưa cấu hình
const FieldValue = ({ value }: { value: any }) => {
  if (isEmptyOrNull(value)) {
    return (
      <Text style={{ 
        wordBreak: "break-all", 
        display: "inline-block", 
        color: "red" 
      }}>
        Chưa cấu hình
      </Text>
    );
  }
  return (
    <Text style={{ 
      wordBreak: "break-all", 
      display: "inline-block" 
    }}>
      {value}
    </Text>
  );
};

const QRCodeViewer = ({
  qrCode,
  onDownload,
  isLoading = false,
  isDarkMode = false,
}: QRCodeViewerProps) => {
  const [isDarkModeState, setIsDarkModeState] = useState(false);
  const { getQRViewerStyles } = useResponsive();
  const styles = getQRViewerStyles();

  // Kiểm tra và áp dụng chế độ tối
  useEffect(() => {
    // Kiểm tra chế độ tối từ body hoặc html element
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    const htmlElement = document.documentElement;

    const checkDarkMode = () => {
      const isDark =
        darkModeMediaQuery.matches ||
        document.body.classList.contains("dark-theme") ||
        htmlElement.classList.contains("dark-theme") ||
        htmlElement.getAttribute("data-theme") === "dark";

      setIsDarkModeState(isDark);
    };

    checkDarkMode();

    // Lắng nghe thay đổi
    darkModeMediaQuery.addEventListener("change", checkDarkMode);

    // Cleanup
    return () =>
      darkModeMediaQuery.removeEventListener("change", checkDarkMode);
  }, []);

  // Cập nhật màu sắc skeleton dựa trên chế độ màu
  const skeletonBaseColor = !isDarkMode ? "#2d3748" : "#e0e0e0";
  const skeletonHighlightColor = !isDarkMode ? "#4a5568" : "#f0f0f0";

  if (isLoading) {
    return (
      <Card size="2" style={{ padding: "20px", width: "100%" }}>
        <Flex gap="4" direction={{ initial: "column", md: "row" }}>
          {/* QR Code Image Skeleton */}
          <Box
            style={{
              width: "100%",
              maxWidth: "200px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              margin: "0 auto",
            }}
          >
            <Skeleton
              width={100}
              height={24}
              style={{ marginBottom: "8px" }}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
            <Skeleton
              width="100%"
              height={200}
              style={{ borderRadius: "8px", maxWidth: "200px" }}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
            <Skeleton
              width={120}
              height={36}
              style={{ marginTop: "8px" }}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />
          </Box>

          {/* QR Code Info Skeleton */}
          <Box style={{ flex: 1, width: "100%" }}>
            <Skeleton
              width={150}
              height={24}
              style={{ marginBottom: "16px" }}
              baseColor={skeletonBaseColor}
              highlightColor={skeletonHighlightColor}
            />

            <Flex direction="column" gap="2">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <Flex key={index} direction={{ initial: "column", sm: "row" }} gap="2">
                    <Skeleton
                      width="100%"
                      height={20}
                      style={{ maxWidth: "120px" }}
                      baseColor={skeletonBaseColor}
                      highlightColor={skeletonHighlightColor}
                    />
                    <Skeleton
                      width="100%"
                      height={20}
                      baseColor={skeletonBaseColor}
                      highlightColor={skeletonHighlightColor}
                    />
                  </Flex>
                ))}
            </Flex>
          </Box>
        </Flex>
      </Card>
    );
  }

  return (
    <Card size="2" style={{ padding: styles.container.padding, width: "100%" }}>
      <Flex gap="4" direction={{ initial: "column", md: "row" }}>
        {/* QR Code Image */}
        <Box
          style={{
            width: "100%",
            maxWidth: styles.qrCodeBox.maxWidth,
            minWidth: styles.qrCodeBox.minWidth,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            margin: styles.qrCodeBox.margin,
          }}
        >
          <Heading size={styles.headingSize as any} mb="2">
            QR Code
          </Heading>
          <Box
            style={{
              width: "100%",
              maxWidth: "200px",
              aspectRatio: "1/1",
              backgroundColor: "white",
              padding: "10px",
              border: "1px solid var(--gray-5)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <img
              loading="lazy"
              src={qrCode.QRCodeBase64}
              alt="QR Code"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>
          <Button size="2" onClick={onDownload} variant="soft" style={{ marginTop: "10px" }}>
            <DownloadIcon width="16" height="16" />
            <Text>Tải xuống</Text>
          </Button>
        </Box>

        {/* QR Code Info */}
        <Box style={{ flex: 1, width: "100%" }}>
          <Heading size={styles.headingSize as any} mb="3">
            Thông tin chi tiết
          </Heading>

          <Flex direction="column" gap="2" className="qr-details-container">
            <Flex align="start" direction={styles.fieldDirection as any} gap="1" className="qr-detail-row">
              <Text
                weight="bold"
                style={{ 
                  width: styles.labelWidth, 
                  flexShrink: 0 
                }}
              >
                Mã KH:
              </Text>
              <Box style={{ 
                width: styles.valueWidth, 
                minWidth: styles.valueMinWidth,
                flexGrow: 1 
              }}>
                <FieldValue value={qrCode.CusCode} />
              </Box>
            </Flex>

            <Flex align="start" direction={styles.fieldDirection as any} gap="1" className="qr-detail-row">
              <Text
                weight="bold"
                style={{ 
                  width: styles.labelWidth, 
                  flexShrink: 0 
                }}
              >
                Tên khách hàng:
              </Text>
              <Box style={{ 
                width: styles.valueWidth, 
                minWidth: styles.valueMinWidth,
                flexGrow: 1 
              }}>
                <FieldValue value={qrCode.CusName} />
              </Box>
            </Flex>

            <Flex align="start" direction={styles.fieldDirection as any} gap="1" className="qr-detail-row">
              <Text
                weight="bold"
                style={{ 
                  width: styles.labelWidth, 
                  flexShrink: 0 
                }}
              >
                Version Code:
              </Text>
              <Box style={{ 
                width: styles.valueWidth, 
                minWidth: styles.valueMinWidth,
                flexGrow: 1 
              }}>
                <FieldValue value={qrCode.VersionCode} />
              </Box>
            </Flex>

            {/* Các đường link */}
            <Heading size={styles.headingSize as any} mt="3" mb="2">
              Thông tin đường dẫn
            </Heading>

            {/* Link fields - responsive setup */}
            {[
              { label: "Link Main:", value: qrCode.UriMain },
              { label: "Link Portal:", value: qrCode.UriPor },
              { label: "Link HR:", value: qrCode.UriHR },
              { label: "Link System:", value: qrCode.UriSys },
              { label: "Link Center:", value: qrCode.UriCenter },
              { label: "Link Identity:", value: qrCode.UriIdentity }
            ].map((item, index) => (
              <Flex 
                key={index} 
                align="start" 
                direction={styles.fieldDirection as any}
                gap="1"
                mb="2"
                className="qr-detail-row"
              >
                <Text
                  weight="bold"
                  style={{ 
                    width: styles.labelWidth, 
                    flexShrink: 0 
                  }}
                >
                  {item.label}
                </Text>
                <Box style={{ 
                  width: styles.valueWidth, 
                  minWidth: styles.valueMinWidth,
                  flexGrow: 1 
                }}>
                  <FieldValue value={item.value} />
                </Box>
              </Flex>
            ))}

            <Heading size={styles.headingSize as any} mt="3" mb="2">
              Thông tin key
            </Heading>

            {/* Key fields - responsive setup */}
            {[
              { label: "Key Android:", value: qrCode.keyUpdateAndroid },
              { label: "Key iOS:", value: qrCode.keyUpdateIos },
              { label: "Chuỗi tạo QR:", value: qrCode.DecAlgorithm }
            ].map((item, index) => (
              <Flex 
                key={index} 
                align="start" 
                direction={styles.fieldDirection as any}
                gap="1"
                mb="2"
                className="qr-detail-row"
              >
                <Text
                  weight="bold"
                  style={{ 
                    width: styles.labelWidth, 
                    flexShrink: 0 
                  }}
                >
                  {item.label}
                </Text>
                <Box style={{ 
                  width: styles.valueWidth, 
                  minWidth: styles.valueMinWidth,
                  flexGrow: 1 
                }}>
                  <FieldValue value={item.value} />
                </Box>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
};

export default QRCodeViewer;

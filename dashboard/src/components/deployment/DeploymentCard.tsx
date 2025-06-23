import { Card, Flex, Heading, Text, Button, Box } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";

export interface Package {
  description: string;
  isDisabled: boolean;
  isMandatory: boolean;
  rollout: number;
  appVersion: string;
  packageHash: string;
  blobUrl: string;
  size: number;
  manifestBlobUrl: string;
  releaseMethod: string;
  uploadTime: number;
  label: string;
  releasedBy: string;
}

export interface Deployment {
  name: string;
  key: string;
  id: string;
  package: Package | null;
}

interface DeploymentCardProps {
  deployment: Deployment;
  onClick: (deploymentName: string) => void;
  onDelete: (deploymentName: string) => void;
}

const DeploymentCard = ({ 
  deployment, 
  onClick, 
  onDelete
}: DeploymentCardProps) => {
  // Hàm định dạng timestamp thành DD/MM/YYYY
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Hàm tạo style cho giá trị được highlight
  const highlightedValue = (value: string) => {
    return (
      <span className="highlighted-value">{value}</span>
    );
  };

  // Truncate key cho mobile display
  const truncateKey = (key: string, maxLength = 12) => {
    if (key.length <= maxLength) return key;
    return `${key.substring(0, maxLength)}...`;
  };

  // Xác định các phần thông tin bổ sung của package
  const renderPackageInfo = () => {
    if (deployment.package) {
      return (
        <Flex direction="column" gap="1">
          <Flex className="desktop-only" direction="column" gap="1">
            <Text size="2">
              Label: {highlightedValue(deployment.package.label)}
            </Text>
            <Text size="2">
              Version: {highlightedValue(deployment.package.appVersion)}
            </Text>
            <Text size="2">
              Trạng thái: {
                highlightedValue(deployment.package.isDisabled ? "Disabled" : "Active")
              }
            </Text>
            <Text size="2" color="gray">
              Ngày cập nhật gần nhất: {
                highlightedValue(formatDate(deployment.package.uploadTime))
              }
            </Text>
          </Flex>
          
          {/* Mobile compact layout */}
          <Flex className="mobile-only" direction="column" gap="1">
            <Flex justify="between">
              <Text size="1" style={{ fontWeight: 500 }}>Label:</Text>
              <Text size="1">{deployment.package.label}</Text>
            </Flex>
            <Flex justify="between">
              <Text size="1" style={{ fontWeight: 500 }}>Version:</Text>
              <Text size="1">{deployment.package.appVersion}</Text>
            </Flex>
            <Flex justify="between">
              <Text size="1" style={{ fontWeight: 500 }}>Trạng thái:</Text>
              <Text size="1">{deployment.package.isDisabled ? "Disabled" : "Active"}</Text>
            </Flex>
            <Flex justify="between">
              <Text size="1" style={{ fontWeight: 500 }}>Cập nhật:</Text>
              <Text size="1">{formatDate(deployment.package.uploadTime)}</Text>
            </Flex>
          </Flex>
        </Flex>
      );
    } else {
      // Nếu không có package, hiển thị placeholder để giữ chiều cao
      return (
        <Flex direction="column" gap="1" style={{ minHeight: "60px" }}>
          <Text size="2" color="gray">Chưa có thông tin package</Text>
        </Flex>
      );
    }
  };

  // Xử lý nút xóa để ngăn sự kiện click lan ra
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(deployment.name);
  };

  return (
    <Card
      key={deployment.name}
      className="deployment-card"
      style={{ width: "100%", cursor: "pointer", height: "100%" }}
      onClick={() => onClick(deployment.name)}
    >
      <Flex direction="column" gap="2" style={{ height: "100%" }}>
        {/* Desktop layout */}
        <div className="desktop-only">
          <Heading size="4">{deployment.name}</Heading>
          <Text size="2">
            Key: {highlightedValue(deployment.key)}
          </Text>
        </div>
        
        {/* Mobile layout */}
        <div className="mobile-only">
          <Flex justify="between" align="center">
            <Heading size="3">{deployment.name}</Heading>
            <Box>
              <Button
                variant="ghost"
                color="red"
                onClick={handleDeleteClick}
                size="1"
                style={{ padding: '4px' }}
              >
                <TrashIcon />
              </Button>
            </Box>
          </Flex>
          <Text size="1" style={{ wordBreak: 'break-all' }}>
            Key: {truncateKey(deployment.key)}
          </Text>
        </div>
        
        {renderPackageInfo()}
        
        {/* Phần dưới với các nút hành động luôn nằm ở dưới cùng - chỉ hiển thị trên desktop */}
        <Flex className="desktop-only" mt="auto" pt="1" justify="end" gap="1">
          <Button
            variant="soft"
            color="red"
            onClick={handleDeleteClick}
          >
            <TrashIcon />
            Xoá
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default DeploymentCard; 
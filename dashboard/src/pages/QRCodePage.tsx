import { useState, useEffect, useCallback } from 'react';
import { Box, Heading, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { PlusIcon, ReloadIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { QRCodeList, CreateQRCodeDialog, showErrorToast, showSuccessToast } from '@/components';
import { getQRCodes, deleteQRCode } from '@/services/api_qrcode';
import 'react-loading-skeleton/dist/skeleton.css';
import { useResponsive } from '@/components/qrcode/ResponsiveQRHelper';

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

interface PaginationInfo {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

// Định nghĩa kiểu dữ liệu cho response từ API

// Hook để debounce searchTerm
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Cập nhật debounced value sau delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Hủy timeout trước nếu value thay đổi
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

const QRCodePage = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentEditQR, setCurrentEditQR] = useState<QRCodeData | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const userRole = localStorage.getItem('userRole') || 'admin';
  
  // Debounce searchTerm để tránh gọi API quá nhiều lần
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Đợi 500ms sau khi người dùng ngừng gõ

  // Fetch QR codes
  const fetchQRCodes = useCallback(async (page = 1, searchTerm = '') => {
    setIsLoading(true);
    try {
      // Gọi API với tham số chính xác
      const result = await getQRCodes(page, pagination.itemsPerPage, searchTerm);
      
      // Đảm bảo cập nhật pagination trước khi cập nhật qrCodes
      setPagination({
        totalItems: result.metadata.total,
        itemsPerPage: pagination.itemsPerPage,
        currentPage: page
      });
      
      // Sau đó mới cập nhật qrCodes
      setQrCodes(result.items);
    } catch (error) {
      console.error('Failed to fetch QR codes:', error);
      showErrorToast('Không thể tải danh sách QR code');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.itemsPerPage]);

  // Load QR codes on mount and when pagination changes
  useEffect(() => {
    fetchQRCodes(pagination.currentPage, searchTerm);
    // Không thêm searchTerm vào dependencies để tránh vòng lặp vô hạn
    // khi người dùng gõ từ khóa tìm kiếm
  }, [fetchQRCodes, pagination.currentPage]);
  
  // Auto search khi debouncedSearchTerm thay đổi
  useEffect(() => {
    // Chỉ tìm kiếm khi có giá trị debounced search term
    if (debouncedSearchTerm !== undefined) {
      // Reset về trang 1 khi tìm kiếm tự động
      fetchQRCodes(1, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, fetchQRCodes]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchQRCodes(pagination.currentPage, searchTerm);
    setIsRefreshing(false);
  };

  // Handle edit button click
  const handleEditQR = (qrCode: QRCodeData) => {
    setCurrentEditQR(qrCode);
    setCreateDialogOpen(true);
  };

  // Handle delete QR code
  const handleDeleteQR = async (id: string) => {
    try {
      await deleteQRCode(id);
      await fetchQRCodes(
        // If we're on a page with only one item and it's not the first page,
        // go to previous page after delete
        qrCodes.length === 1 && pagination.currentPage > 1
          ? pagination.currentPage - 1
          : pagination.currentPage,
        searchTerm
      );
      showSuccessToast('QR Code đã được xóa thành công');
    } catch (error) {
      console.error('Failed to delete QR code:', error);
      showErrorToast('Không thể xóa QR code');
    }
  };

  // Handle download QR code image
  const handleDownloadQRCode = (qrCode: QRCodeData) => {
    // Create a temporary link element to download the QR code
    const link = document.createElement('a');
    link.href = qrCode.QRCodeBase64;
    link.download = `QRCode_${qrCode.CusCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate total pages
  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const { currentPage } = pagination;
    const buttons = [];

    // First page button
    buttons.push(
      <Button 
        key="first" 
        variant="soft" 
        color="gray"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(1)}
        size={isMobile ? "1" : "2"}
      >
        <DoubleArrowLeftIcon />
      </Button>
    );

    // Previous page button
    buttons.push(
      <Button 
        key="prev" 
        variant="soft" 
        color="gray"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        size={isMobile ? "1" : "2"}
      >
        <ChevronLeftIcon />
      </Button>
    );

    // Page number buttons
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4 && endPage < totalPages) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button 
          key={i} 
          variant={i === currentPage ? "solid" : "soft"}
          color={i === currentPage ? "blue" : "gray"}
          onClick={() => handlePageChange(i)}
          size={isMobile ? "1" : "2"}
        >
          {i}
        </Button>
      );
    }

    // Next page button
    buttons.push(
      <Button 
        key="next" 
        variant="soft" 
        color="gray"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        size={isMobile ? "1" : "2"}
      >
        <ChevronRightIcon />
      </Button>
    );

    // Last page button
    buttons.push(
      <Button 
        key="last" 
        variant="soft" 
        color="gray"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(totalPages)}
        size={isMobile ? "1" : "2"}
      >
        <DoubleArrowRightIcon />
      </Button>
    );

    return buttons;
  };

  return (
    <Box style={{ padding: '20px' }}>
      <Flex 
        align="center" 
        justify="between" 
        mb="4" 
        direction={isMobile ? "column" : "row"}
        gap={isMobile ? "3" : "0"}
      >
        <Heading size={isMobile ? "4" : "5"}>Quản lý QR Code</Heading>
        <Flex align="center" gap="2" style={{ width: isMobile ? "100%" : "auto" }}>
          <TextField.Root 
            size="1" 
            style={{ width: isMobile ? "100%" : "250px" }}
            placeholder="Tìm kiếm theo mã hoặc tên KH" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>

          <Button 
            variant="soft" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="1"
          >
            <ReloadIcon className={isRefreshing ? 'spinner' : ''} />
            {(!isMobile || !isTablet) && "Làm mới"}
          </Button>
          
          {userRole !== 'pe' && (
            <Button 
              onClick={() => {
                setCurrentEditQR(undefined);
                setCreateDialogOpen(true);
              }}
              size="1"
            >
              <PlusIcon />
              {(!isMobile || !isTablet) && "Tạo mới"}
            </Button>
          )}
        </Flex>
      </Flex>
      
      <QRCodeList 
        qrCodes={qrCodes} 
        onEdit={handleEditQR}
        onDelete={handleDeleteQR}
        onDownloadQRCode={handleDownloadQRCode}
        isLoading={isLoading}
      />
      
      {/* Pagination */}
      {!isLoading && qrCodes.length > 0 && (
        <Flex justify="between" align="center" mt="4" direction={isMobile ? "column" : "row"} gap="3">
          <Text size="2" color="gray">
            Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} trên tổng số {pagination.totalItems} kết quả
          </Text>
          
          <Flex gap="1">
            {renderPaginationButtons()}
          </Flex>
        </Flex>
      )}
      
      {/* Create/Edit Dialog */}
      <CreateQRCodeDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        editData={currentEditQR}
        isEditing={!!currentEditQR}
      />
    </Box>
  );
};

export default QRCodePage; 
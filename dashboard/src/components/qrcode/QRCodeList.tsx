import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Table, 
  Flex, 
  Button, 
  Checkbox, 
  Text, 
  IconButton,
  Dialog,
  AlertDialog,
  Card,
  Badge
} from '@radix-ui/themes';
import { 
  Pencil1Icon, 
  TrashIcon, 
  MagnifyingGlassIcon
} from '@radix-ui/react-icons';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import QRCodeViewer from './QRCodeViewer';
import './QRCodeList.css';
import { useResponsive } from './ResponsiveQRHelper';

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

interface QRCodeListProps {
  qrCodes: QRCodeData[];
  onEdit?: (qrCode: QRCodeData) => void;
  onDelete?: (id: string) => void;
  onDownloadQRCode: (qrCode: QRCodeData) => void;
  isLoading?: boolean;
}

// Props cho header có thể thay đổi kích thước
interface ResizableHeaderProps {
  onResize: (width: number) => void;
  width: number;
  children: React.ReactNode;
  minWidth?: number;
}

// Định nghĩa lại interface cho column visibility
interface ColumnVisibility {
  checkbox: boolean;
  cusCode: boolean;
  cusName: boolean;
  versionCode: boolean;
  qrCode: boolean;
  uriMain: boolean;
  uriPor: boolean;
  actions: boolean;
}

// Component header có thể điều chỉnh kích thước
const ResizableHeader: React.FC<ResizableHeaderProps> = ({ onResize, width, children, minWidth = 100 }) => {
  const startX = useRef<number>(0);
  const currentWidth = useRef<number>(width);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startX.current = e.clientX;
    currentWidth.current = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const difference = moveEvent.clientX - startX.current;
      const newWidth = Math.max(minWidth, currentWidth.current + difference);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="resizable-header" style={{ width: `${width}px` }}>
      <div className="header-content">{children}</div>
      <div className="resize-handle" onMouseDown={handleMouseDown} />
    </div>
  );
};

const QRCodeList = ({ qrCodes, onEdit, onDelete, onDownloadQRCode, isLoading = false }: QRCodeListProps) => {
  const [selectedQRCodes, setSelectedQRCodes] = useState<Set<string>>(new Set());
  const [viewingQR, setViewingQR] = useState<QRCodeData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isMobile, isTablet, getColumnVisibility, getQRViewerStyles } = useResponsive();
  
  // Get the responsive column visibility
  const columnVisibility = getColumnVisibility() as ColumnVisibility;
  const qrViewerStyles = getQRViewerStyles();
  
  // State để lưu trữ chiều rộng của các cột
  const [columnWidths, setColumnWidths] = useState({
    checkbox: 40,
    cusCode: 120,
    cusName: 200,
    versionCode: 120,
    uriMain: 150,
    uriPor: 150,
    qrCode: 100,
    actions: 120
  });

  // Kiểm tra và áp dụng chế độ tối
  useEffect(() => {
    const checkDarkMode = () => {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const htmlElement = document.documentElement;
      
      const isDark = 
        darkModeMediaQuery.matches || 
        htmlElement.classList.contains('dark-theme') || 
        htmlElement.getAttribute('data-theme') === 'dark';
      
      setIsDarkMode(isDark);
    };
    
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', checkDarkMode);
    
    // Kiểm tra ngay khi component được mount
    checkDarkMode();
    
    return () => darkModeMediaQuery.removeEventListener('change', checkDarkMode);
  }, []);

  // Thêm style global cho animation
  useEffect(() => {
    // Tạo style element
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .spinner {
        animation: spin 1s linear infinite;
      }
    `;
    
    // Thêm vào head
    document.head.appendChild(styleElement);
    
    // Cleanup
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedQRCodes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQRCodes(newSelected);
  };

  const handleView = (qrCode: QRCodeData) => {
    setViewingQR(qrCode);
  };

  const handleDeleteClick = (id: string) => {
    setQrToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (qrToDelete && onDelete) {
      onDelete(qrToDelete);
    }
    setDeleteConfirmOpen(false);
    setQrToDelete(null);
  };

  const handleDownloadQR = () => {
    if (!viewingQR) return;
    
    if (onDownloadQRCode) {
      onDownloadQRCode(viewingQR);
    } else {
      // Tạo thẻ a tạm thời để tải xuống hình QR
      const link = document.createElement('a');
      link.href = viewingQR.QRCodeBase64;
      link.download = `QRCode_${viewingQR.CusCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Hàm xử lý thay đổi kích thước cột
  const handleColumnResize = (columnName: string, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnName]: width
    }));
  };

  // Cập nhật màu sắc skeleton dựa trên chế độ màu
  const skeletonBaseColor = isDarkMode ? '#ebebeb' : '#e0e0e0';
  const skeletonHighlightColor = isDarkMode ? '#f5f5f5' : '#f0f0f0';

  const TableSkeleton = () => {
    return (
      <Box style={{ overflow: 'hidden' }}>
        <Skeleton height={40} style={{ marginBottom: '10px' }} baseColor={skeletonBaseColor} highlightColor={skeletonHighlightColor} />
        {Array(6).fill(0).map((_, index) => (
          <Skeleton key={index} height={60} style={{ marginBottom: '8px' }} baseColor={skeletonBaseColor} highlightColor={skeletonHighlightColor} />
        ))}
      </Box>
    );
  };

  // Kiểm tra quyền người dùng
  const userRole = localStorage.getItem('userRole') || 'guest';
  const isPEUser = userRole === 'pe';

  // Render mobile card view cho mỗi QR code
  const renderMobileCardView = () => {
    return (
      <Box style={{ width: '100%' }}>
        {qrCodes.map((qrCode) => (
          <Card key={qrCode.ID} className="qrcode-card" style={{ marginBottom: '12px', padding: '10px' }}>
            <Flex direction="column" gap="1">
              <Flex justify="between" align="start" gap="2">
                <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                  <Flex gap="1" direction="column">
                    <Text weight="bold" size="3" style={{ color: 'var(--accent-9)' }}>{qrCode.CusCode}</Text>
                    <Text size="2" style={{ 
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%' 
                    }}>
                      {qrCode.CusName}
                    </Text>
                    {qrCode.VersionCode && (
                      <Badge size="1" className="version-badge" color="green" variant="soft" style={{ alignSelf: 'flex-start' }}>
                        {qrCode.VersionCode}
                      </Badge>
                    )}
                  </Flex>
                </Flex>
                
                <Box 
                  className="qr-code-container"
                  style={{ 
                    width: '60px', 
                    height: '60px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }} 
                  onClick={() => handleView(qrCode)}
                >
                  {qrCode.QRCodeBase64 ? (
                    <img 
                      loading='lazy'
                      src={qrCode.QRCodeBase64} 
                      alt="QR Code" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Flex align="center" justify="center" style={{ height: '100%' }}>
                      <Text size="1" color="gray">Không có</Text>
                    </Flex>
                  )}
                </Box>
              </Flex>
              
              {columnVisibility.uriMain && (
                <Box style={{ margin: '4px 0' }}>
                  <Text size="1" color="gray" style={{ marginBottom: '2px' }}>URL:</Text>
                  <Text className="url-display">
                    {qrCode.UriMain || 'Chưa cấu hình'}
                  </Text>
                </Box>
              )}
              
              <Flex justify="end" gap="2" mt="2" className="action-buttons">
                {!isPEUser && (
                  <>
                    <IconButton 
                      className="action-button"
                      variant="soft" 
                      color="blue" 
                      onClick={() => onEdit && onEdit(qrCode)}
                      size="2"
                    >
                      <Pencil1Icon width="18" height="18" />
                    </IconButton>
                    <IconButton 
                      className="action-button"
                      variant="soft" 
                      color="red" 
                      onClick={() => handleDeleteClick(qrCode.ID)}
                      size="2"
                    >
                      <TrashIcon width="18" height="18" />
                    </IconButton>
                  </>
                )}
                <IconButton 
                  className="action-button"
                  variant="soft" 
                  color="gray" 
                  onClick={() => handleView(qrCode)}
                  size="2"
                >
                  <MagnifyingGlassIcon width="18" height="18" />
                </IconButton>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box>
        <TableSkeleton />
      </Box>
    );
  }

  if (!qrCodes || qrCodes.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: '300px', border: '1px dashed var(--gray-6)', borderRadius: '8px' }}>
        <Text size="3" color="gray">Không có dữ liệu QR code</Text>
      </Flex>
    );
  }

  return (
    <Box>
      {!isPEUser && selectedQRCodes.size > 0 && (
        <Flex justify="end" mb="4">
        {selectedQRCodes.size > 0 && (
          <Flex gap="2">
            {selectedQRCodes.size === 1 && (
              <Button 
                onClick={() => onEdit?.(
                  qrCodes.find(qr => qr.ID === Array.from(selectedQRCodes)[0])!
                )}
                variant="soft"
              >
                <Pencil1Icon /> Chỉnh sửa
              </Button>
            )}
            <Button 
              color="red" 
              variant="soft"
              onClick={() => {
                if (selectedQRCodes.size === 1) {
                  handleDeleteClick(Array.from(selectedQRCodes)[0]);
                } else if (selectedQRCodes.size > 1) {
                  // Xác nhận xóa nhiều QR code
                  // TODO: Implement multi-delete functionality
                  alert('Chức năng xóa nhiều QR code đang được phát triển');
                }
              }}
            >
              <TrashIcon /> Xóa {selectedQRCodes.size > 1 ? `(${selectedQRCodes.size})` : ''}
            </Button>
          </Flex>
        )}
      </Flex>
      )}

      {/* Responsive view: Mobile card view vs Desktop table view */}
      {(isMobile || isTablet) ? (
        renderMobileCardView()
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <Table.Root style={{ tableLayout: 'fixed', width: '100%' }}>
            <Table.Header>
              {!isPEUser && columnVisibility.checkbox && (
                <Table.ColumnHeaderCell style={{ width: `${columnWidths.checkbox}px`, textAlign: 'start' }}>
                  <ResizableHeader 
                    width={columnWidths.checkbox}
                    onResize={(width) => handleColumnResize('checkbox', width)}
                    minWidth={40}
                  >
                    &nbsp;
                  </ResizableHeader>
                </Table.ColumnHeaderCell>
              )}
              
              {columnVisibility.cusCode && (
                <Table.ColumnHeaderCell>
                  <ResizableHeader 
                    width={columnWidths.cusCode} 
                    onResize={(width) => handleColumnResize('cusCode', width)}
                    minWidth={100}
                  >
                    Mã KH
                  </ResizableHeader>
                </Table.ColumnHeaderCell>
              )}
              
              {columnVisibility.cusName && (
                <Table.ColumnHeaderCell>
                  <ResizableHeader 
                    width={columnWidths.cusName} 
                    onResize={(width) => handleColumnResize('cusName', width)}
                    minWidth={150}
                  >
                    Tên KH
                  </ResizableHeader>
                </Table.ColumnHeaderCell>
              )}
              
              {columnVisibility.versionCode && (
                <Table.ColumnHeaderCell>
                  <ResizableHeader 
                    width={columnWidths.versionCode} 
                    onResize={(width) => handleColumnResize('versionCode', width)}
                    minWidth={100}
                  >
                    Version
                  </ResizableHeader>
                </Table.ColumnHeaderCell>
              )}
              
              {columnVisibility.qrCode && (
                <Table.ColumnHeaderCell>
                  <ResizableHeader 
                    width={columnWidths.qrCode} 
                    onResize={(width) => handleColumnResize('qrCode', width)}
                    minWidth={100}
                  >
                    QR Code
                  </ResizableHeader>
                </Table.ColumnHeaderCell>
              )}
              
              {columnVisibility.uriMain && (
                <Table.ColumnHeaderCell>
                  <ResizableHeader 
                    width={columnWidths.uriMain} 
                    onResize={(width) => handleColumnResize('uriMain', width)}
                    minWidth={150}
                  >
                    Link Main
                  </ResizableHeader>
                </Table.ColumnHeaderCell>
              )}
              
              {columnVisibility.uriPor && (
                <Table.ColumnHeaderCell>
                  <ResizableHeader 
                    width={columnWidths.uriPor} 
                    onResize={(width) => handleColumnResize('uriPor', width)}
                    minWidth={150}
                  >
                    Link Portal
                  </ResizableHeader>
                </Table.ColumnHeaderCell>
              )}
              
              {columnVisibility.actions && (
                <Table.ColumnHeaderCell>
                  <ResizableHeader 
                    width={columnWidths.actions} 
                    onResize={(width) => handleColumnResize('actions', width)}
                    minWidth={120}
                  >
                    Thao tác
                  </ResizableHeader>
                </Table.ColumnHeaderCell>
              )}
            </Table.Header>

            <Table.Body>
              {qrCodes.map((qrCode) => (
                <Table.Row key={qrCode.ID} className="qrcode-row">
                  {!isPEUser && columnVisibility.checkbox && (
                    <Table.Cell className="compact-cell">
                      <div className="cell-content">
                        <Checkbox 
                          checked={selectedQRCodes.has(qrCode.ID)} 
                          onCheckedChange={() => handleRowSelect(qrCode.ID)}
                        />
                      </div>
                    </Table.Cell>
                  )}
                  
                  {columnVisibility.cusCode && (
                    <Table.Cell className="compact-cell">
                      <div className="cell-content">
                        <Text weight="medium" style={{ color: "var(--accent-9)" }}>
                          {qrCode.CusCode}
                        </Text>
                      </div>
                    </Table.Cell>
                  )}
                  
                  {columnVisibility.cusName && (
                    <Table.Cell className="compact-cell">
                      <div className="cell-content">
                        <Text 
                          style={{ 
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                          }}
                          title={qrCode.CusName}
                        >
                          {qrCode.CusName}
                        </Text>
                      </div>
                    </Table.Cell>
                  )}
                  
                  {columnVisibility.versionCode && (
                    <Table.Cell className="compact-cell">
                      <div className="cell-content">
                        <Badge size="1" className="version-badge" color="green" variant="soft">
                          {qrCode.VersionCode}
                        </Badge>
                      </div>
                    </Table.Cell>
                  )}
                  
                  {columnVisibility.qrCode && (
                    <Table.Cell className="compact-cell">
                      <div className="cell-content" style={{ display: 'flex', justifyContent: 'center' }}>
                        <Box 
                          className="qr-code-container" 
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            cursor: 'pointer',
                          }}
                          onClick={() => handleView(qrCode)}
                        >
                          {qrCode.QRCodeBase64 ? (
                            <img 
                              loading='lazy'
                              src={qrCode.QRCodeBase64} 
                              alt="QR Code" 
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <Flex align="center" justify="center" style={{ height: '100%' }}>
                              <Text size="1" color="gray">Không có</Text>
                            </Flex>
                          )}
                        </Box>
                      </div>
                    </Table.Cell>
                  )}
                  
                  {columnVisibility.uriMain && (
                    <Table.Cell className="compact-cell">
                      <div className="cell-content">
                        <Text 
                          className="url-display"
                          title={qrCode.UriMain}
                        >
                          {qrCode.UriMain || 'Chưa cấu hình'}
                        </Text>
                      </div>
                    </Table.Cell>
                  )}
                  
                  {columnVisibility.uriPor && (
                    <Table.Cell className="compact-cell">
                      <div className="cell-content">
                        <Text 
                          className="url-display"
                          title={qrCode.UriPor}
                        >
                          {qrCode.UriPor || 'Chưa cấu hình'}
                        </Text>
                      </div>
                    </Table.Cell>
                  )}
                  
                  {columnVisibility.actions && (
                    <Table.Cell className="compact-cell">
                      <div className="cell-content">
                        <Flex gap="2">
                          {!isPEUser && (
                            <>
                              <IconButton 
                                className="action-button"
                                variant="soft" 
                                color="blue" 
                                onClick={() => onEdit && onEdit(qrCode)}
                                size="2"
                              >
                                <Pencil1Icon width="18" height="18" />
                              </IconButton>
                              <IconButton 
                                className="action-button"
                                variant="soft" 
                                color="red" 
                                onClick={() => handleDeleteClick(qrCode.ID)}
                                size="2"
                              >
                                <TrashIcon width="18" height="18" />
                              </IconButton>
                            </>
                          )}
                          <IconButton 
                            className="action-button"
                            variant="soft" 
                            color="gray" 
                            onClick={() => handleView(qrCode)}
                            size="2"
                          >
                            <MagnifyingGlassIcon width="18" height="18" />
                          </IconButton>
                        </Flex>
                      </div>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      <Dialog.Root open={viewingQR !== null} onOpenChange={(open) => !open && setViewingQR(null)}>
        <Dialog.Content style={{ maxWidth: qrViewerStyles.qrDialogMaxWidth, width: '100%' }}>
          <Dialog.Title>Chi tiết QR Code</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Thông tin và hình ảnh QR code của {viewingQR?.CusName}
          </Dialog.Description>
          
          {viewingQR && (
            <QRCodeViewer 
              qrCode={viewingQR} 
              onDownload={handleDownloadQR}
              isDarkMode={isDarkMode} 
            />
          )}
          
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Đóng</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root 
        open={deleteConfirmOpen} 
        onOpenChange={setDeleteConfirmOpen}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Xác nhận xóa</AlertDialog.Title>
          <AlertDialog.Description>
            Bạn có chắc chắn muốn xóa QR code này? Hành động này không thể hoàn tác.
          </AlertDialog.Description>
          
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Hủy</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" onClick={handleConfirmDelete}>
                Xóa
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
};

export default QRCodeList; 
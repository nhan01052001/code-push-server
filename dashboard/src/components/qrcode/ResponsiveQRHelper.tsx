import { useMediaQuery } from 'react-responsive';

// Define breakpoints
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

// Hook sử dụng để kiểm tra các breakpoint khác nhau
export const useResponsive = () => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm - 1 });
  const isTablet = useMediaQuery({ minWidth: breakpoints.sm, maxWidth: breakpoints.lg - 1 });
  const isDesktop = useMediaQuery({ minWidth: breakpoints.lg });
  const isSmallMobile = useMediaQuery({ maxWidth: breakpoints.xs - 1 });
  
  // Responsive column display for QRCodeList
  const getColumnVisibility = () => {
    if (isSmallMobile) {
      return {
        checkbox: true,
        cusCode: true,
        cusName: true,
        versionCode: false,
        qrCode: true,
        uriMain: false, 
        uriPor: false,
        actions: true
      };
    } else if (isMobile) {
      return {
        checkbox: true,
        cusCode: true,
        cusName: true,
        versionCode: true,
        qrCode: true,
        uriMain: false,
        uriPor: false,
        actions: true
      };
    } else if (isTablet) {
      return {
        checkbox: true,
        cusCode: true,
        cusName: true,
        versionCode: true,
        qrCode: true,
        uriMain: true,
        uriPor: false,
        actions: true
      };
    } else {
      // Desktop
      return {
        checkbox: true,
        cusCode: true,
        cusName: true,
        versionCode: true,
        qrCode: true,
        uriMain: true,
        uriPor: true,
        actions: true
      };
    }
  };

  // QRCodeViewer responsive styles
  const getQRViewerStyles = () => {
    // Chỉ áp dụng layout mobile cho Chi tiết QR Code khi ở chế độ mobile
    if (isMobile) {
      return {
        container: {
          padding: '15px'
        },
        qrCodeBox: {
          maxWidth: '180px',
          minWidth: 'auto',
          margin: '0 auto 20px'
        },
        headingSize: '2',
        labelWidth: '100%',
        valueWidth: '100%',
        fieldDirection: 'column',
        qrDialogMaxWidth: '95vw'
      };
    } else {
      // Giữ nguyên layout gốc cho mọi chế độ không phải mobile
      return {
        container: {
          padding: '20px'
        },
        qrCodeBox: {
          minWidth: '200px',
          maxWidth: '200px',
          margin: '0'
        },
        headingSize: '3',
        labelWidth: '150px',
        valueWidth: 'calc(100% - 160px)', // Trừ đi chiều rộng của label + margin
        valueMinWidth: '300px', // Đảm bảo có chiều rộng tối thiểu cho giá trị
        fieldDirection: 'row', 
        qrDialogMaxWidth: '800px'
      };
    }
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    getColumnVisibility,
    getQRViewerStyles
  };
};

// Helper component để hiển thị nội dung khác nhau dựa trên kích thước màn hình
export const Responsive = ({
  mobile,
  tablet,
  desktop,
  defaultContent,
}: {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  defaultContent: React.ReactNode;
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isDesktop && desktop) return <>{desktop}</>;
  
  return <>{defaultContent}</>;
};

export default useResponsive; 
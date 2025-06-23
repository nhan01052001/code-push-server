import { useContext, ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { showErrorToast } from '@/components';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { token, loading } = useContext(AuthContext);
  const location = useLocation();
  
  // Kiểm tra xác thực và phân quyền
  const isAuthenticated = token || localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole') || 'guest';
  
  // Kiểm tra url hiện tại để xác định đang ở trang nào
  const isQRCodesPage = location.pathname === '/qrcodes';
  
  useEffect(() => {
    // Nếu vai trò là PE và đang cố gắng truy cập trang khác ngoài trang QR Code
    if (userRole === 'pe' && !isQRCodesPage && isAuthenticated) {
      showErrorToast('Bạn không có quyền truy cập trang này');
    }
  }, [userRole, isQRCodesPage, isAuthenticated]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Kiểm tra quyền truy cập
  if (requiredRole) {
    // Nếu yêu cầu vai trò admin nhưng người dùng là PE
    if (requiredRole === 'admin' && userRole === 'pe') {
      if (isQRCodesPage) {
        // Nếu đang ở trang QR code, cho phép PE xem
        return <>{children}</>;
      } else {
        // Nếu đang ở trang khác, chuyển hướng về trang QR code
        return <Navigate to="/qrcodes" replace />;
      }
    }
  }
  
  // Nếu vai trò là PE và đang cố gắng truy cập trang khác ngoài trang QR Code
  if (userRole === 'pe' && !isQRCodesPage) {
    return <Navigate to="/qrcodes" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
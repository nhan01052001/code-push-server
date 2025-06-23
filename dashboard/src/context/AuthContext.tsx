import { createContext, useState, useEffect, ReactNode } from 'react';
import { getAccount } from '../services/api';
import { getToken, saveToken, clearToken } from '../services/storage';
import { registerLogout } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setToken: (token: string, rememberMe?: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  setToken: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Kiểm tra token đã mã hóa khi component mount
  useEffect(() => {
    const storedToken = getToken();
    
    if (storedToken) {
      // Nếu có token hợp lệ, cập nhật state và cũng cập nhật localStorage thông thường
      // để các API request vẫn hoạt động bình thường
      localStorage.setItem('token', storedToken);
      setTokenState(storedToken);
    } else {
      // Nếu không có token mã hóa hợp lệ, xóa hết token khỏi localStorage
      localStorage.removeItem('token');
      setLoading(false);
    }
  }, []);
  
  // Kiểm tra token và lấy thông tin người dùng khi token thay đổi
  useEffect(() => {
    if (token) {
      setLoading(true);
      getAccount()
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          // Xóa hết token nếu API call thất bại (token không hợp lệ)
          clearToken();
          localStorage.removeItem('token');
          setTokenState(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  // Lưu token
  const setToken = (newToken: string, rememberMe = false) => {
    // Lưu token vào localStorage thông thường để các API request hoạt động
    localStorage.setItem('token', newToken);
    
    // Nếu người dùng chọn "Nhớ mật khẩu", lưu token đã mã hóa với hạn 30 ngày
    if (rememberMe) {
      saveToken(newToken, 30);
    }
    
    setTokenState(newToken);
  };

  // Logout
  const logout = () => {
    // Xóa hết token
    clearToken();
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    setTokenState(null);
    setUser(null);
    
    // Chuyển hướng về trang đăng nhập
    window.location.href = '/login';
  };
  
  // Đăng ký hàm logout với API service để xử lý lỗi 401
  useEffect(() => {
    registerLogout(logout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 
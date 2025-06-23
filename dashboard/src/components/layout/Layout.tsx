import { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Flex, Button, Heading, Box, IconButton } from '@radix-ui/themes';
import { AuthContext } from '@/context/AuthContext';
import { ThemeToggle } from '@/components';
import { ROUTES } from '@/config/constants';
import { 
  HamburgerMenuIcon,
  Cross1Icon,
  ExitIcon
} from '@radix-ui/react-icons';
import '../../styles/Layout.css';
import { BackToTopButton } from "@/components";

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState(ROUTES.APPS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Kiểm tra vai trò người dùng
  const userRole = localStorage.getItem('userRole') || 'guest';
  const isPEUser = userRole === 'pe';

  // Cập nhật active route dựa trên đường dẫn hiện tại
  useEffect(() => {
    if (location.pathname.startsWith('/apps')) {
      setActiveRoute(ROUTES.APPS);
    } else if (location.pathname === '/qrcode' || location.pathname === '/qrcodes') {
      setActiveRoute(ROUTES.QRCODE);
    }
  }, [location.pathname]);

  // Đóng sidebar khi thay đổi route trên mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Xử lý click bên ngoài để đóng sidebar trên mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar');
      const menuToggle = document.querySelector('.menu-toggle');
      
      if (sidebar && 
          menuToggle && 
          !sidebar.contains(event.target as Node) && 
          !menuToggle.contains(event.target as Node) && 
          sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Lọc menu items dựa vào vai trò người dùng
  let menuItems = [
    {
      icon: <img src="https://firebasestorage.googleapis.com/v0/b/portal4hrm.appspot.com/o/core-app%2Fqr-code.png?alt=media&token=e0329cdb-a249-47a3-b027-30a111eaf4c6" alt="QR Code" width={20} height={20} style={{ objectFit: 'contain' }} />,
      label: "QR Code",
      route: ROUTES.QRCODE,
      active: activeRoute === ROUTES.QRCODE
    }
  ];
  
  // Thêm item CodePush chỉ khi không phải là người dùng PE
  if (!isPEUser) {
    menuItems = [
      {
        icon: <img src="https://firebasestorage.googleapis.com/v0/b/portal4hrm.appspot.com/o/core-app%2Fdashboard.png?alt=media&token=9e5d474b-53e0-4038-9dfd-7336f872795a" alt="Dashboard" width={20} height={20} style={{ objectFit: 'contain' }} />,
        label: "CodePush",
        route: ROUTES.APPS,
        active: activeRoute === ROUTES.APPS
      },
      ...menuItems,
      {
        icon: <img src="/icon/setting.png" alt="Settings" width={20} height={20} style={{ objectFit: 'contain' }} />,
        label: "Cài đặt",
        route: ROUTES.SETTINGS,
        active: activeRoute === ROUTES.SETTINGS
      }
    ];
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Box 
        className="header"
        style={{
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 2rem',
          backgroundColor: 'var(--color-surface)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <Flex align="center" justify="between" style={{ height: '100%' }}>
          <Flex align="center" gap="3">
            {/* Mobile menu toggle */}
            <IconButton 
              className="menu-toggle mobile-only" 
              variant="ghost" 
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <Cross1Icon /> : <HamburgerMenuIcon />}
            </IconButton>
            
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/portal4hrm.appspot.com/o/core-app%2Fhrm-logo-2-1.png?alt=media&token=70d17ec1-b546-4e32-9f6d-0785651d88fd" 
              alt="Logo" 
              style={{ height: '40px', marginRight: '12px' }} 
            />
            <Heading size="5">CodePush Dashboard</Heading>
          </Flex>
          <Flex gap="4" align="center">
            {/* Luôn hiển thị các nút ngay cả khi không có user nhưng đã đăng nhập là PE */}
            {(user || isPEUser) && (
              <>
                {user && <Box className="user-email">{user.email}</Box>}
                <Box className="desktop-only">
                  <ThemeToggle variant='button' size='1'/>
                </Box>
                <Box className="desktop-only">
                  <Button variant="soft" onClick={() => logout()}>
                    Đăng xuất
                  </Button>
                </Box>
                <Box className="mobile-only">
                  <ThemeToggle variant='icon' size='1'/>
                </Box>
              </>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Main Content */}
      <Flex className="main-container">
        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay visible" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <Box
          className={`sidebar ${sidebarOpen ? 'open' : ''}`}
          style={{
            width: 'var(--sidebar-width)',
            position: 'fixed',
            top: 'var(--header-height)',
            height: 'calc(100vh - var(--header-height))',
            overflowY: 'auto',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
            zIndex: 90,
          }}
        >
          <Box style={{ padding: '1.5rem 1rem 0' }}>
            <Flex direction="column" gap="1">
              {menuItems.map((item, index) => (
                <Link 
                  key={index}
                  to={item.route} 
                  className={`sidebar-menu-item ${item.active ? 'active' : ''}`} 
                  onClick={() => {
                    setActiveRoute(item.route);
                    setSidebarOpen(false);
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile logout button - hiển thị dưới cùng của sidebar */}
              {(user || isPEUser) && (
                <div className="mobile-sidebar-footer">
                  <Button 
                    className="mobile-only sidebar-logout-button" 
                    variant="soft" 
                    onClick={() => {
                      logout();
                      setSidebarOpen(false);
                    }}
                  >
                    <ExitIcon />
                    <span>Đăng xuất</span>
                  </Button>
                </div>
              )}
            </Flex>
          </Box>
        </Box>

        {/* Content */}
        <Box 
          className="main-content"
          style={{
            marginTop: 'var(--header-height)'
          }}
        >
          <Outlet />
        </Box>
      </Flex>

      {/* Thêm BackToTopButton vào phần ngoài cùng của layout */}
      <BackToTopButton scrollThreshold={200} />
    </div>
  );
};

export default Layout; 
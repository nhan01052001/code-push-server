import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button, IconButton, Tooltip } from '@radix-ui/themes';
import { SunIcon, MoonIcon, DesktopIcon } from '@radix-ui/react-icons';

interface ThemeToggleProps {
  variant?: 'icon' | 'button';
  size?: '1' | '2' | '3';
}

const ThemeToggle = ({ variant = 'icon', size = '2' }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Đảm bảo component được render hoàn toàn ở phía máy khách
  // để tránh sự khác biệt giữa máy chủ và máy khách
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon />;
      case 'dark':
        return <MoonIcon />;
      default:
        return <DesktopIcon />;
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case 'light':
        return 'Chế độ sáng';
      case 'dark':
        return 'Chế độ tối';
      default:
        return 'Chế độ hệ thống';
    }
  };

  if (variant === 'icon') {
    return (
      <Tooltip content={getThemeText()}>
        <IconButton
          onClick={toggleTheme}
          variant="ghost"
          size={size}
          aria-label="Thay đổi chế độ giao diện"
        >
          {getThemeIcon()}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size={size}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
    >
      {getThemeIcon()}
      <span>{getThemeText()}</span>
    </Button>
  );
};

export default ThemeToggle; 
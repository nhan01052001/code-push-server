import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, IconButton } from '@radix-ui/themes';
import { ChevronUpIcon } from '@radix-ui/react-icons';

interface BackToTopButtonProps {
  scrollThreshold?: number;
  right?: string;
  bottom?: string;
}

const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  scrollThreshold = 300,
  right = '30px',
  bottom = '30px'
}) => {
  const [showButton, setShowButton] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Xử lý sự kiện scroll để hiển thị/ẩn nút Back to Top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > scrollThreshold) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    // Khởi tạo trạng thái ban đầu
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  // Hàm xử lý khi click vào nút Back to Top với animation mượt mà
  const scrollToTop = useCallback(() => {
    // Animation mượt mà với easeInOutQuad
    const duration = 800;
    const start = window.scrollY;
    const startTime = performance.now();
    
    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = easeInOutQuad(progress);
      
      window.scrollTo(0, start * (1 - easeProgress));
      
      if (elapsedTime < duration) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  }, []);

  if (!showButton) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        bottom,
        right,
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease-in-out'
      }}
    >
      <IconButton
        ref={buttonRef}
        size="3"
        variant="solid"
        color="gray"
        onClick={scrollToTop}
        style={{
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.2s ease, background-color 0.2s ease'
        }}
        className="back-to-top-button"
        aria-label="Cuộn lên đầu trang"
      >
        <ChevronUpIcon width="18" height="18" />
      </IconButton>
    </Box>
  );
};

export default BackToTopButton; 
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CollaboratorContextType {
  isCollaborator: boolean;
  setIsCollaborator: (value: boolean) => void;
}

const CollaboratorContext = createContext<CollaboratorContextType | undefined>(undefined);

interface CollaboratorProviderProps {
  children: ReactNode;
}

export const CollaboratorProvider = ({ children }: CollaboratorProviderProps) => {
  const [isCollaborator, setIsCollaborator] = useState<boolean>(false);

  // Kiểm tra trạng thái cộng tác viên từ localStorage khi component được mount
  useEffect(() => {
    const storedValue = localStorage.getItem('isCollaborator');
    if (storedValue) {
      setIsCollaborator(storedValue === 'true');
    }
  }, []);

  // Lưu trạng thái vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('isCollaborator', isCollaborator.toString());
  }, [isCollaborator]);

  const value = {
    isCollaborator,
    setIsCollaborator
  };

  return (
    <CollaboratorContext.Provider value={value}>
      {children}
    </CollaboratorContext.Provider>
  );
};

export const useCollaboratorStatus = (): CollaboratorContextType => {
  const context = useContext(CollaboratorContext);
  if (context === undefined) {
    throw new Error('useCollaboratorStatus must be used within a CollaboratorProvider');
  }
  return context;
}; 
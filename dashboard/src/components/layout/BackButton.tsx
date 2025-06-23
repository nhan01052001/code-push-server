import { Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  label?: string;
}

const BackButton = ({ label = "Quay lại" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  return (
    <Button variant="soft" onClick={handleBack}>
      ← {label}
    </Button>
  );
};

export default BackButton; 
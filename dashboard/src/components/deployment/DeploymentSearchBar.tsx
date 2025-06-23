import { TextField, Box } from "@radix-ui/themes";

interface DeploymentSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const DeploymentSearchBar = ({
  searchTerm,
  onSearchChange,
  placeholder = "Tìm kiếm deployment...",
  disabled = false
}: DeploymentSearchBarProps) => {
  return (
    <Box mt="4" mb="4" className="search-container">
      <TextField.Root
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={disabled}
      />
    </Box>
  );
};

export default DeploymentSearchBar;
export type { DeploymentSearchBarProps }; 
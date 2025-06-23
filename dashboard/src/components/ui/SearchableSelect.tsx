import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Select, TextField, Box, Text } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

// Sử dụng memo để tránh re-render không cần thiết
const SearchableSelect = memo(
  ({
    options,
    value,
    onChange,
    placeholder,
    disabled = false,
    emptyMessage = "Không có kết quả",
  }: SearchableSelectProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Sử dụng useMemo để tối ưu hiệu suất tìm kiếm
    const filteredOptions = useMemo(() => {
      if (!searchTerm) return options;

      const searchTermLower = searchTerm.toLowerCase();
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchTermLower)
      );
    }, [options, searchTerm]);

    // Reset search when dropdown closes
    useEffect(() => {
      if (!isFocused) {
        setSearchTerm("");
      }
    }, [isFocused]);

    // Sử dụng useCallback để tránh tạo lại hàm với mỗi lần render
    const handleSelectValueChange = useCallback(
      (newValue: string) => {
        onChange(newValue);
        setSearchTerm("");
      },
      [onChange]
    );

    // Sử dụng useCallback cho handler sự kiện
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
      },
      []
    );

    const handleSearchClick = useCallback(
      (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
      },
      []
    );

    return (
      <Select.Root
        value={value}
        onValueChange={handleSelectValueChange}
        disabled={disabled}
        onOpenChange={setIsFocused}
      >
        <Select.Trigger placeholder={placeholder} />
        <Select.Content position="popper" style={{ minWidth: "220px" }}>
          <Box py="1" px="1">
            <TextField.Root
              size="1"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={handleSearchClick}
              autoFocus
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="14" width="14" />
              </TextField.Slot>
            </TextField.Root>
          </Box>
          <Select.Group>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))
            ) : (
              <Box p="2" style={{ textAlign: "center" }}>
                <Text size="1" color="gray">
                  {emptyMessage}
                </Text>
              </Box>
            )}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    );
  }
);

// Thêm displayName để hỗ trợ debugging
SearchableSelect.displayName = "SearchableSelect";

export default SearchableSelect;

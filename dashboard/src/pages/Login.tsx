import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Heading,
  Text,
  Box,
  TextField,
  Flex,
  Checkbox,
  Tabs,
} from "@radix-ui/themes";
import { AuthContext } from "../context/AuthContext";
import { login } from "../services/api";
import { secondaryApi } from "../services/api";
import { showSuccessToast, showErrorToast } from "@/components";
import { ThemeToggle } from "@/components";
import "../styles/Login.css";
import { encryptData } from "@/utils/crypto-utils";

// GitHub logo icon component
const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const Login = () => {
  const { token, loading, setToken } = useContext(AuthContext);
  const [accessKey, setAccessKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [showAccessKeyForm, setShowAccessKeyForm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Biến mới cho đăng nhập PE
  const [peUsername, setPeUsername] = useState("");
  const [pePassword, setPassword] = useState("");
  const [loginTab, setLoginTab] = useState("github");
  const [isPeLoginInvalid, setIsPeLoginInvalid] = useState(false);

  // Nếu đã đăng nhập, chuyển hướng đến trang chính
  useEffect(() => {
    if (token && !loading) {
      const from = location.state?.from?.pathname || "/apps";
      navigate(from, { replace: true });
    }
  }, [token, loading, navigate, location.state]);

  const handleLoginWithPE = async () => {
    setIsLoading(true);
    setIsPeLoginInvalid(false);

    try {
      // Gọi API xác thực PE để lấy JWT
      const response = await secondaryApi.post("/auth/pe-login", {
        username: peUsername,
        password: pePassword,
      });

      if (response.data && response.data.jwt) {
        // Lưu JWT vào localStorage
        localStorage.setItem("jwt", response.data.jwt);
        localStorage.setItem("userRole", "pe");
        localStorage.setItem("isAuthenticated", "true");

        // Hiển thị thông báo thành công
        showSuccessToast("Đăng nhập tài khoản PE thành công!");

        // Chuyển hướng đến trang danh sách QR code
        navigate("/qrcodes");
      } else {
        // Xử lý lỗi từ API
        setIsPeLoginInvalid(true);
        showErrorToast(
          response.data?.message || "Tài khoản hoặc mật khẩu không chính xác"
        );
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập PE:", error);

      // Hiển thị thông báo lỗi dựa trên phản hồi từ server
      const errorMessage =
        error.response?.data?.message || "Đăng nhập thất bại";
      setIsPeLoginInvalid(true);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLoginWithPE();
    }
  };

  const handleLogin = async () => {
    if (!accessKey.trim()) {
      setIsInvalid(true);
      showErrorToast("Vui lòng nhập Access Key");
      return;
    }

    setIsLoading(true);
    setIsInvalid(false);

    try {
      // Lưu access key tạm thời để gọi API
      localStorage.setItem("token", accessKey);

      // Thử lấy thông tin tài khoản để kiểm tra access key có hợp lệ không
      // await getAccount();

      // Nếu không có lỗi, access key hợp lệ - lưu với trạng thái "nhớ mật khẩu"
      // setToken(accessKey, rememberMe);
      // showSuccessToast("Đăng nhập thành công!");
      // navigate("/apps");
      console.log(encryptData(accessKey), '123');
      
      const response = await login({ accessKey: encryptData(accessKey) });
      if (response?.jwt) {
        localStorage.setItem("jwt", response.jwt);
        localStorage.setItem("token", accessKey);
        localStorage.setItem("userRole", "admin"); // Gán quyền admin cho đăng nhập thông thường
        localStorage.setItem("isAuthenticated", "true");
        setToken(accessKey, rememberMe);
        showSuccessToast("Đăng nhập thành công!");
        navigate("/apps");
      }
    } catch (error: any) {
      // Nếu có lỗi, access key không hợp lệ
      console.error("Lỗi đăng nhập:", error);
      localStorage.removeItem("token");

      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = "Đăng nhập thất bại";
      if (error.code === "ERR_NETWORK") {
        errorMessage =
          "Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server có đang hoạt động không.";
      } else if (error.response?.status === 401) {
        errorMessage = "Access Key không hợp lệ hoặc đã hết hạn.";
      } else {
        errorMessage = `Đăng nhập thất bại: ${
          error.message || "Lỗi không xác định"
        }`;
      }

      // Đánh dấu trường nhập liệu không hợp lệ
      setIsInvalid(true);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleGitHubLogin = () => {
    // Lấy SERVER_URL từ biến môi trường
    const serverUrl = import.meta.env.VITE_SERVER_URL || "";

    // Mở tab mới để đăng nhập với GitHub
    window.open(`${serverUrl}/auth/login/github`, "_blank");

    // Hiển thị form access key
    setShowAccessKeyForm(true);
    showSuccessToast(
      "Đã mở trang đăng nhập GitHub. Vui lòng nhập Access Key sau khi xác thực."
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccessKey(e.target.value);
    if (isInvalid) {
      setIsInvalid(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="theme-toggle-position">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <Heading size="6" style={{ marginBottom: "1rem" }}>
          CodePush Dashboard
        </Heading>

        <Text size="2" style={{ marginBottom: "2rem" }}>
          Đăng nhập để quản lý các ứng dụng và phiên bản của bạn
        </Text>

        <Tabs.Root
          defaultValue="github"
          value={loginTab}
          onValueChange={setLoginTab}
        >
          <Tabs.List>
            <Tabs.Trigger value="github">Github</Tabs.Trigger>
            <Tabs.Trigger value="accessKey">Access Key</Tabs.Trigger>
            <Tabs.Trigger value="pe">Tài khoản PE</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="github">
            <Box style={{ marginTop: "1.5rem" }}>
              <Button
                size="3"
                onClick={handleGitHubLogin}
                className="github-button"
              >
                <Flex align="center" gap="2">
                  <GitHubIcon />
                  <span>Đăng nhập với GitHub</span>
                </Flex>
              </Button>

              <Box style={{ marginTop: "1rem", textAlign: "center" }}>
                <Text size="1" as="span" color="gray">
                  Sau khi xác thực GitHub, bạn sẽ nhận được Access Key
                </Text>
              </Box>
            </Box>
          </Tabs.Content>

          <Tabs.Content value="accessKey">
            <Box style={{ marginTop: "1.5rem" }}>
              <TextField.Root
                placeholder="Nhập Access Key"
                value={accessKey}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                color={isInvalid ? "red" : undefined}
              />

              <Flex align="center" style={{ marginTop: "1rem" }}>
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  id="remember-me"
                />
                <Text
                  size="2"
                  as="label"
                  style={{ marginLeft: "8px", cursor: "pointer" }}
                  htmlFor="remember-me"
                >
                  Ghi nhớ đăng nhập
                </Text>
              </Flex>

              <Button
                size="3"
                onClick={handleLogin}
                disabled={isLoading}
                style={{ marginTop: "1rem", width: "100%" }}
                className="login-button"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </Box>
          </Tabs.Content>

          <Tabs.Content value="pe">
            <Flex direction="column" gap="3" style={{ marginTop: "1.5rem" }}>
              <TextField.Root
                placeholder="Tài khoản"
                value={peUsername}
                onChange={(e) => {
                  setPeUsername(e.target.value);
                  if (isPeLoginInvalid) setIsPeLoginInvalid(false);
                }}
                onKeyDown={handlePeKeyDown}
                color={isPeLoginInvalid ? "red" : undefined}
              />

              <TextField.Root
                placeholder="Mật khẩu"
                type="password"
                value={pePassword}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (isPeLoginInvalid) setIsPeLoginInvalid(false);
                }}
                onKeyDown={handlePeKeyDown}
                color={isPeLoginInvalid ? "red" : undefined}
              />

              <Button
                size="3"
                onClick={handleLoginWithPE}
                style={{ marginTop: "0.5rem", width: "100%" }}
                className="login-button"
              >
                Đăng nhập
              </Button>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default Login;

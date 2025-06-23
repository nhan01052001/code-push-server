import axios from "axios";
import { showErrorToast } from "@/components";

// Kiểm tra xem đang ở môi trường production hay development
const isProduction = import.meta.env.PROD;

// Cấu hình baseURL phù hợp với môi trường
const api = axios.create({
  baseURL: isProduction
    ? "https://codepush.vnresource.net:2080" // URL API thật khi deploy
    : "/api", // Sử dụng proxy đã cấu hình trong vite.config.ts khi dev
  headers: {
    "Content-Type": "application/json",
  },
});

// API thứ hai với baseURL khác cho trường hợp đặc biệt
const secondaryApi = axios.create({
  baseURL: import.meta.env.VITE_SECONDARY_API_URL || "https://codepush.vnresource.net:2080",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
});

// Biến lưu trữ hàm logout để tránh circular dependency
let logoutFunction: (() => void) | null = null;

// Hàm để đăng ký hàm logout từ AuthContext
export const registerLogout = (logout: () => void) => {
  logoutFunction = logout;
};

// Thêm interceptor cho secondaryApi tương tự như api chính
secondaryApi.interceptors.request.use(
  (config) => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

secondaryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Secondary API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // Xử lý lỗi 401 Unauthorized
    if (error.response?.status === 401) {
      showErrorToast("Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại");
      
      // Thực hiện logout nếu hàm logout đã được đăng ký
      if (logoutFunction) {
        setTimeout(() => {
          logoutFunction?.();
        }, 1000); // Delay một chút để người dùng thấy thông báo
      } else {
        // Fallback nếu chưa đăng ký hàm logout
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý lỗi mạng
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401 Unauthorized
    if (error.response?.status === 401) {
      showErrorToast("Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại");
      
      // Thực hiện logout nếu hàm logout đã được đăng ký
      if (logoutFunction) {
        setTimeout(() => {
          logoutFunction?.();
        }, 1000); // Delay một chút để người dùng thấy thông báo
      } else {
        // Fallback nếu chưa đăng ký hàm logout
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

// login
export const login = async (data: { accessKey: string }) => {
  const response = await secondaryApi.post("/auth/github-token", data,);
  return response.data;
};

// Account Management
export const getAccount = async () => {
  const response = await api.get("/account");
  return response.data;
};

export const getAccessKeys = async () => {
  const response = await api.get("/accessKeys");
  return response.data;
};

export const createAccessKey = async (data: {
  name: string;
  friendlyName: string;
  ttl: number;
}) => {
  const response = await api.post("/accessKeys", data);
  return response.data;
};

// App Management
export const getApps = async () => {
  const response = await api.get("/apps");
  return response.data;
};

export const createApp = async (data: {
  name: string;
  os: string;
  platform: string;
}) => {
  const response = await api.post("/apps", data);
  return response.data;
};

export const getAppDetails = async (appName: string) => {
  const response = await api.get(`/apps/${appName}`);
  return response.data;
};

export const updateApp = async (
  appName: string,
  data: Partial<{ name: string; os: string; platform: string }>
) => {
  const response = await api.patch(`/apps/${appName}`, data);
  return response.data;
};

// Deployment Management
export const getDeployments = async (appName: string) => {
  const response = await api.get(`/apps/${appName}/deployments`);
  return response.data;
};

export const createDeployment = async (
  appName: string,
  data: { name: string }
) => {
  const response = await api.post(`/apps/${appName}/deployments`, data);
  return response.data;
};

export const getDeploymentDetails = async (
  appName: string,
  deploymentName: string
) => {
  const response = await api.get(
    `/apps/${appName}/deployments/${deploymentName}`
  );
  return response.data;
};

export const updateDeployment = async (
  appName: string,
  deploymentName: string,
  data: Partial<{
    name: string;
    description?: string;
    isDisabled?: boolean;
    isMandatory?: boolean;
  }>
) => {
  const response = await api.patch(
    `/apps/${appName}/deployments/${deploymentName}`,
    data
  );

  return response.data;
};

export const deleteDeployment = async (
  appName: string,
  deploymentName: string
) => {
  const response = await api.delete(
    `/apps/${appName}/deployments/${deploymentName}`
  );
  return response.data;
};

// Package Management
export const getDeploymentHistory = async (
  appName: string,
  deploymentName: string
) => {
  const response = await api.get(
    `/apps/${appName}/deployments/${deploymentName}/history`
  );
  return response.data;
};

export const promoteDeployment = async (
  appName: string,
  sourceDeploymentName: string,
  destDeploymentName: string,
  packageInfo: any
) => {
  const response = await api.post(
    `/apps/${appName}/deployments/${sourceDeploymentName}/promote/${destDeploymentName}`,
    { packageInfo }
  );
  return response.data;
};

export const rollbackDeployment = async (
  appName: string,
  deploymentName: string,
  targetRelease?: string
) => {
  const url = targetRelease
    ? `/apps/${appName}/deployments/${deploymentName}/rollback/${targetRelease}`
    : `/apps/${appName}/deployments/${deploymentName}/rollback`;
  const response = await api.post(url);
  return response.data;
};

// Collaborator Management
export const getCollaborators = async (appName: string) => {
  const response = await api.get(`/apps/${appName}/collaborators`);
  return response.data;
};

export const addCollaborator = async (appName: string, email: string) => {
  const response = await api.post(`/apps/${appName}/collaborators/${email}`);
  return response.data;
};

export const removeCollaborator = async (appName: string, email: string) => {
  const response = await api.delete(`/apps/${appName}/collaborators/${email}`);
  return response.data;
};

/**
 * Cập nhật thông tin của một phiên bản cụ thể trong deployment
 */
export const updateRelease = async (
  appName: string,
  deploymentName: string,
  releaseLabel: string,
  updateData: {
    description?: string;
    isDisabled?: boolean;
    isMandatory?: boolean;
  }
): Promise<any> => {
  return api.patch(`/apps/${appName}/deployments/${deploymentName}/release`, {
    packageInfo: {
      ...updateData,
      label: releaseLabel,
    },
  });
};

// Export các API instances để có thể sử dụng trực tiếp nếu cần
export { api, secondaryApi };

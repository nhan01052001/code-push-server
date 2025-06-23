import { secondaryApi } from "./api";

interface QRCodeData {
  ID: string;
  CusCode: string;
  CusName: string;
  UriHR: string;
  UriMain: string;
  UriPor: string;
  UriSys: string;
  UriCenter: string;
  UriIdentity: string | null;
  VersionCode: string;
  keyUpdateAndroid: string;
  keyUpdateIos: string;
  QRCodeBase64: string;
  DecAlgorithm?: string;
}

interface ParamUpdateApp {
  iosApp?: string;
  iosDeployment?: string;
  iosDescription?: string;
  androidApp?: string;
  androidDeployment?: string;
  androidDescription?: string;
  branch: string;
  accessKey: string;
}

/**
 * Kiểm tra xác thực trước khi gửi yêu cầu API
 */
const checkAuthentication = () => {
  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true" ||
    localStorage.getItem("token");

  if (!isAuthenticated) {
    throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");
  }

  return true;
};

/**
 * Lấy danh sách QR code
 * @param page Trang hiện tại
 * @param pageSize Số lượng bản ghi trên mỗi trang
 * @param search Từ khóa tìm kiếm (tùy chọn)
 */
export const getQRCodes = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<{
  items: QRCodeData[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}> => {
  try {
    checkAuthentication();

    const params = { page, pageSize };
    if (search) {
      Object.assign(params, { search });
    }

    const response = await secondaryApi.get(`/customer/allProducts`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một QR code
 */
export const getQRCodeById = async (id: string): Promise<QRCodeData> => {
  try {
    checkAuthentication();

    const response = await secondaryApi.get(`/api/qrcodes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching QR code with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Tạo QR code mới
 */
export const createQRCode = async (formData: FormData) => {
  try {
    checkAuthentication();

    // Kiểm tra quyền tạo mới
    const userRole = localStorage.getItem("userRole");
    if (userRole === "pe") {
      throw new Error("Bạn không có quyền tạo mã QR Code mới");
    }

    const response = await secondaryApi.post(`/customer/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating QR code:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin QR code
 */
export const updateQRCode = async (formData: FormData) => {
  try {
    checkAuthentication();

    // Kiểm tra quyền cập nhật
    const userRole = localStorage.getItem("userRole");
    if (userRole === "pe") {
      throw new Error("Bạn không có quyền cập nhật mã QR Code");
    }

    const response = await secondaryApi.post(`/customer/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa QR code (soft delete)
 */
export const deleteQRCode = async (id: string) => {
  try {
    checkAuthentication();

    // Kiểm tra quyền xóa
    const userRole = localStorage.getItem("userRole");
    if (userRole === "pe") {
      throw new Error("Bạn không có quyền xóa mã QR Code");
    }

    const response = await secondaryApi.post(`/customer/deleteQRCode`, {
      ID: id,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateApp = async (params: ParamUpdateApp) => {
  try {
    const response = await secondaryApi.post(`/cmd/update-app`, params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

interface ConfigurationData {
  VersionAndroid?: string;
  VersionIOS?: string;
  ID?: string;
  UserCreate?: string | null;
  DateCreate?: string;
  UserUpdate?: string | null;
  DateUpdate?: string;
  IsDelete?: boolean;
  NameAppAndroid?: string;
  NameAppIOS?: string;
  Source?: string;
}

export const updateConfig = async (
  id: string,
  data: Partial<ConfigurationData>
) => {
  try {
    const response = await secondaryApi.post(
      `/configuration/update/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getConfigByApp = async (isAndroid: boolean, appName: string) => {
  try {
    const response = await secondaryApi.get(`/configuration/configByApp`, {
      params: { isAndroid, appName },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getConfigDashboard = async (url: string) => {
  try {
    const response = await secondaryApi.get(
      `/proxy/getConfigDashboard`,
      {
        params: { url },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

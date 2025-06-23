import CryptoJS from 'crypto-js';

// Khóa mã hóa dùng cho việc mã hóa token
// Trong ứng dụng thực tế, bạn có thể sử dụng một khóa phức tạp hơn
// hoặc tạo ra từ thông tin người dùng ví dụ như fingerprint browser
const VITE_ENCRYPTION_KEY = 'codepush-dashboard-secure-storage-key';

/**
 * Mã hóa một chuỗi dữ liệu
 * @param data Dữ liệu cần mã hóa
 * @returns Chuỗi đã được mã hóa
 */
const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, VITE_ENCRYPTION_KEY).toString();
};

/**
 * Giải mã một chuỗi đã được mã hóa
 * @param encryptedData Chuỗi đã được mã hóa
 * @returns Chuỗi đã được giải mã hoặc null nếu có lỗi
 */
const decrypt = (encryptedData: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, VITE_ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};

// Tên các key để lưu vào localStorage
const STORAGE_KEYS = {
  TOKEN: 'codepush_auth_token',
  TOKEN_EXPIRY: 'codepush_auth_token_expiry',
};

/**
 * Lưu token vào localStorage với mã hóa
 * @param token Token cần lưu trữ
 * @param expiryDays Số ngày token hết hạn (mặc định 30 ngày)
 */
export const saveToken = (token: string, expiryDays = 30): void => {
  const encryptedToken = encrypt(token);
  
  // Tính thời gian hết hạn (tính bằng mili giây)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  const expiryTimestamp = expiryDate.getTime().toString();
  
  // Lưu token đã mã hóa và thời gian hết hạn
  localStorage.setItem(STORAGE_KEYS.TOKEN, encryptedToken);
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, encrypt(expiryTimestamp));
};

/**
 * Lấy token từ localStorage và kiểm tra xem token có còn hạn hay không
 * @returns Token nếu còn hạn, null nếu token không tồn tại hoặc đã hết hạn
 */
export const getToken = (): string | null => {
  const encryptedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const encryptedExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  
  if (!encryptedToken || !encryptedExpiry) {
    return null;
  }
  
  // Giải mã thời gian hết hạn
  const expiryTimestamp = decrypt(encryptedExpiry);
  if (!expiryTimestamp) {
    // Nếu không giải mã được, xóa dữ liệu lưu trữ và trả về null
    clearToken();
    return null;
  }
  
  // Kiểm tra token còn hạn không
  const now = new Date().getTime();
  if (now > parseInt(expiryTimestamp)) {
    // Token đã hết hạn, xóa dữ liệu lưu trữ
    clearToken();
    return null;
  }
  
  // Token còn hạn, giải mã và trả về
  const token = decrypt(encryptedToken);
  return token;
};

/**
 * Xóa token và thông tin liên quan khỏi localStorage
 */
export const clearToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
}; 
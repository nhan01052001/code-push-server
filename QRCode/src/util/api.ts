import axios from "axios";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ErrorResponse } from "./error/error-response.error";

// Cấu hình baseURL phù hợp với môi trường
const api = axios.create({
  baseURL: "https://codepush.vnresource.net:2080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để xử lý lỗi mạng
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error, "error");

    throw new ErrorResponse({
      ...new BadRequestException("Lỗi mạng! Vui lòng thử lại sau!"),
      errorCode: "FAIL",
    });
  }
);

export const getDeploymentHistory = async (
  appName: string,
  deploymentName: string,
  token: string
) => {
  const response = await api.get(
    `/apps/${appName}/deployments/${deploymentName}/history`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

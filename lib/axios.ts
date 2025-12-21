// automatically inject CSRF token  with axios instance
// lib/axios.ts

import axios from "axios";
import { getCsrfTokenFromCookie, CSRF_CONFIG } from "./csrf";

const axiosInstance = axios.create();

// interceptor: add CSRF token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase();

    if (method && !["get", "head", "options"].includes(method)) {
      const csrfToken = getCsrfTokenFromCookie();

      if (csrfToken) {
        config.headers[CSRF_CONFIG.HEADER_NAME] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

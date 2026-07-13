import axios from "axios";
import { Store } from "../state/store";
import { reset } from "../state/slices/authReducer";
export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const state = Store.getState();
    const token = state.auths?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      Store.dispatch(reset());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

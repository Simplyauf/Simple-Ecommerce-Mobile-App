import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (email: string, password: string, full_name: string) =>
    api.post("/auth/register", { email, password, full_name }),

  getMe: () => api.get("/auth/me"),
};

export const productsAPI = {
  getProducts: (params?: {
    category?: string;
    sort?: "price_asc" | "price_desc" | "newest";
    page?: number;
    limit?: number;
  }) => api.get("/products", { params }),

  getProduct: (slug: string) => api.get(`/products/${slug}`),

  createProduct: (data: FormData) =>
    api.post("/products", data, {
      headers: {
        "Content-Type": "application/json",
      },
    }),
};

export const categoriesAPI = {
  getCategories: () => api.get("/categories"),
  getCategory: (slug: string) => api.get(`/categories/${slug}`),
};

export const ordersAPI = {
  createOrder: (items: Array<{ product_id: number; quantity: number }>) =>
    api.post("/orders", { items }),

  getOrders: () => api.get("/orders"),

  getOrder: (id: number) => api.get(`/orders/${id}`),
};

export const uploadAPI = {
  uploadImage: (imageFormData: FormData) =>
    api.post("/upload", imageFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface CategoriesResponse {
  errors: boolean;
  message: string;
  data: {
    categories: Category[];
  };
}

export const getCategories = async (): Promise<CategoriesResponse> => {
  try {
    const response = await axios.get<CategoriesResponse>(
      `${BASE_URL}/categories`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw error;
    }
    throw new Error("Failed to fetch categories");
  }
};

export default api;

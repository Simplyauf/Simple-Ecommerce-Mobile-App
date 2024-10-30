import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  exp: number;
  iat: number;
  session: number;
}

export const sessionManager = {
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  },

  checkSession: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return false;

      if (sessionManager.isTokenExpired(token)) {
        await sessionManager.clearSession();
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  clearSession: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(["token", "user", "lastLoginTime"]);
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  },

  refreshSession: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return false;

      return true;
    } catch {
      return false;
    }
  },
};

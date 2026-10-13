import Cookies from "js-cookie";
import { toast } from "sonner";
import { M } from "@/lib/messages";

export const saveToken = (token) => {
  Cookies.set("aura-admin-token", token, {
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

export const getToken = () => {
  return Cookies.get("aura-admin-token");
};

export const clearToken = () => {
  Cookies.remove("aura-admin-token", { path: "/" });
  toast.info(M.auth.loggedOut);
};

export const isAuthenticated = () => {
  const token = getToken();
  return Boolean(token);
};

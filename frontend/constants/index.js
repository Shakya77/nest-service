import api from "@/lib/api";

export const fetcher = (url) => api.get(url).then((res) => res.data);

export const Roles = {
  ADMIN: "admin",
  STAFF: "staff",
  USER: "user",
};

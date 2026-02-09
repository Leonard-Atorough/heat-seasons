export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: "admin" | "user";
}

export type UserRole = "user" | "admin" | "compliance" | "treasury" | "auditor";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

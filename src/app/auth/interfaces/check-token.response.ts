import { User } from "./user";

export interface CheckTokenResponse {
  user:  User;
  token: string;
}
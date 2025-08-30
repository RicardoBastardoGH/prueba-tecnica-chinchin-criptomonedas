// import { User } from './user.interface';

import { User } from "./user";


export interface LoginResponse {
  user:  User;
  token: string;
}
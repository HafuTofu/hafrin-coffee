import { Types } from "mongoose";

export interface UserDocument {
  _id: Types.ObjectId;
  username: string;
  name: string;
  email: string;
  password: string;
  picture?: string;
  provider?: string;
  providerId?: string;
  oauth?: boolean;
  gender: "male" | "female" | "other";
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SafeUser {
  _id: string;
  username: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  _id: Types.ObjectId;
  username: string;
  password: string;
}
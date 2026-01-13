// src/types/auth.ts
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type LoginReq = {
  email: string;
  password: string;
};

export type RegisterReq = {
  email: string;
  password: string;
};

import { DefaultResponse } from '../../../common/responses/response.interface';

export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse extends DefaultResponse {
  result: LoginResult;
}

export interface LoginResult {
  token: string;
  profile: Profile;
}

export interface Profile {
  username: string;
  name: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface RefreshJwtPayload extends JwtPayload {
  jti: string;
  type: 'refresh';
}

export interface CredentialsJwtPayload {
  userId: string;
  email: string;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

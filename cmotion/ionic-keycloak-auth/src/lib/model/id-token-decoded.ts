/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

export interface IDTokenDecoded {
  jti: string;
  exp: number;
  nbf: number;
  iat: number;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  nonce: string;
  auth_time: number;
  session_state: string;
  acr: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
  avatarUrl: string;
  mobileNumber: string;
  description: string;

  [key: string]: any;
}

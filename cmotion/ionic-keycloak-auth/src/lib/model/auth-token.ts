/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

export interface AuthToken {
  access_token: string;
  expires_in: number;
  id_token: string;
  'not-before-policy': number;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  session_state: string;
  token_type: string;

  [key: string]: any;
}

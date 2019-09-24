/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

import {Inject, Injectable} from '@angular/core';
import {AuthToken, JwtConfig} from '../model';
import {JWT_GET_AND_SETTER} from '../contant';

@Injectable()
export class StorageService {

  constructor(
    @Inject(JWT_GET_AND_SETTER) private config: JwtConfig,
  ) {
  }

  public async setToken(value: AuthToken): Promise<void> {
    return this.config.setToken(value);
  }

  public async getToken(): Promise<AuthToken> {
    return this.config.getToken();
  }

}

/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

import {Inject, Injectable} from '@angular/core';
import {JwtHelperService, JwtInterceptor} from '@auth0/angular-jwt';
import {JWT_GET_AND_SETTER} from '../contant';
import {JwtConfig} from '../model';

@Injectable()
export class KcTokenInterceptorService extends JwtInterceptor {

  constructor(
    @Inject(JWT_GET_AND_SETTER) private config: JwtConfig
  ) {
    super(config, new JwtHelperService());
    this.tokenGetter = () => this.config.getToken()
      .then(token => token ? token.access_token : null);
  }
}

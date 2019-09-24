/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

import {Inject, Injectable} from '@angular/core';
import {JwtHelperService, JwtInterceptor} from '@auth0/angular-jwt';
import {JWT_GET_AND_SETTER} from '../contant';
import {JwtConfig} from '../model';
import {KeycloakAuthService} from './keycloak-auth.service';

@Injectable()
export class KcTokenInterceptorService extends JwtInterceptor {

  constructor(
    @Inject(JWT_GET_AND_SETTER) private config: JwtConfig,
    private keycloakAuthService: KeycloakAuthService
  ) {
    super(config, new JwtHelperService());
    this.initTokenGetter();
  }

  private initTokenGetter() {
    this.tokenGetter = () => this.keycloakAuthService.getToken();
  }

}

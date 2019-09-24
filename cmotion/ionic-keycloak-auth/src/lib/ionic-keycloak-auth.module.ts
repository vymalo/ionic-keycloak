/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {JwtConfig, ModuleConfig} from './model';
import {DeepLinkService, KcTokenInterceptorService, KeycloakAuthService, StorageService} from './service';
import {Platform} from '@ionic/angular';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {BrowserTab} from '@ionic-native/browser-tab/ngx';
import {JwtHelperService} from '@auth0/angular-jwt';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {Deeplinks} from '@ionic-native/deeplinks/ngx';
import {DEEP_LINKING_OPTIONS, JWT_GET_AND_SETTER, KEYCLOAK_OPTIONS} from './contant';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';

@NgModule()
export class IonicKeycloakAuthModule {

  constructor(
    private platform: Platform,
    private authService: KeycloakAuthService,
    private deepLinkService: DeepLinkService,
    @Optional() @SkipSelf() parentModule: IonicKeycloakAuthModule
  ) {
    if (parentModule) {
      throw new Error('JwtModule is already loaded. It should only be imported in your application\'s main module.');
    }
    this.platform
      .ready()
      .then(() => this.authService.init())
      .then(() => this.deepLinkService.init())
      .catch((err = {}) => {
        const context = {messageError: 'Ionic Keycloak Error: could not initialize the app'};
        Object.assign(err, {context});
        throw err;
      });
  }

  public static forRoot(config = new ModuleConfig()): ModuleWithProviders {
    return {
      ngModule: IonicKeycloakAuthModule,
      providers: [
        Deeplinks,
        BrowserTab,
        InAppBrowser,
        NativeStorage,
        HttpClientModule,
        config.kcOptionsProvider || {provide: KEYCLOAK_OPTIONS, useValue: config.keycloakConfig},
        config.jwtConfigProvider || {provide: JWT_GET_AND_SETTER, useValue: config.jwtModuleOptions},
        {provide: DEEP_LINKING_OPTIONS, useValue: config.deepLinksConfig},
        StorageService,
        DeepLinkService,
        KeycloakAuthService,
        JwtHelperService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: KcTokenInterceptorService,
          multi: true
        },
      ]
    };
  }

}


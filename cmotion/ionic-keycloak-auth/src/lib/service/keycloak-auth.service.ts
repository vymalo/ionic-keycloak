/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {DeepLinkService} from './deep-link.service';
import {StorageService} from './storage.service';
import {BrowserTab} from '@ionic-native/browser-tab/ngx';
import {JwtHelperService} from '@auth0/angular-jwt';
import {BehaviorSubject, Observable} from 'rxjs';
import * as Keycloak_ from 'keycloak-js';
import {KeycloakLoginOptions} from 'keycloak-js';
import {
  AuthToken,
  DeepLinkConfig,
  FetchKeycloakJSON,
  IDTokenDecoded,
  KcConfig,
  KeycloakJsonStructure,
  KeycloakLoginResponse,
  TokenDecoded
} from '../model';
import {DEEP_LINKING_OPTIONS, KEYCLOAK_OPTIONS} from '../contant';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {Router} from '@angular/router';

// Workaround from https://github.com/ng-packagr/ng-packagr/issues/343#issuecomment-350965445
const Keycloak = Keycloak_;
const jwtHelperService: JwtHelperService = new JwtHelperService();

@Injectable()
export class KeycloakAuthService {

  protected subject: BehaviorSubject<IDTokenDecoded>;
  private readonly appPrefix: string;
  private readonly keycloakConfig: FetchKeycloakJSON;
  private keycloakInstance: Keycloak_.KeycloakInstance;

  constructor(
    @Inject(DEEP_LINKING_OPTIONS) deepLinkConfig: DeepLinkConfig,
    @Inject(KEYCLOAK_OPTIONS) kcConfig: KcConfig,
    protected http: HttpClient,
    protected browserTab: BrowserTab,
    protected router: Router,
    protected storage: StorageService,
    protected inAppBrowser: InAppBrowser,
    protected deepLinkService: DeepLinkService,
  ) {
    this.keycloakConfig = kcConfig.jsonConfig;
    this.appPrefix = `${deepLinkConfig.deepLinkingScheme}://app`;
  }

  /**
   *
   */
  public user(): Observable<IDTokenDecoded> {
    return this.subject.asObservable();
  }

  /**
   *
   */
  public async init() {
    await this.initKeycloak();
    return this.refresh();
  }

  /**
   *
   */
  public async logout() {
    await this.handleNewToken(null);
    const url: string = this.getLogoutUrl();
    return new Promise<void>(async (resolve, reject) => {
      if (await this.browserTab.isAvailable()) {
        this.browserTab.openUrl(url)
          .then(() => this.browserTab.close())
          .catch(err => reject(err));
        resolve();
      } else {
        const browser = this.inAppBrowser.create(url, '_system');
        const sub = browser.on('loadstop')
          .subscribe(() => {
            browser.close();
            resolve();
            sub.unsubscribe();
          }, err => {
            reject(err);
            sub.unsubscribe();
          });
      }
    });
  }

  /**
   *
   * @param isLogin
   * @param redirectUrl
   */
  public async login(isLogin: boolean = true, redirectUrl?: string): Promise<AuthToken> {
    try {
      if (redirectUrl[0] === '/') {
        redirectUrl = redirectUrl.substr(1);
      }
      const response = await this.beginLoginAndGetCode(redirectUrl, isLogin);
      return this.continueLoginWithCode(response);
    } catch (err) {
      const context = {messageError: 'Ionic Keycloak Error: error by login'};
      Object.assign(err, {context});
      throw err;
    }
  }


  /**
   *
   * @param refresh
   */
  public async getToken(refresh = false) {
    let authToken = await this.storage.getToken();
    if (!authToken) {
      return null;
    }
    if (refresh || jwtHelperService.isTokenExpired(authToken.access_token, 10)) {
      authToken = await this.refresh();
    }
    return authToken.access_token;
  }

  public async getTokenDecoded(refresh = false): Promise<TokenDecoded> {
    const token = await this.getToken(refresh);
    return jwtHelperService.decodeToken(token) as TokenDecoded;
  }

  private getLogoutUrl(redirectUrl = this.router.url): string {
    return this.keycloakInstance.createLogoutUrl({
      redirectUri: this.appPrefix + encodeURIComponent(redirectUrl)
    });
  }

  private async getKcJsonStructure(): Promise<KeycloakJsonStructure> {
    const prom = this.keycloakConfig();
    let config: KeycloakJsonStructure;
    if (prom instanceof Promise) {
      config = await prom;
    } else {
      config = prom;
    }
    /**
     * This line because the init method needs the clientId and url to work
     * which are the resource and the auth-server-url respectively
     */
    config.clientId = config.resource;
    config.url = config['auth-server-url'];
    return config;
  }

  private async handleNewToken(authToken: AuthToken) {
    if (authToken) {
      const user: IDTokenDecoded = jwtHelperService.decodeToken(authToken.id_token);
      if (!this.subject) {
        this.subject = new BehaviorSubject<IDTokenDecoded>(user);
      }
      this.subject.next(user);
      await this.storage.setToken(authToken);
    } else {
      if (!this.subject) {
        this.subject = new BehaviorSubject<IDTokenDecoded>(null);
      }
      this.subject.next(null);
      await this.storage.setToken(null);
    }
  }

  private createPostRequest(uri: string, body: any, options?: {
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
  }) {
    return this.http.post<AuthToken>(uri, body, options).toPromise();
  }

  private getRefreshParams(refreshToken: string) {
    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken)
      .set('client_id', encodeURIComponent(this.keycloakInstance.clientId));
    const secret = this.keycloakInstance.clientSecret;
    if (secret) {
      return params
        .set('client_secret', encodeURIComponent(secret));
    }
    return params;
  }

  private getAccessTokenParams(code: string, redirectUrl: string) {
    let redirectUri = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('client_id', encodeURIComponent(this.keycloakInstance.clientId))
      .set('redirect_uri', redirectUrl);
    const secret = this.keycloakInstance.clientSecret;
    if (secret) {
      redirectUri = redirectUri
        .set('client_secret', encodeURIComponent(secret));
    }
    return redirectUri;
  }

  private getTokenRequestHeaders() {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const clientSecret = this.keycloakInstance.clientSecret;
    const clientId = this.keycloakInstance.clientId;
    if (clientId && clientSecret) {
      headers.set('Authorization', 'Basic ' + btoa(clientId + ':' + clientSecret));
    }
    return headers;
  }

  private async refresh(): Promise<AuthToken> {
    try {
      let tokens: AuthToken = await this.storage.getToken();
      if (tokens) {
        if (!this.isValidToken(tokens)) {
          const uri = this.getTokenUrl();
          const headers = this.getTokenRequestHeaders();
          const body = this.getRefreshParams(tokens.refresh_token);
          tokens = await this.createPostRequest(uri, body, {headers});
        }
      }
      this.handleNewToken(tokens);
      return tokens;
    } catch (e) {
      await this.logout();
      return null;
    }
  }

  private getTokenUrl() {
    return `${this.keycloakInstance.authServerUrl}/realms/${this.keycloakInstance.realm}/protocol/openid-connect/token`;
  }

  private isValidToken(authToken: AuthToken) {
    if (!authToken) {
      return false;
    }
    return !jwtHelperService.isTokenExpired(authToken.access_token, 10);
  }

  private async initKeycloakInstance() {
    const keycloakConfig = await this.getKcJsonStructure();
    this.keycloakInstance = Keycloak(keycloakConfig);
  }

  private async initKeycloak() {
    await this.initKeycloakInstance();

    this.keycloakInstance
      .init({
        adapter: 'cordova-native',
        redirectUri: this.appPrefix + '/'
      });
  }

  private async beginLoginAndGetCode(path: string, login = true): Promise<KeycloakLoginResponse> {
    path = `${this.appPrefix}/${path}`;
    await this.storage.setToken(null);

    const options: KeycloakLoginOptions = {
      redirectUri: path
    };
    const url: string = login
      ? this.keycloakInstance.createLoginUrl(options)
      : this.keycloakInstance.createRegisterUrl(options);

    if (await this.browserTab.isAvailable()) {
      this.browserTab.openUrl(url);
    } else {
      this.inAppBrowser.create(url, '_system');
    }

    return new Promise<KeycloakLoginResponse>((resolve, reject) => {
      const sub = this.deepLinkService
        .params()
        .subscribe(code => {
          resolve({code, redirectUri: path});
          sub.unsubscribe();
        }, error => {
          reject(error);
          sub.unsubscribe();
        });
    });
  }

  private async continueLoginWithCode({code, redirectUri: redirectUrl}: KeycloakLoginResponse): Promise<AuthToken> {
    this.browserTab.close()
      .catch((err = {}) => {
        const context = {message: 'Error while closing the browser'};
        console.log(context.message, err);
        Object.assign(err, {context});
        throw err;
      });
    const uri = this.getTokenUrl();
    const body = this.getAccessTokenParams(code, redirectUrl);
    const headers = this.getTokenRequestHeaders();
    return this.createPostRequest(uri, body, {headers})
      .then(async authToken => {
        this.handleNewToken(authToken);
        return authToken;
      });
  }

}

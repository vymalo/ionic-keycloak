import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {IonicModule} from '@ionic/angular';
import {IonicStorageModule} from '@ionic/storage';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {IonicKeycloakAuthModule} from '../../dist/cmotion/ionic-keycloak-auth';


@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    }),
    IonicKeycloakAuthModule.forRoot({
      jwtModuleOptions: {
        getToken: () => JSON.parse(localStorage.getItem('token')),
        setToken: (value) => localStorage.setItem('token', value ? JSON.stringify(value) : null)
      },
      deepLinksConfig: {
        deepLinkingScheme: 'myapp'
      },
      keycloakConfig: {
        jsonConfig: async () => environment.keycloakConfig
      }
    })
  ],
  declarations: [AppComponent],
  providers: [InAppBrowser, SplashScreen, StatusBar],
  bootstrap: [AppComponent]
})
export class AppModule {
}

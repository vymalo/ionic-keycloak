# Ionic Keycloak Auth

[![npm version](https://badge.fury.io/js/%40cmotion%2Fionic-keycloak-auth.svg)](https://badge.fury.io/js/%40cmotion%2Fionic-keycloak-auth)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcoding-motion%2Fionic-keycloak.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fcoding-motion%2Fionic-keycloak?ref=badge_shield)

> This module is designed for `Ionic 4` 
> with `angular 7+` on `Android` and `IOS` 
> platforms only, and with `keycloak 6+`

## To know

This library provides 

* an `HttpInterceptor` which automatically attaches a [JSON Web Token](https://jwt.io) 
to HttpClient requests.
* an `Authentication Service` which permit 
authentication through [browser-tab](https://ionicframework.com/docs/native/browser-tab) 
(or [in-app-browser](https://ionicframework.com/docs/native/in-app-browser) when the first isn't 
usable).

This library does rely on the 
[Jwt Library](https://www.npmjs.com/package/@auth0/angular-jwt) 
of [Auth0](https://auth0.com) for handling tokens. 

## Installation

```bash
# installation with npm 
npm i @cmotion/ionic-keycloak-auth
  
# installation with yarn 
yarn add @cmotion/ionic-keycloak-auth
```

## Usage

Using this plugin requires two se-up parts, first using 
ionic plugins and then a small part about cordova, 
as [stated in the official documentation](https://www.keycloak.org/docs/latest/securing_apps/index.html#hybrid-apps-with-cordova).

### Ionic Setup

These plugins are required to be setup when using this plugin:
* [Browser-tab](https://ionicframework.com/docs/native/browser-tab) 
and the [In app browser](https://ionicframework.com/docs/native/in-app-browser)
* [Deep Links](https://ionicframework.com/docs/native/deeplinks) for openning the app
after the login process in the browser page

```bash
# The scheme "myapp" here would be used to open back the app, so don't forget it. 
# Some may also use the host "myapp.com" to do it, depending on the configuration
# of the Keycloak
ionic cordova plugin add ionic-plugin-deeplinks --variable URL_SCHEME=myapp --variable DEEPLINK_SCHEME=https --variable DEEPLINK_HOST=myapp.com --variable ANDROID_PATH_PREFIX=/
npm install @ionic-native/deeplinks

# Install the browsertab
ionic cordova plugin add cordova-plugin-browsertab
npm install @ionic-native/browser-tab

# Install the inAppBrowser
ionic cordova plugin add cordova-plugin-inappbrowser
npm install @ionic-native/in-app-browser

# Install the keycloak adapter
npm install keycloak-js@your-version

```

And then import it in the `AppModule`:

```typescript
import {NgModule} from '@angular/core';
import {environment} from '../environments/environment';
import {IonicKeycloakAuthModule} from '@cmotion/ionic-keycloak-auth';
...

@NgModule({
    imports: [
    ...
    IonicKeycloakAuthModule.forRoot({
        jwtModuleOptions: {
            // Not optional:
            // As absolute necessity, 
            // there should be getters and 
            // setters for the token.
            // These can be async.
            getToken: () => JSON.parse(localStorage.getItem('token')),
            setToken: (value) => localStorage.setItem('token', value ? JSON.stringify(value) : null),
            
            // These configuration are the same 
            // as of Jwt Library.
            // It is to whitelist any domains that you 
            // want to make requests to.
            whitelistedDomains: ["example.com"],
            
            // Here the inverse for blacklisted Routes
            blacklistedRoutes: ["example.com/examplebadroute/"]
        },
        deepLinksConfig: {
            // Not optional: 
            // Here is the reference of the scheme, 
            // which was used for the deeplinks before.
            deepLinkingScheme: 'myapp'
        },
        keycloakConfig: {
            // Not optional:
            // You need to define where the configuration 
            // for the keycloak is to be found. This 
            // can also be async.
            jsonConfig: () => environment.keycloakConfig
        }
    })
    ],
    ...
})
export class AppModule {
}
```

Yet you could set up cordova.


### Cordova Setup

This is quit simple here. You just need to add some lines to 
your `config.xml`, as the documentationo says. 

1. First, add

    ```xml
    <widget>
        <preference name="AndroidLaunchMode" value="singleTask" />
    </widget>
    ```
    
    to make the app open only one single 
    instance oof every browsertab openend, so 
    that it wouldn't create one foor each login.

2. And then add this so it recognize 
the keycloak url `keycloak-address.com` 
directly when it's on `https` on `IOS`.

    ```xml
    <universal-links>
       <host name="keycloak-address.com" scheme="https">
           <path url="/auth" />
       </host>
    </universal-links>
    ```

    This will be all for cordova. Again, you should read the 
[official documentation](https://www.keycloak.org/docs/latest/securing_apps/index.html#hybrid-apps-with-cordova) 
about integrating cordova with keycloak too to
understand all choices better


### Usage

Now just use the `login`-Method of the 
`KeycloakAuthService` to initiate a login 
process with keycloak, which will resolve with
a `AuthToken` composed with Token-Response as 
Keycloak does reply.

```typescript
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {KeycloakAuthService} from '@cmotion/ionic-keycloak-auth';
...

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {

    constructor(
        public router: Router,
        public keycloakAuthService: KeycloakAuthService,
    ) {
    }
    
    ...
    async keycloakLogin(isLogin: boolean) {
    await this.keycloakAuthService.login(isLogin);
    const sub = this.keycloakAuthService.user()
        .subscribe(async user => {
            if (user) {
                // There is a user in the app
                await this.router.navigateByUrl('/app/tabs/schedule');
            } else {
                // There's no user in the app
            }
            sub.unsubscribe();
        });
    }
    ...

}

```

When `isLogin` is true, the login process 
leads to the login page of Keycloak, while false
leads to the registration page. Yet in your template:

```html
<ion-button (click)="keycloakLogin(true)" 
            color="primary" expand="block" 
            shape="round" size="large">
    Login here
</ion-button>

<ion-button (click)="keycloakLogin(false)" 
            fill="clear"
            color="primary" expand="block" 
            shape="round" size="large">
    Sign up
</ion-button>
```


## Configuration Options

There are at time tree groups of options which are:

- keycloak config,
- deepLinks config, and
- jwt config

### Keycloak Config

This is at time constituted from a single field, 
`jsonConfig` which ist from type `FetchKeycloakJSON`,
which is basically `() => KeycloakJsonStructure | Promise<KeycloakJsonStructure>`.

The `KeycloakJsonStructure` here is just the json structure from the `keycloak.json`
which is being exported from keycloak. 

You can then configure it in two ways, a direct one, or using a provider:

1. Using the direct way, by 
just doing as in the example up there:

    ```typescript
    @NgModule({
        imports: [
            ...
            IonicKeycloakAuthModule.forRoot({
                keycloakConfig: {
                    // Not optional:
                    // You need to define where the configuration 
                    // for the keycloak is to be found. This 
                    // can also be async.
                    jsonConfig: () => environment.keycloakConfig
                }
            })
        ],
        ...
    })
    export class AppModule {
    }
    ```

2. Using a provider, as simple as using 
the `KEYCLOAK_OPTIONS` token in the `kcOptionsProvider`:

    ```typescript
    import { KEYCLOAK_OPTIONS, IonicKeycloakAuthModule } from '@cmotion/ionic-keycloak-auth';
    import { KeycloakService } from './keycloak.service';
    
    export function jwtOptionsFactory(kcService: KeycloakService) {
        return {
            tokenGetter: async () => {
                const config = await kcService.getAsyncKeycloakConfig();
                return config;
            }
        }
    }
    
    @NgModule({
        imports: [
            ...
            IonicKeycloakAuthModule.forRoot({
                kcOptionsProvider: {
                    provide: KEYCLOAK_OPTIONS,
                    useFactory: kcOptionsFactory,
                    deps: [KeycloakService]
                }
            })
        ],
        ...
    })
    export class AppModule {
    }
    ```

PS: 
- You can't use the two of them at the 
same time, because one will override the other
- At time, the function will be called only 
one time, to make the app faster, as making 
the fetch request any time may impact performances. 
For future version, it will be cached

### DeepLink Config

This library subscribe to deeplinks 
at a certain point and need your app scheme
to open the app once the browser process is 
finished.

So this configuration cannot be changed at 
runtime, so just do as the example provided before:

 ```typescript
@NgModule({
    imports: [
        ...
        IonicKeycloakAuthModule.forRoot({
            deepLinksConfig: {
                deepLinkingScheme: 'myapp'
            },
        })
    ],
    ...
})
export class AppModule {
}
```

Not here, that the field `deepLinkingScheme` isn't optional then.

### Jwt Config

This options can also be made using an 
injector as the keycloak does, or doing it straight.

1. Using the straight way is as giving directly the config in the `jwtModuleOptions`:
    ```typescript
    @NgModule({
        imports: [
            ...
            IonicKeycloakAuthModule.forRoot({
                jwtModuleOptions: {
                    // Not optional:
                    // As absolute necessity, 
                    // there should be getters and 
                    // setters for the token.
                    // These can be async.
                    getToken: () => JSON.parse(localStorage.getItem('token')),
                    setToken: (value) => localStorage.setItem('token', value ? JSON.stringify(value) : null),
                    
                    // These configuration are the same 
                    // as of Jwt Library.
                    // It is to whitelist any domains that you 
                    // want to make requests to.
                    whitelistedDomains: ["example.com"],
                    
                    // Here the inverse for blacklisted Routes
                    blacklistedRoutes: ["example.com/examplebadroute/"]
                },
            })
        ],
        ...
    })
    export class AppModule {
    }
    ```
   or you could just
   
2. Use the `JWT_GET_AND_SETTER`-injector 
and inject it as a provider in the `jwtConfigProvider`-field:

    ```typescript
    import { JWT_GET_AND_SETTER, IonicKeycloakAuthModule, AuthToken } from '@cmotion/ionic-keycloak-auth';
    import { StorageService, JwtService } from './api.service';
    
    export function jwtConfigFactory(storage: StorageService, jwt: JwtService) {
        const config: JwtConfig | any = jwt.getConfig();
        return {
            ...config,
            getToken: async () => {
                const token: AuthToken = await storage.getAsyncToken();
                return token;
            },
            setToken: async (value: AuthToken) => {
                await storage.setAsyncToken(value);
            }
        }
    }
    
    @NgModule({
        imports: [
            ...
            IonicKeycloakAuthModule.forRoot({
                jwtConfigProvider: {
                    provide: JWT_GET_AND_SETTER,
                    useFactory: jwtConfigFactory,
                    deps: [StorageService, JwtService]
                }
            })
        ],
        ...
    })
    export class AppModule {
    }
    ```
   
    And that's all folks!
    
PS:
- As the keycloak config resolvers, 
these can't be use at the same time
- For more information about each 
setting here, please just refer to the
[Jwt's module page](https://www.npmjs.com/package/@auth0/angular-jwt#configuration-options),
as they're used as they are. Just the `tokenGetter`-function is missing here.


## Keycloak side Configuration

Here, not too much to say. Just that your client
shouldn't be `bearer-only`.

## Author

This library is created and maintained by [Coding Motion](https://codingmotion.com)

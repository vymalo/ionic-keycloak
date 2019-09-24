// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  keycloakConfig: {
    realm: 'djaler',
    'auth-server-url': 'https://auth.djaler.com/auth',
    'ssl-required': 'external',
    resource: 'mobile-app',
    'verify-token-audience': true,
    credentials: {
      secret: '7fb3861a-0863-46f2-bb03-81158f55e3d5'
    },
    'use-resource-role-mappings': true,
    'confidential-port': 0
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

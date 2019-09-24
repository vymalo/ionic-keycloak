export const environment = {
  production: true,
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

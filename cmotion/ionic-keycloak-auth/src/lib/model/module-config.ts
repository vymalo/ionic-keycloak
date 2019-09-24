/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

import {Provider} from '@angular/core';
import {KcConfig} from './kc-config';
import {DeepLinkConfig} from './deep-link-config';
import {JwtConfig} from './jwt-config';

export class ModuleConfig {
  kcOptionsProvider?: Provider;
  jwtConfigProvider?: Provider;

  keycloakConfig?: KcConfig;
  deepLinksConfig: DeepLinkConfig;
  jwtModuleOptions?: JwtConfig;
}

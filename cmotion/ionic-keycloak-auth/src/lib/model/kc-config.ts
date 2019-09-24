/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

import {KeycloakJsonStructure} from './keycloak-json-structure';

export declare type FetchKeycloakJSON = () => KeycloakJsonStructure | Promise<KeycloakJsonStructure>;

export class KcConfig {
  jsonConfig?: FetchKeycloakJSON;
}

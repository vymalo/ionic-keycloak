export interface TokenDecoded {
    jti: string;
    exp: number;
    nbf: number;
    iat: number;
    iss: string;
    aud: string;
    sub: string;
    typ: string;
    azp: string;
    nonce: string;
    auth_time: number;
    session_state: string;
    acr: string;
    'allowed-origins': string[];
    realm_access: RealmAccess;
    resource_access: ResourceAccess;
    scope: string;
    email_verified: boolean;
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email: string;
}

export interface RealmAccess {
    roles: string[];
}

export interface ResourceAccess {
    account: RealmAccess;
}

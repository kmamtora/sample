export class imageload {
    repotag: string;
    os: string;
    registry: registry;
}

export class registry {
    url: string;
    content_trust_enabled: boolean;
    authentication_enabled: boolean;
}
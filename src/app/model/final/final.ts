import { catalog } from './catalog';
import { service } from './services';
import { role } from './role';

export class Final {
    catalog: catalog;
    services: service[];
    roles: role[];
    configkeys: {};
    clusterconfig: any[];
    image: {};
    appconfig: {};
    document: {};
    logo: {};
}
import bootstrap from '@wix/wix-bootstrap-ng/typed';
import configFunc from './src/config';
import expressApp from './src/server';

/* tslint:disable-next-line:no-floating-promises */
bootstrap().config(configFunc).express(expressApp).start();

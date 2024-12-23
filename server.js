
import express  from 'express'
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { ServerConfig } from './server/config.js';
import { restRouter } from './server/rest.js';

const server = express();

server.use(logger('dev'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());

const currentDir = path.dirname(fileURLToPath(import.meta.url))

server.use(express.static( path.join(currentDir, 'frontend') ));
server.use('/rest', restRouter);

export { server }

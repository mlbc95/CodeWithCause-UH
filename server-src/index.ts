import * as http from 'http';
import {get} from 'config';

import App from './app';
import {winstonLogger} from './middleware/common/winstonLogger';

const port = normalizePort(process.env.PORT || get('express.port'));

winstonLogger.info(`Listening on port: ${port}`);

const server = http.createServer(App.app);
server.listen(port);

server.on('error', onServerError);
server.on('listening', onServerListening);

function normalizePort(param: number | string): number | string | boolean {
    const portNumber: number = typeof param === 'string' ? parseInt(param, 10) : param;
    if (isNaN(portNumber)) return param;
    else if (portNumber >= 0) return portNumber;
    else return false;
}

function onServerError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onServerListening() {
    const addr = server.address();
    const host = process.env.NODE_ENV === 'production'
        ? 'https://codewithcause.herokuapp.com/'
        : `http://localhost:${addr.port}/`;
    winstonLogger.info(
        `-------------
       Express Server started on: ${host}
       
       Swagger API Documentation on: ${host}api/docs
        `
    );
}

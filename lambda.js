import { Readable, Writable } from 'stream';
import { Socket } from 'net';
import { app } from './app/index.js';

const logger = console;

export const handler = async event => {
  logger.info('EVENT', JSON.stringify(event, null, 2));
  return new Promise(resolve => {
    // --- Request (IncomingMessage 風) ---
    const req = new Readable({ read() {} });
    req.url = event.rawPath + (event.rawQueryString ? `?${event.rawQueryString}` : '');
    req.method = event.requestContext?.http?.method || 'GET';
    req.headers = event.headers || {};
    req.socket = new Socket();

    if (event.body) {
      const body = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : Buffer.from(event.body);
      req.push(body);
    }
    req.push(null);

    // --- Response (ServerResponse 風) ---
    const responseChunks = [];
    const res = new Writable();

    res.writeHead = (statusCode, headers) => {
      res.statusCode = statusCode;
      res.headers = headers;
    };
    res.write = chunk => {
      responseChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    };
    res.end = chunk => {
      if (chunk) res.write(chunk);
      const body = Buffer.concat(responseChunks).toString();
      resolve({
        statusCode: res.statusCode || 200,
        headers: res.headers || {},
        body,
      });
    };

    // --- 実際のアプリ呼び出し ---
    app(req, res);
  });
};

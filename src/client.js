/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import io from 'socket.io-client';
import EventEmitter from './event-emitter';

class Logger {
  constructor(options) {
    this.debugMode = options.debug || false;
  }

  debug(message, payload) {
    if (this.debugMode) {
      if (payload) console.debug(message, payload);
      else console.debug(message);
    }
  }

  error(message, payload) {
    if (payload) console.error(message, payload);
    else console.error(message);
  }
}

export default class LokiSession extends EventEmitter {
  constructor(options) {
    super();
    this.version = '1.0.9';
    this.options = options;
    this.logger = new Logger({ debug: options.debug || false });
    this.session = {};
    this.initialize();
  }

  get apiVersion() {
    return this.options.apiVersion || 'v1';
  }

  get endpoint() {
    const url = this.options.endpoint || 'https://loki.casamagalhaes.services';
    return url;
  }

  get socketPrefix() {
    return this.options.socketPrefix || '/socket';
  }

  get socketPath() {
    return this.options.socketPath || `${this.socketPrefix}/${this.apiVersion}`;
  }

  get socketSecure() {
    const { secure } = this.options;
    return typeof secure === 'boolean' ? secure : true;
  }

  initialize() {
    this.logger.debug(`[loki] initialize | version: ${this.version}`);
    this.setupSocketIO();
  }

  get deviceInfo() {
    return {
      userAgent: navigator.userAgent || 'Undefined',
    };
  }

  setupSocketIO() {
    this.logger.debug('[loki] setup socket');

    const config = {
      path: this.socketPath,
      secure: this.socketSecure,
      autoConnect: false,
    };

    this.logger.debug(`[loki] configss: ${JSON.stringify(config)}`);

    this.socket = io(this.endpoint, config);
    this.socket.on('connection_established', () => {
      this.logger.debug('[loki] socket connection established');

      this.emit('connected');

      const { sessionToken, deviceInfo } = this;
      const payload = { sessionToken, deviceInfo };

      this.logger.debug('[loki] socket trying to authenticate');
      this.socket.emit('authentication', payload);
    });

    this.socket.on('authenticated', () => {
      this.logger.debug('[loki] socket authenticated');
      this.emit('authenticated');
    });

    this.socket.on('unauthorized', (reason) => {
      this.logger.debug('[loki] socket unauthorized', reason);
      this.emit('unauthorized', reason);
      this.socket.disconnect();
    });

    this.socket.on('disconnect', (reason) => {
      this.logger.debug('[loki] socket disconnect', reason);
      this.emit('disconnect', reason);
    });

    this.socket.on('error', (err) => {
      this.logger.debug('[loki] socket error', err);
      this.emit('error', err);
    });
  }

  authenticate(sessionToken) {
    this.sessionToken = sessionToken;
    this.logger.debug('[loki] socket open connection');
    this.socket.open();
    return this;
  }

  destroy() {
    this.logger.debug('[loki] socket destroy session');
    this.sessionToken = null;

    if (this.socket.connected) {
      this.logger.debug('[loki] socket destroy connection');
      this.socket.disconnect();
    } else {
      this.logger.debug('[loki] socket already disconnected');
    }

    return this;
  }
}

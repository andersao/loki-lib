/* eslint-disable func-names */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-rest-params */
let indexOf;

if (typeof Array.prototype.indexOf === 'function') {
  indexOf = function (haystack, needle) {
    return haystack.indexOf(needle);
  };
} else {
  indexOf = function (haystack, needle) {
    let i = 0;
    const { length } = haystack;
    let idx = -1;
    let found = false;

    while (i < length && !found) {
      if (haystack[i] === needle) {
        idx = i;
        found = true;
      }

      i++;
    }

    return idx;
  };
}

export default class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }

    this.events[event].push(listener);
  }

  removeListener(event, listener) {
    let idx;

    if (typeof this.events[event] === 'object') {
      idx = indexOf(this.events[event], listener);

      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }

  emit(event) {
    let i;
    let listeners;
    let length;
    const args = [].slice.call(arguments, 1);

    if (typeof this.events[event] === 'object') {
      listeners = this.events[event].slice();
      length = listeners.length;

      for (i = 0; i < length; i++) {
        listeners[i].apply(this, args);
      }
    }
  }

  once(event, listener) {
    this.on(event, function g() {
      this.removeListener(event, g);
      listener.apply(this, arguments);
    });
  }
}

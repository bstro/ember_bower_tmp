;(function() {
/*!
 * @overview  Ember - JavaScript Application Framework
 * @copyright Copyright 2011-2016 Tilde Inc. and contributors
 *            Portions Copyright 2006-2011 Strobe Inc.
 *            Portions Copyright 2008-2011 Apple Inc. All rights reserved.
 * @license   Licensed under MIT license
 *            See https://raw.github.com/emberjs/ember.js/master/LICENSE
 * @version   2.10.4
 */

var enifed, requireModule, Ember;
var mainContext = this;

(function() {
  var isNode = typeof window === 'undefined' &&
    typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  if (!isNode) {
    Ember = this.Ember = this.Ember || {};
  }

  if (typeof Ember === 'undefined') { Ember = {}; }

  if (typeof Ember.__loader === 'undefined') {
    var registry = {};
    var seen = {};

    enifed = function(name, deps, callback) {
      var value = { };

      if (!callback) {
        value.deps = [];
        value.callback = deps;
      } else {
        value.deps = deps;
        value.callback = callback;
      }

      registry[name] = value;
    };

    requireModule = function(name) {
      return internalRequire(name, null);
    };

    // setup `require` module
    requireModule['default'] = requireModule;

    requireModule.has = function registryHas(moduleName) {
      return !!registry[moduleName] || !!registry[moduleName + '/index'];
    };

    function missingModule(name, referrerName) {
      if (referrerName) {
        throw new Error('Could not find module ' + name + ' required by: ' + referrerName);
      } else {
        throw new Error('Could not find module ' + name);
      }
    }

    function internalRequire(_name, referrerName) {
      var name = _name;
      var mod = registry[name];

      if (!mod) {
        name = name + '/index';
        mod = registry[name];
      }

      var exports = seen[name];

      if (exports !== undefined) {
        return exports;
      }

      exports = seen[name] = {};

      if (!mod) {
        missingModule(_name, referrerName);
      }

      var deps = mod.deps;
      var callback = mod.callback;
      var reified = new Array(deps.length);

      for (var i = 0; i < deps.length; i++) {
        if (deps[i] === 'exports') {
          reified[i] = exports;
        } else if (deps[i] === 'require') {
          reified[i] = requireModule;
        } else {
          reified[i] = internalRequire(deps[i], name);
        }
      }

      callback.apply(this, reified);

      return exports;
    }

    requireModule._eak_seen = registry;

    Ember.__loader = {
      define: enifed,
      require: requireModule,
      registry: registry
    };
  } else {
    enifed = Ember.__loader.define;
    requireModule = Ember.__loader.require;
  }
})();

var babelHelpers;

function classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : defaults(subClass, superClass);
}

function taggedTemplateLiteralLoose(strings, raw) {
  strings.raw = raw;
  return strings;
}

function defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function createClass(Constructor, protoProps, staticProps) {
  if (protoProps) defineProperties(Constructor.prototype, protoProps);
  if (staticProps) defineProperties(Constructor, staticProps);
  return Constructor;
}

function interopExportWildcard(obj, defaults) {
  var newObj = defaults({}, obj);
  delete newObj['default'];
  return newObj;
}

function defaults(obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);
    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }
  return obj;
}

babelHelpers = {
  classCallCheck: classCallCheck,
  inherits: inherits,
  taggedTemplateLiteralLoose: taggedTemplateLiteralLoose,
  slice: Array.prototype.slice,
  createClass: createClass,
  interopExportWildcard: interopExportWildcard,
  defaults: defaults
};

enifed('ember-debug/deprecate', ['exports', 'ember-metal', 'ember-console', 'ember-environment', 'ember-debug/handlers'], function (exports, _emberMetal, _emberConsole, _emberEnvironment, _emberDebugHandlers) {
  /*global __fail__*/

  'use strict';

  exports.registerHandler = registerHandler;
  exports.default = deprecate;

  function registerHandler(handler) {
    _emberDebugHandlers.registerHandler('deprecate', handler);
  }

  function formatMessage(_message, options) {
    var message = _message;

    if (options && options.id) {
      message = message + (' [deprecation id: ' + options.id + ']');
    }

    if (options && options.url) {
      message += ' See ' + options.url + ' for more details.';
    }

    return message;
  }

  registerHandler(function logDeprecationToConsole(message, options) {
    var updatedMessage = formatMessage(message, options);

    _emberConsole.default.warn('DEPRECATION: ' + updatedMessage);
  });

  var captureErrorForStack = undefined;

  if (new Error().stack) {
    captureErrorForStack = function () {
      return new Error();
    };
  } else {
    captureErrorForStack = function () {
      try {
        __fail__.fail();
      } catch (e) {
        return e;
      }
    };
  }

  registerHandler(function logDeprecationStackTrace(message, options, next) {
    if (_emberEnvironment.ENV.LOG_STACKTRACE_ON_DEPRECATION) {
      var stackStr = '';
      var error = captureErrorForStack();
      var stack = undefined;

      if (error.stack) {
        if (error['arguments']) {
          // Chrome
          stack = error.stack.replace(/^\s+at\s+/gm, '').replace(/^([^\(]+?)([\n$])/gm, '{anonymous}($1)$2').replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}($1)').split('\n');
          stack.shift();
        } else {
          // Firefox
          stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
        }

        stackStr = '\n    ' + stack.slice(2).join('\n    ');
      }

      var updatedMessage = formatMessage(message, options);

      _emberConsole.default.warn('DEPRECATION: ' + updatedMessage + stackStr);
    } else {
      next.apply(undefined, arguments);
    }
  });

  registerHandler(function raiseOnDeprecation(message, options, next) {
    if (_emberEnvironment.ENV.RAISE_ON_DEPRECATION) {
      var updatedMessage = formatMessage(message);

      throw new _emberMetal.Error(updatedMessage);
    } else {
      next.apply(undefined, arguments);
    }
  });

  var missingOptionsDeprecation = 'When calling `Ember.deprecate` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include `id` and `until` properties.';
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation = 'When calling `Ember.deprecate` you must provide `id` in options.';
  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  var missingOptionsUntilDeprecation = 'When calling `Ember.deprecate` you must provide `until` in options.';

  exports.missingOptionsUntilDeprecation = missingOptionsUntilDeprecation;
  /**
  @module ember
  @submodule ember-debug
  */

  /**
    Display a deprecation warning with the provided message and a stack trace
    (Chrome and Firefox only).
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method deprecate
    @param {String} message A description of the deprecation.
    @param {Boolean} test A boolean. If falsy, the deprecation will be displayed.
    @param {Object} options
    @param {String} options.id A unique id for this deprecation. The id can be
      used by Ember debugging tools to change the behavior (raise, log or silence)
      for that specific deprecation. The id should be namespaced by dots, e.g.
      "view.helper.select".
    @param {string} options.until The version of Ember when this deprecation
      warning will be removed.
    @param {String} [options.url] An optional url to the transition guide on the
      emberjs.com website.
    @for Ember
    @public
    @since 1.0.0
  */

  function deprecate(message, test, options) {
    if (!options || !options.id && !options.until) {
      deprecate(missingOptionsDeprecation, false, {
        id: 'ember-debug.deprecate-options-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.id) {
      deprecate(missingOptionsIdDeprecation, false, {
        id: 'ember-debug.deprecate-id-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.until) {
      deprecate(missingOptionsUntilDeprecation, options && options.until, {
        id: 'ember-debug.deprecate-until-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    _emberDebugHandlers.invoke.apply(undefined, ['deprecate'].concat(babelHelpers.slice.call(arguments)));
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLWRlYnVnL2RlcHJlY2F0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBdUh3QixTQUFTOztBQTlHMUIsV0FBUyxlQUFlLENBQUMsT0FBTyxFQUFFO0FBQ3ZDLHdCQUhPLGVBQWUsQ0FHQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDOUM7O0FBRUQsV0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRTtBQUN4QyxRQUFJLE9BQU8sR0FBRyxRQUFRLENBQUM7O0FBRXZCLFFBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDekIsYUFBTyxHQUFHLE9BQU8sMkJBQXdCLE9BQU8sQ0FBQyxFQUFFLE9BQUcsQ0FBQztLQUN4RDs7QUFFRCxRQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQzFCLGFBQU8sSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQztLQUN6RDs7QUFFRCxXQUFPLE9BQU8sQ0FBQztHQUNoQjs7QUFFRCxpQkFBZSxDQUFDLFNBQVMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUNqRSxRQUFJLGNBQWMsR0FBRyxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUVyRCwwQkFBTyxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQyxDQUFDO0dBQy9DLENBQUMsQ0FBQzs7QUFFSCxNQUFJLG9CQUFvQixZQUFBLENBQUM7O0FBRXpCLE1BQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUU7QUFDckIsd0JBQW9CLEdBQUcsWUFBVztBQUNoQyxhQUFPLElBQUksS0FBSyxFQUFFLENBQUM7S0FDcEIsQ0FBQztHQUNILE1BQU07QUFDTCx3QkFBb0IsR0FBRyxZQUFXO0FBQ2hDLFVBQUk7QUFBRSxnQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDO09BQUUsQ0FBQyxPQUFNLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxDQUFDO09BQUU7S0FDaEQsQ0FBQztHQUNIOztBQUVELGlCQUFlLENBQUMsU0FBUyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtBQUN4RSxRQUFJLGtCQXpDRyxHQUFHLENBeUNGLDZCQUE2QixFQUFFO0FBQ3JDLFVBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNsQixVQUFJLEtBQUssR0FBRyxvQkFBb0IsRUFBRSxDQUFDO0FBQ25DLFVBQUksS0FBSyxZQUFBLENBQUM7O0FBRVYsVUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO0FBQ2YsWUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7O0FBRXRCLGVBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQzVDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUNuRCxPQUFPLENBQUMsc0NBQXNDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakYsZUFBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2YsTUFBTTs7QUFFTCxlQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQ2hELE9BQU8sQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hEOztBQUVELGdCQUFRLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3JEOztBQUVELFVBQUksY0FBYyxHQUFHLGFBQWEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRXJELDRCQUFPLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0tBQzFELE1BQU07QUFDTCxVQUFJLGtCQUFJLFNBQVMsQ0FBQyxDQUFDO0tBQ3BCO0dBQ0YsQ0FBQyxDQUFDOztBQUVILGlCQUFlLENBQUMsU0FBUyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtBQUNsRSxRQUFJLGtCQXZFRyxHQUFHLENBdUVGLG9CQUFvQixFQUFFO0FBQzVCLFVBQUksY0FBYyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFNUMsWUFBTSxnQkE3RUQsS0FBSyxDQTZFVyxjQUFjLENBQUMsQ0FBQztLQUN0QyxNQUFNO0FBQ0wsVUFBSSxrQkFBSSxTQUFTLENBQUMsQ0FBQztLQUNwQjtHQUNGLENBQUMsQ0FBQzs7QUFFSSxNQUFJLHlCQUF5QixHQUFHLHFDQUFxQyxHQUMxRSwwREFBMEQsR0FDMUQsdURBQXVELENBQUM7O0FBQ25ELE1BQUksMkJBQTJCLEdBQUcsa0VBQWtFLENBQUM7O0FBQ3JHLE1BQUksOEJBQThCLEdBQUcscUVBQXFFLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOEJuRyxXQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUN4RCxRQUFJLENBQUMsT0FBTyxJQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEFBQUMsRUFBRTtBQUMvQyxlQUFTLENBQ1AseUJBQXlCLEVBQ3pCLEtBQUssRUFDTDtBQUNFLFVBQUUsRUFBRSx1Q0FBdUM7QUFDM0MsYUFBSyxFQUFFLE9BQU87QUFDZCxXQUFHLEVBQUUsd0VBQXdFO09BQzlFLENBQ0YsQ0FBQztLQUNIOztBQUVELFFBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUMxQixlQUFTLENBQ1AsMkJBQTJCLEVBQzNCLEtBQUssRUFDTDtBQUNFLFVBQUUsRUFBRSxrQ0FBa0M7QUFDdEMsYUFBSyxFQUFFLE9BQU87QUFDZCxXQUFHLEVBQUUsd0VBQXdFO09BQzlFLENBQ0YsQ0FBQztLQUNIOztBQUVELFFBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtBQUM3QixlQUFTLENBQ1AsOEJBQThCLEVBQzlCLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUN4QjtBQUNFLFVBQUUsRUFBRSxxQ0FBcUM7QUFDekMsYUFBSyxFQUFFLE9BQU87QUFDZCxXQUFHLEVBQUUsd0VBQXdFO09BQzlFLENBQ0YsQ0FBQztLQUNIOztBQUVELHdCQXJKa0QsTUFBTSxtQkFxSmpELFdBQVcsaUNBQUssU0FBUyxHQUFDLENBQUM7R0FDbkMiLCJmaWxlIjoiZW1iZXItZGVidWcvZGVwcmVjYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypnbG9iYWwgX19mYWlsX18qL1xuXG5pbXBvcnQgeyBFcnJvciBhcyBFbWJlckVycm9yIH0gZnJvbSAnZW1iZXItbWV0YWwnO1xuaW1wb3J0IExvZ2dlciBmcm9tICdlbWJlci1jb25zb2xlJztcblxuaW1wb3J0IHsgRU5WIH0gZnJvbSAnZW1iZXItZW52aXJvbm1lbnQnO1xuXG5pbXBvcnQgeyByZWdpc3RlckhhbmRsZXIgYXMgZ2VuZXJpY1JlZ2lzdGVySGFuZGxlciwgaW52b2tlIH0gZnJvbSAnLi9oYW5kbGVycyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckhhbmRsZXIoaGFuZGxlcikge1xuICBnZW5lcmljUmVnaXN0ZXJIYW5kbGVyKCdkZXByZWNhdGUnLCBoYW5kbGVyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShfbWVzc2FnZSwgb3B0aW9ucykge1xuICBsZXQgbWVzc2FnZSA9IF9tZXNzYWdlO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuaWQpIHtcbiAgICBtZXNzYWdlID0gbWVzc2FnZSArIGAgW2RlcHJlY2F0aW9uIGlkOiAke29wdGlvbnMuaWR9XWA7XG4gIH1cblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnVybCkge1xuICAgIG1lc3NhZ2UgKz0gJyBTZWUgJyArIG9wdGlvbnMudXJsICsgJyBmb3IgbW9yZSBkZXRhaWxzLic7XG4gIH1cblxuICByZXR1cm4gbWVzc2FnZTtcbn1cblxucmVnaXN0ZXJIYW5kbGVyKGZ1bmN0aW9uIGxvZ0RlcHJlY2F0aW9uVG9Db25zb2xlKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgbGV0IHVwZGF0ZWRNZXNzYWdlID0gZm9ybWF0TWVzc2FnZShtZXNzYWdlLCBvcHRpb25zKTtcblxuICBMb2dnZXIud2FybignREVQUkVDQVRJT046ICcgKyB1cGRhdGVkTWVzc2FnZSk7XG59KTtcblxubGV0IGNhcHR1cmVFcnJvckZvclN0YWNrO1xuXG5pZiAobmV3IEVycm9yKCkuc3RhY2spIHtcbiAgY2FwdHVyZUVycm9yRm9yU3RhY2sgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKCk7XG4gIH07XG59IGVsc2Uge1xuICBjYXB0dXJlRXJyb3JGb3JTdGFjayA9IGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7IF9fZmFpbF9fLmZhaWwoKTsgfSBjYXRjaChlKSB7IHJldHVybiBlOyB9XG4gIH07XG59XG5cbnJlZ2lzdGVySGFuZGxlcihmdW5jdGlvbiBsb2dEZXByZWNhdGlvblN0YWNrVHJhY2UobWVzc2FnZSwgb3B0aW9ucywgbmV4dCkge1xuICBpZiAoRU5WLkxPR19TVEFDS1RSQUNFX09OX0RFUFJFQ0FUSU9OKSB7XG4gICAgbGV0IHN0YWNrU3RyID0gJyc7XG4gICAgbGV0IGVycm9yID0gY2FwdHVyZUVycm9yRm9yU3RhY2soKTtcbiAgICBsZXQgc3RhY2s7XG5cbiAgICBpZiAoZXJyb3Iuc3RhY2spIHtcbiAgICAgIGlmIChlcnJvclsnYXJndW1lbnRzJ10pIHtcbiAgICAgICAgLy8gQ2hyb21lXG4gICAgICAgIHN0YWNrID0gZXJyb3Iuc3RhY2sucmVwbGFjZSgvXlxccythdFxccysvZ20sICcnKS5cbiAgICAgICAgICByZXBsYWNlKC9eKFteXFwoXSs/KShbXFxuJF0pL2dtLCAne2Fub255bW91c30oJDEpJDInKS5cbiAgICAgICAgICByZXBsYWNlKC9eT2JqZWN0Ljxhbm9ueW1vdXM+XFxzKlxcKChbXlxcKV0rKVxcKS9nbSwgJ3thbm9ueW1vdXN9KCQxKScpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgc3RhY2suc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgc3RhY2sgPSBlcnJvci5zdGFjay5yZXBsYWNlKC8oPzpcXG5AOjApP1xccyskL20sICcnKS5cbiAgICAgICAgICByZXBsYWNlKC9eXFwoL2dtLCAne2Fub255bW91c30oJykuc3BsaXQoJ1xcbicpO1xuICAgICAgfVxuXG4gICAgICBzdGFja1N0ciA9ICdcXG4gICAgJyArIHN0YWNrLnNsaWNlKDIpLmpvaW4oJ1xcbiAgICAnKTtcbiAgICB9XG5cbiAgICBsZXQgdXBkYXRlZE1lc3NhZ2UgPSBmb3JtYXRNZXNzYWdlKG1lc3NhZ2UsIG9wdGlvbnMpO1xuXG4gICAgTG9nZ2VyLndhcm4oJ0RFUFJFQ0FUSU9OOiAnICsgdXBkYXRlZE1lc3NhZ2UgKyBzdGFja1N0cik7XG4gIH0gZWxzZSB7XG4gICAgbmV4dCguLi5hcmd1bWVudHMpO1xuICB9XG59KTtcblxucmVnaXN0ZXJIYW5kbGVyKGZ1bmN0aW9uIHJhaXNlT25EZXByZWNhdGlvbihtZXNzYWdlLCBvcHRpb25zLCBuZXh0KSB7XG4gIGlmIChFTlYuUkFJU0VfT05fREVQUkVDQVRJT04pIHtcbiAgICBsZXQgdXBkYXRlZE1lc3NhZ2UgPSBmb3JtYXRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgdGhyb3cgbmV3IEVtYmVyRXJyb3IodXBkYXRlZE1lc3NhZ2UpO1xuICB9IGVsc2Uge1xuICAgIG5leHQoLi4uYXJndW1lbnRzKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBsZXQgbWlzc2luZ09wdGlvbnNEZXByZWNhdGlvbiA9ICdXaGVuIGNhbGxpbmcgYEVtYmVyLmRlcHJlY2F0ZWAgeW91ICcgK1xuICAnbXVzdCBwcm92aWRlIGFuIGBvcHRpb25zYCBoYXNoIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXIuICAnICtcbiAgJ2BvcHRpb25zYCBzaG91bGQgaW5jbHVkZSBgaWRgIGFuZCBgdW50aWxgIHByb3BlcnRpZXMuJztcbmV4cG9ydCBsZXQgbWlzc2luZ09wdGlvbnNJZERlcHJlY2F0aW9uID0gJ1doZW4gY2FsbGluZyBgRW1iZXIuZGVwcmVjYXRlYCB5b3UgbXVzdCBwcm92aWRlIGBpZGAgaW4gb3B0aW9ucy4nO1xuZXhwb3J0IGxldCBtaXNzaW5nT3B0aW9uc1VudGlsRGVwcmVjYXRpb24gPSAnV2hlbiBjYWxsaW5nIGBFbWJlci5kZXByZWNhdGVgIHlvdSBtdXN0IHByb3ZpZGUgYHVudGlsYCBpbiBvcHRpb25zLic7XG5cbi8qKlxuQG1vZHVsZSBlbWJlclxuQHN1Ym1vZHVsZSBlbWJlci1kZWJ1Z1xuKi9cblxuLyoqXG4gIERpc3BsYXkgYSBkZXByZWNhdGlvbiB3YXJuaW5nIHdpdGggdGhlIHByb3ZpZGVkIG1lc3NhZ2UgYW5kIGEgc3RhY2sgdHJhY2VcbiAgKENocm9tZSBhbmQgRmlyZWZveCBvbmx5KS5cblxuICAqIEluIGEgcHJvZHVjdGlvbiBidWlsZCwgdGhpcyBtZXRob2QgaXMgZGVmaW5lZCBhcyBhbiBlbXB0eSBmdW5jdGlvbiAoTk9QKS5cbiAgVXNlcyBvZiB0aGlzIG1ldGhvZCBpbiBFbWJlciBpdHNlbGYgYXJlIHN0cmlwcGVkIGZyb20gdGhlIGVtYmVyLnByb2QuanMgYnVpbGQuXG5cbiAgQG1ldGhvZCBkZXByZWNhdGVcbiAgQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgQSBkZXNjcmlwdGlvbiBvZiB0aGUgZGVwcmVjYXRpb24uXG4gIEBwYXJhbSB7Qm9vbGVhbn0gdGVzdCBBIGJvb2xlYW4uIElmIGZhbHN5LCB0aGUgZGVwcmVjYXRpb24gd2lsbCBiZSBkaXNwbGF5ZWQuXG4gIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmlkIEEgdW5pcXVlIGlkIGZvciB0aGlzIGRlcHJlY2F0aW9uLiBUaGUgaWQgY2FuIGJlXG4gICAgdXNlZCBieSBFbWJlciBkZWJ1Z2dpbmcgdG9vbHMgdG8gY2hhbmdlIHRoZSBiZWhhdmlvciAocmFpc2UsIGxvZyBvciBzaWxlbmNlKVxuICAgIGZvciB0aGF0IHNwZWNpZmljIGRlcHJlY2F0aW9uLiBUaGUgaWQgc2hvdWxkIGJlIG5hbWVzcGFjZWQgYnkgZG90cywgZS5nLlxuICAgIFwidmlldy5oZWxwZXIuc2VsZWN0XCIuXG4gIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnVudGlsIFRoZSB2ZXJzaW9uIG9mIEVtYmVyIHdoZW4gdGhpcyBkZXByZWNhdGlvblxuICAgIHdhcm5pbmcgd2lsbCBiZSByZW1vdmVkLlxuICBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMudXJsXSBBbiBvcHRpb25hbCB1cmwgdG8gdGhlIHRyYW5zaXRpb24gZ3VpZGUgb24gdGhlXG4gICAgZW1iZXJqcy5jb20gd2Vic2l0ZS5cbiAgQGZvciBFbWJlclxuICBAcHVibGljXG4gIEBzaW5jZSAxLjAuMFxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlcHJlY2F0ZShtZXNzYWdlLCB0ZXN0LCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCAoIW9wdGlvbnMuaWQgJiYgIW9wdGlvbnMudW50aWwpKSB7XG4gICAgZGVwcmVjYXRlKFxuICAgICAgbWlzc2luZ09wdGlvbnNEZXByZWNhdGlvbixcbiAgICAgIGZhbHNlLFxuICAgICAge1xuICAgICAgICBpZDogJ2VtYmVyLWRlYnVnLmRlcHJlY2F0ZS1vcHRpb25zLW1pc3NpbmcnLFxuICAgICAgICB1bnRpbDogJzMuMC4wJyxcbiAgICAgICAgdXJsOiAnaHR0cDovL2VtYmVyanMuY29tL2RlcHJlY2F0aW9ucy92Mi54LyN0b2NfZW1iZXItZGVidWctZnVuY3Rpb24tb3B0aW9ucydcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMgJiYgIW9wdGlvbnMuaWQpIHtcbiAgICBkZXByZWNhdGUoXG4gICAgICBtaXNzaW5nT3B0aW9uc0lkRGVwcmVjYXRpb24sXG4gICAgICBmYWxzZSxcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdlbWJlci1kZWJ1Zy5kZXByZWNhdGUtaWQtbWlzc2luZycsXG4gICAgICAgIHVudGlsOiAnMy4wLjAnLFxuICAgICAgICB1cmw6ICdodHRwOi8vZW1iZXJqcy5jb20vZGVwcmVjYXRpb25zL3YyLngvI3RvY19lbWJlci1kZWJ1Zy1mdW5jdGlvbi1vcHRpb25zJ1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBpZiAob3B0aW9ucyAmJiAhb3B0aW9ucy51bnRpbCkge1xuICAgIGRlcHJlY2F0ZShcbiAgICAgIG1pc3NpbmdPcHRpb25zVW50aWxEZXByZWNhdGlvbixcbiAgICAgIG9wdGlvbnMgJiYgb3B0aW9ucy51bnRpbCxcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdlbWJlci1kZWJ1Zy5kZXByZWNhdGUtdW50aWwtbWlzc2luZycsXG4gICAgICAgIHVudGlsOiAnMy4wLjAnLFxuICAgICAgICB1cmw6ICdodHRwOi8vZW1iZXJqcy5jb20vZGVwcmVjYXRpb25zL3YyLngvI3RvY19lbWJlci1kZWJ1Zy1mdW5jdGlvbi1vcHRpb25zJ1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBpbnZva2UoJ2RlcHJlY2F0ZScsIC4uLmFyZ3VtZW50cyk7XG59XG4iXX0=
enifed("ember-debug/handlers", ["exports"], function (exports) {
  "use strict";

  exports.registerHandler = registerHandler;
  exports.invoke = invoke;
  var HANDLERS = {};

  exports.HANDLERS = HANDLERS;

  function registerHandler(type, callback) {
    var nextHandler = HANDLERS[type] || function () {};

    HANDLERS[type] = function (message, options) {
      callback(message, options, nextHandler);
    };
  }

  function invoke(type, message, test, options) {
    if (test) {
      return;
    }

    var handlerForType = HANDLERS[type];

    if (!handlerForType) {
      return;
    }

    if (handlerForType) {
      handlerForType(message, options);
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLWRlYnVnL2hhbmRsZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU8sTUFBSSxRQUFRLEdBQUcsRUFBRyxDQUFDOzs7O0FBRW5CLFdBQVMsZUFBZSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDOUMsUUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVcsRUFBRyxDQUFDOztBQUVuRCxZQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQzFDLGNBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3pDLENBQUM7R0FDSDs7QUFFTSxXQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDbkQsUUFBSSxJQUFJLEVBQUU7QUFBRSxhQUFPO0tBQUU7O0FBRXJCLFFBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFcEMsUUFBSSxDQUFDLGNBQWMsRUFBRTtBQUFFLGFBQU87S0FBRTs7QUFFaEMsUUFBSSxjQUFjLEVBQUU7QUFDbEIsb0JBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDbEM7R0FDRiIsImZpbGUiOiJlbWJlci1kZWJ1Zy9oYW5kbGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBsZXQgSEFORExFUlMgPSB7IH07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckhhbmRsZXIodHlwZSwgY2FsbGJhY2spIHtcbiAgbGV0IG5leHRIYW5kbGVyID0gSEFORExFUlNbdHlwZV0gfHwgZnVuY3Rpb24oKSB7IH07XG5cbiAgSEFORExFUlNbdHlwZV0gPSBmdW5jdGlvbihtZXNzYWdlLCBvcHRpb25zKSB7XG4gICAgY2FsbGJhY2sobWVzc2FnZSwgb3B0aW9ucywgbmV4dEhhbmRsZXIpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlKHR5cGUsIG1lc3NhZ2UsIHRlc3QsIG9wdGlvbnMpIHtcbiAgaWYgKHRlc3QpIHsgcmV0dXJuOyB9XG5cbiAgbGV0IGhhbmRsZXJGb3JUeXBlID0gSEFORExFUlNbdHlwZV07XG5cbiAgaWYgKCFoYW5kbGVyRm9yVHlwZSkgeyByZXR1cm47IH1cblxuICBpZiAoaGFuZGxlckZvclR5cGUpIHtcbiAgICBoYW5kbGVyRm9yVHlwZShtZXNzYWdlLCBvcHRpb25zKTtcbiAgfVxufVxuIl19
enifed('ember-debug/index', ['exports', 'ember-metal', 'ember-environment', 'ember-console', 'ember-debug/deprecate', 'ember-debug/warn'], function (exports, _emberMetal, _emberEnvironment, _emberConsole, _emberDebugDeprecate, _emberDebugWarn) {
  'use strict';

  exports._warnIfUsingStrippedFeatureFlags = _warnIfUsingStrippedFeatureFlags;

  /**
  @module ember
  @submodule ember-debug
  */

  /**
  @class Ember
  @public
  */

  /**
    Define an assertion that will throw an exception if the condition is not met.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    // Test for truthiness
    Ember.assert('Must pass a valid object', obj);
  
    // Fail unconditionally
    Ember.assert('This code path should never be run');
    ```
  
    @method assert
    @param {String} desc A description of the assertion. This will become
      the text of the Error thrown if the assertion fails.
    @param {Boolean} test Must be truthy for the assertion to pass. If
      falsy, an exception will be thrown.
    @public
    @since 1.0.0
  */
  _emberMetal.setDebugFunction('assert', function assert(desc, test) {
    if (!test) {
      throw new _emberMetal.Error('Assertion Failed: ' + desc);
    }
  });

  /**
    Display a debug notice.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    Ember.debug('I\'m a debug notice!');
    ```
  
    @method debug
    @param {String} message A debug message to display.
    @public
  */
  _emberMetal.setDebugFunction('debug', function debug(message) {
    _emberConsole.default.debug('DEBUG: ' + message);
  });

  /**
    Display an info notice.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method info
    @private
  */
  _emberMetal.setDebugFunction('info', function info() {
    _emberConsole.default.info.apply(undefined, arguments);
  });

  /**
    Alias an old, deprecated method with its new counterpart.
  
    Display a deprecation warning with the provided message and a stack trace
    (Chrome and Firefox only) when the assigned method is called.
  
    * In a production build, this method is defined as an empty function (NOP).
  
    ```javascript
    Ember.oldMethod = Ember.deprecateFunc('Please use the new, updated method', Ember.newMethod);
    ```
  
    @method deprecateFunc
    @param {String} message A description of the deprecation.
    @param {Object} [options] The options object for Ember.deprecate.
    @param {Function} func The new function called to replace its deprecated counterpart.
    @return {Function} A new function that wraps the original function with a deprecation warning
    @private
  */
  _emberMetal.setDebugFunction('deprecateFunc', function deprecateFunc() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 3) {
      var _ret = (function () {
        var message = args[0];
        var options = args[1];
        var func = args[2];

        return {
          v: function () {
            _emberMetal.deprecate(message, false, options);
            return func.apply(this, arguments);
          }
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    } else {
      var _ret2 = (function () {
        var message = args[0];
        var func = args[1];

        return {
          v: function () {
            _emberMetal.deprecate(message);
            return func.apply(this, arguments);
          }
        };
      })();

      if (typeof _ret2 === 'object') return _ret2.v;
    }
  });

  /**
    Run a function meant for debugging.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    Ember.runInDebug(() => {
      Ember.Component.reopen({
        didInsertElement() {
          console.log("I'm happy");
        }
      });
    });
    ```
  
    @method runInDebug
    @param {Function} func The function to be executed.
    @since 1.5.0
    @public
  */
  _emberMetal.setDebugFunction('runInDebug', function runInDebug(func) {
    func();
  });

  _emberMetal.setDebugFunction('debugSeal', function debugSeal(obj) {
    Object.seal(obj);
  });

  _emberMetal.setDebugFunction('debugFreeze', function debugFreeze(obj) {
    Object.freeze(obj);
  });

  _emberMetal.setDebugFunction('deprecate', _emberDebugDeprecate.default);

  _emberMetal.setDebugFunction('warn', _emberDebugWarn.default);

  /**
    Will call `Ember.warn()` if ENABLE_OPTIONAL_FEATURES or
    any specific FEATURES flag is truthy.
  
    This method is called automatically in debug canary builds.
  
    @private
    @method _warnIfUsingStrippedFeatureFlags
    @return {void}
  */

  function _warnIfUsingStrippedFeatureFlags(FEATURES, knownFeatures, featuresWereStripped) {
    if (featuresWereStripped) {
      _emberMetal.warn('Ember.ENV.ENABLE_OPTIONAL_FEATURES is only available in canary builds.', !_emberEnvironment.ENV.ENABLE_OPTIONAL_FEATURES, { id: 'ember-debug.feature-flag-with-features-stripped' });

      var keys = Object.keys(FEATURES || {});
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === 'isEnabled' || !(key in knownFeatures)) {
          continue;
        }

        _emberMetal.warn('FEATURE["' + key + '"] is set as enabled, but FEATURE flags are only available in canary builds.', !FEATURES[key], { id: 'ember-debug.feature-flag-with-features-stripped' });
      }
    }
  }

  if (!_emberMetal.isTesting()) {
    (function () {
      // Complain if they're using FEATURE flags in builds other than canary
      _emberMetal.FEATURES['features-stripped-test'] = true;
      var featuresWereStripped = true;

      if (false) {
        featuresWereStripped = false;
      }

      delete _emberMetal.FEATURES['features-stripped-test'];
      _warnIfUsingStrippedFeatureFlags(_emberEnvironment.ENV.FEATURES, _emberMetal.DEFAULT_FEATURES, featuresWereStripped);

      // Inform the developer about the Ember Inspector if not installed.
      var isFirefox = _emberEnvironment.environment.isFirefox;
      var isChrome = _emberEnvironment.environment.isChrome;

      if (typeof window !== 'undefined' && (isFirefox || isChrome) && window.addEventListener) {
        window.addEventListener('load', function () {
          if (document.documentElement && document.documentElement.dataset && !document.documentElement.dataset.emberExtension) {
            var downloadURL;

            if (isChrome) {
              downloadURL = 'https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi';
            } else if (isFirefox) {
              downloadURL = 'https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/';
            }

            _emberMetal.debug('For more advanced debugging, install the Ember Inspector from ' + downloadURL);
          }
        }, false);
      }
    })();
  }
  /**
    @public
    @class Ember.Debug
  */
  _emberMetal.default.Debug = {};

  /**
    Allows for runtime registration of handler functions that override the default deprecation behavior.
    Deprecations are invoked by calls to [Ember.deprecate](http://emberjs.com/api/classes/Ember.html#method_deprecate).
    The following example demonstrates its usage by registering a handler that throws an error if the
    message contains the word "should", otherwise defers to the default handler.
  
    ```javascript
    Ember.Debug.registerDeprecationHandler((message, options, next) => {
      if (message.indexOf('should') !== -1) {
        throw new Error(`Deprecation message with should: ${message}`);
      } else {
        // defer to whatever handler was registered before this one
        next(message, options);
      }
    });
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the deprecation call.</li>
      <li> <code>options</code> - An object passed in with the deprecation call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the deprecation in the form of <code>package-name.specific-deprecation</code>.</li>
          <li> <code>until</code> - The Ember version number the feature and deprecation will be removed in.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerDeprecationHandler
    @param handler {Function} A function to handle deprecation calls.
    @since 2.1.0
  */
  _emberMetal.default.Debug.registerDeprecationHandler = _emberDebugDeprecate.registerHandler;
  /**
    Allows for runtime registration of handler functions that override the default warning behavior.
    Warnings are invoked by calls made to [Ember.warn](http://emberjs.com/api/classes/Ember.html#method_warn).
    The following example demonstrates its usage by registering a handler that does nothing overriding Ember's
    default warning behavior.
  
    ```javascript
    // next is not called, so no warnings get the default behavior
    Ember.Debug.registerWarnHandler(() => {});
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the warn call. </li>
      <li> <code>options</code> - An object passed in with the warn call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the warning in the form of <code>package-name.specific-warning</code>.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerWarnHandler
    @param handler {Function} A function to handle warnings.
    @since 2.1.0
  */
  _emberMetal.default.Debug.registerWarnHandler = _emberDebugWarn.registerHandler;

  /*
    We are transitioning away from `ember.js` to `ember.debug.js` to make
    it much clearer that it is only for local development purposes.
  
    This flag value is changed by the tooling (by a simple string replacement)
    so that if `ember.js` (which must be output for backwards compat reasons) is
    used a nice helpful warning message will be printed out.
  */
  var runningNonEmberDebugJS = false;
  exports.runningNonEmberDebugJS = runningNonEmberDebugJS;
  if (runningNonEmberDebugJS) {
    _emberMetal.warn('Please use `ember.debug.js` instead of `ember.js` for development and debugging.');
  }
});
// reexports
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLWRlYnVnL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzREEsY0FqREUsZ0JBQWdCLENBaURELFFBQVEsRUFBRSxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3JELFFBQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxZQUFNLGdCQS9DUixLQUFLLENBK0NrQixvQkFBb0IsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNuRDtHQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQWdCSCxjQXJFRSxnQkFBZ0IsQ0FxRUQsT0FBTyxFQUFFLFNBQVMsS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUNoRCwwQkFBTyxLQUFLLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDO0dBQ25DLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7QUFXSCxjQWxGRSxnQkFBZ0IsQ0FrRkQsTUFBTSxFQUFFLFNBQVMsSUFBSSxHQUFHO0FBQ3ZDLDBCQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQ3pDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUJILGNBekdFLGdCQUFnQixDQXlHRCxlQUFlLEVBQUUsU0FBUyxhQUFhLEdBQVU7c0NBQU4sSUFBSTtBQUFKLFVBQUk7OztBQUM5RCxRQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOztZQUNoQixPQUFPLEdBQW1CLElBQUk7WUFBckIsT0FBTyxHQUFVLElBQUk7WUFBWixJQUFJLEdBQUksSUFBSTs7QUFDbkM7YUFBTyxZQUFXO0FBQ2hCLHdCQS9HSixTQUFTLENBK0dLLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkMsbUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7V0FDcEM7VUFBQzs7OztLQUNILE1BQU07O1lBQ0EsT0FBTyxHQUFVLElBQUk7WUFBWixJQUFJLEdBQUksSUFBSTs7QUFDMUI7YUFBTyxZQUFXO0FBQ2hCLHdCQXJISixTQUFTLENBcUhLLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLG1CQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1dBQ3BDO1VBQUM7Ozs7S0FDSDtHQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QkgsY0EvSUUsZ0JBQWdCLENBK0lELFlBQVksRUFBRSxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDdkQsUUFBSSxFQUFFLENBQUM7R0FDUixDQUFDLENBQUM7O0FBRUgsY0FuSkUsZ0JBQWdCLENBbUpELFdBQVcsRUFBRSxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUU7QUFDcEQsVUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNsQixDQUFDLENBQUM7O0FBRUgsY0F2SkUsZ0JBQWdCLENBdUpELGFBQWEsRUFBRSxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDeEQsVUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNwQixDQUFDLENBQUM7O0FBRUgsY0EzSkUsZ0JBQWdCLENBMkpELFdBQVcsK0JBQWEsQ0FBQzs7QUFFMUMsY0E3SkUsZ0JBQWdCLENBNkpELE1BQU0sMEJBQVEsQ0FBQzs7Ozs7Ozs7Ozs7OztBQVl6QixXQUFTLGdDQUFnQyxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsb0JBQW9CLEVBQUU7QUFDOUYsUUFBSSxvQkFBb0IsRUFBRTtBQUN4QixrQkE5S0YsSUFBSSxDQThLRyx3RUFBd0UsRUFBRSxDQUFDLGtCQXJLM0UsR0FBRyxDQXFLNEUsd0JBQXdCLEVBQUUsRUFBRSxFQUFFLEVBQUUsaURBQWlELEVBQUUsQ0FBQyxDQUFDOztBQUV6SyxVQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN2QyxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNwQyxZQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsWUFBSSxHQUFHLEtBQUssV0FBVyxJQUFJLEVBQUUsR0FBRyxJQUFJLGFBQWEsQ0FBQSxBQUFDLEVBQUU7QUFDbEQsbUJBQVM7U0FDVjs7QUFFRCxvQkF2TEosSUFBSSxDQXVMSyxXQUFXLEdBQUcsR0FBRyxHQUFHLDhFQUE4RSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLGlEQUFpRCxFQUFFLENBQUMsQ0FBQztPQUNyTDtLQUNGO0dBQ0Y7O0FBRUQsTUFBSSxDQUFDLFlBN0xILFNBQVMsRUE2TEssRUFBRTs7O0FBRWhCLGtCQXpMQSxRQUFRLENBeUxDLHdCQUF3QixDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzFDLFVBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDOztBQUVoQyxpQkFBZ0Q7QUFDOUMsNEJBQW9CLEdBQUcsS0FBSyxDQUFDO09BQzlCOztBQUVELGFBQU8sWUFoTVAsUUFBUSxDQWdNUSx3QkFBd0IsQ0FBQyxDQUFDO0FBQzFDLHNDQUFnQyxDQUFDLGtCQTdMMUIsR0FBRyxDQTZMMkIsUUFBUSxjQWhNN0MsZ0JBQWdCLEVBZ01pRCxvQkFBb0IsQ0FBQyxDQUFDOzs7QUFHdkYsVUFBSSxTQUFTLEdBQUcsa0JBaE1KLFdBQVcsQ0FnTUssU0FBUyxDQUFDO0FBQ3RDLFVBQUksUUFBUSxHQUFHLGtCQWpNSCxXQUFXLENBaU1JLFFBQVEsQ0FBQzs7QUFFcEMsVUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQSxBQUFDLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFO0FBQ3ZGLGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsWUFBTTtBQUNwQyxjQUFJLFFBQVEsQ0FBQyxlQUFlLElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUU7QUFDcEgsZ0JBQUksV0FBVyxDQUFDOztBQUVoQixnQkFBSSxRQUFRLEVBQUU7QUFDWix5QkFBVyxHQUFHLDRGQUE0RixDQUFDO2FBQzVHLE1BQU0sSUFBSSxTQUFTLEVBQUU7QUFDcEIseUJBQVcsR0FBRyxpRUFBaUUsQ0FBQzthQUNqRjs7QUFFRCx3QkFyTk4sS0FBSyxDQXFOTyxnRUFBZ0UsR0FBRyxXQUFXLENBQUMsQ0FBQztXQUN2RjtTQUNGLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDWDs7R0FDRjs7Ozs7QUFLRCxzQkFBTSxLQUFLLEdBQUcsRUFBRyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUNsQixzQkFBTSxLQUFLLENBQUMsMEJBQTBCLHdCQXhQcEMsZUFBZSxBQXdQa0QsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2QnBFLHNCQUFNLEtBQUssQ0FBQyxtQkFBbUIsbUJBbFI3QixlQUFlLEFBa1JvQyxDQUFDOzs7Ozs7Ozs7O0FBVS9DLE1BQUksc0JBQXNCLEdBQUcsS0FBSyxDQUFDOztBQUMxQyxNQUFJLHNCQUFzQixFQUFFO0FBQzFCLGdCQTlTQSxJQUFJLENBOFNDLGtGQUFrRixDQUFDLENBQUM7R0FDMUYiLCJmaWxlIjoiZW1iZXItZGVidWcvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRW1iZXIsIHsgLy8gcmVleHBvcnRzXG4gIGlzVGVzdGluZyxcbiAgd2FybixcbiAgZGVwcmVjYXRlLFxuICBkZWJ1ZyxcbiAgc2V0RGVidWdGdW5jdGlvbixcbiAgaXNGZWF0dXJlRW5hYmxlZCxcbiAgRkVBVFVSRVMsXG4gIERFRkFVTFRfRkVBVFVSRVMsXG4gIEVycm9yIGFzIEVtYmVyRXJyb3Jcbn0gZnJvbSAnZW1iZXItbWV0YWwnO1xuaW1wb3J0IHsgRU5WLCBlbnZpcm9ubWVudCB9IGZyb20gJ2VtYmVyLWVudmlyb25tZW50JztcbmltcG9ydCBMb2dnZXIgZnJvbSAnZW1iZXItY29uc29sZSc7XG5cbmltcG9ydCBfZGVwcmVjYXRlLCB7XG4gIHJlZ2lzdGVySGFuZGxlciBhcyByZWdpc3RlckRlcHJlY2F0aW9uSGFuZGxlclxufSBmcm9tICcuL2RlcHJlY2F0ZSc7XG5pbXBvcnQgX3dhcm4sIHtcbiAgcmVnaXN0ZXJIYW5kbGVyIGFzIHJlZ2lzdGVyV2FybkhhbmRsZXJcbn0gZnJvbSAnLi93YXJuJztcblxuLyoqXG5AbW9kdWxlIGVtYmVyXG5Ac3VibW9kdWxlIGVtYmVyLWRlYnVnXG4qL1xuXG4vKipcbkBjbGFzcyBFbWJlclxuQHB1YmxpY1xuKi9cblxuXG4vKipcbiAgRGVmaW5lIGFuIGFzc2VydGlvbiB0aGF0IHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHRoZSBjb25kaXRpb24gaXMgbm90IG1ldC5cblxuICAqIEluIGEgcHJvZHVjdGlvbiBidWlsZCwgdGhpcyBtZXRob2QgaXMgZGVmaW5lZCBhcyBhbiBlbXB0eSBmdW5jdGlvbiAoTk9QKS5cbiAgVXNlcyBvZiB0aGlzIG1ldGhvZCBpbiBFbWJlciBpdHNlbGYgYXJlIHN0cmlwcGVkIGZyb20gdGhlIGVtYmVyLnByb2QuanMgYnVpbGQuXG5cbiAgYGBgamF2YXNjcmlwdFxuICAvLyBUZXN0IGZvciB0cnV0aGluZXNzXG4gIEVtYmVyLmFzc2VydCgnTXVzdCBwYXNzIGEgdmFsaWQgb2JqZWN0Jywgb2JqKTtcblxuICAvLyBGYWlsIHVuY29uZGl0aW9uYWxseVxuICBFbWJlci5hc3NlcnQoJ1RoaXMgY29kZSBwYXRoIHNob3VsZCBuZXZlciBiZSBydW4nKTtcbiAgYGBgXG5cbiAgQG1ldGhvZCBhc3NlcnRcbiAgQHBhcmFtIHtTdHJpbmd9IGRlc2MgQSBkZXNjcmlwdGlvbiBvZiB0aGUgYXNzZXJ0aW9uLiBUaGlzIHdpbGwgYmVjb21lXG4gICAgdGhlIHRleHQgb2YgdGhlIEVycm9yIHRocm93biBpZiB0aGUgYXNzZXJ0aW9uIGZhaWxzLlxuICBAcGFyYW0ge0Jvb2xlYW59IHRlc3QgTXVzdCBiZSB0cnV0aHkgZm9yIHRoZSBhc3NlcnRpb24gdG8gcGFzcy4gSWZcbiAgICBmYWxzeSwgYW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duLlxuICBAcHVibGljXG4gIEBzaW5jZSAxLjAuMFxuKi9cbnNldERlYnVnRnVuY3Rpb24oJ2Fzc2VydCcsIGZ1bmN0aW9uIGFzc2VydChkZXNjLCB0ZXN0KSB7XG4gIGlmICghdGVzdCkge1xuICAgIHRocm93IG5ldyBFbWJlckVycm9yKCdBc3NlcnRpb24gRmFpbGVkOiAnICsgZGVzYyk7XG4gIH1cbn0pO1xuXG4vKipcbiAgRGlzcGxheSBhIGRlYnVnIG5vdGljZS5cblxuICAqIEluIGEgcHJvZHVjdGlvbiBidWlsZCwgdGhpcyBtZXRob2QgaXMgZGVmaW5lZCBhcyBhbiBlbXB0eSBmdW5jdGlvbiAoTk9QKS5cbiAgVXNlcyBvZiB0aGlzIG1ldGhvZCBpbiBFbWJlciBpdHNlbGYgYXJlIHN0cmlwcGVkIGZyb20gdGhlIGVtYmVyLnByb2QuanMgYnVpbGQuXG5cbiAgYGBgamF2YXNjcmlwdFxuICBFbWJlci5kZWJ1ZygnSVxcJ20gYSBkZWJ1ZyBub3RpY2UhJyk7XG4gIGBgYFxuXG4gIEBtZXRob2QgZGVidWdcbiAgQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgQSBkZWJ1ZyBtZXNzYWdlIHRvIGRpc3BsYXkuXG4gIEBwdWJsaWNcbiovXG5zZXREZWJ1Z0Z1bmN0aW9uKCdkZWJ1ZycsIGZ1bmN0aW9uIGRlYnVnKG1lc3NhZ2UpIHtcbiAgTG9nZ2VyLmRlYnVnKCdERUJVRzogJyArIG1lc3NhZ2UpO1xufSk7XG5cbi8qKlxuICBEaXNwbGF5IGFuIGluZm8gbm90aWNlLlxuXG4gICogSW4gYSBwcm9kdWN0aW9uIGJ1aWxkLCB0aGlzIG1ldGhvZCBpcyBkZWZpbmVkIGFzIGFuIGVtcHR5IGZ1bmN0aW9uIChOT1ApLlxuICBVc2VzIG9mIHRoaXMgbWV0aG9kIGluIEVtYmVyIGl0c2VsZiBhcmUgc3RyaXBwZWQgZnJvbSB0aGUgZW1iZXIucHJvZC5qcyBidWlsZC5cblxuICBAbWV0aG9kIGluZm9cbiAgQHByaXZhdGVcbiovXG5zZXREZWJ1Z0Z1bmN0aW9uKCdpbmZvJywgZnVuY3Rpb24gaW5mbygpIHtcbiAgTG9nZ2VyLmluZm8uYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xufSk7XG5cbi8qKlxuICBBbGlhcyBhbiBvbGQsIGRlcHJlY2F0ZWQgbWV0aG9kIHdpdGggaXRzIG5ldyBjb3VudGVycGFydC5cblxuICBEaXNwbGF5IGEgZGVwcmVjYXRpb24gd2FybmluZyB3aXRoIHRoZSBwcm92aWRlZCBtZXNzYWdlIGFuZCBhIHN0YWNrIHRyYWNlXG4gIChDaHJvbWUgYW5kIEZpcmVmb3ggb25seSkgd2hlbiB0aGUgYXNzaWduZWQgbWV0aG9kIGlzIGNhbGxlZC5cblxuICAqIEluIGEgcHJvZHVjdGlvbiBidWlsZCwgdGhpcyBtZXRob2QgaXMgZGVmaW5lZCBhcyBhbiBlbXB0eSBmdW5jdGlvbiAoTk9QKS5cblxuICBgYGBqYXZhc2NyaXB0XG4gIEVtYmVyLm9sZE1ldGhvZCA9IEVtYmVyLmRlcHJlY2F0ZUZ1bmMoJ1BsZWFzZSB1c2UgdGhlIG5ldywgdXBkYXRlZCBtZXRob2QnLCBFbWJlci5uZXdNZXRob2QpO1xuICBgYGBcblxuICBAbWV0aG9kIGRlcHJlY2F0ZUZ1bmNcbiAgQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgQSBkZXNjcmlwdGlvbiBvZiB0aGUgZGVwcmVjYXRpb24uXG4gIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0IGZvciBFbWJlci5kZXByZWNhdGUuXG4gIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIG5ldyBmdW5jdGlvbiBjYWxsZWQgdG8gcmVwbGFjZSBpdHMgZGVwcmVjYXRlZCBjb3VudGVycGFydC5cbiAgQHJldHVybiB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHRoYXQgd3JhcHMgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggYSBkZXByZWNhdGlvbiB3YXJuaW5nXG4gIEBwcml2YXRlXG4qL1xuc2V0RGVidWdGdW5jdGlvbignZGVwcmVjYXRlRnVuYycsIGZ1bmN0aW9uIGRlcHJlY2F0ZUZ1bmMoLi4uYXJncykge1xuICBpZiAoYXJncy5sZW5ndGggPT09IDMpIHtcbiAgICBsZXQgW21lc3NhZ2UsIG9wdGlvbnMsIGZ1bmNdID0gYXJncztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBkZXByZWNhdGUobWVzc2FnZSwgZmFsc2UsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGxldCBbbWVzc2FnZSwgZnVuY10gPSBhcmdzO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGRlcHJlY2F0ZShtZXNzYWdlKTtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxufSk7XG5cblxuLyoqXG4gIFJ1biBhIGZ1bmN0aW9uIG1lYW50IGZvciBkZWJ1Z2dpbmcuXG5cbiAgKiBJbiBhIHByb2R1Y3Rpb24gYnVpbGQsIHRoaXMgbWV0aG9kIGlzIGRlZmluZWQgYXMgYW4gZW1wdHkgZnVuY3Rpb24gKE5PUCkuXG4gIFVzZXMgb2YgdGhpcyBtZXRob2QgaW4gRW1iZXIgaXRzZWxmIGFyZSBzdHJpcHBlZCBmcm9tIHRoZSBlbWJlci5wcm9kLmpzIGJ1aWxkLlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgRW1iZXIucnVuSW5EZWJ1ZygoKSA9PiB7XG4gICAgRW1iZXIuQ29tcG9uZW50LnJlb3Blbih7XG4gICAgICBkaWRJbnNlcnRFbGVtZW50KCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkknbSBoYXBweVwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgcnVuSW5EZWJ1Z1xuICBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZC5cbiAgQHNpbmNlIDEuNS4wXG4gIEBwdWJsaWNcbiovXG5zZXREZWJ1Z0Z1bmN0aW9uKCdydW5JbkRlYnVnJywgZnVuY3Rpb24gcnVuSW5EZWJ1ZyhmdW5jKSB7XG4gIGZ1bmMoKTtcbn0pO1xuXG5zZXREZWJ1Z0Z1bmN0aW9uKCdkZWJ1Z1NlYWwnLCBmdW5jdGlvbiBkZWJ1Z1NlYWwob2JqKSB7XG4gIE9iamVjdC5zZWFsKG9iaik7XG59KTtcblxuc2V0RGVidWdGdW5jdGlvbignZGVidWdGcmVlemUnLCBmdW5jdGlvbiBkZWJ1Z0ZyZWV6ZShvYmopIHtcbiAgT2JqZWN0LmZyZWV6ZShvYmopO1xufSk7XG5cbnNldERlYnVnRnVuY3Rpb24oJ2RlcHJlY2F0ZScsIF9kZXByZWNhdGUpO1xuXG5zZXREZWJ1Z0Z1bmN0aW9uKCd3YXJuJywgX3dhcm4pO1xuXG4vKipcbiAgV2lsbCBjYWxsIGBFbWJlci53YXJuKClgIGlmIEVOQUJMRV9PUFRJT05BTF9GRUFUVVJFUyBvclxuICBhbnkgc3BlY2lmaWMgRkVBVFVSRVMgZmxhZyBpcyB0cnV0aHkuXG5cbiAgVGhpcyBtZXRob2QgaXMgY2FsbGVkIGF1dG9tYXRpY2FsbHkgaW4gZGVidWcgY2FuYXJ5IGJ1aWxkcy5cblxuICBAcHJpdmF0ZVxuICBAbWV0aG9kIF93YXJuSWZVc2luZ1N0cmlwcGVkRmVhdHVyZUZsYWdzXG4gIEByZXR1cm4ge3ZvaWR9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIF93YXJuSWZVc2luZ1N0cmlwcGVkRmVhdHVyZUZsYWdzKEZFQVRVUkVTLCBrbm93bkZlYXR1cmVzLCBmZWF0dXJlc1dlcmVTdHJpcHBlZCkge1xuICBpZiAoZmVhdHVyZXNXZXJlU3RyaXBwZWQpIHtcbiAgICB3YXJuKCdFbWJlci5FTlYuRU5BQkxFX09QVElPTkFMX0ZFQVRVUkVTIGlzIG9ubHkgYXZhaWxhYmxlIGluIGNhbmFyeSBidWlsZHMuJywgIUVOVi5FTkFCTEVfT1BUSU9OQUxfRkVBVFVSRVMsIHsgaWQ6ICdlbWJlci1kZWJ1Zy5mZWF0dXJlLWZsYWctd2l0aC1mZWF0dXJlcy1zdHJpcHBlZCcgfSk7XG5cbiAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKEZFQVRVUkVTIHx8IHt9KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKGtleSA9PT0gJ2lzRW5hYmxlZCcgfHwgIShrZXkgaW4ga25vd25GZWF0dXJlcykpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHdhcm4oJ0ZFQVRVUkVbXCInICsga2V5ICsgJ1wiXSBpcyBzZXQgYXMgZW5hYmxlZCwgYnV0IEZFQVRVUkUgZmxhZ3MgYXJlIG9ubHkgYXZhaWxhYmxlIGluIGNhbmFyeSBidWlsZHMuJywgIUZFQVRVUkVTW2tleV0sIHsgaWQ6ICdlbWJlci1kZWJ1Zy5mZWF0dXJlLWZsYWctd2l0aC1mZWF0dXJlcy1zdHJpcHBlZCcgfSk7XG4gICAgfVxuICB9XG59XG5cbmlmICghaXNUZXN0aW5nKCkpIHtcbiAgLy8gQ29tcGxhaW4gaWYgdGhleSdyZSB1c2luZyBGRUFUVVJFIGZsYWdzIGluIGJ1aWxkcyBvdGhlciB0aGFuIGNhbmFyeVxuICBGRUFUVVJFU1snZmVhdHVyZXMtc3RyaXBwZWQtdGVzdCddID0gdHJ1ZTtcbiAgbGV0IGZlYXR1cmVzV2VyZVN0cmlwcGVkID0gdHJ1ZTtcblxuICBpZiAoaXNGZWF0dXJlRW5hYmxlZCgnZmVhdHVyZXMtc3RyaXBwZWQtdGVzdCcpKSB7XG4gICAgZmVhdHVyZXNXZXJlU3RyaXBwZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGRlbGV0ZSBGRUFUVVJFU1snZmVhdHVyZXMtc3RyaXBwZWQtdGVzdCddO1xuICBfd2FybklmVXNpbmdTdHJpcHBlZEZlYXR1cmVGbGFncyhFTlYuRkVBVFVSRVMsIERFRkFVTFRfRkVBVFVSRVMsIGZlYXR1cmVzV2VyZVN0cmlwcGVkKTtcblxuICAvLyBJbmZvcm0gdGhlIGRldmVsb3BlciBhYm91dCB0aGUgRW1iZXIgSW5zcGVjdG9yIGlmIG5vdCBpbnN0YWxsZWQuXG4gIGxldCBpc0ZpcmVmb3ggPSBlbnZpcm9ubWVudC5pc0ZpcmVmb3g7XG4gIGxldCBpc0Nocm9tZSA9IGVudmlyb25tZW50LmlzQ2hyb21lO1xuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiAoaXNGaXJlZm94IHx8IGlzQ2hyb21lKSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZGF0YXNldCAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRhdGFzZXQuZW1iZXJFeHRlbnNpb24pIHtcbiAgICAgICAgdmFyIGRvd25sb2FkVVJMO1xuXG4gICAgICAgIGlmIChpc0Nocm9tZSkge1xuICAgICAgICAgIGRvd25sb2FkVVJMID0gJ2h0dHBzOi8vY2hyb21lLmdvb2dsZS5jb20vd2Vic3RvcmUvZGV0YWlsL2VtYmVyLWluc3BlY3Rvci9ibWRibG5jZWdrZW5rYWNpZWloZmhwamZwcG9jb25oaSc7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNGaXJlZm94KSB7XG4gICAgICAgICAgZG93bmxvYWRVUkwgPSAnaHR0cHM6Ly9hZGRvbnMubW96aWxsYS5vcmcvZW4tVVMvZmlyZWZveC9hZGRvbi9lbWJlci1pbnNwZWN0b3IvJztcbiAgICAgICAgfVxuXG4gICAgICAgIGRlYnVnKCdGb3IgbW9yZSBhZHZhbmNlZCBkZWJ1Z2dpbmcsIGluc3RhbGwgdGhlIEVtYmVyIEluc3BlY3RvciBmcm9tICcgKyBkb3dubG9hZFVSTCk7XG4gICAgICB9XG4gICAgfSwgZmFsc2UpO1xuICB9XG59XG4vKipcbiAgQHB1YmxpY1xuICBAY2xhc3MgRW1iZXIuRGVidWdcbiovXG5FbWJlci5EZWJ1ZyA9IHsgfTtcblxuLyoqXG4gIEFsbG93cyBmb3IgcnVudGltZSByZWdpc3RyYXRpb24gb2YgaGFuZGxlciBmdW5jdGlvbnMgdGhhdCBvdmVycmlkZSB0aGUgZGVmYXVsdCBkZXByZWNhdGlvbiBiZWhhdmlvci5cbiAgRGVwcmVjYXRpb25zIGFyZSBpbnZva2VkIGJ5IGNhbGxzIHRvIFtFbWJlci5kZXByZWNhdGVdKGh0dHA6Ly9lbWJlcmpzLmNvbS9hcGkvY2xhc3Nlcy9FbWJlci5odG1sI21ldGhvZF9kZXByZWNhdGUpLlxuICBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVtb25zdHJhdGVzIGl0cyB1c2FnZSBieSByZWdpc3RlcmluZyBhIGhhbmRsZXIgdGhhdCB0aHJvd3MgYW4gZXJyb3IgaWYgdGhlXG4gIG1lc3NhZ2UgY29udGFpbnMgdGhlIHdvcmQgXCJzaG91bGRcIiwgb3RoZXJ3aXNlIGRlZmVycyB0byB0aGUgZGVmYXVsdCBoYW5kbGVyLlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgRW1iZXIuRGVidWcucmVnaXN0ZXJEZXByZWNhdGlvbkhhbmRsZXIoKG1lc3NhZ2UsIG9wdGlvbnMsIG5leHQpID0+IHtcbiAgICBpZiAobWVzc2FnZS5pbmRleE9mKCdzaG91bGQnKSAhPT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGVwcmVjYXRpb24gbWVzc2FnZSB3aXRoIHNob3VsZDogJHttZXNzYWdlfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkZWZlciB0byB3aGF0ZXZlciBoYW5kbGVyIHdhcyByZWdpc3RlcmVkIGJlZm9yZSB0aGlzIG9uZVxuICAgICAgbmV4dChtZXNzYWdlLCBvcHRpb25zKTtcbiAgICB9XG4gIH0pO1xuICBgYGBcblxuICBUaGUgaGFuZGxlciBmdW5jdGlvbiB0YWtlcyB0aGUgZm9sbG93aW5nIGFyZ3VtZW50czpcblxuICA8dWw+XG4gICAgPGxpPiA8Y29kZT5tZXNzYWdlPC9jb2RlPiAtIFRoZSBtZXNzYWdlIHJlY2VpdmVkIGZyb20gdGhlIGRlcHJlY2F0aW9uIGNhbGwuPC9saT5cbiAgICA8bGk+IDxjb2RlPm9wdGlvbnM8L2NvZGU+IC0gQW4gb2JqZWN0IHBhc3NlZCBpbiB3aXRoIHRoZSBkZXByZWNhdGlvbiBjYWxsIGNvbnRhaW5pbmcgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiBpbmNsdWRpbmc6PC9saT5cbiAgICAgIDx1bD5cbiAgICAgICAgPGxpPiA8Y29kZT5pZDwvY29kZT4gLSBBbiBpZCBvZiB0aGUgZGVwcmVjYXRpb24gaW4gdGhlIGZvcm0gb2YgPGNvZGU+cGFja2FnZS1uYW1lLnNwZWNpZmljLWRlcHJlY2F0aW9uPC9jb2RlPi48L2xpPlxuICAgICAgICA8bGk+IDxjb2RlPnVudGlsPC9jb2RlPiAtIFRoZSBFbWJlciB2ZXJzaW9uIG51bWJlciB0aGUgZmVhdHVyZSBhbmQgZGVwcmVjYXRpb24gd2lsbCBiZSByZW1vdmVkIGluLjwvbGk+XG4gICAgICA8L3VsPlxuICAgIDxsaT4gPGNvZGU+bmV4dDwvY29kZT4gLSBBIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50byB0aGUgcHJldmlvdXNseSByZWdpc3RlcmVkIGhhbmRsZXIuPC9saT5cbiAgPC91bD5cblxuICBAcHVibGljXG4gIEBzdGF0aWNcbiAgQG1ldGhvZCByZWdpc3RlckRlcHJlY2F0aW9uSGFuZGxlclxuICBAcGFyYW0gaGFuZGxlciB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdG8gaGFuZGxlIGRlcHJlY2F0aW9uIGNhbGxzLlxuICBAc2luY2UgMi4xLjBcbiovXG5FbWJlci5EZWJ1Zy5yZWdpc3RlckRlcHJlY2F0aW9uSGFuZGxlciA9IHJlZ2lzdGVyRGVwcmVjYXRpb25IYW5kbGVyO1xuLyoqXG4gIEFsbG93cyBmb3IgcnVudGltZSByZWdpc3RyYXRpb24gb2YgaGFuZGxlciBmdW5jdGlvbnMgdGhhdCBvdmVycmlkZSB0aGUgZGVmYXVsdCB3YXJuaW5nIGJlaGF2aW9yLlxuICBXYXJuaW5ncyBhcmUgaW52b2tlZCBieSBjYWxscyBtYWRlIHRvIFtFbWJlci53YXJuXShodHRwOi8vZW1iZXJqcy5jb20vYXBpL2NsYXNzZXMvRW1iZXIuaHRtbCNtZXRob2Rfd2FybikuXG4gIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZW1vbnN0cmF0ZXMgaXRzIHVzYWdlIGJ5IHJlZ2lzdGVyaW5nIGEgaGFuZGxlciB0aGF0IGRvZXMgbm90aGluZyBvdmVycmlkaW5nIEVtYmVyJ3NcbiAgZGVmYXVsdCB3YXJuaW5nIGJlaGF2aW9yLlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgLy8gbmV4dCBpcyBub3QgY2FsbGVkLCBzbyBubyB3YXJuaW5ncyBnZXQgdGhlIGRlZmF1bHQgYmVoYXZpb3JcbiAgRW1iZXIuRGVidWcucmVnaXN0ZXJXYXJuSGFuZGxlcigoKSA9PiB7fSk7XG4gIGBgYFxuXG4gIFRoZSBoYW5kbGVyIGZ1bmN0aW9uIHRha2VzIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxuXG4gIDx1bD5cbiAgICA8bGk+IDxjb2RlPm1lc3NhZ2U8L2NvZGU+IC0gVGhlIG1lc3NhZ2UgcmVjZWl2ZWQgZnJvbSB0aGUgd2FybiBjYWxsLiA8L2xpPlxuICAgIDxsaT4gPGNvZGU+b3B0aW9uczwvY29kZT4gLSBBbiBvYmplY3QgcGFzc2VkIGluIHdpdGggdGhlIHdhcm4gY2FsbCBjb250YWluaW5nIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gaW5jbHVkaW5nOjwvbGk+XG4gICAgICA8dWw+XG4gICAgICAgIDxsaT4gPGNvZGU+aWQ8L2NvZGU+IC0gQW4gaWQgb2YgdGhlIHdhcm5pbmcgaW4gdGhlIGZvcm0gb2YgPGNvZGU+cGFja2FnZS1uYW1lLnNwZWNpZmljLXdhcm5pbmc8L2NvZGU+LjwvbGk+XG4gICAgICA8L3VsPlxuICAgIDxsaT4gPGNvZGU+bmV4dDwvY29kZT4gLSBBIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50byB0aGUgcHJldmlvdXNseSByZWdpc3RlcmVkIGhhbmRsZXIuPC9saT5cbiAgPC91bD5cblxuICBAcHVibGljXG4gIEBzdGF0aWNcbiAgQG1ldGhvZCByZWdpc3Rlcldhcm5IYW5kbGVyXG4gIEBwYXJhbSBoYW5kbGVyIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiB0byBoYW5kbGUgd2FybmluZ3MuXG4gIEBzaW5jZSAyLjEuMFxuKi9cbkVtYmVyLkRlYnVnLnJlZ2lzdGVyV2FybkhhbmRsZXIgPSByZWdpc3Rlcldhcm5IYW5kbGVyO1xuXG4vKlxuICBXZSBhcmUgdHJhbnNpdGlvbmluZyBhd2F5IGZyb20gYGVtYmVyLmpzYCB0byBgZW1iZXIuZGVidWcuanNgIHRvIG1ha2VcbiAgaXQgbXVjaCBjbGVhcmVyIHRoYXQgaXQgaXMgb25seSBmb3IgbG9jYWwgZGV2ZWxvcG1lbnQgcHVycG9zZXMuXG5cbiAgVGhpcyBmbGFnIHZhbHVlIGlzIGNoYW5nZWQgYnkgdGhlIHRvb2xpbmcgKGJ5IGEgc2ltcGxlIHN0cmluZyByZXBsYWNlbWVudClcbiAgc28gdGhhdCBpZiBgZW1iZXIuanNgICh3aGljaCBtdXN0IGJlIG91dHB1dCBmb3IgYmFja3dhcmRzIGNvbXBhdCByZWFzb25zKSBpc1xuICB1c2VkIGEgbmljZSBoZWxwZnVsIHdhcm5pbmcgbWVzc2FnZSB3aWxsIGJlIHByaW50ZWQgb3V0LlxuKi9cbmV4cG9ydCBsZXQgcnVubmluZ05vbkVtYmVyRGVidWdKUyA9IGZhbHNlO1xuaWYgKHJ1bm5pbmdOb25FbWJlckRlYnVnSlMpIHtcbiAgd2FybignUGxlYXNlIHVzZSBgZW1iZXIuZGVidWcuanNgIGluc3RlYWQgb2YgYGVtYmVyLmpzYCBmb3IgZGV2ZWxvcG1lbnQgYW5kIGRlYnVnZ2luZy4nKTtcbn1cbiJdfQ==
enifed('ember-debug/warn', ['exports', 'ember-console', 'ember-metal', 'ember-debug/handlers'], function (exports, _emberConsole, _emberMetal, _emberDebugHandlers) {
  'use strict';

  exports.registerHandler = registerHandler;
  exports.default = warn;

  function registerHandler(handler) {
    _emberDebugHandlers.registerHandler('warn', handler);
  }

  registerHandler(function logWarning(message, options) {
    _emberConsole.default.warn('WARNING: ' + message);
    if ('trace' in _emberConsole.default) {
      _emberConsole.default.trace();
    }
  });

  var missingOptionsDeprecation = 'When calling `Ember.warn` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include an `id` property.';
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation = 'When calling `Ember.warn` you must provide `id` in options.';

  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  /**
  @module ember
  @submodule ember-debug
  */

  /**
    Display a warning with the provided message.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method warn
    @param {String} message A warning to display.
    @param {Boolean} test An optional boolean. If falsy, the warning
      will be displayed.
    @param {Object} options An object that can be used to pass a unique
      `id` for this warning.  The `id` can be used by Ember debugging tools
      to change the behavior (raise, log, or silence) for that specific warning.
      The `id` should be namespaced by dots, e.g. "ember-debug.feature-flag-with-features-stripped"
    @for Ember
    @public
    @since 1.0.0
  */

  function warn(message, test, options) {
    if (!options) {
      _emberMetal.deprecate(missingOptionsDeprecation, false, {
        id: 'ember-debug.warn-options-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.id) {
      _emberMetal.deprecate(missingOptionsIdDeprecation, false, {
        id: 'ember-debug.warn-id-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    _emberDebugHandlers.invoke.apply(undefined, ['warn'].concat(babelHelpers.slice.call(arguments)));
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLWRlYnVnL3dhcm4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztvQkEyQ3dCLElBQUk7O0FBdkNyQixXQUFTLGVBQWUsQ0FBQyxPQUFPLEVBQUU7QUFDdkMsd0JBSE8sZUFBZSxDQUdDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztHQUN6Qzs7QUFFRCxpQkFBZSxDQUFDLFNBQVMsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDcEQsMEJBQU8sSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQztBQUNuQyxRQUFJLE9BQU8seUJBQVUsRUFBRTtBQUNyQiw0QkFBTyxLQUFLLEVBQUUsQ0FBQztLQUNoQjtHQUNGLENBQUMsQ0FBQzs7QUFFSSxNQUFJLHlCQUF5QixHQUFHLGdDQUFnQyxHQUNyRSwwREFBMEQsR0FDMUQsNENBQTRDLENBQUM7O0FBQ3hDLE1BQUksMkJBQTJCLEdBQUcsNkRBQTZELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCeEYsV0FBUyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDbkQsUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLGtCQTVDSyxTQUFTLENBNkNaLHlCQUF5QixFQUN6QixLQUFLLEVBQ0w7QUFDRSxVQUFFLEVBQUUsa0NBQWtDO0FBQ3RDLGFBQUssRUFBRSxPQUFPO0FBQ2QsV0FBRyxFQUFFLHdFQUF3RTtPQUM5RSxDQUNGLENBQUM7S0FDSDs7QUFFRCxRQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDMUIsa0JBeERLLFNBQVMsQ0F5RFosMkJBQTJCLEVBQzNCLEtBQUssRUFDTDtBQUNFLFVBQUUsRUFBRSw2QkFBNkI7QUFDakMsYUFBSyxFQUFFLE9BQU87QUFDZCxXQUFHLEVBQUUsd0VBQXdFO09BQzlFLENBQ0YsQ0FBQztLQUNIOztBQUVELHdCQWxFa0QsTUFBTSxtQkFrRWpELE1BQU0saUNBQUssU0FBUyxHQUFDLENBQUM7R0FDOUIiLCJmaWxlIjoiZW1iZXItZGVidWcvd2Fybi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2dnZXIgZnJvbSAnZW1iZXItY29uc29sZSc7XG5pbXBvcnQgeyBkZXByZWNhdGUgfSBmcm9tICdlbWJlci1tZXRhbCc7XG5pbXBvcnQgeyByZWdpc3RlckhhbmRsZXIgYXMgZ2VuZXJpY1JlZ2lzdGVySGFuZGxlciwgaW52b2tlIH0gZnJvbSAnLi9oYW5kbGVycyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckhhbmRsZXIoaGFuZGxlcikge1xuICBnZW5lcmljUmVnaXN0ZXJIYW5kbGVyKCd3YXJuJywgaGFuZGxlcik7XG59XG5cbnJlZ2lzdGVySGFuZGxlcihmdW5jdGlvbiBsb2dXYXJuaW5nKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgTG9nZ2VyLndhcm4oJ1dBUk5JTkc6ICcgKyBtZXNzYWdlKTtcbiAgaWYgKCd0cmFjZScgaW4gTG9nZ2VyKSB7XG4gICAgTG9nZ2VyLnRyYWNlKCk7XG4gIH1cbn0pO1xuXG5leHBvcnQgbGV0IG1pc3NpbmdPcHRpb25zRGVwcmVjYXRpb24gPSAnV2hlbiBjYWxsaW5nIGBFbWJlci53YXJuYCB5b3UgJyArXG4gICdtdXN0IHByb3ZpZGUgYW4gYG9wdGlvbnNgIGhhc2ggYXMgdGhlIHRoaXJkIHBhcmFtZXRlci4gICcgK1xuICAnYG9wdGlvbnNgIHNob3VsZCBpbmNsdWRlIGFuIGBpZGAgcHJvcGVydHkuJztcbmV4cG9ydCBsZXQgbWlzc2luZ09wdGlvbnNJZERlcHJlY2F0aW9uID0gJ1doZW4gY2FsbGluZyBgRW1iZXIud2FybmAgeW91IG11c3QgcHJvdmlkZSBgaWRgIGluIG9wdGlvbnMuJztcblxuLyoqXG5AbW9kdWxlIGVtYmVyXG5Ac3VibW9kdWxlIGVtYmVyLWRlYnVnXG4qL1xuXG4vKipcbiAgRGlzcGxheSBhIHdhcm5pbmcgd2l0aCB0aGUgcHJvdmlkZWQgbWVzc2FnZS5cblxuICAqIEluIGEgcHJvZHVjdGlvbiBidWlsZCwgdGhpcyBtZXRob2QgaXMgZGVmaW5lZCBhcyBhbiBlbXB0eSBmdW5jdGlvbiAoTk9QKS5cbiAgVXNlcyBvZiB0aGlzIG1ldGhvZCBpbiBFbWJlciBpdHNlbGYgYXJlIHN0cmlwcGVkIGZyb20gdGhlIGVtYmVyLnByb2QuanMgYnVpbGQuXG5cbiAgQG1ldGhvZCB3YXJuXG4gIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIEEgd2FybmluZyB0byBkaXNwbGF5LlxuICBAcGFyYW0ge0Jvb2xlYW59IHRlc3QgQW4gb3B0aW9uYWwgYm9vbGVhbi4gSWYgZmFsc3ksIHRoZSB3YXJuaW5nXG4gICAgd2lsbCBiZSBkaXNwbGF5ZWQuXG4gIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIEFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHBhc3MgYSB1bmlxdWVcbiAgICBgaWRgIGZvciB0aGlzIHdhcm5pbmcuICBUaGUgYGlkYCBjYW4gYmUgdXNlZCBieSBFbWJlciBkZWJ1Z2dpbmcgdG9vbHNcbiAgICB0byBjaGFuZ2UgdGhlIGJlaGF2aW9yIChyYWlzZSwgbG9nLCBvciBzaWxlbmNlKSBmb3IgdGhhdCBzcGVjaWZpYyB3YXJuaW5nLlxuICAgIFRoZSBgaWRgIHNob3VsZCBiZSBuYW1lc3BhY2VkIGJ5IGRvdHMsIGUuZy4gXCJlbWJlci1kZWJ1Zy5mZWF0dXJlLWZsYWctd2l0aC1mZWF0dXJlcy1zdHJpcHBlZFwiXG4gIEBmb3IgRW1iZXJcbiAgQHB1YmxpY1xuICBAc2luY2UgMS4wLjBcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB3YXJuKG1lc3NhZ2UsIHRlc3QsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgZGVwcmVjYXRlKFxuICAgICAgbWlzc2luZ09wdGlvbnNEZXByZWNhdGlvbixcbiAgICAgIGZhbHNlLFxuICAgICAge1xuICAgICAgICBpZDogJ2VtYmVyLWRlYnVnLndhcm4tb3B0aW9ucy1taXNzaW5nJyxcbiAgICAgICAgdW50aWw6ICczLjAuMCcsXG4gICAgICAgIHVybDogJ2h0dHA6Ly9lbWJlcmpzLmNvbS9kZXByZWNhdGlvbnMvdjIueC8jdG9jX2VtYmVyLWRlYnVnLWZ1bmN0aW9uLW9wdGlvbnMnXG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zICYmICFvcHRpb25zLmlkKSB7XG4gICAgZGVwcmVjYXRlKFxuICAgICAgbWlzc2luZ09wdGlvbnNJZERlcHJlY2F0aW9uLFxuICAgICAgZmFsc2UsXG4gICAgICB7XG4gICAgICAgIGlkOiAnZW1iZXItZGVidWcud2Fybi1pZC1taXNzaW5nJyxcbiAgICAgICAgdW50aWw6ICczLjAuMCcsXG4gICAgICAgIHVybDogJ2h0dHA6Ly9lbWJlcmpzLmNvbS9kZXByZWNhdGlvbnMvdjIueC8jdG9jX2VtYmVyLWRlYnVnLWZ1bmN0aW9uLW9wdGlvbnMnXG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGludm9rZSgnd2FybicsIC4uLmFyZ3VtZW50cyk7XG59XG4iXX0=
enifed('ember-testing/adapters/adapter', ['exports', 'ember-runtime'], function (exports, _emberRuntime) {
  'use strict';

  function K() {
    return this;
  }

  /**
   @module ember
   @submodule ember-testing
  */

  /**
    The primary purpose of this class is to create hooks that can be implemented
    by an adapter for various test frameworks.
  
    @class Adapter
    @namespace Ember.Test
    @public
  */
  exports.default = _emberRuntime.Object.extend({
    /**
      This callback will be called whenever an async operation is about to start.
       Override this to call your framework's methods that handle async
      operations.
       @public
      @method asyncStart
    */
    asyncStart: K,

    /**
      This callback will be called whenever an async operation has completed.
       @public
      @method asyncEnd
    */
    asyncEnd: K,

    /**
      Override this method with your testing framework's false assertion.
      This function is called whenever an exception occurs causing the testing
      promise to fail.
       QUnit example:
       ```javascript
        exception: function(error) {
          ok(false, error);
        };
      ```
       @public
      @method exception
      @param {String} error The exception to be raised.
    */
    exception: function (error) {
      throw error;
    }
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvYWRhcHRlcnMvYWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxXQUFTLENBQUMsR0FBRztBQUFFLFdBQU8sSUFBSSxDQUFDO0dBQUU7Ozs7Ozs7Ozs7Ozs7OztvQkFlZCxjQWpCTixNQUFNLENBaUJZLE1BQU0sQ0FBQzs7Ozs7Ozs7QUFVaEMsY0FBVSxFQUFFLENBQUM7Ozs7Ozs7QUFRYixZQUFRLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQW1CWCxhQUFTLEVBQUEsVUFBQyxLQUFLLEVBQUU7QUFDZixZQUFNLEtBQUssQ0FBQztLQUNiO0dBQ0YsQ0FBQyIsImZpbGUiOiJlbWJlci10ZXN0aW5nL2FkYXB0ZXJzL2FkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPYmplY3QgYXMgRW1iZXJPYmplY3QgfSBmcm9tICdlbWJlci1ydW50aW1lJztcblxuZnVuY3Rpb24gSygpIHsgcmV0dXJuIHRoaXM7IH1cblxuLyoqXG4gQG1vZHVsZSBlbWJlclxuIEBzdWJtb2R1bGUgZW1iZXItdGVzdGluZ1xuKi9cblxuLyoqXG4gIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBjbGFzcyBpcyB0byBjcmVhdGUgaG9va3MgdGhhdCBjYW4gYmUgaW1wbGVtZW50ZWRcbiAgYnkgYW4gYWRhcHRlciBmb3IgdmFyaW91cyB0ZXN0IGZyYW1ld29ya3MuXG5cbiAgQGNsYXNzIEFkYXB0ZXJcbiAgQG5hbWVzcGFjZSBFbWJlci5UZXN0XG4gIEBwdWJsaWNcbiovXG5leHBvcnQgZGVmYXVsdCBFbWJlck9iamVjdC5leHRlbmQoe1xuICAvKipcbiAgICBUaGlzIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHdoZW5ldmVyIGFuIGFzeW5jIG9wZXJhdGlvbiBpcyBhYm91dCB0byBzdGFydC5cblxuICAgIE92ZXJyaWRlIHRoaXMgdG8gY2FsbCB5b3VyIGZyYW1ld29yaydzIG1ldGhvZHMgdGhhdCBoYW5kbGUgYXN5bmNcbiAgICBvcGVyYXRpb25zLlxuXG4gICAgQHB1YmxpY1xuICAgIEBtZXRob2QgYXN5bmNTdGFydFxuICAqL1xuICBhc3luY1N0YXJ0OiBLLFxuXG4gIC8qKlxuICAgIFRoaXMgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgd2hlbmV2ZXIgYW4gYXN5bmMgb3BlcmF0aW9uIGhhcyBjb21wbGV0ZWQuXG5cbiAgICBAcHVibGljXG4gICAgQG1ldGhvZCBhc3luY0VuZFxuICAqL1xuICBhc3luY0VuZDogSyxcblxuICAvKipcbiAgICBPdmVycmlkZSB0aGlzIG1ldGhvZCB3aXRoIHlvdXIgdGVzdGluZyBmcmFtZXdvcmsncyBmYWxzZSBhc3NlcnRpb24uXG4gICAgVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbmV2ZXIgYW4gZXhjZXB0aW9uIG9jY3VycyBjYXVzaW5nIHRoZSB0ZXN0aW5nXG4gICAgcHJvbWlzZSB0byBmYWlsLlxuXG4gICAgUVVuaXQgZXhhbXBsZTpcblxuICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGV4Y2VwdGlvbjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgb2soZmFsc2UsIGVycm9yKTtcbiAgICAgIH07XG4gICAgYGBgXG5cbiAgICBAcHVibGljXG4gICAgQG1ldGhvZCBleGNlcHRpb25cbiAgICBAcGFyYW0ge1N0cmluZ30gZXJyb3IgVGhlIGV4Y2VwdGlvbiB0byBiZSByYWlzZWQuXG4gICovXG4gIGV4Y2VwdGlvbihlcnJvcikge1xuICAgIHRocm93IGVycm9yO1xuICB9XG59KTtcbiJdfQ==
enifed('ember-testing/adapters/qunit', ['exports', 'ember-utils', 'ember-testing/adapters/adapter'], function (exports, _emberUtils, _emberTestingAdaptersAdapter) {
  'use strict';

  /**
    This class implements the methods defined by Ember.Test.Adapter for the
    QUnit testing framework.
  
    @class QUnitAdapter
    @namespace Ember.Test
    @extends Ember.Test.Adapter
    @public
  */
  exports.default = _emberTestingAdaptersAdapter.default.extend({
    asyncStart: function () {
      QUnit.stop();
    },
    asyncEnd: function () {
      QUnit.start();
    },
    exception: function (error) {
      ok(false, _emberUtils.inspect(error));
    }
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvYWRhcHRlcnMvcXVuaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O29CQVllLHFDQUFRLE1BQU0sQ0FBQztBQUM1QixjQUFVLEVBQUEsWUFBRztBQUNYLFdBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNkO0FBQ0QsWUFBUSxFQUFBLFlBQUc7QUFDVCxXQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDZjtBQUNELGFBQVMsRUFBQSxVQUFDLEtBQUssRUFBRTtBQUNmLFFBQUUsQ0FBQyxLQUFLLEVBQUUsWUFwQkwsT0FBTyxDQW9CTSxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQzNCO0dBQ0YsQ0FBQyIsImZpbGUiOiJlbWJlci10ZXN0aW5nL2FkYXB0ZXJzL3F1bml0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW5zcGVjdCB9IGZyb20gJ2VtYmVyLXV0aWxzJztcbmltcG9ydCBBZGFwdGVyIGZyb20gJy4vYWRhcHRlcic7XG5cbi8qKlxuICBUaGlzIGNsYXNzIGltcGxlbWVudHMgdGhlIG1ldGhvZHMgZGVmaW5lZCBieSBFbWJlci5UZXN0LkFkYXB0ZXIgZm9yIHRoZVxuICBRVW5pdCB0ZXN0aW5nIGZyYW1ld29yay5cblxuICBAY2xhc3MgUVVuaXRBZGFwdGVyXG4gIEBuYW1lc3BhY2UgRW1iZXIuVGVzdFxuICBAZXh0ZW5kcyBFbWJlci5UZXN0LkFkYXB0ZXJcbiAgQHB1YmxpY1xuKi9cbmV4cG9ydCBkZWZhdWx0IEFkYXB0ZXIuZXh0ZW5kKHtcbiAgYXN5bmNTdGFydCgpIHtcbiAgICBRVW5pdC5zdG9wKCk7XG4gIH0sXG4gIGFzeW5jRW5kKCkge1xuICAgIFFVbml0LnN0YXJ0KCk7XG4gIH0sXG4gIGV4Y2VwdGlvbihlcnJvcikge1xuICAgIG9rKGZhbHNlLCBpbnNwZWN0KGVycm9yKSk7XG4gIH1cbn0pO1xuIl19
enifed('ember-testing/events', ['exports', 'ember-views', 'ember-metal'], function (exports, _emberViews, _emberMetal) {
  'use strict';

  exports.focus = focus;
  exports.fireEvent = fireEvent;

  var DEFAULT_EVENT_OPTIONS = { canBubble: true, cancelable: true };
  var KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'];
  var MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];

  function focus(el) {
    if (!el) {
      return;
    }
    var $el = _emberViews.jQuery(el);
    if ($el.is(':input, [contenteditable=true]')) {
      var type = $el.prop('type');
      if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
        _emberMetal.run(null, function () {
          // Firefox does not trigger the `focusin` event if the window
          // does not have focus. If the document doesn't have focus just
          // use trigger('focusin') instead.

          if (!document.hasFocus || document.hasFocus()) {
            el.focus();
          } else {
            $el.trigger('focusin');
          }
        });
      }
    }
  }

  function fireEvent(element, type) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!element) {
      return;
    }
    var event = undefined;
    if (KEYBOARD_EVENT_TYPES.indexOf(type) > -1) {
      event = buildKeyboardEvent(type, options);
    } else if (MOUSE_EVENT_TYPES.indexOf(type) > -1) {
      var rect = element.getBoundingClientRect();
      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5,
        screenY: y + 95,
        clientX: x,
        clientY: y
      };
      event = buildMouseEvent(type, _emberViews.jQuery.extend(simulatedCoordinates, options));
    } else {
      event = buildBasicEvent(type, options);
    }
    element.dispatchEvent(event);
  }

  function buildBasicEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = document.createEvent('Events');
    event.initEvent(type, true, true);
    _emberViews.jQuery.extend(event, options);
    return event;
  }

  function buildMouseEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = undefined;
    try {
      event = document.createEvent('MouseEvents');
      var eventOpts = _emberViews.jQuery.extend({}, DEFAULT_EVENT_OPTIONS, options);
      event.initMouseEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }

  function buildKeyboardEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = undefined;
    try {
      event = document.createEvent('KeyEvents');
      var eventOpts = _emberViews.jQuery.extend({}, DEFAULT_EVENT_OPTIONS, options);
      event.initKeyEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBLE1BQU0scUJBQXFCLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUNwRSxNQUFNLG9CQUFvQixHQUFHLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5RCxNQUFNLGlCQUFpQixHQUFHLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFbkksV0FBUyxLQUFLLENBQUMsRUFBRSxFQUFFO0FBQ3hCLFFBQUksQ0FBQyxFQUFFLEVBQUU7QUFBRSxhQUFPO0tBQUU7QUFDcEIsUUFBSSxHQUFHLEdBQUcsWUFUSCxNQUFNLENBU0ksRUFBRSxDQUFDLENBQUM7QUFDckIsUUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLGdDQUFnQyxDQUFDLEVBQUU7QUFDNUMsVUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QixVQUFJLElBQUksS0FBSyxVQUFVLElBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ2hFLG9CQVpHLEdBQUcsQ0FZRixJQUFJLEVBQUUsWUFBVzs7Ozs7QUFLbkIsY0FBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFO0FBQzdDLGNBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztXQUNaLE1BQU07QUFDTCxlQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1dBQ3hCO1NBQ0YsQ0FBQyxDQUFDO09BQ0o7S0FDRjtHQUNGOztBQUVNLFdBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQWdCO1FBQWQsT0FBTyx5REFBRyxFQUFFOztBQUNuRCxRQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osYUFBTztLQUNSO0FBQ0QsUUFBSSxLQUFLLFlBQUEsQ0FBQztBQUNWLFFBQUksb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzNDLFdBQUssR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDM0MsTUFBTSxJQUFJLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUMvQyxVQUFJLElBQUksR0FBRyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUMzQyxVQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUN0QixVQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQixVQUFJLG9CQUFvQixHQUFHO0FBQ3pCLGVBQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNkLGVBQU8sRUFBRSxDQUFDLEdBQUcsRUFBRTtBQUNmLGVBQU8sRUFBRSxDQUFDO0FBQ1YsZUFBTyxFQUFFLENBQUM7T0FDWCxDQUFDO0FBQ0YsV0FBSyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsWUE3Q3pCLE1BQU0sQ0E2QzBCLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQzdFLE1BQU07QUFDTCxXQUFLLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN4QztBQUNELFdBQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDOUI7O0FBRUQsV0FBUyxlQUFlLENBQUMsSUFBSSxFQUFnQjtRQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDekMsUUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQyxTQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEMsZ0JBdkRPLE1BQU0sQ0F1RE4sTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5QixXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFdBQVMsZUFBZSxDQUFDLElBQUksRUFBZ0I7UUFBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQ3pDLFFBQUksS0FBSyxZQUFBLENBQUM7QUFDVixRQUFJO0FBQ0YsV0FBSyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDNUMsVUFBSSxTQUFTLEdBQUcsWUEvRFgsTUFBTSxDQStEWSxNQUFNLENBQUMsRUFBRSxFQUFFLHFCQUFxQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2xFLFdBQUssQ0FBQyxjQUFjLENBQ2xCLElBQUksRUFDSixTQUFTLENBQUMsU0FBUyxFQUNuQixTQUFTLENBQUMsVUFBVSxFQUNwQixNQUFNLEVBQ04sU0FBUyxDQUFDLE1BQU0sRUFDaEIsU0FBUyxDQUFDLE9BQU8sRUFDakIsU0FBUyxDQUFDLE9BQU8sRUFDakIsU0FBUyxDQUFDLE9BQU8sRUFDakIsU0FBUyxDQUFDLE9BQU8sRUFDakIsU0FBUyxDQUFDLE9BQU8sRUFDakIsU0FBUyxDQUFDLE1BQU0sRUFDaEIsU0FBUyxDQUFDLFFBQVEsRUFDbEIsU0FBUyxDQUFDLE9BQU8sRUFDakIsU0FBUyxDQUFDLE1BQU0sRUFDaEIsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzVCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFLLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN4QztBQUNELFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsV0FBUyxrQkFBa0IsQ0FBQyxJQUFJLEVBQWdCO1FBQWQsT0FBTyx5REFBRyxFQUFFOztBQUM1QyxRQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsUUFBSTtBQUNGLFdBQUssR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzFDLFVBQUksU0FBUyxHQUFHLFlBMUZYLE1BQU0sQ0EwRlksTUFBTSxDQUFDLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNsRSxXQUFLLENBQUMsWUFBWSxDQUNoQixJQUFJLEVBQ0osU0FBUyxDQUFDLFNBQVMsRUFDbkIsU0FBUyxDQUFDLFVBQVUsRUFDcEIsTUFBTSxFQUNOLFNBQVMsQ0FBQyxPQUFPLEVBQ2pCLFNBQVMsQ0FBQyxNQUFNLEVBQ2hCLFNBQVMsQ0FBQyxRQUFRLEVBQ2xCLFNBQVMsQ0FBQyxPQUFPLEVBQ2pCLFNBQVMsQ0FBQyxPQUFPLEVBQ2pCLFNBQVMsQ0FBQyxRQUFRLENBQ25CLENBQUM7S0FDSCxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsV0FBSyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDeEM7QUFDRCxXQUFPLEtBQUssQ0FBQztHQUNkIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvZXZlbnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgalF1ZXJ5IH0gZnJvbSAnZW1iZXItdmlld3MnO1xuaW1wb3J0IHsgcnVuIH0gZnJvbSAnZW1iZXItbWV0YWwnO1xuXG5jb25zdCBERUZBVUxUX0VWRU5UX09QVElPTlMgPSB7IGNhbkJ1YmJsZTogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9O1xuY29uc3QgS0VZQk9BUkRfRVZFTlRfVFlQRVMgPSBbJ2tleWRvd24nLCAna2V5cHJlc3MnLCAna2V5dXAnXTtcbmNvbnN0IE1PVVNFX0VWRU5UX1RZUEVTID0gWydjbGljaycsICdtb3VzZWRvd24nLCAnbW91c2V1cCcsICdkYmxjbGljaycsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnLCAnbW91c2Vtb3ZlJywgJ21vdXNlb3V0JywgJ21vdXNlb3ZlciddO1xuXG5leHBvcnQgZnVuY3Rpb24gZm9jdXMoZWwpIHtcbiAgaWYgKCFlbCkgeyByZXR1cm47IH1cbiAgbGV0ICRlbCA9IGpRdWVyeShlbCk7XG4gIGlmICgkZWwuaXMoJzppbnB1dCwgW2NvbnRlbnRlZGl0YWJsZT10cnVlXScpKSB7XG4gICAgbGV0IHR5cGUgPSAkZWwucHJvcCgndHlwZScpO1xuICAgIGlmICh0eXBlICE9PSAnY2hlY2tib3gnICYmIHR5cGUgIT09ICdyYWRpbycgJiYgdHlwZSAhPT0gJ2hpZGRlbicpIHtcbiAgICAgIHJ1bihudWxsLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gRmlyZWZveCBkb2VzIG5vdCB0cmlnZ2VyIHRoZSBgZm9jdXNpbmAgZXZlbnQgaWYgdGhlIHdpbmRvd1xuICAgICAgICAvLyBkb2VzIG5vdCBoYXZlIGZvY3VzLiBJZiB0aGUgZG9jdW1lbnQgZG9lc24ndCBoYXZlIGZvY3VzIGp1c3RcbiAgICAgICAgLy8gdXNlIHRyaWdnZXIoJ2ZvY3VzaW4nKSBpbnN0ZWFkLlxuXG4gICAgICAgIGlmICghZG9jdW1lbnQuaGFzRm9jdXMgfHwgZG9jdW1lbnQuaGFzRm9jdXMoKSkge1xuICAgICAgICAgIGVsLmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGVsLnRyaWdnZXIoJ2ZvY3VzaW4nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXJlRXZlbnQoZWxlbWVudCwgdHlwZSwgb3B0aW9ucyA9IHt9KSB7XG4gIGlmICghZWxlbWVudCkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgZXZlbnQ7XG4gIGlmIChLRVlCT0FSRF9FVkVOVF9UWVBFUy5pbmRleE9mKHR5cGUpID4gLTEpIHtcbiAgICBldmVudCA9IGJ1aWxkS2V5Ym9hcmRFdmVudCh0eXBlLCBvcHRpb25zKTtcbiAgfSBlbHNlIGlmIChNT1VTRV9FVkVOVF9UWVBFUy5pbmRleE9mKHR5cGUpID4gLTEpIHtcbiAgICBsZXQgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbGV0IHggPSByZWN0LmxlZnQgKyAxO1xuICAgIGxldCB5ID0gcmVjdC50b3AgKyAxO1xuICAgIGxldCBzaW11bGF0ZWRDb29yZGluYXRlcyA9IHtcbiAgICAgIHNjcmVlblg6IHggKyA1LFxuICAgICAgc2NyZWVuWTogeSArIDk1LFxuICAgICAgY2xpZW50WDogeCxcbiAgICAgIGNsaWVudFk6IHlcbiAgICB9O1xuICAgIGV2ZW50ID0gYnVpbGRNb3VzZUV2ZW50KHR5cGUsIGpRdWVyeS5leHRlbmQoc2ltdWxhdGVkQ29vcmRpbmF0ZXMsIG9wdGlvbnMpKTtcbiAgfSBlbHNlIHtcbiAgICBldmVudCA9IGJ1aWxkQmFzaWNFdmVudCh0eXBlLCBvcHRpb25zKTtcbiAgfVxuICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufVxuXG5mdW5jdGlvbiBidWlsZEJhc2ljRXZlbnQodHlwZSwgb3B0aW9ucyA9IHt9KSB7XG4gIGxldCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudHMnKTtcbiAgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIHRydWUsIHRydWUpO1xuICBqUXVlcnkuZXh0ZW5kKGV2ZW50LCBvcHRpb25zKTtcbiAgcmV0dXJuIGV2ZW50O1xufVxuXG5mdW5jdGlvbiBidWlsZE1vdXNlRXZlbnQodHlwZSwgb3B0aW9ucyA9IHt9KSB7XG4gIGxldCBldmVudDtcbiAgdHJ5IHtcbiAgICBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xuICAgIGxldCBldmVudE9wdHMgPSBqUXVlcnkuZXh0ZW5kKHt9LCBERUZBVUxUX0VWRU5UX09QVElPTlMsIG9wdGlvbnMpO1xuICAgIGV2ZW50LmluaXRNb3VzZUV2ZW50KFxuICAgICAgdHlwZSxcbiAgICAgIGV2ZW50T3B0cy5jYW5CdWJibGUsXG4gICAgICBldmVudE9wdHMuY2FuY2VsYWJsZSxcbiAgICAgIHdpbmRvdyxcbiAgICAgIGV2ZW50T3B0cy5kZXRhaWwsXG4gICAgICBldmVudE9wdHMuc2NyZWVuWCxcbiAgICAgIGV2ZW50T3B0cy5zY3JlZW5ZLFxuICAgICAgZXZlbnRPcHRzLmNsaWVudFgsXG4gICAgICBldmVudE9wdHMuY2xpZW50WSxcbiAgICAgIGV2ZW50T3B0cy5jdHJsS2V5LFxuICAgICAgZXZlbnRPcHRzLmFsdEtleSxcbiAgICAgIGV2ZW50T3B0cy5zaGlmdEtleSxcbiAgICAgIGV2ZW50T3B0cy5tZXRhS2V5LFxuICAgICAgZXZlbnRPcHRzLmJ1dHRvbixcbiAgICAgIGV2ZW50T3B0cy5yZWxhdGVkVGFyZ2V0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGV2ZW50ID0gYnVpbGRCYXNpY0V2ZW50KHR5cGUsIG9wdGlvbnMpO1xuICB9XG4gIHJldHVybiBldmVudDtcbn1cblxuZnVuY3Rpb24gYnVpbGRLZXlib2FyZEV2ZW50KHR5cGUsIG9wdGlvbnMgPSB7fSkge1xuICBsZXQgZXZlbnQ7XG4gIHRyeSB7XG4gICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnS2V5RXZlbnRzJyk7XG4gICAgbGV0IGV2ZW50T3B0cyA9IGpRdWVyeS5leHRlbmQoe30sIERFRkFVTFRfRVZFTlRfT1BUSU9OUywgb3B0aW9ucyk7XG4gICAgZXZlbnQuaW5pdEtleUV2ZW50KFxuICAgICAgdHlwZSxcbiAgICAgIGV2ZW50T3B0cy5jYW5CdWJibGUsXG4gICAgICBldmVudE9wdHMuY2FuY2VsYWJsZSxcbiAgICAgIHdpbmRvdyxcbiAgICAgIGV2ZW50T3B0cy5jdHJsS2V5LFxuICAgICAgZXZlbnRPcHRzLmFsdEtleSxcbiAgICAgIGV2ZW50T3B0cy5zaGlmdEtleSxcbiAgICAgIGV2ZW50T3B0cy5tZXRhS2V5LFxuICAgICAgZXZlbnRPcHRzLmtleUNvZGUsXG4gICAgICBldmVudE9wdHMuY2hhckNvZGVcbiAgICApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXZlbnQgPSBidWlsZEJhc2ljRXZlbnQodHlwZSwgb3B0aW9ucyk7XG4gIH1cbiAgcmV0dXJuIGV2ZW50O1xufVxuIl19
enifed('ember-testing/ext/application', ['exports', 'ember-application', 'ember-testing/setup_for_testing', 'ember-testing/test/helpers', 'ember-testing/test/promise', 'ember-testing/test/run', 'ember-testing/test/on_inject_helpers', 'ember-testing/test/adapter'], function (exports, _emberApplication, _emberTestingSetup_for_testing, _emberTestingTestHelpers, _emberTestingTestPromise, _emberTestingTestRun, _emberTestingTestOn_inject_helpers, _emberTestingTestAdapter) {
  'use strict';

  _emberApplication.Application.reopen({
    /**
     This property contains the testing helpers for the current application. These
     are created once you call `injectTestHelpers` on your `Ember.Application`
     instance. The included helpers are also available on the `window` object by
     default, but can be used from this object on the individual application also.
       @property testHelpers
      @type {Object}
      @default {}
      @public
    */
    testHelpers: {},

    /**
     This property will contain the original methods that were registered
     on the `helperContainer` before `injectTestHelpers` is called.
      When `removeTestHelpers` is called, these methods are restored to the
     `helperContainer`.
       @property originalMethods
      @type {Object}
      @default {}
      @private
      @since 1.3.0
    */
    originalMethods: {},

    /**
    This property indicates whether or not this application is currently in
    testing mode. This is set when `setupForTesting` is called on the current
    application.
     @property testing
    @type {Boolean}
    @default false
    @since 1.3.0
    @public
    */
    testing: false,

    /**
      This hook defers the readiness of the application, so that you can start
      the app when your tests are ready to run. It also sets the router's
      location to 'none', so that the window's location will not be modified
      (preventing both accidental leaking of state between tests and interference
      with your testing framework).
       Example:
       ```
      App.setupForTesting();
      ```
       @method setupForTesting
      @public
    */
    setupForTesting: function () {
      _emberTestingSetup_for_testing.default();

      this.testing = true;

      this.Router.reopen({
        location: 'none'
      });
    },

    /**
      This will be used as the container to inject the test helpers into. By
      default the helpers are injected into `window`.
       @property helperContainer
      @type {Object} The object to be used for test helpers.
      @default window
      @since 1.2.0
      @private
    */
    helperContainer: null,

    /**
      This injects the test helpers into the `helperContainer` object. If an object is provided
      it will be used as the helperContainer. If `helperContainer` is not set it will default
      to `window`. If a function of the same name has already been defined it will be cached
      (so that it can be reset if the helper is removed with `unregisterHelper` or
      `removeTestHelpers`).
       Any callbacks registered with `onInjectHelpers` will be called once the
      helpers have been injected.
       Example:
      ```
      App.injectTestHelpers();
      ```
       @method injectTestHelpers
      @public
    */
    injectTestHelpers: function (helperContainer) {
      if (helperContainer) {
        this.helperContainer = helperContainer;
      } else {
        this.helperContainer = window;
      }

      this.reopen({
        willDestroy: function () {
          this._super.apply(this, arguments);
          this.removeTestHelpers();
        }
      });

      this.testHelpers = {};
      for (var _name in _emberTestingTestHelpers.helpers) {
        this.originalMethods[_name] = this.helperContainer[_name];
        this.testHelpers[_name] = this.helperContainer[_name] = helper(this, _name);
        protoWrap(_emberTestingTestPromise.default.prototype, _name, helper(this, _name), _emberTestingTestHelpers.helpers[_name].meta.wait);
      }

      _emberTestingTestOn_inject_helpers.invokeInjectHelpersCallbacks(this);
    },

    /**
      This removes all helpers that have been registered, and resets and functions
      that were overridden by the helpers.
       Example:
       ```javascript
      App.removeTestHelpers();
      ```
       @public
      @method removeTestHelpers
    */
    removeTestHelpers: function () {
      if (!this.helperContainer) {
        return;
      }

      for (var _name2 in _emberTestingTestHelpers.helpers) {
        this.helperContainer[_name2] = this.originalMethods[_name2];
        delete _emberTestingTestPromise.default.prototype[_name2];
        delete this.testHelpers[_name2];
        delete this.originalMethods[_name2];
      }
    }
  });

  // This method is no longer needed
  // But still here for backwards compatibility
  // of helper chaining
  function protoWrap(proto, name, callback, isAsync) {
    proto[name] = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (isAsync) {
        return callback.apply(this, args);
      } else {
        return this.then(function () {
          return callback.apply(this, args);
        });
      }
    };
  }

  function helper(app, name) {
    var fn = _emberTestingTestHelpers.helpers[name].method;
    var meta = _emberTestingTestHelpers.helpers[name].meta;
    if (!meta.wait) {
      return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return fn.apply(app, [app].concat(args));
      };
    }

    return function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var lastPromise = _emberTestingTestRun.default(function () {
        return _emberTestingTestPromise.resolve(_emberTestingTestPromise.getLastPromise());
      });

      // wait for last helper's promise to resolve and then
      // execute. To be safe, we need to tell the adapter we're going
      // asynchronous here, because fn may not be invoked before we
      // return.
      _emberTestingTestAdapter.asyncStart();
      return lastPromise.then(function () {
        return fn.apply(app, [app].concat(args));
      }).finally(_emberTestingTestAdapter.asyncEnd);
    };
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvZXh0L2FwcGxpY2F0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWNBLG9CQWRTLFdBQVcsQ0FjSCxNQUFNLENBQUM7Ozs7Ozs7Ozs7O0FBWXRCLGVBQVcsRUFBRSxFQUFFOzs7Ozs7Ozs7Ozs7O0FBZWYsbUJBQWUsRUFBRSxFQUFFOzs7Ozs7Ozs7Ozs7QUFjbkIsV0FBTyxFQUFFLEtBQUs7Ozs7Ozs7Ozs7Ozs7OztBQWtCZCxtQkFBZSxFQUFBLFlBQUc7QUFDaEIsOENBQWlCLENBQUM7O0FBRWxCLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDOztBQUVwQixVQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNqQixnQkFBUSxFQUFFLE1BQU07T0FDakIsQ0FBQyxDQUFDO0tBQ0o7Ozs7Ozs7Ozs7O0FBWUQsbUJBQWUsRUFBRSxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7OztBQW9CckIscUJBQWlCLEVBQUEsVUFBQyxlQUFlLEVBQUU7QUFDakMsVUFBSSxlQUFlLEVBQUU7QUFDbkIsWUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7T0FDeEMsTUFBTTtBQUNMLFlBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO09BQy9COztBQUVELFVBQUksQ0FBQyxNQUFNLENBQUM7QUFDVixtQkFBVyxFQUFBLFlBQUc7QUFDWixjQUFJLENBQUMsTUFBTSxNQUFBLENBQVgsSUFBSSxFQUFXLFNBQVMsQ0FBQyxDQUFDO0FBQzFCLGNBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQzFCO09BQ0YsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFdBQUssSUFBSSxLQUFJLDZCQTlIUixPQUFPLEVBOEhjO0FBQ3hCLFlBQUksQ0FBQyxlQUFlLENBQUMsS0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFJLENBQUMsQ0FBQztBQUN4RCxZQUFJLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFJLENBQUMsQ0FBQztBQUN6RSxpQkFBUyxDQUFDLGlDQUFZLFNBQVMsRUFBRSxLQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFJLENBQUMsRUFBRSx5QkFqSXhELE9BQU8sQ0FpSXlELEtBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNyRjs7QUFFRCx5Q0E5SEssNEJBQTRCLENBOEhKLElBQUksQ0FBQyxDQUFDO0tBQ3BDOzs7Ozs7Ozs7Ozs7QUFlRCxxQkFBaUIsRUFBQSxZQUFHO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO0FBQUUsZUFBTztPQUFFOztBQUV0QyxXQUFLLElBQUksTUFBSSw2QkF2SlIsT0FBTyxFQXVKYztBQUN4QixZQUFJLENBQUMsZUFBZSxDQUFDLE1BQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBSSxDQUFDLENBQUM7QUFDeEQsZUFBTyxpQ0FBWSxTQUFTLENBQUMsTUFBSSxDQUFDLENBQUM7QUFDbkMsZUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQUksQ0FBQyxDQUFDO0FBQzlCLGVBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFJLENBQUMsQ0FBQztPQUNuQztLQUNGO0dBQ0YsQ0FBQyxDQUFDOzs7OztBQUtILFdBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtBQUNqRCxTQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBa0I7d0NBQU4sSUFBSTtBQUFKLFlBQUk7OztBQUM1QixVQUFJLE9BQU8sRUFBRTtBQUNYLGVBQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDbkMsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFXO0FBQzFCLGlCQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ25DLENBQUMsQ0FBQztPQUNKO0tBQ0YsQ0FBQztHQUNIOztBQUVELFdBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDekIsUUFBSSxFQUFFLEdBQUcseUJBaExGLE9BQU8sQ0FnTEcsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzlCLFFBQUksSUFBSSxHQUFHLHlCQWpMSixPQUFPLENBaUxLLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM5QixRQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtBQUNkLGFBQU87MkNBQUksSUFBSTtBQUFKLGNBQUk7OztlQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsU0FBSyxJQUFJLEVBQUU7T0FBQSxDQUFDO0tBQ25EOztBQUVELFdBQU8sWUFBYTt5Q0FBVCxJQUFJO0FBQUosWUFBSTs7O0FBQ2IsVUFBSSxXQUFXLEdBQUcsNkJBQUk7ZUFBTSx5QkFyTDlCLE9BQU8sQ0FxTCtCLHlCQXBMdEMsY0FBYyxFQW9Md0MsQ0FBQztPQUFBLENBQUMsQ0FBQzs7Ozs7O0FBTXZELCtCQXJMRixVQUFVLEVBcUxJLENBQUM7QUFDYixhQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUM7ZUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLFNBQUssSUFBSSxFQUFFO09BQUEsQ0FBQyxDQUFDLE9BQU8sMEJBckx0RSxRQUFRLENBcUx3RSxDQUFDO0tBQ2hGLENBQUM7R0FDSCIsImZpbGUiOiJlbWJlci10ZXN0aW5nL2V4dC9hcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcGxpY2F0aW9uIGFzIEVtYmVyQXBwbGljYXRpb24gfSBmcm9tICdlbWJlci1hcHBsaWNhdGlvbic7XG5pbXBvcnQgc2V0dXBGb3JUZXN0aW5nIGZyb20gJy4uL3NldHVwX2Zvcl90ZXN0aW5nJztcbmltcG9ydCB7IGhlbHBlcnMgfSBmcm9tICcuLi90ZXN0L2hlbHBlcnMnO1xuaW1wb3J0IFRlc3RQcm9taXNlLCB7XG4gIHJlc29sdmUsXG4gIGdldExhc3RQcm9taXNlXG59IGZyb20gJy4uL3Rlc3QvcHJvbWlzZSc7XG5pbXBvcnQgcnVuIGZyb20gJy4uL3Rlc3QvcnVuJztcbmltcG9ydCB7IGludm9rZUluamVjdEhlbHBlcnNDYWxsYmFja3MgfSBmcm9tICcuLi90ZXN0L29uX2luamVjdF9oZWxwZXJzJztcbmltcG9ydCB7XG4gIGFzeW5jU3RhcnQsXG4gIGFzeW5jRW5kXG59IGZyb20gJy4uL3Rlc3QvYWRhcHRlcic7XG5cbkVtYmVyQXBwbGljYXRpb24ucmVvcGVuKHtcbiAgLyoqXG4gICBUaGlzIHByb3BlcnR5IGNvbnRhaW5zIHRoZSB0ZXN0aW5nIGhlbHBlcnMgZm9yIHRoZSBjdXJyZW50IGFwcGxpY2F0aW9uLiBUaGVzZVxuICAgYXJlIGNyZWF0ZWQgb25jZSB5b3UgY2FsbCBgaW5qZWN0VGVzdEhlbHBlcnNgIG9uIHlvdXIgYEVtYmVyLkFwcGxpY2F0aW9uYFxuICAgaW5zdGFuY2UuIFRoZSBpbmNsdWRlZCBoZWxwZXJzIGFyZSBhbHNvIGF2YWlsYWJsZSBvbiB0aGUgYHdpbmRvd2Agb2JqZWN0IGJ5XG4gICBkZWZhdWx0LCBidXQgY2FuIGJlIHVzZWQgZnJvbSB0aGlzIG9iamVjdCBvbiB0aGUgaW5kaXZpZHVhbCBhcHBsaWNhdGlvbiBhbHNvLlxuXG4gICAgQHByb3BlcnR5IHRlc3RIZWxwZXJzXG4gICAgQHR5cGUge09iamVjdH1cbiAgICBAZGVmYXVsdCB7fVxuICAgIEBwdWJsaWNcbiAgKi9cbiAgdGVzdEhlbHBlcnM6IHt9LFxuXG4gIC8qKlxuICAgVGhpcyBwcm9wZXJ0eSB3aWxsIGNvbnRhaW4gdGhlIG9yaWdpbmFsIG1ldGhvZHMgdGhhdCB3ZXJlIHJlZ2lzdGVyZWRcbiAgIG9uIHRoZSBgaGVscGVyQ29udGFpbmVyYCBiZWZvcmUgYGluamVjdFRlc3RIZWxwZXJzYCBpcyBjYWxsZWQuXG5cbiAgIFdoZW4gYHJlbW92ZVRlc3RIZWxwZXJzYCBpcyBjYWxsZWQsIHRoZXNlIG1ldGhvZHMgYXJlIHJlc3RvcmVkIHRvIHRoZVxuICAgYGhlbHBlckNvbnRhaW5lcmAuXG5cbiAgICBAcHJvcGVydHkgb3JpZ2luYWxNZXRob2RzXG4gICAgQHR5cGUge09iamVjdH1cbiAgICBAZGVmYXVsdCB7fVxuICAgIEBwcml2YXRlXG4gICAgQHNpbmNlIDEuMy4wXG4gICovXG4gIG9yaWdpbmFsTWV0aG9kczoge30sXG5cblxuICAvKipcbiAgVGhpcyBwcm9wZXJ0eSBpbmRpY2F0ZXMgd2hldGhlciBvciBub3QgdGhpcyBhcHBsaWNhdGlvbiBpcyBjdXJyZW50bHkgaW5cbiAgdGVzdGluZyBtb2RlLiBUaGlzIGlzIHNldCB3aGVuIGBzZXR1cEZvclRlc3RpbmdgIGlzIGNhbGxlZCBvbiB0aGUgY3VycmVudFxuICBhcHBsaWNhdGlvbi5cblxuICBAcHJvcGVydHkgdGVzdGluZ1xuICBAdHlwZSB7Qm9vbGVhbn1cbiAgQGRlZmF1bHQgZmFsc2VcbiAgQHNpbmNlIDEuMy4wXG4gIEBwdWJsaWNcbiAgKi9cbiAgdGVzdGluZzogZmFsc2UsXG5cbiAgLyoqXG4gICAgVGhpcyBob29rIGRlZmVycyB0aGUgcmVhZGluZXNzIG9mIHRoZSBhcHBsaWNhdGlvbiwgc28gdGhhdCB5b3UgY2FuIHN0YXJ0XG4gICAgdGhlIGFwcCB3aGVuIHlvdXIgdGVzdHMgYXJlIHJlYWR5IHRvIHJ1bi4gSXQgYWxzbyBzZXRzIHRoZSByb3V0ZXInc1xuICAgIGxvY2F0aW9uIHRvICdub25lJywgc28gdGhhdCB0aGUgd2luZG93J3MgbG9jYXRpb24gd2lsbCBub3QgYmUgbW9kaWZpZWRcbiAgICAocHJldmVudGluZyBib3RoIGFjY2lkZW50YWwgbGVha2luZyBvZiBzdGF0ZSBiZXR3ZWVuIHRlc3RzIGFuZCBpbnRlcmZlcmVuY2VcbiAgICB3aXRoIHlvdXIgdGVzdGluZyBmcmFtZXdvcmspLlxuXG4gICAgRXhhbXBsZTpcblxuICAgIGBgYFxuICAgIEFwcC5zZXR1cEZvclRlc3RpbmcoKTtcbiAgICBgYGBcblxuICAgIEBtZXRob2Qgc2V0dXBGb3JUZXN0aW5nXG4gICAgQHB1YmxpY1xuICAqL1xuICBzZXR1cEZvclRlc3RpbmcoKSB7XG4gICAgc2V0dXBGb3JUZXN0aW5nKCk7XG5cbiAgICB0aGlzLnRlc3RpbmcgPSB0cnVlO1xuXG4gICAgdGhpcy5Sb3V0ZXIucmVvcGVuKHtcbiAgICAgIGxvY2F0aW9uOiAnbm9uZSdcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICBUaGlzIHdpbGwgYmUgdXNlZCBhcyB0aGUgY29udGFpbmVyIHRvIGluamVjdCB0aGUgdGVzdCBoZWxwZXJzIGludG8uIEJ5XG4gICAgZGVmYXVsdCB0aGUgaGVscGVycyBhcmUgaW5qZWN0ZWQgaW50byBgd2luZG93YC5cblxuICAgIEBwcm9wZXJ0eSBoZWxwZXJDb250YWluZXJcbiAgICBAdHlwZSB7T2JqZWN0fSBUaGUgb2JqZWN0IHRvIGJlIHVzZWQgZm9yIHRlc3QgaGVscGVycy5cbiAgICBAZGVmYXVsdCB3aW5kb3dcbiAgICBAc2luY2UgMS4yLjBcbiAgICBAcHJpdmF0ZVxuICAqL1xuICBoZWxwZXJDb250YWluZXI6IG51bGwsXG5cbiAgLyoqXG4gICAgVGhpcyBpbmplY3RzIHRoZSB0ZXN0IGhlbHBlcnMgaW50byB0aGUgYGhlbHBlckNvbnRhaW5lcmAgb2JqZWN0LiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWRcbiAgICBpdCB3aWxsIGJlIHVzZWQgYXMgdGhlIGhlbHBlckNvbnRhaW5lci4gSWYgYGhlbHBlckNvbnRhaW5lcmAgaXMgbm90IHNldCBpdCB3aWxsIGRlZmF1bHRcbiAgICB0byBgd2luZG93YC4gSWYgYSBmdW5jdGlvbiBvZiB0aGUgc2FtZSBuYW1lIGhhcyBhbHJlYWR5IGJlZW4gZGVmaW5lZCBpdCB3aWxsIGJlIGNhY2hlZFxuICAgIChzbyB0aGF0IGl0IGNhbiBiZSByZXNldCBpZiB0aGUgaGVscGVyIGlzIHJlbW92ZWQgd2l0aCBgdW5yZWdpc3RlckhlbHBlcmAgb3JcbiAgICBgcmVtb3ZlVGVzdEhlbHBlcnNgKS5cblxuICAgIEFueSBjYWxsYmFja3MgcmVnaXN0ZXJlZCB3aXRoIGBvbkluamVjdEhlbHBlcnNgIHdpbGwgYmUgY2FsbGVkIG9uY2UgdGhlXG4gICAgaGVscGVycyBoYXZlIGJlZW4gaW5qZWN0ZWQuXG5cbiAgICBFeGFtcGxlOlxuICAgIGBgYFxuICAgIEFwcC5pbmplY3RUZXN0SGVscGVycygpO1xuICAgIGBgYFxuXG4gICAgQG1ldGhvZCBpbmplY3RUZXN0SGVscGVyc1xuICAgIEBwdWJsaWNcbiAgKi9cbiAgaW5qZWN0VGVzdEhlbHBlcnMoaGVscGVyQ29udGFpbmVyKSB7XG4gICAgaWYgKGhlbHBlckNvbnRhaW5lcikge1xuICAgICAgdGhpcy5oZWxwZXJDb250YWluZXIgPSBoZWxwZXJDb250YWluZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGVscGVyQ29udGFpbmVyID0gd2luZG93O1xuICAgIH1cblxuICAgIHRoaXMucmVvcGVuKHtcbiAgICAgIHdpbGxEZXN0cm95KCkge1xuICAgICAgICB0aGlzLl9zdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnJlbW92ZVRlc3RIZWxwZXJzKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnRlc3RIZWxwZXJzID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBoZWxwZXJzKSB7XG4gICAgICB0aGlzLm9yaWdpbmFsTWV0aG9kc1tuYW1lXSA9IHRoaXMuaGVscGVyQ29udGFpbmVyW25hbWVdO1xuICAgICAgdGhpcy50ZXN0SGVscGVyc1tuYW1lXSA9IHRoaXMuaGVscGVyQ29udGFpbmVyW25hbWVdID0gaGVscGVyKHRoaXMsIG5hbWUpO1xuICAgICAgcHJvdG9XcmFwKFRlc3RQcm9taXNlLnByb3RvdHlwZSwgbmFtZSwgaGVscGVyKHRoaXMsIG5hbWUpLCBoZWxwZXJzW25hbWVdLm1ldGEud2FpdCk7XG4gICAgfVxuXG4gICAgaW52b2tlSW5qZWN0SGVscGVyc0NhbGxiYWNrcyh0aGlzKTtcbiAgfSxcblxuICAvKipcbiAgICBUaGlzIHJlbW92ZXMgYWxsIGhlbHBlcnMgdGhhdCBoYXZlIGJlZW4gcmVnaXN0ZXJlZCwgYW5kIHJlc2V0cyBhbmQgZnVuY3Rpb25zXG4gICAgdGhhdCB3ZXJlIG92ZXJyaWRkZW4gYnkgdGhlIGhlbHBlcnMuXG5cbiAgICBFeGFtcGxlOlxuXG4gICAgYGBgamF2YXNjcmlwdFxuICAgIEFwcC5yZW1vdmVUZXN0SGVscGVycygpO1xuICAgIGBgYFxuXG4gICAgQHB1YmxpY1xuICAgIEBtZXRob2QgcmVtb3ZlVGVzdEhlbHBlcnNcbiAgKi9cbiAgcmVtb3ZlVGVzdEhlbHBlcnMoKSB7XG4gICAgaWYgKCF0aGlzLmhlbHBlckNvbnRhaW5lcikgeyByZXR1cm47IH1cblxuICAgIGZvciAobGV0IG5hbWUgaW4gaGVscGVycykge1xuICAgICAgdGhpcy5oZWxwZXJDb250YWluZXJbbmFtZV0gPSB0aGlzLm9yaWdpbmFsTWV0aG9kc1tuYW1lXTtcbiAgICAgIGRlbGV0ZSBUZXN0UHJvbWlzZS5wcm90b3R5cGVbbmFtZV07XG4gICAgICBkZWxldGUgdGhpcy50ZXN0SGVscGVyc1tuYW1lXTtcbiAgICAgIGRlbGV0ZSB0aGlzLm9yaWdpbmFsTWV0aG9kc1tuYW1lXTtcbiAgICB9XG4gIH1cbn0pO1xuXG4vLyBUaGlzIG1ldGhvZCBpcyBubyBsb25nZXIgbmVlZGVkXG4vLyBCdXQgc3RpbGwgaGVyZSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbi8vIG9mIGhlbHBlciBjaGFpbmluZ1xuZnVuY3Rpb24gcHJvdG9XcmFwKHByb3RvLCBuYW1lLCBjYWxsYmFjaywgaXNBc3luYykge1xuICBwcm90b1tuYW1lXSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICBpZiAoaXNBc3luYykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhlbHBlcihhcHAsIG5hbWUpIHtcbiAgbGV0IGZuID0gaGVscGVyc1tuYW1lXS5tZXRob2Q7XG4gIGxldCBtZXRhID0gaGVscGVyc1tuYW1lXS5tZXRhO1xuICBpZiAoIW1ldGEud2FpdCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4gZm4uYXBwbHkoYXBwLCBbYXBwLCAuLi5hcmdzXSk7XG4gIH1cblxuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBsZXQgbGFzdFByb21pc2UgPSBydW4oKCkgPT4gcmVzb2x2ZShnZXRMYXN0UHJvbWlzZSgpKSk7XG5cbiAgICAvLyB3YWl0IGZvciBsYXN0IGhlbHBlcidzIHByb21pc2UgdG8gcmVzb2x2ZSBhbmQgdGhlblxuICAgIC8vIGV4ZWN1dGUuIFRvIGJlIHNhZmUsIHdlIG5lZWQgdG8gdGVsbCB0aGUgYWRhcHRlciB3ZSdyZSBnb2luZ1xuICAgIC8vIGFzeW5jaHJvbm91cyBoZXJlLCBiZWNhdXNlIGZuIG1heSBub3QgYmUgaW52b2tlZCBiZWZvcmUgd2VcbiAgICAvLyByZXR1cm4uXG4gICAgYXN5bmNTdGFydCgpO1xuICAgIHJldHVybiBsYXN0UHJvbWlzZS50aGVuKCgpID0+IGZuLmFwcGx5KGFwcCwgW2FwcCwgLi4uYXJnc10pKS5maW5hbGx5KGFzeW5jRW5kKTtcbiAgfTtcbn1cbiJdfQ==
enifed('ember-testing/ext/rsvp', ['exports', 'ember-runtime', 'ember-metal', 'ember-testing/test/adapter'], function (exports, _emberRuntime, _emberMetal, _emberTestingTestAdapter) {
  'use strict';

  _emberRuntime.RSVP.configure('async', function (callback, promise) {
    // if schedule will cause autorun, we need to inform adapter
    if (_emberMetal.isTesting() && !_emberMetal.run.backburner.currentInstance) {
      _emberTestingTestAdapter.asyncStart();
      _emberMetal.run.backburner.schedule('actions', function () {
        _emberTestingTestAdapter.asyncEnd();
        callback(promise);
      });
    } else {
      _emberMetal.run.backburner.schedule('actions', function () {
        return callback(promise);
      });
    }
  });

  exports.default = _emberRuntime.RSVP;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvZXh0L3JzdnAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBT0EsZ0JBUFMsSUFBSSxDQU9SLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBUyxRQUFRLEVBQUUsT0FBTyxFQUFFOztBQUVsRCxRQUFJLFlBUlEsU0FBUyxFQVFOLElBQUksQ0FBQyxZQVJiLEdBQUcsQ0FRYyxVQUFVLENBQUMsZUFBZSxFQUFFO0FBQ2xELCtCQVBGLFVBQVUsRUFPSSxDQUFDO0FBQ2Isa0JBVkssR0FBRyxDQVVKLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFlBQU07QUFDdkMsaUNBUkosUUFBUSxFQVFNLENBQUM7QUFDWCxnQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ25CLENBQUMsQ0FBQztLQUNKLE1BQU07QUFDTCxrQkFmSyxHQUFHLENBZUosVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUU7ZUFBTSxRQUFRLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQzdEO0dBQ0YsQ0FBQyxDQUFDOztrQ0FsQk0sSUFBSSIsImZpbGUiOiJlbWJlci10ZXN0aW5nL2V4dC9yc3ZwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUlNWUCB9IGZyb20gJ2VtYmVyLXJ1bnRpbWUnO1xuaW1wb3J0IHsgcnVuLCBpc1Rlc3RpbmcgfSBmcm9tICdlbWJlci1tZXRhbCc7XG5pbXBvcnQge1xuICBhc3luY1N0YXJ0LFxuICBhc3luY0VuZFxufSBmcm9tICcuLi90ZXN0L2FkYXB0ZXInO1xuXG5SU1ZQLmNvbmZpZ3VyZSgnYXN5bmMnLCBmdW5jdGlvbihjYWxsYmFjaywgcHJvbWlzZSkge1xuICAvLyBpZiBzY2hlZHVsZSB3aWxsIGNhdXNlIGF1dG9ydW4sIHdlIG5lZWQgdG8gaW5mb3JtIGFkYXB0ZXJcbiAgaWYgKGlzVGVzdGluZygpICYmICFydW4uYmFja2J1cm5lci5jdXJyZW50SW5zdGFuY2UpIHtcbiAgICBhc3luY1N0YXJ0KCk7XG4gICAgcnVuLmJhY2tidXJuZXIuc2NoZWR1bGUoJ2FjdGlvbnMnLCAoKSA9PiB7XG4gICAgICBhc3luY0VuZCgpO1xuICAgICAgY2FsbGJhY2socHJvbWlzZSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcnVuLmJhY2tidXJuZXIuc2NoZWR1bGUoJ2FjdGlvbnMnLCAoKSA9PiBjYWxsYmFjayhwcm9taXNlKSk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBSU1ZQO1xuIl19
enifed('ember-testing/helpers', ['exports', 'ember-metal', 'ember-testing/test/helpers', 'ember-testing/helpers/and_then', 'ember-testing/helpers/click', 'ember-testing/helpers/current_path', 'ember-testing/helpers/current_route_name', 'ember-testing/helpers/current_url', 'ember-testing/helpers/fill_in', 'ember-testing/helpers/find', 'ember-testing/helpers/find_with_assert', 'ember-testing/helpers/key_event', 'ember-testing/helpers/pause_test', 'ember-testing/helpers/trigger_event', 'ember-testing/helpers/visit', 'ember-testing/helpers/wait'], function (exports, _emberMetal, _emberTestingTestHelpers, _emberTestingHelpersAnd_then, _emberTestingHelpersClick, _emberTestingHelpersCurrent_path, _emberTestingHelpersCurrent_route_name, _emberTestingHelpersCurrent_url, _emberTestingHelpersFill_in, _emberTestingHelpersFind, _emberTestingHelpersFind_with_assert, _emberTestingHelpersKey_event, _emberTestingHelpersPause_test, _emberTestingHelpersTrigger_event, _emberTestingHelpersVisit, _emberTestingHelpersWait) {
  'use strict';

  _emberTestingTestHelpers.registerAsyncHelper('visit', _emberTestingHelpersVisit.default);
  _emberTestingTestHelpers.registerAsyncHelper('click', _emberTestingHelpersClick.default);
  _emberTestingTestHelpers.registerAsyncHelper('keyEvent', _emberTestingHelpersKey_event.default);
  _emberTestingTestHelpers.registerAsyncHelper('fillIn', _emberTestingHelpersFill_in.default);
  _emberTestingTestHelpers.registerAsyncHelper('wait', _emberTestingHelpersWait.default);
  _emberTestingTestHelpers.registerAsyncHelper('andThen', _emberTestingHelpersAnd_then.default);
  _emberTestingTestHelpers.registerAsyncHelper('pauseTest', _emberTestingHelpersPause_test.pauseTest);
  _emberTestingTestHelpers.registerAsyncHelper('triggerEvent', _emberTestingHelpersTrigger_event.default);

  _emberTestingTestHelpers.registerHelper('find', _emberTestingHelpersFind.default);
  _emberTestingTestHelpers.registerHelper('findWithAssert', _emberTestingHelpersFind_with_assert.default);
  _emberTestingTestHelpers.registerHelper('currentRouteName', _emberTestingHelpersCurrent_route_name.default);
  _emberTestingTestHelpers.registerHelper('currentPath', _emberTestingHelpersCurrent_path.default);
  _emberTestingTestHelpers.registerHelper('currentURL', _emberTestingHelpersCurrent_url.default);

  if (false) {
    _emberTestingTestHelpers.registerHelper('resumeTest', _emberTestingHelpersPause_test.resumeTest);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFtQkEsMkJBaEJFLG1CQUFtQixDQWdCVCxPQUFPLG9DQUFRLENBQUM7QUFDNUIsMkJBakJFLG1CQUFtQixDQWlCVCxPQUFPLG9DQUFRLENBQUM7QUFDNUIsMkJBbEJFLG1CQUFtQixDQWtCVCxVQUFVLHdDQUFXLENBQUM7QUFDbEMsMkJBbkJFLG1CQUFtQixDQW1CVCxRQUFRLHNDQUFTLENBQUM7QUFDOUIsMkJBcEJFLG1CQUFtQixDQW9CVCxNQUFNLG1DQUFPLENBQUM7QUFDMUIsMkJBckJFLG1CQUFtQixDQXFCVCxTQUFTLHVDQUFVLENBQUM7QUFDaEMsMkJBdEJFLG1CQUFtQixDQXNCVCxXQUFXLGlDQVhkLFNBQVMsQ0FXaUIsQ0FBQztBQUNwQywyQkF2QkUsbUJBQW1CLENBdUJULGNBQWMsNENBQWUsQ0FBQzs7QUFFMUMsMkJBMUJFLGNBQWMsQ0EwQlQsTUFBTSxtQ0FBTyxDQUFDO0FBQ3JCLDJCQTNCRSxjQUFjLENBMkJULGdCQUFnQiwrQ0FBaUIsQ0FBQztBQUN6QywyQkE1QkUsY0FBYyxDQTRCVCxrQkFBa0IsaURBQW1CLENBQUM7QUFDN0MsMkJBN0JFLGNBQWMsQ0E2QlQsYUFBYSwyQ0FBYyxDQUFDO0FBQ25DLDJCQTlCRSxjQUFjLENBOEJULFlBQVksMENBQWEsQ0FBQzs7QUFFakMsYUFBbUQ7QUFDakQsNkJBakNBLGNBQWMsQ0FpQ1AsWUFBWSxpQ0FyQkQsVUFBVSxDQXFCSSxDQUFDO0dBQ2xDIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzRmVhdHVyZUVuYWJsZWQgfSBmcm9tICdlbWJlci1tZXRhbCc7XG5pbXBvcnQge1xuICByZWdpc3RlckhlbHBlciBhcyBoZWxwZXIsXG4gIHJlZ2lzdGVyQXN5bmNIZWxwZXIgYXMgYXN5bmNIZWxwZXJcbn0gZnJvbSAnLi90ZXN0L2hlbHBlcnMnO1xuaW1wb3J0IGFuZFRoZW4gZnJvbSAnLi9oZWxwZXJzL2FuZF90aGVuJztcbmltcG9ydCBjbGljayBmcm9tICcuL2hlbHBlcnMvY2xpY2snO1xuaW1wb3J0IGN1cnJlbnRQYXRoIGZyb20gJy4vaGVscGVycy9jdXJyZW50X3BhdGgnO1xuaW1wb3J0IGN1cnJlbnRSb3V0ZU5hbWUgZnJvbSAnLi9oZWxwZXJzL2N1cnJlbnRfcm91dGVfbmFtZSc7XG5pbXBvcnQgY3VycmVudFVSTCBmcm9tICcuL2hlbHBlcnMvY3VycmVudF91cmwnO1xuaW1wb3J0IGZpbGxJbiBmcm9tICcuL2hlbHBlcnMvZmlsbF9pbic7XG5pbXBvcnQgZmluZCBmcm9tICcuL2hlbHBlcnMvZmluZCc7XG5pbXBvcnQgZmluZFdpdGhBc3NlcnQgZnJvbSAnLi9oZWxwZXJzL2ZpbmRfd2l0aF9hc3NlcnQnO1xuaW1wb3J0IGtleUV2ZW50IGZyb20gJy4vaGVscGVycy9rZXlfZXZlbnQnO1xuaW1wb3J0IHsgcGF1c2VUZXN0LCByZXN1bWVUZXN0IH0gZnJvbSAnLi9oZWxwZXJzL3BhdXNlX3Rlc3QnO1xuaW1wb3J0IHRyaWdnZXJFdmVudCBmcm9tICcuL2hlbHBlcnMvdHJpZ2dlcl9ldmVudCc7XG5pbXBvcnQgdmlzaXQgZnJvbSAnLi9oZWxwZXJzL3Zpc2l0JztcbmltcG9ydCB3YWl0IGZyb20gJy4vaGVscGVycy93YWl0JztcblxuYXN5bmNIZWxwZXIoJ3Zpc2l0JywgdmlzaXQpO1xuYXN5bmNIZWxwZXIoJ2NsaWNrJywgY2xpY2spO1xuYXN5bmNIZWxwZXIoJ2tleUV2ZW50Jywga2V5RXZlbnQpO1xuYXN5bmNIZWxwZXIoJ2ZpbGxJbicsIGZpbGxJbik7XG5hc3luY0hlbHBlcignd2FpdCcsIHdhaXQpO1xuYXN5bmNIZWxwZXIoJ2FuZFRoZW4nLCBhbmRUaGVuKTtcbmFzeW5jSGVscGVyKCdwYXVzZVRlc3QnLCBwYXVzZVRlc3QpO1xuYXN5bmNIZWxwZXIoJ3RyaWdnZXJFdmVudCcsIHRyaWdnZXJFdmVudCk7XG5cbmhlbHBlcignZmluZCcsIGZpbmQpO1xuaGVscGVyKCdmaW5kV2l0aEFzc2VydCcsIGZpbmRXaXRoQXNzZXJ0KTtcbmhlbHBlcignY3VycmVudFJvdXRlTmFtZScsIGN1cnJlbnRSb3V0ZU5hbWUpO1xuaGVscGVyKCdjdXJyZW50UGF0aCcsIGN1cnJlbnRQYXRoKTtcbmhlbHBlcignY3VycmVudFVSTCcsIGN1cnJlbnRVUkwpO1xuXG5pZiAoaXNGZWF0dXJlRW5hYmxlZCgnZW1iZXItdGVzdGluZy1yZXN1bWUtdGVzdCcpKSB7XG4gIGhlbHBlcigncmVzdW1lVGVzdCcsIHJlc3VtZVRlc3QpO1xufVxuIl19
enifed("ember-testing/helpers/and_then", ["exports"], function (exports) {
  /**
  @module ember
  @submodule ember-testing
  */
  "use strict";

  exports.default = andThen;

  function andThen(app, callback) {
    return app.testHelpers.wait(callback(app));
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9hbmRfdGhlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O29CQUl3QixPQUFPOztBQUFoQixXQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFO0FBQzdDLFdBQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDNUMiLCJmaWxlIjoiZW1iZXItdGVzdGluZy9oZWxwZXJzL2FuZF90aGVuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5AbW9kdWxlIGVtYmVyXG5Ac3VibW9kdWxlIGVtYmVyLXRlc3RpbmdcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhbmRUaGVuKGFwcCwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGFwcC50ZXN0SGVscGVycy53YWl0KGNhbGxiYWNrKGFwcCkpO1xufVxuIl19
enifed('ember-testing/helpers/click', ['exports', 'ember-testing/events'], function (exports, _emberTestingEvents) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = click;

  /**
    Clicks an element and triggers any actions triggered by the element's `click`
    event.
  
    Example:
  
    ```javascript
    click('.some-jQuery-selector').then(function() {
      // assert something
    });
    ```
  
    @method click
    @param {String} selector jQuery selector for finding element on the DOM
    @param {Object} context A DOM Element, Document, or jQuery to use as context
    @return {RSVP.Promise}
    @public
  */

  function click(app, selector, context) {
    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    _emberTestingEvents.fireEvent(el, 'mousedown');

    _emberTestingEvents.focus(el);

    _emberTestingEvents.fireEvent(el, 'mouseup');
    _emberTestingEvents.fireEvent(el, 'click');

    return app.testHelpers.wait();
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9jbGljay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O29CQXdCd0IsS0FBSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQWQsV0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDcEQsUUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzVELFFBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFaEIsd0JBeEJjLFNBQVMsQ0F3QmIsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDOztBQUUzQix3QkExQk8sS0FBSyxDQTBCTixFQUFFLENBQUMsQ0FBQzs7QUFFVix3QkE1QmMsU0FBUyxDQTRCYixFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDekIsd0JBN0JjLFNBQVMsQ0E2QmIsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUV2QixXQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDL0IiLCJmaWxlIjoiZW1iZXItdGVzdGluZy9oZWxwZXJzL2NsaWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5AbW9kdWxlIGVtYmVyXG5Ac3VibW9kdWxlIGVtYmVyLXRlc3RpbmdcbiovXG5pbXBvcnQgeyBmb2N1cywgZmlyZUV2ZW50IH0gZnJvbSAnLi4vZXZlbnRzJztcblxuLyoqXG4gIENsaWNrcyBhbiBlbGVtZW50IGFuZCB0cmlnZ2VycyBhbnkgYWN0aW9ucyB0cmlnZ2VyZWQgYnkgdGhlIGVsZW1lbnQncyBgY2xpY2tgXG4gIGV2ZW50LlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBjbGljaygnLnNvbWUtalF1ZXJ5LXNlbGVjdG9yJykudGhlbihmdW5jdGlvbigpIHtcbiAgICAvLyBhc3NlcnQgc29tZXRoaW5nXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIGNsaWNrXG4gIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBqUXVlcnkgc2VsZWN0b3IgZm9yIGZpbmRpbmcgZWxlbWVudCBvbiB0aGUgRE9NXG4gIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IEEgRE9NIEVsZW1lbnQsIERvY3VtZW50LCBvciBqUXVlcnkgdG8gdXNlIGFzIGNvbnRleHRcbiAgQHJldHVybiB7UlNWUC5Qcm9taXNlfVxuICBAcHVibGljXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2xpY2soYXBwLCBzZWxlY3RvciwgY29udGV4dCkge1xuICBsZXQgJGVsID0gYXBwLnRlc3RIZWxwZXJzLmZpbmRXaXRoQXNzZXJ0KHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgbGV0IGVsID0gJGVsWzBdO1xuXG4gIGZpcmVFdmVudChlbCwgJ21vdXNlZG93bicpO1xuXG4gIGZvY3VzKGVsKTtcblxuICBmaXJlRXZlbnQoZWwsICdtb3VzZXVwJyk7XG4gIGZpcmVFdmVudChlbCwgJ2NsaWNrJyk7XG5cbiAgcmV0dXJuIGFwcC50ZXN0SGVscGVycy53YWl0KCk7XG59XG4iXX0=
enifed('ember-testing/helpers/current_path', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = currentPath;

  /**
    Returns the current path.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentPath(), 'some.path.index', "correct path was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentPath
  @return {Object} The currently active path.
  @since 1.5.0
  @public
  */

  function currentPath(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return _emberMetal.get(routingService, 'currentPath');
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9jdXJyZW50X3BhdGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztvQkF3QndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFwQixXQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDdkMsUUFBSSxjQUFjLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNsRSxXQUFPLFlBdEJBLEdBQUcsQ0FzQkMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0dBQzNDIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvaGVscGVycy9jdXJyZW50X3BhdGguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbkBtb2R1bGUgZW1iZXJcbkBzdWJtb2R1bGUgZW1iZXItdGVzdGluZ1xuKi9cbmltcG9ydCB7IGdldCB9IGZyb20gJ2VtYmVyLW1ldGFsJztcblxuLyoqXG4gIFJldHVybnMgdGhlIGN1cnJlbnQgcGF0aC5cblxuRXhhbXBsZTpcblxuYGBgamF2YXNjcmlwdFxuZnVuY3Rpb24gdmFsaWRhdGVVUkwoKSB7XG4gIGVxdWFsKGN1cnJlbnRQYXRoKCksICdzb21lLnBhdGguaW5kZXgnLCBcImNvcnJlY3QgcGF0aCB3YXMgdHJhbnNpdGlvbmVkIGludG8uXCIpO1xufVxuXG5jbGljaygnI3NvbWUtbGluay1pZCcpLnRoZW4odmFsaWRhdGVVUkwpO1xuYGBgXG5cbkBtZXRob2QgY3VycmVudFBhdGhcbkByZXR1cm4ge09iamVjdH0gVGhlIGN1cnJlbnRseSBhY3RpdmUgcGF0aC5cbkBzaW5jZSAxLjUuMFxuQHB1YmxpY1xuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGN1cnJlbnRQYXRoKGFwcCkge1xuICBsZXQgcm91dGluZ1NlcnZpY2UgPSBhcHAuX19jb250YWluZXJfXy5sb29rdXAoJ3NlcnZpY2U6LXJvdXRpbmcnKTtcbiAgcmV0dXJuIGdldChyb3V0aW5nU2VydmljZSwgJ2N1cnJlbnRQYXRoJyk7XG59XG4iXX0=
enifed('ember-testing/helpers/current_route_name', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = currentRouteName;

  /**
    Returns the currently active route name.
  Example:
  ```javascript
  function validateRouteName() {
    equal(currentRouteName(), 'some.path', "correct route was transitioned into.");
  }
  visit('/some/path').then(validateRouteName)
  ```
  @method currentRouteName
  @return {Object} The name of the currently active route.
  @since 1.5.0
  @public
  */

  function currentRouteName(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return _emberMetal.get(routingService, 'currentRouteName');
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9jdXJyZW50X3JvdXRlX25hbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztvQkFtQndCLGdCQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBekIsV0FBUyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7QUFDNUMsUUFBSSxjQUFjLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNsRSxXQUFPLFlBakJBLEdBQUcsQ0FpQkMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7R0FDaEQiLCJmaWxlIjoiZW1iZXItdGVzdGluZy9oZWxwZXJzL2N1cnJlbnRfcm91dGVfbmFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuQG1vZHVsZSBlbWJlclxuQHN1Ym1vZHVsZSBlbWJlci10ZXN0aW5nXG4qL1xuaW1wb3J0IHsgZ2V0IH0gZnJvbSAnZW1iZXItbWV0YWwnO1xuLyoqXG4gIFJldHVybnMgdGhlIGN1cnJlbnRseSBhY3RpdmUgcm91dGUgbmFtZS5cbkV4YW1wbGU6XG5gYGBqYXZhc2NyaXB0XG5mdW5jdGlvbiB2YWxpZGF0ZVJvdXRlTmFtZSgpIHtcbiAgZXF1YWwoY3VycmVudFJvdXRlTmFtZSgpLCAnc29tZS5wYXRoJywgXCJjb3JyZWN0IHJvdXRlIHdhcyB0cmFuc2l0aW9uZWQgaW50by5cIik7XG59XG52aXNpdCgnL3NvbWUvcGF0aCcpLnRoZW4odmFsaWRhdGVSb3V0ZU5hbWUpXG5gYGBcbkBtZXRob2QgY3VycmVudFJvdXRlTmFtZVxuQHJldHVybiB7T2JqZWN0fSBUaGUgbmFtZSBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSByb3V0ZS5cbkBzaW5jZSAxLjUuMFxuQHB1YmxpY1xuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGN1cnJlbnRSb3V0ZU5hbWUoYXBwKSB7XG4gIGxldCByb3V0aW5nU2VydmljZSA9IGFwcC5fX2NvbnRhaW5lcl9fLmxvb2t1cCgnc2VydmljZTotcm91dGluZycpO1xuICByZXR1cm4gZ2V0KHJvdXRpbmdTZXJ2aWNlLCAnY3VycmVudFJvdXRlTmFtZScpO1xufVxuIl19
enifed('ember-testing/helpers/current_url', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = currentURL;

  /**
    Returns the current URL.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentURL(), '/some/path', "correct URL was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentURL
  @return {Object} The currently active URL.
  @since 1.5.0
  @public
  */

  function currentURL(app) {
    var router = app.__container__.lookup('router:main');
    return _emberMetal.get(router, 'location').getURL();
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9jdXJyZW50X3VybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O29CQXdCd0IsVUFBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQW5CLFdBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRTtBQUN0QyxRQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyRCxXQUFPLFlBdEJBLEdBQUcsQ0FzQkMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQ3pDIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvaGVscGVycy9jdXJyZW50X3VybC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuQG1vZHVsZSBlbWJlclxuQHN1Ym1vZHVsZSBlbWJlci10ZXN0aW5nXG4qL1xuaW1wb3J0IHsgZ2V0IH0gZnJvbSAnZW1iZXItbWV0YWwnO1xuXG4vKipcbiAgUmV0dXJucyB0aGUgY3VycmVudCBVUkwuXG5cbkV4YW1wbGU6XG5cbmBgYGphdmFzY3JpcHRcbmZ1bmN0aW9uIHZhbGlkYXRlVVJMKCkge1xuICBlcXVhbChjdXJyZW50VVJMKCksICcvc29tZS9wYXRoJywgXCJjb3JyZWN0IFVSTCB3YXMgdHJhbnNpdGlvbmVkIGludG8uXCIpO1xufVxuXG5jbGljaygnI3NvbWUtbGluay1pZCcpLnRoZW4odmFsaWRhdGVVUkwpO1xuYGBgXG5cbkBtZXRob2QgY3VycmVudFVSTFxuQHJldHVybiB7T2JqZWN0fSBUaGUgY3VycmVudGx5IGFjdGl2ZSBVUkwuXG5Ac2luY2UgMS41LjBcbkBwdWJsaWNcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjdXJyZW50VVJMKGFwcCkge1xuICBsZXQgcm91dGVyID0gYXBwLl9fY29udGFpbmVyX18ubG9va3VwKCdyb3V0ZXI6bWFpbicpO1xuICByZXR1cm4gZ2V0KHJvdXRlciwgJ2xvY2F0aW9uJykuZ2V0VVJMKCk7XG59XG4iXX0=
enifed('ember-testing/helpers/fill_in', ['exports', 'ember-testing/events'], function (exports, _emberTestingEvents) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = fillIn;

  /**
    Fills in an input element with some text.
  
    Example:
  
    ```javascript
    fillIn('#email', 'you@example.com').then(function() {
      // assert something
    });
    ```
  
    @method fillIn
    @param {String} selector jQuery selector finding an input element on the DOM
    to fill text with
    @param {String} text text to place inside the input element
    @return {RSVP.Promise}
    @public
  */

  function fillIn(app, selector, contextOrText, text) {
    var $el = undefined,
        el = undefined,
        context = undefined;
    if (typeof text === 'undefined') {
      text = contextOrText;
    } else {
      context = contextOrText;
    }
    $el = app.testHelpers.findWithAssert(selector, context);
    el = $el[0];
    _emberTestingEvents.focus(el);

    $el.eq(0).val(text);
    _emberTestingEvents.fireEvent(el, 'input');
    _emberTestingEvents.fireEvent(el, 'change');

    return app.testHelpers.wait();
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9maWxsX2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7b0JBd0J3QixNQUFNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBZixXQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUU7QUFDakUsUUFBSSxHQUFHLFlBQUE7UUFBRSxFQUFFLFlBQUE7UUFBRSxPQUFPLFlBQUEsQ0FBQztBQUNyQixRQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRTtBQUMvQixVQUFJLEdBQUcsYUFBYSxDQUFDO0tBQ3RCLE1BQU07QUFDTCxhQUFPLEdBQUcsYUFBYSxDQUFDO0tBQ3pCO0FBQ0QsT0FBRyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN4RCxNQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1osd0JBN0JPLEtBQUssQ0E2Qk4sRUFBRSxDQUFDLENBQUM7O0FBRVYsT0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsd0JBaENjLFNBQVMsQ0FnQ2IsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZCLHdCQWpDYyxTQUFTLENBaUNiLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFeEIsV0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0dBQy9CIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvaGVscGVycy9maWxsX2luLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5AbW9kdWxlIGVtYmVyXG5Ac3VibW9kdWxlIGVtYmVyLXRlc3RpbmdcbiovXG5pbXBvcnQgeyBmb2N1cywgZmlyZUV2ZW50IH0gZnJvbSAnLi4vZXZlbnRzJztcblxuLyoqXG4gIEZpbGxzIGluIGFuIGlucHV0IGVsZW1lbnQgd2l0aCBzb21lIHRleHQuXG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGZpbGxJbignI2VtYWlsJywgJ3lvdUBleGFtcGxlLmNvbScpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgLy8gYXNzZXJ0IHNvbWV0aGluZ1xuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCBmaWxsSW5cbiAgQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIGpRdWVyeSBzZWxlY3RvciBmaW5kaW5nIGFuIGlucHV0IGVsZW1lbnQgb24gdGhlIERPTVxuICB0byBmaWxsIHRleHQgd2l0aFxuICBAcGFyYW0ge1N0cmluZ30gdGV4dCB0ZXh0IHRvIHBsYWNlIGluc2lkZSB0aGUgaW5wdXQgZWxlbWVudFxuICBAcmV0dXJuIHtSU1ZQLlByb21pc2V9XG4gIEBwdWJsaWNcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaWxsSW4oYXBwLCBzZWxlY3RvciwgY29udGV4dE9yVGV4dCwgdGV4dCkge1xuICBsZXQgJGVsLCBlbCwgY29udGV4dDtcbiAgaWYgKHR5cGVvZiB0ZXh0ID09PSAndW5kZWZpbmVkJykge1xuICAgIHRleHQgPSBjb250ZXh0T3JUZXh0O1xuICB9IGVsc2Uge1xuICAgIGNvbnRleHQgPSBjb250ZXh0T3JUZXh0O1xuICB9XG4gICRlbCA9IGFwcC50ZXN0SGVscGVycy5maW5kV2l0aEFzc2VydChzZWxlY3RvciwgY29udGV4dCk7XG4gIGVsID0gJGVsWzBdO1xuICBmb2N1cyhlbCk7XG5cbiAgJGVsLmVxKDApLnZhbCh0ZXh0KTtcbiAgZmlyZUV2ZW50KGVsLCAnaW5wdXQnKTtcbiAgZmlyZUV2ZW50KGVsLCAnY2hhbmdlJyk7XG5cbiAgcmV0dXJuIGFwcC50ZXN0SGVscGVycy53YWl0KCk7XG59XG4iXX0=
enifed('ember-testing/helpers/find', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = find;

  /**
    Finds an element in the context of the app's container element. A simple alias
    for `app.$(selector)`.
  
    Example:
  
    ```javascript
    var $el = find('.my-selector');
    ```
  
    With the `context` param:
  
    ```javascript
    var $el = find('.my-selector', '.parent-element-class');
    ```
  
    @method find
    @param {String} selector jQuery string selector for element lookup
    @param {String} [context] (optional) jQuery selector that will limit the selector
                              argument to find only within the context's children
    @return {Object} jQuery object representing the results of the query
    @public
  */

  function find(app, selector, context) {
    var $el = undefined;
    context = context || _emberMetal.get(app, 'rootElement');
    $el = app.$(selector, context);
    return $el;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9maW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7b0JBNkJ3QixJQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFiLFdBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO0FBQ25ELFFBQUksR0FBRyxZQUFBLENBQUM7QUFDUixXQUFPLEdBQUcsT0FBTyxJQUFJLFlBM0JkLEdBQUcsQ0EyQmUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQzdDLE9BQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMvQixXQUFPLEdBQUcsQ0FBQztHQUNaIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvaGVscGVycy9maW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5AbW9kdWxlIGVtYmVyXG5Ac3VibW9kdWxlIGVtYmVyLXRlc3RpbmdcbiovXG5pbXBvcnQgeyBnZXQgfSBmcm9tICdlbWJlci1tZXRhbCc7XG5cbi8qKlxuICBGaW5kcyBhbiBlbGVtZW50IGluIHRoZSBjb250ZXh0IG9mIHRoZSBhcHAncyBjb250YWluZXIgZWxlbWVudC4gQSBzaW1wbGUgYWxpYXNcbiAgZm9yIGBhcHAuJChzZWxlY3RvcilgLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICB2YXIgJGVsID0gZmluZCgnLm15LXNlbGVjdG9yJyk7XG4gIGBgYFxuXG4gIFdpdGggdGhlIGBjb250ZXh0YCBwYXJhbTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIHZhciAkZWwgPSBmaW5kKCcubXktc2VsZWN0b3InLCAnLnBhcmVudC1lbGVtZW50LWNsYXNzJyk7XG4gIGBgYFxuXG4gIEBtZXRob2QgZmluZFxuICBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgalF1ZXJ5IHN0cmluZyBzZWxlY3RvciBmb3IgZWxlbWVudCBsb29rdXBcbiAgQHBhcmFtIHtTdHJpbmd9IFtjb250ZXh0XSAob3B0aW9uYWwpIGpRdWVyeSBzZWxlY3RvciB0aGF0IHdpbGwgbGltaXQgdGhlIHNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJndW1lbnQgdG8gZmluZCBvbmx5IHdpdGhpbiB0aGUgY29udGV4dCdzIGNoaWxkcmVuXG4gIEByZXR1cm4ge09iamVjdH0galF1ZXJ5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHJlc3VsdHMgb2YgdGhlIHF1ZXJ5XG4gIEBwdWJsaWNcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5kKGFwcCwgc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgbGV0ICRlbDtcbiAgY29udGV4dCA9IGNvbnRleHQgfHwgZ2V0KGFwcCwgJ3Jvb3RFbGVtZW50Jyk7XG4gICRlbCA9IGFwcC4kKHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgcmV0dXJuICRlbDtcbn1cbiJdfQ==
enifed('ember-testing/helpers/find_with_assert', ['exports'], function (exports) {
  /**
  @module ember
  @submodule ember-testing
  */
  /**
    Like `find`, but throws an error if the element selector returns no results.
  
    Example:
  
    ```javascript
    var $el = findWithAssert('.doesnt-exist'); // throws error
    ```
  
    With the `context` param:
  
    ```javascript
    var $el = findWithAssert('.selector-id', '.parent-element-class'); // assert will pass
    ```
  
    @method findWithAssert
    @param {String} selector jQuery selector string for finding an element within
    the DOM
    @param {String} [context] (optional) jQuery selector that will limit the
    selector argument to find only within the context's children
    @return {Object} jQuery object representing the results of the query
    @throws {Error} throws error if jQuery object returned has a length of 0
    @public
  */
  'use strict';

  exports.default = findWithAssert;

  function findWithAssert(app, selector, context) {
    var $el = app.testHelpers.find(selector, context);
    if ($el.length === 0) {
      throw new Error('Element ' + selector + ' not found.');
    }
    return $el;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9maW5kX3dpdGhfYXNzZXJ0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBNEJ3QixjQUFjOztBQUF2QixXQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtBQUM3RCxRQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbEQsUUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNwQixZQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLEdBQUcsYUFBYSxDQUFDLENBQUM7S0FDeEQ7QUFDRCxXQUFPLEdBQUcsQ0FBQztHQUNaIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvaGVscGVycy9maW5kX3dpdGhfYXNzZXJ0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5AbW9kdWxlIGVtYmVyXG5Ac3VibW9kdWxlIGVtYmVyLXRlc3RpbmdcbiovXG4vKipcbiAgTGlrZSBgZmluZGAsIGJ1dCB0aHJvd3MgYW4gZXJyb3IgaWYgdGhlIGVsZW1lbnQgc2VsZWN0b3IgcmV0dXJucyBubyByZXN1bHRzLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICB2YXIgJGVsID0gZmluZFdpdGhBc3NlcnQoJy5kb2VzbnQtZXhpc3QnKTsgLy8gdGhyb3dzIGVycm9yXG4gIGBgYFxuXG4gIFdpdGggdGhlIGBjb250ZXh0YCBwYXJhbTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIHZhciAkZWwgPSBmaW5kV2l0aEFzc2VydCgnLnNlbGVjdG9yLWlkJywgJy5wYXJlbnQtZWxlbWVudC1jbGFzcycpOyAvLyBhc3NlcnQgd2lsbCBwYXNzXG4gIGBgYFxuXG4gIEBtZXRob2QgZmluZFdpdGhBc3NlcnRcbiAgQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIGpRdWVyeSBzZWxlY3RvciBzdHJpbmcgZm9yIGZpbmRpbmcgYW4gZWxlbWVudCB3aXRoaW5cbiAgdGhlIERPTVxuICBAcGFyYW0ge1N0cmluZ30gW2NvbnRleHRdIChvcHRpb25hbCkgalF1ZXJ5IHNlbGVjdG9yIHRoYXQgd2lsbCBsaW1pdCB0aGVcbiAgc2VsZWN0b3IgYXJndW1lbnQgdG8gZmluZCBvbmx5IHdpdGhpbiB0aGUgY29udGV4dCdzIGNoaWxkcmVuXG4gIEByZXR1cm4ge09iamVjdH0galF1ZXJ5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHJlc3VsdHMgb2YgdGhlIHF1ZXJ5XG4gIEB0aHJvd3Mge0Vycm9yfSB0aHJvd3MgZXJyb3IgaWYgalF1ZXJ5IG9iamVjdCByZXR1cm5lZCBoYXMgYSBsZW5ndGggb2YgMFxuICBAcHVibGljXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZFdpdGhBc3NlcnQoYXBwLCBzZWxlY3RvciwgY29udGV4dCkge1xuICBsZXQgJGVsID0gYXBwLnRlc3RIZWxwZXJzLmZpbmQoc2VsZWN0b3IsIGNvbnRleHQpO1xuICBpZiAoJGVsLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRWxlbWVudCAnICsgc2VsZWN0b3IgKyAnIG5vdCBmb3VuZC4nKTtcbiAgfVxuICByZXR1cm4gJGVsO1xufVxuIl19
enifed('ember-testing/helpers/key_event', ['exports'], function (exports) {
  /**
  @module ember
  @submodule ember-testing
  */
  /**
    Simulates a key event, e.g. `keypress`, `keydown`, `keyup` with the desired keyCode
    Example:
    ```javascript
    keyEvent('.some-jQuery-selector', 'keypress', 13).then(function() {
     // assert something
    });
    ```
    @method keyEvent
    @param {String} selector jQuery selector for finding element on the DOM
    @param {String} type the type of key event, e.g. `keypress`, `keydown`, `keyup`
    @param {Number} keyCode the keyCode of the simulated key event
    @return {RSVP.Promise}
    @since 1.5.0
    @public
  */
  'use strict';

  exports.default = keyEvent;

  function keyEvent(app, selector, contextOrType, typeOrKeyCode, keyCode) {
    var context = undefined,
        type = undefined;

    if (typeof keyCode === 'undefined') {
      context = null;
      keyCode = typeOrKeyCode;
      type = contextOrType;
    } else {
      context = contextOrType;
      type = typeOrKeyCode;
    }

    return app.testHelpers.triggerEvent(selector, context, type, { keyCode: keyCode, which: keyCode });
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9rZXlfZXZlbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBb0J3QixRQUFROztBQUFqQixXQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFO0FBQ3JGLFFBQUksT0FBTyxZQUFBO1FBQUUsSUFBSSxZQUFBLENBQUM7O0FBRWxCLFFBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxFQUFFO0FBQ2xDLGFBQU8sR0FBRyxJQUFJLENBQUM7QUFDZixhQUFPLEdBQUcsYUFBYSxDQUFDO0FBQ3hCLFVBQUksR0FBRyxhQUFhLENBQUM7S0FDdEIsTUFBTTtBQUNMLGFBQU8sR0FBRyxhQUFhLENBQUM7QUFDeEIsVUFBSSxHQUFHLGFBQWEsQ0FBQztLQUN0Qjs7QUFFRCxXQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztHQUNwRyIsImZpbGUiOiJlbWJlci10ZXN0aW5nL2hlbHBlcnMva2V5X2V2ZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5AbW9kdWxlIGVtYmVyXG5Ac3VibW9kdWxlIGVtYmVyLXRlc3RpbmdcbiovXG4vKipcbiAgU2ltdWxhdGVzIGEga2V5IGV2ZW50LCBlLmcuIGBrZXlwcmVzc2AsIGBrZXlkb3duYCwgYGtleXVwYCB3aXRoIHRoZSBkZXNpcmVkIGtleUNvZGVcbiAgRXhhbXBsZTpcbiAgYGBgamF2YXNjcmlwdFxuICBrZXlFdmVudCgnLnNvbWUtalF1ZXJ5LXNlbGVjdG9yJywgJ2tleXByZXNzJywgMTMpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAvLyBhc3NlcnQgc29tZXRoaW5nXG4gIH0pO1xuICBgYGBcbiAgQG1ldGhvZCBrZXlFdmVudFxuICBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgalF1ZXJ5IHNlbGVjdG9yIGZvciBmaW5kaW5nIGVsZW1lbnQgb24gdGhlIERPTVxuICBAcGFyYW0ge1N0cmluZ30gdHlwZSB0aGUgdHlwZSBvZiBrZXkgZXZlbnQsIGUuZy4gYGtleXByZXNzYCwgYGtleWRvd25gLCBga2V5dXBgXG4gIEBwYXJhbSB7TnVtYmVyfSBrZXlDb2RlIHRoZSBrZXlDb2RlIG9mIHRoZSBzaW11bGF0ZWQga2V5IGV2ZW50XG4gIEByZXR1cm4ge1JTVlAuUHJvbWlzZX1cbiAgQHNpbmNlIDEuNS4wXG4gIEBwdWJsaWNcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBrZXlFdmVudChhcHAsIHNlbGVjdG9yLCBjb250ZXh0T3JUeXBlLCB0eXBlT3JLZXlDb2RlLCBrZXlDb2RlKSB7XG4gIGxldCBjb250ZXh0LCB0eXBlO1xuXG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjb250ZXh0ID0gbnVsbDtcbiAgICBrZXlDb2RlID0gdHlwZU9yS2V5Q29kZTtcbiAgICB0eXBlID0gY29udGV4dE9yVHlwZTtcbiAgfSBlbHNlIHtcbiAgICBjb250ZXh0ID0gY29udGV4dE9yVHlwZTtcbiAgICB0eXBlID0gdHlwZU9yS2V5Q29kZTtcbiAgfVxuXG4gIHJldHVybiBhcHAudGVzdEhlbHBlcnMudHJpZ2dlckV2ZW50KHNlbGVjdG9yLCBjb250ZXh0LCB0eXBlLCB7IGtleUNvZGU6IGtleUNvZGUsIHdoaWNoOiBrZXlDb2RlIH0pO1xufVxuIl19
enifed('ember-testing/helpers/pause_test', ['exports', 'ember-runtime', 'ember-console', 'ember-metal'], function (exports, _emberRuntime, _emberConsole, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.resumeTest = resumeTest;
  exports.pauseTest = pauseTest;

  var resume = undefined;

  /**
   Resumes a test paused by `pauseTest`.
  
   @method resumeTest
   @return {void}
   @public
  */

  function resumeTest() {
    _emberMetal.assert('Testing has not been paused. There is nothing to resume.', resume);
    resume();
    resume = undefined;
  }

  /**
   Pauses the current test - this is useful for debugging while testing or for test-driving.
   It allows you to inspect the state of your application at any point.
   Example (The test will pause before clicking the button):
  
   ```javascript
   visit('/')
   return pauseTest();
   click('.btn');
   ```
   @since 1.9.0
   @method pauseTest
   @return {Object} A promise that will never resolve
   @public
  */

  function pauseTest() {
    if (false) {
      _emberConsole.default.info('Testing paused. Use `resumeTest()` to continue.');
    }

    return new _emberRuntime.RSVP.Promise(function (resolve) {
      if (false) {
        resume = resolve;
      }
    }, 'TestAdapter paused promise');
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy9wYXVzZV90ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxNQUFJLE1BQU0sWUFBQSxDQUFDOzs7Ozs7Ozs7O0FBU0osV0FBUyxVQUFVLEdBQUc7QUFDM0IsZ0JBZEEsTUFBTSxDQWNDLDBEQUEwRCxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNFLFVBQU0sRUFBRSxDQUFDO0FBQ1QsVUFBTSxHQUFHLFNBQVMsQ0FBQztHQUNwQjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJNLFdBQVMsU0FBUyxHQUFHO0FBQzFCLGVBQW1EO0FBQ2pELDRCQUFPLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO0tBQ2hFOztBQUVELFdBQU8sSUFBSSxjQTFDSixJQUFJLENBMENLLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBSztBQUNuQyxpQkFBbUQ7QUFDakQsY0FBTSxHQUFHLE9BQU8sQ0FBQztPQUNsQjtLQUNGLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztHQUNsQyIsImZpbGUiOiJlbWJlci10ZXN0aW5nL2hlbHBlcnMvcGF1c2VfdGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuQG1vZHVsZSBlbWJlclxuQHN1Ym1vZHVsZSBlbWJlci10ZXN0aW5nXG4qL1xuaW1wb3J0IHsgUlNWUCB9IGZyb20gJ2VtYmVyLXJ1bnRpbWUnO1xuaW1wb3J0IExvZ2dlciBmcm9tICdlbWJlci1jb25zb2xlJztcbmltcG9ydCB7XG4gIGFzc2VydCxcbiAgaXNGZWF0dXJlRW5hYmxlZFxufSBmcm9tICdlbWJlci1tZXRhbCc7XG5cbmxldCByZXN1bWU7XG5cbi8qKlxuIFJlc3VtZXMgYSB0ZXN0IHBhdXNlZCBieSBgcGF1c2VUZXN0YC5cblxuIEBtZXRob2QgcmVzdW1lVGVzdFxuIEByZXR1cm4ge3ZvaWR9XG4gQHB1YmxpY1xuKi9cbmV4cG9ydCBmdW5jdGlvbiByZXN1bWVUZXN0KCkge1xuICBhc3NlcnQoJ1Rlc3RpbmcgaGFzIG5vdCBiZWVuIHBhdXNlZC4gVGhlcmUgaXMgbm90aGluZyB0byByZXN1bWUuJywgcmVzdW1lKTtcbiAgcmVzdW1lKCk7XG4gIHJlc3VtZSA9IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gUGF1c2VzIHRoZSBjdXJyZW50IHRlc3QgLSB0aGlzIGlzIHVzZWZ1bCBmb3IgZGVidWdnaW5nIHdoaWxlIHRlc3Rpbmcgb3IgZm9yIHRlc3QtZHJpdmluZy5cbiBJdCBhbGxvd3MgeW91IHRvIGluc3BlY3QgdGhlIHN0YXRlIG9mIHlvdXIgYXBwbGljYXRpb24gYXQgYW55IHBvaW50LlxuIEV4YW1wbGUgKFRoZSB0ZXN0IHdpbGwgcGF1c2UgYmVmb3JlIGNsaWNraW5nIHRoZSBidXR0b24pOlxuXG4gYGBgamF2YXNjcmlwdFxuIHZpc2l0KCcvJylcbiByZXR1cm4gcGF1c2VUZXN0KCk7XG4gY2xpY2soJy5idG4nKTtcbiBgYGBcbiBAc2luY2UgMS45LjBcbiBAbWV0aG9kIHBhdXNlVGVzdFxuIEByZXR1cm4ge09iamVjdH0gQSBwcm9taXNlIHRoYXQgd2lsbCBuZXZlciByZXNvbHZlXG4gQHB1YmxpY1xuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXVzZVRlc3QoKSB7XG4gIGlmIChpc0ZlYXR1cmVFbmFibGVkKCdlbWJlci10ZXN0aW5nLXJlc3VtZS10ZXN0JykpIHtcbiAgICBMb2dnZXIuaW5mbygnVGVzdGluZyBwYXVzZWQuIFVzZSBgcmVzdW1lVGVzdCgpYCB0byBjb250aW51ZS4nKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUlNWUC5Qcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgaWYgKGlzRmVhdHVyZUVuYWJsZWQoJ2VtYmVyLXRlc3RpbmctcmVzdW1lLXRlc3QnKSkge1xuICAgICAgcmVzdW1lID0gcmVzb2x2ZTtcbiAgICB9XG4gIH0sICdUZXN0QWRhcHRlciBwYXVzZWQgcHJvbWlzZScpO1xufVxuIl19
enifed('ember-testing/helpers/trigger_event', ['exports', 'ember-testing/events'], function (exports, _emberTestingEvents) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = triggerEvent;

  /**
    Triggers the given DOM event on the element identified by the provided selector.
    Example:
    ```javascript
    triggerEvent('#some-elem-id', 'blur');
    ```
    This is actually used internally by the `keyEvent` helper like so:
    ```javascript
    triggerEvent('#some-elem-id', 'keypress', { keyCode: 13 });
    ```
   @method triggerEvent
   @param {String} selector jQuery selector for finding element on the DOM
   @param {String} [context] jQuery selector that will limit the selector
                             argument to find only within the context's children
   @param {String} type The event type to be triggered.
   @param {Object} [options] The options to be passed to jQuery.Event.
   @return {RSVP.Promise}
   @since 1.5.0
   @public
  */

  function triggerEvent(app, selector, contextOrType, typeOrOptions, possibleOptions) {
    var arity = arguments.length;
    var context = undefined,
        type = undefined,
        options = undefined;

    if (arity === 3) {
      // context and options are optional, so this is
      // app, selector, type
      context = null;
      type = contextOrType;
      options = {};
    } else if (arity === 4) {
      // context and options are optional, so this is
      if (typeof typeOrOptions === 'object') {
        // either
        // app, selector, type, options
        context = null;
        type = contextOrType;
        options = typeOrOptions;
      } else {
        // or
        // app, selector, context, type
        context = contextOrType;
        type = typeOrOptions;
        options = {};
      }
    } else {
      context = contextOrType;
      type = typeOrOptions;
      options = possibleOptions;
    }

    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    _emberTestingEvents.fireEvent(el, type, options);

    return app.testHelpers.wait();
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy90cmlnZ2VyX2V2ZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7b0JBeUJ3QixZQUFZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFyQixXQUFTLFlBQVksQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFO0FBQ2pHLFFBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDN0IsUUFBSSxPQUFPLFlBQUE7UUFBRSxJQUFJLFlBQUE7UUFBRSxPQUFPLFlBQUEsQ0FBQzs7QUFFM0IsUUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFOzs7QUFHZixhQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ2YsVUFBSSxHQUFHLGFBQWEsQ0FBQztBQUNyQixhQUFPLEdBQUcsRUFBRSxDQUFDO0tBQ2QsTUFBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7O0FBRXRCLFVBQUksT0FBTyxhQUFhLEtBQUssUUFBUSxFQUFFOzs7QUFFckMsZUFBTyxHQUFHLElBQUksQ0FBQztBQUNmLFlBQUksR0FBRyxhQUFhLENBQUM7QUFDckIsZUFBTyxHQUFHLGFBQWEsQ0FBQztPQUN6QixNQUFNOzs7QUFFTCxlQUFPLEdBQUcsYUFBYSxDQUFDO0FBQ3hCLFlBQUksR0FBRyxhQUFhLENBQUM7QUFDckIsZUFBTyxHQUFHLEVBQUUsQ0FBQztPQUNkO0tBQ0YsTUFBTTtBQUNMLGFBQU8sR0FBRyxhQUFhLENBQUM7QUFDeEIsVUFBSSxHQUFHLGFBQWEsQ0FBQztBQUNyQixhQUFPLEdBQUcsZUFBZSxDQUFDO0tBQzNCOztBQUVELFFBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM1RCxRQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWhCLHdCQXJETyxTQUFTLENBcUROLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRTdCLFdBQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUMvQiIsImZpbGUiOiJlbWJlci10ZXN0aW5nL2hlbHBlcnMvdHJpZ2dlcl9ldmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuQG1vZHVsZSBlbWJlclxuQHN1Ym1vZHVsZSBlbWJlci10ZXN0aW5nXG4qL1xuaW1wb3J0IHsgZmlyZUV2ZW50IH0gZnJvbSAnLi4vZXZlbnRzJztcbi8qKlxuICBUcmlnZ2VycyB0aGUgZ2l2ZW4gRE9NIGV2ZW50IG9uIHRoZSBlbGVtZW50IGlkZW50aWZpZWQgYnkgdGhlIHByb3ZpZGVkIHNlbGVjdG9yLlxuICBFeGFtcGxlOlxuICBgYGBqYXZhc2NyaXB0XG4gIHRyaWdnZXJFdmVudCgnI3NvbWUtZWxlbS1pZCcsICdibHVyJyk7XG4gIGBgYFxuICBUaGlzIGlzIGFjdHVhbGx5IHVzZWQgaW50ZXJuYWxseSBieSB0aGUgYGtleUV2ZW50YCBoZWxwZXIgbGlrZSBzbzpcbiAgYGBgamF2YXNjcmlwdFxuICB0cmlnZ2VyRXZlbnQoJyNzb21lLWVsZW0taWQnLCAna2V5cHJlc3MnLCB7IGtleUNvZGU6IDEzIH0pO1xuICBgYGBcbiBAbWV0aG9kIHRyaWdnZXJFdmVudFxuIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBqUXVlcnkgc2VsZWN0b3IgZm9yIGZpbmRpbmcgZWxlbWVudCBvbiB0aGUgRE9NXG4gQHBhcmFtIHtTdHJpbmd9IFtjb250ZXh0XSBqUXVlcnkgc2VsZWN0b3IgdGhhdCB3aWxsIGxpbWl0IHRoZSBzZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJndW1lbnQgdG8gZmluZCBvbmx5IHdpdGhpbiB0aGUgY29udGV4dCdzIGNoaWxkcmVuXG4gQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gYmUgdHJpZ2dlcmVkLlxuIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgdG8gYmUgcGFzc2VkIHRvIGpRdWVyeS5FdmVudC5cbiBAcmV0dXJuIHtSU1ZQLlByb21pc2V9XG4gQHNpbmNlIDEuNS4wXG4gQHB1YmxpY1xuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyaWdnZXJFdmVudChhcHAsIHNlbGVjdG9yLCBjb250ZXh0T3JUeXBlLCB0eXBlT3JPcHRpb25zLCBwb3NzaWJsZU9wdGlvbnMpIHtcbiAgbGV0IGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgbGV0IGNvbnRleHQsIHR5cGUsIG9wdGlvbnM7XG5cbiAgaWYgKGFyaXR5ID09PSAzKSB7XG4gICAgLy8gY29udGV4dCBhbmQgb3B0aW9ucyBhcmUgb3B0aW9uYWwsIHNvIHRoaXMgaXNcbiAgICAvLyBhcHAsIHNlbGVjdG9yLCB0eXBlXG4gICAgY29udGV4dCA9IG51bGw7XG4gICAgdHlwZSA9IGNvbnRleHRPclR5cGU7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9IGVsc2UgaWYgKGFyaXR5ID09PSA0KSB7XG4gICAgLy8gY29udGV4dCBhbmQgb3B0aW9ucyBhcmUgb3B0aW9uYWwsIHNvIHRoaXMgaXNcbiAgICBpZiAodHlwZW9mIHR5cGVPck9wdGlvbnMgPT09ICdvYmplY3QnKSB7ICAvLyBlaXRoZXJcbiAgICAgIC8vIGFwcCwgc2VsZWN0b3IsIHR5cGUsIG9wdGlvbnNcbiAgICAgIGNvbnRleHQgPSBudWxsO1xuICAgICAgdHlwZSA9IGNvbnRleHRPclR5cGU7XG4gICAgICBvcHRpb25zID0gdHlwZU9yT3B0aW9ucztcbiAgICB9IGVsc2UgeyAvLyBvclxuICAgICAgLy8gYXBwLCBzZWxlY3RvciwgY29udGV4dCwgdHlwZVxuICAgICAgY29udGV4dCA9IGNvbnRleHRPclR5cGU7XG4gICAgICB0eXBlID0gdHlwZU9yT3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29udGV4dCA9IGNvbnRleHRPclR5cGU7XG4gICAgdHlwZSA9IHR5cGVPck9wdGlvbnM7XG4gICAgb3B0aW9ucyA9IHBvc3NpYmxlT3B0aW9ucztcbiAgfVxuXG4gIGxldCAkZWwgPSBhcHAudGVzdEhlbHBlcnMuZmluZFdpdGhBc3NlcnQoc2VsZWN0b3IsIGNvbnRleHQpO1xuICBsZXQgZWwgPSAkZWxbMF07XG5cbiAgZmlyZUV2ZW50KGVsLCB0eXBlLCBvcHRpb25zKTtcblxuICByZXR1cm4gYXBwLnRlc3RIZWxwZXJzLndhaXQoKTtcbn1cbiJdfQ==
enifed('ember-testing/helpers/visit', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = visit;

  /**
    Loads a route, sets up any controllers, and renders any templates associated
    with the route as though a real user had triggered the route change while
    using your app.
  
    Example:
  
    ```javascript
    visit('posts/index').then(function() {
      // assert something
    });
    ```
  
    @method visit
    @param {String} url the name of the route
    @return {RSVP.Promise}
    @public
  */

  function visit(app, url) {
    var router = app.__container__.lookup('router:main');
    var shouldHandleURL = false;

    app.boot().then(function () {
      router.location.setURL(url);

      if (shouldHandleURL) {
        _emberMetal.run(app.__deprecatedInstance__, 'handleURL', url);
      }
    });

    if (app._readinessDeferrals > 0) {
      router['initialURL'] = url;
      _emberMetal.run(app, 'advanceReadiness');
      delete router['initialURL'];
    } else {
      shouldHandleURL = true;
    }

    return app.testHelpers.wait();
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy92aXNpdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O29CQXdCd0IsS0FBSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQWQsV0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUN0QyxRQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyRCxRQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7O0FBRTVCLE9BQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNwQixZQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFNUIsVUFBSSxlQUFlLEVBQUU7QUFDbkIsb0JBNUJHLEdBQUcsQ0E0QkYsR0FBRyxDQUFDLHNCQUFzQixFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztPQUNuRDtLQUNGLENBQUMsQ0FBQzs7QUFFSCxRQUFJLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLEVBQUU7QUFDL0IsWUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUMzQixrQkFsQ0ssR0FBRyxDQWtDSixHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUM3QixhQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUM3QixNQUFNO0FBQ0wscUJBQWUsR0FBRyxJQUFJLENBQUM7S0FDeEI7O0FBRUQsV0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0dBQy9CIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvaGVscGVycy92aXNpdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuQG1vZHVsZSBlbWJlclxuQHN1Ym1vZHVsZSBlbWJlci10ZXN0aW5nXG4qL1xuaW1wb3J0IHsgcnVuIH0gZnJvbSAnZW1iZXItbWV0YWwnO1xuXG4vKipcbiAgTG9hZHMgYSByb3V0ZSwgc2V0cyB1cCBhbnkgY29udHJvbGxlcnMsIGFuZCByZW5kZXJzIGFueSB0ZW1wbGF0ZXMgYXNzb2NpYXRlZFxuICB3aXRoIHRoZSByb3V0ZSBhcyB0aG91Z2ggYSByZWFsIHVzZXIgaGFkIHRyaWdnZXJlZCB0aGUgcm91dGUgY2hhbmdlIHdoaWxlXG4gIHVzaW5nIHlvdXIgYXBwLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICB2aXNpdCgncG9zdHMvaW5kZXgnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgIC8vIGFzc2VydCBzb21ldGhpbmdcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgdmlzaXRcbiAgQHBhcmFtIHtTdHJpbmd9IHVybCB0aGUgbmFtZSBvZiB0aGUgcm91dGVcbiAgQHJldHVybiB7UlNWUC5Qcm9taXNlfVxuICBAcHVibGljXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmlzaXQoYXBwLCB1cmwpIHtcbiAgbGV0IHJvdXRlciA9IGFwcC5fX2NvbnRhaW5lcl9fLmxvb2t1cCgncm91dGVyOm1haW4nKTtcbiAgbGV0IHNob3VsZEhhbmRsZVVSTCA9IGZhbHNlO1xuXG4gIGFwcC5ib290KCkudGhlbigoKSA9PiB7XG4gICAgcm91dGVyLmxvY2F0aW9uLnNldFVSTCh1cmwpO1xuXG4gICAgaWYgKHNob3VsZEhhbmRsZVVSTCkge1xuICAgICAgcnVuKGFwcC5fX2RlcHJlY2F0ZWRJbnN0YW5jZV9fLCAnaGFuZGxlVVJMJywgdXJsKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChhcHAuX3JlYWRpbmVzc0RlZmVycmFscyA+IDApIHtcbiAgICByb3V0ZXJbJ2luaXRpYWxVUkwnXSA9IHVybDtcbiAgICBydW4oYXBwLCAnYWR2YW5jZVJlYWRpbmVzcycpO1xuICAgIGRlbGV0ZSByb3V0ZXJbJ2luaXRpYWxVUkwnXTtcbiAgfSBlbHNlIHtcbiAgICBzaG91bGRIYW5kbGVVUkwgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFwcC50ZXN0SGVscGVycy53YWl0KCk7XG59XG4iXX0=
enifed('ember-testing/helpers/wait', ['exports', 'ember-testing/test/waiters', 'ember-runtime', 'ember-metal', 'ember-testing/test/pending_requests'], function (exports, _emberTestingTestWaiters, _emberRuntime, _emberMetal, _emberTestingTestPending_requests) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = wait;

  /**
    Causes the run loop to process any pending events. This is used to ensure that
    any async operations from other helpers (or your assertions) have been processed.
  
    This is most often used as the return value for the helper functions (see 'click',
    'fillIn','visit',etc). However, there is a method to register a test helper which
    utilizes this method without the need to actually call `wait()` in your helpers.
  
    The `wait` helper is built into `registerAsyncHelper` by default. You will not need
    to `return app.testHelpers.wait();` - the wait behavior is provided for you.
  
    Example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('loginUser', function(app, username, password) {
      visit('secured/path/here')
        .fillIn('#username', username)
        .fillIn('#password', password)
        .click('.submit');
    });
  
    @method wait
    @param {Object} value The value to be returned.
    @return {RSVP.Promise}
    @public
    @since 1.0.0
  */

  function wait(app, value) {
    return new _emberRuntime.RSVP.Promise(function (resolve) {
      var router = app.__container__.lookup('router:main');

      // Every 10ms, poll for the async thing to have finished
      var watcher = setInterval(function () {
        // 1. If the router is loading, keep polling
        var routerIsLoading = router.router && !!router.router.activeTransition;
        if (routerIsLoading) {
          return;
        }

        // 2. If there are pending Ajax requests, keep polling
        if (_emberTestingTestPending_requests.pendingRequests()) {
          return;
        }

        // 3. If there are scheduled timers or we are inside of a run loop, keep polling
        if (_emberMetal.run.hasScheduledTimers() || _emberMetal.run.currentRunLoop) {
          return;
        }

        if (_emberTestingTestWaiters.checkWaiters()) {
          return;
        }

        // Stop polling
        clearInterval(watcher);

        // Synchronously resolve the promise
        _emberMetal.run(null, resolve, value);
      }, 10);
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaGVscGVycy93YWl0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7b0JBb0N3QixJQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBYixXQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQ3ZDLFdBQU8sSUFBSSxjQWhDSixJQUFJLENBZ0NLLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRTtBQUN4QyxVQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7O0FBR3JELFVBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQyxZQUFNOztBQUU5QixZQUFJLGVBQWUsR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0FBQ3hFLFlBQUksZUFBZSxFQUFFO0FBQUUsaUJBQU87U0FBRTs7O0FBR2hDLFlBQUksa0NBeENELGVBQWUsRUF3Q0csRUFBRTtBQUFFLGlCQUFPO1NBQUU7OztBQUdsQyxZQUFJLFlBNUNELEdBQUcsQ0E0Q0Usa0JBQWtCLEVBQUUsSUFBSSxZQTVDN0IsR0FBRyxDQTRDOEIsY0FBYyxFQUFFO0FBQUUsaUJBQU87U0FBRTs7QUFFL0QsWUFBSSx5QkFoREQsWUFBWSxFQWdERyxFQUFFO0FBQ2xCLGlCQUFPO1NBQ1I7OztBQUdELHFCQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7OztBQUd2QixvQkF0REcsR0FBRyxDQXNERixJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQzNCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDUixDQUFDLENBQUM7R0FDSiIsImZpbGUiOiJlbWJlci10ZXN0aW5nL2hlbHBlcnMvd2FpdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuQG1vZHVsZSBlbWJlclxuQHN1Ym1vZHVsZSBlbWJlci10ZXN0aW5nXG4qL1xuaW1wb3J0IHsgY2hlY2tXYWl0ZXJzIH0gZnJvbSAnLi4vdGVzdC93YWl0ZXJzJztcbmltcG9ydCB7IFJTVlAgfSBmcm9tICdlbWJlci1ydW50aW1lJztcbmltcG9ydCB7IHJ1biB9IGZyb20gJ2VtYmVyLW1ldGFsJztcbmltcG9ydCB7IHBlbmRpbmdSZXF1ZXN0cyB9IGZyb20gJy4uL3Rlc3QvcGVuZGluZ19yZXF1ZXN0cyc7XG5cbi8qKlxuICBDYXVzZXMgdGhlIHJ1biBsb29wIHRvIHByb2Nlc3MgYW55IHBlbmRpbmcgZXZlbnRzLiBUaGlzIGlzIHVzZWQgdG8gZW5zdXJlIHRoYXRcbiAgYW55IGFzeW5jIG9wZXJhdGlvbnMgZnJvbSBvdGhlciBoZWxwZXJzIChvciB5b3VyIGFzc2VydGlvbnMpIGhhdmUgYmVlbiBwcm9jZXNzZWQuXG5cbiAgVGhpcyBpcyBtb3N0IG9mdGVuIHVzZWQgYXMgdGhlIHJldHVybiB2YWx1ZSBmb3IgdGhlIGhlbHBlciBmdW5jdGlvbnMgKHNlZSAnY2xpY2snLFxuICAnZmlsbEluJywndmlzaXQnLGV0YykuIEhvd2V2ZXIsIHRoZXJlIGlzIGEgbWV0aG9kIHRvIHJlZ2lzdGVyIGEgdGVzdCBoZWxwZXIgd2hpY2hcbiAgdXRpbGl6ZXMgdGhpcyBtZXRob2Qgd2l0aG91dCB0aGUgbmVlZCB0byBhY3R1YWxseSBjYWxsIGB3YWl0KClgIGluIHlvdXIgaGVscGVycy5cblxuICBUaGUgYHdhaXRgIGhlbHBlciBpcyBidWlsdCBpbnRvIGByZWdpc3RlckFzeW5jSGVscGVyYCBieSBkZWZhdWx0LiBZb3Ugd2lsbCBub3QgbmVlZFxuICB0byBgcmV0dXJuIGFwcC50ZXN0SGVscGVycy53YWl0KCk7YCAtIHRoZSB3YWl0IGJlaGF2aW9yIGlzIHByb3ZpZGVkIGZvciB5b3UuXG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIEVtYmVyLlRlc3QucmVnaXN0ZXJBc3luY0hlbHBlcignbG9naW5Vc2VyJywgZnVuY3Rpb24oYXBwLCB1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICB2aXNpdCgnc2VjdXJlZC9wYXRoL2hlcmUnKVxuICAgICAgLmZpbGxJbignI3VzZXJuYW1lJywgdXNlcm5hbWUpXG4gICAgICAuZmlsbEluKCcjcGFzc3dvcmQnLCBwYXNzd29yZClcbiAgICAgIC5jbGljaygnLnN1Ym1pdCcpO1xuICB9KTtcblxuICBAbWV0aG9kIHdhaXRcbiAgQHBhcmFtIHtPYmplY3R9IHZhbHVlIFRoZSB2YWx1ZSB0byBiZSByZXR1cm5lZC5cbiAgQHJldHVybiB7UlNWUC5Qcm9taXNlfVxuICBAcHVibGljXG4gIEBzaW5jZSAxLjAuMFxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdhaXQoYXBwLCB2YWx1ZSkge1xuICByZXR1cm4gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgbGV0IHJvdXRlciA9IGFwcC5fX2NvbnRhaW5lcl9fLmxvb2t1cCgncm91dGVyOm1haW4nKTtcblxuICAgIC8vIEV2ZXJ5IDEwbXMsIHBvbGwgZm9yIHRoZSBhc3luYyB0aGluZyB0byBoYXZlIGZpbmlzaGVkXG4gICAgbGV0IHdhdGNoZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAvLyAxLiBJZiB0aGUgcm91dGVyIGlzIGxvYWRpbmcsIGtlZXAgcG9sbGluZ1xuICAgICAgbGV0IHJvdXRlcklzTG9hZGluZyA9IHJvdXRlci5yb3V0ZXIgJiYgISFyb3V0ZXIucm91dGVyLmFjdGl2ZVRyYW5zaXRpb247XG4gICAgICBpZiAocm91dGVySXNMb2FkaW5nKSB7IHJldHVybjsgfVxuXG4gICAgICAvLyAyLiBJZiB0aGVyZSBhcmUgcGVuZGluZyBBamF4IHJlcXVlc3RzLCBrZWVwIHBvbGxpbmdcbiAgICAgIGlmIChwZW5kaW5nUmVxdWVzdHMoKSkgeyByZXR1cm47IH1cblxuICAgICAgLy8gMy4gSWYgdGhlcmUgYXJlIHNjaGVkdWxlZCB0aW1lcnMgb3Igd2UgYXJlIGluc2lkZSBvZiBhIHJ1biBsb29wLCBrZWVwIHBvbGxpbmdcbiAgICAgIGlmIChydW4uaGFzU2NoZWR1bGVkVGltZXJzKCkgfHwgcnVuLmN1cnJlbnRSdW5Mb29wKSB7IHJldHVybjsgfVxuXG4gICAgICBpZiAoY2hlY2tXYWl0ZXJzKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBTdG9wIHBvbGxpbmdcbiAgICAgIGNsZWFySW50ZXJ2YWwod2F0Y2hlcik7XG5cbiAgICAgIC8vIFN5bmNocm9ub3VzbHkgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuICAgICAgcnVuKG51bGwsIHJlc29sdmUsIHZhbHVlKTtcbiAgICB9LCAxMCk7XG4gIH0pO1xufVxuIl19
enifed('ember-testing/index', ['exports', 'ember-testing/support', 'ember-testing/ext/application', 'ember-testing/ext/rsvp', 'ember-testing/helpers', 'ember-testing/initializers', 'ember-testing/test', 'ember-testing/adapters/adapter', 'ember-testing/setup_for_testing', 'ember-testing/adapters/qunit'], function (exports, _emberTestingSupport, _emberTestingExtApplication, _emberTestingExtRsvp, _emberTestingHelpers, _emberTestingInitializers, _emberTestingTest, _emberTestingAdaptersAdapter, _emberTestingSetup_for_testing, _emberTestingAdaptersQunit) {
  'use strict';

  exports.Test = _emberTestingTest.default;
  exports.Adapter = _emberTestingAdaptersAdapter.default;
  exports.setupForTesting = _emberTestingSetup_for_testing.default;
  exports.QUnitAdapter = _emberTestingAdaptersQunit.default;
});
// to handle various edge cases
// setup RSVP + run loop integration
// adds helpers to helpers object in Test
// to setup initializer

/**
  @module ember
  @submodule ember-testing
*/
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O1VBQW9CLElBQUkscUJBQWYsT0FBTztVQUNJLE9BQU8sZ0NBQWxCLE9BQU87VUFDSSxlQUFlLGtDQUExQixPQUFPO1VBQ0ksWUFBWSw4QkFBdkIsT0FBTyIsImZpbGUiOiJlbWJlci10ZXN0aW5nL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHsgZGVmYXVsdCBhcyBUZXN0IH0gZnJvbSAnLi90ZXN0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQWRhcHRlciB9IGZyb20gJy4vYWRhcHRlcnMvYWRhcHRlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIHNldHVwRm9yVGVzdGluZyB9IGZyb20gJy4vc2V0dXBfZm9yX3Rlc3RpbmcnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBRVW5pdEFkYXB0ZXIgfSBmcm9tICcuL2FkYXB0ZXJzL3F1bml0JztcblxuaW1wb3J0ICcuL3N1cHBvcnQnOyAgICAgIC8vIHRvIGhhbmRsZSB2YXJpb3VzIGVkZ2UgY2FzZXNcbmltcG9ydCAnLi9leHQvYXBwbGljYXRpb24nO1xuaW1wb3J0ICcuL2V4dC9yc3ZwJzsgICAgIC8vIHNldHVwIFJTVlAgKyBydW4gbG9vcCBpbnRlZ3JhdGlvblxuaW1wb3J0ICcuL2hlbHBlcnMnOyAgICAgIC8vIGFkZHMgaGVscGVycyB0byBoZWxwZXJzIG9iamVjdCBpbiBUZXN0XG5pbXBvcnQgJy4vaW5pdGlhbGl6ZXJzJzsgLy8gdG8gc2V0dXAgaW5pdGlhbGl6ZXJcblxuLyoqXG4gIEBtb2R1bGUgZW1iZXJcbiAgQHN1Ym1vZHVsZSBlbWJlci10ZXN0aW5nXG4qL1xuIl19
enifed('ember-testing/initializers', ['exports', 'ember-runtime'], function (exports, _emberRuntime) {
  'use strict';

  var name = 'deferReadiness in `testing` mode';

  _emberRuntime.onLoad('Ember.Application', function (Application) {
    if (!Application.initializers[name]) {
      Application.initializer({
        name: name,

        initialize: function (application) {
          if (application.testing) {
            application.deferReadiness();
          }
        }
      });
    }
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvaW5pdGlhbGl6ZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLE1BQUksSUFBSSxHQUFHLGtDQUFrQyxDQUFDOztBQUU5QyxnQkFKUyxNQUFNLENBSVIsbUJBQW1CLEVBQUUsVUFBUyxXQUFXLEVBQUU7QUFDaEQsUUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbkMsaUJBQVcsQ0FBQyxXQUFXLENBQUM7QUFDdEIsWUFBSSxFQUFFLElBQUk7O0FBRVYsa0JBQVUsRUFBQSxVQUFDLFdBQVcsRUFBRTtBQUN0QixjQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUU7QUFDdkIsdUJBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztXQUM5QjtTQUNGO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7R0FDRixDQUFDLENBQUMiLCJmaWxlIjoiZW1iZXItdGVzdGluZy9pbml0aWFsaXplcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBvbkxvYWQgfSBmcm9tICdlbWJlci1ydW50aW1lJztcblxubGV0IG5hbWUgPSAnZGVmZXJSZWFkaW5lc3MgaW4gYHRlc3RpbmdgIG1vZGUnO1xuXG5vbkxvYWQoJ0VtYmVyLkFwcGxpY2F0aW9uJywgZnVuY3Rpb24oQXBwbGljYXRpb24pIHtcbiAgaWYgKCFBcHBsaWNhdGlvbi5pbml0aWFsaXplcnNbbmFtZV0pIHtcbiAgICBBcHBsaWNhdGlvbi5pbml0aWFsaXplcih7XG4gICAgICBuYW1lOiBuYW1lLFxuXG4gICAgICBpbml0aWFsaXplKGFwcGxpY2F0aW9uKSB7XG4gICAgICAgIGlmIChhcHBsaWNhdGlvbi50ZXN0aW5nKSB7XG4gICAgICAgICAgYXBwbGljYXRpb24uZGVmZXJSZWFkaW5lc3MoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59KTtcbiJdfQ==
enifed('ember-testing/setup_for_testing', ['exports', 'ember-metal', 'ember-views', 'ember-testing/test/adapter', 'ember-testing/test/pending_requests', 'ember-testing/adapters/qunit'], function (exports, _emberMetal, _emberViews, _emberTestingTestAdapter, _emberTestingTestPending_requests, _emberTestingAdaptersQunit) {
  'use strict';

  exports.default = setupForTesting;

  /**
    Sets Ember up for testing. This is useful to perform
    basic setup steps in order to unit test.
  
    Use `App.setupForTesting` to perform integration tests (full
    application testing).
  
    @method setupForTesting
    @namespace Ember
    @since 1.5.0
    @private
  */

  function setupForTesting() {
    _emberMetal.setTesting(true);

    var adapter = _emberTestingTestAdapter.getAdapter();
    // if adapter is not manually set default to QUnit
    if (!adapter) {
      _emberTestingTestAdapter.setAdapter(new _emberTestingAdaptersQunit.default());
    }

    _emberViews.jQuery(document).off('ajaxSend', _emberTestingTestPending_requests.incrementPendingRequests);
    _emberViews.jQuery(document).off('ajaxComplete', _emberTestingTestPending_requests.decrementPendingRequests);

    _emberTestingTestPending_requests.clearPendingRequests();

    _emberViews.jQuery(document).on('ajaxSend', _emberTestingTestPending_requests.incrementPendingRequests);
    _emberViews.jQuery(document).on('ajaxComplete', _emberTestingTestPending_requests.decrementPendingRequests);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3Rpbmcvc2V0dXBfZm9yX3Rlc3RpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O29CQXlCd0IsZUFBZTs7Ozs7Ozs7Ozs7Ozs7O0FBQXhCLFdBQVMsZUFBZSxHQUFHO0FBQ3hDLGdCQTFCTyxVQUFVLENBMEJOLElBQUksQ0FBQyxDQUFDOztBQUVqQixRQUFJLE9BQU8sR0FBRyx5QkF6QmQsVUFBVSxFQXlCZ0IsQ0FBQzs7QUFFM0IsUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLCtCQTNCRixVQUFVLENBMkJHLHdDQUFrQixDQUFDLENBQUM7S0FDaEM7O0FBRUQsZ0JBakNPLE1BQU0sQ0FpQ04sUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsb0NBM0IvQix3QkFBd0IsQ0EyQmtDLENBQUM7QUFDM0QsZ0JBbENPLE1BQU0sQ0FrQ04sUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsb0NBM0JuQyx3QkFBd0IsQ0EyQnNDLENBQUM7O0FBRS9ELHNDQTVCQSxvQkFBb0IsRUE0QkUsQ0FBQzs7QUFFdkIsZ0JBdENPLE1BQU0sQ0FzQ04sUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsb0NBaEM5Qix3QkFBd0IsQ0FnQ2lDLENBQUM7QUFDMUQsZ0JBdkNPLE1BQU0sQ0F1Q04sUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLGNBQWMsb0NBaENsQyx3QkFBd0IsQ0FnQ3FDLENBQUM7R0FDL0QiLCJmaWxlIjoiZW1iZXItdGVzdGluZy9zZXR1cF9mb3JfdGVzdGluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNldFRlc3RpbmcgfSBmcm9tICdlbWJlci1tZXRhbCc7XG5pbXBvcnQgeyBqUXVlcnkgfSBmcm9tICdlbWJlci12aWV3cyc7XG5pbXBvcnQge1xuICBnZXRBZGFwdGVyLFxuICBzZXRBZGFwdGVyXG59IGZyb20gJy4vdGVzdC9hZGFwdGVyJztcbmltcG9ydCB7XG4gIGluY3JlbWVudFBlbmRpbmdSZXF1ZXN0cyxcbiAgZGVjcmVtZW50UGVuZGluZ1JlcXVlc3RzLFxuICBjbGVhclBlbmRpbmdSZXF1ZXN0c1xufSBmcm9tICcuL3Rlc3QvcGVuZGluZ19yZXF1ZXN0cyc7XG5pbXBvcnQgUVVuaXRBZGFwdGVyIGZyb20gJy4vYWRhcHRlcnMvcXVuaXQnO1xuXG4vKipcbiAgU2V0cyBFbWJlciB1cCBmb3IgdGVzdGluZy4gVGhpcyBpcyB1c2VmdWwgdG8gcGVyZm9ybVxuICBiYXNpYyBzZXR1cCBzdGVwcyBpbiBvcmRlciB0byB1bml0IHRlc3QuXG5cbiAgVXNlIGBBcHAuc2V0dXBGb3JUZXN0aW5nYCB0byBwZXJmb3JtIGludGVncmF0aW9uIHRlc3RzIChmdWxsXG4gIGFwcGxpY2F0aW9uIHRlc3RpbmcpLlxuXG4gIEBtZXRob2Qgc2V0dXBGb3JUZXN0aW5nXG4gIEBuYW1lc3BhY2UgRW1iZXJcbiAgQHNpbmNlIDEuNS4wXG4gIEBwcml2YXRlXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2V0dXBGb3JUZXN0aW5nKCkge1xuICBzZXRUZXN0aW5nKHRydWUpO1xuXG4gIGxldCBhZGFwdGVyID0gZ2V0QWRhcHRlcigpO1xuICAvLyBpZiBhZGFwdGVyIGlzIG5vdCBtYW51YWxseSBzZXQgZGVmYXVsdCB0byBRVW5pdFxuICBpZiAoIWFkYXB0ZXIpIHtcbiAgICBzZXRBZGFwdGVyKG5ldyBRVW5pdEFkYXB0ZXIoKSk7XG4gIH1cblxuICBqUXVlcnkoZG9jdW1lbnQpLm9mZignYWpheFNlbmQnLCBpbmNyZW1lbnRQZW5kaW5nUmVxdWVzdHMpO1xuICBqUXVlcnkoZG9jdW1lbnQpLm9mZignYWpheENvbXBsZXRlJywgZGVjcmVtZW50UGVuZGluZ1JlcXVlc3RzKTtcblxuICBjbGVhclBlbmRpbmdSZXF1ZXN0cygpO1xuXG4gIGpRdWVyeShkb2N1bWVudCkub24oJ2FqYXhTZW5kJywgaW5jcmVtZW50UGVuZGluZ1JlcXVlc3RzKTtcbiAgalF1ZXJ5KGRvY3VtZW50KS5vbignYWpheENvbXBsZXRlJywgZGVjcmVtZW50UGVuZGluZ1JlcXVlc3RzKTtcbn1cbiJdfQ==
enifed('ember-testing/support', ['exports', 'ember-metal', 'ember-views', 'ember-environment'], function (exports, _emberMetal, _emberViews, _emberEnvironment) {
  'use strict';

  /**
    @module ember
    @submodule ember-testing
  */

  var $ = _emberViews.jQuery;

  /**
    This method creates a checkbox and triggers the click event to fire the
    passed in handler. It is used to correct for a bug in older versions
    of jQuery (e.g 1.8.3).
  
    @private
    @method testCheckboxClick
  */
  function testCheckboxClick(handler) {
    var input = document.createElement('input');
    $(input).attr('type', 'checkbox').css({ position: 'absolute', left: '-1000px', top: '-1000px' }).appendTo('body').on('click', handler).trigger('click').remove();
  }

  if (_emberEnvironment.environment.hasDOM && typeof $ === 'function') {
    $(function () {
      /*
        Determine whether a checkbox checked using jQuery's "click" method will have
        the correct value for its checked property.
         If we determine that the current jQuery version exhibits this behavior,
        patch it to work correctly as in the commit for the actual fix:
        https://github.com/jquery/jquery/commit/1fb2f92.
      */
      testCheckboxClick(function () {
        if (!this.checked && !$.event.special.click) {
          $.event.special.click = {
            // For checkbox, fire native event so checked state will be right
            trigger: function () {
              if ($.nodeName(this, 'input') && this.type === 'checkbox' && this.click) {
                this.click();
                return false;
              }
            }
          };
        }
      });

      // Try again to verify that the patch took effect or blow up.
      testCheckboxClick(function () {
        _emberMetal.warn('clicked checkboxes should be checked! the jQuery patch didn\'t work', this.checked, { id: 'ember-testing.test-checkbox-click' });
      });
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3Rpbmcvc3VwcG9ydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQVVBLE1BQU0sQ0FBQyxlQVRFLE1BQU0sQUFTQyxDQUFDOzs7Ozs7Ozs7O0FBVWpCLFdBQVMsaUJBQWlCLENBQUMsT0FBTyxFQUFFO0FBQ2xDLFFBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUMsS0FBQyxDQUFDLEtBQUssQ0FBQyxDQUNMLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQ3hCLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FDOUQsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUNoQixFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUNwQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQ2hCLE1BQU0sRUFBRSxDQUFDO0dBQ2I7O0FBRUQsTUFBSSxrQkE1QkssV0FBVyxDQTRCSixNQUFNLElBQUksT0FBTyxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQ2pELEtBQUMsQ0FBQyxZQUFXOzs7Ozs7OztBQVNYLHVCQUFpQixDQUFDLFlBQVc7QUFDM0IsWUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDM0MsV0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHOztBQUV0QixtQkFBTyxFQUFBLFlBQUc7QUFDUixrQkFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ3ZFLG9CQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDYix1QkFBTyxLQUFLLENBQUM7ZUFDZDthQUNGO1dBQ0YsQ0FBQztTQUNIO09BQ0YsQ0FBQyxDQUFDOzs7QUFHSCx1QkFBaUIsQ0FBQyxZQUFXO0FBQzNCLG9CQXpERyxJQUFJLENBMERMLHFFQUFxRSxFQUNyRSxJQUFJLENBQUMsT0FBTyxFQUNaLEVBQUUsRUFBRSxFQUFFLG1DQUFtQyxFQUFFLENBQzVDLENBQUM7T0FDSCxDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7R0FDSiIsImZpbGUiOiJlbWJlci10ZXN0aW5nL3N1cHBvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB3YXJuIH0gZnJvbSAnZW1iZXItbWV0YWwnO1xuaW1wb3J0IHsgalF1ZXJ5IH0gZnJvbSAnZW1iZXItdmlld3MnO1xuXG5pbXBvcnQgeyBlbnZpcm9ubWVudCB9IGZyb20gJ2VtYmVyLWVudmlyb25tZW50JztcblxuLyoqXG4gIEBtb2R1bGUgZW1iZXJcbiAgQHN1Ym1vZHVsZSBlbWJlci10ZXN0aW5nXG4qL1xuXG5jb25zdCAkID0galF1ZXJ5O1xuXG4vKipcbiAgVGhpcyBtZXRob2QgY3JlYXRlcyBhIGNoZWNrYm94IGFuZCB0cmlnZ2VycyB0aGUgY2xpY2sgZXZlbnQgdG8gZmlyZSB0aGVcbiAgcGFzc2VkIGluIGhhbmRsZXIuIEl0IGlzIHVzZWQgdG8gY29ycmVjdCBmb3IgYSBidWcgaW4gb2xkZXIgdmVyc2lvbnNcbiAgb2YgalF1ZXJ5IChlLmcgMS44LjMpLlxuXG4gIEBwcml2YXRlXG4gIEBtZXRob2QgdGVzdENoZWNrYm94Q2xpY2tcbiovXG5mdW5jdGlvbiB0ZXN0Q2hlY2tib3hDbGljayhoYW5kbGVyKSB7XG4gIGxldCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICQoaW5wdXQpXG4gICAgLmF0dHIoJ3R5cGUnLCAnY2hlY2tib3gnKVxuICAgIC5jc3MoeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgbGVmdDogJy0xMDAwcHgnLCB0b3A6ICctMTAwMHB4JyB9KVxuICAgIC5hcHBlbmRUbygnYm9keScpXG4gICAgLm9uKCdjbGljaycsIGhhbmRsZXIpXG4gICAgLnRyaWdnZXIoJ2NsaWNrJylcbiAgICAucmVtb3ZlKCk7XG59XG5cbmlmIChlbnZpcm9ubWVudC5oYXNET00gJiYgdHlwZW9mICQgPT09ICdmdW5jdGlvbicpIHtcbiAgJChmdW5jdGlvbigpIHtcbiAgICAvKlxuICAgICAgRGV0ZXJtaW5lIHdoZXRoZXIgYSBjaGVja2JveCBjaGVja2VkIHVzaW5nIGpRdWVyeSdzIFwiY2xpY2tcIiBtZXRob2Qgd2lsbCBoYXZlXG4gICAgICB0aGUgY29ycmVjdCB2YWx1ZSBmb3IgaXRzIGNoZWNrZWQgcHJvcGVydHkuXG5cbiAgICAgIElmIHdlIGRldGVybWluZSB0aGF0IHRoZSBjdXJyZW50IGpRdWVyeSB2ZXJzaW9uIGV4aGliaXRzIHRoaXMgYmVoYXZpb3IsXG4gICAgICBwYXRjaCBpdCB0byB3b3JrIGNvcnJlY3RseSBhcyBpbiB0aGUgY29tbWl0IGZvciB0aGUgYWN0dWFsIGZpeDpcbiAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L2NvbW1pdC8xZmIyZjkyLlxuICAgICovXG4gICAgdGVzdENoZWNrYm94Q2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMuY2hlY2tlZCAmJiAhJC5ldmVudC5zcGVjaWFsLmNsaWNrKSB7XG4gICAgICAgICQuZXZlbnQuc3BlY2lhbC5jbGljayA9IHtcbiAgICAgICAgICAvLyBGb3IgY2hlY2tib3gsIGZpcmUgbmF0aXZlIGV2ZW50IHNvIGNoZWNrZWQgc3RhdGUgd2lsbCBiZSByaWdodFxuICAgICAgICAgIHRyaWdnZXIoKSB7XG4gICAgICAgICAgICBpZiAoJC5ub2RlTmFtZSh0aGlzLCAnaW5wdXQnKSAmJiB0aGlzLnR5cGUgPT09ICdjaGVja2JveCcgJiYgdGhpcy5jbGljaykge1xuICAgICAgICAgICAgICB0aGlzLmNsaWNrKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUcnkgYWdhaW4gdG8gdmVyaWZ5IHRoYXQgdGhlIHBhdGNoIHRvb2sgZWZmZWN0IG9yIGJsb3cgdXAuXG4gICAgdGVzdENoZWNrYm94Q2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnY2xpY2tlZCBjaGVja2JveGVzIHNob3VsZCBiZSBjaGVja2VkISB0aGUgalF1ZXJ5IHBhdGNoIGRpZG5cXCd0IHdvcmsnLFxuICAgICAgICB0aGlzLmNoZWNrZWQsXG4gICAgICAgIHsgaWQ6ICdlbWJlci10ZXN0aW5nLnRlc3QtY2hlY2tib3gtY2xpY2snIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH0pO1xufVxuIl19
enifed('ember-testing/test', ['exports', 'ember-testing/test/helpers', 'ember-testing/test/on_inject_helpers', 'ember-testing/test/promise', 'ember-testing/test/waiters', 'ember-testing/test/adapter', 'ember-metal'], function (exports, _emberTestingTestHelpers, _emberTestingTestOn_inject_helpers, _emberTestingTestPromise, _emberTestingTestWaiters, _emberTestingTestAdapter, _emberMetal) {
  /**
    @module ember
    @submodule ember-testing
  */
  'use strict';

  /**
    This is a container for an assortment of testing related functionality:
  
    * Choose your default test adapter (for your framework of choice).
    * Register/Unregister additional test helpers.
    * Setup callbacks to be fired when the test helpers are injected into
      your application.
  
    @class Test
    @namespace Ember
    @public
  */
  var Test = {
    /**
      Hash containing all known test helpers.
       @property _helpers
      @private
      @since 1.7.0
    */
    _helpers: _emberTestingTestHelpers.helpers,

    registerHelper: _emberTestingTestHelpers.registerHelper,
    registerAsyncHelper: _emberTestingTestHelpers.registerAsyncHelper,
    unregisterHelper: _emberTestingTestHelpers.unregisterHelper,
    onInjectHelpers: _emberTestingTestOn_inject_helpers.onInjectHelpers,
    Promise: _emberTestingTestPromise.default,
    promise: _emberTestingTestPromise.promise,
    resolve: _emberTestingTestPromise.resolve,
    registerWaiter: _emberTestingTestWaiters.registerWaiter,
    unregisterWaiter: _emberTestingTestWaiters.unregisterWaiter
  };

  if (true) {
    Test.checkWaiters = _emberTestingTestWaiters.checkWaiters;
  }

  /**
   Used to allow ember-testing to communicate with a specific testing
   framework.
  
   You can manually set it before calling `App.setupForTesting()`.
  
   Example:
  
   ```javascript
   Ember.Test.adapter = MyCustomAdapter.create()
   ```
  
   If you do not set it, ember-testing will default to `Ember.Test.QUnitAdapter`.
  
   @public
   @for Ember.Test
   @property adapter
   @type {Class} The adapter to be used.
   @default Ember.Test.QUnitAdapter
  */
  Object.defineProperty(Test, 'adapter', {
    get: _emberTestingTestAdapter.getAdapter,
    set: _emberTestingTestAdapter.setAdapter
  });

  Object.defineProperty(Test, 'waiters', {
    get: _emberTestingTestWaiters.generateDeprecatedWaitersArray
  });

  exports.default = Test;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0NBLE1BQU0sSUFBSSxHQUFHOzs7Ozs7O0FBUVgsWUFBUSwyQkEzQ1IsT0FBTyxBQTJDVTs7QUFFakIsa0JBQWMsMkJBNUNkLGNBQWMsQUE0Q0E7QUFDZCx1QkFBbUIsMkJBNUNuQixtQkFBbUIsQUE0Q0E7QUFDbkIsb0JBQWdCLDJCQTVDaEIsZ0JBQWdCLEFBNENBO0FBQ2hCLG1CQUFlLHFDQTNDUixlQUFlLEFBMkNQO0FBQ2YsV0FBTyxrQ0FBYTtBQUNwQixXQUFPLDJCQTNDUCxPQUFPLEFBMkNBO0FBQ1AsV0FBTywyQkEzQ1AsT0FBTyxBQTJDQTtBQUNQLGtCQUFjLDJCQXhDZCxjQUFjLEFBd0NBO0FBQ2Qsb0JBQWdCLDJCQXhDaEIsZ0JBQWdCLEFBd0NBO0dBQ2pCLENBQUM7O0FBRUYsWUFBcUQ7QUFDbkQsUUFBSSxDQUFDLFlBQVksNEJBOUNqQixZQUFZLEFBOENvQixDQUFDO0dBQ2xDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JELFFBQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtBQUNyQyxPQUFHLDJCQS9ESCxVQUFVLEFBK0RLO0FBQ2YsT0FBRywyQkEvREgsVUFBVSxBQStESztHQUNoQixDQUFDLENBQUM7O0FBRUgsUUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO0FBQ3JDLE9BQUcsMkJBeEVILDhCQUE4QixBQXdFSztHQUNwQyxDQUFDLENBQUM7O29CQUVZLElBQUkiLCJmaWxlIjoiZW1iZXItdGVzdGluZy90ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gIEBtb2R1bGUgZW1iZXJcbiAgQHN1Ym1vZHVsZSBlbWJlci10ZXN0aW5nXG4qL1xuaW1wb3J0IHtcbiAgaGVscGVycyxcbiAgcmVnaXN0ZXJIZWxwZXIsXG4gIHJlZ2lzdGVyQXN5bmNIZWxwZXIsXG4gIHVucmVnaXN0ZXJIZWxwZXJcbn0gZnJvbSAnLi90ZXN0L2hlbHBlcnMnO1xuaW1wb3J0IHsgb25JbmplY3RIZWxwZXJzIH0gZnJvbSAnLi90ZXN0L29uX2luamVjdF9oZWxwZXJzJztcbmltcG9ydCBUZXN0UHJvbWlzZSwge1xuICBwcm9taXNlLFxuICByZXNvbHZlXG59IGZyb20gJy4vdGVzdC9wcm9taXNlJztcbmltcG9ydCB7XG4gIGNoZWNrV2FpdGVycyxcbiAgcmVnaXN0ZXJXYWl0ZXIsXG4gIHVucmVnaXN0ZXJXYWl0ZXIsXG4gIGdlbmVyYXRlRGVwcmVjYXRlZFdhaXRlcnNBcnJheVxufSBmcm9tICcuL3Rlc3Qvd2FpdGVycyc7XG5cbmltcG9ydCB7XG4gIGdldEFkYXB0ZXIsXG4gIHNldEFkYXB0ZXJcbn0gZnJvbSAnLi90ZXN0L2FkYXB0ZXInO1xuaW1wb3J0IHsgaXNGZWF0dXJlRW5hYmxlZCB9IGZyb20gJ2VtYmVyLW1ldGFsJztcblxuLyoqXG4gIFRoaXMgaXMgYSBjb250YWluZXIgZm9yIGFuIGFzc29ydG1lbnQgb2YgdGVzdGluZyByZWxhdGVkIGZ1bmN0aW9uYWxpdHk6XG5cbiAgKiBDaG9vc2UgeW91ciBkZWZhdWx0IHRlc3QgYWRhcHRlciAoZm9yIHlvdXIgZnJhbWV3b3JrIG9mIGNob2ljZSkuXG4gICogUmVnaXN0ZXIvVW5yZWdpc3RlciBhZGRpdGlvbmFsIHRlc3QgaGVscGVycy5cbiAgKiBTZXR1cCBjYWxsYmFja3MgdG8gYmUgZmlyZWQgd2hlbiB0aGUgdGVzdCBoZWxwZXJzIGFyZSBpbmplY3RlZCBpbnRvXG4gICAgeW91ciBhcHBsaWNhdGlvbi5cblxuICBAY2xhc3MgVGVzdFxuICBAbmFtZXNwYWNlIEVtYmVyXG4gIEBwdWJsaWNcbiovXG5jb25zdCBUZXN0ID0ge1xuICAvKipcbiAgICBIYXNoIGNvbnRhaW5pbmcgYWxsIGtub3duIHRlc3QgaGVscGVycy5cblxuICAgIEBwcm9wZXJ0eSBfaGVscGVyc1xuICAgIEBwcml2YXRlXG4gICAgQHNpbmNlIDEuNy4wXG4gICovXG4gIF9oZWxwZXJzOiBoZWxwZXJzLFxuXG4gIHJlZ2lzdGVySGVscGVyLFxuICByZWdpc3RlckFzeW5jSGVscGVyLFxuICB1bnJlZ2lzdGVySGVscGVyLFxuICBvbkluamVjdEhlbHBlcnMsXG4gIFByb21pc2U6IFRlc3RQcm9taXNlLFxuICBwcm9taXNlLFxuICByZXNvbHZlLFxuICByZWdpc3RlcldhaXRlcixcbiAgdW5yZWdpc3RlcldhaXRlclxufTtcblxuaWYgKGlzRmVhdHVyZUVuYWJsZWQoJ2VtYmVyLXRlc3RpbmctY2hlY2std2FpdGVycycpKSB7XG4gIFRlc3QuY2hlY2tXYWl0ZXJzID0gY2hlY2tXYWl0ZXJzO1xufVxuXG4vKipcbiBVc2VkIHRvIGFsbG93IGVtYmVyLXRlc3RpbmcgdG8gY29tbXVuaWNhdGUgd2l0aCBhIHNwZWNpZmljIHRlc3RpbmdcbiBmcmFtZXdvcmsuXG5cbiBZb3UgY2FuIG1hbnVhbGx5IHNldCBpdCBiZWZvcmUgY2FsbGluZyBgQXBwLnNldHVwRm9yVGVzdGluZygpYC5cblxuIEV4YW1wbGU6XG5cbiBgYGBqYXZhc2NyaXB0XG4gRW1iZXIuVGVzdC5hZGFwdGVyID0gTXlDdXN0b21BZGFwdGVyLmNyZWF0ZSgpXG4gYGBgXG5cbiBJZiB5b3UgZG8gbm90IHNldCBpdCwgZW1iZXItdGVzdGluZyB3aWxsIGRlZmF1bHQgdG8gYEVtYmVyLlRlc3QuUVVuaXRBZGFwdGVyYC5cblxuIEBwdWJsaWNcbiBAZm9yIEVtYmVyLlRlc3RcbiBAcHJvcGVydHkgYWRhcHRlclxuIEB0eXBlIHtDbGFzc30gVGhlIGFkYXB0ZXIgdG8gYmUgdXNlZC5cbiBAZGVmYXVsdCBFbWJlci5UZXN0LlFVbml0QWRhcHRlclxuKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShUZXN0LCAnYWRhcHRlcicsIHtcbiAgZ2V0OiBnZXRBZGFwdGVyLFxuICBzZXQ6IHNldEFkYXB0ZXJcbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVGVzdCwgJ3dhaXRlcnMnLCB7XG4gIGdldDogZ2VuZXJhdGVEZXByZWNhdGVkV2FpdGVyc0FycmF5XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgVGVzdDtcbiJdfQ==
enifed('ember-testing/test/adapter', ['exports', 'ember-console', 'ember-metal'], function (exports, _emberConsole, _emberMetal) {
  'use strict';

  exports.getAdapter = getAdapter;
  exports.setAdapter = setAdapter;
  exports.asyncStart = asyncStart;
  exports.asyncEnd = asyncEnd;

  var adapter = undefined;

  function getAdapter() {
    return adapter;
  }

  function setAdapter(value) {
    adapter = value;
    if (value) {
      _emberMetal.setDispatchOverride(adapterDispatch);
    } else {
      _emberMetal.setDispatchOverride(null);
    }
  }

  function asyncStart() {
    if (adapter) {
      adapter.asyncStart();
    }
  }

  function asyncEnd() {
    if (adapter) {
      adapter.asyncEnd();
    }
  }

  function adapterDispatch(error) {
    adapter.exception(error);
    _emberConsole.default.error(error.stack);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvdGVzdC9hZGFwdGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBR0EsTUFBSSxPQUFPLFlBQUEsQ0FBQzs7QUFDTCxXQUFTLFVBQVUsR0FBRztBQUMzQixXQUFPLE9BQU8sQ0FBQztHQUNoQjs7QUFFTSxXQUFTLFVBQVUsQ0FBQyxLQUFLLEVBQUU7QUFDaEMsV0FBTyxHQUFHLEtBQUssQ0FBQztBQUNoQixRQUFJLEtBQUssRUFBRTtBQUNULGtCQVZLLG1CQUFtQixDQVVKLGVBQWUsQ0FBQyxDQUFDO0tBQ3RDLE1BQU07QUFDTCxrQkFaSyxtQkFBbUIsQ0FZSixJQUFJLENBQUMsQ0FBQztLQUMzQjtHQUNGOztBQUVNLFdBQVMsVUFBVSxHQUFHO0FBQzNCLFFBQUksT0FBTyxFQUFFO0FBQ1gsYUFBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ3RCO0dBQ0Y7O0FBRU0sV0FBUyxRQUFRLEdBQUc7QUFDekIsUUFBSSxPQUFPLEVBQUU7QUFDWCxhQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDcEI7R0FDRjs7QUFFRCxXQUFTLGVBQWUsQ0FBQyxLQUFLLEVBQUU7QUFDOUIsV0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QiwwQkFBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQzNCIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvdGVzdC9hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZ2dlciBmcm9tICdlbWJlci1jb25zb2xlJztcbmltcG9ydCB7IHNldERpc3BhdGNoT3ZlcnJpZGUgfSBmcm9tICdlbWJlci1tZXRhbCc7XG5cbmxldCBhZGFwdGVyO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFkYXB0ZXIoKSB7XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QWRhcHRlcih2YWx1ZSkge1xuICBhZGFwdGVyID0gdmFsdWU7XG4gIGlmICh2YWx1ZSkge1xuICAgIHNldERpc3BhdGNoT3ZlcnJpZGUoYWRhcHRlckRpc3BhdGNoKTtcbiAgfSBlbHNlIHtcbiAgICBzZXREaXNwYXRjaE92ZXJyaWRlKG51bGwpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY1N0YXJ0KCkge1xuICBpZiAoYWRhcHRlcikge1xuICAgIGFkYXB0ZXIuYXN5bmNTdGFydCgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0VuZCgpIHtcbiAgaWYgKGFkYXB0ZXIpIHtcbiAgICBhZGFwdGVyLmFzeW5jRW5kKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRhcHRlckRpc3BhdGNoKGVycm9yKSB7XG4gIGFkYXB0ZXIuZXhjZXB0aW9uKGVycm9yKTtcbiAgTG9nZ2VyLmVycm9yKGVycm9yLnN0YWNrKTtcbn1cbiJdfQ==
enifed('ember-testing/test/helpers', ['exports', 'ember-testing/test/promise'], function (exports, _emberTestingTestPromise) {
  'use strict';

  exports.registerHelper = registerHelper;
  exports.registerAsyncHelper = registerAsyncHelper;
  exports.unregisterHelper = unregisterHelper;
  var helpers = {};

  exports.helpers = helpers;
  /**
    `registerHelper` is used to register a test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    Ember.Test.registerHelper('boot', function(app) {
      Ember.run(app, app.advanceReadiness);
    });
    ```
  
    This helper can later be called without arguments because it will be
    called with `app` as the first parameter.
  
    ```javascript
    App = Ember.Application.create();
    App.injectTestHelpers();
    boot();
    ```
  
    @public
    @for Ember.Test
    @method registerHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @param options {Object}
  */

  function registerHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: { wait: false }
    };
  }

  /**
    `registerAsyncHelper` is used to register an async test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('boot', function(app) {
      Ember.run(app, app.advanceReadiness);
    });
    ```
  
    The advantage of an async helper is that it will not run
    until the last async helper has completed.  All async helpers
    after it will wait for it complete before running.
  
  
    For example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('deletePost', function(app, postId) {
      click('.delete-' + postId);
    });
  
    // ... in your test
    visit('/post/2');
    deletePost(2);
    visit('/post/3');
    deletePost(3);
    ```
  
    @public
    @for Ember.Test
    @method registerAsyncHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @since 1.2.0
  */

  function registerAsyncHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: { wait: true }
    };
  }

  /**
    Remove a previously added helper method.
  
    Example:
  
    ```javascript
    Ember.Test.unregisterHelper('wait');
    ```
  
    @public
    @method unregisterHelper
    @param {String} name The helper to remove.
  */

  function unregisterHelper(name) {
    delete helpers[name];
    delete _emberTestingTestPromise.default.prototype[name];
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvdGVzdC9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVPLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQ25CLFdBQVMsY0FBYyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7QUFDakQsV0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHO0FBQ2QsWUFBTSxFQUFFLFlBQVk7QUFDcEIsVUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtLQUN0QixDQUFDO0dBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkNNLFdBQVMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtBQUN0RCxXQUFPLENBQUMsSUFBSSxDQUFDLEdBQUc7QUFDZCxZQUFNLEVBQUUsWUFBWTtBQUNwQixVQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0tBQ3JCLENBQUM7R0FDSDs7Ozs7Ozs7Ozs7Ozs7OztBQWVNLFdBQVMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFO0FBQ3JDLFdBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JCLFdBQU8saUNBQVksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BDIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvdGVzdC9oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlc3RQcm9taXNlIGZyb20gJy4vcHJvbWlzZSc7XG5cbmV4cG9ydCBjb25zdCBoZWxwZXJzID0ge307XG5cbi8qKlxuICBgcmVnaXN0ZXJIZWxwZXJgIGlzIHVzZWQgdG8gcmVnaXN0ZXIgYSB0ZXN0IGhlbHBlciB0aGF0IHdpbGwgYmUgaW5qZWN0ZWRcbiAgd2hlbiBgQXBwLmluamVjdFRlc3RIZWxwZXJzYCBpcyBjYWxsZWQuXG5cbiAgVGhlIGhlbHBlciBtZXRob2Qgd2lsbCBhbHdheXMgYmUgY2FsbGVkIHdpdGggdGhlIGN1cnJlbnQgQXBwbGljYXRpb24gYXNcbiAgdGhlIGZpcnN0IHBhcmFtZXRlci5cblxuICBGb3IgZXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIEVtYmVyLlRlc3QucmVnaXN0ZXJIZWxwZXIoJ2Jvb3QnLCBmdW5jdGlvbihhcHApIHtcbiAgICBFbWJlci5ydW4oYXBwLCBhcHAuYWR2YW5jZVJlYWRpbmVzcyk7XG4gIH0pO1xuICBgYGBcblxuICBUaGlzIGhlbHBlciBjYW4gbGF0ZXIgYmUgY2FsbGVkIHdpdGhvdXQgYXJndW1lbnRzIGJlY2F1c2UgaXQgd2lsbCBiZVxuICBjYWxsZWQgd2l0aCBgYXBwYCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgQXBwID0gRW1iZXIuQXBwbGljYXRpb24uY3JlYXRlKCk7XG4gIEFwcC5pbmplY3RUZXN0SGVscGVycygpO1xuICBib290KCk7XG4gIGBgYFxuXG4gIEBwdWJsaWNcbiAgQGZvciBFbWJlci5UZXN0XG4gIEBtZXRob2QgcmVnaXN0ZXJIZWxwZXJcbiAgQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGhlbHBlciBtZXRob2QgdG8gYWRkLlxuICBAcGFyYW0ge0Z1bmN0aW9ufSBoZWxwZXJNZXRob2RcbiAgQHBhcmFtIG9wdGlvbnMge09iamVjdH1cbiovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJIZWxwZXIobmFtZSwgaGVscGVyTWV0aG9kKSB7XG4gIGhlbHBlcnNbbmFtZV0gPSB7XG4gICAgbWV0aG9kOiBoZWxwZXJNZXRob2QsXG4gICAgbWV0YTogeyB3YWl0OiBmYWxzZSB9XG4gIH07XG59XG5cbi8qKlxuICBgcmVnaXN0ZXJBc3luY0hlbHBlcmAgaXMgdXNlZCB0byByZWdpc3RlciBhbiBhc3luYyB0ZXN0IGhlbHBlciB0aGF0IHdpbGwgYmUgaW5qZWN0ZWRcbiAgd2hlbiBgQXBwLmluamVjdFRlc3RIZWxwZXJzYCBpcyBjYWxsZWQuXG5cbiAgVGhlIGhlbHBlciBtZXRob2Qgd2lsbCBhbHdheXMgYmUgY2FsbGVkIHdpdGggdGhlIGN1cnJlbnQgQXBwbGljYXRpb24gYXNcbiAgdGhlIGZpcnN0IHBhcmFtZXRlci5cblxuICBGb3IgZXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIEVtYmVyLlRlc3QucmVnaXN0ZXJBc3luY0hlbHBlcignYm9vdCcsIGZ1bmN0aW9uKGFwcCkge1xuICAgIEVtYmVyLnJ1bihhcHAsIGFwcC5hZHZhbmNlUmVhZGluZXNzKTtcbiAgfSk7XG4gIGBgYFxuXG4gIFRoZSBhZHZhbnRhZ2Ugb2YgYW4gYXN5bmMgaGVscGVyIGlzIHRoYXQgaXQgd2lsbCBub3QgcnVuXG4gIHVudGlsIHRoZSBsYXN0IGFzeW5jIGhlbHBlciBoYXMgY29tcGxldGVkLiAgQWxsIGFzeW5jIGhlbHBlcnNcbiAgYWZ0ZXIgaXQgd2lsbCB3YWl0IGZvciBpdCBjb21wbGV0ZSBiZWZvcmUgcnVubmluZy5cblxuXG4gIEZvciBleGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgRW1iZXIuVGVzdC5yZWdpc3RlckFzeW5jSGVscGVyKCdkZWxldGVQb3N0JywgZnVuY3Rpb24oYXBwLCBwb3N0SWQpIHtcbiAgICBjbGljaygnLmRlbGV0ZS0nICsgcG9zdElkKTtcbiAgfSk7XG5cbiAgLy8gLi4uIGluIHlvdXIgdGVzdFxuICB2aXNpdCgnL3Bvc3QvMicpO1xuICBkZWxldGVQb3N0KDIpO1xuICB2aXNpdCgnL3Bvc3QvMycpO1xuICBkZWxldGVQb3N0KDMpO1xuICBgYGBcblxuICBAcHVibGljXG4gIEBmb3IgRW1iZXIuVGVzdFxuICBAbWV0aG9kIHJlZ2lzdGVyQXN5bmNIZWxwZXJcbiAgQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGhlbHBlciBtZXRob2QgdG8gYWRkLlxuICBAcGFyYW0ge0Z1bmN0aW9ufSBoZWxwZXJNZXRob2RcbiAgQHNpbmNlIDEuMi4wXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQXN5bmNIZWxwZXIobmFtZSwgaGVscGVyTWV0aG9kKSB7XG4gIGhlbHBlcnNbbmFtZV0gPSB7XG4gICAgbWV0aG9kOiBoZWxwZXJNZXRob2QsXG4gICAgbWV0YTogeyB3YWl0OiB0cnVlIH1cbiAgfTtcbn1cblxuLyoqXG4gIFJlbW92ZSBhIHByZXZpb3VzbHkgYWRkZWQgaGVscGVyIG1ldGhvZC5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgRW1iZXIuVGVzdC51bnJlZ2lzdGVySGVscGVyKCd3YWl0Jyk7XG4gIGBgYFxuXG4gIEBwdWJsaWNcbiAgQG1ldGhvZCB1bnJlZ2lzdGVySGVscGVyXG4gIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBoZWxwZXIgdG8gcmVtb3ZlLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnJlZ2lzdGVySGVscGVyKG5hbWUpIHtcbiAgZGVsZXRlIGhlbHBlcnNbbmFtZV07XG4gIGRlbGV0ZSBUZXN0UHJvbWlzZS5wcm90b3R5cGVbbmFtZV07XG59XG4iXX0=
enifed("ember-testing/test/on_inject_helpers", ["exports"], function (exports) {
  "use strict";

  exports.onInjectHelpers = onInjectHelpers;
  exports.invokeInjectHelpersCallbacks = invokeInjectHelpersCallbacks;
  var callbacks = [];

  exports.callbacks = callbacks;
  /**
    Used to register callbacks to be fired whenever `App.injectTestHelpers`
    is called.
  
    The callback will receive the current application as an argument.
  
    Example:
  
    ```javascript
    Ember.Test.onInjectHelpers(function() {
      Ember.$(document).ajaxSend(function() {
        Test.pendingRequests++;
      });
  
      Ember.$(document).ajaxComplete(function() {
        Test.pendingRequests--;
      });
    });
    ```
  
    @public
    @for Ember.Test
    @method onInjectHelpers
    @param {Function} callback The function to be called.
  */

  function onInjectHelpers(callback) {
    callbacks.push(callback);
  }

  function invokeInjectHelpersCallbacks(app) {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i](app);
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvdGVzdC9vbl9pbmplY3RfaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFPLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQnJCLFdBQVMsZUFBZSxDQUFDLFFBQVEsRUFBRTtBQUN4QyxhQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQzFCOztBQUVNLFdBQVMsNEJBQTRCLENBQUMsR0FBRyxFQUFFO0FBQ2hELFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3pDLGVBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNuQjtHQUNGIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvdGVzdC9vbl9pbmplY3RfaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBjYWxsYmFja3MgPSBbXTtcblxuLyoqXG4gIFVzZWQgdG8gcmVnaXN0ZXIgY2FsbGJhY2tzIHRvIGJlIGZpcmVkIHdoZW5ldmVyIGBBcHAuaW5qZWN0VGVzdEhlbHBlcnNgXG4gIGlzIGNhbGxlZC5cblxuICBUaGUgY2FsbGJhY2sgd2lsbCByZWNlaXZlIHRoZSBjdXJyZW50IGFwcGxpY2F0aW9uIGFzIGFuIGFyZ3VtZW50LlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBFbWJlci5UZXN0Lm9uSW5qZWN0SGVscGVycyhmdW5jdGlvbigpIHtcbiAgICBFbWJlci4kKGRvY3VtZW50KS5hamF4U2VuZChmdW5jdGlvbigpIHtcbiAgICAgIFRlc3QucGVuZGluZ1JlcXVlc3RzKys7XG4gICAgfSk7XG5cbiAgICBFbWJlci4kKGRvY3VtZW50KS5hamF4Q29tcGxldGUoZnVuY3Rpb24oKSB7XG4gICAgICBUZXN0LnBlbmRpbmdSZXF1ZXN0cy0tO1xuICAgIH0pO1xuICB9KTtcbiAgYGBgXG5cbiAgQHB1YmxpY1xuICBAZm9yIEVtYmVyLlRlc3RcbiAgQG1ldGhvZCBvbkluamVjdEhlbHBlcnNcbiAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZC5cbiovXG5leHBvcnQgZnVuY3Rpb24gb25JbmplY3RIZWxwZXJzKGNhbGxiYWNrKSB7XG4gIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludm9rZUluamVjdEhlbHBlcnNDYWxsYmFja3MoYXBwKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2FsbGJhY2tzW2ldKGFwcCk7XG4gIH1cbn1cbiJdfQ==
enifed("ember-testing/test/pending_requests", ["exports"], function (exports) {
  "use strict";

  exports.pendingRequests = pendingRequests;
  exports.clearPendingRequests = clearPendingRequests;
  exports.incrementPendingRequests = incrementPendingRequests;
  exports.decrementPendingRequests = decrementPendingRequests;
  var requests = [];

  function pendingRequests() {
    return requests.length;
  }

  function clearPendingRequests() {
    requests.length = 0;
  }

  function incrementPendingRequests(_, xhr) {
    requests.push(xhr);
  }

  function decrementPendingRequests(_, xhr) {
    for (var i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
        break;
      }
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvdGVzdC9wZW5kaW5nX3JlcXVlc3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSxNQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7O0FBRVgsV0FBUyxlQUFlLEdBQUc7QUFDaEMsV0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDO0dBQ3hCOztBQUVNLFdBQVMsb0JBQW9CLEdBQUc7QUFDckMsWUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7R0FDckI7O0FBRU0sV0FBUyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFO0FBQy9DLFlBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDcEI7O0FBRU0sV0FBUyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFO0FBQy9DLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hDLFVBQUksR0FBRyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN2QixnQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEIsY0FBTTtPQUNQO0tBQ0Y7R0FDRiIsImZpbGUiOiJlbWJlci10ZXN0aW5nL3Rlc3QvcGVuZGluZ19yZXF1ZXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImxldCByZXF1ZXN0cyA9IFtdO1xuXG5leHBvcnQgZnVuY3Rpb24gcGVuZGluZ1JlcXVlc3RzKCkge1xuICByZXR1cm4gcmVxdWVzdHMubGVuZ3RoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJQZW5kaW5nUmVxdWVzdHMoKSB7XG4gIHJlcXVlc3RzLmxlbmd0aCA9IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmNyZW1lbnRQZW5kaW5nUmVxdWVzdHMoXywgeGhyKSB7XG4gIHJlcXVlc3RzLnB1c2goeGhyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY3JlbWVudFBlbmRpbmdSZXF1ZXN0cyhfLCB4aHIpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXF1ZXN0cy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh4aHIgPT09IHJlcXVlc3RzW2ldKSB7XG4gICAgICByZXF1ZXN0cy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiJdfQ==
enifed('ember-testing/test/promise', ['exports', 'ember-runtime', 'ember-testing/test/run'], function (exports, _emberRuntime, _emberTestingTestRun) {
  'use strict';

  exports.promise = promise;
  exports.resolve = resolve;
  exports.getLastPromise = getLastPromise;

  var lastPromise = undefined;

  var TestPromise = (function (_RSVP$Promise) {
    babelHelpers.inherits(TestPromise, _RSVP$Promise);

    function TestPromise() {
      babelHelpers.classCallCheck(this, TestPromise);

      _RSVP$Promise.apply(this, arguments);
      lastPromise = this;
    }

    /**
      This returns a thenable tailored for testing.  It catches failed
      `onSuccess` callbacks and invokes the `Ember.Test.adapter.exception`
      callback in the last chained then.
    
      This method should be returned by async helpers such as `wait`.
    
      @public
      @for Ember.Test
      @method promise
      @param {Function} resolver The function used to resolve the promise.
      @param {String} label An optional string for identifying the promise.
    */

    TestPromise.prototype.then = function then(onFulfillment) {
      var _RSVP$Promise$prototype$then;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return (_RSVP$Promise$prototype$then = _RSVP$Promise.prototype.then).call.apply(_RSVP$Promise$prototype$then, [this, function (result) {
        return isolate(onFulfillment, result);
      }].concat(args));
    };

    return TestPromise;
  })(_emberRuntime.RSVP.Promise);

  exports.default = TestPromise;

  function promise(resolver, label) {
    var fullLabel = 'Ember.Test.promise: ' + (label || '<Unknown Promise>');
    return new TestPromise(resolver, fullLabel);
  }

  /**
    Replacement for `Ember.RSVP.resolve`
    The only difference is this uses
    an instance of `Ember.Test.Promise`
  
    @public
    @for Ember.Test
    @method resolve
    @param {Mixed} The value to resolve
    @since 1.2.0
  */

  function resolve(result, label) {
    return TestPromise.resolve(result, label);
  }

  function getLastPromise() {
    return lastPromise;
  }

  // This method isolates nested async methods
  // so that they don't conflict with other last promises.
  //
  // 1. Set `Ember.Test.lastPromise` to null
  // 2. Invoke method
  // 3. Return the last promise created during method
  function isolate(onFulfillment, result) {
    // Reset lastPromise for nested helpers
    lastPromise = null;

    var value = onFulfillment(result);

    var promise = lastPromise;
    lastPromise = null;

    // If the method returned a promise
    // return that promise. If not,
    // return the last async helper's promise
    if (value && value instanceof TestPromise || !promise) {
      return value;
    } else {
      return _emberTestingTestRun.default(function () {
        return resolve(promise).then(function () {
          return value;
        });
      });
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvdGVzdC9wcm9taXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFHQSxNQUFJLFdBQVcsWUFBQSxDQUFDOztNQUVLLFdBQVc7MEJBQVgsV0FBVzs7QUFDbkIsYUFEUSxXQUFXLEdBQ2hCO3dDQURLLFdBQVc7O0FBRTVCLGdDQUFTLFNBQVMsQ0FBQyxDQUFDO0FBQ3BCLGlCQUFXLEdBQUcsSUFBSSxDQUFDO0tBQ3BCOzs7Ozs7Ozs7Ozs7Ozs7O0FBSmtCLGVBQVcsV0FNOUIsSUFBSSxHQUFBLGNBQUMsYUFBYSxFQUFXOzs7d0NBQU4sSUFBSTtBQUFKLFlBQUk7OztBQUN6QixhQUFPLHdEQUFNLElBQUksWUFBQSxzQ0FBQyxVQUFBLE1BQU07ZUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztPQUFBLFNBQUssSUFBSSxFQUFDLENBQUM7S0FDdEU7O1dBUmtCLFdBQVc7S0FBUyxjQUxoQyxJQUFJLENBS2lDLE9BQU87O29CQUFoQyxXQUFXOztBQXdCekIsV0FBUyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRTtBQUN2QyxRQUFJLFNBQVMsNkJBQTBCLEtBQUssSUFBSSxtQkFBbUIsQ0FBQSxBQUFFLENBQUM7QUFDdEUsV0FBTyxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7R0FDN0M7Ozs7Ozs7Ozs7Ozs7O0FBYU0sV0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRTtBQUNyQyxXQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQzNDOztBQUVNLFdBQVMsY0FBYyxHQUFHO0FBQy9CLFdBQU8sV0FBVyxDQUFDO0dBQ3BCOzs7Ozs7OztBQVNELFdBQVMsT0FBTyxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUU7O0FBRXRDLGVBQVcsR0FBRyxJQUFJLENBQUM7O0FBRW5CLFFBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFbEMsUUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDO0FBQzFCLGVBQVcsR0FBRyxJQUFJLENBQUM7Ozs7O0FBS25CLFFBQUksQUFBQyxLQUFLLElBQUssS0FBSyxZQUFZLFdBQVcsQUFBQyxJQUFLLENBQUMsT0FBTyxFQUFFO0FBQ3pELGFBQU8sS0FBSyxDQUFDO0tBQ2QsTUFBTTtBQUNMLGFBQU8sNkJBQUk7ZUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO2lCQUFNLEtBQUs7U0FBQSxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ3REO0dBQ0YiLCJmaWxlIjoiZW1iZXItdGVzdGluZy90ZXN0L3Byb21pc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSU1ZQIH0gZnJvbSAnZW1iZXItcnVudGltZSc7XG5pbXBvcnQgcnVuIGZyb20gJy4vcnVuJztcblxubGV0IGxhc3RQcm9taXNlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0UHJvbWlzZSBleHRlbmRzIFJTVlAuUHJvbWlzZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgbGFzdFByb21pc2UgPSB0aGlzO1xuICB9XG5cbiAgdGhlbihvbkZ1bGZpbGxtZW50LCAuLi5hcmdzKSB7XG4gICAgcmV0dXJuIHN1cGVyLnRoZW4ocmVzdWx0ID0+IGlzb2xhdGUob25GdWxmaWxsbWVudCwgcmVzdWx0KSwgLi4uYXJncyk7XG4gIH1cbn1cblxuLyoqXG4gIFRoaXMgcmV0dXJucyBhIHRoZW5hYmxlIHRhaWxvcmVkIGZvciB0ZXN0aW5nLiAgSXQgY2F0Y2hlcyBmYWlsZWRcbiAgYG9uU3VjY2Vzc2AgY2FsbGJhY2tzIGFuZCBpbnZva2VzIHRoZSBgRW1iZXIuVGVzdC5hZGFwdGVyLmV4Y2VwdGlvbmBcbiAgY2FsbGJhY2sgaW4gdGhlIGxhc3QgY2hhaW5lZCB0aGVuLlxuXG4gIFRoaXMgbWV0aG9kIHNob3VsZCBiZSByZXR1cm5lZCBieSBhc3luYyBoZWxwZXJzIHN1Y2ggYXMgYHdhaXRgLlxuXG4gIEBwdWJsaWNcbiAgQGZvciBFbWJlci5UZXN0XG4gIEBtZXRob2QgcHJvbWlzZVxuICBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlciBUaGUgZnVuY3Rpb24gdXNlZCB0byByZXNvbHZlIHRoZSBwcm9taXNlLlxuICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgQW4gb3B0aW9uYWwgc3RyaW5nIGZvciBpZGVudGlmeWluZyB0aGUgcHJvbWlzZS5cbiovXG5leHBvcnQgZnVuY3Rpb24gcHJvbWlzZShyZXNvbHZlciwgbGFiZWwpIHtcbiAgbGV0IGZ1bGxMYWJlbCA9IGBFbWJlci5UZXN0LnByb21pc2U6ICR7bGFiZWwgfHwgJzxVbmtub3duIFByb21pc2U+J31gO1xuICByZXR1cm4gbmV3IFRlc3RQcm9taXNlKHJlc29sdmVyLCBmdWxsTGFiZWwpO1xufVxuXG4vKipcbiAgUmVwbGFjZW1lbnQgZm9yIGBFbWJlci5SU1ZQLnJlc29sdmVgXG4gIFRoZSBvbmx5IGRpZmZlcmVuY2UgaXMgdGhpcyB1c2VzXG4gIGFuIGluc3RhbmNlIG9mIGBFbWJlci5UZXN0LlByb21pc2VgXG5cbiAgQHB1YmxpY1xuICBAZm9yIEVtYmVyLlRlc3RcbiAgQG1ldGhvZCByZXNvbHZlXG4gIEBwYXJhbSB7TWl4ZWR9IFRoZSB2YWx1ZSB0byByZXNvbHZlXG4gIEBzaW5jZSAxLjIuMFxuKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlKHJlc3VsdCwgbGFiZWwpIHtcbiAgcmV0dXJuIFRlc3RQcm9taXNlLnJlc29sdmUocmVzdWx0LCBsYWJlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYXN0UHJvbWlzZSgpIHtcbiAgcmV0dXJuIGxhc3RQcm9taXNlO1xufVxuXG5cbi8vIFRoaXMgbWV0aG9kIGlzb2xhdGVzIG5lc3RlZCBhc3luYyBtZXRob2RzXG4vLyBzbyB0aGF0IHRoZXkgZG9uJ3QgY29uZmxpY3Qgd2l0aCBvdGhlciBsYXN0IHByb21pc2VzLlxuLy9cbi8vIDEuIFNldCBgRW1iZXIuVGVzdC5sYXN0UHJvbWlzZWAgdG8gbnVsbFxuLy8gMi4gSW52b2tlIG1ldGhvZFxuLy8gMy4gUmV0dXJuIHRoZSBsYXN0IHByb21pc2UgY3JlYXRlZCBkdXJpbmcgbWV0aG9kXG5mdW5jdGlvbiBpc29sYXRlKG9uRnVsZmlsbG1lbnQsIHJlc3VsdCkge1xuICAvLyBSZXNldCBsYXN0UHJvbWlzZSBmb3IgbmVzdGVkIGhlbHBlcnNcbiAgbGFzdFByb21pc2UgPSBudWxsO1xuXG4gIGxldCB2YWx1ZSA9IG9uRnVsZmlsbG1lbnQocmVzdWx0KTtcblxuICBsZXQgcHJvbWlzZSA9IGxhc3RQcm9taXNlO1xuICBsYXN0UHJvbWlzZSA9IG51bGw7XG5cbiAgLy8gSWYgdGhlIG1ldGhvZCByZXR1cm5lZCBhIHByb21pc2VcbiAgLy8gcmV0dXJuIHRoYXQgcHJvbWlzZS4gSWYgbm90LFxuICAvLyByZXR1cm4gdGhlIGxhc3QgYXN5bmMgaGVscGVyJ3MgcHJvbWlzZVxuICBpZiAoKHZhbHVlICYmICh2YWx1ZSBpbnN0YW5jZW9mIFRlc3RQcm9taXNlKSkgfHwgIXByb21pc2UpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJ1bigoKSA9PiByZXNvbHZlKHByb21pc2UpLnRoZW4oKCkgPT4gdmFsdWUpKTtcbiAgfVxufVxuIl19
enifed('ember-testing/test/run', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.default = run;

  function run(fn) {
    if (!_emberMetal.run.currentRunLoop) {
      return _emberMetal.run(fn);
    } else {
      return fn();
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvdGVzdC9ydW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O29CQUV3QixHQUFHOztBQUFaLFdBQVMsR0FBRyxDQUFDLEVBQUUsRUFBRTtBQUM5QixRQUFJLENBQUMsWUFIRSxHQUFHLENBR0ksY0FBYyxFQUFFO0FBQzVCLGFBQU8sWUFKRixHQUFHLENBSVEsRUFBRSxDQUFDLENBQUM7S0FDckIsTUFBTTtBQUNMLGFBQU8sRUFBRSxFQUFFLENBQUM7S0FDYjtHQUNGIiwiZmlsZSI6ImVtYmVyLXRlc3RpbmcvdGVzdC9ydW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBydW4gYXMgZW1iZXJSdW4gfSBmcm9tICdlbWJlci1tZXRhbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJ1bihmbikge1xuICBpZiAoIWVtYmVyUnVuLmN1cnJlbnRSdW5Mb29wKSB7XG4gICAgcmV0dXJuIGVtYmVyUnVuKGZuKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oKTtcbiAgfVxufVxuIl19
enifed('ember-testing/test/waiters', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.registerWaiter = registerWaiter;
  exports.unregisterWaiter = unregisterWaiter;
  exports.checkWaiters = checkWaiters;
  exports.generateDeprecatedWaitersArray = generateDeprecatedWaitersArray;

  var contexts = [];
  var callbacks = [];

  /**
     This allows ember-testing to play nicely with other asynchronous
     events, such as an application that is waiting for a CSS3
     transition or an IndexDB transaction. The waiter runs periodically
     after each async helper (i.e. `click`, `andThen`, `visit`, etc) has executed,
     until the returning result is truthy. After the waiters finish, the next async helper
     is executed and the process repeats.
  
     For example:
  
     ```javascript
     Ember.Test.registerWaiter(function() {
       return myPendingTransactions() == 0;
     });
     ```
     The `context` argument allows you to optionally specify the `this`
     with which your callback will be invoked.
  
     For example:
  
     ```javascript
     Ember.Test.registerWaiter(MyDB, MyDB.hasPendingTransactions);
     ```
  
     @public
     @for Ember.Test
     @method registerWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */

  function registerWaiter(context, callback) {
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    if (indexOf(context, callback) > -1) {
      return;
    }
    contexts.push(context);
    callbacks.push(callback);
  }

  /**
     `unregisterWaiter` is used to unregister a callback that was
     registered with `registerWaiter`.
  
     @public
     @for Ember.Test
     @method unregisterWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */

  function unregisterWaiter(context, callback) {
    if (!callbacks.length) {
      return;
    }
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    var i = indexOf(context, callback);
    if (i === -1) {
      return;
    }
    contexts.splice(i, 1);
    callbacks.splice(i, 1);
  }

  /**
    Iterates through each registered test waiter, and invokes
    its callback. If any waiter returns false, this method will return
    true indicating that the waiters have not settled yet.
  
    This is generally used internally from the acceptance/integration test
    infrastructure.
  
    @public
    @for Ember.Test
    @static
    @method checkWaiters
  */

  function checkWaiters() {
    if (!callbacks.length) {
      return false;
    }
    for (var i = 0; i < callbacks.length; i++) {
      var context = contexts[i];
      var callback = callbacks[i];
      if (!callback.call(context)) {
        return true;
      }
    }
    return false;
  }

  function indexOf(context, callback) {
    for (var i = 0; i < callbacks.length; i++) {
      if (callbacks[i] === callback && contexts[i] === context) {
        return i;
      }
    }
    return -1;
  }

  function generateDeprecatedWaitersArray() {
    _emberMetal.deprecate('Usage of `Ember.Test.waiters` is deprecated. Please refactor to `Ember.Test.checkWaiters`.', !true, { until: '2.8.0', id: 'ember-testing.test-waiters' });

    var array = new Array(callbacks.length);
    for (var i = 0; i < callbacks.length; i++) {
      var context = contexts[i];
      var callback = callbacks[i];

      array[i] = [context, callback];
    }

    return array;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVyLXRlc3RpbmcvdGVzdC93YWl0ZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBRUEsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlDZCxXQUFTLGNBQWMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ2hELFFBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUIsY0FBUSxHQUFHLE9BQU8sQ0FBQztBQUNuQixhQUFPLEdBQUcsSUFBSSxDQUFDO0tBQ2hCO0FBQ0QsUUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ25DLGFBQU87S0FDUjtBQUNELFlBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkIsYUFBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUMxQjs7Ozs7Ozs7Ozs7Ozs7QUFhTSxXQUFTLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDbEQsUUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDckIsYUFBTztLQUNSO0FBQ0QsUUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMxQixjQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ25CLGFBQU8sR0FBRyxJQUFJLENBQUM7S0FDaEI7QUFDRCxRQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ25DLFFBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ1osYUFBTztLQUNSO0FBQ0QsWUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEIsYUFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7R0FDeEI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlTSxXQUFTLFlBQVksR0FBRztBQUM3QixRQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtBQUNyQixhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsVUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFVBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUMzQixlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7QUFDRCxXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFdBQVMsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDbEMsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7QUFDeEQsZUFBTyxDQUFDLENBQUM7T0FDVjtLQUNGO0FBQ0QsV0FBTyxDQUFDLENBQUMsQ0FBQztHQUNYOztBQUVNLFdBQVMsOEJBQThCLEdBQUc7QUFDL0MsZ0JBaEh5QixTQUFTLENBaUhoQyw0RkFBNEYsRUFDNUYsS0FBZ0QsRUFDaEQsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSw0QkFBNEIsRUFBRSxDQUNyRCxDQUFDOztBQUVGLFFBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6QyxVQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsVUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU1QixXQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDaEM7O0FBRUQsV0FBTyxLQUFLLENBQUM7R0FDZCIsImZpbGUiOiJlbWJlci10ZXN0aW5nL3Rlc3Qvd2FpdGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzRmVhdHVyZUVuYWJsZWQsIGRlcHJlY2F0ZSB9IGZyb20gJ2VtYmVyLW1ldGFsJztcblxuY29uc3QgY29udGV4dHMgPSBbXTtcbmNvbnN0IGNhbGxiYWNrcyA9IFtdO1xuXG4vKipcbiAgIFRoaXMgYWxsb3dzIGVtYmVyLXRlc3RpbmcgdG8gcGxheSBuaWNlbHkgd2l0aCBvdGhlciBhc3luY2hyb25vdXNcbiAgIGV2ZW50cywgc3VjaCBhcyBhbiBhcHBsaWNhdGlvbiB0aGF0IGlzIHdhaXRpbmcgZm9yIGEgQ1NTM1xuICAgdHJhbnNpdGlvbiBvciBhbiBJbmRleERCIHRyYW5zYWN0aW9uLiBUaGUgd2FpdGVyIHJ1bnMgcGVyaW9kaWNhbGx5XG4gICBhZnRlciBlYWNoIGFzeW5jIGhlbHBlciAoaS5lLiBgY2xpY2tgLCBgYW5kVGhlbmAsIGB2aXNpdGAsIGV0YykgaGFzIGV4ZWN1dGVkLFxuICAgdW50aWwgdGhlIHJldHVybmluZyByZXN1bHQgaXMgdHJ1dGh5LiBBZnRlciB0aGUgd2FpdGVycyBmaW5pc2gsIHRoZSBuZXh0IGFzeW5jIGhlbHBlclxuICAgaXMgZXhlY3V0ZWQgYW5kIHRoZSBwcm9jZXNzIHJlcGVhdHMuXG5cbiAgIEZvciBleGFtcGxlOlxuXG4gICBgYGBqYXZhc2NyaXB0XG4gICBFbWJlci5UZXN0LnJlZ2lzdGVyV2FpdGVyKGZ1bmN0aW9uKCkge1xuICAgICByZXR1cm4gbXlQZW5kaW5nVHJhbnNhY3Rpb25zKCkgPT0gMDtcbiAgIH0pO1xuICAgYGBgXG4gICBUaGUgYGNvbnRleHRgIGFyZ3VtZW50IGFsbG93cyB5b3UgdG8gb3B0aW9uYWxseSBzcGVjaWZ5IHRoZSBgdGhpc2BcbiAgIHdpdGggd2hpY2ggeW91ciBjYWxsYmFjayB3aWxsIGJlIGludm9rZWQuXG5cbiAgIEZvciBleGFtcGxlOlxuXG4gICBgYGBqYXZhc2NyaXB0XG4gICBFbWJlci5UZXN0LnJlZ2lzdGVyV2FpdGVyKE15REIsIE15REIuaGFzUGVuZGluZ1RyYW5zYWN0aW9ucyk7XG4gICBgYGBcblxuICAgQHB1YmxpY1xuICAgQGZvciBFbWJlci5UZXN0XG4gICBAbWV0aG9kIHJlZ2lzdGVyV2FpdGVyXG4gICBAcGFyYW0ge09iamVjdH0gY29udGV4dCAob3B0aW9uYWwpXG4gICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgQHNpbmNlIDEuMi4wXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyV2FpdGVyKGNvbnRleHQsIGNhbGxiYWNrKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgY2FsbGJhY2sgPSBjb250ZXh0O1xuICAgIGNvbnRleHQgPSBudWxsO1xuICB9XG4gIGlmIChpbmRleE9mKGNvbnRleHQsIGNhbGxiYWNrKSA+IC0xKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnRleHRzLnB1c2goY29udGV4dCk7XG4gIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gICBgdW5yZWdpc3RlcldhaXRlcmAgaXMgdXNlZCB0byB1bnJlZ2lzdGVyIGEgY2FsbGJhY2sgdGhhdCB3YXNcbiAgIHJlZ2lzdGVyZWQgd2l0aCBgcmVnaXN0ZXJXYWl0ZXJgLlxuXG4gICBAcHVibGljXG4gICBAZm9yIEVtYmVyLlRlc3RcbiAgIEBtZXRob2QgdW5yZWdpc3RlcldhaXRlclxuICAgQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgKG9wdGlvbmFsKVxuICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgIEBzaW5jZSAxLjIuMFxuKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnJlZ2lzdGVyV2FpdGVyKGNvbnRleHQsIGNhbGxiYWNrKSB7XG4gIGlmICghY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGNhbGxiYWNrID0gY29udGV4dDtcbiAgICBjb250ZXh0ID0gbnVsbDtcbiAgfVxuICBsZXQgaSA9IGluZGV4T2YoY29udGV4dCwgY2FsbGJhY2spO1xuICBpZiAoaSA9PT0gLTEpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udGV4dHMuc3BsaWNlKGksIDEpO1xuICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xufVxuXG4vKipcbiAgSXRlcmF0ZXMgdGhyb3VnaCBlYWNoIHJlZ2lzdGVyZWQgdGVzdCB3YWl0ZXIsIGFuZCBpbnZva2VzXG4gIGl0cyBjYWxsYmFjay4gSWYgYW55IHdhaXRlciByZXR1cm5zIGZhbHNlLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVyblxuICB0cnVlIGluZGljYXRpbmcgdGhhdCB0aGUgd2FpdGVycyBoYXZlIG5vdCBzZXR0bGVkIHlldC5cblxuICBUaGlzIGlzIGdlbmVyYWxseSB1c2VkIGludGVybmFsbHkgZnJvbSB0aGUgYWNjZXB0YW5jZS9pbnRlZ3JhdGlvbiB0ZXN0XG4gIGluZnJhc3RydWN0dXJlLlxuXG4gIEBwdWJsaWNcbiAgQGZvciBFbWJlci5UZXN0XG4gIEBzdGF0aWNcbiAgQG1ldGhvZCBjaGVja1dhaXRlcnNcbiovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tXYWl0ZXJzKCkge1xuICBpZiAoIWNhbGxiYWNrcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY29udGV4dCA9IGNvbnRleHRzW2ldO1xuICAgIGxldCBjYWxsYmFjayA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoIWNhbGxiYWNrLmNhbGwoY29udGV4dCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGluZGV4T2YoY29udGV4dCwgY2FsbGJhY2spIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoY2FsbGJhY2tzW2ldID09PSBjYWxsYmFjayAmJiBjb250ZXh0c1tpXSA9PT0gY29udGV4dCkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlRGVwcmVjYXRlZFdhaXRlcnNBcnJheSgpIHtcbiAgZGVwcmVjYXRlKFxuICAgICdVc2FnZSBvZiBgRW1iZXIuVGVzdC53YWl0ZXJzYCBpcyBkZXByZWNhdGVkLiBQbGVhc2UgcmVmYWN0b3IgdG8gYEVtYmVyLlRlc3QuY2hlY2tXYWl0ZXJzYC4nLFxuICAgICFpc0ZlYXR1cmVFbmFibGVkKCdlbWJlci10ZXN0aW5nLWNoZWNrLXdhaXRlcnMnKSxcbiAgICB7IHVudGlsOiAnMi44LjAnLCBpZDogJ2VtYmVyLXRlc3RpbmcudGVzdC13YWl0ZXJzJyB9XG4gICk7XG5cbiAgbGV0IGFycmF5ID0gbmV3IEFycmF5KGNhbGxiYWNrcy5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjb250ZXh0ID0gY29udGV4dHNbaV07XG4gICAgbGV0IGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xuXG4gICAgYXJyYXlbaV0gPSBbY29udGV4dCwgY2FsbGJhY2tdO1xuICB9XG5cbiAgcmV0dXJuIGFycmF5O1xufVxuIl19
requireModule("ember-testing");

}());

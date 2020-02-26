// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/jsx-runtime/node_modules/object-assign/index.js":[function(require,module,exports) {
'use strict';

var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function ToObject(val) {
  if (val == null) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }

  return Object(val);
}

function ownEnumerableKeys(obj) {
  var keys = Object.getOwnPropertyNames(obj);

  if (Object.getOwnPropertySymbols) {
    keys = keys.concat(Object.getOwnPropertySymbols(obj));
  }

  return keys.filter(function (key) {
    return propIsEnumerable.call(obj, key);
  });
}

module.exports = Object.assign || function (target, source) {
  var from;
  var keys;
  var to = ToObject(target);

  for (var s = 1; s < arguments.length; s++) {
    from = arguments[s];
    keys = ownEnumerableKeys(Object(from));

    for (var i = 0; i < keys.length; i++) {
      to[keys[i]] = from[keys[i]];
    }
  }

  return to;
};
},{}],"../node_modules/jsx-runtime/lib/renderer.js":[function(require,module,exports) {
"use strict";

var isArray = Array.isArray;
var assign = require('object-assign');

var MAX_ARRAY_DEPTH = 3;

function Renderer(interpreter, callbacks) {
  this.callBefore = callbacks && callbacks.before || this.noop;
  this.callAfter = callbacks && callbacks.after || this.noop;
  this.callProcess = callbacks && callbacks.process;

  var _this = this;

  this.scope = null;
  this.interpreter = interpreter;
  this.interpreter.setRenderer(this);

  this.render = function renderJSX(element, props, children) {
    if (!element) throw new Error('JSX element is not presented');

    if (typeof element === 'string') {
      element = {
        tag: element,
        props: isObject(props) ? props : null,
        children: Array.isArray(children) ? children : null
      };
    } else if (typeof element === 'function') {
      element = {
        tag: [element.name || element.displayName || '', element],
        props: isObject(props) ? props : null,
        children: Array.isArray(children) ? children : null
      };
    }

    if (!_this.isTagDescriptor(element)) {
      throw new Error('Top level element should be a tag or function which returns a tag');
    }

    _this.scope = {};

    element = _this.callBefore(element);

    if (_this.callProcess) {
      _this.callProcess(function() {
        element = _this.renderChild(element);
      });
    } else {
      element = _this.renderChild(element);
    }

    element = _this.callAfter(element);

    _this.scope = null;

    return element;
  };
};

Renderer.prototype = {
  renderChild: function(thing) {
    if (thing == null) {
      return null;
    }

    if (this.isTagDescriptor(thing)) {
      return this.handleTag(thing);
    }

    return thing;
  },
  walkChildren: function(children, handler, depth) {
    var length = children.length;
    var i = 0;
    var child;

    depth = depth | 0;

    for (; i < length; i++) {
      child = children[i];

      if (child == null) continue;
      if (isArray(child) && depth < MAX_ARRAY_DEPTH) {
        this.walkChildren(child, handler);
        continue;
      }

      handler(this.renderChild(child));
    }
  },

  handleTag: function(descriptor) {
    var tag = descriptor.tag;
    var props = descriptor.props;
    var children = descriptor.children;
    var parent;
    var tagFunction;

    props = (isArray(props) ? assign.apply(null, props) : props || null);

    if (isArray(tag)) {
      tagFunction = tag[1];
      tag = tag[0];

      var child;

      if (this.interpreter.hasCustomOverride(tag)) {
        child = this.interpreter.custom(tag, tagFunction, props, children);
        this.check(child, 'custom');
      } else {
        child = tagFunction(props, children, tag);
      }

      return this.renderChild(child);
    }

    // Put children handling here if bottom-to-top handling is better

    props = props && this.interpreter.props(tag, props);
    this.check(props, 'props');

    parent = this.interpreter.enter(tag, props);
    this.check(parent, 'enter');

    if (isArray(children) && children.length) {
      children = this.interpreter.children(tag, children, parent);
      this.check(children, 'children');

      parent = this.handleChildren(tag, children, parent);
    }

    parent = this.interpreter.leave(tag, parent);
    this.check(parent, 'leave')

    return parent;
  },

  handleChildren: function(tag, children, parent) {
    var self = this;

    this.walkChildren(children, function(child) {
      // probably move this to handleTag() method
      // and provide parentValue for renderChild() call
      parent = self.interpreter.child(tag, parent, child);
      self.check(parent, 'child');
    });

    return parent;
  },
  handlePrivimite: function(thing) {
    return thing;
  },

  isPrimitive: function(thing) {
    switch (typeof thing) {
      case 'string':
      case 'boolean':
      case 'number':
        return true;
    }

    return false;
  },
  isTagDescriptor: function(object) {
    return object && typeof object === 'object' && 'tag' in object &&
      'props' in object && 'children' in object;
  },

  check: function(result, source) {
    if (typeof result === 'undefined') {
      throw new Error('Source [' + source + '] returned undefined');
    }

    return result;
  },

  noop: function(a) { return a }
};

function isObject(obj) {
  return typeof obj === 'object' && obj && !isArray(obj);
}

module.exports = Renderer;
},{"object-assign":"../node_modules/jsx-runtime/node_modules/object-assign/index.js"}],"../node_modules/jsx-runtime/lib/interpreter.js":[function(require,module,exports) {
"use strict";

function Interpreter(name, config) {
  var self = this;

  this.name = name;
  this.tags = {};
  this.renderer = null;

  if (config) {
    Object.keys(config).forEach(function(tag) {
      var handler = config[tag];

      self.addTagHandler(tag, handler);
    });
  }
};

Interpreter.prototype = {
  addTagHandler: function(tag, handler) {
    this.tags[tag] = handler;
  },
  getHandler: function(tag) {
    var handler = this.tags[tag] || this.tags['*'];

    if (!handler) {
      throw new Error('JSX [' + tag + '] is not found and [*] is missing');
    }

    return handler;
  },
  hasCustomOverride: function(tag) {
    var handler = this.getHandler(tag);
    return !!handler.custom;
  },
  setRenderer: function(renderer) {
    this.renderer = renderer;
  },

  call: function(fn, args) {
    var val = this[fn].apply(this, args);

    if (typeof val === 'undefined') console.log('Interpreter call [' + fn + '] returned undefined');
    return val;
  },

  props: function(tag, props) {
    var handler = this.getHandler(tag);

    if (handler.props) {
      return handler.props.call(this.renderer, props, tag);
    }

    return props;
  },
  child: function(tag, parent, child) {
    var handler = this.getHandler(tag);

    if (handler.child) {
      return handler.child.call(this.renderer, child, parent, tag);
    }

    return parent;
  },
  enter: function(tag, props) {
    var handler = this.getHandler(tag);

    if (!handler.enter) {
      throw new Error('JSX Interpreter handler should provide [enter] method')
    }

    return handler.enter.call(this.renderer, tag, props);
  },
  leave: function(tag, parent) {
    var handler = this.getHandler(tag);

    if (handler.leave) {
      return handler.leave.call(this.renderer, parent, tag);
    }

    return parent;
  },
  custom: function(tag, fn, props, children) {
    var handler = this.getHandler(tag);

    return handler.custom.call(this.renderer, fn, props, children, tag);
  },
  children: function(tag, children, parent) {
    var handler = this.getHandler(tag);

    if (handler.children) {
      return handler.children.call(this.renderer, children, parent, tag);
    }

    return children;
  }
};

module.exports = Interpreter;
},{}],"../node_modules/jsx-runtime/index.js":[function(require,module,exports) {
"use strict";

var Renderer = require('./lib/renderer');
var Interpreter = require('./lib/interpreter');
var renderers = {};

var jsx = {
  register: function registerRenderer(name, config) {
    name = name.toLowerCase();

    var interpreter = new Interpreter(name, config.tags);
    var renderer = new Renderer(interpreter, {
      before: config.before,
      after: config.after,
      process: config.process
    });

    renderers[name] = renderer;
    return renderer;
  },

  render: function renderJSXTree(tree, renderer) {
    renderer = renderer.toLowerCase();
    renderer = renderer && renderers[renderer];

    if (!renderer) {
      throw new Error('Renderer [' + renderer + '] not found');
    }

    return renderer.render(tree);
  }
};

module.exports = jsx;




},{"./lib/renderer":"../node_modules/jsx-runtime/lib/renderer.js","./lib/interpreter":"../node_modules/jsx-runtime/lib/interpreter.js"}],"../node_modules/escape-html/index.js":[function(require,module,exports) {
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

},{}],"../node_modules/jsx-to-html/lib/tag.js":[function(require,module,exports) {
function Tag(name, props) {
  this.name = name;
  this.props = props;
  this.children = [];
}

Tag.prototype.toString = function() {
  var props = this.props ? ' ' + this.props : '';

  return '<' + this.name + props + '>' +
    this.children.join('') +
  '</' + this.name + '>';
};

module.exports = Tag;
},{}],"../node_modules/empty-tags/index.js":[function(require,module,exports) {
module.exports = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];
},{}],"../node_modules/jsx-to-html/index.js":[function(require,module,exports) {
var jsx = require('jsx-runtime');
var escape = require('escape-html');
var Tag = require('./lib/tag');
var hasOwn = Object.prototype.hasOwnProperty;

var emptyTags = require('empty-tags').reduce(function(map, tag) {
  map[tag] = true;
  return map;
}, Object.create(null));

var renderer = jsx.register('HTML', {
  tags: {
    '*': {
      enter: function(tag, props) {
        if (escape(tag) !== tag) {
          throw new Error('Incorrect tag name: ' + tag);
        }

        return new Tag(tag, props);
      },
      leave: function(parent, tag) {
        return parent;
      },
      child: function(child, parent) {
        if (child == null) return parent;

        if (child instanceof Tag) {
          // do nothing
        } else {
          child = escape(child + '');
        }

        parent.children.push(child);

        return parent;
      },
      props: function(props) {
        return Object.keys(props)
          .map(function(key) {
            return mapProps(key, key && props[key]);
          }).join(' ');
      },
      children: function(children, parent, tag) {
        if (typeof emptyTags[tag.toLowerCase()] !== 'undefined') {
          throw new Error('Tag <' + tag + ' /> cannot have children');
        }

        return children;
      }
    }
  },
  after: function(tag) {
    return tag.toString();
  }
});

module.exports = renderer;

function mapProps(key, val) {
  if (!key || val == null) return '';
  if (val instanceof Tag) return '';

  if (key === 'className') key = 'class';
  else if (key === 'cssFor') key = 'for';
  else key = key.toLowerCase();

  if (key === 'style') {
    val = handleStyle(val);
  }

  if (typeof val === 'string') {
    // do nothing
  } else {
    val = JSON.stringify(val);
  }

  return escape(key) + '="' + escape(val) + '"';
}

function handleStyle(style) {
  if (typeof style === 'string') return style;

  var string = '';

  for (var key in style) {
    if (!hasOwn.call(style, key)) continue;

    var val = style[key];

    key = key.replace(/[A-Z]/g, function(m) {
      return '-' + m.toLowerCase();
    });

    if (key.search(/moz-|webkit-|o-|ms-/) === 0) {
      key = '-' + key;
    }

    string += (string ? ' ' : '') + key + ': ' + val + ';';
  }

  return string;
}
},{"jsx-runtime":"../node_modules/jsx-runtime/index.js","escape-html":"../node_modules/escape-html/index.js","./lib/tag":"../node_modules/jsx-to-html/lib/tag.js","empty-tags":"../node_modules/empty-tags/index.js"}],"../nano.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Component = void 0;

var _jsxToHtml = _interopRequireDefault(require("jsx-to-html"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Nano =
/*#__PURE__*/
function () {
  function Nano(root, render) {
    _classCallCheck(this, Nano);

    this.root = root;
    this.render = render;
  }

  _createClass(Nano, [{
    key: "display",
    value: function display() {
      this.root.innerHTML = this.render;
    }
  }]);

  return Nano;
}();

var Component =
/*#__PURE__*/
function () {
  function Component(componentName) {
    _classCallCheck(this, Component);

    this.componentName = componentName;
  }

  _createClass(Component, [{
    key: "render",
    value: function render(html) {}
  }, {
    key: "define",
    value: function define(_ref) {
      var template = _ref.template;
      html = template.innerHTML;
      console.log(html);
    }
  }]);

  return Component;
}();

exports.Component = Component;
var _default = Nano;
exports.default = _default;
},{"jsx-to-html":"../node_modules/jsx-to-html/index.js"}],"components/Navbar/navbar.component.js":[function(require,module,exports) {
"use strict";

var _nano = _interopRequireWildcard(require("../../../nano"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var Navbar = new _nano.Component('Navbar');
Navbar.render('Hello');
console.log();
},{"../../../nano":"../nano.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _nano = _interopRequireDefault(require("../nano"));

require("./components/Navbar/navbar.component.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var instance = new _nano.default(document.getElementById('root'), 'Hello World');
instance.display();
},{"../nano":"../nano.js","./components/Navbar/navbar.component.js":"components/Navbar/navbar.component.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63132" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map
import axeCore from'axe-core';import {ref,nextTick,onMounted,onUnmounted,openBlock,createElementBlock,createStaticVNode,renderSlot,createElementVNode,toDisplayString,inject,computed,resolveComponent,createVNode,createTextVNode,withCtx,Fragment,renderList,normalizeClass,withDirectives,vShow,createBlock,resolveDynamicComponent,createCommentVNode,normalizeStyle,watch,Transition}from'vue';var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}var src = {exports: {}};(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isPlainObject = exports.clone = exports.recursive = exports.merge = exports.main = void 0;
	module.exports = exports = main;
	exports.default = main;
	function main() {
	    var items = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        items[_i] = arguments[_i];
	    }
	    return merge.apply(void 0, items);
	}
	exports.main = main;
	main.clone = clone;
	main.isPlainObject = isPlainObject;
	main.recursive = recursive;
	function merge() {
	    var items = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        items[_i] = arguments[_i];
	    }
	    return _merge(items[0] === true, false, items);
	}
	exports.merge = merge;
	function recursive() {
	    var items = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        items[_i] = arguments[_i];
	    }
	    return _merge(items[0] === true, true, items);
	}
	exports.recursive = recursive;
	function clone(input) {
	    if (Array.isArray(input)) {
	        var output = [];
	        for (var index = 0; index < input.length; ++index)
	            output.push(clone(input[index]));
	        return output;
	    }
	    else if (isPlainObject(input)) {
	        var output = {};
	        for (var index in input)
	            output[index] = clone(input[index]);
	        return output;
	    }
	    else {
	        return input;
	    }
	}
	exports.clone = clone;
	function isPlainObject(input) {
	    return input && typeof input === 'object' && !Array.isArray(input);
	}
	exports.isPlainObject = isPlainObject;
	function _recursiveMerge(base, extend) {
	    if (!isPlainObject(base))
	        return extend;
	    for (var key in extend) {
	        if (key === '__proto__' || key === 'constructor' || key === 'prototype')
	            continue;
	        base[key] = (isPlainObject(base[key]) && isPlainObject(extend[key])) ?
	            _recursiveMerge(base[key], extend[key]) :
	            extend[key];
	    }
	    return base;
	}
	function _merge(isClone, isRecursive, items) {
	    var result;
	    if (isClone || !isPlainObject(result = items.shift()))
	        result = {};
	    for (var index = 0; index < items.length; ++index) {
	        var item = items[index];
	        if (!isPlainObject(item))
	            continue;
	        for (var key in item) {
	            if (key === '__proto__' || key === 'constructor' || key === 'prototype')
	                continue;
	            var value = isClone ? clone(item[key]) : item[key];
	            result[key] = isRecursive ? _recursiveMerge(result[key], value) : value;
	        }
	    }
	    return result;
	}
} (src, src.exports));

var srcExports = src.exports;
var merge = /*@__PURE__*/getDefaultExportFromCjs(srcExports);const defaultOptions = {
  auto: true,
  config: {
    branding: {
      application: 'vue-axe'
    },
    locale: null,
    rules: [{
      id: 'aria-allowed-attr',
      impact: 'critical',
      matches: 'aria-allowed-attr-matches',
      tags: ['cat.aria', 'wcag2a', 'wcag412', 'EN-301-549', 'EN-9.4.1.2'],
      actIds: ['5c01ea'],
      all: [{
        options: {
          validTreeRowAttrs: ['aria-multiselectable'],
          validGridRowAttrs: ['aria-multiselectable'],
          validInputRowAttrs: ['aria-multiselectable'],
          validTablistRowAttrs: ['aria-multiselectable']
        },
        id: 'aria-allowed-attr'
      }],
      any: [],
      none: ['aria-unsupported-attr']
    }]
  },
  runOptions: {
    reporter: 'v2',
    resultTypes: ['violations']
  },
  plugins: []
};
const impacts = [...axeCore.constants.impact].reverse();
const vueAxe = Symbol('vue-axe');let lastNotification = 0;
function useAxe(axeOptions) {
  const results = ref({});
  const error = ref(null);
  const loading = ref(false);
  axeCore.configure({
    ...axeOptions.config
  });
  axeOptions.plugins.forEach(plugin => axeCore.registerPlugin(plugin));
  function axeCoreRun(context, runOptions) {
    axeCore.run(context, runOptions, (error, res) => {
      try {
        if (error) throw Error(error);
        if (JSON.stringify([...res.violations]).length === lastNotification) return;
        results.value = {
          testEngine: res.testEngine,
          issuesFound: res.violations.length,
          impacts: violationsByImpacts(res.violations)
        };
        lastNotification = JSON.stringify([...res.violations]).length;
      } catch (e) {
        error.value = e;
      } finally {
        loading.value = false;
      }
    });
  }
  function run({
    context = document,
    runOptions = axeOptions.runOptions,
    force = false
  } = {}) {
    loading.value = true;
    if (force) resetLastNotification();
    nextTick(() => axeCoreRun(context, runOptions));
  }
  function violationsByImpacts(violations) {
    return violations.reduce((obj, data) => {
      data = {
        ...data,
        failureSummary: getFailureSummaries(data)
      };
      impacts.forEach(impact => {
        if (!obj[impact]) {
          obj[impact] = [];
        }
        if (data.impact === impact) obj[impact].push(data);
      });
      return obj;
    }, {});
  }
  function getFailureSummaries(data) {
    const keys = ['all', 'any', 'none'];
    const failures = [];
    keys.forEach(key => {
      data.nodes.forEach(node => {
        node[key].length && failures.push({
          errors: node[key],
          source: node.html
        });
      });
    });
    return failures;
  }
  function resetLastNotification() {
    lastNotification = 0;
  }
  return {
    run,
    error,
    results,
    loading,
    plugins: axeCore.plugins
  };
}var ptBR = {
  run_again: 'Analisar',
  running: 'Analisando',
  open_new_tab: 'Abre em uma nova tab',
  issue: 'erro',
  issues: 'erros',
  back: 'Voltar',
  issue_desc: 'Descrição',
  issue_found: 'Erro encontrado',
  issues_found: 'Erros encontrados',
  no_issues: 'erros nesta página',
  btn_label: 'erro de acessibilidade encontrado',
  btn_label_plu: 'erros de acessibilidade encontrados',
  learn_more: 'Saiba mais',
  see_more: 'Saiba mais',
  highlight: 'Destacar',
  no_highlight: 'Sem destaque',
  el_src: 'Código fonte',
  more_links: 'Mais links',
  congrats: 'Parabéns',
  fix: 'Corrija o seguinte',
  fixes: 'Corrija qualquer um dos seguintes',
  critical: 'Critico',
  serious: 'Importante',
  moderate: 'Moderado',
  minor: 'Leve',
  els: 'Elementos',
  details: 'Detalhes',
  announcer_details_view: 'Detalhes da violação foi carregado',
  announcer_violations_view: 'Lista de violações foi carregada'
};var en = {
  open_new_tab: 'Opens in a new tab',
  no_issues: 'issues found on this page',
  btn_label: 'accessibility issue found',
  btn_label_plu: 'accessibility issues found',
  fix: 'Fix the following',
  fixes: 'Fix any of the following',
  announcer_details_view: 'Details os violation has loaded',
  announcer_violations_view: 'List of violations has loaded'
};var translations = {
  en,
  pt_BR: ptBR
};function useLocale(lang) {
  const translation = translations[lang] || translations.en;
  function $t(key, value) {
    return translation[key] || value;
  }
  return {
    $t
  };
}var version = "3.2.0";function useVueAxe(options) {
  let timeout = null;
  const highlights = ref(null);
  const axeOptions = merge(defaultOptions, options);
  const axe = useAxe(axeOptions);
  const {
    $t
  } = useLocale(axeOptions.config.locale && axeOptions.config.locale.lang);
  function registerPlugin(app) {
    app.config.globalProperties.$vat = $t;
    app.provide(vueAxe, {
      ...axe,
      version,
      highlights
    });
    if (axeOptions.auto) {
      app.mixin({
        updated() {
          if (this.$.type.disableAxeAudit || this.$.type.name && this.$.type.name.toLowerCase().indexOf('transition') !== -1) return;
          axe.loading.value = true;
          clearTimeout(timeout);
          timeout = setTimeout(axe.run, 2500);
        }
      });
    }
    axe.run();
  }
  return {
    axeOptions,
    registerPlugin
  };
}function useDisclosure() {
  const isOpen = ref(false);
  function onOpen() {
    isOpen.value = true;
  }
  function onClose() {
    isOpen.value = false;
  }
  function toggle() {
    isOpen.value = !isOpen.value;
  }
  return {
    isOpen,
    toggle,
    onOpen,
    onClose
  };
}function useEventListener(type, listener, options = {}, target) {
  const eventOptions = {
    capture: false,
    ...options
  };
  const el = ref(null);
  onMounted(() => {
    el.value = window;
    el.value.addEventListener(type, listener, eventOptions);
  });
  onUnmounted(() => {
    el.value.removeEventListener(type, listener, eventOptions);
  });
}var script$d = {
  name: 'PopupLoading',
  disableAxeAudit: true
};const _hoisted_1$b = {
  class: "va-absolute va-top-0 va-left-0 va-bottom-0 va-right-0 va-z-20 va-flex va-items-center va-justify-center va-bg-white va-bg-opacity-75"
};
const _hoisted_2$b = /*#__PURE__*/createStaticVNode("<svg width=\"100\" height=\"100\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"#41b883\"><g fill=\"41b883\" fill-rule=\"evenodd\"><g transform=\"translate(1 1)\" stroke-width=\"2\"><circle cx=\"5\" cy=\"50\" r=\"5\"><animate attributeName=\"cy\" begin=\"0s\" dur=\"2.2s\" values=\"50;5;50;50\" calcMode=\"linear\" repeatCount=\"indefinite\"></animate><animate attributeName=\"cx\" begin=\"0s\" dur=\"2.2s\" values=\"5;27;49;5\" calcMode=\"linear\" repeatCount=\"indefinite\"></animate></circle><circle cx=\"27\" cy=\"5\" r=\"5\"><animate attributeName=\"cy\" begin=\"0s\" dur=\"2.2s\" from=\"5\" to=\"5\" values=\"5;50;50;5\" calcMode=\"linear\" repeatCount=\"indefinite\"></animate><animate attributeName=\"cx\" begin=\"0s\" dur=\"2.2s\" from=\"27\" to=\"27\" values=\"27;49;5;27\" calcMode=\"linear\" repeatCount=\"indefinite\"></animate></circle><circle cx=\"49\" cy=\"50\" r=\"5\"><animate attributeName=\"cy\" begin=\"0s\" dur=\"2.2s\" values=\"50;50;5;50\" calcMode=\"linear\" repeatCount=\"indefinite\"></animate><animate attributeName=\"cx\" from=\"49\" to=\"49\" begin=\"0s\" dur=\"2.2s\" values=\"49;5;27;49\" calcMode=\"linear\" repeatCount=\"indefinite\"></animate></circle></g></g></svg>", 1);
const _hoisted_3$8 = [_hoisted_2$b];
function render$d(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$b, _hoisted_3$8);
}script$d.render = render$d;var script$c = {
  name: 'ExternalLink',
  disableAxeAudit: true
};const _hoisted_1$a = {
  target: "_blank",
  rel: "noopener",
  class: "va-inline-flex va-py-2 va-px-1 va-items-center va-text-blue-700 va-no-underline va-font-medium hover:va-underline"
};
const _hoisted_2$a = {
  class: "va-sr-only"
};
const _hoisted_3$7 = /*#__PURE__*/createElementVNode("svg", {
  class: "va-ml-1",
  fill: "none",
  stroke: "currentColor",
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
}, [/*#__PURE__*/createElementVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2.5",
  d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
})], -1);
function render$c(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("a", _hoisted_1$a, [renderSlot(_ctx.$slots, "default"), createElementVNode("span", _hoisted_2$a, "(" + toDisplayString(_ctx.$vat('open_new_tab')) + ")", 1), _hoisted_3$7]);
}script$c.render = render$c;var script$b = {
  props: {
    right: Boolean
  }
};const _hoisted_1$9 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "13.2",
  height: "6.7",
  focusable: "false",
  "aria-hidden": "true"
};
const _hoisted_2$9 = ["d"];
function render$b(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("svg", _hoisted_1$9, [createElementVNode("path", {
    d: $props.right ? 'M9.8.7l2.7 2.7m0 0L9.8 6m2.7-2.6H.5' : 'M3.4 6L.7 3.4m0 0L3.4.7M.7 3.4h12',
    fill: "none",
    stroke: "#000",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }, null, 8, _hoisted_2$9)]);
}script$b.render = render$b;// References links to specific rule violation (https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
var referencesLinks = {
  'area-alt': [],
  'aria-allowed-attr': [],
  'aria-hidden-body': [],
  'aria-hidden-focus': [],
  'aria-input-field-name': [],
  'aria-required-attr': [],
  'aria-required-children': [],
  'aria-required-parent': [],
  'aria-roledescription': [],
  'aria-roles': [],
  'aria-toggle-field-name': [],
  'aria-valid-attr-value': [],
  'aria-valid-attr': [],
  'audio-caption': [],
  blink: [],
  'button-name': [],
  bypass: [],
  'color-contrast': [{
    title: 'Colors with Good Contrast (w3.org)',
    link: 'https://www.w3.org/WAI/perspective-videos/contrast/'
  }, {
    title: 'Contrast and Color Accessibility (WebAIM)',
    link: 'https://webaim.org/articles/contrast/'
  }, {
    title: 'Color and contrast accessibility (web.dev)',
    link: 'https://web.dev/color-and-contrast-accessibility/'
  }],
  'definition-list': [],
  dlitem: [],
  'document-title': [],
  'duplicate-id-active': [],
  'duplicate-id-aria': [],
  'duplicate-id': [],
  'form-field-multiple-labels': [],
  'frame-title': [],
  'html-has-lang': [],
  'html-lang-valid': [],
  'html-xml-lang-mismatch': [],
  'image-alt': [],
  'input-button-name': [],
  'input-image-alt': [],
  label: [],
  'link-name': [],
  list: [],
  listitem: [],
  marquee: [],
  'meta-refresh': [],
  'object-alt': [],
  'role-img-alt': [],
  'scrollable-region-focusable': [],
  'select-name': [],
  'server-side-image-map': [],
  'svg-img-alt': [],
  'td-headers-attr': [],
  'th-has-data-cells': [],
  'valid-lang': [],
  'video-caption': [],
  'autocomplete-valid': [],
  'avoid-inline-spacing': [],
  accesskeys: [],
  'aria-allowed-role': [],
  'empty-heading': [],
  'frame-tested': [],
  'frame-title-unique': [],
  'heading-order': [],
  'identical-links-same-purpose': [],
  'image-redundant-alt': [],
  'label-title-only': [],
  'landmark-banner-is-top-level': [],
  'landmark-complementary-is-top-level': [],
  'landmark-contentinfo-is-top-level': [],
  'landmark-main-is-top-level': [],
  'landmark-no-duplicate-banner': [],
  'landmark-no-duplicate-contentinfo': [],
  'landmark-no-duplicate-main': [],
  'landmark-one-main': [],
  'landmark-unique': [],
  'meta-viewport-large': [],
  'meta-viewport': [],
  'page-has-heading-one': [],
  region: [],
  'scope-attr-valid': [],
  'skip-link': [],
  tabindex: [],
  'table-duplicate-name': [],
  'css-orientation-lock': [],
  'focus-order-semantics': [],
  'hidden-content': [],
  'label-content-name-mismatch': [],
  'link-in-text-block': [],
  'no-autoplay-audio': [],
  'p-as-heading': [],
  'table-fake-caption': [],
  'td-has-header': []
};function useHighlight() {
  const els = ref(null);
  const {
    highlights
  } = inject(vueAxe);
  onUnmounted(reset);
  function toggleHighlight(nodes) {
    if (highlights.value) return reset();
    highlights.value = [];
    for (const node of nodes) {
      const target = node.target[0];
      const el = document.querySelector(target);
      if (!el) continue;
      highlights.value = [...highlights.value, {
        target,
        offset: el.getBoundingClientRect()
      }];
    }
  }
  function reset() {
    highlights.value = null;
    els.value = null;
  }
  return {
    highlights,
    toggleHighlight
  };
}var prism = {exports: {}};(function (module) {
	/* **********************************************
	     Begin prism-core.js
	********************************************** */

	/// <reference lib="WebWorker"/>

	var _self = (typeof window !== 'undefined')
		? window   // if in browser
		: (
			(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
				? self // if in worker
				: {}   // if in node js
		);

	/**
	 * Prism: Lightweight, robust, elegant syntax highlighting
	 *
	 * @license MIT <https://opensource.org/licenses/MIT>
	 * @author Lea Verou <https://lea.verou.me>
	 * @namespace
	 * @public
	 */
	var Prism = (function (_self) {

		// Private helper vars
		var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
		var uniqueId = 0;

		// The grammar object for plaintext
		var plainTextGrammar = {};


		var _ = {
			/**
			 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
			 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
			 * additional languages or plugins yourself.
			 *
			 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
			 *
			 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
			 * empty Prism object into the global scope before loading the Prism script like this:
			 *
			 * ```js
			 * window.Prism = window.Prism || {};
			 * Prism.manual = true;
			 * // add a new <script> to load Prism's script
			 * ```
			 *
			 * @default false
			 * @type {boolean}
			 * @memberof Prism
			 * @public
			 */
			manual: _self.Prism && _self.Prism.manual,
			/**
			 * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
			 * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
			 * own worker, you don't want it to do this.
			 *
			 * By setting this value to `true`, Prism will not add its own listeners to the worker.
			 *
			 * You obviously have to change this value before Prism executes. To do this, you can add an
			 * empty Prism object into the global scope before loading the Prism script like this:
			 *
			 * ```js
			 * window.Prism = window.Prism || {};
			 * Prism.disableWorkerMessageHandler = true;
			 * // Load Prism's script
			 * ```
			 *
			 * @default false
			 * @type {boolean}
			 * @memberof Prism
			 * @public
			 */
			disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

			/**
			 * A namespace for utility methods.
			 *
			 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
			 * change or disappear at any time.
			 *
			 * @namespace
			 * @memberof Prism
			 */
			util: {
				encode: function encode(tokens) {
					if (tokens instanceof Token) {
						return new Token(tokens.type, encode(tokens.content), tokens.alias);
					} else if (Array.isArray(tokens)) {
						return tokens.map(encode);
					} else {
						return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
					}
				},

				/**
				 * Returns the name of the type of the given value.
				 *
				 * @param {any} o
				 * @returns {string}
				 * @example
				 * type(null)      === 'Null'
				 * type(undefined) === 'Undefined'
				 * type(123)       === 'Number'
				 * type('foo')     === 'String'
				 * type(true)      === 'Boolean'
				 * type([1, 2])    === 'Array'
				 * type({})        === 'Object'
				 * type(String)    === 'Function'
				 * type(/abc+/)    === 'RegExp'
				 */
				type: function (o) {
					return Object.prototype.toString.call(o).slice(8, -1);
				},

				/**
				 * Returns a unique number for the given object. Later calls will still return the same number.
				 *
				 * @param {Object} obj
				 * @returns {number}
				 */
				objId: function (obj) {
					if (!obj['__id']) {
						Object.defineProperty(obj, '__id', { value: ++uniqueId });
					}
					return obj['__id'];
				},

				/**
				 * Creates a deep clone of the given object.
				 *
				 * The main intended use of this function is to clone language definitions.
				 *
				 * @param {T} o
				 * @param {Record<number, any>} [visited]
				 * @returns {T}
				 * @template T
				 */
				clone: function deepClone(o, visited) {
					visited = visited || {};

					var clone; var id;
					switch (_.util.type(o)) {
						case 'Object':
							id = _.util.objId(o);
							if (visited[id]) {
								return visited[id];
							}
							clone = /** @type {Record<string, any>} */ ({});
							visited[id] = clone;

							for (var key in o) {
								if (o.hasOwnProperty(key)) {
									clone[key] = deepClone(o[key], visited);
								}
							}

							return /** @type {any} */ (clone);

						case 'Array':
							id = _.util.objId(o);
							if (visited[id]) {
								return visited[id];
							}
							clone = [];
							visited[id] = clone;

							(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
								clone[i] = deepClone(v, visited);
							});

							return /** @type {any} */ (clone);

						default:
							return o;
					}
				},

				/**
				 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
				 *
				 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
				 *
				 * @param {Element} element
				 * @returns {string}
				 */
				getLanguage: function (element) {
					while (element) {
						var m = lang.exec(element.className);
						if (m) {
							return m[1].toLowerCase();
						}
						element = element.parentElement;
					}
					return 'none';
				},

				/**
				 * Sets the Prism `language-xxxx` class of the given element.
				 *
				 * @param {Element} element
				 * @param {string} language
				 * @returns {void}
				 */
				setLanguage: function (element, language) {
					// remove all `language-xxxx` classes
					// (this might leave behind a leading space)
					element.className = element.className.replace(RegExp(lang, 'gi'), '');

					// add the new `language-xxxx` class
					// (using `classList` will automatically clean up spaces for us)
					element.classList.add('language-' + language);
				},

				/**
				 * Returns the script element that is currently executing.
				 *
				 * This does __not__ work for line script element.
				 *
				 * @returns {HTMLScriptElement | null}
				 */
				currentScript: function () {
					if (typeof document === 'undefined') {
						return null;
					}
					if ('currentScript' in document && 1 < 2 /* hack to trip TS' flow analysis */) {
						return /** @type {any} */ (document.currentScript);
					}

					// IE11 workaround
					// we'll get the src of the current script by parsing IE11's error stack trace
					// this will not work for inline scripts

					try {
						throw new Error();
					} catch (err) {
						// Get file src url from stack. Specifically works with the format of stack traces in IE.
						// A stack will look like this:
						//
						// Error
						//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
						//    at Global code (http://localhost/components/prism-core.js:606:1)

						var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];
						if (src) {
							var scripts = document.getElementsByTagName('script');
							for (var i in scripts) {
								if (scripts[i].src == src) {
									return scripts[i];
								}
							}
						}
						return null;
					}
				},

				/**
				 * Returns whether a given class is active for `element`.
				 *
				 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
				 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
				 * given class is just the given class with a `no-` prefix.
				 *
				 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
				 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
				 * ancestors have the given class or the negated version of it, then the default activation will be returned.
				 *
				 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
				 * version of it, the class is considered active.
				 *
				 * @param {Element} element
				 * @param {string} className
				 * @param {boolean} [defaultActivation=false]
				 * @returns {boolean}
				 */
				isActive: function (element, className, defaultActivation) {
					var no = 'no-' + className;

					while (element) {
						var classList = element.classList;
						if (classList.contains(className)) {
							return true;
						}
						if (classList.contains(no)) {
							return false;
						}
						element = element.parentElement;
					}
					return !!defaultActivation;
				}
			},

			/**
			 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
			 *
			 * @namespace
			 * @memberof Prism
			 * @public
			 */
			languages: {
				/**
				 * The grammar for plain, unformatted text.
				 */
				plain: plainTextGrammar,
				plaintext: plainTextGrammar,
				text: plainTextGrammar,
				txt: plainTextGrammar,

				/**
				 * Creates a deep copy of the language with the given id and appends the given tokens.
				 *
				 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
				 * will be overwritten at its original position.
				 *
				 * ## Best practices
				 *
				 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
				 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
				 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
				 *
				 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
				 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
				 *
				 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
				 * @param {Grammar} redef The new tokens to append.
				 * @returns {Grammar} The new language created.
				 * @public
				 * @example
				 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
				 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
				 *     // at its original position
				 *     'comment': { ... },
				 *     // CSS doesn't have a 'color' token, so this token will be appended
				 *     'color': /\b(?:red|green|blue)\b/
				 * });
				 */
				extend: function (id, redef) {
					var lang = _.util.clone(_.languages[id]);

					for (var key in redef) {
						lang[key] = redef[key];
					}

					return lang;
				},

				/**
				 * Inserts tokens _before_ another token in a language definition or any other grammar.
				 *
				 * ## Usage
				 *
				 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
				 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
				 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
				 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
				 * this:
				 *
				 * ```js
				 * Prism.languages.markup.style = {
				 *     // token
				 * };
				 * ```
				 *
				 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
				 * before existing tokens. For the CSS example above, you would use it like this:
				 *
				 * ```js
				 * Prism.languages.insertBefore('markup', 'cdata', {
				 *     'style': {
				 *         // token
				 *     }
				 * });
				 * ```
				 *
				 * ## Special cases
				 *
				 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
				 * will be ignored.
				 *
				 * This behavior can be used to insert tokens after `before`:
				 *
				 * ```js
				 * Prism.languages.insertBefore('markup', 'comment', {
				 *     'comment': Prism.languages.markup.comment,
				 *     // tokens after 'comment'
				 * });
				 * ```
				 *
				 * ## Limitations
				 *
				 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
				 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
				 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
				 * deleting properties which is necessary to insert at arbitrary positions.
				 *
				 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
				 * Instead, it will create a new object and replace all references to the target object with the new one. This
				 * can be done without temporarily deleting properties, so the iteration order is well-defined.
				 *
				 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
				 * you hold the target object in a variable, then the value of the variable will not change.
				 *
				 * ```js
				 * var oldMarkup = Prism.languages.markup;
				 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
				 *
				 * assert(oldMarkup !== Prism.languages.markup);
				 * assert(newMarkup === Prism.languages.markup);
				 * ```
				 *
				 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
				 * object to be modified.
				 * @param {string} before The key to insert before.
				 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
				 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
				 * object to be modified.
				 *
				 * Defaults to `Prism.languages`.
				 * @returns {Grammar} The new grammar object.
				 * @public
				 */
				insertBefore: function (inside, before, insert, root) {
					root = root || /** @type {any} */ (_.languages);
					var grammar = root[inside];
					/** @type {Grammar} */
					var ret = {};

					for (var token in grammar) {
						if (grammar.hasOwnProperty(token)) {

							if (token == before) {
								for (var newToken in insert) {
									if (insert.hasOwnProperty(newToken)) {
										ret[newToken] = insert[newToken];
									}
								}
							}

							// Do not insert token which also occur in insert. See #1525
							if (!insert.hasOwnProperty(token)) {
								ret[token] = grammar[token];
							}
						}
					}

					var old = root[inside];
					root[inside] = ret;

					// Update references in other language definitions
					_.languages.DFS(_.languages, function (key, value) {
						if (value === old && key != inside) {
							this[key] = ret;
						}
					});

					return ret;
				},

				// Traverse a language definition with Depth First Search
				DFS: function DFS(o, callback, type, visited) {
					visited = visited || {};

					var objId = _.util.objId;

					for (var i in o) {
						if (o.hasOwnProperty(i)) {
							callback.call(o, i, o[i], type || i);

							var property = o[i];
							var propertyType = _.util.type(property);

							if (propertyType === 'Object' && !visited[objId(property)]) {
								visited[objId(property)] = true;
								DFS(property, callback, null, visited);
							} else if (propertyType === 'Array' && !visited[objId(property)]) {
								visited[objId(property)] = true;
								DFS(property, callback, i, visited);
							}
						}
					}
				}
			},

			plugins: {},

			/**
			 * This is the most high-level function in Prism’s API.
			 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
			 * each one of them.
			 *
			 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
			 *
			 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
			 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
			 * @memberof Prism
			 * @public
			 */
			highlightAll: function (async, callback) {
				_.highlightAllUnder(document, async, callback);
			},

			/**
			 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
			 * {@link Prism.highlightElement} on each one of them.
			 *
			 * The following hooks will be run:
			 * 1. `before-highlightall`
			 * 2. `before-all-elements-highlight`
			 * 3. All hooks of {@link Prism.highlightElement} for each element.
			 *
			 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
			 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
			 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
			 * @memberof Prism
			 * @public
			 */
			highlightAllUnder: function (container, async, callback) {
				var env = {
					callback: callback,
					container: container,
					selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
				};

				_.hooks.run('before-highlightall', env);

				env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

				_.hooks.run('before-all-elements-highlight', env);

				for (var i = 0, element; (element = env.elements[i++]);) {
					_.highlightElement(element, async === true, env.callback);
				}
			},

			/**
			 * Highlights the code inside a single element.
			 *
			 * The following hooks will be run:
			 * 1. `before-sanity-check`
			 * 2. `before-highlight`
			 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
			 * 4. `before-insert`
			 * 5. `after-highlight`
			 * 6. `complete`
			 *
			 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
			 * the element's language.
			 *
			 * @param {Element} element The element containing the code.
			 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
			 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
			 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
			 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
			 *
			 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
			 * asynchronous highlighting to work. You can build your own bundle on the
			 * [Download page](https://prismjs.com/download.html).
			 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
			 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
			 * @memberof Prism
			 * @public
			 */
			highlightElement: function (element, async, callback) {
				// Find language
				var language = _.util.getLanguage(element);
				var grammar = _.languages[language];

				// Set language on the element, if not present
				_.util.setLanguage(element, language);

				// Set language on the parent, for styling
				var parent = element.parentElement;
				if (parent && parent.nodeName.toLowerCase() === 'pre') {
					_.util.setLanguage(parent, language);
				}

				var code = element.textContent;

				var env = {
					element: element,
					language: language,
					grammar: grammar,
					code: code
				};

				function insertHighlightedCode(highlightedCode) {
					env.highlightedCode = highlightedCode;

					_.hooks.run('before-insert', env);

					env.element.innerHTML = env.highlightedCode;

					_.hooks.run('after-highlight', env);
					_.hooks.run('complete', env);
					callback && callback.call(env.element);
				}

				_.hooks.run('before-sanity-check', env);

				// plugins may change/add the parent/element
				parent = env.element.parentElement;
				if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
					parent.setAttribute('tabindex', '0');
				}

				if (!env.code) {
					_.hooks.run('complete', env);
					callback && callback.call(env.element);
					return;
				}

				_.hooks.run('before-highlight', env);

				if (!env.grammar) {
					insertHighlightedCode(_.util.encode(env.code));
					return;
				}

				if (async && _self.Worker) {
					var worker = new Worker(_.filename);

					worker.onmessage = function (evt) {
						insertHighlightedCode(evt.data);
					};

					worker.postMessage(JSON.stringify({
						language: env.language,
						code: env.code,
						immediateClose: true
					}));
				} else {
					insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
				}
			},

			/**
			 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
			 * and the language definitions to use, and returns a string with the HTML produced.
			 *
			 * The following hooks will be run:
			 * 1. `before-tokenize`
			 * 2. `after-tokenize`
			 * 3. `wrap`: On each {@link Token}.
			 *
			 * @param {string} text A string with the code to be highlighted.
			 * @param {Grammar} grammar An object containing the tokens to use.
			 *
			 * Usually a language definition like `Prism.languages.markup`.
			 * @param {string} language The name of the language definition passed to `grammar`.
			 * @returns {string} The highlighted HTML.
			 * @memberof Prism
			 * @public
			 * @example
			 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
			 */
			highlight: function (text, grammar, language) {
				var env = {
					code: text,
					grammar: grammar,
					language: language
				};
				_.hooks.run('before-tokenize', env);
				if (!env.grammar) {
					throw new Error('The language "' + env.language + '" has no grammar.');
				}
				env.tokens = _.tokenize(env.code, env.grammar);
				_.hooks.run('after-tokenize', env);
				return Token.stringify(_.util.encode(env.tokens), env.language);
			},

			/**
			 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
			 * and the language definitions to use, and returns an array with the tokenized code.
			 *
			 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
			 *
			 * This method could be useful in other contexts as well, as a very crude parser.
			 *
			 * @param {string} text A string with the code to be highlighted.
			 * @param {Grammar} grammar An object containing the tokens to use.
			 *
			 * Usually a language definition like `Prism.languages.markup`.
			 * @returns {TokenStream} An array of strings and tokens, a token stream.
			 * @memberof Prism
			 * @public
			 * @example
			 * let code = `var foo = 0;`;
			 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
			 * tokens.forEach(token => {
			 *     if (token instanceof Prism.Token && token.type === 'number') {
			 *         console.log(`Found numeric literal: ${token.content}`);
			 *     }
			 * });
			 */
			tokenize: function (text, grammar) {
				var rest = grammar.rest;
				if (rest) {
					for (var token in rest) {
						grammar[token] = rest[token];
					}

					delete grammar.rest;
				}

				var tokenList = new LinkedList();
				addAfter(tokenList, tokenList.head, text);

				matchGrammar(text, tokenList, grammar, tokenList.head, 0);

				return toArray(tokenList);
			},

			/**
			 * @namespace
			 * @memberof Prism
			 * @public
			 */
			hooks: {
				all: {},

				/**
				 * Adds the given callback to the list of callbacks for the given hook.
				 *
				 * The callback will be invoked when the hook it is registered for is run.
				 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
				 *
				 * One callback function can be registered to multiple hooks and the same hook multiple times.
				 *
				 * @param {string} name The name of the hook.
				 * @param {HookCallback} callback The callback function which is given environment variables.
				 * @public
				 */
				add: function (name, callback) {
					var hooks = _.hooks.all;

					hooks[name] = hooks[name] || [];

					hooks[name].push(callback);
				},

				/**
				 * Runs a hook invoking all registered callbacks with the given environment variables.
				 *
				 * Callbacks will be invoked synchronously and in the order in which they were registered.
				 *
				 * @param {string} name The name of the hook.
				 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
				 * @public
				 */
				run: function (name, env) {
					var callbacks = _.hooks.all[name];

					if (!callbacks || !callbacks.length) {
						return;
					}

					for (var i = 0, callback; (callback = callbacks[i++]);) {
						callback(env);
					}
				}
			},

			Token: Token
		};
		_self.Prism = _;


		// Typescript note:
		// The following can be used to import the Token type in JSDoc:
		//
		//   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

		/**
		 * Creates a new token.
		 *
		 * @param {string} type See {@link Token#type type}
		 * @param {string | TokenStream} content See {@link Token#content content}
		 * @param {string|string[]} [alias] The alias(es) of the token.
		 * @param {string} [matchedStr=""] A copy of the full string this token was created from.
		 * @class
		 * @global
		 * @public
		 */
		function Token(type, content, alias, matchedStr) {
			/**
			 * The type of the token.
			 *
			 * This is usually the key of a pattern in a {@link Grammar}.
			 *
			 * @type {string}
			 * @see GrammarToken
			 * @public
			 */
			this.type = type;
			/**
			 * The strings or tokens contained by this token.
			 *
			 * This will be a token stream if the pattern matched also defined an `inside` grammar.
			 *
			 * @type {string | TokenStream}
			 * @public
			 */
			this.content = content;
			/**
			 * The alias(es) of the token.
			 *
			 * @type {string|string[]}
			 * @see GrammarToken
			 * @public
			 */
			this.alias = alias;
			// Copy of the full string this token was created from
			this.length = (matchedStr || '').length | 0;
		}

		/**
		 * A token stream is an array of strings and {@link Token Token} objects.
		 *
		 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
		 * them.
		 *
		 * 1. No adjacent strings.
		 * 2. No empty strings.
		 *
		 *    The only exception here is the token stream that only contains the empty string and nothing else.
		 *
		 * @typedef {Array<string | Token>} TokenStream
		 * @global
		 * @public
		 */

		/**
		 * Converts the given token or token stream to an HTML representation.
		 *
		 * The following hooks will be run:
		 * 1. `wrap`: On each {@link Token}.
		 *
		 * @param {string | Token | TokenStream} o The token or token stream to be converted.
		 * @param {string} language The name of current language.
		 * @returns {string} The HTML representation of the token or token stream.
		 * @memberof Token
		 * @static
		 */
		Token.stringify = function stringify(o, language) {
			if (typeof o == 'string') {
				return o;
			}
			if (Array.isArray(o)) {
				var s = '';
				o.forEach(function (e) {
					s += stringify(e, language);
				});
				return s;
			}

			var env = {
				type: o.type,
				content: stringify(o.content, language),
				tag: 'span',
				classes: ['token', o.type],
				attributes: {},
				language: language
			};

			var aliases = o.alias;
			if (aliases) {
				if (Array.isArray(aliases)) {
					Array.prototype.push.apply(env.classes, aliases);
				} else {
					env.classes.push(aliases);
				}
			}

			_.hooks.run('wrap', env);

			var attributes = '';
			for (var name in env.attributes) {
				attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
			}

			return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
		};

		/**
		 * @param {RegExp} pattern
		 * @param {number} pos
		 * @param {string} text
		 * @param {boolean} lookbehind
		 * @returns {RegExpExecArray | null}
		 */
		function matchPattern(pattern, pos, text, lookbehind) {
			pattern.lastIndex = pos;
			var match = pattern.exec(text);
			if (match && lookbehind && match[1]) {
				// change the match to remove the text matched by the Prism lookbehind group
				var lookbehindLength = match[1].length;
				match.index += lookbehindLength;
				match[0] = match[0].slice(lookbehindLength);
			}
			return match;
		}

		/**
		 * @param {string} text
		 * @param {LinkedList<string | Token>} tokenList
		 * @param {any} grammar
		 * @param {LinkedListNode<string | Token>} startNode
		 * @param {number} startPos
		 * @param {RematchOptions} [rematch]
		 * @returns {void}
		 * @private
		 *
		 * @typedef RematchOptions
		 * @property {string} cause
		 * @property {number} reach
		 */
		function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
			for (var token in grammar) {
				if (!grammar.hasOwnProperty(token) || !grammar[token]) {
					continue;
				}

				var patterns = grammar[token];
				patterns = Array.isArray(patterns) ? patterns : [patterns];

				for (var j = 0; j < patterns.length; ++j) {
					if (rematch && rematch.cause == token + ',' + j) {
						return;
					}

					var patternObj = patterns[j];
					var inside = patternObj.inside;
					var lookbehind = !!patternObj.lookbehind;
					var greedy = !!patternObj.greedy;
					var alias = patternObj.alias;

					if (greedy && !patternObj.pattern.global) {
						// Without the global flag, lastIndex won't work
						var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
						patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
					}

					/** @type {RegExp} */
					var pattern = patternObj.pattern || patternObj;

					for ( // iterate the token list and keep track of the current token/string position
						var currentNode = startNode.next, pos = startPos;
						currentNode !== tokenList.tail;
						pos += currentNode.value.length, currentNode = currentNode.next
					) {

						if (rematch && pos >= rematch.reach) {
							break;
						}

						var str = currentNode.value;

						if (tokenList.length > text.length) {
							// Something went terribly wrong, ABORT, ABORT!
							return;
						}

						if (str instanceof Token) {
							continue;
						}

						var removeCount = 1; // this is the to parameter of removeBetween
						var match;

						if (greedy) {
							match = matchPattern(pattern, pos, text, lookbehind);
							if (!match || match.index >= text.length) {
								break;
							}

							var from = match.index;
							var to = match.index + match[0].length;
							var p = pos;

							// find the node that contains the match
							p += currentNode.value.length;
							while (from >= p) {
								currentNode = currentNode.next;
								p += currentNode.value.length;
							}
							// adjust pos (and p)
							p -= currentNode.value.length;
							pos = p;

							// the current node is a Token, then the match starts inside another Token, which is invalid
							if (currentNode.value instanceof Token) {
								continue;
							}

							// find the last node which is affected by this match
							for (
								var k = currentNode;
								k !== tokenList.tail && (p < to || typeof k.value === 'string');
								k = k.next
							) {
								removeCount++;
								p += k.value.length;
							}
							removeCount--;

							// replace with the new match
							str = text.slice(pos, p);
							match.index -= pos;
						} else {
							match = matchPattern(pattern, 0, str, lookbehind);
							if (!match) {
								continue;
							}
						}

						// eslint-disable-next-line no-redeclare
						var from = match.index;
						var matchStr = match[0];
						var before = str.slice(0, from);
						var after = str.slice(from + matchStr.length);

						var reach = pos + str.length;
						if (rematch && reach > rematch.reach) {
							rematch.reach = reach;
						}

						var removeFrom = currentNode.prev;

						if (before) {
							removeFrom = addAfter(tokenList, removeFrom, before);
							pos += before.length;
						}

						removeRange(tokenList, removeFrom, removeCount);

						var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
						currentNode = addAfter(tokenList, removeFrom, wrapped);

						if (after) {
							addAfter(tokenList, currentNode, after);
						}

						if (removeCount > 1) {
							// at least one Token object was removed, so we have to do some rematching
							// this can only happen if the current pattern is greedy

							/** @type {RematchOptions} */
							var nestedRematch = {
								cause: token + ',' + j,
								reach: reach
							};
							matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

							// the reach might have been extended because of the rematching
							if (rematch && nestedRematch.reach > rematch.reach) {
								rematch.reach = nestedRematch.reach;
							}
						}
					}
				}
			}
		}

		/**
		 * @typedef LinkedListNode
		 * @property {T} value
		 * @property {LinkedListNode<T> | null} prev The previous node.
		 * @property {LinkedListNode<T> | null} next The next node.
		 * @template T
		 * @private
		 */

		/**
		 * @template T
		 * @private
		 */
		function LinkedList() {
			/** @type {LinkedListNode<T>} */
			var head = { value: null, prev: null, next: null };
			/** @type {LinkedListNode<T>} */
			var tail = { value: null, prev: head, next: null };
			head.next = tail;

			/** @type {LinkedListNode<T>} */
			this.head = head;
			/** @type {LinkedListNode<T>} */
			this.tail = tail;
			this.length = 0;
		}

		/**
		 * Adds a new node with the given value to the list.
		 *
		 * @param {LinkedList<T>} list
		 * @param {LinkedListNode<T>} node
		 * @param {T} value
		 * @returns {LinkedListNode<T>} The added node.
		 * @template T
		 */
		function addAfter(list, node, value) {
			// assumes that node != list.tail && values.length >= 0
			var next = node.next;

			var newNode = { value: value, prev: node, next: next };
			node.next = newNode;
			next.prev = newNode;
			list.length++;

			return newNode;
		}
		/**
		 * Removes `count` nodes after the given node. The given node will not be removed.
		 *
		 * @param {LinkedList<T>} list
		 * @param {LinkedListNode<T>} node
		 * @param {number} count
		 * @template T
		 */
		function removeRange(list, node, count) {
			var next = node.next;
			for (var i = 0; i < count && next !== list.tail; i++) {
				next = next.next;
			}
			node.next = next;
			next.prev = node;
			list.length -= i;
		}
		/**
		 * @param {LinkedList<T>} list
		 * @returns {T[]}
		 * @template T
		 */
		function toArray(list) {
			var array = [];
			var node = list.head.next;
			while (node !== list.tail) {
				array.push(node.value);
				node = node.next;
			}
			return array;
		}


		if (!_self.document) {
			if (!_self.addEventListener) {
				// in Node.js
				return _;
			}

			if (!_.disableWorkerMessageHandler) {
				// In worker
				_self.addEventListener('message', function (evt) {
					var message = JSON.parse(evt.data);
					var lang = message.language;
					var code = message.code;
					var immediateClose = message.immediateClose;

					_self.postMessage(_.highlight(code, _.languages[lang], lang));
					if (immediateClose) {
						_self.close();
					}
				}, false);
			}

			return _;
		}

		// Get current script and highlight
		var script = _.util.currentScript();

		if (script) {
			_.filename = script.src;

			if (script.hasAttribute('data-manual')) {
				_.manual = true;
			}
		}

		function highlightAutomaticallyCallback() {
			if (!_.manual) {
				_.highlightAll();
			}
		}

		if (!_.manual) {
			// If the document state is "loading", then we'll use DOMContentLoaded.
			// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
			// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
			// might take longer one animation frame to execute which can create a race condition where only some plugins have
			// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
			// See https://github.com/PrismJS/prism/issues/2102
			var readyState = document.readyState;
			if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
				document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
			} else {
				if (window.requestAnimationFrame) {
					window.requestAnimationFrame(highlightAutomaticallyCallback);
				} else {
					window.setTimeout(highlightAutomaticallyCallback, 16);
				}
			}
		}

		return _;

	}(_self));

	if (module.exports) {
		module.exports = Prism;
	}

	// hack for components to work correctly in node.js
	if (typeof commonjsGlobal !== 'undefined') {
		commonjsGlobal.Prism = Prism;
	}

	// some additional documentation/types

	/**
	 * The expansion of a simple `RegExp` literal to support additional properties.
	 *
	 * @typedef GrammarToken
	 * @property {RegExp} pattern The regular expression of the token.
	 * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
	 * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
	 * @property {boolean} [greedy=false] Whether the token is greedy.
	 * @property {string|string[]} [alias] An optional alias or list of aliases.
	 * @property {Grammar} [inside] The nested grammar of this token.
	 *
	 * The `inside` grammar will be used to tokenize the text value of each token of this kind.
	 *
	 * This can be used to make nested and even recursive language definitions.
	 *
	 * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
	 * each another.
	 * @global
	 * @public
	 */

	/**
	 * @typedef Grammar
	 * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
	 * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
	 * @global
	 * @public
	 */

	/**
	 * A function which will invoked after an element was successfully highlighted.
	 *
	 * @callback HighlightCallback
	 * @param {Element} element The element successfully highlighted.
	 * @returns {void}
	 * @global
	 * @public
	 */

	/**
	 * @callback HookCallback
	 * @param {Object<string, any>} env The environment variables of the hook.
	 * @returns {void}
	 * @global
	 * @public
	 */


	/* **********************************************
	     Begin prism-markup.js
	********************************************** */

	Prism.languages.markup = {
		'comment': {
			pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
			greedy: true
		},
		'prolog': {
			pattern: /<\?[\s\S]+?\?>/,
			greedy: true
		},
		'doctype': {
			// https://www.w3.org/TR/xml/#NT-doctypedecl
			pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
			greedy: true,
			inside: {
				'internal-subset': {
					pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
					lookbehind: true,
					greedy: true,
					inside: null // see below
				},
				'string': {
					pattern: /"[^"]*"|'[^']*'/,
					greedy: true
				},
				'punctuation': /^<!|>$|[[\]]/,
				'doctype-tag': /^DOCTYPE/i,
				'name': /[^\s<>'"]+/
			}
		},
		'cdata': {
			pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
			greedy: true
		},
		'tag': {
			pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
			greedy: true,
			inside: {
				'tag': {
					pattern: /^<\/?[^\s>\/]+/,
					inside: {
						'punctuation': /^<\/?/,
						'namespace': /^[^\s>\/:]+:/
					}
				},
				'special-attr': [],
				'attr-value': {
					pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
					inside: {
						'punctuation': [
							{
								pattern: /^=/,
								alias: 'attr-equals'
							},
							{
								pattern: /^(\s*)["']|["']$/,
								lookbehind: true
							}
						]
					}
				},
				'punctuation': /\/?>/,
				'attr-name': {
					pattern: /[^\s>\/]+/,
					inside: {
						'namespace': /^[^\s>\/:]+:/
					}
				}

			}
		},
		'entity': [
			{
				pattern: /&[\da-z]{1,8};/i,
				alias: 'named-entity'
			},
			/&#x?[\da-f]{1,8};/i
		]
	};

	Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
		Prism.languages.markup['entity'];
	Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

	// Plugin to make entity title show the real entity, idea by Roman Komarov
	Prism.hooks.add('wrap', function (env) {

		if (env.type === 'entity') {
			env.attributes['title'] = env.content.replace(/&amp;/, '&');
		}
	});

	Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
		/**
		 * Adds an inlined language to markup.
		 *
		 * An example of an inlined language is CSS with `<style>` tags.
		 *
		 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
		 * case insensitive.
		 * @param {string} lang The language key.
		 * @example
		 * addInlined('style', 'css');
		 */
		value: function addInlined(tagName, lang) {
			var includedCdataInside = {};
			includedCdataInside['language-' + lang] = {
				pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
				lookbehind: true,
				inside: Prism.languages[lang]
			};
			includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

			var inside = {
				'included-cdata': {
					pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
					inside: includedCdataInside
				}
			};
			inside['language-' + lang] = {
				pattern: /[\s\S]+/,
				inside: Prism.languages[lang]
			};

			var def = {};
			def[tagName] = {
				pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
				lookbehind: true,
				greedy: true,
				inside: inside
			};

			Prism.languages.insertBefore('markup', 'cdata', def);
		}
	});
	Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
		/**
		 * Adds an pattern to highlight languages embedded in HTML attributes.
		 *
		 * An example of an inlined language is CSS with `style` attributes.
		 *
		 * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
		 * case insensitive.
		 * @param {string} lang The language key.
		 * @example
		 * addAttribute('style', 'css');
		 */
		value: function (attrName, lang) {
			Prism.languages.markup.tag.inside['special-attr'].push({
				pattern: RegExp(
					/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
					'i'
				),
				lookbehind: true,
				inside: {
					'attr-name': /^[^\s=]+/,
					'attr-value': {
						pattern: /=[\s\S]+/,
						inside: {
							'value': {
								pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
								lookbehind: true,
								alias: [lang, 'language-' + lang],
								inside: Prism.languages[lang]
							},
							'punctuation': [
								{
									pattern: /^=/,
									alias: 'attr-equals'
								},
								/"|'/
							]
						}
					}
				}
			});
		}
	});

	Prism.languages.html = Prism.languages.markup;
	Prism.languages.mathml = Prism.languages.markup;
	Prism.languages.svg = Prism.languages.markup;

	Prism.languages.xml = Prism.languages.extend('markup', {});
	Prism.languages.ssml = Prism.languages.xml;
	Prism.languages.atom = Prism.languages.xml;
	Prism.languages.rss = Prism.languages.xml;


	/* **********************************************
	     Begin prism-css.js
	********************************************** */

	(function (Prism) {

		var string = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;

		Prism.languages.css = {
			'comment': /\/\*[\s\S]*?\*\//,
			'atrule': {
				pattern: RegExp('@[\\w-](?:' + /[^;{\s"']|\s+(?!\s)/.source + '|' + string.source + ')*?' + /(?:;|(?=\s*\{))/.source),
				inside: {
					'rule': /^@[\w-]+/,
					'selector-function-argument': {
						pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
						lookbehind: true,
						alias: 'selector'
					},
					'keyword': {
						pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
						lookbehind: true
					}
					// See rest below
				}
			},
			'url': {
				// https://drafts.csswg.org/css-values-3/#urls
				pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
				greedy: true,
				inside: {
					'function': /^url/i,
					'punctuation': /^\(|\)$/,
					'string': {
						pattern: RegExp('^' + string.source + '$'),
						alias: 'url'
					}
				}
			},
			'selector': {
				pattern: RegExp('(^|[{}\\s])[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
				lookbehind: true
			},
			'string': {
				pattern: string,
				greedy: true
			},
			'property': {
				pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
				lookbehind: true
			},
			'important': /!important\b/i,
			'function': {
				pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
				lookbehind: true
			},
			'punctuation': /[(){};:,]/
		};

		Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

		var markup = Prism.languages.markup;
		if (markup) {
			markup.tag.addInlined('style', 'css');
			markup.tag.addAttribute('style', 'css');
		}

	}(Prism));


	/* **********************************************
	     Begin prism-clike.js
	********************************************** */

	Prism.languages.clike = {
		'comment': [
			{
				pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
				lookbehind: true,
				greedy: true
			},
			{
				pattern: /(^|[^\\:])\/\/.*/,
				lookbehind: true,
				greedy: true
			}
		],
		'string': {
			pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
			greedy: true
		},
		'class-name': {
			pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
			lookbehind: true,
			inside: {
				'punctuation': /[.\\]/
			}
		},
		'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
		'boolean': /\b(?:false|true)\b/,
		'function': /\b\w+(?=\()/,
		'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
		'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
		'punctuation': /[{}[\];(),.:]/
	};


	/* **********************************************
	     Begin prism-javascript.js
	********************************************** */

	Prism.languages.javascript = Prism.languages.extend('clike', {
		'class-name': [
			Prism.languages.clike['class-name'],
			{
				pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
				lookbehind: true
			}
		],
		'keyword': [
			{
				pattern: /((?:^|\})\s*)catch\b/,
				lookbehind: true
			},
			{
				pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
				lookbehind: true
			},
		],
		// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
		'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
		'number': {
			pattern: RegExp(
				/(^|[^\w$])/.source +
				'(?:' +
				(
					// constant
					/NaN|Infinity/.source +
					'|' +
					// binary integer
					/0[bB][01]+(?:_[01]+)*n?/.source +
					'|' +
					// octal integer
					/0[oO][0-7]+(?:_[0-7]+)*n?/.source +
					'|' +
					// hexadecimal integer
					/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
					'|' +
					// decimal bigint
					/\d+(?:_\d+)*n/.source +
					'|' +
					// decimal number (integer or float) but no bigint
					/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source
				) +
				')' +
				/(?![\w$])/.source
			),
			lookbehind: true
		},
		'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
	});

	Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;

	Prism.languages.insertBefore('javascript', 'keyword', {
		'regex': {
			pattern: RegExp(
				// lookbehind
				// eslint-disable-next-line regexp/no-dupe-characters-character-class
				/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
				// Regex pattern:
				// There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
				// classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
				// with the only syntax, so we have to define 2 different regex patterns.
				/\//.source +
				'(?:' +
				/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source +
				'|' +
				// `v` flag syntax. This supports 3 levels of nested character classes.
				/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source +
				')' +
				// lookahead
				/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
			),
			lookbehind: true,
			greedy: true,
			inside: {
				'regex-source': {
					pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
					lookbehind: true,
					alias: 'language-regex',
					inside: Prism.languages.regex
				},
				'regex-delimiter': /^\/|\/$/,
				'regex-flags': /^[a-z]+$/,
			}
		},
		// This must be declared before keyword because we use "function" inside the look-forward
		'function-variable': {
			pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
			alias: 'function'
		},
		'parameter': [
			{
				pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			}
		],
		'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
	});

	Prism.languages.insertBefore('javascript', 'string', {
		'hashbang': {
			pattern: /^#!.*/,
			greedy: true,
			alias: 'comment'
		},
		'template-string': {
			pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
			greedy: true,
			inside: {
				'template-punctuation': {
					pattern: /^`|`$/,
					alias: 'string'
				},
				'interpolation': {
					pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
					lookbehind: true,
					inside: {
						'interpolation-punctuation': {
							pattern: /^\$\{|\}$/,
							alias: 'punctuation'
						},
						rest: Prism.languages.javascript
					}
				},
				'string': /[\s\S]+/
			}
		},
		'string-property': {
			pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
			lookbehind: true,
			greedy: true,
			alias: 'property'
		}
	});

	Prism.languages.insertBefore('javascript', 'operator', {
		'literal-property': {
			pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
			lookbehind: true,
			alias: 'property'
		},
	});

	if (Prism.languages.markup) {
		Prism.languages.markup.tag.addInlined('script', 'javascript');

		// add attribute support for all DOM events.
		// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
		Prism.languages.markup.tag.addAttribute(
			/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
			'javascript'
		);
	}

	Prism.languages.js = Prism.languages.javascript;


	/* **********************************************
	     Begin prism-file-highlight.js
	********************************************** */

	(function () {

		if (typeof Prism === 'undefined' || typeof document === 'undefined') {
			return;
		}

		// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
		if (!Element.prototype.matches) {
			Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
		}

		var LOADING_MESSAGE = 'Loading…';
		var FAILURE_MESSAGE = function (status, message) {
			return '✖ Error ' + status + ' while fetching file: ' + message;
		};
		var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

		var EXTENSIONS = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		var STATUS_ATTR = 'data-src-status';
		var STATUS_LOADING = 'loading';
		var STATUS_LOADED = 'loaded';
		var STATUS_FAILED = 'failed';

		var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
			+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

		/**
		 * Loads the given file.
		 *
		 * @param {string} src The URL or path of the source file to load.
		 * @param {(result: string) => void} success
		 * @param {(reason: string) => void} error
		 */
		function loadFile(src, success, error) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status < 400 && xhr.responseText) {
						success(xhr.responseText);
					} else {
						if (xhr.status >= 400) {
							error(FAILURE_MESSAGE(xhr.status, xhr.statusText));
						} else {
							error(FAILURE_EMPTY_MESSAGE);
						}
					}
				}
			};
			xhr.send(null);
		}

		/**
		 * Parses the given range.
		 *
		 * This returns a range with inclusive ends.
		 *
		 * @param {string | null | undefined} range
		 * @returns {[number, number | undefined] | undefined}
		 */
		function parseRange(range) {
			var m = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(range || '');
			if (m) {
				var start = Number(m[1]);
				var comma = m[2];
				var end = m[3];

				if (!comma) {
					return [start, start];
				}
				if (!end) {
					return [start, undefined];
				}
				return [start, Number(end)];
			}
			return undefined;
		}

		Prism.hooks.add('before-highlightall', function (env) {
			env.selector += ', ' + SELECTOR;
		});

		Prism.hooks.add('before-sanity-check', function (env) {
			var pre = /** @type {HTMLPreElement} */ (env.element);
			if (pre.matches(SELECTOR)) {
				env.code = ''; // fast-path the whole thing and go to complete

				pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

				// add code element with loading message
				var code = pre.appendChild(document.createElement('CODE'));
				code.textContent = LOADING_MESSAGE;

				var src = pre.getAttribute('data-src');

				var language = env.language;
				if (language === 'none') {
					// the language might be 'none' because there is no language set;
					// in this case, we want to use the extension as the language
					var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
					language = EXTENSIONS[extension] || extension;
				}

				// set language classes
				Prism.util.setLanguage(code, language);
				Prism.util.setLanguage(pre, language);

				// preload the language
				var autoloader = Prism.plugins.autoloader;
				if (autoloader) {
					autoloader.loadLanguages(language);
				}

				// load file
				loadFile(
					src,
					function (text) {
						// mark as loaded
						pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

						// handle data-range
						var range = parseRange(pre.getAttribute('data-range'));
						if (range) {
							var lines = text.split(/\r\n?|\n/g);

							// the range is one-based and inclusive on both ends
							var start = range[0];
							var end = range[1] == null ? lines.length : range[1];

							if (start < 0) { start += lines.length; }
							start = Math.max(0, Math.min(start - 1, lines.length));
							if (end < 0) { end += lines.length; }
							end = Math.max(0, Math.min(end, lines.length));

							text = lines.slice(start, end).join('\n');

							// add data-start for line numbers
							if (!pre.hasAttribute('data-start')) {
								pre.setAttribute('data-start', String(start + 1));
							}
						}

						// highlight code
						code.textContent = text;
						Prism.highlightElement(code);
					},
					function (error) {
						// mark as failed
						pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

						code.textContent = error;
					}
				);
			}
		});

		Prism.plugins.fileHighlight = {
			/**
			 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
			 *
			 * Note: Elements which are already loaded or currently loading will not be touched by this method.
			 *
			 * @param {ParentNode} [container=document]
			 */
			highlight: function highlight(container) {
				var elements = (container || document).querySelectorAll(SELECTOR);

				for (var i = 0, element; (element = elements[i++]);) {
					Prism.highlightElement(element);
				}
			}
		};

		var logged = false;
		/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
		Prism.fileHighlight = function () {
			if (!logged) {
				console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
				logged = true;
			}
			Prism.plugins.fileHighlight.highlight.apply(this, arguments);
		};

	}());
} (prism));

var prismExports = prism.exports;
var prismjs = /*@__PURE__*/getDefaultExportFromCjs(prismExports);var script$a = {
  name: 'PopupBodyDetails',
  components: {
    ExternalLink: script$c,
    IconArrowNarrow: script$b
  },
  props: {
    details: {
      type: Object,
      required: true
    }
  },
  emits: ['hideDetails'],
  disableAxeAudit: true,
  setup(props) {
    const {
      highlights,
      toggleHighlight
    } = useHighlight();
    const references = computed(() => referencesLinks[props.details.id]);
    function getCodeBlock(source) {
      return prismjs.highlight(source, prismjs.languages.markup, 'markup');
    }
    return {
      references,
      highlights,
      getCodeBlock,
      toggleHighlight
    };
  }
};const _hoisted_1$8 = {
  class: "va-details va-p-5"
};
const _hoisted_2$8 = {
  class: "va-flex va-justify-between va-items-center va-sticky va-bg-main va--mt-5 va-py-3",
  style: {
    "top": "0"
  }
};
const _hoisted_3$6 = {
  class: "va-ml-2 va-text-base va-font-medium va-leading-3"
};
const _hoisted_4$6 = {
  class: "va-w-4 va-h-4 va-text-color",
  fill: "currentColor",
  focusable: "false",
  "aria-hidden": "true",
  viewBox: "0 0 20 20",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_5$3 = {
  key: 0
};
const _hoisted_6$3 = /*#__PURE__*/createElementVNode("path", {
  "fill-rule": "evenodd",
  d: "M3.7 2.3a1 1 0 00-1.4 1.4l14 14a1 1 0 001.4-1.4l-1.5-1.5a10 10 0 003.3-4.8c-1.2-4-5-7-9.5-7a10 10 0 00-4.5 1L3.7 2.4zM8 6.6L9.5 8a2 2 0 012.4 2.4l1.5 1.5A4 4 0 008 6.6z",
  "clip-rule": "evenodd"
}, null, -1);
const _hoisted_7$3 = /*#__PURE__*/createElementVNode("path", {
  d: "M12.5 16.7L9.7 14A4 4 0 016 10.3L2.3 6.6A10 10 0 00.5 10a10 10 0 0012 6.7z"
}, null, -1);
const _hoisted_8$3 = [_hoisted_6$3, _hoisted_7$3];
const _hoisted_9$3 = {
  key: 1
};
const _hoisted_10 = /*#__PURE__*/createElementVNode("path", {
  d: "M10 12a2 2 0 100-4 2 2 0 000 4z"
}, null, -1);
const _hoisted_11 = /*#__PURE__*/createElementVNode("path", {
  "fill-rule": "evenodd",
  d: "M.5 10a10 10 0 0119 0 10 10 0 01-19 0zM14 10a4 4 0 11-8 0 4 4 0 018 0z",
  "clip-rule": "evenodd"
}, null, -1);
const _hoisted_12 = [_hoisted_10, _hoisted_11];
const _hoisted_13 = {
  class: "va-ml-2 va-text-base va-font-medium va-leading-3"
};
const _hoisted_14 = ["aria-labelledby"];
const _hoisted_15 = ["id"];
const _hoisted_16 = {
  class: "va-p-3"
};
const _hoisted_17 = /*#__PURE__*/createElementVNode("br", null, null, -1);
const _hoisted_18 = ["id"];
const _hoisted_19 = {
  class: "va-w-full va-flex va-items-center va-justify-between"
};
const _hoisted_20 = {
  class: "va-font-medium va-text-base"
};
const _hoisted_21 = {
  class: "va-flex va-items-center"
};
const _hoisted_22 = {
  class: "va-mx-1 va-font-medium va-text-sm"
};
const _hoisted_23 = {
  class: "va-code-block va-w-full va-my-3 va-p-4 va-rounded-md va-bg-gray-900"
};
const _hoisted_24 = {
  class: "va-whitespace-pre-wrap"
};
const _hoisted_25 = ["innerHTML"];
const _hoisted_26 = {
  class: "va-w-full va-mt-2"
};
const _hoisted_27 = {
  class: "va-font-medium va-text-base"
};
const _hoisted_28 = {
  class: "va-mt-2"
};
const _hoisted_29 = ["aria-labelledby"];
const _hoisted_30 = ["id"];
const _hoisted_31 = {
  class: "va-p-3 va-pt-2"
};
const _hoisted_32 = /*#__PURE__*/createElementVNode("span", {
  class: "va-text-blue-700 va-text-xl va-font-bold va-inline-block va-w-3 va-mt-1"
}, "•", -1);
function render$a(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_IconArrowNarrow = resolveComponent("IconArrowNarrow");
  const _component_ExternalLink = resolveComponent("ExternalLink");
  return openBlock(), createElementBlock("div", _hoisted_1$8, [createElementVNode("div", _hoisted_2$8, [createElementVNode("button", {
    type: "button",
    class: "va-btn va-flex va-items-center va-px-2 va-py-3 va-relative",
    onClick: _cache[0] || (_cache[0] = $event => _ctx.$emit('hideDetails'))
  }, [createVNode(_component_IconArrowNarrow), createElementVNode("span", _hoisted_3$6, toDisplayString(_ctx.$vat('back', 'Back')), 1)]), createElementVNode("button", {
    type: "button",
    class: "va-btn va-flex va-items-center va-px-2 va-py-3 va-relative",
    onClick: _cache[1] || (_cache[1] = $event => $setup.toggleHighlight($props.details.nodes))
  }, [(openBlock(), createElementBlock("svg", _hoisted_4$6, [$setup.highlights ? (openBlock(), createElementBlock("g", _hoisted_5$3, _hoisted_8$3)) : (openBlock(), createElementBlock("g", _hoisted_9$3, _hoisted_12))])), createElementVNode("span", _hoisted_13, toDisplayString($setup.highlights ? _ctx.$vat('no_highlight', 'Stop highlight') : _ctx.$vat('highlight', 'Highlight')), 1)])]), createElementVNode("section", {
    "aria-labelledby": `issue-desc-${$props.details.id}`
  }, [createElementVNode("h2", {
    id: `issue-desc-${$props.details.id}`,
    class: "va-p-item__header va-bg-primary va-flex va-justify-between va-font-medium va-p-3 va-border va-border-solid va-border-gray-300 va-text-base"
  }, toDisplayString(_ctx.$vat('issue_desc', 'Issue description')), 9, _hoisted_15), createElementVNode("p", _hoisted_16, [createTextVNode(toDisplayString($props.details.description) + " ", 1), _hoisted_17, createVNode(_component_ExternalLink, {
    href: $props.details.helpUrl,
    "aria-labelledby": `more-${$props.details.id} issue-desc-${$props.details.id}`,
    style: {
      "margin-left": "-0.25rem"
    }
  }, {
    default: withCtx(() => [createElementVNode("span", {
      id: `more-${$props.details.id}`
    }, toDisplayString(_ctx.$vat('learn_more', 'Learn more')), 9, _hoisted_18)]),
    _: 1
  }, 8, ["href", "aria-labelledby"])])], 8, _hoisted_14), (openBlock(true), createElementBlock(Fragment, null, renderList($props.details.failureSummary, (failure, index) => {
    return openBlock(), createElementBlock("section", {
      key: `failure-section-${index}`,
      class: "va-flex va-flex-wrap va-px-3 va-mb-8"
    }, [createElementVNode("div", _hoisted_19, [createElementVNode("h2", _hoisted_20, toDisplayString(_ctx.$vat('el_src', 'Element source')), 1), createElementVNode("div", _hoisted_21, [createElementVNode("span", _hoisted_22, toDisplayString(index + 1) + " / " + toDisplayString($props.details.failureSummary.length), 1)])]), createElementVNode("div", _hoisted_23, [createElementVNode("pre", _hoisted_24, [createElementVNode("code", {
      class: "va-w-full va-bg-gray-900 va-text-gray-100",
      innerHTML: $setup.getCodeBlock(failure.source)
    }, null, 8, _hoisted_25)])]), createElementVNode("div", _hoisted_26, [createElementVNode("h3", _hoisted_27, toDisplayString(failure.errors.length > 1 ? _ctx.$vat('fixes') : _ctx.$vat('fix')) + ": ", 1), createElementVNode("ul", _hoisted_28, [(openBlock(true), createElementBlock(Fragment, null, renderList(failure.errors, error => {
      return openBlock(), createElementBlock("li", {
        key: `error-item-${error.id}`,
        class: "va-flex va-items-start va-mt-3"
      }, [createElementVNode("span", {
        class: normalizeClass(`va-text-2xl va-font-bold va-leading-4 va-mr-2 va-text-${error.impact}`)
      }, "•", 2), createElementVNode("p", null, toDisplayString(error.message), 1)]);
    }), 128))])])]);
  }), 128)), withDirectives(createElementVNode("section", {
    "aria-labelledby": `references-${$props.details.id}`
  }, [createElementVNode("h2", {
    id: `references-${$props.details.id}`,
    class: "va-p-item__header va-bg-primary va-flex va-justify-between va-font-medium va-p-3 va-border va-border-solid va-border-gray-300 va-text-base"
  }, toDisplayString(_ctx.$vat('more_links', 'More links')), 9, _hoisted_30), createElementVNode("ul", _hoisted_31, [(openBlock(true), createElementBlock(Fragment, null, renderList($setup.references, (reference, index) => {
    return openBlock(), createElementBlock("li", {
      key: `reference-item-${index}`,
      class: "va-flex"
    }, [_hoisted_32, createVNode(_component_ExternalLink, {
      href: reference.link
    }, {
      default: withCtx(() => [createTextVNode(toDisplayString(reference.title), 1)]),
      _: 2
    }, 1032, ["href"])]);
  }), 128))])], 8, _hoisted_29), [[vShow, $setup.references.length]])]);
}function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}var css_248z$4 = "\n.va-code-block .token.property, .va-code-block .token.tag, .va-code-block .token.constant, .va-code-block .token.symbol, .va-code-block .token.deleted {\n    color: #ffa07a;\n}\n.va-code-block .token.selector, .va-code-block .token.attr-name, .va-code-block .token.string, .va-code-block .token.char, .va-code-block .token.builtin, .va-code-block .token.inserted {\n    color: #abe338;\n}\n.va-code-block .token.atrule, .va-code-block .token.attr-value, .va-code-block .token.function {\n    color: #ffd700;\n}\n";
styleInject(css_248z$4);script$a.render = render$a;var script$9 = {
  name: 'PopupBodyNoIssues',
  disableAxeAudit: true
};const _hoisted_1$7 = {
  class: "va-p-5"
};
const _hoisted_2$7 = {
  id: "congratulation-title",
  class: "va-text-xl va-uppercase va-text-green-800 va-text-center va-mt-3"
};
const _hoisted_3$5 = {
  class: "va-text-center va-mt-4"
};
const _hoisted_4$5 = /*#__PURE__*/createStaticVNode("<div class=\"va-flex va-flex-wrap va-items-center va-justify-center va-my-4 va-pt-4\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"143.5\" height=\"179.7\"><g transform=\"translate(0 -3)\"><circle cx=\"15.3\" cy=\"15.3\" r=\"15.3\" transform=\"translate(53.7 3)\"></circle><path d=\"M69 141.1a35.3 35.3 0 01-18.4-65.4v-7a41.4 41.4 0 1057.8 50.2l-5-5a35.4 35.4 0 01-34.3 27.2z\"></path><path d=\"M53.7 90.5a15.3 15.3 0 0015.4 15.3h30.7l30.7 30.7a7.7 7.7 0 0010.8-10.8L110.6 95a15.3 15.3 0 00-10.8-4.5H84.4v-42a33.7 33.7 0 008.6-6.3l26-26a7.7 7.7 0 00-10.8-10.9l-26 26a18.4 18.4 0 01-26.1 0l-26-26a7.7 7.7 0 00-11 10.9l26.1 26a33.7 33.7 0 008.5 6.2z\"></path><text transform=\"translate(0 172.7)\" font-size=\"7\" font-family=\"Arial-BoldMT, Arial\" font-weight=\"700\"><tspan x=\"0\" y=\"0\">Created by Egon Låstad</tspan></text><text transform=\"translate(0 180.7)\" font-size=\"7\" font-family=\"Arial-BoldMT, Arial\" font-weight=\"700\"><tspan x=\"0\" y=\"0\">from the Noun Project</tspan></text></g></svg></div>", 1);
function render$9(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$7, [createElementVNode("h2", _hoisted_2$7, toDisplayString(_ctx.$vat('congrats', 'Congratulations')), 1), createElementVNode("p", _hoisted_3$5, " (0) " + toDisplayString(_ctx.$vat('no_issues')), 1), _hoisted_4$5]);
}script$9.render = render$9;var script$8 = {
  name: 'WrapperCard',
  disableAxeAudit: true,
  props: {
    tag: {
      type: String,
      default: 'div'
    }
  },
  emits: ['trigger'],
  setup(_, {
    emit
  }) {
    const up = ref(null);
    const down = ref(null);
    function isRightClick(buttons) {
      return buttons === 2;
    }
    function onMouseEvent({
      type,
      buttons,
      target
    }) {
      if (isRightClick(buttons)) return;
      type === 'mousedown' ? onMouseDown() : onMouseUp();
    }
    function onMouseUp() {
      up.value = +new Date();
      if (up.value - down.value < 200) emit('trigger');
    }
    function onMouseDown() {
      down.value = +new Date();
    }
    return {
      onMouseEvent
    };
  }
};function render$8(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(resolveDynamicComponent($props.tag), {
    class: "va-cursor-pointer",
    onMousedown: $setup.onMouseEvent,
    onMouseup: $setup.onMouseEvent
  }, {
    default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
    _: 3
  }, 40, ["onMousedown", "onMouseup"]);
}script$8.render = render$8;var script$7 = {
  name: 'PopupBodyViolations',
  components: {
    WrapperCard: script$8,
    IconArrowNarrow: script$b
  },
  emits: ['showDetails'],
  disableAxeAudit: true,
  setup() {
    const {
      results
    } = inject(vueAxe);
    return {
      results
    };
  }
};const _hoisted_1$6 = {
  class: "va-bg-main va-p-5"
};
const _hoisted_2$6 = {
  class: "va-font-medium"
};
const _hoisted_3$4 = {
  class: "va-mt-6"
};
const _hoisted_4$4 = {
  class: "va-p-item__header va-bg-primary va-flex va-justify-between va-font-medium va-p-3 va-border va-border-solid va-border-gray-300"
};
const _hoisted_5$2 = {
  class: "va-mt-2"
};
const _hoisted_6$2 = {
  class: "va-flex va-items-start"
};
const _hoisted_7$2 = ["id"];
const _hoisted_8$2 = ["aria-labelledby", "onClick"];
const _hoisted_9$2 = ["id"];
function render$7(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_IconArrowNarrow = resolveComponent("IconArrowNarrow");
  const _component_WrapperCard = resolveComponent("WrapperCard");
  return openBlock(), createElementBlock("div", _hoisted_1$6, [createElementVNode("div", _hoisted_2$6, [createElementVNode("span", null, toDisplayString($setup.results.issuesFound) + " " + toDisplayString($setup.results.issuesFound > 1 ? _ctx.$vat('issues_found', 'issues found') : _ctx.$vat('issue_found', 'issue found')), 1)]), createElementVNode("ul", _hoisted_3$4, [(openBlock(true), createElementBlock(Fragment, null, renderList($setup.results.impacts, (result, key) => {
    return openBlock(), createElementBlock("li", {
      key: key,
      class: "va-mb-4"
    }, [result.length ? (openBlock(), createElementBlock(Fragment, {
      key: 0
    }, [createElementVNode("div", _hoisted_4$4, [createElementVNode("span", {
      class: normalizeClass(`va-capitalize va-text-${key}`)
    }, toDisplayString(_ctx.$vat(key, key)), 3), createElementVNode("span", null, toDisplayString(result.length) + " " + toDisplayString(result.length > 1 ? _ctx.$vat('issues', 'issues') : _ctx.$vat('issue', 'issue')), 1)]), createElementVNode("ul", _hoisted_5$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(result, violation => {
      return openBlock(), createBlock(_component_WrapperCard, {
        key: `subitem-${violation.id}`,
        tag: "li",
        class: "va-p-subitem va-px-2 va-py-3 va-flex va-justify-between va-items-start hover:va-bg-primary",
        onTrigger: $event => _ctx.$emit('showDetails', violation)
      }, {
        default: withCtx(() => [createElementVNode("div", _hoisted_6$2, [createElementVNode("span", {
          class: normalizeClass(`va-text-${violation.impact} va-text-2xl va-font-bold va-leading-4 va-mr-2`)
        }, "•", 2), createElementVNode("span", {
          id: `violation-${violation.id}`
        }, [createTextVNode(toDisplayString(violation.help) + ". ", 1), withDirectives(createElementVNode("em", null, " (" + toDisplayString(`${violation.nodes.length}`) + " " + toDisplayString(_ctx.$vat('els', 'elements')) + ") ", 513), [[vShow, violation.nodes.length > 1]])], 8, _hoisted_7$2)]), createElementVNode("button", {
          type: "button",
          class: "va-btn va-relative va-pt-1 va-pb-2 va-px-3",
          style: {
            "top": "-2px",
            "right": "-6px"
          },
          "aria-labelledby": `see-more-${violation.id} violation-${violation.id}`,
          onClick: $event => _ctx.$emit('showDetails', violation)
        }, [createElementVNode("span", {
          id: `see-more-${violation.id}`,
          class: "va-sr-only"
        }, toDisplayString(_ctx.$vat('see_more', 'See more')), 9, _hoisted_9$2), createVNode(_component_IconArrowNarrow, {
          right: ""
        })], 8, _hoisted_8$2)]),
        _: 2
      }, 1032, ["onTrigger"]);
    }), 128))])], 64)) : createCommentVNode("", true)]);
  }), 128))])]);
}var css_248z$3 = "\n.va-p-item__header {\n  border-radius: 8px 8px 0 0 ;\n}\n.va-p-subitem:not(:last-child) {\n  border-bottom: 1px solid var(--va-border-color);\n}\n.va-p-subitem:focus-within {\n  background-color: var(--va-primary);\n}\n";
styleInject(css_248z$3);script$7.render = render$7;var script$6 = {
  name: 'PopupBody',
  disableAxeAudit: true,
  components: {
    PopupLoading: script$d,
    PopupBodyDetails: script$a,
    PopupBodyNoIssues: script$9,
    PopupBodyViolations: script$7
  },
  setup() {
    const {
      loading,
      results
    } = inject(vueAxe);
    const details = ref(null);
    function toogleDetails(violation) {
      details.value = violation;
    }
    return {
      loading,
      details,
      results,
      toogleDetails
    };
  }
};const _hoisted_1$5 = {
  class: "va-popup__body va-relative va-z-10 va-overflow-y-auto va-overflow-x-hidden"
};
const _hoisted_2$5 = {
  class: "va-sr-only",
  "aria-live": "polite"
};
function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_PopupBodyViolations = resolveComponent("PopupBodyViolations");
  const _component_PopupBodyDetails = resolveComponent("PopupBodyDetails");
  const _component_PopupBodyNoIssues = resolveComponent("PopupBodyNoIssues");
  const _component_PopupLoading = resolveComponent("PopupLoading");
  return openBlock(), createElementBlock("div", _hoisted_1$5, [$setup.results.issuesFound && !$setup.details ? (openBlock(), createBlock(_component_PopupBodyViolations, {
    key: 0,
    onShowDetails: $setup.toogleDetails
  }, null, 8, ["onShowDetails"])) : createCommentVNode("", true), $setup.details ? (openBlock(), createBlock(_component_PopupBodyDetails, {
    key: 1,
    details: $setup.details,
    onHideDetails: _cache[0] || (_cache[0] = $event => $setup.toogleDetails(null))
  }, null, 8, ["details"])) : createCommentVNode("", true), !$setup.results.issuesFound && !$setup.details ? (openBlock(), createBlock(_component_PopupBodyNoIssues, {
    key: 2
  })) : createCommentVNode("", true), withDirectives(createVNode(_component_PopupLoading, null, null, 512), [[vShow, $setup.loading]]), createElementVNode("span", _hoisted_2$5, toDisplayString($setup.details ? _ctx.$vat('announcer_details_view') : _ctx.$vat('announcer_violations_view')), 1)]);
}var css_248z$2 = "\n.va-popup__body {\n  min-height: 300px;\n  max-height: 55vh;\n}\n@media (min-height: 569px) {\n.va-popup__body {\n    max-height: 60vh;\n}\n}\n.va-popup__body::-webkit-scrollbar {\n  width: 10px;\n}\n.va-popup__body::-webkit-scrollbar-thumb {\n  background: #DFE8E8;\n  border-radius: 20px;\n}\n.va-popup__body::-webkit-scrollbar-track {\n  background: #F2F8F8;\n  border-radius: 20px;\n}\n";
styleInject(css_248z$2);script$6.render = render$6;var script$5 = {
  name: 'Highlight',
  disableAxeAudit: true,
  setup() {
    const {
      highlights
    } = useHighlight();
    const defaultStyle = {
      zIndex: '9999',
      outlineStyle: 'solid',
      outlineOffset: '-3px',
      outlineColor: 'var(--va-notification)'
    };
    return {
      highlights,
      defaultStyle
    };
  }
};function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return $setup.highlights ? (openBlock(true), createElementBlock(Fragment, {
    key: 0
  }, renderList($setup.highlights, (highlight, index) => {
    return openBlock(), createElementBlock("div", {
      key: `highlight-${index}`,
      class: "va-fixed va-overflow-visible va-pointer-events-none",
      style: normalizeStyle({
        ...$setup.defaultStyle,
        ...{
          width: `${highlight.offset.width}px`,
          height: `${highlight.offset.height}px`,
          top: `${highlight.offset.top}px`,
          bottom: `${highlight.offset.bottom}px`,
          left: `${highlight.offset.left}px`,
          right: `${highlight.offset.right}px`,
          outlineOffset: highlight.target === 'html' ? '-3px' : 'initial'
        }
      })
    }, null, 4);
  }), 128)) : createCommentVNode("", true);
}script$5.render = render$5;var script$4 = {
  name: 'PopupButton',
  props: {
    popupShow: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Number,
      default: 0
    }
  },
  emits: ['togglePopup'],
  disableAxeAudit: true,
  setup(props) {
    const ariaLabelButton = computed(() => `${props.popupShow ? 'Close' : 'Open'} vue axe popup`);
    return {
      ariaLabelButton
    };
  }
};const _hoisted_1$4 = ["aria-expanded", "aria-label"];
const _hoisted_2$4 = {
  class: "va-absolute va-leading-3 va-w-8 va-h-8 va-flex va-items-center va-justify-center va-text-base va-rounded-full va-bg-notification va-font-bold va-text-color",
  "aria-live": "assertive",
  "aria-atomic": "true"
};
const _hoisted_3$3 = {
  class: "va-sr-only"
};
const _hoisted_4$3 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34",
  "aria-hidden": "true"
};
const _hoisted_5$1 = /*#__PURE__*/createElementVNode("path", {
  d: "M17 0a17 17 0 1017 17A17 17 0 0017 0zm-.3 3.4a2.2 2.2 0 11-2.2 2.2 2.2 2.2 0 012.2-2.2zm9.6 7l-6.6.9v6.5L23 28.4A1.2 1.2 0 0122 30a1.2 1.2 0 01-1.5-.8l-3.2-9.7h-1l-3 9.9a1.2 1.2 0 01-1.6.6 1.3 1.3 0 01-.8-1.6L13.6 18v-6.7l-6-.8a1 1 0 01-1-1.2 1.1 1.1 0 011.3-1l7.3.6h3.2l7.8-.7a1.1 1.1 0 010 2.3z",
  fill: "#414141"
}, null, -1);
const _hoisted_6$1 = [_hoisted_5$1];
const _hoisted_7$1 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "26.2",
  height: "26.2",
  "aria-hidden": "true"
};
const _hoisted_8$1 = /*#__PURE__*/createElementVNode("path", {
  d: "M24.1 2.1l-22 22m0-22l22 22",
  fill: "none",
  stroke: "#000",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "3"
}, null, -1);
const _hoisted_9$1 = [_hoisted_8$1];
function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("button", {
    class: "va-btn va-popup-btn va-w-16 va-h-16 va-relative va-outline-none va-bg-main va-text-color va-border-0 va-rounded-full va-inline-block va-pt-1",
    "aria-haspopup": "true",
    "aria-controls": "va-popup-box",
    "aria-expanded": $props.popupShow.toString(),
    "aria-label": $setup.ariaLabelButton,
    onClick: _cache[0] || (_cache[0] = $event => _ctx.$emit('togglePopup'))
  }, [withDirectives(createElementVNode("span", _hoisted_2$4, [createTextVNode(toDisplayString($props.notifications) + " ", 1), createElementVNode("span", _hoisted_3$3, toDisplayString(Number($props.notifications) > 1 ? _ctx.$vat('btn_label_plu') : _ctx.$vat('btn_label')), 1)], 512), [[vShow, $props.notifications && !$props.popupShow]]), withDirectives((openBlock(), createElementBlock("svg", _hoisted_4$3, _hoisted_6$1, 512)), [[vShow, !$props.popupShow]]), withDirectives((openBlock(), createElementBlock("svg", _hoisted_7$1, _hoisted_9$1, 512)), [[vShow, $props.popupShow]])], 8, _hoisted_1$4);
}var css_248z$1 = "\n.va-popup-btn {\n  box-shadow: 2px 2px 3px 2px #dfdfdf;\n  transition: box-shadow .1s;\n}\n.va-popup-btn:focus, .va-popup-btn:hover {\n    box-shadow: 0 0 0 3px var(--va-outline-color);\n}\n.va-popup-btn > span {\n    left: -10px;\n    top: -10px;\n}\n";
styleInject(css_248z$1);script$4.render = render$4;var script$3 = {
  name: 'PopupHeader',
  disableAxeAudit: true,
  setup() {
    const {
      version,
      results
    } = inject(vueAxe);
    const versions = ref({
      vueAxe: version,
      axeCore: null
    });
    watch(results, val => {
      versions.value.axeCore = val.testEngine.version;
    }, {
      deep: true
    });
    return {
      versions
    };
  }
};const _hoisted_1$3 = {
  class: "va-border-0 va-flex va-items-center va-justify-between va-py-3 va-px-4 va-border-b va-border-solid va-border-gray-200 va-bg-main va-text-color"
};
const _hoisted_2$3 = {
  href: "https://github.com/vue-a11y/vue-axe",
  target: "_blank",
  rel: "noopener"
};
const _hoisted_3$2 = {
  focusable: "false",
  role: "img",
  "aria-labelledby": "va-logo-title",
  xmlns: "http://www.w3.org/2000/svg",
  width: "46",
  height: "45.3"
};
const _hoisted_4$2 = {
  id: "va-logo-title"
};
const _hoisted_5 = /*#__PURE__*/createElementVNode("path", {
  d: "M34.4 42h-32L0 38.3 22.6 0l17.2 29.3H33L22.5 13V1.3v14.5L7.8 36.4h26.6a6.1 6.1 0 015.5-3.4 6.1 6.1 0 016.1 6.1 6.1 6.1 0 01-6.1 6.2 6.1 6.1 0 01-5.5-3.4zm2.4-2.9a3 3 0 003 3.1 3 3 0 003.1-3 3 3 0 00-3-3.1 3 3 0 00-3.1 3z",
  fill: "#3ab982"
}, null, -1);
const _hoisted_6 = /*#__PURE__*/createElementVNode("path", {
  d: "M4.4 35.7L22.5 5 34 24h-6.4l-5-8.3v-5.4 5.4L10.8 35.7z",
  fill: "#34495f"
}, null, -1);
const _hoisted_7 = /*#__PURE__*/createElementVNode("g", {
  fill: "#34495f",
  stroke: "#34495f",
  "stroke-width": "1.2"
}, [/*#__PURE__*/createElementVNode("path", {
  d: "M21.4 33.6v-1h0a1.7 1.7 0 01-.4.4 2.3 2.3 0 01-.5.4 2.6 2.6 0 01-.6.2 2.7 2.7 0 01-.6 0 2.8 2.8 0 01-1.2-.1 2.6 2.6 0 01-.8-.7 2.9 2.9 0 01-.6-1 3.4 3.4 0 01-.2-1.1 3.3 3.3 0 01.2-1.2 2.9 2.9 0 01.5-1 2.7 2.7 0 011-.6 2.8 2.8 0 011-.2 2.7 2.7 0 01.7 0 2.6 2.6 0 01.6.3 2.4 2.4 0 01.5.3 2 2 0 01.4.5h0v-1h.9v5.8zm0-3a2.4 2.4 0 00-.1-.8 2.1 2.1 0 00-.4-.7 2 2 0 00-.7-.5 2 2 0 00-.9-.2 2 2 0 00-.8.2 2 2 0 00-.7.5 2 2 0 00-.4.7 2.7 2.7 0 00-.1.9 2.5 2.5 0 00.1.8 2.3 2.3 0 00.5.8 2 2 0 00.6.5 2 2 0 00.9.2 2 2 0 00.9-.2 2 2 0 00.6-.5 2.3 2.3 0 00.4-.8 3 3 0 00.1-.9zM28.5 33.6l-1.7-2.4h0L25 33.6h-1l2.2-3-2-2.8h1l1.5 2.2h0l1.5-2.2h1l-2 2.8 2.2 3z"
})], -1);
const _hoisted_8 = {
  class: "va-text-right va-text-sm va-font-medium"
};
const _hoisted_9 = /*#__PURE__*/createElementVNode("br", null, null, -1);
function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$3, [createElementVNode("a", _hoisted_2$3, [(openBlock(), createElementBlock("svg", _hoisted_3$2, [createElementVNode("title", _hoisted_4$2, "Vue aXe (" + toDisplayString(_ctx.$vat('open_new_tab')) + ")", 1), _hoisted_5, _hoisted_6, _hoisted_7]))]), createElementVNode("div", _hoisted_8, [createElementVNode("span", null, "v" + toDisplayString($setup.versions.vueAxe) + " (vue-axe)", 1), createTextVNode(), _hoisted_9, createElementVNode("span", null, "v" + toDisplayString($setup.versions.axeCore) + " (axe-core) ", 1)])]);
}script$3.render = render$3;var script$2 = {
  name: 'PopupFooter',
  disableAxeAudit: true,
  setup() {
    const {
      run,
      loading
    } = inject(vueAxe);
    return {
      run,
      loading
    };
  }
};const _hoisted_1$2 = {
  class: "va-flex va-items-center va-justify-between va-border-0 va-border-t va-border-solid va-border-gray-200 va-bg-main va-text-color"
};
const _hoisted_2$2 = /*#__PURE__*/createElementVNode("path", {
  d: "M.9 0a.9.9 0 01.9.9v1.9A6.2 6.2 0 0112 5a.9.9 0 11-1.7.6 4.4 4.4 0 00-7.7-1.2h2.6a.9.9 0 110 1.8H1a.9.9 0 01-.9-.9V1A.9.9 0 01.9 0zm0 8a.9.9 0 011.1.6 4.4 4.4 0 007.8 1.2H7a.9.9 0 010-1.8h4.4a.9.9 0 011 .9v4.4a.9.9 0 11-1.8 0v-1.8A6.2 6.2 0 01.4 9.2.9.9 0 01.9 8z",
  fill: "currentColor"
}, null, -1);
const _hoisted_3$1 = [_hoisted_2$2];
const _hoisted_4$1 = {
  id: "va-btn-run-label",
  class: "va-text-base va-font-medium va-ml-2"
};
function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$2, [createElementVNode("button", {
    class: "va-btn va-flex va-items-center va-py-4 va-px-5 va-border-0 va-border-r va-border-solid va-border-gray-200 hover:va-bg-primary",
    type: "button",
    "aria-labelledby": "va-btn-run-label",
    onClick: _cache[0] || (_cache[0] = $event => $setup.run({
      force: true
    }))
  }, [(openBlock(), createElementBlock("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "12.4",
    height: "14.2",
    focusable: "false",
    "aria-hidden": "true",
    class: normalizeClass({
      'va-animate-spin': $setup.loading
    })
  }, _hoisted_3$1, 2)), createElementVNode("span", _hoisted_4$1, toDisplayString($setup.loading ? _ctx.$vat('running', 'Running') : _ctx.$vat('run_again', 'Run again')), 1)])]);
}script$2.render = render$2;const focusableElementsSelector = [...['input', 'select', 'button', 'textarea'].map(field => `${field}:not([disabled])`), 'a[href]', 'video[controls]', 'audio[controls]', '[tabindex]:not([tabindex^="-"])', '[contenteditable]:not([contenteditable="false"])'].join(',');
var script$1 = {
  name: 'FocusLoop',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  disableAxeAudit: true,
  setup(props) {
    const focusLoopRef = ref(null);
    const alreadyFocused = ref(false);
    const getTabindex = computed(() => props.disabled ? -1 : 0);
    watch(() => props.isVisible, focusFirst);
    onMounted(() => focusFirst(props.isVisible || true));
    function focusFirst(visible) {
      if (visible) {
        const elements = getFocusableElements();
        if (elements.length) setTimeout(() => elements[0].focus(), 200);
      }
    }
    function getFocusableElements() {
      const focusableElements = focusLoopRef.value.querySelectorAll(focusableElementsSelector);
      if (focusableElements && focusableElements.length) return focusableElements;
      return [];
    }
    function handleFocusStart() {
      const elements = getFocusableElements();
      if (elements.length) {
        const index = alreadyFocused.value ? elements.length - 1 : 0;
        alreadyFocused.value = true;
        elements[index].focus();
      }
    }
    function handleFocusEnd() {
      const elements = getFocusableElements();
      elements.length && elements[0].focus();
    }
    return {
      focusLoopRef,
      getTabindex,
      handleFocusEnd,
      handleFocusStart
    };
  }
};const _hoisted_1$1 = {
  class: "vue-focus-loop"
};
const _hoisted_2$1 = ["tabindex"];
const _hoisted_3 = {
  ref: "focusLoopRef"
};
const _hoisted_4 = ["tabindex"];
function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$1, [createElementVNode("div", {
    tabindex: $setup.getTabindex,
    onFocus: _cache[0] || (_cache[0] = (...args) => $setup.handleFocusStart && $setup.handleFocusStart(...args))
  }, null, 40, _hoisted_2$1), createElementVNode("div", _hoisted_3, [renderSlot(_ctx.$slots, "default")], 512), createElementVNode("div", {
    tabindex: $setup.getTabindex,
    onFocus: _cache[1] || (_cache[1] = (...args) => $setup.handleFocusEnd && $setup.handleFocusEnd(...args))
  }, null, 40, _hoisted_4)]);
}script$1.render = render$1;var script = {
  name: 'Popup',
  disableAxeAudit: true,
  components: {
    FocusLoop: script$1,
    Highlight: script$5,
    PopupBody: script$6,
    PopupHeader: script$3,
    PopupFooter: script$2,
    PopupButton: script$4
  },
  props: {
    dir: {
      type: String,
      default: 'ltr'
    }
  },
  setup() {
    const {
      results
    } = inject(vueAxe);
    const {
      isOpen,
      onClose,
      toggle: togglePopup
    } = useDisclosure();
    const issuesFound = computed(() => {
      if (!results.value.issuesFound) return 0;
      return results.value.issuesFound;
    });
    useEventListener('keydown', e => e.key === 'Escape' && isOpen.value && onClose());
    return {
      isOpen,
      togglePopup,
      issuesFound
    };
  }
};const _hoisted_1 = ["dir"];
const _hoisted_2 = {
  id: "va-popup-box",
  class: "va-popup__box va-w-full va-rounded-lg va-mb-4 va-shadow-lg va-bg-main va-border va-border-solid va-border-gray-200 va-overflow-hidden"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_PopupHeader = resolveComponent("PopupHeader");
  const _component_PopupBody = resolveComponent("PopupBody");
  const _component_PopupFooter = resolveComponent("PopupFooter");
  const _component_PopupButton = resolveComponent("PopupButton");
  const _component_FocusLoop = resolveComponent("FocusLoop");
  const _component_Highlight = resolveComponent("Highlight");
  return openBlock(), createElementBlock(Fragment, null, [createVNode(_component_FocusLoop, null, {
    default: withCtx(() => [createElementVNode("div", {
      class: "va-popup va-fixed va-flex va-flex-wrap va-justify-end va-antialiased va-text-color",
      style: {
        "z-index": "10000"
      },
      role: "region",
      dir: $props.dir
    }, [createVNode(Transition, {
      name: "scale"
    }, {
      default: withCtx(() => [withDirectives(createElementVNode("div", _hoisted_2, [createVNode(_component_PopupHeader), createVNode(_component_PopupBody), createVNode(_component_PopupFooter)], 512), [[vShow, $setup.isOpen]])]),
      _: 1
    }), createVNode(_component_PopupButton, {
      "popup-show": $setup.isOpen,
      notifications: $setup.issuesFound,
      onTogglePopup: $setup.togglePopup
    }, null, 8, ["popup-show", "notifications", "onTogglePopup"])], 8, _hoisted_1)]),
    _: 1
  }), createVNode(_component_Highlight)], 64);
}var css_248z = ":root {\n  --va-bg: white;\n  --va-padding: 16px;\n  --va-color:  #222;\n  --va-primary: #fbfcfc;\n  --va-border-color: #dfe8e8;\n  --va-outline-color: var(--va-color);\n  --va-critical: #D93251;\n  --va-serious:#DB006E;\n  --va-moderate: #996B00;\n  --va-minor: #000;\n  --va-notification: #FF885B;\n  --va-font-family: 'Segoe UI', Roboto, 'Fira Sans', Helvetica, 'Helvetica Neue', sans-serif;\n}\n\n.va-popup * {\n  box-sizing: border-box;\n  padding: 0;\n  margin: 0;\n}\n\n.va-btn {\n  background: none;\n  border: none;\n  appearance: none;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  cursor: pointer;\n  font-family: inherit;\n}\n\n.va-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.va-pointer-events-none {\n  pointer-events: none;\n}\n\n.va-fixed {\n  position: fixed;\n}\n\n.va-absolute {\n  position: absolute;\n}\n\n.va-relative {\n  position: relative;\n}\n\n.va-sticky {\n  position: sticky;\n}\n\n.va-bottom-0 {\n  bottom: 0px;\n}\n\n.va-left-0 {\n  left: 0px;\n}\n\n.va-right-0 {\n  right: 0px;\n}\n\n.va-top-0 {\n  top: 0px;\n}\n\n.va-z-10 {\n  z-index: 10;\n}\n\n.va-z-20 {\n  z-index: 20;\n}\n\n.va-mx-1 {\n  margin-left: 0.25rem;\n  margin-right: 0.25rem;\n}\n\n.va-my-3 {\n  margin-top: 0.75rem;\n  margin-bottom: 0.75rem;\n}\n\n.va-my-4 {\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n}\n\n.va--mt-5 {\n  margin-top: -1.25rem;\n}\n\n.va-mb-4 {\n  margin-bottom: 1rem;\n}\n\n.va-mb-8 {\n  margin-bottom: 2rem;\n}\n\n.va-ml-1 {\n  margin-left: 0.25rem;\n}\n\n.va-ml-2 {\n  margin-left: 0.5rem;\n}\n\n.va-mr-2 {\n  margin-right: 0.5rem;\n}\n\n.va-mt-1 {\n  margin-top: 0.25rem;\n}\n\n.va-mt-2 {\n  margin-top: 0.5rem;\n}\n\n.va-mt-3 {\n  margin-top: 0.75rem;\n}\n\n.va-mt-4 {\n  margin-top: 1rem;\n}\n\n.va-mt-6 {\n  margin-top: 1.5rem;\n}\n\n.va-inline-block {\n  display: inline-block;\n}\n\n.va-flex {\n  display: flex;\n}\n\n.va-inline-flex {\n  display: inline-flex;\n}\n\n.va-h-16 {\n  height: 4rem;\n}\n\n.va-h-4 {\n  height: 1rem;\n}\n\n.va-h-8 {\n  height: 2rem;\n}\n\n.va-w-16 {\n  width: 4rem;\n}\n\n.va-w-3 {\n  width: 0.75rem;\n}\n\n.va-w-4 {\n  width: 1rem;\n}\n\n.va-w-8 {\n  width: 2rem;\n}\n\n.va-w-full {\n  width: 100%;\n}\n\n@keyframes va-spin {\n\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.va-animate-spin {\n  animation: va-spin 1s linear infinite;\n}\n\n.va-cursor-pointer {\n  cursor: pointer;\n}\n\n.va-flex-wrap {\n  flex-wrap: wrap;\n}\n\n.va-items-start {\n  align-items: flex-start;\n}\n\n.va-items-center {\n  align-items: center;\n}\n\n.va-justify-end {\n  justify-content: flex-end;\n}\n\n.va-justify-center {\n  justify-content: center;\n}\n\n.va-justify-between {\n  justify-content: space-between;\n}\n\n.va-overflow-hidden {\n  overflow: hidden;\n}\n\n.va-overflow-visible {\n  overflow: visible;\n}\n\n.va-overflow-y-auto {\n  overflow-y: auto;\n}\n\n.va-overflow-x-hidden {\n  overflow-x: hidden;\n}\n\n.va-whitespace-pre-wrap {\n  white-space: pre-wrap;\n}\n\n.va-rounded-full {\n  border-radius: 9999px;\n}\n\n.va-rounded-lg {\n  border-radius: 0.5rem;\n}\n\n.va-rounded-md {\n  border-radius: 0.375rem;\n}\n\n.va-border {\n  border-width: 1px;\n}\n\n.va-border-0 {\n  border-width: 0px;\n}\n\n.va-border-b {\n  border-bottom-width: 1px;\n}\n\n.va-border-r {\n  border-right-width: 1px;\n}\n\n.va-border-t {\n  border-top-width: 1px;\n}\n\n.va-border-solid {\n  border-style: solid;\n}\n\n.va-border-gray-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(229 231 235 / var(--tw-border-opacity));\n}\n\n.va-border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity));\n}\n\n.va-bg-gray-900 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(17 24 39 / var(--tw-bg-opacity));\n}\n\n.va-bg-main {\n  background-color: var(--va-bg);\n}\n\n.va-bg-notification {\n  background-color: var(--va-notification);\n}\n\n.va-bg-primary {\n  background-color: var(--va-primary);\n}\n\n.va-bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n\n.va-bg-opacity-75 {\n  --tw-bg-opacity: 0.75;\n}\n\n.va-p-3 {\n  padding: 0.75rem;\n}\n\n.va-p-4 {\n  padding: 1rem;\n}\n\n.va-p-5 {\n  padding: 1.25rem;\n}\n\n.va-px-1 {\n  padding-left: 0.25rem;\n  padding-right: 0.25rem;\n}\n\n.va-px-2 {\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n}\n\n.va-px-3 {\n  padding-left: 0.75rem;\n  padding-right: 0.75rem;\n}\n\n.va-px-4 {\n  padding-left: 1rem;\n  padding-right: 1rem;\n}\n\n.va-px-5 {\n  padding-left: 1.25rem;\n  padding-right: 1.25rem;\n}\n\n.va-py-2 {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n}\n\n.va-py-3 {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n}\n\n.va-py-4 {\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n\n.va-pb-2 {\n  padding-bottom: 0.5rem;\n}\n\n.va-pt-1 {\n  padding-top: 0.25rem;\n}\n\n.va-pt-2 {\n  padding-top: 0.5rem;\n}\n\n.va-pt-4 {\n  padding-top: 1rem;\n}\n\n.va-text-center {\n  text-align: center;\n}\n\n.va-text-right {\n  text-align: right;\n}\n\n.va-text-2xl {\n  font-size: 1.5rem;\n  line-height: 2rem;\n}\n\n.va-text-base {\n  font-size: 1rem;\n  line-height: 1.5rem;\n}\n\n.va-text-sm {\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n}\n\n.va-text-xl {\n  font-size: 1.25rem;\n  line-height: 1.75rem;\n}\n\n.va-font-bold {\n  font-weight: 700;\n}\n\n.va-font-medium {\n  font-weight: 500;\n}\n\n.va-uppercase {\n  text-transform: uppercase;\n}\n\n.va-capitalize {\n  text-transform: capitalize;\n}\n\n.va-leading-3 {\n  line-height: .75rem;\n}\n\n.va-leading-4 {\n  line-height: 1rem;\n}\n\n.va-text-blue-700 {\n  --tw-text-opacity: 1;\n  color: rgb(29 78 216 / var(--tw-text-opacity));\n}\n\n.va-text-color {\n  color: var(--va-color);\n}\n\n.va-text-gray-100 {\n  --tw-text-opacity: 1;\n  color: rgb(243 244 246 / var(--tw-text-opacity));\n}\n\n.va-text-green-800 {\n  --tw-text-opacity: 1;\n  color: rgb(22 101 52 / var(--tw-text-opacity));\n}\n\n.va-no-underline {\n  text-decoration-line: none;\n}\n\n.va-antialiased {\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n.va-shadow-lg {\n  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.va-outline-none {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n\n.va-popup {\n  font-family: var(--va-font-family);\n  z-index: 999;\n  right: 20px;\n  bottom: 20px;\n  max-width: 420px;\n  margin-left: 20px;\n}\n\n.va-popup__box {\n    min-width: 280px;\n    transition: transform .3s ease-in-out, opacity .2s, visibility .2s;\n    transform-origin: bottom right;\n    transform: scale3d(1,1,1);\n}\n\n.va-popup[dir=\"ltr\"] {\n  text-align: left;\n}\n\n.va-popup[dir=\"rtl\"] {\n  right: auto;\n}\n\n.va-popup[dir=\"rtl\"] {\n  display: flex;\n}\n\n.va-popup[dir=\"rtl\"] {\n  flex-wrap: wrap;\n}\n\n.va-popup[dir=\"rtl\"] {\n  justify-content: flex-end;\n}\n\n.va-popup[dir=\"rtl\"] {\n    left: 20px;\n}\n\n.va-popup[dir=\"rtl\"] .va-popup-box {\n  transform-origin: bottom left;\n}\n\n.va-popup__box.scale-enter-from, .va-popup__box.scale-leave-active {\n    transform: scale3d(0,0,0);\n}\n\n.va-popup__box ul {\n    list-style-type: none;\n}\n\n@media (min-width: 420px) {\n\n.va-popup__box {\n    width: 420px\n}\n}\n\n@media screen and (prefers-reduced-motion: reduce), (update: slow) {\n.va-popup * {\n    animation-duration: 0.001ms !important;\n    animation-iteration-count: 1 !important; /* Hat tip Nick/cssremedy (https://css-tricks.com/revisiting-prefers-reduced-motion-the-reduced-motion-media-query/#comment-1700170) */\n    transition-duration: 0.001ms !important;\n}\n}\n\n.hover\\:va-bg-primary:hover {\n  background-color: var(--va-primary);\n}\n\n.hover\\:va-underline:hover {\n  text-decoration-line: underline;\n}\n";
styleInject(css_248z);script.render = render;function install(app, options = {}) {
  if (typeof window === 'undefined') return;
  const {
    registerPlugin
  } = useVueAxe(options);
  registerPlugin(app);
}export{script as VueAxePopup,install as default};

'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.save = exports.viewport = exports.resolution = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * Fetch ten most popular resolutions
 *
 * @param {String} url
 * @param {Object} options
 * @api private
 */

var resolution = exports.resolution = function () {
	var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(url, options) {
		var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item;

		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						_iteratorNormalCompletion = true;
						_didIteratorError = false;
						_iteratorError = undefined;
						_context.prev = 3;
						_context.next = 6;
						return getResMem();

					case 6:
						_context.t0 = _context.sent;
						_iterator = (0, _getIterator3.default)(_context.t0);

					case 8:
						if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
							_context.next = 15;
							break;
						}

						item = _step.value;

						this.sizes.push(item.item);
						this.items.push(this.create(url, item.item, options));

					case 12:
						_iteratorNormalCompletion = true;
						_context.next = 8;
						break;

					case 15:
						_context.next = 21;
						break;

					case 17:
						_context.prev = 17;
						_context.t1 = _context['catch'](3);
						_didIteratorError = true;
						_iteratorError = _context.t1;

					case 21:
						_context.prev = 21;
						_context.prev = 22;

						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}

					case 24:
						_context.prev = 24;

						if (!_didIteratorError) {
							_context.next = 27;
							break;
						}

						throw _iteratorError;

					case 27:
						return _context.finish(24);

					case 28:
						return _context.finish(21);

					case 29:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this, [[3, 17, 21, 29], [22,, 24, 28]]);
	}));
	return function resolution(_x, _x2) {
		return ref.apply(this, arguments);
	};
}();

/**
 * Fetch keywords
 *
 * @param {Object} obj
 * @param {Object} options
 */

var viewport = exports.viewport = function () {
	var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(obj, options) {
		var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, item, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, size;

		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						_iteratorNormalCompletion2 = true;
						_didIteratorError2 = false;
						_iteratorError2 = undefined;
						_context2.prev = 3;
						_context2.next = 6;
						return viewportListMem(obj.keywords);

					case 6:
						_context2.t0 = _context2.sent;
						_iterator2 = (0, _getIterator3.default)(_context2.t0);

					case 8:
						if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
							_context2.next = 15;
							break;
						}

						item = _step2.value;

						this.sizes.push(item.size);
						obj.sizes.push(item.size);

					case 12:
						_iteratorNormalCompletion2 = true;
						_context2.next = 8;
						break;

					case 15:
						_context2.next = 21;
						break;

					case 17:
						_context2.prev = 17;
						_context2.t1 = _context2['catch'](3);
						_didIteratorError2 = true;
						_iteratorError2 = _context2.t1;

					case 21:
						_context2.prev = 21;
						_context2.prev = 22;

						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}

					case 24:
						_context2.prev = 24;

						if (!_didIteratorError2) {
							_context2.next = 27;
							break;
						}

						throw _iteratorError2;

					case 27:
						return _context2.finish(24);

					case 28:
						return _context2.finish(21);

					case 29:
						_iteratorNormalCompletion3 = true;
						_didIteratorError3 = false;
						_iteratorError3 = undefined;
						_context2.prev = 32;


						for (_iterator3 = (0, _getIterator3.default)((0, _arrayUniq2.default)(obj.sizes)); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							size = _step3.value;

							this.items.push(this.create(obj.url, size, options));
						}
						_context2.next = 40;
						break;

					case 36:
						_context2.prev = 36;
						_context2.t2 = _context2['catch'](32);
						_didIteratorError3 = true;
						_iteratorError3 = _context2.t2;

					case 40:
						_context2.prev = 40;
						_context2.prev = 41;

						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}

					case 43:
						_context2.prev = 43;

						if (!_didIteratorError3) {
							_context2.next = 46;
							break;
						}

						throw _iteratorError3;

					case 46:
						return _context2.finish(43);

					case 47:
						return _context2.finish(40);

					case 48:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, this, [[3, 17, 21, 29], [22,, 24, 28], [32, 36, 40, 48], [41,, 43, 47]]);
	}));
	return function viewport(_x3, _x4) {
		return ref.apply(this, arguments);
	};
}();

/**
 * Save an array of streams to files
 *
 * @param {Array} streams
 * @api private
 */

var save = exports.save = function () {
	var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(streams) {
		var _this = this;

		var end = function () {
			var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
				return _regenerator2.default.wrap(function _callee3$(_context3) {
					while (1) {
						switch (_context3.prev = _context3.next) {
							case 0:
								_context3.next = 2;
								return _promise2.default.all(files.map(function (file) {
									return (0, _pify2.default)(_rimraf2.default)(file);
								}));

							case 2:
								return _context3.abrupt('return', _context3.sent);

							case 3:
							case 'end':
								return _context3.stop();
						}
					}
				}, _callee3, this);
			}));
			return function end() {
				return ref.apply(this, arguments);
			};
		}();

		var files;
		return _regenerator2.default.wrap(function _callee6$(_context6) {
			while (1) {
				switch (_context6.prev = _context6.next) {
					case 0:
						files = [];


						if (!listener) {
							listener = process.on('SIGINT', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
								return _regenerator2.default.wrap(function _callee4$(_context4) {
									while (1) {
										switch (_context4.prev = _context4.next) {
											case 0:
												_context4.t0 = process;
												_context4.next = 3;
												return end();

											case 3:
												_context4.t1 = _context4.sent;

												_context4.t0.exit.call(_context4.t0, _context4.t1);

											case 5:
											case 'end':
												return _context4.stop();
										}
									}
								}, _callee4, _this);
							})));
						}

						_context6.next = 4;
						return _promise2.default.all(streams.map(function (stream) {
							return new _promise2.default(function () {
								var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(resolve, reject) {
									var dest, write;
									return _regenerator2.default.wrap(function _callee5$(_context5) {
										while (1) {
											switch (_context5.prev = _context5.next) {
												case 0:
													_context5.next = 2;
													return (0, _pify2.default)(_mkdirp2.default)(_this.dest());

												case 2:
													dest = _path2.default.join(_this.dest(), stream.filename);
													write = (0, _fsWriteStreamAtomic2.default)(dest);


													files.push(write.__atomicTmp);

													stream.on('warn', _this.emit.bind(_this, 'warn'));
													stream.on('error', function (err) {
														return end().then(reject(err));
													});

													write.on('finish', resolve);
													write.on('error', function (err) {
														return end().then(reject(err));
													});

													stream.pipe(write);

												case 10:
												case 'end':
													return _context5.stop();
											}
										}
									}, _callee5, _this);
								}));
								return function (_x6, _x7) {
									return ref.apply(this, arguments);
								};
							}());
						}));

					case 4:
						return _context6.abrupt('return', _context6.sent);

					case 5:
					case 'end':
						return _context6.stop();
				}
			}
		}, _callee6, this);
	}));
	return function save(_x5) {
		return ref.apply(this, arguments);
	};
}();

/**
 * Create a pageres stream
 *
 * @param {String} uri
 * @param {String} size
 * @param {Object} options
 * @api private
 */

exports.create = create;
exports.successMessage = successMessage;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _easydate = require('easydate');

var _easydate2 = _interopRequireDefault(_easydate);

var _fsWriteStreamAtomic = require('fs-write-stream-atomic');

var _fsWriteStreamAtomic2 = _interopRequireDefault(_fsWriteStreamAtomic);

var _getRes = require('get-res');

var _getRes2 = _interopRequireDefault(_getRes);

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

var _mem = require('mem');

var _mem2 = _interopRequireDefault(_mem);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _screenshotStream = require('screenshot-stream');

var _screenshotStream2 = _interopRequireDefault(_screenshotStream);

var _viewportList = require('viewport-list');

var _viewportList2 = _interopRequireDefault(_viewportList);

var _protocolify = require('protocolify');

var _protocolify2 = _interopRequireDefault(_protocolify);

var _arrayUniq = require('array-uniq');

var _arrayUniq2 = _interopRequireDefault(_arrayUniq);

var _filenamifyUrl = require('filenamify-url');

var _filenamifyUrl2 = _interopRequireDefault(_filenamifyUrl);

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _plur = require('plur');

var _plur2 = _interopRequireDefault(_plur);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getResMem = (0, _mem2.default)(_getRes2.default);
var viewportListMem = (0, _mem2.default)(_viewportList2.default);

var listener = void 0;function create(uri, size, options) {
	var sizes = size.split('x');
	var stream = (0, _screenshotStream2.default)((0, _protocolify2.default)(uri), size, options);
	var filename = (0, _lodash2.default)(options.filename + '.' + options.format);

	if (_path2.default.isAbsolute(uri)) {
		uri = _path2.default.basename(uri);
	}

	stream.filename = filename({
		crop: options.crop ? '-cropped' : '',
		date: (0, _easydate2.default)('Y-M-d'),
		time: (0, _easydate2.default)('h-m-s'),
		size: size,
		width: sizes[0],
		height: sizes[1],
		url: (0, _filenamifyUrl2.default)(uri)
	});

	return stream;
}

/**
 * Success message
 *
 * @api private
 */

function successMessage() {
	var stats = this.stats;
	var screenshots = stats.screenshots;
	var sizes = stats.sizes;
	var urls = stats.urls;

	var words = {
		screenshots: (0, _plur2.default)('screenshot', screenshots),
		sizes: (0, _plur2.default)('size', sizes),
		urls: (0, _plur2.default)('url', urls)
	};

	console.log('\n' + _logSymbols2.default.success + ' Generated ' + screenshots + ' ' + words.screenshots + ' from ' + urls + ' ' + words.urls + ' and ' + sizes + ' ' + words.sizes);
}
//# sourceMappingURL=data:application/json;base64,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WTtBQUFBLEtBRUwsSUFGSyxHQUVHLEtBRkgsQ0FFTCxJQUZLOztBQUdoQyxLQUFNLFFBQVE7QUFDYixlQUFhLG9CQUFLLFlBQUwsRUFBbUIsV0FBbkIsQ0FEQTtBQUViLFNBQU8sb0JBQUssTUFBTCxFQUFhLEtBQWIsQ0FGTTtBQUdiLFFBQU0sb0JBQUssS0FBTCxFQUFZLElBQVo7QUFITyxFQUFkOztBQU1BLFNBQVEsR0FBUixRQUFpQixxQkFBVyxPQUE1QixtQkFBaUQsV0FBakQsU0FBZ0UsTUFBTSxXQUF0RSxjQUEwRixJQUExRixTQUFrRyxNQUFNLElBQXhHLGFBQW9ILEtBQXBILFNBQTZILE1BQU0sS0FBbkk7QUFDQSIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZWFzeWRhdGUgZnJvbSAnZWFzeWRhdGUnO1xuaW1wb3J0IGZzV3JpdGVTdHJlYW1BdG9taWMgZnJvbSAnZnMtd3JpdGUtc3RyZWFtLWF0b21pYyc7XG5pbXBvcnQgZ2V0UmVzIGZyb20gJ2dldC1yZXMnO1xuaW1wb3J0IGxvZ1N5bWJvbHMgZnJvbSAnbG9nLXN5bWJvbHMnO1xuaW1wb3J0IG1lbSBmcm9tICdtZW0nO1xuaW1wb3J0IG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0IHJpbXJhZiBmcm9tICdyaW1yYWYnO1xuaW1wb3J0IHNjcmVlbnNob3RTdHJlYW0gZnJvbSAnc2NyZWVuc2hvdC1zdHJlYW0nO1xuaW1wb3J0IHZpZXdwb3J0TGlzdCBmcm9tICd2aWV3cG9ydC1saXN0JztcbmltcG9ydCBwcm90b2NvbGlmeSBmcm9tICdwcm90b2NvbGlmeSc7XG5pbXBvcnQgYXJyYXlVbmlxIGZyb20gJ2FycmF5LXVuaXEnO1xuaW1wb3J0IGZpbGVuYW1pZnlVcmwgZnJvbSAnZmlsZW5hbWlmeS11cmwnO1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ2xvZGFzaC50ZW1wbGF0ZSc7XG5pbXBvcnQgcGlmeSBmcm9tICdwaWZ5JztcbmltcG9ydCBwbHVyIGZyb20gJ3BsdXInO1xuXG5jb25zdCBnZXRSZXNNZW0gPSBtZW0oZ2V0UmVzKTtcbmNvbnN0IHZpZXdwb3J0TGlzdE1lbSA9IG1lbSh2aWV3cG9ydExpc3QpO1xuXG5sZXQgbGlzdGVuZXI7XG5cbi8qKlxuICogRmV0Y2ggdGVuIG1vc3QgcG9wdWxhciByZXNvbHV0aW9uc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x1dGlvbih1cmwsIG9wdGlvbnMpIHtcblx0Zm9yIChjb25zdCBpdGVtIG9mIGF3YWl0IGdldFJlc01lbSgpKSB7XG5cdFx0dGhpcy5zaXplcy5wdXNoKGl0ZW0uaXRlbSk7XG5cdFx0dGhpcy5pdGVtcy5wdXNoKHRoaXMuY3JlYXRlKHVybCwgaXRlbS5pdGVtLCBvcHRpb25zKSk7XG5cdH1cbn1cblxuLyoqXG4gKiBGZXRjaCBrZXl3b3Jkc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZpZXdwb3J0KG9iaiwgb3B0aW9ucykge1xuXHRmb3IgKGNvbnN0IGl0ZW0gb2YgYXdhaXQgdmlld3BvcnRMaXN0TWVtKG9iai5rZXl3b3JkcykpIHtcblx0XHR0aGlzLnNpemVzLnB1c2goaXRlbS5zaXplKTtcblx0XHRvYmouc2l6ZXMucHVzaChpdGVtLnNpemUpO1xuXHR9XG5cblx0Zm9yIChjb25zdCBzaXplIG9mIGFycmF5VW5pcShvYmouc2l6ZXMpKSB7XG5cdFx0dGhpcy5pdGVtcy5wdXNoKHRoaXMuY3JlYXRlKG9iai51cmwsIHNpemUsIG9wdGlvbnMpKTtcblx0fVxufVxuXG4vKipcbiAqIFNhdmUgYW4gYXJyYXkgb2Ygc3RyZWFtcyB0byBmaWxlc1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHN0cmVhbXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlKHN0cmVhbXMpIHtcblx0Y29uc3QgZmlsZXMgPSBbXTtcblxuXHRhc3luYyBmdW5jdGlvbiBlbmQoKSB7XG5cdFx0cmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGZpbGVzLm1hcChmaWxlID0+IHBpZnkocmltcmFmKShmaWxlKSkpO1xuXHR9XG5cblx0aWYgKCFsaXN0ZW5lcikge1xuXHRcdGxpc3RlbmVyID0gcHJvY2Vzcy5vbignU0lHSU5UJywgYXN5bmMgKCkgPT4ge1xuXHRcdFx0cHJvY2Vzcy5leGl0KGF3YWl0IGVuZCgpKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKHN0cmVhbXMubWFwKHN0cmVhbSA9PlxuXHRcdG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGF3YWl0IHBpZnkobWtkaXJwKSh0aGlzLmRlc3QoKSk7XG5cblx0XHRcdGNvbnN0IGRlc3QgPSBwYXRoLmpvaW4odGhpcy5kZXN0KCksIHN0cmVhbS5maWxlbmFtZSk7XG5cdFx0XHRjb25zdCB3cml0ZSA9IGZzV3JpdGVTdHJlYW1BdG9taWMoZGVzdCk7XG5cblx0XHRcdGZpbGVzLnB1c2god3JpdGUuX19hdG9taWNUbXApO1xuXG5cdFx0XHRzdHJlYW0ub24oJ3dhcm4nLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnd2FybicpKTtcblx0XHRcdHN0cmVhbS5vbignZXJyb3InLCBlcnIgPT4gZW5kKCkudGhlbihyZWplY3QoZXJyKSkpO1xuXG5cdFx0XHR3cml0ZS5vbignZmluaXNoJywgcmVzb2x2ZSk7XG5cdFx0XHR3cml0ZS5vbignZXJyb3InLCBlcnIgPT4gZW5kKCkudGhlbihyZWplY3QoZXJyKSkpO1xuXG5cdFx0XHRzdHJlYW0ucGlwZSh3cml0ZSk7XG5cdFx0fSlcblx0KSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcGFnZXJlcyBzdHJlYW1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJpXG4gKiBAcGFyYW0ge1N0cmluZ30gc2l6ZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUodXJpLCBzaXplLCBvcHRpb25zKSB7XG5cdGNvbnN0IHNpemVzID0gc2l6ZS5zcGxpdCgneCcpO1xuXHRjb25zdCBzdHJlYW0gPSBzY3JlZW5zaG90U3RyZWFtKHByb3RvY29saWZ5KHVyaSksIHNpemUsIG9wdGlvbnMpO1xuXHRjb25zdCBmaWxlbmFtZSA9IHRlbXBsYXRlKGAke29wdGlvbnMuZmlsZW5hbWV9LiR7b3B0aW9ucy5mb3JtYXR9YCk7XG5cblx0aWYgKHBhdGguaXNBYnNvbHV0ZSh1cmkpKSB7XG5cdFx0dXJpID0gcGF0aC5iYXNlbmFtZSh1cmkpO1xuXHR9XG5cblx0c3RyZWFtLmZpbGVuYW1lID0gZmlsZW5hbWUoe1xuXHRcdGNyb3A6IG9wdGlvbnMuY3JvcCA/ICctY3JvcHBlZCcgOiAnJyxcblx0XHRkYXRlOiBlYXN5ZGF0ZSgnWS1NLWQnKSxcblx0XHR0aW1lOiBlYXN5ZGF0ZSgnaC1tLXMnKSxcblx0XHRzaXplLFxuXHRcdHdpZHRoOiBzaXplc1swXSxcblx0XHRoZWlnaHQ6IHNpemVzWzFdLFxuXHRcdHVybDogZmlsZW5hbWlmeVVybCh1cmkpXG5cdH0pO1xuXG5cdHJldHVybiBzdHJlYW07XG59XG5cbi8qKlxuICogU3VjY2VzcyBtZXNzYWdlXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3NNZXNzYWdlKCkge1xuXHRjb25zdCBzdGF0cyA9IHRoaXMuc3RhdHM7XG5cdGNvbnN0IHtzY3JlZW5zaG90cywgc2l6ZXMsIHVybHN9ID0gc3RhdHM7XG5cdGNvbnN0IHdvcmRzID0ge1xuXHRcdHNjcmVlbnNob3RzOiBwbHVyKCdzY3JlZW5zaG90Jywgc2NyZWVuc2hvdHMpLFxuXHRcdHNpemVzOiBwbHVyKCdzaXplJywgc2l6ZXMpLFxuXHRcdHVybHM6IHBsdXIoJ3VybCcsIHVybHMpXG5cdH07XG5cblx0Y29uc29sZS5sb2coYFxcbiR7bG9nU3ltYm9scy5zdWNjZXNzfSBHZW5lcmF0ZWQgJHtzY3JlZW5zaG90c30gJHt3b3Jkcy5zY3JlZW5zaG90c30gZnJvbSAke3VybHN9ICR7d29yZHMudXJsc30gYW5kICR7c2l6ZXN9ICR7d29yZHMuc2l6ZXN9YCk7XG59XG4iXX0=
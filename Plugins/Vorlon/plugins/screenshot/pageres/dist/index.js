'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _events = require('events');

var _arrayUniq = require('array-uniq');

var _arrayUniq2 = _interopRequireDefault(_arrayUniq);

var _arrayDiffer = require('array-differ');

var _arrayDiffer2 = _interopRequireDefault(_arrayDiffer);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Pageres = function () {
	/**
  * Initialize a new Pageres
  *
  * @param {Object} options
  * @api public
  */

	function Pageres(options) {
		(0, _classCallCheck3.default)(this, Pageres);

		this.options = (0, _objectAssign2.default)({}, options);
		this.options.filename = this.options.filename || '<%= url %>-<%= size %><%= crop %>';
		this.options.format = this.options.format || 'png';

		this.stats = {};
		this.items = [];
		this.sizes = [];
		this.urls = [];
	}

	/**
  * Get or set page to capture
  *
  * @param {String} url
  * @param {Array} sizes
  * @param {Object} options
  * @api public
  */

	(0, _createClass3.default)(Pageres, [{
		key: 'src',
		value: function src(url, sizes, options) {
			if (!arguments.length) {
				return this._src;
			}

			this._src = this._src || [];
			this._src.push({ url: url, sizes: sizes, options: options });

			return this;
		}

		/**
   * Get or set the destination directory
   *
   * @param {String} dir
   * @api public
   */

	}, {
		key: 'dest',
		value: function dest(dir) {
			if (!arguments.length) {
				return this._dest;
			}

			this._dest = dir;
			return this;
		}

		/**
   * Run pageres
   *
   * @api public
   */

	}, {
		key: 'run',
		value: function () {
			var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
				var _this = this;

				return _regenerator2.default.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								_context.next = 2;
								return _promise2.default.all(this.src().map(function (src) {
									var options = (0, _objectAssign2.default)({}, _this.options, src.options);
									var sizes = (0, _arrayUniq2.default)(src.sizes.filter(/./.test, /^\d{2,4}x\d{2,4}$/i));
									var keywords = (0, _arrayDiffer2.default)(src.sizes, sizes);

									if (!src.url) {
										throw new Error('URL required');
									}

									_this.urls.push(src.url);

									if (!sizes.length && keywords.indexOf('w3counter') !== -1) {
										return _this.resolution(src.url, options);
									}

									if (keywords.length) {
										return _this.viewport({ url: src.url, sizes: sizes, keywords: keywords }, options);
									}

									var _iteratorNormalCompletion = true;
									var _didIteratorError = false;
									var _iteratorError = undefined;

									try {
										for (var _iterator = (0, _getIterator3.default)(sizes), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
											var size = _step.value;

											_this.sizes.push(size);
											_this.items.push(_this.create(src.url, size, options));
										}
									} catch (err) {
										_didIteratorError = true;
										_iteratorError = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion && _iterator.return) {
												_iterator.return();
											}
										} finally {
											if (_didIteratorError) {
												throw _iteratorError;
											}
										}
									}
								}));

							case 2:

								this.stats.urls = (0, _arrayUniq2.default)(this.urls).length;
								this.stats.sizes = (0, _arrayUniq2.default)(this.sizes).length;
								this.stats.screenshots = this.items.length;

								if (this.dest()) {
									_context.next = 7;
									break;
								}

								return _context.abrupt('return', this.items);

							case 7:
								_context.next = 9;
								return this.save(this.items);

							case 9:
								return _context.abrupt('return', this.items);

							case 10:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this);
			}));

			function run() {
				return ref.apply(this, arguments);
			}

			return run;
		}()
	}]);
	return Pageres;
}();

exports.default = Pageres;


(0, _objectAssign2.default)(Pageres.prototype, _events.EventEmitter.prototype);
(0, _objectAssign2.default)(Pageres.prototype, require('./util'));
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztJQUVxQixPOzs7Ozs7OztBQVFwQixrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQ3BCLE9BQUssT0FBTCxHQUFlLDRCQUFhLEVBQWIsRUFBaUIsT0FBakIsQ0FBZjtBQUNBLE9BQUssT0FBTCxDQUFhLFFBQWIsR0FBd0IsS0FBSyxPQUFMLENBQWEsUUFBYixJQUF5QixtQ0FBakQ7QUFDQSxPQUFLLE9BQUwsQ0FBYSxNQUFiLEdBQXNCLEtBQUssT0FBTCxDQUFhLE1BQWIsSUFBdUIsS0FBN0M7O0FBRUEsT0FBSyxLQUFMLEdBQWEsRUFBYjtBQUNBLE9BQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxPQUFLLEtBQUwsR0FBYSxFQUFiO0FBQ0EsT0FBSyxJQUFMLEdBQVksRUFBWjtBQUNBOzs7Ozs7Ozs7Ozs7O3NCQVdHLEcsRUFBSyxLLEVBQU8sTyxFQUFTO0FBQ3hCLE9BQUksQ0FBQyxVQUFVLE1BQWYsRUFBdUI7QUFDdEIsV0FBTyxLQUFLLElBQVo7QUFDQTs7QUFFRCxRQUFLLElBQUwsR0FBWSxLQUFLLElBQUwsSUFBYSxFQUF6QjtBQUNBLFFBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxFQUFDLFFBQUQsRUFBTSxZQUFOLEVBQWEsZ0JBQWIsRUFBZjs7QUFFQSxVQUFPLElBQVA7QUFDQTs7Ozs7Ozs7Ozs7dUJBU0ksRyxFQUFLO0FBQ1QsT0FBSSxDQUFDLFVBQVUsTUFBZixFQUF1QjtBQUN0QixXQUFPLEtBQUssS0FBWjtBQUNBOztBQUVELFFBQUssS0FBTCxHQUFhLEdBQWI7QUFDQSxVQUFPLElBQVA7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQVNNLGtCQUFRLEdBQVIsQ0FBWSxLQUFLLEdBQUwsR0FBVyxHQUFYLENBQWUsZUFBTztBQUN2QyxhQUFNLFVBQVUsNEJBQWEsRUFBYixFQUFpQixNQUFLLE9BQXRCLEVBQStCLElBQUksT0FBbkMsQ0FBaEI7QUFDQSxhQUFNLFFBQVEseUJBQVUsSUFBSSxLQUFKLENBQVUsTUFBVixDQUFpQixJQUFJLElBQXJCLEVBQTJCLG9CQUEzQixDQUFWLENBQWQ7QUFDQSxhQUFNLFdBQVcsMkJBQVksSUFBSSxLQUFoQixFQUF1QixLQUF2QixDQUFqQjs7QUFFQSxhQUFJLENBQUMsSUFBSSxHQUFULEVBQWM7QUFDYixnQkFBTSxJQUFJLEtBQUosQ0FBVSxjQUFWLENBQU47QUFDQTs7QUFFRCxlQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBSSxHQUFuQjs7QUFFQSxhQUFJLENBQUMsTUFBTSxNQUFQLElBQWlCLFNBQVMsT0FBVCxDQUFpQixXQUFqQixNQUFrQyxDQUFDLENBQXhELEVBQTJEO0FBQzFELGlCQUFPLE1BQUssVUFBTCxDQUFnQixJQUFJLEdBQXBCLEVBQXlCLE9BQXpCLENBQVA7QUFDQTs7QUFFRCxhQUFJLFNBQVMsTUFBYixFQUFxQjtBQUNwQixpQkFBTyxNQUFLLFFBQUwsQ0FBYyxFQUFDLEtBQUssSUFBSSxHQUFWLEVBQWUsWUFBZixFQUFzQixrQkFBdEIsRUFBZCxFQUErQyxPQUEvQyxDQUFQO0FBQ0E7O0FBakJzQztBQUFBO0FBQUE7O0FBQUE7QUFtQnZDLDBEQUFtQixLQUFuQiw0R0FBMEI7QUFBQSxlQUFmLElBQWU7O0FBQ3pCLGlCQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLElBQWhCO0FBQ0EsaUJBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsTUFBSyxNQUFMLENBQVksSUFBSSxHQUFoQixFQUFxQixJQUFyQixFQUEyQixPQUEzQixDQUFoQjtBQUNBO0FBdEJzQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBdUJ2QyxTQXZCaUIsQ0FBWixDOzs7O0FBeUJOLGFBQUssS0FBTCxDQUFXLElBQVgsR0FBa0IseUJBQVUsS0FBSyxJQUFmLEVBQXFCLE1BQXZDO0FBQ0EsYUFBSyxLQUFMLENBQVcsS0FBWCxHQUFtQix5QkFBVSxLQUFLLEtBQWYsRUFBc0IsTUFBekM7QUFDQSxhQUFLLEtBQUwsQ0FBVyxXQUFYLEdBQXlCLEtBQUssS0FBTCxDQUFXLE1BQXBDOztZQUVLLEtBQUssSUFBTCxFOzs7Ozt5Q0FDRyxLQUFLLEs7Ozs7ZUFHUCxLQUFLLElBQUwsQ0FBVSxLQUFLLEtBQWYsQzs7O3lDQUVDLEtBQUssSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBakdPLE87OztBQXFHckIsNEJBQWEsUUFBUSxTQUFyQixFQUFnQyxxQkFBYSxTQUE3QztBQUNBLDRCQUFhLFFBQVEsU0FBckIsRUFBZ0MsUUFBUSxRQUFSLENBQWhDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgYXJyYXlVbmlxIGZyb20gJ2FycmF5LXVuaXEnO1xuaW1wb3J0IGFycmF5RGlmZmVyIGZyb20gJ2FycmF5LWRpZmZlcic7XG5pbXBvcnQgb2JqZWN0QXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYWdlcmVzIHtcblx0LyoqXG5cdCAqIEluaXRpYWxpemUgYSBuZXcgUGFnZXJlc1xuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAYXBpIHB1YmxpY1xuXHQgKi9cblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0dGhpcy5vcHRpb25zID0gb2JqZWN0QXNzaWduKHt9LCBvcHRpb25zKTtcblx0XHR0aGlzLm9wdGlvbnMuZmlsZW5hbWUgPSB0aGlzLm9wdGlvbnMuZmlsZW5hbWUgfHwgJzwlPSB1cmwgJT4tPCU9IHNpemUgJT48JT0gY3JvcCAlPic7XG5cdFx0dGhpcy5vcHRpb25zLmZvcm1hdCA9IHRoaXMub3B0aW9ucy5mb3JtYXQgfHwgJ3BuZyc7XG5cblx0XHR0aGlzLnN0YXRzID0ge307XG5cdFx0dGhpcy5pdGVtcyA9IFtdO1xuXHRcdHRoaXMuc2l6ZXMgPSBbXTtcblx0XHR0aGlzLnVybHMgPSBbXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgb3Igc2V0IHBhZ2UgdG8gY2FwdHVyZVxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdXJsXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHNpemVzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqIEBhcGkgcHVibGljXG5cdCAqL1xuXG5cdHNyYyh1cmwsIHNpemVzLCBvcHRpb25zKSB7XG5cdFx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fc3JjO1xuXHRcdH1cblxuXHRcdHRoaXMuX3NyYyA9IHRoaXMuX3NyYyB8fCBbXTtcblx0XHR0aGlzLl9zcmMucHVzaCh7dXJsLCBzaXplcywgb3B0aW9uc30pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IG9yIHNldCB0aGUgZGVzdGluYXRpb24gZGlyZWN0b3J5XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkaXJcblx0ICogQGFwaSBwdWJsaWNcblx0ICovXG5cblx0ZGVzdChkaXIpIHtcblx0XHRpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiB0aGlzLl9kZXN0O1xuXHRcdH1cblxuXHRcdHRoaXMuX2Rlc3QgPSBkaXI7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUnVuIHBhZ2VyZXNcblx0ICpcblx0ICogQGFwaSBwdWJsaWNcblx0ICovXG5cblx0YXN5bmMgcnVuKCkge1xuXHRcdGF3YWl0IFByb21pc2UuYWxsKHRoaXMuc3JjKCkubWFwKHNyYyA9PiB7XG5cdFx0XHRjb25zdCBvcHRpb25zID0gb2JqZWN0QXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIHNyYy5vcHRpb25zKTtcblx0XHRcdGNvbnN0IHNpemVzID0gYXJyYXlVbmlxKHNyYy5zaXplcy5maWx0ZXIoLy4vLnRlc3QsIC9eXFxkezIsNH14XFxkezIsNH0kL2kpKTtcblx0XHRcdGNvbnN0IGtleXdvcmRzID0gYXJyYXlEaWZmZXIoc3JjLnNpemVzLCBzaXplcyk7XG5cblx0XHRcdGlmICghc3JjLnVybCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1VSTCByZXF1aXJlZCcpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnVybHMucHVzaChzcmMudXJsKTtcblxuXHRcdFx0aWYgKCFzaXplcy5sZW5ndGggJiYga2V5d29yZHMuaW5kZXhPZigndzNjb3VudGVyJykgIT09IC0xKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnJlc29sdXRpb24oc3JjLnVybCwgb3B0aW9ucyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChrZXl3b3Jkcy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMudmlld3BvcnQoe3VybDogc3JjLnVybCwgc2l6ZXMsIGtleXdvcmRzfSwgb3B0aW9ucyk7XG5cdFx0XHR9XG5cblx0XHRcdGZvciAoY29uc3Qgc2l6ZSBvZiBzaXplcykge1xuXHRcdFx0XHR0aGlzLnNpemVzLnB1c2goc2l6ZSk7XG5cdFx0XHRcdHRoaXMuaXRlbXMucHVzaCh0aGlzLmNyZWF0ZShzcmMudXJsLCBzaXplLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5zdGF0cy51cmxzID0gYXJyYXlVbmlxKHRoaXMudXJscykubGVuZ3RoO1xuXHRcdHRoaXMuc3RhdHMuc2l6ZXMgPSBhcnJheVVuaXEodGhpcy5zaXplcykubGVuZ3RoO1xuXHRcdHRoaXMuc3RhdHMuc2NyZWVuc2hvdHMgPSB0aGlzLml0ZW1zLmxlbmd0aDtcblxuXHRcdGlmICghdGhpcy5kZXN0KCkpIHtcblx0XHRcdHJldHVybiB0aGlzLml0ZW1zO1xuXHRcdH1cblxuXHRcdGF3YWl0IHRoaXMuc2F2ZSh0aGlzLml0ZW1zKTtcblxuXHRcdHJldHVybiB0aGlzLml0ZW1zO1xuXHR9XG59XG5cbm9iamVjdEFzc2lnbihQYWdlcmVzLnByb3RvdHlwZSwgRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG5vYmplY3RBc3NpZ24oUGFnZXJlcy5wcm90b3R5cGUsIHJlcXVpcmUoJy4vdXRpbCcpKTtcbiJdfQ==
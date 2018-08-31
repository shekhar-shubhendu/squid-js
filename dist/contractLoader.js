'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _truffleContract = require('truffle-contract');

var _truffleContract2 = _interopRequireDefault(_truffleContract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var contracts = [];

var ContractLoader = function () {
    function ContractLoader() {
        _classCallCheck(this, ContractLoader);
    }

    _createClass(ContractLoader, null, [{
        key: '_doLoad',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(what, where, provider) {
                var artifact, contract;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                // console.log("Loading", what, "from", where)
                                artifact = require('@oceanprotocol/keeper-contracts/artifacts/' + what + '.' + where);
                                contract = (0, _truffleContract2.default)(artifact);

                                contract.setProvider(provider);
                                _context.next = 5;
                                return contract.at(artifact.address);

                            case 5:
                                contracts[what] = _context.sent;
                                return _context.abrupt('return', contracts[what]);

                            case 7:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function _doLoad(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return _doLoad;
        }()
    }, {
        key: 'load',
        value: function load(what, where, provider) {
            return contracts[what] || ContractLoader._doLoad(what, where, provider);
        }
    }]);

    return ContractLoader;
}();

exports.default = ContractLoader;
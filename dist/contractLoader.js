'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _truffleContract = require('truffle-contract');

var _truffleContract2 = _interopRequireDefault(_truffleContract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var contracts = [];

var ContractLoader = function () {
    function ContractLoader() {
        (0, _classCallCheck3.default)(this, ContractLoader);
    }

    (0, _createClass3.default)(ContractLoader, null, [{
        key: '_doLoad',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(what, where, provider) {
                var artifact, contract;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                // console.log("Loading", what, "from", where)
                                /* eslint-disable-next-line */
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
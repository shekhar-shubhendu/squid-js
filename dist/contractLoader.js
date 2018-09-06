"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _truffleContract = _interopRequireDefault(require("truffle-contract"));

var contracts = [];

var ContractLoader =
/*#__PURE__*/
function () {
  function ContractLoader() {
    (0, _classCallCheck2.default)(this, ContractLoader);
  }

  (0, _createClass2.default)(ContractLoader, null, [{
    key: "_doLoad",
    value: function () {
      var _doLoad2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(what, where, provider) {
        var artifact, contract;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // console.log("Loading", what, "from", where)

                /* eslint-disable-next-line */
                artifact = require("@oceanprotocol/keeper-contracts/artifacts/".concat(what, ".").concat(where));
                contract = (0, _truffleContract.default)(artifact);
                contract.setProvider(provider);
                _context.next = 5;
                return contract.at(artifact.address);

              case 5:
                contracts[what] = _context.sent;
                return _context.abrupt("return", contracts[what]);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function _doLoad(_x, _x2, _x3) {
        return _doLoad2.apply(this, arguments);
      };
    }()
  }, {
    key: "load",
    value: function load(what, where, provider) {
      return contracts[what] || ContractLoader._doLoad(what, where, provider);
    }
  }]);
  return ContractLoader;
}();

exports.default = ContractLoader;
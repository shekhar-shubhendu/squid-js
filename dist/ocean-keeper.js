"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _web = _interopRequireDefault(require("web3"));

var _contractLoader = _interopRequireDefault(require("./contractLoader"));

var DEFAULT_GAS = 300000;

var OceanKeeper =
/*#__PURE__*/
function () {
  function OceanKeeper(uri, network) {
    (0, _classCallCheck2.default)(this, OceanKeeper);
    var web3Provider = new _web.default.providers.HttpProvider(uri);
    this.web3 = new _web.default(web3Provider);
    this.defaultGas = DEFAULT_GAS;
    this.network = network || 'development';
  }

  (0, _createClass2.default)(OceanKeeper, [{
    key: "initContracts",
    value: function () {
      var _initContracts = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _contractLoader.default.load('OceanToken', this.network, this.web3.currentProvider);

              case 2:
                this.oceanToken = _context.sent;
                _context.next = 5;
                return _contractLoader.default.load('OceanMarket', this.network, this.web3.currentProvider);

              case 5:
                this.oceanMarket = _context.sent;
                _context.next = 8;
                return _contractLoader.default.load('OceanAuth', this.network, this.web3.currentProvider);

              case 8:
                this.oceanAuth = _context.sent;
                return _context.abrupt("return", {
                  oceanToken: this.oceanToken,
                  oceanMarket: this.oceanMarket,
                  oceanAuth: this.oceanAuth
                });

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function initContracts() {
        return _initContracts.apply(this, arguments);
      };
    }() // web3 wrappers

  }, {
    key: "sign",
    value: function sign(accountAddress, message) {
      return this.web3.eth.sign(accountAddress, message);
    }
  }, {
    key: "getMessageHash",
    value: function getMessageHash(message) {
      return this.web3.sha3("\x19Ethereum Signed Message:\n".concat(message.length).concat(message));
    } // call functions (costs no gas)

  }, {
    key: "checkAsset",
    value: function checkAsset(assetId) {
      return this.oceanMarket.checkAsset(assetId);
    }
  }, {
    key: "getBalance",
    value: function getBalance(accountAddress) {
      return this.oceanToken.balanceOf.call(accountAddress);
    }
  }, {
    key: "getAssetPrice",
    value: function getAssetPrice(assetId) {
      return this.oceanMarket.getAssetPrice(assetId).then(function (price) {
        return price.toNumber();
      });
    }
  }, {
    key: "getOrderStatus",
    value: function getOrderStatus(orderId) {
      return this.oceanAuth.statusOfAccessRequest(orderId);
    }
  }, {
    key: "verifyOrderPayment",
    value: function verifyOrderPayment(orderId) {
      return this.oceanMarket.verifyPaymentReceived(orderId);
    }
  }, {
    key: "getEncryptedAccessToken",
    value: function getEncryptedAccessToken(orderId, senderAddress) {
      return this.oceanAuth.getEncryptedAccessToken(orderId, {
        from: senderAddress
      });
    }
  }, {
    key: "getConsumerOrders",
    value: function () {
      var _getConsumerOrders = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(consumerAddress) {
        var _this = this;

        var accessConsentEvent, _resolve, _reject, promise, getEvents, events, orders;

        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                accessConsentEvent = this.oceanAuth.AccessConsentRequested({
                  _consumer: consumerAddress
                }, {
                  fromBlock: 0,
                  toBlock: 'latest'
                });
                _resolve = null;
                _reject = null;
                promise = new Promise(function (resolve, reject) {
                  _resolve = resolve;
                  _reject = reject;
                });

                getEvents = function getEvents() {
                  accessConsentEvent.get(function (error, logs) {
                    if (error) {
                      _reject(error);

                      throw new Error(error);
                    } else {
                      _resolve(logs);
                    }
                  });
                  return promise;
                };

                _context3.next = 7;
                return getEvents().then(function (events) {
                  return events;
                });

              case 7:
                events = _context3.sent;
                // let orders = await this.buildOrdersFromEvents(events, consumerAddress).then((result) => result)
                orders = events.filter(function (obj) {
                  return obj.args._consumer === consumerAddress;
                }).map(
                /*#__PURE__*/
                function () {
                  var _ref = (0, _asyncToGenerator2.default)(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee2(event) {
                    return _regenerator.default.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.t0 = _objectSpread2.default;
                            _context2.t1 = {};
                            _context2.t2 = event.args;
                            _context2.t3 = event.args._timeout.toNumber();
                            _context2.next = 6;
                            return _this.getOrderStatus(event.args._id).then(function (status) {
                              return status.toNumber();
                            });

                          case 6:
                            _context2.t4 = _context2.sent;
                            _context2.next = 9;
                            return _this.verifyOrderPayment(event.args._id).then(function (received) {
                              return received;
                            });

                          case 9:
                            _context2.t5 = _context2.sent;
                            _context2.t6 = {
                              timeout: _context2.t3,
                              status: _context2.t4,
                              paid: _context2.t5,
                              key: null
                            };
                            return _context2.abrupt("return", (0, _context2.t0)(_context2.t1, _context2.t2, _context2.t6));

                          case 12:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2, this);
                  }));

                  return function (_x2) {
                    return _ref.apply(this, arguments);
                  };
                }());
                console.debug('got orders: ', orders);
                return _context3.abrupt("return", orders);

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function getConsumerOrders(_x) {
        return _getConsumerOrders.apply(this, arguments);
      };
    }() // Transactions with gas cost

  }, {
    key: "requestTokens",
    value: function requestTokens(senderAddress, numTokens) {
      return this.oceanMarket.requestTokens(numTokens, {
        from: senderAddress
      });
    }
  }, {
    key: "registerDataAsset",
    value: function () {
      var _registerDataAsset = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4(name, description, price, publisherAddress) {
        var assetId, result;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.oceanMarket.generateId(name + description);

              case 2:
                assetId = _context4.sent;
                _context4.next = 5;
                return this.oceanMarket.register(assetId, price, {
                  from: publisherAddress,
                  gas: this.defaultGas
                });

              case 5:
                result = _context4.sent;
                console.log('registered: ', result);
                return _context4.abrupt("return", assetId);

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function registerDataAsset(_x3, _x4, _x5, _x6) {
        return _registerDataAsset.apply(this, arguments);
      };
    }()
  }, {
    key: "sendPayment",
    value: function () {
      var _sendPayment = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee5(assetId, order, publisherAddress, senderAddress) {
        var assetPrice;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.oceanMarket.getAssetPrice(assetId).then(function (price) {
                  return price.toNumber();
                });

              case 2:
                assetPrice = _context5.sent;
                this.oceanMarket.sendPayment(order.id, publisherAddress, assetPrice, order.timeout, {
                  from: senderAddress,
                  gas: 2000000
                });

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function sendPayment(_x7, _x8, _x9, _x10) {
        return _sendPayment.apply(this, arguments);
      };
    }()
  }, {
    key: "cancelAccessRequest",
    value: function cancelAccessRequest(orderId, senderAddress) {
      return this.oceanAuth.cancelAccessRequest(orderId, {
        from: senderAddress
      });
    }
  }, {
    key: "orchestrateResourcePurchase",
    value: function orchestrateResourcePurchase(assetId, publisherId, price, privateKey, publicKey, timeout, senderAddress, initialRequestEventHandler, accessCommittedEventHandler, tokenPublishedEventHandler) {
      var _this2 = this;

      var oceanToken = this.oceanToken,
          oceanMarket = this.oceanMarket,
          oceanAuth = this.oceanAuth; // Allow OceanMarket contract to transfer funds on the consumer's behalf

      oceanToken.approve(oceanMarket.address, price, {
        from: senderAddress,
        gas: 2000000
      }); // Submit the access request

      oceanAuth.initiateAccessRequest(assetId, publisherId, publicKey, timeout, {
        from: senderAddress,
        gas: 1000000
      });
      var resourceFilter = {
        _resourceId: assetId,
        _consumer: senderAddress
      };
      var initRequestEvent = oceanAuth.AccessConsentRequested(resourceFilter);
      var order = {};

      this._listenOnce(initRequestEvent, 'AccessConsentRequested', function (result, error) {
        order = initialRequestEventHandler(result, error);
        var requestIdFilter = {
          _id: order.id
        };
        var accessCommittedEvent = oceanAuth.AccessRequestCommitted(requestIdFilter);
        var tokenPublishedEvent = oceanAuth.EncryptedTokenPublished(requestIdFilter);

        _this2._listenOnce(accessCommittedEvent, 'AccessRequestCommitted', function (result, error) {
          accessCommittedEventHandler(result, order, error);
        });

        _this2._listenOnce(tokenPublishedEvent, 'EncryptedTokenPublished', function (result, error) {
          tokenPublishedEventHandler(result, order, error);
        });
      });

      return order;
    } // Helper functions (private)

  }, {
    key: "_listenOnce",
    value: function _listenOnce(event, eventName, callback) {
      event.watch(function (error, result) {
        event.stopWatching();

        if (error) {
          console.log("Error in keeper ".concat(eventName, " event: "), error);
        }

        callback(result, error);
      });
    }
  }]);
  return OceanKeeper;
}();

exports.default = OceanKeeper;
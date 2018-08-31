var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import Web3 from 'web3';
import ContractLoader from "./contractLoader";

const DEFAULT_GAS = 300000;

export default class OceanKeeper {
    constructor(uri, network) {
        const web3Provider = new Web3.providers.HttpProvider(uri);
        this.web3 = new Web3(web3Provider);
        this.defaultGas = DEFAULT_GAS;
        this.network = network || 'development';
    }

    initContracts() {
        var _this = this;

        return _asyncToGenerator(function* () {
            _this.oceanToken = yield ContractLoader.load('OceanToken', _this.network, _this.web3.currentProvider);
            _this.oceanMarket = yield ContractLoader.load('OceanMarket', _this.network, _this.web3.currentProvider);
            _this.oceanAuth = yield ContractLoader.load('OceanAuth', _this.network, _this.web3.currentProvider);

            return {
                oceanToken: _this.oceanToken,
                oceanMarket: _this.oceanMarket,
                oceanAuth: _this.oceanAuth
            };
        })();
    }

    // web3 wrappers
    sign(accountAddress, message) {
        return this.web3.eth.sign(accountAddress, message);
    }

    getMessageHash(message) {
        return this.web3.sha3(`\x19Ethereum Signed Message:\n${message.length}${message}`);
    }

    // call functions (costs no gas)
    checkAsset(assetId) {
        return this.oceanMarket.checkAsset(assetId);
    }

    getBalance(accountAddress) {
        return this.oceanToken.balanceOf.call(accountAddress);
    }

    getAssetPrice(assetId) {
        return this.oceanMarket.getAssetPrice(assetId).then(price => price.toNumber());
    }

    getOrderStatus(orderId) {
        return this.oceanAuth.statusOfAccessRequest(orderId);
    }

    verifyOrderPayment(orderId) {
        return this.oceanMarket.verifyPaymentReceived(orderId);
    }

    getEncryptedAccessToken(orderId, senderAddress) {
        return this.oceanAuth.getEncryptedAccessToken(orderId, { from: senderAddress });
    }

    getConsumerOrders(consumerAddress) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            let accessConsentEvent = _this2.oceanAuth.AccessConsentRequested({ _consumer: consumerAddress }, {
                fromBlock: 0,
                toBlock: 'latest'
            });

            let _resolve = null;
            let _reject = null;
            const promise = new Promise(function (resolve, reject) {
                _resolve = resolve;
                _reject = reject;
            });

            const getEvents = function () {
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
            const events = yield getEvents().then(function (events) {
                return events;
            });
            // let orders = await this.buildOrdersFromEvents(events, consumerAddress).then((result) => result)
            let orders = events.filter(function (obj) {
                return obj.args._consumer === consumerAddress;
            }).map((() => {
                var _ref = _asyncToGenerator(function* (event) {
                    return _extends({}, event.args, {
                        timeout: event.args._timeout.toNumber(),
                        status: yield _this2.getOrderStatus(event.args._id).then(function (status) {
                            return status.toNumber();
                        }),
                        paid: yield _this2.verifyOrderPayment(event.args._id).then(function (received) {
                            return received;
                        }),
                        key: null
                    });
                });

                return function (_x) {
                    return _ref.apply(this, arguments);
                };
            })());
            console.debug('got orders: ', orders);
            return orders;
        })();
    }

    // Transactions with gas cost
    requestTokens(senderAddress, numTokens) {
        return this.oceanMarket.requestTokens(numTokens, { from: senderAddress });
    }

    registerDataAsset(name, description, price, publisherAddress) {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const assetId = yield _this3.oceanMarket.generateId(name + description);
            const result = yield _this3.oceanMarket.register(assetId, price, { from: publisherAddress, gas: _this3.defaultGas });
            console.log('registered: ', result);
            return assetId;
        })();
    }

    sendPayment(assetId, order, publisherAddress, senderAddress) {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            let assetPrice = yield _this4.oceanMarket.getAssetPrice(assetId).then(function (price) {
                return price.toNumber();
            });
            _this4.oceanMarket.sendPayment(order.id, publisherAddress, assetPrice, order.timeout, {
                from: senderAddress,
                gas: 2000000
            });
        })();
    }

    cancelAccessRequest(orderId, senderAddress) {
        return this.oceanAuth.cancelAccessRequest(orderId, { from: senderAddress });
    }

    orchestrateResourcePurchase(assetId, publisherId, price, privateKey, publicKey, timeout, senderAddress, initialRequestEventHandler, accessCommittedEventHandler, tokenPublishedEventHandler) {
        const { oceanToken, oceanMarket, oceanAuth } = this;
        // Allow OceanMarket contract to transfer funds on the consumer's behalf
        oceanToken.approve(oceanMarket.address, price, { from: senderAddress, gas: 2000000 });
        // Submit the access request
        oceanAuth.initiateAccessRequest(assetId, publisherId, publicKey, timeout, { from: senderAddress, gas: 1000000 });

        const resourceFilter = { _resourceId: assetId, _consumer: senderAddress };
        const initRequestEvent = oceanAuth.AccessConsentRequested(resourceFilter);
        let order = {};
        this._listenOnce(initRequestEvent, 'AccessConsentRequested', (result, error) => {
            order = initialRequestEventHandler(result, error);
            const requestIdFilter = { _id: order.id };
            const accessCommittedEvent = oceanAuth.AccessRequestCommitted(requestIdFilter);
            const tokenPublishedEvent = oceanAuth.EncryptedTokenPublished(requestIdFilter);
            this._listenOnce(accessCommittedEvent, 'AccessRequestCommitted', (result, error) => {
                accessCommittedEventHandler(result, order, error);
            });
            this._listenOnce(tokenPublishedEvent, 'EncryptedTokenPublished', (result, error) => {
                tokenPublishedEventHandler(result, order, error);
            });
        });
        return order;
    }

    // Helper functions (private)
    _listenOnce(event, eventName, callback) {
        event.watch((error, result) => {
            event.stopWatching();
            if (error) {
                console.log(`Error in keeper ${eventName} event: `, error);
            }
            callback(result, error);
        });
    }
}
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global fetch */

var OceanAgent = function () {
    function OceanAgent(connectionUrl) {
        (0, _classCallCheck3.default)(this, OceanAgent);

        this.assetsUrl = connectionUrl + '/assets';
    }

    (0, _createClass3.default)(OceanAgent, [{
        key: 'getAssetsMetadata',
        value: function getAssetsMetadata() {
            return fetch(this.assetsUrl + '/metadata', { method: 'GET' }).then(function (res) {
                return res.json();
            }).then(function (data) {
                return JSON.parse(data);
            });
        }
    }, {
        key: 'publishDataAsset',
        value: function publishDataAsset(asset) {
            return fetch(this.assetsUrl + '/metadata', {
                method: 'POST',
                body: JSON.stringify(asset),
                headers: { 'Content-type': 'application/json' }
            }).then(function (response) {
                console.log('Success:', response);
                if (response.ok) {
                    console.log('Success:', response);
                    return true;
                }
                console.log('Failed: ', response.status, response.statusText);
                return false;
                // throw new Error(response.statusText ? response.statusText : `publish asset failed with status ${response.status}`)
            }).catch(function (error) {
                console.log('Publish asset to ocean database could not be completed: ' + error.message());
                return false;
            });
        }
    }]);
    return OceanAgent;
}();

exports.default = OceanAgent;
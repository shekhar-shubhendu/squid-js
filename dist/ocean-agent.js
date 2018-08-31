'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global fetch */

var OceanAgent = function () {
    function OceanAgent(connectionUrl) {
        _classCallCheck(this, OceanAgent);

        this.assetsUrl = connectionUrl + '/assets';
    }

    _createClass(OceanAgent, [{
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
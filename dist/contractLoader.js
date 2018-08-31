function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import TruffleContract from 'truffle-contract';

const contracts = [];

export default class ContractLoader {
    static _doLoad(what, where, provider) {
        return _asyncToGenerator(function* () {
            // console.log("Loading", what, "from", where)
            const artifact = require(`@oceanprotocol/keeper-contracts/artifacts/${what}.${where}`);
            const contract = TruffleContract(artifact);
            contract.setProvider(provider);
            contracts[what] = yield contract.at(artifact.address);
            return contracts[what];
        })();
    }

    static load(what, where, provider) {
        return contracts[what] || ContractLoader._doLoad(what, where, provider);
    }
}
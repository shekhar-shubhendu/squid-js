export default class KeeperBase {
    constructor(web3, network) {
        this._web3 = web3
        this._network = network
        this.contract = null
    }
}

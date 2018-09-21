export default class KeeperBase {
    constructor(web3Helper) {
        this._web3Helper = web3Helper
        this.contract = null
    }
}

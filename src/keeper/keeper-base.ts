import Web3Helper from '../utils/Web3Helper'
import Config from "../utils/config";

export default class KeeperBase {

    protected _config: Config
    protected _web3Helper: Web3Helper;
    public contract: any = null;

    constructor(config: Config, web3Helper: Web3Helper) {
        this._config = config;
        this._web3Helper = web3Helper
    }
}

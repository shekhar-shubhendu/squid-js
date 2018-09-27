import Config from "../utils/config";
import Web3Helper from "../utils/Web3Helper";

export default class KeeperBase {

    public contract: any = null;

    protected config: Config;
    protected web3Helper: Web3Helper;

    constructor(config: Config, web3Helper: Web3Helper) {
        this.config = config;
        this.web3Helper = web3Helper;
    }
}

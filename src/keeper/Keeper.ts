import Config from "../models/Config";
import OceanAuth from "./Auth_";
import OceanMarket from "./Market_";
import OceanToken from "./Token_";
import Web3Helper from "./Web3Helper";

export default class Keeper {

    public static async getInstance(config: Config, helper: Web3Helper) {

        const contracts = new Keeper(config, helper);

        contracts.market = await OceanMarket.getInstance(config, helper);
        contracts.auth = await OceanAuth.getInstance(config, helper);
        contracts.token = await OceanToken.getInstance(config, helper);

        return contracts;
    }

    public web3Helper: Web3Helper;
    public token: OceanToken;
    public market: OceanMarket;
    public auth: OceanAuth;

    private config: Config;

    private constructor(config: Config, helper: Web3Helper) {
        this.config = config;
        this.web3Helper = helper;
    }
}

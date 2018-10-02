import Keeper from "./keeper/Keeper";
import Web3Helper from "./keeper/Web3Helper";
import MetaData from "./metadata";
import Config from "./models/Config";
import Asset from "./ocean/Asset";
import Order from "./ocean/Order";

export default class Ocean {

    public static async getInstance(config) {
        const ocean = new Ocean(config);
        ocean.keeper = await Keeper.getInstance(config, ocean.helper);
        ocean.order = new Order(ocean.keeper);
        ocean.asset = new Asset(ocean.keeper);

        return ocean;
    }

    public order: Order;
    public asset: Asset;
    public helper: Web3Helper;
    public metadata: MetaData;

    private keeper: Keeper;
    private config: Config;

    private constructor(config: Config) {

        this.config = config;

        this.helper = new Web3Helper(config);
        this.metadata = new MetaData(config);
    }

    // Transactions with gas cost
    public async requestTokens(amount: number, receiver: string): Promise<boolean> {
        return this.keeper.market.requestTokens(amount, receiver);
    }

    public async getAccounts() {
        const {token} = this.keeper;
        const {helper} = this;

        return Promise.all((await helper.getAccounts()).map(async (account: string) => {
            // await ocean.market.requestTokens(account, 1000)
            return {
                name: account,
                balance: {
                    eth: await token.getEthBalance(account),
                    ocn: await token.getTokenBalance(account),
                },
            };
        }));
    }
}

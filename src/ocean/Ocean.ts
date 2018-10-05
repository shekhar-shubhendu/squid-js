import Keeper from "../keeper/Keeper"
import Web3Helper from "../keeper/Web3Helper"
import Config from "../models/Config"
import Account from "./Account"
import Asset from "./Asset"
import MetaData from "./metadata"
import Order from "./Order"
import Tribe from "./Tribe"

export default class Ocean {

    public static async getInstance(config) {
        const ocean = new Ocean(config)
        ocean.keeper = await Keeper.getInstance(config, ocean.helper)
        ocean.tribe = await Tribe.getInstance(ocean.helper)
        ocean.order = new Order(ocean.keeper)
        ocean.account = new Account(ocean.keeper)
        ocean.asset = new Asset(ocean.keeper)
        return ocean
    }

    public account: Account
    public order: Order
    public tribe: Tribe
    public asset: Asset
    public helper: Web3Helper
    public metadata: MetaData

    private keeper: Keeper
    private config: Config

    private constructor(config: Config) {

        this.config = config

        this.helper = new Web3Helper(config)
        this.metadata = new MetaData(config)
    }
}

import ConfigProvider from "../ConfigProvider"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import Logger from "../utils/Logger"
import Account from "./Account"
import Asset from "./Asset"
import Order from "./Order"

export default class Ocean {

    public static async getInstance(config) {

        if (!Ocean.instance) {
            ConfigProvider.configure(config)
            Ocean.instance = new Ocean(await Keeper.getInstance())
        }

        return Ocean.instance
    }

    private static instance = null
    private keeper: Keeper

    private constructor(keeper: Keeper) {
        this.keeper = keeper
    }

    public async getAccounts(): Promise<Account[]> {

        // retrieve eth accounts
        const ethAccounts = await Web3Provider.getWeb3().eth.getAccounts()

        return ethAccounts.map((address: string) => new Account(address))
    }

    public async register(asset: Asset): Promise<Asset> {
        const {market} = this.keeper

        // generate an id
        const assetId = await market.generateId(asset.name + asset.description)
        Logger.log(`Registering: ${assetId} with price ${asset.price}`)
        asset.setId(assetId)
        // register asset in the market
        const result = await market.register(asset.getId(), asset.price, asset.publisher.getId())
        Logger.log("Registered:", assetId, "in block", result.blockNumber)

        return asset
    }

    public async getOrdersByConsumer(consumer: Account): Promise<Order[]> {
        const {auth, market} = this.keeper

        Logger.log("Getting orders")

        const accessConsentRequestedData = await auth.getEventData(
            "AccessConsentRequested", {
                filter: {
                    _consumer: consumer.getId(),
                },
                fromBlock: 0,
                toBlock: "latest",
            })

        const orders = await Promise.all(
            accessConsentRequestedData
                .map(async (event: any) => {

                    const {returnValues} = event

                    const order: Order = new Order(
                        await Asset.load(returnValues._resourceId),
                        parseInt(returnValues._timeout, 10),
                        null, null)

                    order.setId(returnValues._id)
                    order.setStatus(await auth.getOrderStatus(returnValues._id))
                    order.setPaid(await market.verifyOrderPayment(returnValues._id))

                    return order
                }),
        )

        // Logger.log("Got orders:", JSON.stringify(orders, null, 2))
        Logger.log(`Got ${Object.keys(orders).length} orders`)

        return orders
    }
}

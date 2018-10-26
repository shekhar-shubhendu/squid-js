import Aquarius from "../aquarius/Aquarius"
import AquariusProvider from "../aquarius/AquariusProvider"
import ConfigProvider from "../ConfigProvider"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import Config from "../models/Config"
import SecretStoreProvider from "../secretstore/SecretStoreProvider"
import Logger from "../utils/Logger"
import Account from "./Account"
import Asset from "./Asset"
import Order from "./Order"

export default class Ocean {

    public static async getInstance(config: Config) {

        if (!Ocean.instance) {
            ConfigProvider.setConfig(config)
            SecretStoreProvider.configure(config)
            AquariusProvider.setAquarius(Aquarius)
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

    public async register(asset: Asset): Promise<string> {
        const {market} = this.keeper

        const secretStore = SecretStoreProvider.getSecretStore()

        const id = Math.random().toString(10)
        Logger.log("id", id)

        const assetId = (await market.generateId(id)).replace("0x", "")

        Logger.log(assetId.length)
        const encryptedDocument = await secretStore.encryptDocument(assetId, asset)

        const decryptedDocument = await secretStore.decryptDocument(assetId, encryptedDocument)

        Logger.log(decryptedDocument, encryptedDocument)

        // generate an id
        Logger.log(`Registering: ${assetId} with price ${asset.price} for ${asset.publisher.getId()}`)
        asset.setId(assetId)
        const isAssetActive = await market.isAssetActive(assetId)
        // register asset in the market
        if (!isAssetActive) {
            const result = await market.register(asset.getId(), asset.price, asset.publisher.getId())
            Logger.log("Registered:", assetId, "in block", result.blockNumber)
        } else {
            throw new Error("Asset already registered")
        }
        return assetId
    }

    public async getOrdersByAccount(consumer: Account): Promise<Order[]> {
        const {auth} = this.keeper

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
                        null,
                        parseInt(returnValues._timeout, 10),
                        null, null)

                    order.setId(returnValues._id)

                    return order
                }),
        )

        // Logger.log("Got orders:", JSON.stringify(orders, null, 2))
        Logger.log(`Got ${Object.keys(orders).length} orders`)

        return orders
    }
}

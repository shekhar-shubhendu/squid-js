import Keeper from "../keeper/Keeper"
import AssetModel from "../models/Asset"
import Logger from "../utils/Logger"
import OceanBase from "./OceanBase"

export default class Asset extends OceanBase {

    public async isAssetActive(assetId: string): Promise<boolean> {
        const {market} = this.keeper
        return market.isAssetActive(assetId)
    }

    public async registerAsset(name: string, description: string,
                               price: number, publisherAddress: string): Promise<AssetModel> {
        const {market} = this.keeper

        // generate an id
        const assetId = await market.generateId(name + description)
        Logger.log(`Registering: ${assetId} with price ${price}`)

        // register asset in the market
        const result = await market.register(assetId, price, publisherAddress)
        Logger.log("Registered:", assetId, "in block", result.blockNumber)

        return {
            assetId,
            publisherId: publisherAddress,
            price,
        } as AssetModel
    }

}

import * as assert from "assert"
import ContractHandler from "../../src/keeper/ContractHandler"
import Keeper from "../../src/keeper/Keeper"
import Web3Helper from "../../src/keeper/Web3Helper"
import AssetModel from "../../src/models/Asset"
import Config from "../../src/models/Config"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"

let keeper: Keeper

const config: Config = {
    nodeUri: "http://localhost:8545",
} as Config
const web3Helper = new Web3Helper(config)

before(async () => {
    await ContractHandler.deployContracts(web3Helper)
    keeper = await Keeper.getInstance(config, web3Helper)
})

describe("Asset", () => {

    describe("#register()", () => {

        it("should register asset", async () => {

            const account = new Account(keeper)
            const accounts = await account.list()
            const addr = accounts[0].name

            const name = "Test Asset"
            const description = "This asset is pure owange"
            const price = 100

            const asset = new Asset(keeper)
            const finalAsset: AssetModel = await asset.registerAsset(name, description, price, addr)

            assert(finalAsset.assetId.length === 66)
            assert(finalAsset.assetId.startsWith("0x"))
            assert(finalAsset.publisherId === addr)
            assert(finalAsset.price === price)
        })
    })

    describe("#isAssetActive()", () => {

        it("should return true on new asset", async () => {

            const account = new Account(keeper)
            const accounts = await account.list()
            const addr = accounts[0].name

            const name = "Test Asset 2"
            const description = "This asset is pure owange"
            const price = 100

            const asset = new Asset(keeper)
            const finalAsset = await asset.registerAsset(name, description, price, addr)

            const isAssetActive = await asset.isAssetActive(finalAsset.assetId)
            assert(true === isAssetActive)
        })

        it("should return false on unknown asset", async () => {

            const asset = new Asset(keeper)

            const isAssetActive = await asset.isAssetActive("0x0000")
            assert(false === isAssetActive)
        })
    })
})

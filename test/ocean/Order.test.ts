import * as assert from "assert"
import ContractHandler from "../../src/keeper/ContractHandler"
import Keeper from "../../src/keeper/Keeper"
import Web3Helper from "../../src/keeper/Web3Helper"
import AssetModel from "../../src/models/Asset"
import Config from "../../src/models/Config"
import OrderModel from "../../src/models/Order"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Order from "../../src/ocean/Order"
import Logger from "../../src/utils/Logger";

let keeper: Keeper
let testAsset: AssetModel
let accounts
let buyerAddr

const config: Config = {
    nodeUri: "http://localhost:8545",
} as Config
const web3Helper = new Web3Helper(config)

before(async () => {
    await ContractHandler.deployContracts(web3Helper)
    keeper = await Keeper.getInstance(config, web3Helper)

    const account = new Account(keeper)
    accounts = await account.list()

    const sellerAddr = accounts[0].name
    buyerAddr = accounts[2].name

    const name = "Order Test Asset"
    const description = "This asset is pure owange"
    const price = 100

    const asset = new Asset(keeper)
    testAsset = await asset.registerAsset(name, description, price, sellerAddr)

    // get tokens
    await account.requestTokens(1000000000000000, buyerAddr)
})

const timeout = 100000000000

describe("Order", () => {

    describe("#purchaseAsset()", () => {

        it("should purchase an asset", async () => {

            const order = new Order(keeper)
            const finalOrder: OrderModel = await order.purchaseAsset(testAsset, timeout, buyerAddr)

            assert(finalOrder.assetId === testAsset.assetId)
            assert(finalOrder.asset.assetId === testAsset.assetId)
            assert(finalOrder.timeout === timeout)
        })
    })

    describe("#getOrdersByConsumer()", () => {

        it("should get orders by consumer if there is one", async () => {

            const order = new Order(keeper)
            const finalOrder: OrderModel = await order.purchaseAsset(testAsset, timeout, buyerAddr)

            const orders: OrderModel[] = await order.getOrdersByConsumer(buyerAddr)
            const datOrder = (await orders.filter((o) => o.id === finalOrder.id))[0]

            assert(datOrder !== null)
            assert(datOrder.assetId === testAsset.assetId)
            assert(datOrder.timeout === timeout)
            assert(datOrder.paid === true)
            assert(datOrder.status === 0)
        })

        it("should return empty array if no orders found", async () => {

            const order = new Order(keeper)

            const orders: OrderModel[] = await order.getOrdersByConsumer(accounts[4].name)

            assert(orders.length === 0)
        })
    })
})

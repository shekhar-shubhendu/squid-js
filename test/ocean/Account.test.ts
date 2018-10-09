import * as assert from "assert"
import BigNumber from "bignumber.js"
import ContractHandler from "../../src/keeper/ContractHandler"
import Keeper from "../../src/keeper/Keeper"
import Web3Helper from "../../src/keeper/Web3Helper"
import Config from "../../src/models/Config"
import Account from "../../src/ocean/Account"

let keeper: Keeper

const config: Config = {
    nodeUri: "http://localhost:8545",
} as Config
const web3Helper = new Web3Helper(config)

before(async () => {
    await ContractHandler.deployContracts(web3Helper)
    keeper = await Keeper.getInstance(config, web3Helper)
})

describe("Account", () => {

    describe("#getTokenBalance()", () => {

        it("should get initial balance", async () => {

            const account = new Account(keeper)
            const accounts = await account.list()
            const addr = accounts[1].name
            const balance = await account.getTokenBalance(addr)

            assert(0 === balance)
        })

        it("should get balance the correct balance", async () => {

            const account = new Account(keeper)
            const amount: number = 100
            const accounts = await account.list()
            const addr = accounts[0].name
            await account.requestTokens(amount, addr)
            const balance = await account.getTokenBalance(addr)

            assert(amount === balance)
        })
    })

    describe("#getEthBalance()", () => {

        it("should get initial balance", async () => {

            const account = new Account(keeper)
            const accounts = await account.list()
            const addr = accounts[5].name
            const balance = await account.getEthBalance(addr)
            const web3 = web3Helper.getWeb3()
            assert(Number(web3.utils.toWei("100", "ether")) === balance)
        })
    })

    describe("#list()", () => {

        it("should list accounts", async () => {

            const account = new Account(keeper)
            const accounts = await account.list()

            assert(10 === accounts.length)
            assert(0 === accounts[5].balance.ocn)
            assert("string" === typeof accounts[0].name)
        })

    })

})

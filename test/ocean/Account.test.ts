import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Web3Provider from "../../src/keeper/Web3Provider"
import Account from "../../src/ocean/Account"
import Ocean from "../../src/ocean/Ocean"
import config from "../config"

let ocean: Ocean
let accounts: Account[]

describe("Account", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await ContractHandler.deployContracts()
        ocean = await Ocean.getInstance(config)

        accounts = await ocean.getAccounts()
    })

    describe("#getOceanBalance()", () => {

        it("should get initial ocean balance", async () => {

            const balance = await accounts[8].getOceanBalance()

            assert(0 === balance, `Expected 0 got ${balance}`)
        })

        it("should get the correct balance", async () => {

            const amount: number = 100
            const account: Account = accounts[0]
            await account.requestTokens(amount)
            const balance = await account.getOceanBalance()

            assert(amount === balance)
        })
    })

    describe("#getEthBalance()", () => {

        it("should get initial ether balance", async () => {

            const account: Account = accounts[9]
            const balance = await account.getEtherBalance()
            const web3 = Web3Provider.getWeb3()

            assert(Number(web3.utils.toWei("100", "ether")) === balance)
        })
    })

    describe("#getBalance()", () => {

        it("should get initial balance", async () => {

            const account: Account = accounts[9]
            const balance = await account.getBalance()
            const web3 = Web3Provider.getWeb3()

            assert(Number(web3.utils.toWei("100", "ether")) === balance.eth)
            assert(0 === balance.ocn)
        })
    })

    describe("#requestTokens()", () => {

        it("should return the amount of tokens granted", async () => {

            const tokens = 500
            const account: Account = accounts[0]
            const tokensGranted: number = await account.requestTokens(tokens)

            assert(tokensGranted === tokens)
        })
    })
})

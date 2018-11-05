import {assert} from "chai"
import AquariusProvider from "../../src/aquarius/AquariusProvider"
import SearchQuery from "../../src/aquarius/query/SearchQuery"
import ConfigProvider from "../../src/ConfigProvider"
import DDO from "../../src/ddo/DDO"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import SecretStoreProvider from "../../src/secretstore/SecretStoreProvider"
import config from "../config"
import AquariusMock from "../mocks/Aquarius.mock"
import SecretStoreMock from "../mocks/SecretStore.mock"

let ocean: Ocean
let accounts: Account[]
let testPublisher: Account

const name = "Test Asset 3" + Math.random().toString()
const description = "This asset is pure owange"
const price = 100

describe("Ocean", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        AquariusProvider.setAquarius(new AquariusMock(config))
        SecretStoreProvider.setSecretStore(new SecretStoreMock(config))
        await ContractHandler.deployContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()

        testPublisher = accounts[0]
    })

    describe("#getInstance()", () => {

        it("should get an instance of cean", async () => {

            const oceanInstance: Ocean = await Ocean.getInstance(config)

            assert(oceanInstance)
        })
    })

    describe("#getAccounts()", () => {

        it("should list accounts", async () => {

            const accs: Account[] = await ocean.getAccounts()

            assert(10 === accs.length)
            assert(0 === (await accs[5].getBalance()).ocn)
            assert("string" === typeof accs[0].getId())
        })

    })

    describe("#register()", () => {

        it("should register an asset", async () => {

            const asset: Asset = new Asset(name, description, price, testPublisher)
            const ddo: DDO = await ocean.register(asset)

            assert(ddo.id.startsWith("did:op:"))
        })
    })

    describe("#searchAssets()", () => {

        it("should search for assets", async () => {

            const query = {
                offset: 100,
                page: 0,
                query: {
                    value: 1,
                },
                sort: {
                    value: 1,
                },
                text: "Office",
            } as SearchQuery

            const assets: any[] = await ocean.searchAssets(query)

            assert(assets)
        })

    })
})

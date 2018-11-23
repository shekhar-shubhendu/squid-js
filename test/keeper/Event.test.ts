import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import EventListener from "../../src/keeper/EventListener"
import Keeper from "../../src/keeper/Keeper"
import Account from "../../src/ocean/Account"
import Ocean from "../../src/ocean/Ocean"
import config from "../config"
import TestContractHandler from "./TestContractHandler"

let keeper: Keeper
let ocean: Ocean
let accounts: Account[]

describe("EventListener", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await TestContractHandler.prepareContracts()
        keeper = await Keeper.getInstance()
        assert(keeper)
        ocean = await Ocean.getInstance(config)
        assert(ocean)
        accounts = await ocean.getAccounts()
        assert(accounts)
    })

    describe("#listen()", () => {

        it("should listen to an event", (done) => {

            const acc = accounts[1]

            const event = EventListener.subscribe("OceanToken",
                "Transfer",
                {
                    to: acc.getId(),
                })

            event.listen((events) => {

                assert(events)
                assert(events.length === 2)
                done()
            })

            const {market} = keeper

            market.requestTokens(400, acc.getId())
            market.requestTokens(400, acc.getId())
        })
    })

    describe("#listenOnce()", () => {

        xit("should listen once", async () => {

            const acc = accounts[1]

            const event = EventListener.subscribe("OceanToken",
                "Transfer",
                {
                    to: acc.getId(),
                })

            const events = await event.listenOnce()

            assert(events, "no events")

            const {market} = keeper

            market.requestTokens(400, acc.getId())
        })
    })

})

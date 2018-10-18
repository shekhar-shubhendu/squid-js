import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import config from "../config"
import ContractWrapperBaseMock from "../mocks/ContractWrapperBase.Mock"

const wrappedContract = new ContractWrapperBaseMock("OceanToken")

before(async () => {
    ConfigProvider.configure(config)
    await ContractHandler.deployContracts()
    wrappedContract.initMock()
})

describe("ContractWrapperBase", () => {

    describe("#call()", () => {

        it("should fail to call on an unknown contract function", (done) => {

            wrappedContract.callMock("balanceOfxxx", [])
                .catch(() => {

                    done()
                })
        })

        it("should fail to call on an contract function with wrong set of parameters", (done) => {

            wrappedContract.callMock("balanceOf", [])
                .catch(() => {

                    done()
                })
        })

        it("should fail to call on an unknown contract function", (done) => {

            wrappedContract.sendMock("balanceOfxxx", "0x00", ["0x00"])
                .catch(() => {

                    done()
                })
        })

        it("should fail to call on an contract function with wrong set of parameters", (done) => {

            wrappedContract.sendMock("approve", "0x000", [])
                .catch(() => {

                    done()
                })
        })
    })

    describe("#getEventData()", () => {

        it("should fail on unknown event", (done) => {

            wrappedContract.getEventData("crazyevent", {})
                .catch(() => {

                    done()
                })
        })

    })

})

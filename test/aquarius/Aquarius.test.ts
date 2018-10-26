import * as assert from "assert"
import Aquarius from "../../src/aquarius/Aquarius"
import AquariusConnectorProvider from "../../src/aquarius/AquariusConnectorProvider"
import config from "../config"
import AquariusConnectorMock from "../mocks/AquariusConnector.mock"

describe("Aquarius", () => {

    before(() => {
        AquariusConnectorProvider.setConnector(new AquariusConnectorMock())
    })

    describe("#queryMetadata()", () => {

        it("should query metadata", async () => {

            const aquarius: Aquarius = new Aquarius(config)

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
            }

            const result: any[] = await aquarius.queryMetadata(query)
            assert(result)
        })

    })

})

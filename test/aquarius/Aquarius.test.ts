import * as assert from "assert"
import Aquarius from "../../src/aquarius/Aquarius"
import ConfigProvider from "../../src/ConfigProvider"
import config from "../config"

describe("Aquarius", () => {

    before(() => {

        ConfigProvider.setConfig(config)
    })

    describe("#queryMetadata()queryMetadata", async () => {

        const aquarius: Aquarius = new Aquarius()

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

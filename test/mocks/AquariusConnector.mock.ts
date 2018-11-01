import AquariusConnector from "../../src/aquarius/AquariusConnector"

// @ts-ignore
export default class AquariusConnectorMock extends AquariusConnector {

    constructor(private returnData: any) {
        super()
    }

    // @ts-ignore
    private async fetch(url, opts): Promise<any> {

        return new Promise((resolve, reject) => {
            resolve({
                ok: true,
                json: () => {
                    return this.returnData ? this.returnData : []
                },
                text: () => {
                    return this.returnData ? this.returnData.toString() : ""
                },
            })
        })
    }
}

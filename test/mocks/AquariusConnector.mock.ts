import AquariusConnector from "../../src/aquarius/AquariusConnector"

export default class AquariusConnectorMock extends AquariusConnector {

    public async post(url: string, payload: any) {

        return {
            ok: true,
            json: () => {
                return []
            },
            text: () => {
                return ""
            },
        }
    }
}

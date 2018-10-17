import Provider from "../src/provider/Provider"

export default class MockProvider extends Provider {

    public static async getAccessUrl(accessToken: any, payload: any): Promise<string> {
        return "http://test/test"
    }
}

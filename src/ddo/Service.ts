import MetaData from "./MetaData"

export default class Service {
    public type: string = "OpenIdConnectVersion1.0Service"
    public serviceEndpoint: string = "https://openid.example.com/"
    public description?: string = "My public social inbox"
    public metadata?: MetaData = {} as MetaData
}

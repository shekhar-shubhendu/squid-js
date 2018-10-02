import Asset from "./Asset"

export default class Order {
    public id: string
    public asset: Asset
    public assetId: string
    public timeout: any
    public pubkey: string
    public key: any
}

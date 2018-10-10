import Asset from "./Asset"

export default class Order {
    public id: string
    public asset: Asset
    public assetId: string
    public timeout: number
    public pubkey: string
    public key: any
    public paid: boolean
    public status: number
}

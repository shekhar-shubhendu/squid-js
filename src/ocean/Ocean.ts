import AquariusProvider from "../aquarius/AquariusProvider"
import SearchQuery from "../aquarius/query/SearchQuery"
import ConfigProvider from "../ConfigProvider"
import Condition from "../ddo/Condition"
import DDO from "../ddo/DDO"
import Service from "../ddo/Service"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import Config from "../models/Config"
import Account from "./Account"
import Asset from "./Asset"
import IdGenerator from "./IdGenerator"
import ServiceAgreementTemplate from "./ServiceAgreementTemplate"

export default class Ocean {

    public static async getInstance(config: Config) {

        if (!Ocean.instance) {
            ConfigProvider.setConfig(config)
            Ocean.instance = new Ocean(await Keeper.getInstance())
        }

        return Ocean.instance
    }

    private static instance = null
    private keeper: Keeper

    private constructor(keeper: Keeper) {
        this.keeper = keeper
    }

    public async getAccounts(): Promise<Account[]> {

        // retrieve eth accounts
        const ethAccounts = await Web3Provider.getWeb3().eth.getAccounts()

        return ethAccounts.map((address: string) => new Account(address))
    }

    public async register(asset: Asset): Promise<DDO> {

        const {market} = this.keeper

        const assetId: string = IdGenerator.generateId()
        const did: string = `did:op:${assetId}`

        const methods: string[] = [
            "PaymentConditions.lockPayment",
            "AccessConditions.grantAccess",
            "PaymentConditions.releasePayment",
            "PaymentConditions.refundPayment",
        ]
        // tslint:disable
        const dependencyMatrix = [0, 1, 4, 1 | 2 ** 4 | 2 ** 5] // dependency bit | timeout bit

        const serviceName = "Access"
        const saTemplate: ServiceAgreementTemplate =
            await ServiceAgreementTemplate.registerServiceAgreementsTemplate(serviceName, methods, dependencyMatrix,
                asset.publisher)

        // get condition keys from template
        const conditionKeys: string[] = saTemplate.getConditionKeys()

        // create ddo conditions out of the keys
        const conditions: Condition[] = conditionKeys.map((conditionKey, i): Condition => {
            return {
                name: methods[i].split(".")[1],
                timeout: 100,
                conditionKey: conditionKey,
                parameters: {
                    // todo wtf?
                    assetId: "bytes32",
                    price: "integer"
                },
            } as Condition
        })

        // create ddo itself
        const ddo: DDO = new DDO({
            id: did,
            service: [
                {
                    type: serviceName,
                    // tslint:disable
                    serviceEndpoint: "http://mybrizo.org/api/v1/brizo/services/consume?pubKey=${pubKey}&serviceId={serviceId}&url={url}",
                    purchaseEndpoint: "http://mybrizo.org/api/v1/brizo/services/access/purchase?",
                    // the id of the service agreement?
                    serviceDefinitionId: "0x" + IdGenerator.generateId(),
                    // the id of the service agreement template
                    templateId: saTemplate.getId(),
                    conditions,
                } as Service,
            ],
        })


        await AquariusProvider.getAquarius().storeDDO(ddo)
        asset.setId(assetId)

        await market.register(assetId, asset.price, asset.publisher.getId())
        return ddo
    }

    public async searchAssets(query: SearchQuery): Promise<any[]> {
        return AquariusProvider.getAquarius().queryMetadata(query)
    }
}

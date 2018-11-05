import AquariusProvider from "../aquarius/AquariusProvider"
import SearchQuery from "../aquarius/query/SearchQuery"
import ConfigProvider from "../ConfigProvider"
import DDOCondition from "../ddo/Condition"
import DDO from "../ddo/DDO"
import Parameter from "../ddo/Parameter"
import Service from "../ddo/Service"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import Config from "../models/Config"
import ValuePair from "../models/ValuePair"
import Account from "./Account"
import Asset from "./Asset"
import IdGenerator from "./IdGenerator"
import Condition from "./ServiceAgreements/Condition"
import ServiceAgreementTemplate from "./ServiceAgreements/ServiceAgreementTemplate"
import DefaultTemplate from "./ServiceAgreements/Templates/Default"

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

        const serviceName = "Access"
        const serviceAgreementTemplate: ServiceAgreementTemplate =
            await ServiceAgreementTemplate.registerServiceAgreementsTemplate(serviceName, DefaultTemplate.methods,
                asset.publisher)

        // get condition keys from template
        const conditions: Condition[] = serviceAgreementTemplate.getConditions()

        // create ddo conditions out of the keys
        const ddoConditions: DDOCondition[] = conditions.map((condition: Condition): DDOCondition => {
            return {
                name: condition.methodReflection.methodName,
                timeout: 100,
                conditionKey: condition.condtionKey,
                parameters: condition.methodReflection.inputs.map((input: ValuePair) => {
                    return {
                        ...input,
                        value: "xxx",
                    } as Parameter
                }),

            } as DDOCondition
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
                    templateId: serviceAgreementTemplate.getId(),
                    conditions: ddoConditions,
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

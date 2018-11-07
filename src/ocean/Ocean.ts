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
import Access from "./ServiceAgreements/Templates/Access"

export default class Ocean {

    public static async getInstance(config: Config) {

        if (!Ocean.instance) {
            ConfigProvider.setConfig(config)
            Ocean.instance = new Ocean()
            Ocean.instance.keeper = await Keeper.getInstance()
        }

        return Ocean.instance
    }

    private static instance = null

    // @ts-ignore
    private keeper: Keeper

    private constructor() {
    }

    public async getAccounts(): Promise<Account[]> {

        // retrieve eth accounts
        const ethAccounts = await Web3Provider.getWeb3().eth.getAccounts()

        return ethAccounts.map((address: string) => new Account(address))
    }

    public async register(asset: Asset): Promise<DDO> {

        const assetId: string = IdGenerator.generateId()
        const did: string = `did:op:${assetId}`
        const template = new Access()
        const serviceAgreementTemplate = new ServiceAgreementTemplate(template)

        // get condition keys from template
        const conditions: Condition[] = await serviceAgreementTemplate.getConditions()

        // create ddo conditions out of the keys
        const ddoConditions: DDOCondition[] = conditions.map((condition: Condition): DDOCondition => {
            return {
                name: condition.methodReflection.methodName,
                timeout: condition.timeout,
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
                    type: template.templateName,
                    // tslint:disable
                    serviceEndpoint: "http://mybrizo.org/api/v1/brizo/services/consume?pubKey=${pubKey}&serviceId={serviceId}&url={url}",
                    purchaseEndpoint: "http://mybrizo.org/api/v1/brizo/services/access/purchase?",
                    // the id of the service agreement?
                    serviceDefinitionId: IdGenerator.generatePrefixedId(),
                    // the id of the service agreement template
                    templateId: serviceAgreementTemplate.getId(),
                    conditions: ddoConditions,
                } as Service,
            ],
        })

        await AquariusProvider.getAquarius().storeDDO(ddo)
        asset.setId(assetId)

        return ddo
    }

    public async searchAssets(query: SearchQuery): Promise<any[]> {
        return AquariusProvider.getAquarius().queryMetadata(query)
    }

    public async searchAssetsByText(text: string): Promise<any[]> {
        return AquariusProvider.getAquarius().queryMetadataByText({
            text,
            page: 1,
            offset: 100,
            query: {
                value: 1
            },
            sort: {
                value: 1
            }
        } as SearchQuery)
    }
}

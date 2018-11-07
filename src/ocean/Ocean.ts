import Aquarius from "../aquarius/Aquarius"
import AquariusProvider from "../aquarius/AquariusProvider"
import SearchQuery from "../aquarius/query/SearchQuery"
import ConfigProvider from "../ConfigProvider"
import DDOCondition from "../ddo/Condition"
import DDO from "../ddo/DDO"
import MetaData from "../ddo/MetaData"
import Parameter from "../ddo/Parameter"
import Service from "../ddo/Service"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import Config from "../models/Config"
import ValuePair from "../models/ValuePair"
import ValueType from "../models/ValueType"
import Logger from "../utils/Logger"
import Account from "./Account"
import IdGenerator from "./IdGenerator"
import Condition from "./ServiceAgreements/Condition"
import ServiceAgreement from "./ServiceAgreements/ServiceAgreement"
import ServiceAgreementTemplate from "./ServiceAgreements/ServiceAgreementTemplate"
import Access from "./ServiceAgreements/Templates/Access"

export default class Ocean {

    public static async getInstance(config: Config) {

        if (!Ocean.instance) {
            ConfigProvider.setConfig(config)
            Ocean.instance = new Ocean()
            Ocean.instance.keeper = await Keeper.getInstance()
            Ocean.instance.aquarius = await AquariusProvider.getAquarius()
        }

        return Ocean.instance
    }

    private static instance = null

    private keeper: Keeper
    private aquarius: Aquarius

    private constructor() {
    }

    public async getAccounts(): Promise<Account[]> {

        // retrieve eth accounts
        const ethAccounts = await Web3Provider.getWeb3().eth.getAccounts()

        return ethAccounts.map((address: string) => new Account(address))
    }

    public async registerAsset(metadata: MetaData, publisher: Account): Promise<DDO> {

        const {didRegistry} = this.keeper

        const id: string = IdGenerator.generateId()
        const did: string = `did:op:${id}`
        const serviceDefinitionId: string = IdGenerator.generatePrefixedId()

        metadata.base.contentUrls = metadata.base.contentUrls.map((contentUrl) => {

            // todo encrypt url in secret store
            Logger.log(contentUrl)
            return "0x00000"
        })

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
        const serviceEndpoint = this.aquarius.getServiceEndpoint(did)

        // create ddo itself
        const ddo: DDO = new DDO({
            id: did,
            service: [
                {
                    type: template.templateName,
                    // tslint:disable-next-line
                    serviceEndpoint: "http://mybrizo.org/api/v1/brizo/services/consume?pubKey=${pubKey}&serviceId={serviceId}&url={url}",
                    purchaseEndpoint: "http://mybrizo.org/api/v1/brizo/services/access/purchase?",
                    // the id of the service agreement?
                    serviceDefinitionId,
                    // the id of the service agreement template
                    templateId: serviceAgreementTemplate.getId(),
                    conditions: ddoConditions,
                } as Service,
                {
                    serviceEndpoint,
                    metadata,
                } as Service,
            ],
        })

        const storedDdo = await this.aquarius.storeDDO(ddo)

        await didRegistry.registerAttribute(id, ValueType.DID, "Metadata", serviceEndpoint,
            publisher.getId())

        return storedDdo
    }

    public async purchase(did: string, consumer: Account): Promise<ServiceAgreement> {

        const ddo = await AquariusProvider.getAquarius().retrieveDDO(did)
        const id = did.replace("did:op:", "")

        const serviceAgreementId: string = IdGenerator.generateId()
        const serviceAgreement: ServiceAgreement = await ServiceAgreement.signServiceAgreement(id,
            // todo get publisher from ddo
            ddo, serviceAgreementId, consumer, new Account())

        return serviceAgreement
    }

    public async searchAssets(query: SearchQuery): Promise<any[]> {
        return this.aquarius.queryMetadata(query)
    }

    public async searchAssetsByText(text: string): Promise<any[]> {
        return this.aquarius.queryMetadataByText({
            text,
            page: 1,
            offset: 100,
            query: {
                value: 1,
            },
            sort: {
                value: 1,
            },
        } as SearchQuery)
    }
}

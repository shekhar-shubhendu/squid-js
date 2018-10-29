import {Receipt} from "web3-utils"
import ContractBase from "./ContractBase"

export default class ServiceAgreement extends ContractBase {

    public static async getInstance(): Promise<ServiceAgreement> {
        const serviceAgreement: ServiceAgreement = new ServiceAgreement("ServiceAgreement")
        await serviceAgreement.init()
        return serviceAgreement
    }

    public async setupAgreementTemplate(contractAddresses: any[], contractFunctionSignatures: string[],
                                        depencyMatrix: number[], name: any, ownerAddress: string): Promise<Receipt> {

        return this.send("setupAgreementTemplate", ownerAddress, [
            contractAddresses, contractFunctionSignatures, depencyMatrix, name,
        ])
    }

    public async getAgreementStatus(agreementId: string) {

        return this.call("getAgreementStatus", [agreementId])
    }

    public async executeAgreement(templateId: string, signature: string, consumerAddress: string, valueHashes: string[],
                                  timeoutValues: number[], serviceDefinitionId: string, did: string,
                                  publisherAddress: string): Promise<Receipt> {

        return this.send("executeAgreement", publisherAddress, [
            templateId, signature, consumerAddress, valueHashes, timeoutValues, serviceDefinitionId, "0x" + did,
        ])
    }
}

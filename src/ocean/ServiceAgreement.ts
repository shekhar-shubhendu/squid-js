import ServiceAgreementContract from "../keeper/contracts/ServiceAgreement"
import Web3Provider from "../keeper/Web3Provider"
import Account from "./Account"
import OceanBase from "./OceanBase"
import ServiceAgreementTemplate from "./ServiceAgreementTemplate"

export default class ServiceAgreement extends OceanBase {

    public static async executeServiceAgreement(serviceAgreementTemplate: ServiceAgreementTemplate,
                                                did: string, consumer: Account): Promise<ServiceAgreement> {

        const valHashList = [
            ServiceAgreement.valueHash("bool", true),
            ServiceAgreement.valueHash("bool", false),
            ServiceAgreement.valueHash("uint", 120),
            // asset Id: 797FD5B9045B841FDFF72
            ServiceAgreement.valueHash("string", "797FD5B9045B841FDFF72"),
        ]

        const serviceDefinitionId = "0x515f158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b894"

        const timeoutValues = [0, 0, 0, 3] // timeout 5 blocks @ condition 4

        const saMerkleRoot = ServiceAgreement.merkelizeServiceAgreement(serviceAgreementTemplate, valHashList,
            timeoutValues, serviceDefinitionId, did)
        const saMerkleRootSignature = await Web3Provider.getWeb3().eth.sign(saMerkleRoot, consumer.getId())

        const serviceAgreement: ServiceAgreementContract = await ServiceAgreementContract.getInstance()

        const receipt = await serviceAgreement.executeAgreement(
            serviceAgreementTemplate.getId(), saMerkleRootSignature, consumer.getId(), valHashList, timeoutValues,
            serviceDefinitionId, did, serviceAgreementTemplate.getPublisher().getId())

        const id = receipt.events.ExecuteAgreement.returnValues.serviceId
        return new ServiceAgreement(
            id,
            receipt.events.ExecuteAgreement.returnValues.templateId,
            receipt.events.ExecuteAgreement.returnValues.templateOwner,
            receipt.events.ExecuteAgreement.returnValues.consumer,
            receipt.events.ExecuteAgreement.returnValues.state,
            receipt.events.ExecuteAgreement.returnValues.status,
        )
    }

    protected static valueHash(type: string, value: any) {
        const args = {type, value}
        return Web3Provider.getWeb3().utils.soliditySha3(args).toString("hex")
    }

    private static merkelizeServiceAgreement(serviceAgreementTemplate: ServiceAgreementTemplate, valueHashes: string[],
                                             timeouts: number[], serviceDefinitionId: string, did: string) {
        const args = [
            {type: "bytes32", value: serviceAgreementTemplate.getId()},
            {type: "bytes32[]", value: serviceAgreementTemplate.getConditionKeys()},
            {type: "bytes32[]", value: valueHashes},
            {type: "uint256[]", value: timeouts},
            {type: "bytes32", value: serviceDefinitionId},
            {type: "bytes32", value: did},
        ]
        return Web3Provider.getWeb3().utils.soliditySha3(...args).toString("hex")
    }

    private constructor(id: string, templateId: string, templateOwnerId: string,
                        consumerId: string, state: boolean, status: boolean) {
        super(id)
    }

    public async getStatus() {
        const sa = await ServiceAgreementContract.getInstance()

        return sa.getAgreementStatus(this.getId())
    }
}

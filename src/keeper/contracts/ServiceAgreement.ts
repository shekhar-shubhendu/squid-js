import ContractBase from "./ContractBase"

export default class ServiceAgreement extends ContractBase {

    public static async getInstance(): Promise<ServiceAgreement> {
        const serviceAgreement: ServiceAgreement = new ServiceAgreement("ServiceAgreement")
        await serviceAgreement.init()
        return serviceAgreement
    }
}

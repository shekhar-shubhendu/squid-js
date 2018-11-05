import AquariusProvider from "../aquarius/AquariusProvider"
import Account from "./Account"
import IdGenerator from "./IdGenerator"
import OceanBase from "./OceanBase"
import ServiceAgreement from "./ServiceAgreement"

export default class Asset extends OceanBase {

    constructor(public name: string,
                public description: string,
                public price: number,
                public publisher: Account) {
        super()
    }

    public async purchase(consumer: Account): Promise<ServiceAgreement> {

        const did = `did:op:${this.getId()}`
        const ddo = await AquariusProvider.getAquarius().retrieveDDO(did)

        const serviceAgreementId: string = IdGenerator.generateId()
        const serviceAgreement: ServiceAgreement = await ServiceAgreement.createServiceAgreement(this.getId(),
            ddo, serviceAgreementId, consumer, this.publisher)

        return serviceAgreement
    }
}

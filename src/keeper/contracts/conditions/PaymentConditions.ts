import {Receipt} from "web3-utils"
import ContractBase from "../ContractBase"

export default class PaymentConditions extends ContractBase {

    public static async getInstance(): Promise<PaymentConditions> {
        const paymentConditions: PaymentConditions = new PaymentConditions("PaymentConditions")
        await paymentConditions.init()
        return paymentConditions
    }

    public async lockPayment(serviceAgreementId: any, assetId: any, price: number, publisherAddress: string)
        : Promise<Receipt> {
        return this.send("lockPayment", publisherAddress, [
            serviceAgreementId, "0x" + assetId, price,
        ])
    }
}

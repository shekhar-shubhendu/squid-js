import ContractBase from "../ContractBase"

export default class PaymentConditions extends ContractBase {

    public static async getInstance(): Promise<PaymentConditions> {
        const paymentConditions: PaymentConditions = new PaymentConditions("PaymentConditions")
        await paymentConditions.init()
        return paymentConditions
    }
}

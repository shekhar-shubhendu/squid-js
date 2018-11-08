import Method from "../Method"
import TemplateBase from "./TemplateBase"

export default class FitchainCompute extends TemplateBase {

    public templateName: string = "FitchainCompute"
    public id: string = "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6"
    public Methods: Method[] = [
        {
            path: "PaymentConditions.lockPayment",
            dependency: 0,
            timeout: 10,
        } as Method,
        {
            path: "AccessConditions.grantAccess",
            dependency: 1,
            timeout: 500,
        } as Method,
        {
            path: "PaymentConditions.releasePayment",
            dependency: 4,
            timeout: 17,
        } as Method,
        {
            path: "PaymentConditions.refundPayment",
            dependency: 1,
            timeout: 40,
        } as Method,
    ]
}

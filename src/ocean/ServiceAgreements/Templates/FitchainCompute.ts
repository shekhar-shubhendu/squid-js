import Method from "../Method"
import TemplateBase from "./TemplateBase"

export default class FitchainCompute extends TemplateBase {

    public templateName: string = "FitchainCompute"
    public id: string = "0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6"
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

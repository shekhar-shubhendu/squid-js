import Method from "../Method"
import TemplateBase from "./TemplateBase"

export default class Access extends TemplateBase {

    public templateName: string = "Access"
    public id: string = "0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563"
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

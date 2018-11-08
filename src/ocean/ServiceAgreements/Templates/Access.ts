import Method from "../Method"
import TemplateBase from "./TemplateBase"

export default class Access extends TemplateBase {

    public templateName: string = "Access"
    public id: string = "0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d"
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

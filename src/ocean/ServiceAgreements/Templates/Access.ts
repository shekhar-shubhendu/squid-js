import Method from "../Method"
import TemplateBase from "./TemplateBase"

export default class Access extends TemplateBase {

    public static templateName: string = "Access"
    public static id: string = "0x00000000000000000000000000000000000000000000000000000000000001"
    public static Methods: Method[] = [
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

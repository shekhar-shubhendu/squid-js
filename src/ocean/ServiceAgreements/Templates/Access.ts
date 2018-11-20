import Method from "../Method"
import TemplateBase from "./TemplateBase"

export default class Access extends TemplateBase {

    public templateName: string = "Access"
    public id: string = "0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d"
    public Methods: Method[] = [
        {
            name: "lockPayment",
            contractName: "PaymentConditions",
            methodName: "lockPayment",
            timeout: 0,
            dependencies: [],
            dependencyTimeoutFlags: [],
            isTerminalCondition: false,
        } as Method,
        {
            name: "grantAccess",
            contractName: "AccessConditions",
            methodName: "grantAccess",
            timeout: 10,
            dependencies: ["lockPayment"],
            dependencyTimeoutFlags: [0],
            isTerminalCondition: false,
        } as Method,
        {
            name: "releasePayment",
            contractName: "PaymentConditions",
            methodName: "releasePayment",
            timeout: 10,
            dependencies: ["grantAccess"],
            dependencyTimeoutFlags: [0],
            isTerminalCondition: true,
        } as Method,
        {
            name: "refundPayment",
            contractName: "PaymentConditions",
            methodName: "refundPayment",
            timeout: 10,
            dependencies: ["lockPayment", "grantAccess"],
            dependencyTimeoutFlags: [0, 1],
            isTerminalCondition: true,
        } as Method,
    ]
}

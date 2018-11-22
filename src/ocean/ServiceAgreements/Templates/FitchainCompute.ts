import Method from "../Method"
import TemplateBase from "./TemplateBase"

export default class FitchainCompute extends TemplateBase {

    public templateName: string = "FitchainCompute"
    public id: string = "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6"
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

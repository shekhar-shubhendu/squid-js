import Method from "../Method"

const methods: Method[] = [
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

export default {methods}

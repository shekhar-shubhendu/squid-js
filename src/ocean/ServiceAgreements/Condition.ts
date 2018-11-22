import MethodReflection from "../../models/MethodReflection"

export default class Condition {
    public methodReflection: MethodReflection
    public condtionKey: string
    public dependencies: string[]
    public dependencyTimeoutFlags: number[]
    public isTerminalCondition: boolean
    public timeout: number
}

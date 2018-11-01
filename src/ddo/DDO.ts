import Authentication from "./Authentication"
import PublicKey from "./PublicKey"
import Service from "./Service"

export default class DDO {

    public static serialize(ddo: DDO): string {
        return JSON.stringify(ddo, null, 2)
    }

    public static deserialize(ddoString: string): DDO {
        const ddo = JSON.parse(ddoString)

        return ddo as DDO
    }

    public "@context": string = "https://w3id.org/future-method/v1"
    public id: string
    public publicKey: PublicKey[]
    public authentication: Authentication[]
    public service: Service[]

    // @ts-ignore
    private assa: string

    public constructor(ddo?: {
        id?: string,
        publicKey?: PublicKey[],
        authentication?: Authentication[],
        service?: Service[],
    }) {
        this.id = ddo ? ddo.id ? ddo.id : null : null
        this.publicKey = ddo ? ddo.publicKey ? ddo.publicKey : [] : []
        this.authentication = ddo ? ddo.authentication ? ddo.authentication : [] : []
        this.service = ddo ? ddo.service ? ddo.service : [] : []
    }
}

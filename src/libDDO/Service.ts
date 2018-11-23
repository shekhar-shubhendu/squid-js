/*
 *
 * Servic class to provide access to the DDO service
 *
 *
 */

import IService from "./IService"

export default class Service {

    public id: string
    public endpoint: string
    public type: string
    public values: object

    public constructor(data?: IService) {
        this.id = data.id
        this.endpoint = data.serviceEndpoint
        this.type = data.type
        this.values = Object.assign({}, data)

        // remove any valid keys from the 'values'
        const dataRef: IService = this.values
        delete dataRef.id
        delete dataRef.serviceEndpoint
        delete dataRef.type
    }

    /*
     * convert this object to data
     *
     * :return IService data type
     */
    public toData(): IService {
        let data: IService = {
            id: this.id,
            serviceEndpoint: this.endpoint,
            type: this.type,
        }
        if (Object.keys(this.values).length > 0) {
            data = Object.assign(data, this.values)
        }
        return data as IService
    }

    /*
     * Validate the structure of this object's data
     *
     * :return true if the data is valid
     */
    public isValid(): boolean {
        return this.id && this.id.length > 0
            && this.endpoint && this.endpoint.length > 0
            && this.type && this.type.length > 0
    }

}

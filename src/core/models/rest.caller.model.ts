export enum RequestTypes {
    get,
    post,
    put,
    delete,
    patch,
    head,
    options
}

export interface IUrlOptions {
    restOfUrl: string,
    endPoint: string,
    isSecure: boolean,
    contentType: string
}


export interface IAuthenticationResult{
    IsAuthenticated: boolean
}
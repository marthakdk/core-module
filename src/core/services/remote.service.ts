import { Injectable, Inject } from '@angular/core';

import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';

import { IUrlOptions, IAuthenticationResult, RequestTypes  } from '../models/rest.caller.model';

@Injectable()
export class RemoteService {
    accessToken: any;
    refreshToken: any;

    constructor(private host: string,  @Inject(Http) private http: Http) { }
    private constructUrl(urlOptions: IUrlOptions): string {
        return this.host + '/' + urlOptions.endPoint + urlOptions.restOfUrl;
    }

    // T specifies a generic output of function
    public Request<T>(requestType: RequestTypes, urlOptions: IUrlOptions, body?: any): Observable<T> {
        let response: Observable<Response>;
        let options: any = undefined;
        if (urlOptions && urlOptions.isSecure){
            let _headers = new Headers();
            // this.createAuthorizationHeader(_headers);
            _headers.append('Content-Type', urlOptions.contentType);
            options = new RequestOptions({headers: _headers });
        }

        // True in case of post, put and patch
        if (body && options) {
            response = this.http[RequestTypes[requestType]](
                this.constructUrl(urlOptions),
                body,
                options);
        }
        // True in case of post, put and patch if options is empty
        else if (body) {
            response = this.http[RequestTypes[requestType]](
                this.constructUrl(urlOptions),
                body);
        }
        // True in case of get, delete, head and options
        else if (options) {
            response = this.http[RequestTypes[requestType]](
                this.constructUrl(urlOptions),
                options);
        }
        // True in case of get, delete, head and options, if options is empty
        else {
            response = this.http[RequestTypes[requestType]](
                this.constructUrl(urlOptions),
                options);
        }
        return response.map((res) => <T>res.json()).publishReplay(1).refCount();
    }

    // refersh the token
    refresh(): Observable<any> {
        this.accessToken = null;
        let params: string = 'refresh_token=' + this.refreshToken + '&grant_type=refresh_token';
        let _headers = new Headers();
        this.createAuthorizationHeader(_headers);
        _headers.append('Content-Type', 'application/x-www-form-urlencoded');
        const options = new RequestOptions({headers: _headers});

        return Observable.create(
            observer => {
               this.http.post('http://localhost:8080/oauth/token', params, options).map(res => res.json()).subscribe(
                    (data) => {
                        this.accessToken = data.access_token;
                        observer.next(this.accessToken);
                        observer.complete();
                    },
                    (error) => {
                        Observable.throw(error);
                    }
                    );
            });
    }
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || ' error');
    }

    private createAuthorizationHeader(headers: Headers) {
        headers.append('Authorization', 'Basic ' +
            btoa('a20e6aca-ee83-44bc-8033-b41f3078c2b6:c199f9c8-0548-4be79655-7ef7d7bf9d20'));
    }
}
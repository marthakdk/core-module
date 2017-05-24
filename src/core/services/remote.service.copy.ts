import { Injectable } from '@angular/core';

import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Data } from '../models/cache.data';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

import { IUrlOptions, IAuthenticationResult, RequestTypes } from '../models/rest.caller.model';

@Injectable()
export class RemoteService {
    // Declarations for service api
    private data: Data;
    private observable: Observable<any>;
    // Declataions for refresh token
    accessToken: any;
    refreshToken: any;

    constructor(private host: string, private http: Http) { }
    private constructUrl(urlOptions: IUrlOptions): string {
        return this.host + '/' + urlOptions.endPoint + urlOptions.restOfUrl;
    }

    // T specifies a generic output of function
    public Request(requestType: RequestTypes, urlOptions: IUrlOptions, body?: any) {
        let options: any;
        if (urlOptions && urlOptions.isSecure) {
            let _headers = new Headers();
            // this.createAuthorizationHeader(_headers);
            _headers.append('Content-Type', urlOptions.contentType);
            options = new RequestOptions({ headers: _headers });
        }

        // True in case of post, put and patch
        if (body && options) {
            this.observable = this.http[RequestTypes[requestType]](
                this.constructUrl(urlOptions),
                body,
                options);
        }
        // True in case of post, put and patch if options is empty
        else if (body) {
            this.observable = this.http[RequestTypes[requestType]](
                this.constructUrl(urlOptions),
                body);
        }
        // True in case of get, delete, head and options
        else if (options) {
            this.observable = this.http[RequestTypes[requestType]](
                this.constructUrl(urlOptions),
                options);
        } else {
            if (this.data) {
                // if `data` is available just return it as `Observable`
                return Observable.of(this.data);
            } else if (this.observable) {
                // if `this.observable` is set then the request is in progress
                // return the `Observable` for the ongoing request
                return this.observable;
            } else {
                // example header (not necessary)
                let headers = new Headers();
                headers.append('Content-Type', 'application/json');
                // create the request, store the `Observable` for subsequent subscribers
                this.observable = this.http[RequestTypes[requestType]](
                    this.constructUrl(urlOptions),
                    options)
                    .map(response => {
                    // when the cached data is available we don't need the `Observable` reference anymore
                    this.observable = null;

                    if (response.status == 400) {
                        return "FAILURE";
                    } else if (response.status == 200) {
                        this.data = new Data(response.json());
                        return this.data;
                    }
                    // make it shared so more than one subscriber can get the result
                }).share();
            }
             return this.observable;
        }
    }

    // refersh the token
    refresh(): Observable<any> {
        this.accessToken = null;
        let params: string = 'refresh_token=' + this.refreshToken + '&grant_type=refresh_token';
        let _headers = new Headers();
        this.createAuthorizationHeader(_headers);
        _headers.append('Content-Type', 'application/x-www-form-urlencoded');
        const options = new RequestOptions({ headers: _headers });

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
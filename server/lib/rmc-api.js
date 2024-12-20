import axios from 'axios'
import { ServerConfig } from '../config.js';

/**
 * Converts key=val&key=val... into { key : [ val, val ]} object
 * @param {*} queryString 
 * @returns 
 */
function queryArgsFromString(queryString) {
    if (! queryString) return {}

    let usp = new URLSearchParams(queryString)

    let retVal = {}
    for (const [key, value] of usp) {
        if (! retVal[key])
            retVal[key] = [value]
        else
            retVal[key].push(value)
    }

    return retVal
}

class RmcApi {
    constructor(spaceId) {
        this.spaceId = spaceId
        this.baseUrl = 'https://management-api.console.ringpublishing.com/'
        this.url = ''
        this.api_key = ServerConfig.apiKey
        this.api_secret = ServerConfig.apiSecret
        this.auth_b64 = btoa(`${this.api_key}:${this.api_secret}`)
    }

    /**
     * fetch data from API
     * @param {*} path -- api collection eg: stories or images
     * @param {*} queryArgs -- query params. eg: { p1: v1, p2: [v1,v2,v3] }
     * @returns 
     */
    async get(path, queryArgs) {
        let usp = new URLSearchParams(queryArgs)

        this.url = this.baseUrl + path
        
        if (usp.size > 0)
            this.url += '?' + usp.toString()
        
        console.log(this.url)

        return await this.__call(this.url)
    }

    async post(path, queryArgs) {
        this.url = `/rest/${this.spaceId}/${path}`

        return await this.__call(this.url, 'POST', queryArgs)
    }

    async patch(path, queryArgs) {
        this.url = `/rest/${this.spaceId}/${path}`

        return await this.__call(this.url, 'PATCH', queryArgs)
    }

    async __call(url, method, body) {
        let actualMethod = method ? method : 'GET'
        let actualBody = body || null

        let actualUrl = url

        let actualHeaders = {
                'Authorization': 'Basic ' + this.auth_b64,
            }

        let apiResponse = null
        let apiArgs = {
                method : actualMethod,
                headers : actualHeaders,
                ... ( actualBody && { data : actualBody} )
            }

        //console.log(actualUrl, apiArgs)

        try {
            apiResponse = await axios( actualUrl, apiArgs);
        }
        catch (e) {
            //console.log(e)
            return {
                result: null,
                input: { url: actualUrl, apiArgs : apiArgs },
                error : {
                    status: e.code,
                    code : e?.response?.status,
                    msg : "HTTP Error",
                    data : {
                        url : actualUrl,
                        method : actualMethod,
                        exceptionStack: e
                    }
                }
            }
        }
        //console.log(apiResponse)

        const restResult = apiResponse.data;

        return restResult
    }

    static errorMessages(r) {
        let msgs = []
        if (! r?.result?.error?.response )
            return msgs

        if (r.result.error.response) {
            r.result.error.response.errors.forEach((e) => { msgs.push(e.message) })
        }
        if (r?.result?.error?.message) {
            emsg.push(r.result.error.message)
        }

        return msgs
    }
}

export { RmcApi, queryArgsFromString }

// vim: fdm=indent:

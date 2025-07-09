
import express from 'express';
import { RmcApi } from './lib/rmc-api.js';

const restRouter = express.Router();

restRouter.get('/:clientId/users/', userList );
restRouter.get('/:clientId/users/:userId', userGet );
restRouter.get('/:clientId/groups/', groupList );
restRouter.get('/:clientId/brands/', brandList );
restRouter.get('/:clientId/brands/:objectId', brandGet );
restRouter.get('/:clientId/pub-titles/', pubTitleList );
restRouter.get('/:clientId/pub-titles/:objectId', pubTitleGet );

/*
    * Get list of users

    Eg: http://localhost:4280/rest/e7f17ebe-51a8-4d6e-8dfe-7a92f627a428/users?space=a30bd446-9e79-4839-a7f8-7540bb4f5df4
 */
async function userList(req, res, next) {

    let ringClientId = req.params.clientId 
    let spaceId = req.query.space

    let filterItems = [ "isActive eq true" ]

    if (spaceId)
        filterItems.push(`space eq '${spaceId}'`)

    let rmcApi = new RmcApi(ringClientId)

    let filter = filterItems.join(' and ')

    const users = await rmcApi.get(`ring-clients/${ringClientId}/users`, { filter: filter })

    //console.log('done')

    await res.send( JSON.stringify( users ));
}

/*
    * Get list of groups

    Eg: http://localhost:4280/rest/e7f17ebe-51a8-4d6e-8dfe-7a92f627a428/groups?space=a30bd446-9e79-4839-a7f8-7540bb4f5df4
 */
async function groupList(req, res, next) {

    let ringClientId = req.params.clientId 
    let spaceId = req.query.space

    let filterItems = [ ]

    if (spaceId)
        filterItems.push(`space eq '${spaceId}'`)
    
    let rmcApi = new RmcApi(ringClientId)

    let filter = filterItems.join(' and ')

    const users = await rmcApi.get(`ring-clients/${ringClientId}/groups`, { filter: filter })

    //console.log('done')

    await res.send( JSON.stringify( users ));
}

async function userGet(req, res, next) {
    let ringClientId = req.params.clientId 
    let userId = req.params.userId

    let rmcApi = new RmcApi(ringClientId)

    const user = await rmcApi.get(`ring-clients/${ringClientId}/users/${userId}`)

    res.send( JSON.stringify( user ));
}

/**
 * https://management-api.console.ringpublishing.com/ring-clients/{ringClientId}/brands
 * 
 * Get list of brands
 * 
 * Eg: http://localhost:4204/rest/e7f17ebe-51a8-4d6e-8dfe-7a92f627a428/brands
 */
async function brandList(req, res, next) {

    let ringClientId = req.params.clientId 
    
    let rmcApi = new RmcApi(ringClientId)


    const brands = await rmcApi.get(`ring-clients/${ringClientId}/brands`, {  })

    //console.log('done')

    await res.send( JSON.stringify( brands ));
}


/**
 * https://management-api.console.ringpublishing.com/brands/{brandId}
 * 
 * Get  brands
 * 
 * Eg: http://localhost:4204/rest/e7f17ebe-51a8-4d6e-8dfe-7a92f627a428/brands/....
 */
async function brandGet(req, res, next) {

    let ringClientId = req.params.clientId 
    let objectId = req.params.objectId 
    
    let rmcApi = new RmcApi(ringClientId)

    const objectResp = await rmcApi.get(`brands/${objectId}`, {  })

    //console.log('done')

    await res.send( JSON.stringify( objectResp ));
}

/**
 * https://management-api.console.ringpublishing.com/brands/{brandId}/publishing-titles
 * 
 * Get list of brands
 * 
 * Eg: http://localhost:4204/rest/e7f17ebe-51a8-4d6e-8dfe-7a92f627a428/pub-titles?brandId=...
 */
async function pubTitleList(req, res, next) {

    let ringClientId = req.params.clientId
    let brandId = req.query.brandId

    let rmcApi = new RmcApi(ringClientId)

    const pubTitles = await rmcApi.get(`brands/${brandId}/publishing-titles`, {  })

    //console.log('done')

    await res.send( JSON.stringify( pubTitles ));
}

/**
 * https://management-api.console.ringpublishing.com/publishing-titles/{publishingTitleId}
 * 
 * Get  brands
 * 
 * Eg: http://localhost:4204/rest/e7f17ebe-51a8-4d6e-8dfe-7a92f627a428/publishing-titles/....
 */
async function pubTitleGet(req, res, next) {

    let ringClientId = req.params.clientId 
    let objectId = req.params.objectId 
    
    let rmcApi = new RmcApi(ringClientId)

    const objectResp = await rmcApi.get(`publishing-titles/${objectId}`, {  })

    //console.log('done')

    await res.send( JSON.stringify( objectResp ));
}

export { restRouter }

// vim: fdm=indent:

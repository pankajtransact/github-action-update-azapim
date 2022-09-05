import * as core from '@actions/core'
import axios from 'axios'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    const swaggerUrl: string = core.getInput('swaggerPath')
    const swaggerType: string = core.getInput('swaggerType')
    const swaggerPathType: string = core.getInput('swaggerPathType')
    const apiManagementEndpointUrl: string = core.getInput(
      'apiManagementEndpointUrl'
    )
    const creds: string = core.getInput('creds')

    if (swaggerUrl == null) {
      core.setFailed('Missing swagger URL from input')
    }
    if (apiManagementEndpointUrl == null) {
      core.setFailed('Missing Api manager endpoint from input')
    }
    if (creds == null) {
      core.setFailed('Missing access token from input')
    }
    if (swaggerType == null){
      core.setFailed('Missing swagger type. Expecting json or yaml')
    }
    
   if (swaggerPathType == null){
      core.setFailed('Missing swagger path type. Expecting url or local')
    }
    
    //Request an OAUth Token
    core.info('Parse Json')
    const jsonObj = JSON.parse(creds)
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    core.info('Get token')
    let response = null
    try {
      response = await axios.post(
        `https://login.microsoftonline.com/${jsonObj.tenantId}/oauth2/token`,
        `grant_type=client_credentials&client_id=${jsonObj.clientId}&client_secret=${jsonObj.clientSecret}&resource=https%3A%2F%2Fmanagement.azure.com%2F`,
        config
      )
      core.info(response.data)
    } catch (err) {
      core.error(err)
    }
    
    var formatType = '';
    var linkType = '';
    
    if (swaggerPathType == 'url'){
      linkType = '-link';
    }
    
    if (swaggerType == 'json'){
       formatType = '+json' + linkType;
    }else{
       formatType = linkType
    }
    
    core.info('Starting to process')
    core.info('openapi'+ formatType)
    core.info(`${swaggerUrl}`)
     
    const putData = {
      properties: {
        format: 'openapi'+ formatType,
        value: `${swaggerUrl}`,
        path: 'hallsoll'
      }
    }

    //PUT get response to API manager
    await axios.put(apiManagementEndpointUrl, putData, {
      headers: {Authorization: `Bearer ${response?.data.access_token}`}
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

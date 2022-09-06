import * as core from '@actions/core'
import axios from 'axios'
import fs from 'fs'

async function run(): Promise<void> {
  try {
    const swaggerUrl: string = core.getInput('swaggerPath')
    const swaggerType: string = core.getInput('swaggerType')
    const swaggerPathType: string = core.getInput('swaggerPathType')
    const apimPath: String = core.getInput('apimPath')
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
    if (swaggerType == null) {
      core.setFailed('Missing swagger type. Expecting json or yaml')
    }

    if (swaggerPathType == null) {
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

    let formatType = 'openapi'
    let linkType = ''

    let swaggerContent = swaggerUrl

    if (swaggerPathType === 'url') {
      linkType = '-link'
    } else {
      //read the file from the local path
      fs.readFile(swaggerUrl, 'utf8', (err, data) => {
        if (err) {
          core.error(err)
          return
        }
        swaggerContent = data
        core.info(data)
      })
    }
    
    core.info(`${swaggerContent}`);

    if (swaggerType === 'json') {
      formatType = `openapi+json${linkType}`
    } else {
      formatType = `openapi${linkType}`
    }

    core.info('Starting to process')
    core.info(`${formatType}`)
    core.info(`${swaggerContent}`)
    core.info(`${apimPath}`)

    const putData = {
      properties: {
        format: `${formatType}`,
        value: `${swaggerContent}`,
        path: `${apimPath}`
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

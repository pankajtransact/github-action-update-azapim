# Update Azure API Management
This GitHub Action allows you to update your Azure API Management api from an OpenAPI endpoint or file. 

## Usage

### Inputs
- `swaggerUrl`: URL/path to Swagger
- `apiManagementEndpointUrl`: APIM endpoint URL
- `creds`: APIM credentials. Expexted to be in json format

## Example usage
```yaml
- name: Update Azure API Management
  uses: solidify/github-action-update-azapim@master
  with:
    swaggerUrl: 'URL/path to Swagger'
    apiManagementEndpointUrl: ${{ secrets.API_MANAGER_URL }}
    creds: ${{ secrets.AZURE_CREDENTIALS }}
```

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE)

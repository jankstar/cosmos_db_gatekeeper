# cosmos-db-gatekeeper
A simple gatekeeper with user management in Azure Cosmos-DB on a node.js server with passport.js as well as client via vue 3.

A cosmos db is used, the access is done with the "@azure/cosmos" driver and the access tokens of the Azure cloud.
This information is to be stored in the ```.env``` file:
```
COSMOSDBURI = '<cosmos-cd-uri>'
COSMOSDBKEY = '<cosmos-db-key>'
COSMOSDB = '<db-name>'
```

The ```<db-name>``` is for the gatekeeper database. For the users, the databases and the containers can be defined for access. 

## container
A container "user" is needed, with the fields 
```json
{
    "name": "****",
    "avatar": "****",
    "password": "****",
    "lastLogin": "2021-10-03T19:07:54.011Z",
    "id": "joda",
    "role": "admin",
    "ip": "::1",
}
```
And container "protocol" for logging.

Wenn die db/container initialisiert wird, dann wird automatisch eine User "admin" mit dem Password "admin" angelegt.
Achtung: hier muss anschließend über die Admin-Konsole das Passwort geändert werden!

When the db/container is initialized, then a user "admin" with the password "admin" is automatically created.
Attention: here the password must be changed afterwards via the admin console!

## role
The roles "admin" and "api" are distinguished.

admin: with this role, users can be defined for access.<br>
api: with this role the api can be used.


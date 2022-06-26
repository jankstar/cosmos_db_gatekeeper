var express = require('express');
var router = express.Router();
const db = require('../src/db');
const { TITLE } = require('../config.js');
require('dotenv').config();

const { endpoint, key, databaseId } = {
  endpoint: process.env.COSMOSDBURI,
  key: process.env.COSMOSDBKEY
};
const { CosmosClient, Permission, PermissionMode, User, Container } = require("@azure/cosmos");
const client = new CosmosClient({ endpoint, key });


async function getResourceToken(container /*: Container*/, permission /*: Permission*/) {
  const { resource: permDef } = await permission.read();
  return { [container.url]: permDef._token };
}


/* GET home page. */
router.get('/',
  async (req, res, next) => {
    var msg = '';
    if (res.locals.messages && res.locals.messages[0]) {
      msg = res.locals.messages[0];
    }
    res.render('index', { title: TITLE, message: msg });
  });

router.post('/api',
  //only 'access denied' is returned, so that the users cannot be spied out 
  async (req, res, next) => {
    try {
      if (!req.body.username) { throw Error("username missing") }
      if (!req.body.container) { throw Error("container missing") }
      if (!req.body.bearer) { throw Error("bearer missing") }
      //if (!req.user || !req.user.role || !req.user.role.includes('api')) { throw "Wrong role." }
      const { resource: user } = await db.User.item(req.body.username, req.body.username).read();
      if (!user) { throw Error("user not found") }
      if (!user.role.includes('api')) { throw Error("no api role") }
      if (user.bearer != req.body.bearer) { throw Error("bearer not valid") }
      if (!user.database) { throw Error("databese missing") }

      const database = client.database(user.database);
      const myContainer = database.container(req.body.container);
      const db_user = database.user(user.id);
      if (!db_user) { throw Error("user not found") }
      // if (!db_user) {
      //   db_user = await database.users.create({ id: user.id });
      // }
      // const { resources: permissions } = await db_user.permissions.readAll().fetchAll();
      //let permissions = []

      // if (!permissions || permissions.length == 0) {
      //   let permissionDef = { id: req.body.container, permissionMode: PermissionMode.All, resource: myContainer.url };


      //   const { permission: lPermission } = await db_user.permissions.create(permissionDef);
      //   myPermission = lPermission;
      // }


      // for (ele of permissions) {
      //   if (ele.id == req.body.container) {
      //     myPermission = ele;
      //     break
      //   }
      // }
      const myPermission = db_user.permission(req.body.container)
      if (!myPermission) { throw Error("permission denied") }

      user.token = await getResourceToken(myContainer, myPermission);
      db.User.items.upsert(user);
      db.Protocol.items.create({ user: user.id, type: "Success", message: "new token requested" })

      res.json({ data: user.token })
    } catch (err) {
      //todo protocol error
      let user_id = req.body.username || "unkonwn"
      db.Protocol.items.create({ user: user_id, type: "Error", message: err.message })
      res.status(400).json({ data: "Access denied" })
    }
  });

module.exports = router;

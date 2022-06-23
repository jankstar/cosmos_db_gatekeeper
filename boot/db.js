/**
 * Modul - boot sequence for DB
 */
var db = require('../src/db');
var crypto = require('crypto');

module.exports = async function () {
  try {
    const { resources: rows } = await db.User.items
      .query("SELECT * FROM c WHERE c.username = 'admin'")
      .fetchAll();

    if (!(rows) || !(rows[0])) {
      //User admin noch nicht definiert
      //Achtung: es wird user:admin mit password:admin definiert
      var salt = crypto.randomBytes(16);
      crypto.pbkdf2('admin', salt, 310000, 32, 'sha256',
        async (err, hashedPassword) => {
          if (err) { return console.log(`${err.message}`) }
          try {
            const { resource: user } = await db.User.items
              .create({
                "id": 'admin',
                "username": 'admin',
                "salt": JSON.stringify(salt),
                "role": "admin, api",
                "avatar": "",
                "password": JSON.stringify(hashedPassword),
                "lastLogin": "",
                "bearer": "",
                "token":""
              });
            console.log(`new user defined: ${user.id}`)
          } catch (err) {
            console.log(`${err.message}`)
          }
        });

    } else {
      //User admin schon definiert
    }
  } catch (error) {
    console.log(error.message)
  }
};


conn = new Mongo();

db = conn.getDB("admin");

db.auth(adminuser, adminpwd);

db = conn.getDB(dbname);

db.addUser({ user: dbuser, pwd: dbuser, roles: [ "readWrite", "dbAdmin", "userAdmin" ] });

printjson("Database " + dbname + " is created successfully");

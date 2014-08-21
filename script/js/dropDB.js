
conn = new Mongo();

db = conn.getDB("admin");

db.auth(adminuser, adminpwd);

db = conn.getDB(dbname);

db.dropDatabase();

printjson("Database " + dbname + " is removed successfully");



Database configuration 


add a userAdminAnyDatabase to the admin db

$ mongo admin
> db.addUser({ user: "myadmin", pwd: "1234", roles: ["userAdminAnyDatabase"] })
turn on authentication

auth = true
setParameter = enableLocalhostAuthBypass=0
connect using the new myadmin user to any database you want and add further users:

$ mongo another -u myadmin -p 1234
> db.addUser({ user: "user", pwd: "1234", roles: ["readWrite"] })
or

> use another
> db.addUser({ user: "user", pwd: "1234", roles: ["readWrite"] })


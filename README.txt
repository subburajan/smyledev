
Release Smyledev-1.0 

Author: Subburajan Mayilandan

An easy way to build your application on Node JS - Mongo DB, Configurable solutions, web console, You can create Multiple User Roles, Create New Tables, Add authorization to field level, Create pages, Customize UI.



Mongo Database configuration 
------------------------------------

Create Admin user with role userAdminAnyDatabase

$ mongo admin
> db.addUser({ user: "myadmin", pwd: "1234", roles: ["userAdminAnyDatabase"] })
turn on authentication



Start creating new project
-------------------------------------


Create New Project:

./script/createProject.sh "<Project Id>" "<Project Title>" "<Mongo DB Admin user>" "<Mongo DB Admin password>" 


Switch to your project:

./script/switchProject.sh "<Project Id>"


Build:

grunt app


Run:

npm start


Open Browser:

http://localhost:5001/login


Login as Developer user:

user name: developer@smyle.com
password: !N0password1


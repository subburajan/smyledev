

if [ $# -lt 4 ]
  then
  	echo ""
    echo "Usage> createProject <project-name> <project-title> <mongodb-admin-user> <mongodb-admin-password>"
  	echo ""
    echo "Make sure mongodb admin user has role userAdminAnyDatabase"
  	echo ""
  	exit
fi

BASEDIR=$(dirname $0)

cd $BASEDIR/..

echo "Creating Project $1 - $2 ..."
node script/js/createProject.js $1 "$2"

if [ $? == 255 ]
then
  echo ""
  echo "Failed to create Project. please try again"
  exit
fi

echo "Creating development Database"
mongo --nodb --quiet --eval "var dbname='$1_dev', dbuser='$1_dev', adminuser='$3', adminpwd='$4'"  script/js/createDB.js 


echo "Importing default enums"
mongoimport --username $1_dev --password $1_dev --collection enums --db $1_dev --file script/db_init_data/enums.json

echo "Importing default users" 
mongoimport --username $1_dev --password $1_dev --collection users --db $1_dev --file script/db_init_data/users.json

echo "Importing default roles" 
mongoimport --username $1_dev --password $1_dev --collection roles --db $1_dev --file script/db_init_data/roles.json




if [ $# -lt 3 ]
  then
  	echo ""
    echo "Usage> createProject <project-name> <mongodb-admin-user> <mongodb-admin-password>"
  	echo ""
    echo "Make sure mongodb admin user has role userAdminAnyDatabase"
 	echo ""
  	exit
fi

BASEDIR=$(dirname $0)

cd $BASEDIR/..

echo "Deleting Project $1 files..."
rm -rf app/$1

echo "dropping development Database"

mongo --nodb --quiet --eval "var dbname='$1_dev', adminuser='$2', adminpwd='$3'"  script/js/dropDB.js 

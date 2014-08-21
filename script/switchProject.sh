
if [ $# -lt 1 ]
  then
  	echo ""
    echo "Usage> switchProject <project-name>"
  	echo ""
  	exit
fi


BASEDIR=$(dirname $0)

cd $BASEDIR/..

APP_PATH=$(pwd)/app/$1

if [ ! -d "$APP_PATH" ]
  then
   	echo ""
    	echo "Project $1 doesn't exists "
  	echo ""
  	exit
fi

CURR=`cat .smyle`

echo "Leaving project $CURR" 

echo $1 > .smyle

echo "Switched to Project $1"
 

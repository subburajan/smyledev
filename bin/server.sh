#!/bin/sh

###########################
#
#  @Author Subburajan
#
###########################

usage() {
	echo "Usage: server.sh start|stop"
	exit	
}

start() {

	SERVER_BIN=$(dirname $0)"/../"
	
	cd $SERVER_BIN
	
	mkdir -p logs
	
	echo "SERVER_HOME: `pwd`"
	
	case $NODE_ENV in 	
	'test')
		echo "Starting Test Server"
		CMD='npm run-script start-test'	
	;;
	
	'production')
		echo "Starting Production Server"
		CMD='npm run-script start-prod'
	;;
	
	*)
		echo "Starting Development Server"
		CMD='npm start'
		#exit
	;;
	
	esac
	
	echo "COMMAND: $CMD"
	
	OUT_FILE=Server_$(date +"%m-%d-%Y_%H-%M-%S").out
	
	echo Output to $OUT_FILE
	
	eval nohup $CMD > logs/$OUT_FILE & 
}

stop() {
	echo "Stopping all node processes"
	killall node
}


case "$1" in 
'start')
	start
;;
'stop')
	stop
;;
*)
	usage
;;
esac


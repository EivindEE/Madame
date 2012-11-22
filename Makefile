GREEN=\033[32m
RED=\033[31m
BLUE=\033[34m
DEFAULT=\033[39m
DATE=`date '+%b-%d'`
STARTING="${GREEN}Starting supervisor, grunt and mongodb , logging to logs/ on date: ${BLUE}${DATE} ${DEFAULT}"
STARTED="${GREEN}Started${DEFAULT}"
STOPPING="${RED}Killing all node processes( including supervisor and grunt)${DEFAULT}"
STOPPED="${RED}Stopped all node processes${DEFAULT}"
NODE_RUNNING:=`scripts/running.sh`

start:
	@echo ${STARTING}
	@echo "Starting supervisor"
	@supervisor -e 'node|js|jade' --watch app.js,grunt.js,app,views,routes --quiet app.js 1>> logs/supervisor.${DATE}.log 2>> logs/supervisor.${DATE}.err.log &
	@echo "Starting grunt"
	@grunt watch --no-color >> logs/grunt.${DATE}.log &
	@echo "Starting mongoDB"
	@mongod --port 3001 --fork --logpath logs/mongodb.${DATE}-.log --logappend
	@echo ${STARTED}
	
stop:
	@echo ${STOPPING}
	@killall node
	@echo ${STOPPED}
	@echo "${RED}Shutting down mongodb${DEFAULT}"
	@mongo --port 3001 admin scripts/shutdown_db.js
	@echo "${RED}Shutdown complete${DEFAULT}"

running:
	echo ${NODE_RUNNING}

restart: stop start

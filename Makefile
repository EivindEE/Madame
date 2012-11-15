GREEN=\033[32m
RED=\033[31m
BLUE=\033[34m
DEFAULT=\033[39m
DATE=`date '+%b-%d'`
STARTING="${GREEN}Starting supervisor and grunt , logging to logs/ on date: ${BLUE}${DATE} ${DEFAULT}"
STARTED="${GREEN}Started${DEFAULT}"
STOPPING="${RED}Killing all node processes( supervisor and grunt)${DEFAULT}"
STOPPED="${RED}All node processes stopped${DEFAULT}"
start:
		@echo ${STARTING}
		@echo Starting supervisor
		@supervisor -e 'node|js|jade' --watch app.js,grunt.js,app,views,routes --quiet app.js 1>> logs/supervisor.${DATE}.log 2>> logs/supervisor.${DATE}.err.log &
		@echo Starting grunt
		@grunt watch --no-color >> logs/grunt.${DATE}.log &
		@echo ${STARTED}
		
stop:
	@echo ${STOPPING}
	@killall node
	@echo ${STOPPED}

restart: stop start

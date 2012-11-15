GREEN=\033[32m
RED=\033[31m
DEFAULT=\033[39m
STARTING="${GREEN}Starting supervisor and grunt${DEFAULT}"
STARTED="${GREEN}Started${DEFAULT}"
STOPPING="${RED}Killing all node processes( supervisor and grunt)${DEFAULT}"
STOPPED="${RED}All node processes stopped${DEFAULT}"
start:
		@echo ${STARTING}
		supervisor -e 'node|js|jade' --watch app.js,grunt.js,app,views,routes --quiet app.js 1> logs/supervisor.log &
		grunt watch > logs/grunt.log &
		@echo ${STARTED}
		
stop:
	@echo ${STOPPING}
	@killall node
	@echo ${STOPPED}
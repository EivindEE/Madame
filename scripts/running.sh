#! /bin/bash
NUM_NODE_PROCESSES=`ps -fe|grep node|wc -l`
if [ $NUM_NODE_PROCESSES -gt '1' ] 
then
	echo "Node is running"
else
	echo "Node is not running"
fi

rm sar.pid; rm sys.log; rm sys.json;

#Start Logging
sar -o sys.log 1 1000 -A > /dev/null & echo $! > sar.pid;

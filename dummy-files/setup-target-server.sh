
echo "rm sar.pid; rm sys.log; rm sys.json;

#Start Logging
sar -o sys.log 1 1000 -A > /dev/null & echo $! > sar.pid;
" > initialize.sh;

echo "kill -9 $(cat sar.pid); sadf -j sys.log -P ALL -- -A > sys.json" > get-results.sh;

chmod +x initialize.sh
chmod +x get-results.sh

sudo apt-get install -y sysstat

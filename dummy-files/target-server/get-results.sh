
kill -9 $(cat sar.pid); sadf -j sys.log -P ALL -- -A > sys.json


echo "" > initialize.sh
echo "rm jmeter-results.xml || sleep 2
./apache-jmeter-2.13/bin/jmeter -n -JTARGET_SERVER='${TARGET_SERVER}' -JLOOPS='${LOOPS}' -JTHREADS='${THREADS}' -JTHROUGHPUT='${THROUGHPUT}' -JPORT='${PORT}' -t test-files/${TEST_FILE}
sleep 2
" > run.sh

chmod +x initialize.sh
chmod +x run.sh
mkdir -p test-files

sudo apt-get install -y jmeter

curl http://www.trieuvan.com/apache//jmeter/binaries/apache-jmeter-2.13.tgz > apache-jmeter-2.13.tgz
tar -xvf apache-jmeter-2.13.tgz

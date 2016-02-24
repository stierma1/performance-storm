rm jmeter-results.xml || sleep 2
./apache-jmeter-2.13/bin/jmeter -n -JTARGET_SERVER='${TARGET_SERVER}' -JLOOPS='${LOOPS}' -JTHREADS='${THREADS}' -JTHROUGHPUT='${THROUGHPUT}' -JPORT='${PORT}' -t test-files/${TEST_FILE}
sleep 2

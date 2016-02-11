
ssh ec2-user@{TARGET_SERVER} "kill -9 \$(cat /home/ec2-user/sar.pid); sadf -j /home/ec2-user/sys.log -P ALL -- -A > /home/ec2-user/sys.json"

#pull down sys.json

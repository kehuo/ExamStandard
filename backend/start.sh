#!/bin/bash
#source ~/.bash_profile
#pyenv shell py3_env
#python manage.py runserver -c $CONFIG_FILE
#!/usr/bin/env bash
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  bin="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$bin/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
bin="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
cd $bin
export LANG=en_US.UTF8
export CFG_PATH=/project/config/service.conf

/usr/bin/mkdir -p /etc/nginx/data/run
/usr/sbin/nginx
./server
tail -f /dev/null
fi
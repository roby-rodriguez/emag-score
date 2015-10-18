#!/bin/bash

# source: http://blog.databigbang.com/distributed-scraping-with-multiple-tor-circuits/

base_socks_port=9050
base_control_port=8118
tor_data="${HOME}/tor_data"

# Create data directory if it doesn't exist
if [ ! -d "$tor_data" ]; then
  mkdir "$tor_data"
fi

# 9050-9090, 8118-8158
#for i in {0..40}
for i in {0..9}
do
  j=$((i+1))
  socks_port=$((base_socks_port+i))
  control_port=$((base_control_port+i))
  if [ ! -d "${tor_data}/tor$i" ]; then
    echo "Creating directory ${tor_data}/tor$i"
    mkdir "${tor_data}/tor$i"
  fi
  # Take into account that authentication for the control port is disabled. Must be used in secure and controlled environments

  echo "Running: tor --RunAsDaemon 1 --CookieAuthentication 0 --HashedControlPassword \"\" --ControlPort $control_port --PidFile tor$i.pid --SocksPort $socks_port --DataDirectory ${tor_data}/tor$i"

  tor --RunAsDaemon 1 --CookieAuthentication 0 --HashedControlPassword "" --ControlPort $control_port --PidFile tor$i.pid --SocksPort $socks_port --DataDirectory "${tor_data}/tor$i"
done
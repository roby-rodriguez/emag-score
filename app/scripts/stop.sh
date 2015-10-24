#!/bin/bash

echo "Stopping tor circuits"
pkill tor
echo "Stoping proxy router"
pkill ruby
echo "Cleaning tor data"
if [ -d "${HOME}/$tor_data" ]; then
    rm -rf ${HOME}/tor_data
fi
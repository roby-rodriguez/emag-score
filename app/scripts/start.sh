#!/bin/bash

# cleanup if necessary
./app/scripts/stop.sh

# launch tor proxy
./app/scripts/spawn_tor_instances.sh

#!/usr/bin/env ruby
ruby ./app/scripts/dispatcher.rb &
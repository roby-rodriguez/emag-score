require 'peasant'

nodes = (9050..9059).map { |port| { host: '127.0.0.1', port: port } }
Peasant::Server.run host: '127.0.0.1', port: 9999, nodes: nodes
# docker generated neo4j databases will restart themselves after reboot
sudo docker run --name hydra --restart unless-stopped --log-opt max-size=50m --log-opt max-file=10 -p7474:7474 -p7687:7687 -d -v /home/newt-beta-server/neo4j_databases/hydra/data:/data -v /home/newt-beta-server/neo4j_databases/hydra/logs:/logs --env NEO4J_AUTH=neo4j/123 neo4j
sudo docker run --name visuall --restart unless-stopped --log-opt max-size=50m --log-opt max-file=10 -p3001:7474 -p3002:7473 -p3003:7687 -d -v /home/newt-beta-server/neo4j_databases/visuall/data:/data -v /home/newt-beta-server/neo4j_databases/visuall/logs:/logs --env NEO4J_AUTH=none neo4j

# list files and their size in the directory /var/log
sudo du -h /var/log | sort -h
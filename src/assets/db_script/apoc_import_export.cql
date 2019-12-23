// apoc plugin must be installed
// ------------------------------------------------- 'neo4j.conf' changes for APOC -------------------------------------------------
// full access to the database through unsupported/insecure internal APIs.
dbms.security.procedures.unrestricted=algo.*,apoc.*

// apoc must be enabled to import export
apoc.export.file.enabled=true
apoc.import.file.enabled=true
// ------------------------------------------------- 'neo4j.conf' changes for APOC -------------------------------------------------

// ------------------------------------------------- things to change in 'neo4j.conf' for multiple servers  -------------------------------------------------
// # To accept non-local connections, uncomment this line:
dbms.connectors.default_listen_address=0.0.0.0
dbms.connector.bolt.listen_address=:3003
dbms.connector.https.listen_address=:3002
dbms.connector.http.listen_address=:3001
// ------------------------------------------------- things to change in 'neo4j.conf' for multiple servers  -------------------------------------------------

// export all data with this
call apoc.export.cypher.all( "/mysubset.cypher", {format:'plain',separateFiles:true});

// import data step by step
call apoc.cypher.runSchemaFile('/mysubset.schema.cypher');
call apoc.cypher.runFiles(['/mysubset.nodes.cypher','/mysubset.relationships.cypher']);
call apoc.cypher.runFile('/mysubset.cleanup.cypher');
call apoc.cypher.runSchemaFile('/mysubset.cleanup.cypher');
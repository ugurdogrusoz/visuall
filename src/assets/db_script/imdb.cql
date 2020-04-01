CREATE CONSTRAINT ON (n:Person) ASSERT n.ID IS UNIQUE;
USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM 'file:///name.basic.tsv/data.tsv' AS r
WITH toInteger(COALESCE(r.birthYear, 1950)) as birthYear, toInteger(COALESCE(r.deathYear, 2050)) as deathYear, r.primaryProfession as profession, r.nconst as ID, r.primaryName as name
MERGE (n:Person {ID: ID})
ON CREATE SET n.name = name, n.born = toInteger(birthYear), n.death = toInteger(deathYear), n.profession = profession, n.start_t = (birthYear - 1970) * 31536000000, n.end_t = (deathYear - 1970) * 31536000000

CREATE CONSTRAINT ON (n:Movie) ASSERT n.ID IS UNIQUE;
USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM 'file:///title.basic.tsv/data.tsv' AS r
WITH toInteger(COALESCE(r.birthYear, 1950)) as birthYear, toInteger(COALESCE(r.deathYear, 2050)) as deathYear, r.primaryProfession as profession, r.nconst as ID, r.primaryName as name
MERGE (n:Person {ID: ID})
ON CREATE SET n.name = name, n.born = toInteger(birthYear), n.death = toInteger(deathYear), n.profession = profession, n.start_t = (birthYear - 1970) * 31536000000, n.end_t = (deathYear - 1970) * 31536000000


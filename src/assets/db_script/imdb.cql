// generate people
CREATE CONSTRAINT ON (n:Person) ASSERT n.nconst IS UNIQUE;
:auto
USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM 'file:///name-basics.tsv' AS r FIELDTERMINATOR '\t'
WITH toInteger(COALESCE(r.birthYear, 1900)) as birthYear, toInteger(COALESCE(r.deathYear, 2100)) as deathYear, split(r.primaryProfession, ',') as primaryProfession,
r.nconst as nconst, r.primaryName as primaryName
MERGE (n:Person {nconst: nconst})
ON CREATE SET n.primary_name = primaryName, n.birth_year = toInteger(birthYear), n.death_year = toInteger(deathYear), 
n.primary_profession = primaryProfession, n.start_t = (birthYear - 1970) * 31557600000, n.end_t = (deathYear - 1970) * 31557600000

// generate movies
CREATE CONSTRAINT ON (n:Movie) ASSERT n.tconst IS UNIQUE;
:auto
USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM 'file:///title-basic.tsv' AS r FIELDTERMINATOR '\t'
WITH r.primaryTitle as primaryTitle, toInteger(r.runtimeMinutes) as runtimeMinutes, r.titleType as titleType, toInteger(r.production_end_date) as production_end_date,
toInteger(r.startYear) as startYear, toFloat(r.rating) as rating,toInteger(r.numVotes) as numVotes, toInteger(r.shooting_end_date) as shooting_end_date,
toInteger(r.endYear) as endYear, toInteger(r.production_start_date) as production_start_date, r.tconst as tconst, r.originalTitle as originalTitle, 
toInteger(r.shooting_start_date) as shooting_start_date, split(r.genres, ',') as genres, toInteger(r.isAdult) as isAdult
MERGE (n:Movie {tconst: tconst})
ON CREATE SET n.primary_title = primaryTitle, n.runtime_minutes = runtimeMinutes, n.title_type = titleType, n.production_end_date = production_end_date,
n.start_year = startYear, n.rating = rating, n.count_votes = numVotes, n.shooting_end_date = shooting_end_date, n.end_year = endYear, n.production_start_date = production_start_date,
n.original_title = originalTitle, n.shooting_start_date = shooting_start_date, n.genres = genres, n.is_adult = isAdult

// generate KNOWN_FOR edges
:auto
USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM 'file:///name-basics.tsv' AS r FIELDTERMINATOR '\t'
WITH split(r.knownForTitles, ',') as known4, r.nconst as nconst
UNWIND known4 as tconst 
MATCH (p:Person {nconst:nconst})
MATCH (m:Movie {tconst:tconst})
MERGE (p)-[:KNOWN_FOR {}]->(m)

// generate DIRECTOR edges from crew file 
:auto
USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM 'file:///title-crew.tsv' AS r FIELDTERMINATOR '\t'
WITH r.tconst as tconst, split(r.directors, ',') as directors
UNWIND directors as nconst
MATCH (p:Person {nconst:nconst})
MATCH (m:Movie {tconst:tconst})
MERGE (p)-[:DIRECTOR {}]->(m)

// generate WRITER edges from crew file 
:auto
USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM 'file:///title-crew.tsv' AS r FIELDTERMINATOR '\t'
WITH r.tconst as tconst, split(r.writers, ',') as writers
UNWIND writers as nconst
MATCH (p:Person {nconst:nconst})
MATCH (m:Movie {tconst:tconst})
MERGE (p)-[:WRITER {}]->(m)

// generate DIRECTOR edges from principals file 
:auto
USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM 'file:///title-principals.tsv' AS r FIELDTERMINATOR '\t'
WITH r.tconst as tconst, r.nconst as nconst, r.category as category, r.job as job, split(r.characters, ',') as characters
MATCH (p:Person {nconst:nconst})
MATCH (m:Movie {tconst:tconst})
FOREACH (_ IN CASE WHEN category='self' THEN [1] ELSE [] END |
  MERGE (p)-[:SELF {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='director' THEN [1] ELSE [] END |
  MERGE (p)-[:DIRECTOR {job: job, characters: characters}]->(m)
)    
FOREACH (_ IN CASE WHEN category='cinematographer' THEN [1] ELSE [] END |
  MERGE (p)-[:CINEMATOGRAPHER {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='actor' THEN [1] ELSE [] END |
  MERGE (p)-[:ACTOR {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='producer' THEN [1] ELSE [] END |
  MERGE (p)-[:PRODUCER {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='writer' THEN [1] ELSE [] END |
  MERGE (p)-[:WRITER {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='actress' THEN [1] ELSE [] END |
  MERGE (p)-[:ACTRESS {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='composer' THEN [1] ELSE [] END |
  MERGE (p)-[:COMPOSER {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='production_designer' THEN [1] ELSE [] END |
  MERGE (p)-[:PRODUCTION_DESIGNER {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='editor' THEN [1] ELSE [] END |
  MERGE (p)-[:EDITOR {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='archive_footage' THEN [1] ELSE [] END |
  MERGE (p)-[:ARCHIVE_FOOTAGE {job: job, characters: characters}]->(m)
)
FOREACH (_ IN CASE WHEN category='archive_sound' THEN [1] ELSE [] END |
  MERGE (p)-[:ARCHIVE_SOUND {job: job, characters: characters}]->(m)
)

// delete the duplicated WRITER and DIRECTOR edges
match (n:Person)-[e:DIRECTOR]->(n2:Movie)
where size((n)-[:DIRECTOR]->(n2)) > 1 and e.job is null
delete e;
match (n:Person)-[e:WRITER]->(n2:Movie)
where size((n)-[:WRITER]->(n2)) > 1 and e.job is null
delete e;

// update date times of Movie
:auto
USING PERIODIC COMMIT 10000
LOAD CSV WITH HEADERS FROM 'file:///injected_data.tsv' AS r FIELDTERMINATOR '\t'
WITH r.tconst as id, toInteger(r.production_end_date) as p2, toInteger(r.production_start_date) as p1, toInteger(r.shooting_start_date) as s1, toInteger(r.shooting_end_date) as s2
MATCH (n:Movie {tconst: id})
set n.production_end_date = p2, n.production_start_date = p1, n.shooting_start_date = s1, n.shooting_end_date = s2

// update date times of ACTOR and ACTRESS
match(p:Person)-[e:ACTOR|ACTRESS]->(m:Movie)
set e.act_begin = m.shooting_start_date, e.act_end = m.shooting_end_date

// update date times of others
match(p:Person)-[e:SELF|DIRECTOR|WRITER|ARCHIVE_SOUND|ARCHIVE_FOOTAGE|EDITOR|PRODUCTION_DESIGNER|COMPOSER|PRODUCER|CINEMATOGRAPHER]->(m:Movie)
set e.begin = m.production_start_date, e.end = m.production_end_date

// forgot to make known for, also that that this operation might require to set a higher "dbms.memory.heap.max_size=8G" in neo4j.conf
match (:Person)-[e:KNOWN_FOR]->(m:Movie)
set e.begin = m.production_start_date, e.end = m.production_end_date
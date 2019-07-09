// generate_dateTime_properties.cql
// delete all start and end time features of all edges
MATCH ()-[e]-()
WHERE EXISTS(e.begin_datetime)
SET e.begin_datetime = NULL, e.end_datetime = NULL;

// delete all start and end time features of all nodes
MATCH (n)
WHERE EXISTS(n.begin_datetime)
SET n.begin_datetime = NULL, n.end_datetime = NULL;

// assign random start and end time to all edges
// MATCH ()-[e]-()
// WHERE NOT EXISTS(e['begin_datetime'])
// // corresponds to the date "Mon Jan 01 2018 00:00:00 GMT+0300 (GMT+03:00)" in JS
// WITH e, 1514754000000 as d1
// // corresponds to the date "Fri Mar 15 2019 09:44:34 GMT+0300 (GMT+03:00)" in JS
// ,1552632274954 as d2
// // corresponds to the date "Fri Mar 15 2019 09:44:34 GMT+0300 (GMT+03:00)" in JS
// , 37878274954 as deltaTime
// SET e.begin_datetime = d1 + round(RAND() * deltaTime),
// e.end_datetime = e.begin_datetime + round(RAND() * (d2-e.begin_datetime));

// assign start and end time edges by giving the same range to all edges which source is common
// match (n1) 
// with collect(id(n1)) as node_ids, 1514754000000 + round(RAND() * 37878274954) as seed
// unwind node_ids as curr_id
//   match (n)-[r]-()
//   where id(n) = curr_id 
//   // 86400000 is 1 day
//   set r.begin_datetime = seed, r.end_datetime = seed + 86400000

// assign start and end time to Acted In, Directed,Produced
match (n1) 
with collect(id(n1)) as node_ids
unwind node_ids as curr_id
  match (n:Movie)-[r:ACTED_IN|DIRECTED|PRODUCED]-(n2:Person)
  where id(n) = curr_id 
  // 31536000000 is 1 year
  set r.begin_datetime = (n.released - 1970) * 31536000000,
  r.end_datetime =  (n.released - 1969) * 31536000000

// assign start and end time to Wrote
match (n1) 
with collect(id(n1)) as node_ids
unwind node_ids as curr_id
  match (n:Movie)-[r:WROTE]-(n2:Person)
  where id(n) = curr_id 
  // 31536000000 is 1 year
  set r.begin_datetime = (n.released - 1970 - (3 + round(RAND() * 7)) ) * 31536000000,
  r.end_datetime =  (n.released - 1970) * 31536000000

// assign start and end time to Reviewed
match (n1) 
with collect(id(n1)) as node_ids
unwind node_ids as curr_id
  match (n:Movie)-[r:REVIEWED]-(n2:Person)
  where id(n) = curr_id 
  // 31536000000 is 1 year
  set r.begin_datetime = (n.released - 1970 - (3 + round(RAND() * 7)) ) * 31536000000,
  r.end_datetime =  (n.released - 1970) * 31536000000

// assign start and end time to Follows
match (n:Person)-[r:FOLLOWS]-(n2:Person)
// 31536000000 is 1 year
set r.begin_datetime = (n.born - 1970 ) * 31536000000,
r.end_datetime =  (n.born - 1970 + 3 + round(RAND() * 7) ) * 31536000000

// some persons have null born values, set them to a default value
match (n:Person) where n.born is  null set n.born = 1971

// assign start time to a Person node by born date, +INF (2050) as end time 
match (n:Person)
set n.begin_datetime = (n.born - 1970) * 31536000000 +  round(RAND() * 31536000000),
n.end_datetime = (2050 - 1970) * 31536000000

// assign start time to a Movie node by released date, +INF (2050) as end time 
match (n:Movie)
set n.begin_datetime = (n.released - 1970) * 31536000000 +  round(RAND() * 31536000000),
n.end_datetime = (2050 - 1970) * 31536000000

// assign random ratings
match (n:Movie)
set n.rating = round(10.0^1 * RAND() * 10)/10.0^1

// bug fix for movie begin 
match (n:Movie)
set n.begin_datetime = n.begin_datetime - 31536000000
// bug fix for reviwed
match (n1:Person)-[r:REVIEWED]->(n2:Movie)
set r.begin_datetime = (n2.released - 1970) * 31536000000 + round(RAND() * 3) * 31536000000,
r.end_datetime = (2050 - 1970) * 31536000000

// // assign start and end time to a node by covering start and end times of all its edges
// match (n1) 
// with collect(id(n1)) as node_ids
// unwind node_ids as curr_id
//   match (n)-[r]-()
//   where id(n) = curr_id 
//   WITH n, MIN(r.begin_datetime) as minStart, MAX(r.end_datetime) as maxEnd 
//   set n.begin_datetime = minStart - 10000,
//   n.end_datetime = maxEnd + 10000

// check if a node start-end time cover its edges
match(n1)-[r]-(n2)
with n1, MIN(r.begin_datetime) as minStart, AVG(r.begin_datetime) as avgStart
, MAX(r.end_datetime) as maxEnd, AVG(r.end_datetime) as avgEnd
return n1.begin_datetime, minStart, maxEnd, n1.end_datetime, avgStart, avgEnd 
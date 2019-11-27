// python scripts used to generate CQL
// ----------------------------------------- start of python script --------------------------------------------
// # movie_id2title = {}

// # with open('movie_node.csv') as f:
// #   i = 0
// #   for l in f.readlines():
// #     i = i + 1
// #     if i == 1:
// #       continue
// #     arr = l.split(';')
// #     movie_id2title[arr[0]] = arr[1].replace('\n', '')
// #   print (movie_id2title)

// # print ('\n-----------------------------------------------------------------------------------\n')
// # genre_id2txt = {}

// # with open('genre_node.csv') as f:
// #   i = 0
// #   for l in f.readlines():
// #     i = i + 1
// #     if i == 1:
// #       continue
// #     arr = l.split(';')
// #     genre_id2txt[arr[0]] = arr[1].replace('\n', '')
// #   print (genre_id2txt)

// # movie_id2_genre_id = {}

// # with open('has_genre_rels.csv') as f:
// #   i = 0
// #   for l in f.readlines():
// #     i = i + 1
// #     if i == 1:
// #       continue
// #     arr = l.split(';')
// #     movie_id2_genre_id[arr[0]] = arr[1].replace('\n', '')
// #   print (movie_id2_genre_id)


// import re
// movies = []

// with open('Nodes.csv') as f:
//   for l in f.readlines():
//     if 'title:' in l:
//       m = {}
//       arr = re.split(':|,', l)
//       i = 0
//       for v in arr:
//         if v == 'title':
//           m['t'] = arr[i+1]
//         if v == 'genre':
//           m['g'] = arr[i+1]
//         i = i + 1
//       movies.append(m)

// print(movies)

// with open('cql.txt', 'w') as f:
//   for m in movies:
//     f.write('MATCH (n:Movie{title: \'' + m['t']  + '\'}) SET n.genre = \'' + m['g'] + '\';\n')
// ----------------------------------------- end of python script --------------------------------------------

MATCH (n:Movie{title: 'The Matrix'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'The Matrix Reloaded'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'The Matrix Revolutions'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'The Devil\'s Advocate'}) SET n.genre = 'Thriller';
MATCH (n:Movie{title: 'A Few Good Men'}) SET n.genre = 'Crime';
MATCH (n:Movie{title: 'Top Gun'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'Jerry Maguire'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'Stand By Me'}) SET n.genre = 'Drama';
MATCH (n:Movie{title: 'As Good as It Gets'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'What Dreams May Come'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'Snow Falling on Cedars'}) SET n.genre = 'Drama';
MATCH (n:Movie{title: 'You\'ve Got Mail'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'Sleepless in Seattle'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'Joe Versus the Volcano'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'When Harry Met Sally'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'That Thing You Do'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'The Replacements'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'RescueDawn'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'The Birdcage'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'Unforgiven'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'Johnny Mnemonic'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'Cloud Atlas'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'The Da Vinci Code'}) SET n.genre = 'Drama';
MATCH (n:Movie{title: 'V for Vendetta'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'Speed Racer'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'Ninja Assassin'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'The Green Mile'}) SET n.genre = 'Crime';
MATCH (n:Movie{title: 'Frost/Nixon'}) SET n.genre = 'Drama';
MATCH (n:Movie{title: 'Hoffa'}) SET n.genre = 'Crime';
MATCH (n:Movie{title: 'Apollo 13'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'Twister'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'Cast Away'}) SET n.genre = 'Action';
MATCH (n:Movie{title: 'One Flew Over the Cuckoo\'s Nest'}) SET n.genre = 'Drama';
MATCH (n:Movie{title: 'Something\'s Gotta Give'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'Bicentennial Man'}) SET n.genre = 'Drama';
MATCH (n:Movie{title: 'Charlie Wilson\'s War'}) SET n.genre = 'Comedy';
MATCH (n:Movie{title: 'The Polar Express'}) SET n.genre = 'Adventure';
MATCH (n:Movie{title: 'A League of Their Own'}) SET n.genre = 'Comedy';

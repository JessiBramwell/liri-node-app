var hr = '-------------------------------------------------------------------------------------------------------------------------------------- \n'
require("dotenv").config();
var fs = require("fs");
var moment = require('moment');
var keys = require("./keys.js");
var axios = require("axios");
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var nodeArgs = process.argv;
var action = process.argv[2];
var media = '';

for (let i = 3; i < nodeArgs.length; i++) {
  if (i > 3 && nodeArgs.length) {
    media = media + "+" + nodeArgs[i]
  } else {
    media += nodeArgs[i]
  }
}

switch (action) {
  case "concert-this":
    concertQuery(media)
    break;
  case "spotify-this-song":
    spotifyQuery(media)
    break;
  case "movie-this":
    movieQuery(media)
    break;
  case "do-what-it-says":
    readArg()
    break;
  default:
    console.log("that is not an approved request");
}

function movieQuery(media) {
  if (media === "") {
    media = "Mr. Nobody"
  }
  var queryUrl = `http://www.omdbapi.com/?t=${media}&y=&plot=short&apikey=trilogy`;
  axios.get(queryUrl).then(
    function (response) {
      var data = response.data;
      var output = {
        top: hr,
        title: `${data.Title} (${data.Rated}) \n`,
        plot: `Plot: ${data.Plot} \n`,
        cast: `Cast: ${data.Actors} \n`,
        meta: `Year: ${data.Year} | ${data.Country} | ${data.Language} | Ratings: imdb - ${data.imdbRating}, Rotten Tomatoes - ${data.Ratings[1].Value} \n`,
        bottom: hr,
      }

      for (var prop in output) {
        console.log(output[prop])
        append(output[prop])
      }
    }
  );
}

function concertQuery(media) {
  var queryUrl = `https://rest.bandsintown.com/artists/${media}/events?app_id=codingbootcamp`
  axios.get(queryUrl).then(
    function (response) {
      var data = response.data
      var lineup = []

      if (!Array.isArray(data) || !data.length) {
        console.log(`There are no concerts showing for ${capitalize(media)}`)
        console.log("--")
      } else {
        capitalize(media)
        for (let i = 0; i < 5; i++) {
          lineup = data[i].lineup[0]
          var output = {
            event: `${lineup} @ ${data[i].venue.name} | ${data[i].venue.city}, ${data[i].venue.region} | ${moment(data[i].datetime).format("dddd, MMMM Do, h:mm a")} \n`,
          }

          for (var prop in output) {
            console.log(output[prop])
            append(output[prop])
          }
        }
        console.log(hr)
        append(hr)
      }
    }
  );
}

function spotifyQuery(media) {
  if (!media) {
    media = "The Sign, Ace of Base"
  }
  spotify.search({ type: 'track', query: media, }, function (err, data) {
    var data = data.tracks.items;

    if (err) {
      return console.log('Error occurred: ' + err);
    } else {
      capitalize(media)
      for (let i = 0; i < 5; i++) {
        var output = {
          track: `${data[i].name} | ${data[i].album.artists[0].name}, ${data[i].album.name} | ${data[i].external_urls.spotify} \n`,
        }

        for (var prop in output) {
          console.log(output[prop])
          append(output[prop])
        }
      }
      console.log(hr)
      append(hr)
    }
  });
}

function readArg() {
  fs.readFile("random.txt", 'utf8', function (err, data) {
    if(err) {
      return console.log(error);
    } else {
      console.log(data)
      process.argv[2] = data
    }
  })
}

function append(output) {
  fs.appendFile("log.txt", output, function (err) {
    if (err) {
      console.log(err);
    }
  })
}

function capitalize(str) {
  if (str.includes("+")) {
    str = str.split("+");
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i][0].toUpperCase() + str[i].slice(1);
    }
    str = str.join(" ")
  } else {
    str = str[0].toUpperCase() + str.slice(1)
  }
  console.log(`Search results for: ${str} \n`)
  append(hr)
  return str
}
// .`node liri.js do-what-it-says`

// take screengrabs and video of operational app
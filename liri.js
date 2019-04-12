require('dotenv').config();
var fs = require('fs');
var moment = require('moment');
var keys = require('./keys.js');
var axios = require('axios');
var inquirer = require('inquirer')
var chalk = require('chalk');
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var output = {}

inquirer
  .prompt([
    {
      type: 'list',
      message: 'What would you like to search for?',
      choices: ['Concerts', 'A Song on Spotify', 'Movie Details'/*, 'Surpise me'*/],
      name: 'action',
    },
    {
      type: 'input',
      message: 'Search:',
      name: 'media'
    }
  ]).then(function (resp) {
    if (resp) {
      switch (resp.action) {
        case 'Concerts':
          concertQuery(resp.media)
          break;
        case 'A Song on Spotify':
          spotifyQuery(resp.media)
          break;
        case 'Movie Details':
          movieQuery(resp.media)
          break;
        default:
          console.log("that is not an approved request");
      }
    }
  });

function movieQuery(media) {

  if (media === "") {
    media = "Mr. Nobody"
  }
  var queryUrl = `http://www.omdbapi.com/?t=${media}&y=&plot=short&apikey=trilogy`;
  axios.get(queryUrl).then(
    function (response) {
      var data = response.data;

      if (!Array.isArray(data) || !data.length) {
        console.log(chalk.red(`There are no movies showing for: ${capitalize(media)}`))
      } else {
        output = {
          title: `${data.Title} (${data.Rated}) \n`,
          plot: `Plot: ${data.Plot} \n`,
          cast: `Cast: ${data.Actors} \n`,
          meta: `Year: ${data.Year} | ${data.Country} | ${data.Language} | Ratings: imdb - ${data.imdbRating}, Rotten Tomatoes - ${data.Ratings[1].Value} \n`,
        }
        append(output)
      }
    });
}

function concertQuery(media) {

  var queryUrl = `https://rest.bandsintown.com/artists/${media}/events?app_id=codingbootcamp`
  axios.get(queryUrl).then(
    function (response) {
      var location, result
      var data = response.data

      if (!Array.isArray(data) || !data.length) {
        console.log(chalk.red(`There are no concerts showing for: ${capitalize(media)}`))

      } else {
        capitalize(media)
        output.result = []
        for (let i = 0; i < 5; i++) {
          output.name = data[i].lineup[0]

          if (!data[i].venue.region) {
            location = data[i].venue.country
          } else {
            location = data[i].venue.region
          }

          result = `@ ${data[i].venue.name} | ${data[i].venue.city}, ${location} | ${moment(data[i].datetime).format("dddd, MMMM Do, h:mm a")} \n`

          output.result.push(result)
        }
        append(output)
      }
    }
  )
}

function spotifyQuery(media) {

  if (!media) {
    media = "The Sign, Ace of Base"
  }
  spotify.search({ type: 'track', query: media, limit: 5 }, function (err, response) {
    var data, result

    if (err) {
      return console.log('Error occurred: ' + err);
    } else {
      output.name = capitalize(media)
      output.result = []
      for (let i = 0; i < 5; i++) {
        data = response.tracks.items[i];

        result = `${data.name} | ${data.album.artists[0].name}, ${data.album.name} | ${data.external_urls.spotify} \n`
        output.result.push(result)
      }
      append(output)
    }
  });
}

function readQuery() {
  fs.readFile("random.txt", 'utf8', function (err, data) {
    if (err) {
      return console.log(error);
    } else {
      console.log(data)
      data = data.replace(/['"]+/g, '')
      var readArray = data.split(',')
      console.log(readArray)
      action = readArray[0]
      media = readArray[1]
      return media
    }
  });
}

function append(output) {
  var entry
  var str = '\n'
  var timeStamp = moment().format('dddd, MMMM Do, h:mm a') + '\n';
  var hr = '======================================================================== \n';

  if (output.name && output.result) {
    str = '\n' + output.name + '\n'

    output.result.forEach(el => {
      str += el
    });
  } else {
    for (var prop in output) {
      str += output[prop]
    }
  }

  entry = hr.concat(str, hr)
  console.log(chalk.green(entry));

  fs.appendFile("log.txt", timeStamp.concat(entry), function (err) {
    if (err) {
      console.log(err);
    }
  });
}


function capitalize(str) {
  if (str.includes(" ")) {
    str = str.split(" ");
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i][0].toUpperCase() + str[i].slice(1);
    }
    str = str.join(" ")
  } else {
    str = str[0].toUpperCase() + str.slice(1)
  }
  console.log(chalk.bold(`Search results for: ${chalk.cyan(str)} \n`))
  return str
}
// .`node liri.js do-what-it-says`

// take screengrabs and video of operational app

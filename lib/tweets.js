const Twit = require('twit')

const config = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
}

const twitter = new Twit(config)

exports.getTweets = () => {
  const tweets = []
  const statuses = twitter.stream('statuses/sample')

  return new Promise((resolve, reject) => {
    statuses.on('tweet', tweet => {
      if (tweet.lang !== 'en') {
        return
      }
      tweets.push(tweet.text)
      if (tweets.length === 10) {
        statuses.stop()
        resolve(tweets)
      }
    })
  })
}

exports.tweet = status => {
  return new Promise((resolve, reject) => {
    twitter.post('statuses/update', { status }, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

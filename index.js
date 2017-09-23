const { getTweets, tweet } = require('./lib/tweets')
const { analyse } = require('./lib/analyse')
const tcom = require('thesaurus-com')

const PromiseWhile = require('promise-while')(Promise)

const formatTweets = tweets => {
  const documents = tweets.map((tweet, index) => ({
    id: `${index}`,
    text: tweet,
    language: 'en'
  }))
  return { documents }
}

const combine = parts => parts.tweets.documents.reduce((index, doc) => {
  const score = parts.sentiment.documents
    .find(sent => sent.id === doc.id).score

  const keyPhrases = parts.keyPhrases.documents
    .find(key => key.id === doc.id).keyPhrases

  const isPositive = score >= 0.5

  if (isPositive) {
    return index
  }

  if (doc.text.startsWith('RT')) {
    return index
  }

  return index.concat({
    tweet: doc.text,
    isPositive,
    keyPhrases
  })
}, [])

let tweets = []

const go = () => getTweets()
  .then(formatTweets)
  .then(analyse)
  .then(combine)

const condition = () => {
  console.log('looking for more')
  return !(tweets.length)
}
const next = () => go().then(res => {
  tweets = tweets.concat(res)
})

const goodTimes = tweets => tweets.reduce((str, tweet) => {
  let good = '' + tweet.tweet
  const positives = tweet.keyPhrases.map(phrase => {
    const res = tcom.search(phrase)
    return res.antonyms.length ? res.antonyms[0] : 'love'
  })

  tweet.keyPhrases.forEach((phrase, index) => {
    good = good.replace(phrase, positives[index])
  })

  return good
}, '')

PromiseWhile(condition, next)
  .then(() => {
    const res = goodTimes(tweets)
    const ok = res + ' #peaceday'
    console.log('tweeting', ok)
    return tweet(ok)
  })
  .then(() => process.exit())

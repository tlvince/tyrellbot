const { post, asJson } = require('simple-get-promise')

const url = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0'

const getSentiment = defaults => {
  const params = Object.assign({}, defaults, { url: `${url}/sentiment`})
  return post(params)
    .then(asJson)
}

const getKeyPhrases = defaults => {
  const params = Object.assign({}, defaults, { url: `${url}/keyPhrases`})
  return post(params).then(asJson)
}

exports.analyse = tweets => {
  const params = {
    body: JSON.stringify(tweets),
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.AZURE_TEXT_ANALYTICS_KEY
    }
  }

  const promises = [
    getSentiment(params),
    getKeyPhrases(params),
  ]

  return Promise.all(promises)
    .then(([sentiment, keyPhrases]) => ({ tweets, sentiment, keyPhrases }))
}

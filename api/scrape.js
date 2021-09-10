const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const got = require('got')
const { json, send } = require('micri');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('content-type', 'application/json; charset=utf-8')
  
  const targetUrl = req.query.url;
  
  const { body: html, url } = await got(targetUrl)
  
  const metadata = await metascraper({ html, url })
      
  await send(res, 200, JSON.stringify(metadata, null, 2))

}
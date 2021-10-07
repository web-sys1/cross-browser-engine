const mql = require('@microlink/mql')

const got = require('got')
const { json, send } = require('micri');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('content-type', 'application/json; charset=utf-8')
  
  const targetUrl = req.query.url;
  
  const { status, data, response } = await mql(targetUrl, {
    insights: {
      technologies: true,
    },
  })
        
  await send(res, 200, JSON.stringify(data, null, 2))

}

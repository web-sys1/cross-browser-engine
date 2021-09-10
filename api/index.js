const { send } = require('micri');


module.exports = async (req, res) => {
      
  await send(res, 403, 'No such API')

}
// const search = require('./search')
const { getChatGPTResponse } = require('./chatGpt')

async function miFuncion() {
    const response = await getChatGPTResponse('10 nombres de gatitos.')
    console.log(response)
}
miFuncion()
  
module.exports = { miFuncion };
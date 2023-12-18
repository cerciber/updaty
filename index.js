const { searchOnGoogle } = require('./search')
const { getChatGPTResponse } = require('./chatGpt')

const LIMIT_GOOGLE_RESULTS = 3
const RESPONSE_IA_ITERATIONS = 1

async function getDataFromInternet(text) {
    // Get data from google
    const responseSearches = await searchOnGoogle(text, LIMIT_GOOGLE_RESULTS)
    if (responseSearches.message.length === 0) {
        return undefined
    }

    // Get prompts results from each result
    console.log("Getting ChatGPT responses...")
    const responsesChatGPT = []
    for (const responseSearch of responseSearches.message) {
        for (let i = 0; i < RESPONSE_IA_ITERATIONS; i++) {
            const finalPromt = "Buscame '" + text + "'En el siguiente texto:\n\n" + responseSearch 
            const responseChatGPT = await getChatGPTResponse(finalPromt)
            if (responseChatGPT.sucess) {
                responsesChatGPT.push(responseChatGPT.message)
            }
        }
    }

    // Get promt conclution
    console.log("Getting conclusion...")
    let conclutionPrompt = "Con base en las siguientes respuestas dame el resultado para '" + text + "'\n"
    let cont = 1
    for (const responseChatGPT of responsesChatGPT) {
        conclutionPrompt += cont++ + ". " + responseChatGPT + "\n\n"
    }
    let responseChatGPT = await getChatGPTResponse(conclutionPrompt)
    return responseChatGPT.message
}

getDataFromInternet('Dame el siguiente festivo de colombia dado que hoy es 18-dic-2023').then(response => {
    console.log(response)
})

module.exports = { getDataFromInternet };
const { searchOnGoogle } = require('./search')
const { getChatGPTResponse } = require('./chatGpt')

const LIMIT_GOOGLE_RESULTS = 3
const PAGE_CHARACTERS_LIMIT = 10000
const IA_ITERATIONS_PER_PAGE = 1
const IA_ITERATIONS_ON_BAD_FORMAT = 20

async function getDataFromInternet(search, promt, format, markups) {
    // Get data from google
    const responseSearches = await searchOnGoogle(search, markups, LIMIT_GOOGLE_RESULTS, PAGE_CHARACTERS_LIMIT)
    if (responseSearches.message.length === 0) {
        return undefined
    }

    // Get prompts results from each result
    console.log("Getting ChatGPT responses...")
    const responsesChatGPT = []
    for (const responseSearch of responseSearches.message) {
        for (let i = 0; i < IA_ITERATIONS_PER_PAGE; i++) {
            const finalPromt = "Buscame '" + promt + "'En el siguiente texto:\n\n" + responseSearch.result
            const responseChatGPT = await getChatGPTResponse(finalPromt)
            if (responseChatGPT.sucess) {
                responsesChatGPT.push(responseChatGPT.message)
                console.log("  - Response getted to: " + responseSearch.url)
            }
        }
    }

    // Get promt conclution
    console.log("Getting conclusion...")
    let conclutionPrompt = "Con base en las siguientes respuestas dame un único resultado para '" + promt + "'\n"
    let cont = 1
    for (const responseChatGPT of responsesChatGPT) {
        conclutionPrompt += cont++ + ". " + responseChatGPT + "\n\n"
    }
    let conclusionResponseChatGPT = await getChatGPTResponse(conclutionPrompt)
    console.log("  - Conclusion: " + conclusionResponseChatGPT.message)

    // Get fromat answer
    let answer = undefined
    for (let i = 0; i < IA_ITERATIONS_ON_BAD_FORMAT; i++) {
        let onlyAnswerResponseChatGPT = await getChatGPTResponse("Dame esta información \n\n " + conclusionResponseChatGPT.message + "\n\n en un JSON como este \n\n { \"result\": \"" + format + "\" } \n\n Solo dame el resultado sin ninguna palabra mas.")
        console.log("  - Format Answer intent " +  (i+ 1) + ": " + onlyAnswerResponseChatGPT.message.replace(/[\n\r]/g, ""))
        try {
            const json_obj = JSON.parse(onlyAnswerResponseChatGPT.message)
            answer = json_obj.result
            if (answer !== undefined) {
                break
            }
        } catch (error) {
            try {
                const regex = /{\s*"result"\s*:\s*[^]*\s*}/g
                const json_obj = JSON.parse(regex.exec(onlyAnswerResponseChatGPT.message)[0])
                answer = json_obj.result
                if (answer !== undefined) {
                    break
                }
            } catch (error) {}
        }
    }

    return answer
}

getDataFromInternet('dolar en pesos colombianos hoy', '1 dolar en peso colombiano hoy', 'number', ['main', 'body']).then(response => {
    console.log("#########################")
    console.log("Result: " + response)
    console.log("#########################")
})

module.exports = { getDataFromInternet };
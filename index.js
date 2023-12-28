const { searchOnGoogle } = require('./search')
const { getChatGPTResponse } = require('./chatGpt')

async function getDataFromInternet({ 
    search, 
    promt, 
    format = 'string', 
    markups = ['main', 'body'], 
    config  = {}
}) {

    // Defaults to config
    config  = {
        LIMIT_GOOGLE_RESULTS: 10,
        PAGE_CHARACTERS_LIMIT: 10000,
        IA_ITERATIONS_PER_PAGE: 2,
        IA_ITERATIONS_ON_BAD_FORMAT: 50,
        LOGS: false,
        ...config
    }

    // Get data from google
    const responseSearches = await searchOnGoogle(
        search, 
        markups, 
        config.LIMIT_GOOGLE_RESULTS, 
        config.PAGE_CHARACTERS_LIMIT,
        config.LOGS
    )
    if (responseSearches.message.length === 0) {
        return undefined
    }

    // Get prompts results from each result
    if (config.LOGS) {
        console.log("Getting ChatGPT responses...")
    }
    const responsesChatGPT = []
    for (const responseSearch of responseSearches.message) {
        for (let i = 0; i < config.IA_ITERATIONS_PER_PAGE; i++) {
            const finalPromt = "Buscame '" + promt + "' solo basado en el siguiente texto:\n\n" + responseSearch.result + "'\n\nSi no encuentras nada devuelve undefined"
            const responseChatGPT = await getChatGPTResponse(finalPromt)
            if (responseChatGPT.sucess) {
                responsesChatGPT.push(responseChatGPT.message)
                if (config.LOGS) {
                    console.log("  - Response getted to: " + responseSearch.url)
                    console.log("      - " + responseChatGPT.message)
                }
            }
        }
    }

    let answer = undefined
    for (let i = 0; i < config.IA_ITERATIONS_ON_BAD_FORMAT; i++) {

        // Get promt conclution
        if (config.LOGS) {
            console.log("Getting conclusion...")
        }
        let conclutionPrompt = "Sólo con base en las siguientes respuestas dame el resultado mas probable para '" + promt + "'\n\nSi no encuentras nada devuelve undefined \n\n Dame el resultado en el en un JSON como este \n\n { \"result\": " + format + " } \n\nSi no encuentras un resultado específico devuelve undefined en el return, no puedes poner nada mas en el return si no es el dato resultante solicitado."
        let cont = 1
        for (const responseChatGPT of responsesChatGPT) {
            conclutionPrompt += cont++ + ". " + responseChatGPT + "\n\n"
        }
        let conclusionResponseChatGPT = await getChatGPTResponse(conclutionPrompt)
        if (config.LOGS) {
            console.log("  - Conclusion intent: " +  (i+ 1) + ": " + conclusionResponseChatGPT.message.replace(/[\n\r]/g, ""))
        }

        // Find result
        try {
            const regex = /{\s*"result"\s*:\s*[^]*\s*}/g
            const json_obj = JSON.parse(regex.exec(conclusionResponseChatGPT.message)[0])
            answer = json_obj.result
            if (answer !== undefined && answer !== "undefined") {
                break
            }
        } catch (error) {}
    }

    return answer
}


// getDataFromInternet({
//         search: 'Presidente de Colombia', 
//         promt: 'Primer Nombre del presidente actual de Colombia', 
//         format: 'string', 
//         markups: ['main', 'body'],
//         config: {
//             LIMIT_GOOGLE_RESULTS: 10,
//             PAGE_CHARACTERS_LIMIT: 10000,
//             IA_ITERATIONS_PER_PAGE: 1,
//             IA_ITERATIONS_ON_BAD_FORMAT: 20,
//             LOGS: true
//         }
// }).then(response => {
//     console.log("#########################")
//     console.log("Result: " + response)
//     console.log("#########################")
// })

getDataFromInternet({
    search: 'asesino de canserbero', 
    promt: 'Quien mató a cancerbero?',
    format: 'string del nombre del asesino',
    config: {
        LOGS: true
    }
}).then(response => {
console.log("#########################")
console.log("Result: " + response)
console.log("#########################")
})

module.exports = { getDataFromInternet };
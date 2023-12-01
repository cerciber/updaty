const OpenAI  = require('openai');
const axios = require("axios");

const free = true

async function freeChatGPT(promt) {
    const endpoint =
    "https://us-central1-chat-for-chatgpt.cloudfunctions.net/basicUserRequestBeta";

    const text = promt;

    if (!text) {
        return {
            sucess: false,
            message: 'Empty text'
        }
    }

    try {
        const response = await axios.post(
            endpoint,
            {
                data: {
                    message: text,
                },
            },
            {
                headers: {
                    Host: "us-central1-chat-for-chatgpt.cloudfunctions.net",
                    Connection: "keep-alive",
                    Accept: "*/*",
                    "User-Agent":
                        "com.tappz.aichat/1.2.2 iPhone/16.3.1 hw/iPhone12_5",
                    "Accept-Language": "en",
                    "Content-Type": "application/json; charset=UTF-8",
                },
            }
        );

        const result = response.data.result.choices[0].text;
        return {
            sucess: true,
            message: result
        }
    } catch (error) {
        console.log(error)
        return {
            sucess: false,
            message: 'Error connecting to openai'
        }
    }
}

async function paymentChatGPT(promt) {
  const openai = new OpenAI({
    apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
  });

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: promt }],
    model: 'gpt-3.5-turbo',
  });
  return {
    sucess: true,
    message: chatCompletion
}
}

async function getChatGPTResponse(promt) {
  if (free) {
    return freeChatGPT(promt)
  } else {
    return paymentChatGPT(promt)
  }
}

module.exports = { getChatGPTResponse }
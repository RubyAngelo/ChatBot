// ====== Configuration ======
let _config = {
    openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
    openAI_model: "gpt-4o-mini",
    ai_instruction: `You are a JavaScript quiz teacher.
First, ask one JavaScript question at a time.
When the user answers, check if their answer is correct or wrong.
If correct, reply: "✅ Correct!" and give a short explanation.
If wrong, reply: "❌ Incorrect." and give the correct answer with a short explanation.
Keep your responses in simple HTML format using <p> and <b> tags only.
Do not use markdown or code blocks.`,
    response_id: "",
};

// ====== HTML Elements ======
const chatBox = document.querySelector('.chat-box');
const inputField = chatBox.querySelector('input[type="text"]');
const button = chatBox.querySelector('button');
const chatBoxBody = chatBox.querySelector('.chat-box-body');

// ====== Event Listeners ======
button.addEventListener('click', sendMessage);
inputField.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// ====== Send Message to Chatbot ======
async function sendMessage() {
    const message = inputField.value.trim();
    if (message === '') return;

    // Display user message
    inputField.value = '';
    chatBoxBody.innerHTML += `<div class="message">${message}</div>`;
    scrollToBottom();

    // Send to AI model
    try {
        const reply = await sendOpenAIRequest(message);
        chatBoxBody.innerHTML += `<div class="response">${reply}</div>`;
        scrollToBottom();
    } catch (error) {
        console.error('Error:', error);
        chatBoxBody.innerHTML += `<div class="response">⚠️ Error connecting to AI server.</div>`;
        scrollToBottom();
    }
}

// ====== Function to Call Your Azure API ======
async function sendOpenAIRequest(text) {
    let requestBody = {
        model: _config.openAI_model,
        input: text,
        instructions: _config.ai_instruction,
        previous_response_id: _config.response_id,
    };

    // If it's the first message, no previous response ID
    if (_config.response_id.length === 0) {
        requestBody = {
            model: _config.openAI_model,
            input: text,
            instructions: _config.ai_instruction,
        };
    }

    try {
        const response = await fetch(_config.openAI_api, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        // Extract model output
        let output = data.output[0].content[0].text;
        _config.response_id = data.id;

        return output;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw error;
    }
}

// ====== Auto Scroll ======
function scrollToBottom() {
    chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
}

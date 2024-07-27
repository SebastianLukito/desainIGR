document.addEventListener('DOMContentLoaded', function () {
    const askBtn = document.getElementById('ask-btn');
    const userQuestionInput = document.getElementById('user-question');
    const chatHistory = document.getElementById('chat-history');
    const systemPromptInput = document.getElementById('system-prompt');
    // const modelSelect = document.getElementById('model'); // Hapus ini
    // const memoryLengthInput = document.getElementById('memory-length'); // Hapus ini
    // const loadingPopup = document.getElementById('loading-popup'); // Hapus ini

    askBtn.addEventListener('click', async function () {
        const userQuestion = userQuestionInput.value;
        if (!userQuestion) {
            alert('Please ask a question.');
            return;
        }
        
        const systemPrompt = systemPromptInput.value;
        const model = 'llama3-8b-8192'; // Set default model
        const memoryLength = '10'; // Set default memory length to maximum

        try {
            const response = await getGroqChatCompletion(userQuestion, systemPrompt, model);
            addMessageToHistory(userQuestion, 'user');
            addMessageToHistory(response, 'bot');
        } catch (error) {
            console.error('Error calling Groq API:', error);
            alert('Error calling Groq API. Please try again.');
        } finally {
            userQuestionInput.value = '';  // Clear the input field
        }
    });

    function addMessageToHistory(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = sender === 'user' ? `You: ${message}` : `Chatbot: ${message}`;
        chatHistory.appendChild(messageElement);

        // Scroll to the bottom of the chat history
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function getGroqChatCompletion(userQuestion, systemPrompt, model) {
        const apiKey = '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';
        const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

        const payload = {
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userQuestion }
            ]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Network response was not ok: ${response.statusText}. ${errorData.message || ''}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "No response from the API";
    }
});

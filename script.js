// Constants for the API endpoints
const API_BASE_URL = 'https://optic-api.fly.dev';
const LLaVA_ENDPOINT = `${API_BASE_URL}/chat-with-image-test`;
const DOWNLOAD_ENDPOINT = `${API_BASE_URL}/download/`;
const GPT4_ENDPOINT = `${API_BASE_URL}/chat-with-image-gpt4`;

document.getElementById('imageUploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    setLoading(true);

    const endpointChoice = document.getElementById('endpoint').value;

    try {
        const response = await postImage(endpointChoice === 'gpt4');
        displayResponse(response);
    } catch (error) {
        console.error('There was an error:', error.message);
    } finally {
        setLoading(false);
    }
});

async function postImage(isGPT4) {
    const formData = new FormData();
    const fileInput = document.getElementById('image');
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    const endpoint = isGPT4 ? GPT4_ENDPOINT : LLaVA_ENDPOINT;
    const url = new URL(endpoint);

    const prompt = document.getElementById('prompt').value;
    url.searchParams.append('prompt', prompt);

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Server responded with an error: ${response.statusText}`);
    }

    return isGPT4 ? response.blob() : response.json();
}

function displayResponse(response) {
    const responseArea = document.getElementById('responseArea');

    if (response instanceof Blob) {
        const audioUrl = URL.createObjectURL(response);
        responseArea.innerHTML = generateAudioPlayerHTML(audioUrl);
    } else {
        responseArea.innerHTML = generateTextAndAudioHTML(response);
    }
}

function generateAudioPlayerHTML(audioUrl) {
    return `
        <p><strong>Audio:</strong></p>
        <audio controls>
            <source src="${audioUrl}" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    `;
}

function generateTextAndAudioHTML(data) {
    const audioUrl = `${DOWNLOAD_ENDPOINT}${data.audio_url}`;
    return `
        <p><strong>Original Text:</strong> ${data.text}</p>
        <p><strong>Translated Text:</strong> ${data.translated_text}</p>
        ${generateAudioPlayerHTML(audioUrl)}
    `;
}

function setLoading(isLoading) {
    const submitButton = document.getElementById('submit');
    submitButton.value = isLoading ? 'Uploading...' : 'Chat with Image';
    submitButton.disabled = isLoading;
}

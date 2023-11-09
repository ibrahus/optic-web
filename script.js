// Constants for the API endpoints
const API_BASE_URL = 'https://optic-api.fly.dev';
const CHAT_WITH_IMAGE_ENDPOINT = `${API_BASE_URL}/chat-with-image-test`;
const DOWNLOAD_ENDPOINT = `${API_BASE_URL}/download/`;

document.getElementById('imageUploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    setLoading(true);

    try {
        const formData = createFormData();
        const data = await postImage(formData);
        const audioBlob = await fetchAudio(data.audio_url);
        displayResponse(URL.createObjectURL(audioBlob), data.text, data.translated_text);
    } catch (error) {
        console.error('There was an error!', error);
    } finally {
        setLoading(false);
    }
});

function createFormData() {
    const formData = new FormData();
    formData.append('file', document.getElementById('image').files[0]);
    formData.append('prompt', document.getElementById('prompt').value);
    return formData;
}

async function postImage(formData) {
    const response = await fetch(CHAT_WITH_IMAGE_ENDPOINT, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error('Server responded with an error!');
    return response.json();
}

async function fetchAudio(audioPath) {
    const response = await fetch(`${DOWNLOAD_ENDPOINT}${audioPath}`);
    if (!response.ok) throw new Error('Audio download failed!');
    return response.blob();
}

function displayResponse(audioUrl, text, translatedText) {
    const responseArea = document.getElementById('responseArea');
    responseArea.innerHTML = `
        <p><strong>Original Text:</strong> ${text}</p>
        <p><strong>Translated Text:</strong> ${translatedText}</p>
        <audio controls>
            <source src="${audioUrl}" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    `;
}

function setLoading(isLoading) {
    const submitButton = document.getElementById('submit');
    submitButton.value = isLoading ? 'Uploading...' : 'Chat with Image';
    submitButton.disabled = isLoading;
}

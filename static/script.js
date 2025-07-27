const socket = io();
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const statusDiv = document.getElementById('status');
const typingIndicator = document.getElementById('typingIndicator');

let isGenerating = false;
let currentResponse = '';

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// Handle Enter key
messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

socket.on('connect', function() {
    statusDiv.textContent = 'Connected';
    statusDiv.className = 'status connected';
});

socket.on('disconnect', function() {
    statusDiv.textContent = 'Disconnected';
    statusDiv.className = 'status';
});

socket.on('response_start', function() {
    isGenerating = true;
    currentResponse = '';
    sendButton.disabled = true;
    statusDiv.textContent = 'Generating response...';
    statusDiv.className = 'status generating';
    typingIndicator.classList.remove('show');
    
    // Add empty assistant message
    addMessage('', 'assistant', true);
});

socket.on('response_chunk', function(data) {
    currentResponse += data.content;
    updateLastMessage(currentResponse);
});

socket.on('response_end', function() {
    isGenerating = false;
    sendButton.disabled = false;
    statusDiv.textContent = 'Connected';
    statusDiv.className = 'status connected';
    messageInput.focus();
});

socket.on('error', function(data) {
    isGenerating = false;
    sendButton.disabled = false;
    statusDiv.textContent = 'Error: ' + data.message;
    statusDiv.className = 'status';
    addMessage('Error: ' + data.message, 'assistant');
});

socket.on('history_loaded', function(data) {
    messagesDiv.innerHTML = '';
    data.history.forEach(msg => {
        addMessage(msg.content, msg.role, false, msg.timestamp);
    });
});

function sendMessage() {
    if (isGenerating) return;
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    typingIndicator.classList.add('show');
    scrollToBottom();
    
    socket.emit('send_message', {message: message});
}

function addMessage(content, role, isStreaming = false, timestamp = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const time = timestamp || new Date().toLocaleTimeString();

    // Only assign id if this is a streaming assistant message and no other streaming message exists
    if (isStreaming) {
        // Remove any existing streaming-message id
        const prevStreaming = document.getElementById('streaming-message');
        if (prevStreaming) prevStreaming.removeAttribute('id');
        messageDiv.innerHTML = `
            <div class="message-content" id="streaming-message">${formatMessage(content)}</div>
            <div class="message-time">${time}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">${formatMessage(content)}</div>
            <div class="message-time">${time}</div>
        `;
    }

    messagesDiv.appendChild(messageDiv);
    scrollToBottom();
}

function updateLastMessage(content) {
    // Only update the latest streaming assistant message
    const streamingMessage = document.getElementById('streaming-message');
    if (streamingMessage) {
        streamingMessage.innerHTML = formatMessage(content);
        scrollToBottom();
    }
}

function formatMessage(text) {
    return text.replace(/\n/g, '<br>');
}

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function clearHistory() {
    if (confirm('Clear conversation history?')) {
        socket.emit('clear_history');
        messagesDiv.innerHTML = '';
    }
}

// Load history on page load
socket.emit('get_history');

// Focus input on load
window.onload = function() {
    messageInput.focus();
};
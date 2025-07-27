from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import requests
import json
import threading
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "mistral:latest" # Change to model that you want to use

# Create to store conversation history
conversation_history = []

@app.route('/')
def index():
    return render_template('index.html', model_name = MODEL_NAME)

@socketio.on('send_message')
def handle_message(data):
    user_message = data['message']
    timestamp = datetime.now().strftime("%H:%M:%S")
    
    # Add user message to history
    conversation_history.append({
        'role': 'user',
        'content': user_message,
        'timestamp' : timestamp
    })

    # Start response generation
    emit('response_start')

    # Start the generation in a new thread
    thread = threading.Thread(target=generate_response, args=(user_message,))
    thread.daemon = True
    thread.start()

def generate_response(user_message):
        try:
            # Prepare the request to Ollama
            payload = {
                "model": MODEL_NAME,
                "prompt": user_message,
                "stream": True,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 2048
                }
            }

            header = {"Content-Type": "application/json"}

            response = requests.post(OLLAMA_URL, headers=header, json=payload, stream=True)
            response.raise_for_status()

            full_response = ""

            for line in response.iter_lines():
                if line:
                    try:
                        json_response = json.loads(line.decode('utf-8'))

                        if 'response' in json_response:
                            chunk = json_response['response']
                            full_response += chunk

                            # Emit the chunk to the client 
                            socketio.emit('response_chunk', {'content': chunk})

                        # Check if generation is complete
                        if json_response.get('done', False):
                            break
                    
                    except json.JSONDecodeError:
                        continue
            
            # Add assistant response to history
            assistant_timestamp = datetime.now().strftime('%H:%M:%S')
            conversation_history.append({
                'role': 'assistant',
                'content': full_response,
                'timestamp': assistant_timestamp
            })

            # Signal completion
            socketio.emit('response_end')

        except requests.exceptions.RequestException as e:
            socketio.emit('error', {'message': f'Failed to connect Ollama: {str(e)}'})
        except Exception as e: 
            socketio.emit('error', {'message': f'Unexpected error: {str(e)}'})

@socketio.on('get_history')
def handle_get_history():
    emit('history_loaded', {'history': conversation_history})

@socketio.on('clear_history')
def handle_clear_history():
    global conversation_history
    conversation_history = []

if __name__ == '__main__':
    print("Starting Local LLM Chat Server...")
    print(f"Model: {MODEL_NAME}")
    print(f"Ollama URL: {OLLAMA_URL}")
    print("Open your browser to http://localhost:5000")
    
    socketio.run(app, debug=False, host='0.0.0.0', port=5000)
# Local LLM Chat Application

A real-time chat application that interfaces with Ollama to provide local LLM (Large Language Model) capabilities. Built with Flask, Socket.IO, and vanilla JavaScript.

## Features

- Real-time streaming responses
- Full conversation history
- Clean, responsive UI
- Support for markdown formatting
- Clear conversation history
- Mobile-friendly design

## Prerequisites

- Python 3.8+
- Ollama installed and running locally
- An LLM model loaded in Ollama (default: mistral)

## Installation

1. Clone the repository:
```
git clone https://github.com/TanvirMiah/ollama_chatbot.git
cd ollama_chatbot
```

2. Create a virtual environment and activate it:
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required dependencies:
```
pip install -r requirements.txt
```

## Configuration

The application can be configured by modifying the following variables in `app.py`:

```python
OLLAMA_URL = "http://localhost:11434/api/generate"  # Ollama API endpoint
MODEL_NAME = "mistral:latest"  # The LLM model to use
```

## Usage

1. Make sure Ollama is running and your chosen model is loaded:
```
ollama run mistral
```

2. Start the Flask application:
```sh
python app.py
```

3. Open your web browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── static/
│   ├── script.js      # Client-side JavaScript
│   └── stylesheet.css # Application styling
└── templates/
    └── index.html     # Main HTML template
```

## Technical Details

- **Backend**: Flask with Socket.IO for real-time communication
- **Frontend**: Vanilla JavaScript with Socket.IO client
- **API**: Interfaces with Ollama's API for LLM capabilities
- **Features**:
  - Streaming responses
  - Message history management
  - Real-time status updates
  - Error handling
  - Responsive design

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Check license file

## Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/)
- Uses [Socket.IO](https://socket.io/)
- Powered by [Ollama](https://ollama.ai/)
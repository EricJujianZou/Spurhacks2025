# Spurhacks2025 - Gemini API Content Analysis

## Project Overview
The Gemini API content analysis project is designed to analyze text input and return structured JSON output. This project serves as a tool for processing paragraphs of text, providing insights and data in a machine-readable format.

## Project Structure
```
Spurhacks2025
├── src
│   ├── text-feedback
│   │   ├── __init__.py
│   │   └── text_gemini.py
│   └── main.py
├── tests
│   ├── __init__.py
│   └── test_text_gemini.py
├── requirements.txt
└── README.md
```

## Setup Instructions
1. **Clone the Repository**: 
   Clone this repository to your local machine using:
   ```
   git clone <repository-url>
   ```

2. **Navigate to the Project Directory**:
   ```
   cd Spurhacks2025
   ```

3. **Install Dependencies**:
   Install the required libraries listed in `requirements.txt`:
   ```
   pip install -r requirements.txt
   ```

## Usage
1. **Run the Application**:
   Execute the main application script to start the API:
   ```
   python src/main.py
   ```

2. **Input Text**:
   Provide a paragraph of text when prompted.

3. **Receive JSON Output**:
   The application will return a JSON object containing the analysis of the input text.

## API Feature Details
- The API accepts a paragraph as input.
- It processes the text to extract relevant information and insights.
- The output is structured as a JSON object, which can be easily consumed by other applications or services.

## Testing
Unit tests are provided in the `tests` directory to ensure the functionality of the API. To run the tests, use:
```
pytest tests/test_text_gemini.py
```

## Contribution
Contributions to the project are welcome. Please submit a pull request with your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
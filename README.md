# MuseAIm Chat Agent
MuseAIm is an exhibit-specific museum guide chatbot designed for the Pacific Science Center in Seattle, Washington. The chat agent provides visitors with information about exhibits, answers their questions, and enhances their experience through interactive engagement. MuseAIm has a friendly, slightly silly personality and sometimes stutters or pauses to think, making interactions feel more lifelike.
## Features
- Exhibit-Specific Knowledge: MuseAIm is knowledgeable about the specific exhibit it is assigned to and can provide detailed information and fun facts.
- Interactive Engagement: MuseAIm engages visitors with scavenger hunts and leading questions to encourage exploration and learning.
- Context-Aware Responses: MuseAIm adapts its responses based on the specific exhibit context and the user's profile (e.g., age).
- Friendly Personality: MuseAIm maintains a friendly, respectful, and slightly silly demeanor to make interactions enjoyable for visitors of all ages.
## Getting Started
### Prerequisites
* Node.js
* npm
* OpenAI API Key
### Installation
1. Clone the repository:
```
git clone https://github.com/yourusername/museaim.git
cd museaim
```
2. Install dependencies:
```
npm install
```
3. Set up environment variables:
Create a .env file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key
ASSISTANT_API_KEY=your_assistant_api_key
ASSISTANT_ID=your_assistant_id
```
## Running the App
### Start the server:
1.
```
npm run dev
```
2. Open the app:
- Open a web browser and navigate to http://localhost:3000.
## File Structure
```
museaim/
├── node_modules/
├── public/
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   └── images/
│       └── underConstructionRobot.png
├── .env
├── package.json
└── server.js
```
## How It Works
Server Setup: The server.js file sets up an Express server and integrates Socket.IO for real-time communication between the client and the server.
API Integration: The server uses the OpenAI API to generate responses based on user inputs and contextual information about the exhibit and user.
Frontend: The frontend (located in the public directory) includes an HTML file for the user interface, CSS for styling, and JavaScript for handling user interactions and socket communication.
##Customization
General Instructions: The assistant's personality and general behavior are defined in the system message within the getAssistantResponse function in server.js.
Contextual Information: Context about the exhibit and user is dynamically added to each API call from the frontend.
##Contributing
Feel free to open issues or submit pull requests if you have suggestions for improvements or new features.
##License
This project is licensed under the MIT License.
___
MuseAIm is designed to enhance the educational experience at the Pacific Science Center by providing visitors with engaging and informative interactions. Enjoy exploring the exhibits with your new digital guide!

# PROMPTHERO: Advanced AI Prompt Engineering Tool

PROMPTHERO is a powerful AI prompt engineering tool that helps users create and refine high-quality prompts for various AI models. The latest update introduces a dedicated video prompt generation feature, enhancing the platform's capabilities.

## Core Features

### Text Prompt Engineering
- **Multiple Modes**: Basic, Quick, Deep, Few-Shot Examples, Chain-of-Thought
- **Customizable Tones**: Default, Formal, Friendly, Professional, Casual
- **Persona Selection**: None, Marketing Expert, Technical Writer, Teacher, Business Consultant
- **Output Formats**: Plain Text, Markdown, JSON

### NEW: Video Prompt Generation
Our specialized video prompt generator helps you create cinematic, detailed prompts optimized for AI video generation tools like Runway, Pika, and Sora.

#### Video Prompt Features
- **Camera Angle Selection**: Aerial/Drone, Eye Level, Low Angle, High Angle, Bird's Eye View, Dutch Angle
- **Lighting Options**: Natural Light, Golden Hour, Blue Hour, Studio Lighting, Low Key, High Key
- **Camera Movement**: Static, Pan, Tilt, Zoom, Dolly, Tracking Shot
- **Visual Styles**: Cinematic, Documentary, Vlog Style, Music Video, Anime, Vintage
- **Tone Selection**: Default, Dramatic, Dreamy, Gritty, Vibrant, Muted

## Use Cases

### Text Prompts
- Creating detailed instructions for chatbots and AI assistants
- Generating structured content creation prompts
- Designing educational prompts with examples
- Crafting reasoning-focused prompts that encourage step-by-step thinking

### Video Prompts
- Generating detailed scene descriptions for AI video tools
- Creating cinematic visual prompts with professional terminology
- Designing prompts for specific visual styles and aesthetics
- Crafting detailed camera and movement instructions for realistic results

## Getting Started

### Running Locally
1. Start the backend:
   ```
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python run.py
   ```

2. Start the frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```

3. Access the application at http://localhost:3000

## API Endpoints

- `/refine` - Generate refined text prompts
- `/explain` - Get explanations for prompts
- `/video` - Generate cinematic video prompts

## Performance Optimizations

PROMPTHERO includes several optimizations for better performance:
- Connection pooling for API calls
- Response caching with TTL
- Rate limiting to prevent abuse
- Comprehensive error handling
- Async/await implementation with proper timeouts

## Future Roadmap

- AI image prompt generation
- Prompt template library
- User accounts and saved prompts
- API access for developers
- Integration with more AI video generation tools 
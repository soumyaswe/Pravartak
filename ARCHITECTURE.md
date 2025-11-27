# Pravartak AI - Architecture Overview

## System Architecture Diagram

> **📊 Visual Diagram**: See `architecture-diagram.svg` for a professional, detailed architecture diagram with color-coded layers, component details, and connection flows.

### Text-Based Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            👤 USER LAYER                                    │
│         Job Seekers • Career Changers • Students • Professionals            │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              🌐 PRESENTATION LAYER - Frontend Application                  │
│         Next.js 15.5.3 • React 19 • Tailwind CSS • TypeScript              │
├─────────────────────────────────────────────────────────────────────────────┤
│  📄 Resume Builder    │  💬 AI Cover Letters  │  🎤 Interview Simulator    │
│  📊 Analytics         │  🗺️ Career Roadmap   │  🔍 CV Analyzer            │
└───────────────────────┬───────────────────────┬────────────────────────────┘
                        │                       │
                        ▼                       ▼
        ┌───────────────────────────┐  ┌──────────────────────────────┐
        │  ⚙️ APPLICATION LAYER     │  │  🤖 AI & CLOUD SERVICES      │
        │     Backend Services      │  │         Layer                │
        ├───────────────────────────┤  ├──────────────────────────────┤
        │ • Next.js API Routes      │  │ • Google Gemini AI          │
        │   (Serverless Functions)  │  │   - Content Generation      │
        │   - Resume Management     │  │   - Document Analysis       │
        │   - Cover Letter API      │  │   - Career Chat             │
        │   - CV Analyzer           │  │   - Recommendations         │
        │   - Career Chat           │  │                             │
        │                           │  │ • Google Cloud Platform    │
        │ • Python Flask Server     │  │   - Speech-to-Text API     │
        │   (Cloud Run Service)     │  │   - Text-to-Speech API      │
        │   - Real-time Interview   │  │   - Vertex AI Platform     │
        │   - Socket.IO WebSocket   │  │   - Cloud Run Deployment   │
        │   - Speech Processing     │  │                             │
        │   - Audio Generation       │  │                             │
        └──────────────┬──────────────┘  └──────────────┬───────────────┘
                       │                                 │
                       └───────────────┬───────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        💾 DATA & SECURITY LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database  │  Prisma ORM  │  Firebase Auth  │  Background Jobs │
│  (Cloud SQL)          │              │                 │  (Inngest)       │
│  • User Profiles      │  • Type-Safe │  • Google OAuth │  • Async Tasks   │
│  • Resumes & Docs     │  • Migrations │  • Email/Pass   │  • Scheduling    │
│  • Analytics          │  • Relations │  • Sessions     │  • Workflows     │
└─────────────────────────────────────────────────────────────────────────────┘

                    Deployed on Google Cloud Platform
                    Scalable • Secure • Production-Ready
```

## Architecture Layers

### 1. **User Layer** 👤
- **Target Users**: Job seekers, career changers, students, professionals, and recruiters
- **Access**: Web application accessible from any device

### 2. **Frontend Layer** 🌐
- **Technology**: Next.js 15.5.3 with React 19
- **Styling**: Tailwind CSS for modern, responsive design
- **Key Features**:
  - Resume Builder with ATS optimization
  - AI-powered Cover Letter Generator
  - Interactive Interview Simulator with 3D Avatar
  - Career Analytics Dashboard
  - Personalized Career Roadmap
  - CV Analysis Tool

### 3. **Backend Services** ⚙️
- **Next.js API Routes**: Serverless functions for core features
  - Resume and document management
  - Cover letter generation
  - CV analysis
  - Career chat interface
  
- **Python Flask Server**: Specialized service for interview simulation
  - Real-time WebSocket communication (Socket.IO)
  - Speech-to-text processing
  - Audio generation for AI avatar
  - Interview feedback analysis

### 4. **AI & Cloud Services** 🤖
- **Google Gemini AI**: 
  - Natural language processing
  - Content generation (resumes, cover letters)
  - Document analysis and feedback
  - Career recommendations
  
- **Google Cloud Platform Services**:
  - Speech-to-Text API for interview transcription
  - Text-to-Speech API for AI avatar voice
  - Vertex AI for advanced ML capabilities
  - Cloud Run for scalable backend deployment

### 5. **Data & Security Layer** 💾
- **PostgreSQL Database**: 
  - User profiles and preferences
  - Resumes, cover letters, and documents
  - Interview history and analytics
  - Career progress tracking
  
- **Prisma ORM**: 
  - Type-safe database queries
  - Schema management and migrations
  - Efficient data access patterns
  
- **Firebase Authentication**:
  - Secure user authentication
  - Google OAuth integration
  - Email/password authentication
  - Session management
  
- **Inngest**: 
  - Background job processing
  - Scheduled tasks
  - Async operations

## Data Flow

1. **User Interaction**: Users interact with the Next.js frontend
2. **API Requests**: Frontend makes requests to Next.js API routes or Python Flask server
3. **AI Processing**: Requests requiring AI are forwarded to Google Gemini or GCP services
4. **Data Storage**: All user data and analytics are stored in PostgreSQL via Prisma
5. **Authentication**: Firebase handles all authentication and authorization
6. **Real-time Features**: Interview simulator uses WebSocket for real-time communication

## Key Strengths

✅ **Scalable Architecture**: Serverless functions and cloud-native design
✅ **Modern Tech Stack**: Latest versions of Next.js and React
✅ **AI-Powered**: Advanced AI integration for personalized experiences
✅ **Real-time Capabilities**: WebSocket support for interactive features
✅ **Secure**: Enterprise-grade authentication and data protection
✅ **Type-Safe**: Prisma ORM ensures data integrity
✅ **Cloud-Native**: Fully deployed on Google Cloud Platform

## Deployment

- **Frontend**: Google App Hosting / Vercel
- **Backend API**: Google Cloud Run
- **Database**: Cloud SQL (PostgreSQL)
- **AI Services**: Google Cloud Platform APIs

---

*This architecture supports thousands of concurrent users with high availability and scalability.*


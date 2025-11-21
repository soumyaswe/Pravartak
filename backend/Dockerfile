# Python Flask SocketIO Backend for AI Interviewer Avatar
# Optimized for Cloud Run deployment

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Google Cloud clients
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY server_ai_interviewer.py .

# Create directory for audio files
RUN mkdir -p audio_files

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose port (Cloud Run will inject PORT env var, defaulting to 8080)
EXPOSE 8080

# Run the Flask SocketIO server
# Cloud Run expects server to listen on 0.0.0.0
CMD python server_ai_interviewer.py

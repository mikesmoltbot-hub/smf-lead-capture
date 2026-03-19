FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ ./src/
COPY assets/ ./assets/
COPY config.example.yaml ./config.yaml
COPY setup.py ./
COPY README.md ./

# Install package
RUN pip install -e .

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Run server
CMD ["python", "-m", "smf_lead_capture", "server", "--config", "config.yaml"]
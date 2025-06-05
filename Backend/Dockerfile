FROM node:18

# Install Python and Chrome dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-venv python3-pip \
    chromium \
    chromium-driver \
    wget unzip xvfb \
    && rm -rf /var/lib/apt/lists/*

# Environment variables for Chrome
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Create and activate virtual environment, then install Python packages inside it
COPY requirements.txt .
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip \
    && /opt/venv/bin/pip install -r requirements.txt

# Set PATH so python and pip inside venv are default
ENV PATH="/opt/venv/bin:$PATH"

# App source
WORKDIR /app
COPY . .

# Install Node.js packages
RUN npm install

# Start combined service
CMD ["node", "start.js"]

FROM node:18

# Install Python3, pip, Chromium, and dependencies
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  chromium \
  chromium-driver \
  wget \
  unzip \
  xvfb \
  && rm -rf /var/lib/apt/lists/*

# Set environment variables for Chromium
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install Node dependencies
RUN npm install

# Start the app
CMD ["node", "start.js"]

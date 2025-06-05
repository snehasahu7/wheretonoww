FROM node:18

# Install Python and Chrome dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    chromium \
    chromium-driver \
    wget unzip xvfb \
    && rm -rf /var/lib/apt/lists/*

# Environment variables for Chrome
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Install Python requirements
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# App source
WORKDIR /app
COPY . .

# Install Node.js packages
RUN npm install

# Start combined service
CMD ["node", "start.js"]

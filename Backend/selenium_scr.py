from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import json
# Setup Chrome options for headless mode
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
chrome_options.add_argument("--disable-gpu")  # Required for Windows
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Initialize driver with headless options
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=chrome_options
)

def scrape_dynamic_website():
    url = "https://www.sydney.com/events"
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 10)
        
        # Wait for event cards container
        event_cards = wait.until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "grid-item.product-list-widget.tile__product-list"))
        )
        
        events = []
        for card in event_cards:
            try:
                # Try to get image URL if available
                try:
                    image = card.find_element(By.CSS_SELECTOR, "img").get_attribute("src")
                except:
                    image = "https://via.placeholder.com/300x200?text=No+Image"

                event = {
                    'name': card.find_element(By.CSS_SELECTOR, "h3").text.strip(),
                    'description': card.find_element(By.CLASS_NAME, "prod-desc").text.strip(),
                    'date': card.find_element(By.CLASS_NAME, "product__list-date").text.strip(),
                    'location': card.find_element(By.CLASS_NAME, "tile__area-name").text.strip(),
                    'link': card.find_element(By.CLASS_NAME, "tile__product-list-link").get_attribute("href"),
                    'image': image
                }
                events.append(event)
                print(f"Scraped event: {event['name']}")
            except Exception as e:
                print(f"Error extracting event data: {e}")
                continue
                
        # Save events to JSON file
        with open("events.json", "w", encoding="utf-8") as f:
            json.dump(events, f, indent=4, ensure_ascii=False)
        print(f"✅ Saved {len(events)} events to events.json")
        return events
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
    finally:
        driver.quit()

if __name__ == "__main__":
    events = scrape_dynamic_website()
    if events:
        print(f"Successfully scraped {len(events)} events")
    else:
        print("Failed to scrape events")
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def exchange_for_long_lived_token(short_lived_token):
    app_id = os.getenv('FACEBOOK_APP_ID')
    app_secret = os.getenv('FACEBOOK_APP_SECRET')

    url = (f"https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app_id}&client_secret={app_secret}&fb_exchange_token={short_lived_token}")
    print("Exchanging short-lived token...")
    response = requests.get(url, timeout=15)
    print("Exchange response:", response.status_code, response.text)
    return response.json()


def setup_page_token(short_lived_token):
    long_lived = exchange_for_long_lived_token(short_lived_token)
    long_lived_user_token = long_lived["access_token"]

    url = f"https://graph.facebook.com/v19.0/me/accounts?access_token={long_lived_user_token}"
    response = requests.get(url)
    data = response.json()

    page_id = os.getenv("PAGE_ID")

    for page in data.get("data", []):
        if page["id"] == page_id:
            print("\nPAGE ACCESS TOKEN: ")
            print(page["access_token"])
            return

    raise Exception("Page access token not found")


if __name__ == "__main__":
    short_token = 'EAAU2z6ZC17KgBRQyt3gm9dz3Sozd6pBNXs4AJZBDFETzN2sEXaOvNHvaRmyJGvtUEaZAI6XTzLN3FZC0ZAK8DiSN3WRdc53eS4Yn1HUvacQVI2kaufpvlqnX3bqQnDTEOxzOtwzBDj7qdRLtjaiWZAoamTLG8Y6DGIDGTCg8fcZAIeyvJsMwVnjoElhrfXfuVpAvvl1XuJNgXpZAfpEf5pmZCiN0jGfXLguprns1eIbixBjPYDT0nXgViPmCrHVmn14fvyJgiAOj3XSJEn5Iw8XpjIAZDZD'
    setup_page_token(short_token)
import httpx
import base64
import os
from dotenv import load_dotenv

load_dotenv()

# Save your credentials securely
EBAY_CLIENT_ID = os.getenv("EBAY_CLIENT_ID")
EBAY_CLIENT_SECRET = os.getenv("EBAY_CLIENT_SECRET")

print(f"EBAY_CLIENT_ID: {EBAY_CLIENT_ID}")
print(f"EBAY_CLIENT_SECRET: {EBAY_CLIENT_SECRET}")

async def get_ebay_token():
    credentials = f"{EBAY_CLIENT_ID}:{EBAY_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {encoded_credentials}"
    }

    data = {
        "grant_type": "client_credentials",
        "scope": "https://api.ebay.com/oauth/api_scope"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post("https://api.ebay.com/identity/v1/oauth2/token",
                                     headers=headers,
                                     data=data)
        if response.status_code != 200:
            raise Exception(f"Failed to get eBay token: {response.text}")
        return response.json()["access_token"]

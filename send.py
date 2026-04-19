import requests
from datetime import datetime
import sys

WEBHOOK = "https://discord.com/api/webhooks/1495464020755484782/sM5PWU38Vlg-zqY3oAwgAn50jTsiMT4eHG3FmGG2yq5wFqlrdgEDczyUt7W4qjjvh0-Q"

print(f"WEBHOOK: {repr(WEBHOOK)}", file=sys.stderr)
if not WEBHOOK:
    raise ValueError("WEBHOOK is empty!")

timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')

message = f"""**Package Metadata**

**Version:** 1
**Revision:** 3
**Requires Python:** >=3.11

**Dependencies:**
- **certifi** (2026.2.25)
- **charset-normalizer** (3.4.7)
- **idna** (3.11)
- **requests** (2.33.1)
- **urllib3** (2.6.3)

---
*Sent at: {timestamp}*"""

response = requests.post(WEBHOOK, json={'content': message})
print(f"Response: {response.status_code} - {response.text}")
response.raise_for_status()
print('Sent!')
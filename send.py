import requests
from datetime import datetime

webhook = "https://discord.com/api/webhooks/1495464020755484782/sM5PWU38Vlg-zqY3oAwgAn50jTsiMT4eHG3FmGG2yq5wFqlrdgEDczyUt7W4qjjvh0-Q"
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

requests.post(webhook, json={'content': message})
print('Sent!')
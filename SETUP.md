# GitHub Actions Setup

## Free Tier Usage

- **Runs per month**: 24 hours × 30 days = 720 runs
- **Estimated time per run**: ~5-10 seconds
- **Total minutes**: ~60-120 minutes/month
- **Free tier**: 2000 minutes → Well within limit!

## Setup

1. **Add Discord Webhook Secret**:
   - Go to: Repo Settings → Secrets and variables → Actions
   - Add new secret: `DISCORD_WEBHOOK_URL`
   - Value: `https://discord.com/api/webhooks/1495464020755484782/sM5PWU38Vlg-zqY3oAwgAn50jTsiMT4eHG3FmGG2yq5wFqlrdgEDczyUt7W4qjjvh0-Q`

2. **Workflow already configured**:
   - Runs every hour at :00
   - Location: `.github/workflows/send-package-info.yml`

3. **Manual trigger**: 
   - Go to Actions → "Send Package Info" → Run workflow

## Files

- `send.py` - Python скрипт для отправки
- `.github/workflows/send-package-info.yml` - workflow definition
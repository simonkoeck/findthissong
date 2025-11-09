# 🎵 FindThisSong

**FindThisSong** is an Instagram bot that identifies songs used in Reels — just send the Reel to [@findthissong](https://www.instagram.com/findthissong/) on Instagram, and the bot will detect the track for you within seconds.

## 🚀 Getting Started

FindThisSong automates song recognition for Instagram Reels using Meta’s webhook system, a BullMQ-based task queue, and a Python audio detector powered by [shazamio](https://github.com/shazamio/ShazamIO).

The project runs under the Instagram username @findthissong [@findthissong](https://www.instagram.com/findthissong/) and deployed from a single Nx monorepo.

## 🧩 Architecture

```
/apps
  ├── api               → Express app handling Instagram webhooks
  ├── task-processor    → BullMQ worker processing queued detection jobs
/ig                     → Instagram utilities (Graph API, DM/reply, media download)
detect.py               → Python song detection script (shazamio)
```

### Workflow

1. **Webhook event**

Instagram calls `GET <API_URL>/webhook` when someone sends a messageto the bot.

2. **Queueing**

The API then validates if the message was a DM, and if so, adds the job to the BullMQ queue.

3. **Processing**

The `task-processor` worker pulls the job from the queue, downloads the reel, and extracts the audio.

4. **Detection**

The `detect.py` script is called with the audio file as an argument, and the output is parsed to identify the song.

5. **Reply**

If the song is identified, the bot replies with the song name, artist and an attached image.

## ⚙️ Tech Stack

| Component        | Technology          |
| ---------------- | ------------------- |
| API Layer        | Node.js + Express   |
| Queue            | BullMQ + Redis      |
| Song Detection   | Python + shazamio   |
| Audio Extraction | FFmpeg              |
| Monorepo         | Nx                  |
| Deployment       | Docker and Nixpacks |

## 🧰 Local Development

1. **Prerequisites**

- Node.js 20+
- Python 3.9+
- Redis 7+
- FFmpeg in your `$PATH`
- Working Instagram Account with Instagram Graph API access (see [developers.facebook.com](http://developers.facebook.com/))
- Some kind of tunnel for webhooks (ngrok, localtunnel, etc.)

2. **Fork & Clone & Install**

```bash
git clone https://github.com/yourusername/findthissong.git
cd findthissong
npm install
```

3. **Environment Variables**

Create a `.env` file in the root directory.

```bash
cp .env.example .env
```

4. **Run Services**

```bash
nx serve api
```

```bash
nx serve task-processor
```

## 🛡️ Privacy & Data Policy

FindThisSong only processes media sent directly to the bot.

No user data or media files are stored permanently — temporary files are deleted after processing.

## 📬 Contact

Reach out to me on [Twitter](https://x.com/soeckly) or [Email](mailto:hi@simonkoeck.com).

## 🖤 License

MIT License — feel free to fork, improve, and credit..

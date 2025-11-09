import { config } from 'dotenv';
config();

import { likeMessage, ownId, sendMessage } from '@findthissong/ig';
import Queue from 'bull';
import express from 'express';

const queue = new Queue('tasks', process.env.REDIS_URL);

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(express.json());

app.get('/healthcheck', (_, res) => {
  res.status(200).send('ok');
});

app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'your-verify-token';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const data = req.body;

  if (!data.object) {
    res.sendStatus(400);
    return;
  }

  if (data.object === 'instagram') {
    data.entry.forEach(async (entry) => {
      for (const messaging of entry.messaging) {
        if (messaging?.sender?.id == ownId) return;

        if (messaging.message?.attachments?.length > 0) {
          const attachment = messaging.message.attachments[0];
          if (attachment.type === 'ig_reel') {
            await likeMessage(messaging.sender.id, messaging?.message?.mid);
            await sendMessage(messaging.sender.id, {
              text: 'Please wait while your reel is being processed ⌛🔊🎧',
            });

            await queue.add({
              mid: messaging.message.mid,
              userId: messaging.sender.id,
              type: 'DETECT_SONG_FROM_DMS',
              reelUrl: attachment.payload.url,
            });
          } else {
            await sendMessage(messaging.sender.id, {
              text: "Sorry, we don't support this type of attachment 😞",
            });
          }
        }
      }
    });
  }

  res.sendStatus(200);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

import { config } from 'dotenv';
config();

import { sendMessage } from '@findthissong/ig';
import Queue from 'bull';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { extractMP3 } from './utils/audio';
import { spawnProcess } from './utils/childprocess';
import { downloadFile } from './utils/download';

if (!existsSync('uploads')) {
  mkdirSync('uploads');
}

const queue = new Queue('tasks', process.env.REDIS_URL);

queue.process(async function (job, done) {
  const data = job.data;
  const { userId, type, reelUrl } = data;
  if (type == 'DETECT_SONG_FROM_DMS') {
    console.log('Processing job ' + job.id);
    const id = Math.random().toString(36).substring(2, 15);
    try {
      mkdirSync('uploads/' + id);
      const filePath = `uploads/${id}/download.mp4`;
      await downloadFile(reelUrl, filePath);
      await extractMP3(filePath, `uploads/${id}/download.mp3`);
      const d = await spawnProcess('python3', [
        'detect.py',
        `uploads/${id}/download.mp3`,
      ]);

      const data = JSON.parse(d.stdout);
      if (!data.track) {
        await sendMessage(userId, {
          text: 'No song found in this reel 🎶❌🫤',
        });
        console.log('Job ' + job.id + ' completed');
        done();
        return;
      }
      if (data.track?.images?.coverart) {
        await sendMessage(userId, {
          attachment: {
            type: 'image',
            payload: {
              url: data.track.images.coverart,
            },
          },
        });
      }

      await sendMessage(userId, {
        text: data.track.title + ' by ' + data.track.subtitle,
      });
    } catch (e) {
      console.error(e);
      try {
        await sendMessage(userId, {
          text: '🎶❌🫤 Something went wrong. Try again later 😞',
        });
      } catch {
        return done();
      }
    } finally {
      // clean up files
      if (existsSync('uploads/' + id))
        rmSync('uploads/' + id, { recursive: true });
    }

    console.log('Job ' + job.id + ' completed');

    done();
  } else {
    throw new Error('Invalid task type');
  }
});

console.log('Waiting for tasks to be processed');

import ffmpeg from 'fluent-ffmpeg';

export function extractMP3(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        console.error('Error extracting MP3:', err);
        reject(err);
      })
      .run();
  });
}

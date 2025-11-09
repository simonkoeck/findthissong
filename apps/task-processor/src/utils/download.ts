import * as fs from 'fs';
import * as https from 'https';

export function downloadFile(
  url: string,
  outputLocationPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputLocationPath);

    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          },
        },
        (response) => {
          // Check if the request was successful
          if (response.statusCode !== 200) {
            reject(
              new Error(`Failed to get '${url}' (${response.statusCode})`)
            );
            return;
          }

          // Pipe the response data to the file
          response.pipe(file);

          file.on('finish', () => {
            file.close(() => {
              resolve();
            });
          });
        }
      )
      .on('error', (err) => {
        // Delete the file if an error occurs during the download
        fs.unlink(outputLocationPath, () => reject(err));
      });
  });
}

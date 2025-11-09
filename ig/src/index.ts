import axios from 'axios';
import { config } from 'dotenv';

config();

const accessToken = process.env.IG_ACCESS_TOKEN;
export const ownId = process.env.IG_OWN_SENDER_ID;

export async function likeMessage(recipientId: string, messageId: string) {
  const url = `https://graph.instagram.com/v20.0/${ownId}/messages`;
  try {
    const r = await axios.post(
      url,
      {
        recipient: {
          id: recipientId,
        },
        sender_action: 'react',
        payload: {
          message_id: messageId,
          reaction: 'love',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      }
    );
    return r.data;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function sendMessage(
  recipientId: string,
  payload:
    | {
        text?: string;
      }
    | any
) {
  if (recipientId == ownId) {
    console.log('Aborting message send');
    return;
  }
  const url = `https://graph.instagram.com/v20.0/${ownId}/messages`;
  try {
    const r = await axios.post(
      url,
      {
        recipient: {
          id: recipientId,
        },
        message: {
          ...payload,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      }
    );
    return r.data;
  } catch (e) {
    console.log(e.response.data);
    throw e;
  }
}

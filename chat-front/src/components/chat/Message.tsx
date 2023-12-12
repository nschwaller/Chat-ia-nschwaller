import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';

export interface IMessage {
  username: string;
  content: string;
  timeSent: string;
  isAccurate: boolean;
}

interface Props {
  message: IMessage;
  isMe: boolean;
}

const useTranslation = (content: string) => {
  const [translated, setTranslated] = useState('');

  useEffect(() => {
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true
    });

    const translate = async () => {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { "role": "system", "content": "You are a translation system" },
            { "role": "user", "content": `Translate ${content} in ${sessionStorage.getItem("lang")}` }
          ],
          temperature: 0.7,
          max_tokens: 64,
          top_p: 1,
        });

        if (response && response.choices && response.choices.length > 0) {
          const translatedText = response.choices[0]?.message.content;
          setTranslated(translatedText);
        }
      } catch (error) {
        console.error('Error during translation:', error);
      }
    };

    if (content) {
      translate();
    }
  }, [content]);

  return translated;
};

const Message = ({ message, isMe }: Props) => {
  const translatedMessage = useTranslation(message.content);

  return (
    <div className={`chat ${isMe ? 'chat-end' : 'chat-start'}`}>
      <div className="chat-header">
        {message.username + ' '}
        <time className="text-xs opacity-50">{new Date(message.timeSent).toLocaleString() + ' '}</time>
      </div>
      <div
        className={`chat-bubble ${isMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'} ${
          !message.isAccurate ? 'chat-bubble-error' : ''
        }`}
      >
        {translatedMessage || message.content}
      </div>
    </div>
  );
};

export default Message;

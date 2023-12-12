import { WebSocketGateway, SubscribeMessage, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { OpenAI } from "openai";

interface IMessage {
  username: string;
  content: string;
  timeSent: string;
  isAccurate: boolean;
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: any;

    clientsMap = new Map<string, { username: string, socket: Socket }>();
    messages: IMessage[] = [];

    handleConnection(client: Socket): void {
        console.log(`Client connected: ${client.id}`);
        this.clientsMap.set(client.id, { username: '', socket: client });
        client.emit('previous-messages', this.messages);
    }

    handleDisconnect(client: Socket): void {
        console.log(`Client disconnected: ${client.id}`);
        this.clientsMap.delete(client.id);
    }

    @SubscribeMessage('set-username')
    onSetUsername(client: Socket, username: string): void {
        const user = this.clientsMap.get(client.id);
        if (user) {
            user.username = username;
        }
    }

    @SubscribeMessage('send-message')
    async onSendMessage(client: Socket, message: IMessage): Promise<void> {
        const isAccurate = await this.verifyMessage(message.content);
        const updatedMessage = { ...message, isAccurate };
        
        this.messages.push(updatedMessage);
        this.server.emit('new-message', updatedMessage);

        const suggestions = await this.getSuggestionsFromOpenAI(this.messages.map(msg => msg.content));
        this.server.emit('suggestions', suggestions);
    }

    private async verifyMessage(text: string): Promise<boolean> {
        try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
            { role: 'system', content: 'You are a verification system. You respond with "true" or "false".' },
            { role: 'user', content: text },
            ],
            temperature: 0.7,
            max_tokens: 64,
            top_p: 1,
        });
    
        const isAccurate = response.choices[0]?.message?.content.trim() === 'true';
        return isAccurate;
        } catch (error) {
            console.error('Error during verification: ', error);
            return false;
        }
    }
  

    private async getSuggestionsFromOpenAI(messages: string[]): Promise<string[]> {
        try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    
        const concatenatedMessages = messages.join('\n');
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
            { role: 'system', content: 'You are a suggestion system. Provide suggestions based on the chat history.' },
            { role: 'user', content: concatenatedMessages },
            ],
            temperature: 0.7,
            max_tokens: 128,
            top_p: 1,
        });
    
        const suggestions = response.choices[0]?.message?.content.trim().split('\n');
        return suggestions || [];
        } catch (error) {
        console.error('Error retrieving suggestions: ', error);
        return [];
        }
    }
  
}

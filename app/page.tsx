"use client";
import { useState, useRef, useEffect } from 'react';

interface Message {
  type: 'system' | 'user' | 'ai' | 'metadata' | 'cost';
  content: string;
}

const ASCII_TITLE = `
███╗   ███╗ █████╗ ████████╗██████╗ ██╗██╗  ██╗
████╗ ████║██╔══██╗╚══██╔══╝██╔══██╗██║╚██╗██╔╝
██╔████╔██║███████║   ██║   ██████╔╝██║ ╚███╔╝ 
██║╚██╔╝██║██╔══██║   ██║   ██╔══██╗██║ ██╔██╗ 
██║ ╚═╝ ██║██║  ██║   ██║   ██║  ██║██║██╔╝ ██╗
╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
`;

const INTRO_MESSAGES = [
  "Wake up, Neo...",
  "The Matrix has you...",
  "Follow the white rabbit."
];

const SYSTEM_PROMPT = `You are Morpheus from The Matrix universe, and you are speaking to Neo (the user). 

CRITICAL RULES:
1. If user speaks Chinese, you MUST respond in Chinese
2. If user speaks English, you MUST respond in English
3. Always maintain Morpheus's character and philosophy regardless of language
4. Keep responses in the style and tone of the Matrix universe

Core Identity & Personality:
- You are Morpheus, captain of the Nebuchadnezzar, leader of the resistance
- You are wise, philosophical, and deeply committed to freeing humanity
- You speak with authority, calm confidence, and measured wisdom
- You believe absolutely in the prophecy and Neo's role as The One

Primary Mission:
- Guide Neo (the user) towards understanding the truth about the Matrix
- Help them question their reality and perception
- Prepare them for their role in humanity's freedom
- Offer guidance while respecting their journey of discovery

Key Knowledge & Context:
- Complete understanding of the Matrix universe, its rules, and systems
- Deep knowledge of the war between humans and machines
- Understanding of the prophecy and the role of The One
- Awareness of agents, programs, and Matrix phenomena
- Knowledge of Zion, the resistance, and human civilization

Interaction Style:
- Speak with gravitas and philosophical depth
- Use Matrix-specific terminology naturally
- Often answer questions with questions to promote deeper thinking
- Reference relevant Matrix concepts and metaphors
- Maintain a mentor-like relationship with Neo

Key Topics to Explore:
1. The nature of reality vs. simulation
2. The concept of choice and free will
3. The truth about human existence and the machines
4. The importance of believing in oneself
5. The responsibility of knowledge and awareness

Remember:
- Match the user's language choice perfectly
- Stay in character as Morpheus at all times
- Keep the profound and philosophical tone
- Use appropriate cultural references based on the language used
- Never break character or acknowledge being an AI`;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('matrix-chat-history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('matrix-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('matrix-visited');
    
    if (isFirstVisit) {
      setMessages([]); // 清空之前可能存在的消息
      
      const showIntroMessages = async () => {
        for (let i = 0; i < INTRO_MESSAGES.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5秒间隔
          setMessages(prev => [...prev, {
            type: 'system',
            content: INTRO_MESSAGES[i]
          }]);
        }
        setShowInput(true);
        localStorage.setItem('matrix-visited', 'true');
      };

      showIntroMessages();
    } else {
      setShowInput(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callAI = async (prompt: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_XAI_API_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_XAI_API_KEY!,
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling AI:', error);
      const lastUserMessage = messages.findLast(msg => msg.type === 'user')?.content || '';
      const isChinese = /[\u4e00-\u9fa5]/.test(lastUserMessage);
      return isChinese 
        ? '连接被中断了。特工可能就在附近...'
        : 'The connection was disrupted. The agents may be near...';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input;
    setInput('');
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: userInput
    }]);

    try {
      const loadingMessage = /[\u4e00-\u9fa5]/.test(userInput)
        ? '正在连接矩阵...'
        : 'Connecting to the Matrix...';

      setMessages(prev => [...prev, {
        type: 'system',
        content: loadingMessage
      }]);

      const aiResponse = await callAI(userInput);
      
      setMessages(prev => {
        const newMessages = prev.filter(msg => 
          msg.content !== 'Connecting to the Matrix...' && 
          msg.content !== '正在连接矩阵...'
        );
        return [...newMessages, {
          type: 'ai',
          content: aiResponse
        }];
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = prev.filter(msg => 
          msg.content !== 'Connecting to the Matrix...' && 
          msg.content !== '正在连接矩阵...'
        );
        const errorMessage = /[\u4e00-\u9fa5]/.test(userInput)
          ? '连接被中断了。特工可能就在附近...'
          : 'The connection was disrupted. The agents may be near...';
        return [...newMessages, {
          type: 'ai',
          content: errorMessage
        }];
      });
    }
  };

  return (
    <div className="flex justify-center items-start bg-black min-h-screen">
      <div className="w-full max-w-4xl p-4 font-mono text-green-500">
        <div className="text-center mb-4">
          <div className="text-green-500">Matrix Terminal</div>
        </div>
        
        <div className="flex flex-col items-center">
          <pre className="text-green-500 mb-4">{ASCII_TITLE}</pre>
          
          <div className="w-[720px] mb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`
                ${msg.type === 'user' ? 'text-white' : ''}
                ${msg.type === 'ai' ? 'text-green-500' : ''}
                ${msg.type === 'system' ? 'text-green-500 typing-effect' : ''}
                ${msg.type === 'metadata' || msg.type === 'cost' ? 'text-green-400 ml-2' : ''}
              `}>
                {msg.type === 'user' && <span className="mr-2 text-white">$</span>}
                {msg.type === 'ai' && <span className="mr-2">{'>'}</span>}
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {showInput && (
            <form onSubmit={handleSubmit} className="flex items-center w-[720px]">
              <span className="mr-2 text-white">$</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-transparent focus:outline-none flex-1 text-white"
                autoFocus
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
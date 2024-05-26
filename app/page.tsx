'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function page() {
  const messagesRef = useRef<HTMLUListElement>(null);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onError: (e) => console.error(e),
    initialMessages: [
      {
        id: '1',
        content: 'This would be a chat from the bot',
        role: 'function',
      },
      {
        id: '1',
        content: 'This would be the chat from a user',
        role: 'user',
      },
    ],
  });

  useEffect(() => {
    const chatBox = messagesRef.current;
    console.log(chatBox);
    // When the page re-renders, it will go to the bottom of the chat history
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }, [messages]);

  return (
    <>
      <main className="flex flex-col w-full h-screen max-h-dvh overflow-clip relative">
        {/* Background */}
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(187,4,43,.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(187,4,43,.15),rgba(255,255,255,0))]"></div>

        {/* Header */}
        <header className="p-4 mx-auto max-w-3xl">
          <h1 className="font-semibold text-3xl"></h1>
        </header>

        {/* Messages */}
        <section className="container flex flex-col px-0 pb-4 mx-auto max-w-3xl flex-grow">
          <ul
            ref={messagesRef}
            className="h-1 p-4 flex-grow  rounded-lg overflow-y-auto flex flex-col gap-4"
          >
            {messages.map((message, index) => (
              <div key={index}>
                {message.role === 'user' ? (
                  <li key={message.id} className="flex flex-row-reverse">
                    <div className="rounded-full rounded-br-none px-4 p-2 bg-secondary-foreground/90">
                      <p className='text-background text-sm'>{message.content}</p>
                    </div>
                  </li>
                ) : (
                  <li key={message.id} className="flex flex-row">
                    <div className="rounded-xl rounded-bl-none px-4 p-2 bg-background/90">
                      <p className='text-sm'>{message.content}</p>
                    </div>
                  </li>
                )}
              </div>
            ))}
          </ul>
        </section>

        {/* Query input */}
        <section className="p-4">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-3xl mx-auto items-center"
          >
            <div className="relative w-full">
              <Input
                placeholder="What is the University of Waterloo known for?"
                value={input}
                onChange={handleInputChange}
              />
              <Button
                className="absolute right-0 top-0 z-10 rounded-full"
                type="submit"
                size="icon"
                variant="ghost"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-send-horizontal"
                >
                  <path d="m3 3 3 9-3 9 19-9Z" />
                  <path d="M6 12h16" />
                </svg>
              </Button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

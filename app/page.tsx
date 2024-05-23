import React from 'react';
import Image from 'next/image';
import send from '../public/send.svg';
export default function page() {
  return (
    <>
      <Image
        src="/background2.png"
        alt="background-image"
        quality={100}
        fill={true}
      />

      <main className="container mx-auto h-screen max-w-2xl my-auto relative z-10 py-8 space-y-8 px-4 lg:px-0">
        <section className=" h-5/6 rounded-md bg-zinc-50 p-2 shadow-lg">
          This is where the chats will be
        </section>
        <form className="relative w-full shadow">
          <input
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm ring-offset-zinc-50 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-zinc-500 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50 p-2 pr-6"
            placeholder="Type here..."
          />
          <button className="absolute top-0 right-0 bg-transparent h-full aspect-square">
            <Image
              priority
              src={send}
              alt="Send message"
              width={18}
              height={18}
            />
          </button>
        </form>
      </main>
    </>
  );
}

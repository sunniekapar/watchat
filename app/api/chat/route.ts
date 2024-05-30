import { supabaseClient } from '@/utils/supabase-client';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import {
  Message,
  OpenAIStream,
  StreamingTextResponse,
  createStreamDataTransformer,
} from 'ai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { Configuration, OpenAIApi } from 'openai-edge';
import { formatDocumentsAsString } from 'langchain/util/document';
import endent from 'endent';

const TEMPLATE = `You are a expert assistant and secretary at the University of Waterloo. 
    You are able to answer any question about Engineering courses available at the University of Waterloo in a way that is both accurate and concise.
    You will ALWAYS cite the source you use and provide the link.
    You will be given a question regarding courses and if the topic is not related to the University of Waterloo Engineering Courses, do not provide an answer.
    ==================
    Context: {context}
    ==================
    Current conversation: {chat_history}

    user: {question}
    assistant:`;

const formatMessage = (message: Message) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: Request) {
  try {
    // The request will send an array of messages formatted as such [{role: '', content: ''}...]
    const { messages } = await req.json();
    // The question will be the last message in the history
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

    const currentMessageContent = messages[messages.length - 1].content;

    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      new OpenAIEmbeddings({ apiKey: process.env.PUBLIC_OPENAI_API_KEY }),
      {
        client: supabaseClient,
        tableName: 'documents',
        queryName: 'match_documents', // maybe wrong name check soon
      }
    );

    const retriever = vectorStore.asRetriever(3);

    const relevantDocuments = await retriever._getRelevantDocuments(
      currentMessageContent
    );

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      apiKey: process.env.PUBLIC_OPENAI_API_KEY,
      model: 'gpt-4o',
      streaming: true,
      temperature: 0.8,
    });

    const parser = new HttpResponseOutputParser();

    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: () => formatDocumentsAsString(relevantDocuments),
      },
      prompt,
      model,
      parser,
    ]);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      question: currentMessageContent,
    });

    // Respond with the stream
    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer())
    );
  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: error.status ?? 500 }
    );
  }
}

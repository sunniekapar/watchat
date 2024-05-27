import { supabaseClient } from '@/utils/supabase-client';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { Document } from 'langchain/document';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

function cleanPageContent(doc: any) {
  let { pageContent } = doc;

  // Step 1: Replace multiple newline characters with a single newline
  pageContent = pageContent.replace(/\n+/g, '\n');

  // Step 2: Split content into lines, trim each line, and remove empty lines
  const lines = pageContent
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string | any[]) => line.length > 0);

  // Step 3: Join the cleaned lines back into a single string
  const cleanedContent = lines.join(' ');

  // Return the cleaned document
  return {
    ...doc,
    pageContent: cleanedContent,
  };
}

async function extractDataFromUrl(url: string): Promise<Document[]> {
  try {
    const loader = new CheerioWebBaseLoader(url, {
      selector: 'div.ch,div.bg,div.fz,div.ga,div.gb,div.gc',
    });
    const docs = await loader.load();
    return docs;
  } catch (error: any) {
    console.error('Error extracting data from a single url', error);
    return [];
  }
}

// I should probably clean up the data before sending it through openai api to reduce tokens...
const url = 'https://medium.com/@gargg/how-to-create-your-own-chatbot-in-2023-66c33bb6da07';

async function embedDocuments(
  client: SupabaseClient,
  docs: Document[],
  embeddings: OpenAIEmbeddings
) {
  console.log('Started embedding documents...');
  await SupabaseVectorStore.fromDocuments(docs, embeddings, {
    client: client,
    tableName: 'documents',
  });
  console.log('Finished embeddings documents...');
}

(async (url: string) => {
  try {
    const rawDocs = await extractDataFromUrl(url);
    console.log(rawDocs);
    await embedDocuments(
      supabaseClient,
      rawDocs,
      new OpenAIEmbeddings({ apiKey: process.env.PUBLIC_OPENAI_API_KEY })
    );
  } catch (error) {
    console.error('Error embedding the documents');
  }
})(url);

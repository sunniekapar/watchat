import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
loadEnvConfig('');
const privateKey = process.env.SUPABASE_PRIVATE_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

const url = process.env.SUPABASE_URL;
if (!url) throw new Error(`Expected env var SUPABASE_URL`);

const key = process.env.PUBLIC_OPENAI_API_KEY;
const embeddings = new OpenAIEmbeddings({ apiKey: key });

(async () => {
  const client = createClient(url, privateKey);

  const loader = new PDFLoader('./sunniekapar.pdf'); // i can make this a buffer or directory loader later to be able to load multiple documents

  const docs = await loader.load();

  const pages = docs.map((doc) => doc.pageContent);
  const metadata = docs.map((doc) => doc.metadata);

  await SupabaseVectorStore.fromTexts(pages, metadata, embeddings, {
    client,
    tableName: 'documents',
    queryName: 'match_documents_pdf', // may have to change the name later
  });
})();

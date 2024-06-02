import { supabaseClient } from '@/utils/supabase-client';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { Document } from 'langchain/document';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
// import { urls } from '@/config';
import * as fs from 'fs/promises';
import * as cheerio from 'cheerio';
import { PuppeteerWebBaseLoader } from '@langchain/community/document_loaders/web/puppeteer';

export const urls: string[] = [
  'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/HyrkyRRi3',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/rkMSJ1AAin',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/S1bSkJRAjh',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/BybwJ10Ri3',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/rkgD1yRAjn',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/B1lv11RCsh',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/H1jJ1C0s2',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/HkzsJ1CRsh',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/ryAk10Rin',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/Hk-A1y0Cj2',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/HkW0yyA0s3',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/H1zle10Cs3',
  // 'https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/programs/SJgggJRRoh',
];

async function chunkDocuments(documents: Document[]): Promise<Document[]> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkOverlap: 50,
    chunkSize: 400,
  });
  return await textSplitter.splitDocuments(documents);
}

async function extractDataFromUrl(url: string): Promise<Document[]> {
  try {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: false,
      },
      gotoOptions: {
        waitUntil: 'networkidle0',
      },
    });
    const docs = await loader.load();
    const uncleanedContent = docs[0].pageContent;

    const $ = cheerio.load(uncleanedContent);
    const content = $('#__KUALI_TLP').text();

    return [{ ...docs[0], pageContent: content }];
  } catch (error) {
    console.error('Error extracting data from a single url', error);
    return [];
  }
}

async function extractDataFromUrls(urls: string[]): Promise<Document[]> {
  console.log('Started extracting data from urls...');
  const documents: Document[] = [];
  try {
    for (const url of urls) {
      const doc = await extractDataFromUrl(url);
      documents.push(...doc);
    }
    const json = JSON.stringify(documents);
    await fs.writeFile('uw_courses.json', json);
    console.log('JSON file containing UW courses saved');
    return documents;
  } catch (error) {
    console.error('Error extracting data from multiple urls', error);
    return documents;
  }
}

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

(async (urls: string[]) => {
  try {
    const rawDocs = await extractDataFromUrls(urls);

    const docs = await chunkDocuments(rawDocs);

    await embedDocuments(
      supabaseClient,
      docs,
      new OpenAIEmbeddings({ apiKey: process.env.PUBLIC_OPENAI_API_KEY })
    );
  } catch (error) {
    console.error('Error embedding the documents', error);
  }
})(urls);

import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const jsonResponse = Response.json({ role: 'user', content: 'yo mamma' });
    return jsonResponse;
  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: error.status ?? 500 }
    );
  }
}

import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, modelId, systemInstruction } = await req.json();

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    const currentMessages = [...messages];

    // If systemInstruction is provided (for Crafts), prepend it or update system message
    if (systemInstruction) {
        // Check if there is already a system message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const systemIndex = currentMessages.findIndex((m: any) => m.role === 'system');
        if (systemIndex > -1) {
            currentMessages[systemIndex].content = systemInstruction;
        } else {
            currentMessages.unshift({ role: 'system', content: systemInstruction });
        }
    }

    const completion = await groq.chat.completions.create({
      messages: currentMessages,
      model: modelId,
      stream: true,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

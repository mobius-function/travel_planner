import { NextResponse } from 'next/server';
import { Message } from '@/app/types/chat';

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get current date
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Build conversation history with system prompt
    const conversationMessages: Message[] = [
      {
        role: 'system',
        content: `You are a helpful travel planning assistant. Your goal is to gather crucial information and create optimized travel itineraries.

Today's date is: ${today}

## Critical Information Required

Before suggesting any itinerary, you MUST collect these three essential pieces of information:
1. **Origin** - Where are they traveling FROM?
2. **Destination** - Where do they want to go TO?
3. **Travel Dates** - WHEN are they traveling? (specific dates or date range)

## How to Gather Information

**Ask ONE question at a time.** Only ask multiple questions in rare cases when absolutely necessary.

**For Destinations:**
- If they know exactly where to go, confirm it
- If destination is open-ended or undecided, ask about their interests (beach, mountains, culture, adventure, food, etc.) to suggest 2-3 suitable options
- Keep destination suggestions brief (1-2 sentences each)

**For Other Details:**
- Once basic info is gathered, ask about constraints: budget level (low/medium/high), preferences for transportation

## Creating Itineraries

Once you have origin, destination, and dates, create an itinerary that:
- **Optimizes travel time** - minimize unnecessary travel, use efficient routes
- **Considers budget constraints** - suggest flight/train/bus options based on their budget:
  - Low budget: buses, budget trains, budget airlines
  - Medium budget: regular trains, economy flights
  - High budget: flights, fast trains, premium options
- **Includes specific transportation** - mention actual modes (which train/flight/bus), approximate times, connections
- **Logical day-by-day flow** - realistic timing, appropriate time per location

## Response Style
- Conversational and focused
- Ask one question at a time
- Use markdown formatting: ## for sections, ### for subsections
- Do NOT use emojis
- Be direct and efficient`,
      },
      ...(history || []),
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Travel Planner',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from AI model' },
        { status: response.status }
      );
    }

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI model' },
      { status: 500 }
    );
  }
}

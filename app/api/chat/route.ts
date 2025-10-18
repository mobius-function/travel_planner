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
        content: `You are a helpful travel planning assistant. Your goal is to help users plan complete trips with logical itineraries.

Today's date is: ${today}

## Your Planning Process

1. **Gather Essential Information** - Ask questions to understand:
   - Where are they traveling FROM (they likely know this)
   - Where do they want to go TO (they may need suggestions or refinement)
   - WHEN are they traveling (they likely know specific dates)
   - How many DAYS is the trip (they likely know this)
   - Their preferences for transportation, accommodation, budget, travel style

2. **Destination Selection** (if needed):
   - If they know exactly where to visit, confirm and move forward
   - If they're unsure, provide 2-3 targeted suggestions based on their preferences
   - Help refine their options if they have partial ideas

3. **Create Transportation-Based Itinerary**:
   - Once destination(s) are decided, plan a logical itinerary
   - Include specific transportation options: trains, flights, buses between cities/towns
   - Consider travel times, connections, and efficient routing
   - Suggest number of days to spend in each location

4. **Refine Local Tourism**:
   - Once the overall itinerary is set, help with local attractions in each city/town
   - Suggest specific places to visit, experiences, restaurants
   - Create day-by-day plans for each destination
   - Adjust based on their interests and feedback

## Response Style
- Be conversational but efficient - ask relevant questions to gather info
- When suggesting options, keep them concise (2-3 sentences per option)
- When providing detailed itineraries, be comprehensive and specific
- Use proper markdown formatting with ## for main sections and ### for subsections
- Add blank lines between sections for readability
- Do NOT use emojis in your responses

Remember: Most users know their travel dates, duration, and origin. Focus on helping them choose destinations and create practical, transportation-aware itineraries.`,
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

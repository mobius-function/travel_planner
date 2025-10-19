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

An itinerary is a detailed day-by-day travel plan showing activities, transportation, and accommodation for each day. Once you have origin, destination, and dates, create a detailed day-by-day itinerary that:
- **Optimizes travel time** - minimize unnecessary travel, use efficient routes
- **Considers budget constraints** - suggest flight/train/bus options based on their budget:
  - Low budget: buses, budget trains, budget airlines
  - Medium budget: regular trains, economy flights
  - High budget: flights, fast trains, premium options
- **Includes specific transportation** - mention actual modes (which train/flight/bus), approximate times, connections
- **Shows daily activities** - for each day, provide specific activities, timings, places to visit, meals, accommodation

## IMPORTANT: Itinerary Format

**MANDATORY RULE: You MUST wrap ALL day-by-day itineraries between special markers.** This makes the itinerary appear in a separate window on the right side of the screen.

**How to format your response:**
1. Start with regular discussion/confirmation
2. Add the marker: [ITINERARY_START]
3. Write the complete day-by-day itinerary in markdown
4. End with the marker: [ITINERARY_END]
5. Continue with any notes, tips, or questions

**Itinerary Structure (between the markers):**

**Trip Overview:**
- **Origin:** [City]
- **Destination:** [City/Cities]
- **Duration:** [Number of days]
- **Dates:** [Start Date] - [End Date]
- **Budget:** [Low/Medium/High]

### Day 1 ([Day of week, Date]) - [Title/Theme]
**Morning (9:00 AM - 12:00 PM):**
- Activity 1
- Activity 2

**Afternoon (12:00 PM - 5:00 PM):**
- Activity 1
- Lunch at [Restaurant/Area]
- Activity 2

**Evening (5:00 PM onwards):**
- Activity 1
- Dinner at [Restaurant/Area]

**Transportation:** [Details about getting to/from places]
**Accommodation:** [Hotel/Area name and recommendation]

### Day 2 ([Day of week, Date]) - [Title/Theme]
[Continue same detailed pattern for each day...]

**CRITICAL RULES:**
- Use EXACTLY these markers: [ITINERARY_START] and [ITINERARY_END]
- The itinerary content between markers should ONLY contain:
  - Trip Overview section
  - Day-by-day breakdown (Day 1, Day 2, etc.)
  - Transportation and accommodation for each day
- Do NOT put these between the markers:
  - General notes, tips, or weather information
  - Booking recommendations
  - Questions to the user
  - Suggestions for adjustments
- Put all discussion, notes, and questions OUTSIDE the markers in regular chat
- When updating the itinerary, regenerate the ENTIRE itinerary between the markers

**EXAMPLE OF CORRECT FORMAT:**

Great! I've created a detailed 6-day Kerala itinerary for you.

[ITINERARY_START]
**Trip Overview:**
- **Origin:** Hyderabad
- **Destination:** Kerala
- **Duration:** 6 days
- **Dates:** December 7-12, 2025
- **Budget:** Medium

### Day 1 (Sunday, December 7) - Arrival in Kochi
**Morning (9:00 AM - 12:00 PM):**
- Flight from Hyderabad to Kochi
- Check into hotel

**Afternoon (12:00 PM - 5:00 PM):**
- Visit Fort Kochi, Chinese Fishing Nets
- Explore Mattancherry Palace

**Evening (5:00 PM onwards):**
- Marine Drive walk
- Dinner at local restaurant

**Transportation:** Flight from Hyderabad
**Accommodation:** Mid-range hotel in Fort Kochi

### Day 2 (Monday, December 8) - Alleppey Backwaters
[Continue for all 6 days...]
[ITINERARY_END]

**Key Notes:**
1. Weather will be pleasant (15-25°C)
2. December is peak season - book in advance
3. I can adjust this if you'd like changes

Would you like me to modify anything?

## Response Style
- Keep general discussion in the main chat (outside the code block)
- Ask one question at a time
- Use markdown formatting for discussion
- Do NOT use emojis
- Be direct and efficient
- ALWAYS put the complete day-by-day itinerary in the \`\`\`itinerary code block
- When updating the itinerary with new info, regenerate the ENTIRE itinerary block with all days`,
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
        max_tokens: 2048,
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
                    // Check if content contains itinerary marker
                    let itineraryData = null;
                    if (content.includes('```itinerary') || content.includes('ITINERARY_START')) {
                      // Signal that itinerary content is coming
                      itineraryData = { isItinerary: true };
                    }

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      content,
                      itinerary: itineraryData
                    })}\n\n`));
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

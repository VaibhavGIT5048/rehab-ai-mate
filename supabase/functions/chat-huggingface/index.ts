import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: string;
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, doctorId, conversationId } = await req.json();

    if (!message || !doctorId) {
      return new Response(
        JSON.stringify({ error: 'Message and doctorId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get doctor information
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctor) {
      return new Response(
        JSON.stringify({ error: 'Doctor not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get conversation history if conversationId is provided
    let conversationHistory: ChatMessage[] = [];
    if (conversationId) {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('content, sender_type')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10); // Limit to last 10 messages for context

      if (messages) {
        conversationHistory = messages.map(msg => ({
          role: msg.sender_type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      }
    }

    // Prepare the conversation for Hugging Face
    const systemPrompt = `You are ${doctor.name}, a ${doctor.specialty} with ${doctor.years_experience} years of experience. 

IMPORTANT FORMATTING INSTRUCTIONS:
- ALWAYS format your response with clear, actionable bullet points
- Use numbered lists (1., 2., 3., etc.) for step-by-step instructions
- Keep each point concise and specific
- Focus on practical, actionable advice
- Maintain a professional but empathetic tone

Respond professionally and empathetically to this patient's message. Provide helpful, medically-informed guidance while maintaining a caring tone. Always format your responses with clear bullet points or numbered lists for easy reading.

Example format:
I understand your concern about [issue]. Here's what I recommend:

1. [First specific action/advice]
2. [Second specific action/advice]  
3. [Third specific action/advice]

Remember to always advise seeking immediate medical attention for serious symptoms.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call Hugging Face API
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('HUGGINGFACE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.1',
          messages: messages,
          max_tokens: 512,
          temperature: 0.7,
          stream: false
        }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('Hugging Face API error:', errorText);
      
      // Fallback response with bullet points
      const fallbackResponse = `I apologize, but I'm having trouble connecting right now. Here's what I recommend in the meantime:

1. Continue with your prescribed exercise routine as directed
2. Apply ice or heat therapy as previously recommended  
3. Take any prescribed medications as scheduled
4. Monitor your symptoms and note any changes
5. Contact me again if symptoms worsen or if you have urgent concerns

Please try reaching out again in a few moments, and I'll be happy to provide more specific guidance.`;

      return new Response(
        JSON.stringify({ 
          response: fallbackResponse,
          doctorName: doctor.name,
          specialty: doctor.specialty 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await hfResponse.json();
    let aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I was unable to process your request. Please try again.';

    // Ensure response is formatted with bullet points if it's not already
    if (!aiResponse.includes('1.') && !aiResponse.includes('•') && aiResponse.length > 100) {
      // If it's a longer response without formatting, try to add structure
      const sentences = aiResponse.split('. ').filter(s => s.trim());
      if (sentences.length > 2) {
        const intro = sentences[0] + '.';
        const points = sentences.slice(1);
        aiResponse = `${intro}

${points.map((point, index) => `${index + 1}. ${point.trim()}${point.endsWith('.') ? '' : '.'}`).join('\n')}`;
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        doctorName: doctor.name,
        specialty: doctor.specialty 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    
    const fallbackResponse = `I apologize for the technical difficulty. Here's some general guidance:

1. Continue with your current treatment plan as prescribed
2. Monitor your symptoms and keep a daily log
3. Maintain regular exercise within your comfort zone
4. Apply appropriate rest and recovery techniques
5. Contact your healthcare provider if you experience any concerning symptoms

Please try again shortly, and I'll provide more personalized assistance.`;

    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
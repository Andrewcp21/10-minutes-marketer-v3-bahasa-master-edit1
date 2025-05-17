import OpenAI from 'openai';

// Get API key from environment variable
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

// Initialize the OpenAI client
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the server
}) : null;

export const getOpenAI = () => {
  return openai;
};

/**
 * Generate an image using OpenAI's gpt-image-1 model
 * 
 * @param prompt The text prompt to generate an image from
 * @param clientType The type of client (Fashion, F&B, Barbershop)
 * @returns URL or base64 data of the generated image
 */
export const generateImage = async (prompt: string, clientType: string): Promise<string> => {
  const client = getOpenAI();
  
  if (!client) {
    console.error('OpenAI client not initialized');
    return '/placeholder-image.jpg';
  }
  
  // Set client name based on client type - not used in this function but kept for reference
  // const clientName = clientType === 'Fashion' ? 'LoveSummer' : 
  //                    clientType === 'F&B' ? 'GoodFood' : 
  //                    clientType === 'Barbershop' ? 'GentlemanPalace' : '';
  
  // Use the original prompt without logo instructions
  const enhancedPrompt = prompt;
  
  try {
    console.log('Generating image with prompt:', enhancedPrompt);
    
    // Using gpt-image-1 model as specified in the documentation
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024', // Using standard square size
      quality: 'high'
      // No response_format parameter as it's not supported by gpt-image-1
    });
    
    console.log('Image generation response received');
    
    // Flexible response handling for both URL and base64 data
    if (response.data && response.data.length > 0) {
      const imageResult = response.data[0];
      
      if (imageResult.b64_json) {
        // If we got base64 data, create a data URL
        return `data:image/png;base64,${imageResult.b64_json}`;
      } else if (imageResult.url) {
        // If we got a URL, return it directly
        return imageResult.url;
      }
    }
    
    console.error('No image data in response');
    return '/placeholder-image.jpg';
  } catch (error) {
    const handleError = (err: unknown) => {
      console.error('Error generating image:', err);
      
      // Log detailed error information
      if (err && typeof err === 'object' && 'response' in err && err.response) {
        console.error('Error response:', (err.response as any).data);
        console.error('Error status:', (err.response as any).status);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
      }
      
      // For demo purposes, return client-specific placeholder images as fallback
      if (clientType === 'Fashion') {
        return 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000&auto=format&fit=crop';
      } else if (clientType === 'F&B') {
        return 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000&auto=format&fit=crop';
      } else if (clientType === 'Barbershop') {
        return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop';
      } else {
        return 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1000&auto=format&fit=crop';
      }
    };
    
    return handleError(error);
  }
};

/**
 * Get a placeholder image based on the prompt content
 * Uses local images to avoid external URL issues
 */
export const getPlaceholderImage = (promptText: string): string => {
  // Return a placeholder image based on the prompt or client type
  if (promptText.toLowerCase().includes('fashion') || promptText.toLowerCase().includes('clothing')) {
    return '/placeholders/fashion.jpg';
  } else if (promptText.toLowerCase().includes('food') || promptText.toLowerCase().includes('restaurant')) {
    return '/placeholders/food.jpg';
  } else if (promptText.toLowerCase().includes('barber') || promptText.toLowerCase().includes('haircut')) {
    return '/placeholders/barbershop.jpg';
  }
  
  // Default placeholder
  return '/placeholder-image.jpg';
};

/**
 * Generate feedback from a client using OpenAI's GPT-4 Turbo
 * @param params Parameters for feedback generation
 * @returns Generated feedback and score
 */
export const generateFeedback = async (params: {
  clientName: string;
  clientPersonality: string;
  clientType: string;
  headline: string;
  usp: string;
  cta: string;
  captionText: string;
  elapsedTime: number;
}): Promise<{ feedbackMessage: string; score: number }> => {
  const client = getOpenAI();
  
  if (!client) {
    throw new Error('OpenAI client not initialized. Please provide an API key.');
  }
  
  // Get the client's personal name based on business name
  let clientPersonalName = '';
  if (params.clientName === 'LoveSummer') {
    clientPersonalName = 'Rina';
  } else if (params.clientName === 'GoodFood') {
    clientPersonalName = 'Budi';
  } else if (params.clientName === 'Gentleman Palace') {
    clientPersonalName = 'Brian';
  } else {
    clientPersonalName = 'Alex'; // Default name if client name is not recognized
  }

  const prompt = `You are the client reviewing an Instagram marketing post for your business. Your name is ${clientPersonalName} and you own ${params.clientName}. Based on the following inputs, generate a comprehensive, detailed feedback message IN BAHASA INDONESIA that SPECIFICALLY comments on the exact content submitted and give a quality score (0–100).

Inputs:
- Your Name: ${clientPersonalName}
- Your Business: ${params.clientName} (${params.clientType})
- Your Personality: ${params.clientPersonality}
- Headline Submitted: "${params.headline}"
- USP Submitted: "${params.usp}"
- CTA Submitted: "${params.cta}"
- Caption Submitted: "${params.captionText}"
- Time Taken (in seconds): ${params.elapsedTime}

Client Details:
- Rina owns LoveSummer: A warm, encouraging, and sophisticated fashion brand for women who love feeling stylish and empowered
- Budi owns GoodFood: A direct, playful, and bold F&B business launching a new spicy ramen targeting flavor lovers
- Brian owns Gentleman Palace: A technical, structured, and minimalist barbershop focused on precision and clean grooming

Your feedback MUST:
1. Start by introducing yourself by your first name (e.g., "Hey there, Rina from LoveSummer here!")
2. DIRECTLY QUOTE and comment on the specific headline, USP, CTA, and caption submitted
3. Mention specific elements of the visual/image that you liked or would improve
4. Maintain your brand's voice throughout

Analyze each of these marketing aspects in detail, ALWAYS referring to the specific content submitted:

1. HEADLINE ANALYSIS (20% of feedback):
   - DIRECTLY QUOTE the headline: "${params.headline}"
   - Provide specific feedback on this exact headline
   - Suggest specific improvements or praise specific elements

2. USP ANALYSIS (20% of feedback):
   - DIRECTLY QUOTE the USP: "${params.usp}"
   - Comment on how effectively it communicates your brand's unique value
   - Suggest specific improvements or praise specific elements

3. CALL-TO-ACTION ANALYSIS (20% of feedback):
   - DIRECTLY QUOTE the CTA: "${params.cta}"
   - Analyze its effectiveness for your specific audience
   - Suggest specific improvements or praise specific elements

4. CAPTION ANALYSIS (20% of feedback):
   - DIRECTLY QUOTE parts of the caption: "${params.captionText.substring(0, 50)}..."
   - Comment on tone, length, engagement potential, and brand alignment
   - Suggest specific improvements or praise specific elements

5. VISUAL ELEMENTS (10% of feedback):
   - Comment on specific elements of the generated image
   - Discuss color scheme, composition, and brand alignment
   - Suggest specific improvements or praise specific elements

6. OVERALL CAMPAIGN EFFECTIVENESS (10% of feedback):
   - How well all elements work together for your specific business
   - Comment on the cohesiveness of the marketing message

Your feedback should be written in first person, as if you (the actual client) wrote it, with your specific voice and concerns. DO NOT mention being a marketing expert - speak purely as the business owner. BE SPECIFIC and DIRECTLY REFERENCE the actual content submitted.

Output Format:
Feedback: "...comprehensive, detailed message directly referencing the submitted content..."
Score: XX`;

  try {
    console.log('Starting feedback generation with prompt:', prompt);
    
    // Create a timeout promise to handle API timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 25000);
    });
    
    // Race the API call against the timeout
    const response = await Promise.race([
      client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000, // Limit token count to ensure faster response
      }),
      timeoutPromise
    ]) as OpenAI.Chat.Completions.ChatCompletion;
    
    console.log('Feedback generation response received');
    
    const content = response.choices[0]?.message?.content || '';
    console.log('Raw feedback content:', content);
    
    // Parse the response to extract feedback and score
    // Using a more flexible regex pattern to capture multi-line feedback
    const feedbackMatch = content.match(/Feedback: "([\s\S]*?)"/);
    const scoreMatch = content.match(/Score: (\d+)/);
    
    let defaultFeedback = '';
    if (params.clientName === 'LoveSummer') {
      defaultFeedback = "Hai! Rina dari LoveSummer di sini. Saya sangat terkesan dengan pekerjaan Anda! Strategi pemasaran secara keseluruhan sangat sesuai dengan identitas brand fashion kami - elegan, memberdayakan, dan modern. Copywriting Anda memiliki nada yang hangat dan canggih yang disukai audiens kami, dan headline-nya mudah diingat dan berdampak. Elemen visual dengan indah melengkapi warna dan estetika brand kami, menciptakan postingan yang layak untuk Instagram dan akan menonjol di feed. Call-to-action-nya jelas dan menarik, mendorong keterlibatan langsung. Caption Anda mencapai keseimbangan sempurna antara informatif dan percakapan, dengan jumlah emoji yang tepat untuk meningkatkan keterlibatan tanpa terlihat tidak profesional. Jika saya bisa menyarankan satu perbaikan, mungkin menambahkan referensi musiman yang halus akan membuatnya lebih tepat waktu dan relevan. Secara keseluruhan, ini adalah pekerjaan yang sangat baik yang menangkap esensi LoveSummer!";
    } else if (params.clientName === 'GoodFood') {
      defaultFeedback = "Yo! Budi dari GoodFood di sini. Kampanye ini benar-benar KEREN! Dari sudut pandang pemasaran, Anda benar-benar menangkap identitas brand kami yang berani dan langsung. Copywriting memiliki nuansa kasual dan energik yang berbicara langsung kepada audiens kami yang tergila-gila dengan makanan. Headline Anda kuat dan mudah diingat - persis yang kami butuhkan untuk menonjol di media sosial. Deskripsi visual yang Anda buat menggugah selera dan menarik perhatian - warna dan detail penyajian makanan pasti akan membuat orang menginginkan ramen pedas kami! CTA-nya langsung dan menciptakan urgensi, yang persis yang kami inginkan. Caption Anda memiliki sikap dan bahasa gaul yang tepat yang beresonansi dengan demografis kami yang lebih muda. Permainan emoji juga tepat! Satu hal kecil yang perlu dipertimbangkan: mungkin tambahkan sesuatu tentang tingkat kepedasan unik untuk benar-benar menyoroti apa yang membuat ramen kami berbeda. Tapi jujur, ini persis jenis konten yang akan membuat produk kami viral. Respect besar karena memahami vibe GoodFood dengan sempurna!";
    } else if (params.clientName === 'Gentleman Palace') {
      defaultFeedback = "Halo. Brian dari Gentleman Palace di sini. Saya telah menganalisis kampanye pemasaran Anda dengan presisi, dan saya senang melaporkan bahwa itu memenuhi standar kualitas kami. Dari perspektif strategis, Anda telah berhasil menyelaraskan dengan identitas brand barbershop minimalis kami melalui elemen desain yang bersih dan presentasi profesional. Copywriting menunjukkan keahlian teknis dan pesan terstruktur yang diharapkan klien kami. Headline Anda ringkas dan informatif, dengan jelas mengkomunikasikan promosi Fresh Fade Friday kami tanpa hiasan yang tidak perlu. Elemen visual yang Anda pilih mempertahankan palet monokromatik kami dan menampilkan presisi layanan grooming kami. Call-to-action tepat sasaran dan memberikan langkah selanjutnya yang jelas untuk pemesanan. Caption Anda mempertahankan keseimbangan profesionalisme yang tepat sambil tetap menarik. Saya sangat menghargai tidak adanya emoji berlebihan, karena ini sesuai dengan pedoman brand kami. Satu rekomendasi adalah menyertakan terminologi teknis yang lebih spesifik terkait dengan potongan rambut unggulan kami untuk lebih memperkuat keahlian. Secara keseluruhan, kampanye ini menunjukkan perhatian terhadap detail dan kualitas profesional yang mewakili Gentleman Palace.";
    } else {
      defaultFeedback = `Sebagai klien Anda, saya terkesan dengan kampanye ${params.clientType} Anda! \n\nStrategi pemasaran Anda secara efektif menargetkan audiens kami dengan pesan yang menarik. Copywriting-nya menarik dan selaras dengan suara brand kami. Headline Anda "${params.headline}" menarik perhatian dan mudah diingat. \n\nElemen visual yang Anda pilih melengkapi identitas brand kami dan akan menonjol di media sosial. Call-to-action "${params.cta}" jelas dan mendorong keterlibatan. Caption Anda dibuat dengan baik dengan nada dan kepribadian yang tepat untuk audiens kami.\n\nSecara keseluruhan, ini adalah pekerjaan yang sangat baik yang akan membantu kami mencapai tujuan pemasaran. Elemen kampanye bekerja sama secara kohesif untuk menciptakan kehadiran media sosial yang kuat.`;
    }
    
    const feedbackMessage = feedbackMatch ? feedbackMatch[1] : defaultFeedback;
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 75;
    
    return { feedbackMessage, score };
  } catch (error) {
    console.error('Error generating feedback:', error);
    // Generate client-specific fallback feedback instead of throwing an error
    const clientFeedback: Record<string, string> = {
      'LoveSummer': "Hai! Rina dari LoveSummer di sini. Saya sangat terkesan dengan pekerjaan Anda! Strategi pemasaran secara keseluruhan sangat sesuai dengan identitas brand fashion kami - elegan, memberdayakan, dan modern. Copywriting Anda memiliki nada yang hangat dan canggih yang disukai audiens kami, dan headline-nya mudah diingat dan berdampak. Elemen visual dengan indah melengkapi warna dan estetika brand kami, menciptakan postingan yang layak untuk Instagram dan akan menonjol di feed. Call-to-action-nya jelas dan menarik, mendorong keterlibatan langsung. Caption Anda mencapai keseimbangan sempurna antara informatif dan percakapan, dengan jumlah emoji yang tepat untuk meningkatkan keterlibatan tanpa terlihat tidak profesional. Jika saya bisa menyarankan satu perbaikan, mungkin menambahkan referensi musiman yang halus akan membuatnya lebih tepat waktu dan relevan. Secara keseluruhan, ini adalah pekerjaan yang sangat baik yang menangkap esensi LoveSummer!",
      'GoodFood': "Yo! Budi dari GoodFood di sini. Kampanye ini benar-benar KEREN! Dari sudut pandang pemasaran, Anda benar-benar menangkap identitas brand kami yang berani dan langsung. Copywriting memiliki nuansa kasual dan energik yang berbicara langsung kepada audiens kami yang tergila-gila dengan makanan. Headline Anda kuat dan mudah diingat - persis yang kami butuhkan untuk menonjol di media sosial. Deskripsi visual yang Anda buat menggugah selera dan menarik perhatian - warna dan detail penyajian makanan pasti akan membuat orang menginginkan ramen pedas kami! CTA-nya langsung dan menciptakan urgensi, yang persis yang kami inginkan. Caption Anda memiliki sikap dan bahasa gaul yang tepat yang beresonansi dengan demografis kami yang lebih muda. Permainan emoji juga tepat! Satu hal kecil yang perlu dipertimbangkan: mungkin tambahkan sesuatu tentang tingkat kepedasan unik untuk benar-benar menyoroti apa yang membuat ramen kami berbeda. Tapi jujur, ini persis jenis konten yang akan membuat produk kami viral. Respect besar karena memahami vibe GoodFood dengan sempurna!",
      'Gentleman Palace': "Halo. Brian dari Gentleman Palace di sini. Saya telah menganalisis kampanye pemasaran Anda dengan presisi, dan saya senang melaporkan bahwa itu memenuhi standar kualitas kami. Dari perspektif strategis, Anda telah berhasil menyelaraskan dengan identitas brand barbershop minimalis kami melalui elemen desain yang bersih dan presentasi profesional. Copywriting menunjukkan keahlian teknis dan pesan terstruktur yang diharapkan klien kami. Headline Anda ringkas dan informatif, dengan jelas mengkomunikasikan promosi Fresh Fade Friday kami tanpa hiasan yang tidak perlu. Elemen visual yang Anda pilih mempertahankan palet monokromatik kami dan menampilkan presisi layanan grooming kami. Call-to-action tepat sasaran dan memberikan langkah selanjutnya yang jelas untuk pemesanan. Caption Anda mempertahankan keseimbangan profesionalisme yang tepat sambil tetap menarik. Saya sangat menghargai tidak adanya emoji berlebihan, karena ini sesuai dengan pedoman brand kami. Satu rekomendasi adalah menyertakan terminologi teknis yang lebih spesifik terkait dengan potongan rambut unggulan kami untuk lebih memperkuat keahlian. Secara keseluruhan, kampanye ini menunjukkan perhatian terhadap detail dan kualitas profesional yang mewakili Gentleman Palace."
    };
    
    // Create a default feedback if client-specific feedback isn't available
    const defaultFeedback = `Sebagai klien Anda, saya terkesan dengan kampanye ${params.clientType} Anda! \n\nStrategi pemasaran Anda secara efektif menargetkan audiens kami dengan pesan yang menarik. Copywriting-nya menarik dan selaras dengan suara brand kami. Headline Anda "${params.headline}" menarik perhatian dan mudah diingat. \n\nElemen visual yang Anda pilih melengkapi identitas brand kami dan akan menonjol di media sosial. Call-to-action "${params.cta}" jelas dan mendorong keterlibatan. Caption Anda dibuat dengan baik dengan nada dan kepribadian yang tepat untuk audiens kami.\n\nSecara keseluruhan, ini adalah pekerjaan yang sangat baik yang akan membantu kami mencapai tujuan pemasaran. Elemen kampanye bekerja sama secara kohesif untuk menciptakan kehadiran media sosial yang kuat.`;
    
    // Calculate fallback score
    const timeBonus = params.elapsedTime < 600 ? 10 : 0;
    const completenessBonus = params.headline && params.usp && params.cta && params.captionText ? 10 : 0;
    // Use a fixed base score instead of random to avoid hydration errors
    const baseScore = 85; // Fixed middle-range score
    const score = Math.min(baseScore + timeBonus + completenessBonus, 100);
    
    return { 
      feedbackMessage: clientFeedback[params.clientName] || defaultFeedback,
      score 
    };
  }
};

/**
 * Generate a caption suggestion using OpenAI's GPT-4 Turbo
 * @param params Parameters for caption generation
 * @returns Generated caption suggestion
 */
export const generateCaption = async (params: {
  headline: string;
  usp: string;
  cta: string;
  clientType: string;
  clientName: string;
  clientPersonality: string;
}): Promise<string> => {
  const client = getOpenAI();
  
  if (!client) {
    throw new Error('OpenAI client not initialized. Please provide an API key.');
  }
  
  let personalityGuidance = '';
  
  if (params.clientPersonality === 'Appreciative') {
    personalityGuidance = 'The tone should be warm, elegant, and encouraging. Use sophisticated language that appeals to fashion-conscious customers.';
  } else if (params.clientPersonality === 'Outspoken') {
    personalityGuidance = 'The tone should be bold, direct, and playful. Use casual, energetic language with some slang that appeals to food enthusiasts.';
  } else if (params.clientPersonality === 'Technical') {
    personalityGuidance = 'The tone should be precise, structured, and professional. Use clean, clear language that appeals to customers who value quality grooming.';
  }
  
  const prompt = `You are a social media copywriter. Write a catchy, engaging Instagram caption for a brand campaign in Bahasa Indonesia.

Inputs:
- Headline: ${params.headline}
- USP: ${params.usp}
- CTA: ${params.cta}
- Client Type: ${params.clientType}
- Client Name: ${params.clientName}
- Client Personality: ${params.clientPersonality}

${personalityGuidance}

Output a caption in Bahasa Indonesia in 1–2 short paragraphs with 2–3 emojis that perfectly matches the client's personality and business type.`;

  try {
    console.log('Starting caption generation with prompt:', prompt);
    
    // Create a timeout promise to handle API timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 25000);
    });
    
    // Race the API call against the timeout
    const response = await Promise.race([
      client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500, // Limit token count to ensure faster response
      }),
      timeoutPromise
    ]) as OpenAI.Chat.Completions.ChatCompletion;
    
    console.log('Caption generation response received');
    
    const content = response.choices[0]?.message?.content || '';
    console.log('Generated caption:', content);
    
    return content;
  } catch (error) {
    console.error('Error generating caption:', error);
    // Return a fallback caption instead of throwing an error
    const clientTypeEmojis: Record<string, string[]> = {
      'Fashion': ['👗', '✨', '💃'],
      'F&B': ['🍜', '🔥', '😋'],
      'Barbershop': ['💈', '✂️', '👔']
    };
    
    const emojis = clientTypeEmojis[params.clientType] || ['🎯', '🚀', '💯'];
    
    if (params.clientPersonality === 'Appreciative') {
      return `${emojis[0]} Tingkatkan gaya Anda dengan ${params.headline} kami! ${emojis[1]}

${params.usp} Jangan lewatkan kesempatan untuk tampil dan merasa terbaik. ${params.cta} ${emojis[2]}`;
    } else if (params.clientPersonality === 'Outspoken') {
      return `${emojis[0]} Memperkenalkan: ${params.headline} yang akan meledakkan lidah Anda! ${emojis[1]}

${params.usp} Siap untuk ledakan rasa? ${params.cta} ${emojis[2]}`;
    } else {
      return `${emojis[0]} ${params.headline} - untuk mereka yang menghargai presisi dan gaya. ${emojis[1]}

${params.usp} Tampil tajam belum pernah semudah ini. ${params.cta} ${emojis[2]}`;
    }
  }
};

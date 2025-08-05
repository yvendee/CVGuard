// src\pages\api\deepseek.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { fields, pdfText } = req.body;

    // 🧠 Build the comparison prompt
    const prompt = `
Compare the following user-submitted form info and the extracted PDF content.
If they match, say "Success". If not, explain what doesn't match.

Form:
Name: ${fields.fullName}
Email: ${fields.email}
Phone: ${fields.phone}
Skills: ${fields.skills}
Experience: ${fields.experience}

CV Content:
${pdfText}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    const reply = completion.choices[0]?.message?.content || 'No response.';
    res.status(200).json({ reply });
  } catch (error: any) {
    console.error('DeepSeek error:', error);
    res.status(500).json({ error: error.message || 'DeepSeek API error' });
  }
}

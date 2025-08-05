// src\pages\api\upload-cv.ts
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const uploadDir = path.join(process.cwd(), '/uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const form = new IncomingForm({ uploadDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form error:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      // Get the uploaded file
      const file = files.cv?.[0] ?? files.cv;
      if (!file || Array.isArray(file)) {
        return res.status(400).json({ error: 'No PDF file found' });
      }

      // Read and parse PDF
      const pdfBuffer = fs.readFileSync(file.filepath);
      const data = await pdfParse(pdfBuffer);

      // Extract text from PDF
      const pdfText = data.text;

      // Extract form fields
      const formFields = {
        fullName: fields.fullName?.toString() || '',
        email: fields.email?.toString() || '',
        phone: fields.phone?.toString() || '',
        skills: fields.skills?.toString() || '',
        experience: fields.experience?.toString() || '',
      };

      // ✅ Console log both fields and PDF text
      console.log('📝 Form Data:', formFields);
      console.log('📄 PDF Text:\n', pdfText);

      // ✅ Return in JSON response
      return res.status(200).json({
        message: 'CV uploaded and processed!',
        fields: formFields,
        pdfText,
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;

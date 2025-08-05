import formidable, { IncomingForm, File } from 'formidable';
import pdfParse from 'pdf-parse';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Writable } from 'stream';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

// Extend formidable's File type to include optional buffer property
interface FileWithBuffer extends File {
  buffer?: Buffer;
}

// Custom parseForm helper with in-memory file buffering
function parseForm(
  req: NextApiRequest,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = new IncomingForm({
    keepExtensions: true,
    multiples: false,
    // Capture uploaded files fully in memory:
    fileWriteStreamHandler: () => {
      const chunks: Uint8Array[] = [];
      const writable = new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(chunk);
          callback();
        },
        final(callback) {
          callback();
        },
      });
      // Attach chunks array for later access
      (writable as any).chunks = chunks;
      return writable;
    },
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
    
      // Attach collected buffer to each file manually
      const attachBuffers = (fileOrFiles: File | File[]) => {
        if (Array.isArray(fileOrFiles)) {
          fileOrFiles.forEach((file) => {
            if (
              !(file as FileWithBuffer).buffer &&
              (file as any)._writeStream &&
              (file as any)._writeStream.chunks
            ) {
              (file as FileWithBuffer).buffer = Buffer.concat(
                (file as any)._writeStream.chunks,
              );
            }
          });
        } else {
          if (
            !(fileOrFiles as FileWithBuffer).buffer &&
            (fileOrFiles as any)._writeStream &&
            (fileOrFiles as any)._writeStream.chunks
          ) {
            (fileOrFiles as FileWithBuffer).buffer = Buffer.concat(
              (fileOrFiles as any)._writeStream.chunks,
            );
          }
        }
      };
    
      Object.values(files)
      .filter((fileOrFiles) => fileOrFiles != null)
      .forEach((fileOrFiles) => attachBuffers(fileOrFiles as File | File[]));
    
      resolve({ fields, files });
    });
    
  });
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { fields, files } = await parseForm(req);

    const fileRaw = files.cv;
    let file: FileWithBuffer | undefined;

    if (Array.isArray(fileRaw)) {
      file = fileRaw[0] as FileWithBuffer;
    } else if (fileRaw) {
      file = fileRaw as FileWithBuffer;
    }

    if (!file) {
      return res.status(400).json({ error: 'No PDF file found' });
    }

    if (!file.buffer) {
      return res.status(400).json({ error: 'No PDF file buffer found' });
    }
    const pdfBuffer = file.buffer;

    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    const formFields = {
      fullName: fields.fullName?.toString() || '',
      email: fields.email?.toString() || '',
      phone: fields.phone?.toString() || '',
      skills: fields.skills?.toString() || '',
      experience: fields.experience?.toString() || '',
    };

    console.log('📝 Form Data:', formFields);
    console.log('📄 PDF Text:\n', pdfText);

    try {
      await prisma.cvUpload.create({
        data: {
          ...formFields,
          pdfText,
        },
      });
      console.log('✅ Data stored in DB.');
    } catch (dbError) {
      console.warn('⚠️ Failed to store data in DB. Continuing anyway.');
      console.error(dbError);
    }

    return res.status(200).json({
      message: 'CV uploaded and processed!',
      fields: formFields,
      pdfText,
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;

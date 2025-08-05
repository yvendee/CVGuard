// src\pages\upload.tsx
'use client';
import { useState } from 'react';

export default function UploadPage() {

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isMatch, setIsMatch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!pdfFile) {
      alert('Please upload a PDF file.');
      return;
    }
  
    setIsSubmitting(true); // 🔄 Start spinner
  
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      data.append('cv', pdfFile);
  
      const uploadRes = await fetch('/api/upload-cv', {
        method: 'POST',
        body: data,
      });
  
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error('Upload failed.');
      }
  
      const deepseekRes = await fetch('/api/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: uploadJson.fields,
          pdfText: uploadJson.pdfText,
        }),
      });
  
      let replyText = "It doesn't match";
  
      try {
        const deepseekJson = await deepseekRes.json();
        if (deepseekRes.ok) {
          replyText = deepseekJson.reply || replyText;
        }
      } catch (err) {
        console.error('Error parsing DeepSeek response:', err);
      }
  
      const isMatch = replyText.toLowerCase().includes('success');
      setModalMessage(replyText);
      setIsMatch(isMatch);
      setModalVisible(true);
    } catch (err) {
      console.error('Submit failed:', err);
      setModalMessage("Something went wrong while uploading or comparing your CV.");
      setIsMatch(false);
      setModalVisible(true);
    } finally {
      setIsSubmitting(false); // ✅ End spinner
    }
  };
  

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Your CV</h1>
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
        <input name="fullName" onChange={handleChange} placeholder="Full Name" className="w-full p-2 border" />
        <input name="email" onChange={handleChange} placeholder="Email" className="w-full p-2 border" />
        <input name="phone" onChange={handleChange} placeholder="Phone" className="w-full p-2 border" />
        <textarea name="skills" onChange={handleChange} placeholder="Skills" className="w-full p-2 border" />
        <textarea name="experience" onChange={handleChange} placeholder="Experience" className="w-full p-2 border" />
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        {isSubmitting ? (
        <div className="flex justify-center">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        ) : (
        <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded"
        >
            Submit
        </button>
        )}
      </form>

      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded max-w-md w-full max-h-[80vh] overflow-y-auto text-center shadow-lg">
            <h2 className="text-xl font-semibold mb-2">
                {isMatch ? '✅ Match Found!' : '❌ Not a Match'}
            </h2>
            <p className={`mb-4 whitespace-pre-wrap ${isMatch ? 'text-green-600' : 'text-red-600'}`}>
                {modalMessage}
            </p>
            <button
                onClick={() => setModalVisible(false)}
                className="bg-green-600 text-white px-4 py-2 rounded"
            >
                Close
            </button>
            </div>
        </div>
        )}

    </div>
  );
}

import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SemiCircleDial from './SemiCircleDial';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface FishAnalysis {
  name: string;
  scientificName: string;
  tamilName: string;
  teluguName: string;
  malayalamName: string;
  kannadaName: string;
  hindiName: string;
  edible: string;
  location: string;
  depth: string;
  endangered: string;
  color: string;
  appearance: string;
  averagePrice: string;
}

const ScanfinPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analysis, setAnalysis] = useState<FishAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const generationConfig = {
    temperature: 0.2,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 65536,
    responseModalities: [],
    responseMimeType: 'application/json',
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFish = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError('');

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-pro-exp-03-25',
      });

      // Convert image to base64 and analyze
      const reader = new FileReader();
      reader.readAsArrayBuffer(selectedImage);
      reader.onload = async () => {
        try {
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(reader.result as ArrayBuffer)));
          const prompt = `Analyze this fish image and provide a detailed analysis in JSON format with the following specific information:

          1. Name (name): Provide the common name of the fish species.
          2. Scientific Name (scientificName): Provide the scientific (Latin) name of the fish species.
          3. Regional Names: Provide the name of the fish transliterated in English for each of the following Indian languages (do not use native scripts, only provide English transliterations):
             - Tamil Name (tamilName): Provide the Tamil name transliterated in English letters (e.g., "Meen" instead of "மீன்")
             - Telugu Name (teluguName): Provide the Telugu name transliterated in English letters (e.g., "Chepa" instead of "చేప")
             - Malayalam Name (malayalamName): Provide the Malayalam name transliterated in English letters (e.g., "Meen" instead of "മീൻ")
             - Kannada Name (kannadaName): Provide the Kannada name transliterated in English letters (e.g., "Meenu" instead of "ಮೀನು")
             - Hindi Name (hindiName): Provide the Hindi name transliterated in English letters (e.g., "Machli" instead of "मछली")
          4. Edibility (edible): Specify if the fish is edible or not, including any specific preparation requirements or precautions.
          5. Location (location): Detail the geographical regions, water bodies, and countries where this fish species is commonly found.
          6. Depth (depth): Specify the typical depth range where this fish lives, in meters or feet, including both minimum and maximum depths.
          7. Conservation Status (endangered): Provide the current conservation status according to IUCN Red List categories (e.g., Least Concern, Near Threatened, Vulnerable, Endangered, etc.).
          8. Color (color): Describe the main colors and patterns visible on the fish.
          9. Appearance (appearance): Detail the physical characteristics including size, shape, distinctive features, and any unique markings.
          10. Average Price (averagePrice): Specify the typical market price range in Indian Rupees (INR) for this fish species in India.

          Please ensure all fields are filled with detailed information. Format the response as a JSON object with these exact field names. For all regional names, use ONLY English transliterations, not native scripts.`;

          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: selectedImage.type } }] }],
            generationConfig,
          });

          const response = JSON.parse(result.response.text());
          setAnalysis(response);
        } catch (err) {
          setError('Failed to analyze the image. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
    } catch (err) {
      setError('Failed to initialize the model. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <LanguageSelector />
      <SemiCircleDial />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-500 p-6">
          <h1 className="text-3xl font-bold text-white">{t('scanfin.title')}</h1>
          <p className="text-blue-100 mt-2">{t('scanfin.subtitle')}</p>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="imageInput"
            />
            <label
              htmlFor="imageInput"
              className="block w-full p-4 border-2 border-dashed border-blue-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Selected fish" className="max-h-64 mx-auto" />
              ) : (
                <div className="text-gray-500">
                  {t('scanfin.upload_prompt')}<br />
                  <span className="text-sm">{t('scanfin.supported_formats')}</span>
                </div>
              )}
            </label>
          </div>

          <button
            onClick={analyzeFish}
            disabled={!selectedImage || loading}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium ${loading || !selectedImage ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} transition-colors`}
          >
            {loading ? t('scanfin.analyzing') : t('scanfin.analyze_button')}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
          )}

          {analysis && (
            <div className="mt-8">
              {/* Fish Name and Scientific Name Section */}
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">{analysis.name}</h2>
                <p className="text-lg italic text-gray-600">{analysis.scientificName}</p>
              </div>
              
              {/* Characteristics Section */}
              <h3 className="font-semibold text-blue-800 mb-3">{t('scanfin.characteristics')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">{t('scanfin.edibility')}</h3>
                  <p className="text-gray-700">{analysis.edible}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">{t('scanfin.location')}</h3>
                  <p className="text-gray-700">{analysis.location}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">{t('scanfin.depth')}</h3>
                  <p className="text-gray-700">{analysis.depth}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">{t('scanfin.conservation_status')}</h3>
                  <p className="text-gray-700">{analysis.endangered}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">{t('scanfin.color')}</h3>
                  <p className="text-gray-700">{analysis.color}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">{t('scanfin.appearance')}</h3>
                  <p className="text-gray-700">{analysis.appearance}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg col-span-2">
                  <h3 className="font-semibold text-blue-800">{t('scanfin.average_price')}</h3>
                  <p className="text-gray-700">{analysis.averagePrice}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanfinPage;
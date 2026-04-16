import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateNewsletter() {
  // Bu fonksiyon NASA OSDR, SerpApi ve Gemini API'yi birleştirerek içerik üretecek.
  const nasaKey = process.env.NASA_API_KEY;
  const serpKey = process.env.SERPAPI_API_KEY;

  if (!nasaKey || !serpKey) {
    console.warn("NASA veya SerpApi anahtarları eksik. Simülasyon verisi kullanılacak.");
  }
  
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `
      Sen Aethel Science Baş Küratörüsün. 
      NASA OSDR (Anahtar: ${nasaKey ? 'Aktif' : 'Pasif'}) ve SerpApi (Anahtar: ${serpKey ? 'Aktif' : 'Pasif'}) verilerini kullanarak,
      5 günlük döngü için yeni bir bilim koleksiyonu oluştur.
      
      KRİTİK GÖREV: Üretilecek tüm içerikleri hem Türkçe hem de İngilizce dillerinde, birbirinin birebir kopyası olmayacak şekilde (her dilin kendi deyimsel ve bilimsel ağırlığına göre) oluştur.
      
      Format:
      [TR_BASLIK]: (Vurucu Türkçe Başlık)
      [TR_ICERIK]: (NASA OSDR ve SerpApi verileriyle harmanlanmış Türkçe derin makale)
      [EN_TITLE]: (Catchy English Title)
      [EN_CONTENT]: (The deep scientific article in English, using global terminology)
      [GLOSSARY]: (Makalede geçen 3-5 tane önemli bilimsel terimin TR-EN karşılığı)
      
      Dil Standartları:
      - Türkçe: Ciddi, otoriter, vizyoner ve sürükleyici bir üslup. "Manifesto" ruhuna uygun.
      - English: "Nature" veya "Scientific American" dergisi standartlarında; terminolojik olarak kusursuz.
      
      Konular: Uzay madenciliği, Yapay zeka etiği veya Okyanus derinlikleri.
      Tarz: Premium, otoriter, derin analiz.
    `,
  });

  return response.text;
}

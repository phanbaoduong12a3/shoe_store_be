import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo với API Key từ môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

export async function chatWithAI(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "prompt is required" });
    }

    // Sửa tên model chính xác theo ảnh Playground của bạn
    // Tên model: "gemini-3-flash-preview"
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview", 
    });

    // Cấu hình để tối ưu kết quả (giống Run settings trong ảnh)
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      // Bạn có thể thêm responseMimeType: "text/plain" nếu cần
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    const reply = response.text();

    return res.status(200).json({
      status: 200,
      data: { reply },
    });

  } catch (err) {
    console.error("Lỗi Gemini API:", err.message);
    
    // Xử lý lỗi 404 nếu Google thay đổi alias model
    res.status(500).json({ 
      message: "Lỗi kết nối AI", 
      error: err.message 
    });
  }
}
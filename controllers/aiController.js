const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const SHOE_INVENTORY = [
  { id: '1', name: "Nike Air Force 1 '07", price: "2.900.000đ", image: "https://via.placeholder.com/150" },
  { id: '2', name: "Adidas Forum Low", price: "2.500.000đ", image: "https://via.placeholder.com/150" },
  { id: '3', name: "Asics Japan S", price: "1.950.000đ", image: "https://via.placeholder.com/150" },
  { id: '4', name: "Biti's Hunter Street", price: "950.000đ", image: "https://via.placeholder.com/150" }
];

const chatWithAI = async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) return res.status(400).json({ message: "prompt is required" });

  // Thử gọi AI tối đa 3 lần nếu gặp lỗi 503
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const systemInstruction = `
        Bạn là trợ lý ảo bán giày chuyên nghiệp. Dữ liệu kho hàng: ${JSON.stringify(SHOE_INVENTORY)}.
        QUY TẮC:
        1. Trả lời thân thiện bằng tiếng Việt.
        2. Luôn trả về JSON: {"reply": "nội dung trả lời", "recommendedIds": ["id1", "id2"]}.
        3. Nếu khách hỏi "có" hoặc đồng ý xem, hãy đưa ID sản phẩm vừa nhắc vào recommendedIds.
      `;

      const chat = model.startChat({
        history: history || [],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.7 // Giảm nhiệt độ để AI trả lời ổn định hơn khi server tải nặng
        }
      });

      const result = await chat.sendMessage(systemInstruction + "\n\nKhách hỏi: " + prompt);
      const responseText = result.response.text();
      const data = JSON.parse(responseText);

      return res.status(200).json(data);

    } catch (err) {
      if (err.message.includes("503") || err.message.includes("overloaded")) {
        retryCount++;
        console.log(`AI quá tải, đang thử lại lần ${retryCount}...`);
        // Chờ 1 giây trước khi thử lại
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (retryCount === maxRetries) {
          return res.status(503).json({ 
            reply: "Hệ thống AI hiện đang quá tải do nhiều người truy cập. Bạn vui lòng đợi vài giây rồi nhắn lại giúp shop nhé! 🙏", 
            recommendedIds: [] 
          });
        }
      } else {
        console.error("Lỗi khác:", err.message);
        return res.status(500).json({ reply: "Lỗi hệ thống", recommendedIds: [] });
      }
    }
  }
};

module.exports = { chatWithAI };
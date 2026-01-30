const { GoogleGenerativeAI } = require("@google/generative-ai");

const Product = require("../models/Product"); // Đảm bảo đường dẫn đúng tới model của bạn



const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);



const chatWithAI = async (req, res) => {

  try {

    const { prompt, history } = req.body;

   

    // 1. Lấy danh sách sản phẩm đang bán từ Database

    const activeProducts = await Product.find({ isActive: true })

      .select('name price _id images thumbnail') // Chỉ lấy các trường cần thiết để tiết kiệm token

      .limit(50); // Giới hạn số lượng để AI không bị quá tải



    // 2. Chuyển đổi dữ liệu cho AI dễ đọc

    const inventoryData = activeProducts.map(p => ({

      id: p._id,

      name: p.name,

      price: p.price.toLocaleString('vi-VN') + 'đ'

    }));



    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });



    const systemInstruction = `

      Bạn là trợ lý ảo bán giày. Đây là danh sách sản phẩm thật trong kho: ${JSON.stringify(inventoryData)}.

      QUY TẮC:

      1. Trả lời thân thiện, tư vấn dựa trên danh sách trên.

      2. Luôn trả về JSON: {"reply": "nội dung", "recommendedIds": ["id_mongo_1", "id_mongo_2"]}.

      3. Nếu không có giày khách tìm, gợi ý mẫu gần nhất.

    `;



    const chat = model.startChat({

      history: history || [],

      generationConfig: { responseMimeType: "application/json" }

    });



    const result = await chat.sendMessage(systemInstruction + "\n\nKhách hỏi: " + prompt);

    const data = JSON.parse(result.response.text());



    return res.status(200).json(data);

  } catch (err) {

    console.error("Lỗi AI Controller:", err);

    res.status(500).json({ reply: "Lỗi hệ thống", recommendedIds: [] });

  }

};



module.exports = { chatWithAI };
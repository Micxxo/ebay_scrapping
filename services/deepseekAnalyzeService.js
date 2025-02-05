const axios = require("axios");
require("dotenv").config();

const deepseekAnalyzeService = async (productName) => {
  const API_URL = process.env.LM_STUDIO_API_URL + "/chat/completions";
  try {
    // Construct the message for the AI
    const messages = [
      {
          role: "system",
          content:
              "You are a helpful assistant that analyzes products based on market needs. Provide concise and actionable insights.",
      },
      {
          role: "user",
          content: `Analyze the product "${productName}" based on current market needs. Focus on its relevance, demand, and potential improvements. Keep the response under 20 words and use simple language.`,
      },
  ];

    // Call the LM Studio API
    const response = await axios.post(
      API_URL,
      {
        model: "deepseek-coder-v2-lite-instruct",
        messages,
        temperature: 0.7,
        max_tokens: 20,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the AI's response
    const analysis = response.data.choices[0].message.content;

    // Send the analysis back to the client
    res.json({ analysis });
  } catch (error) {
    console.error("Error calling LM Studio API:", error);
    res.status(500).json({ error: "Failed to analyze product" });
  }
};

module.exports = deepseekAnalyzeService;

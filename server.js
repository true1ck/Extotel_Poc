require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML
app.use(express.static(path.join(__dirname, "public")));

app.post("/call", async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: "From and To numbers required" });
  }

  const url = `${process.env.EXOTEL_BASE_URL}/v1/Accounts/${process.env.EXOTEL_ACCOUNT_SID}/Calls/connect.json`;

  try {
    const response = await axios.post(
      url,
      new URLSearchParams({
        From: from,
        To: to,
        CallerId: process.env.EXOTEL_CALLER_ID,
        StatusCallback: "https://your-domain.com/exotel-status",
        "StatusCallbackEvents[0]": "terminal",
        StatusCallbackContentType: "application/json"
      }),
      {
        auth: {
          username: process.env.EXOTEL_API_KEY,
          password: process.env.EXOTEL_API_TOKEN
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    res.json({
      success: true,
      callSid: response.data.Call.Sid,
      status: response.data.Call.Status
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Failed to initiate call"
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

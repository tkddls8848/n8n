const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

// Gmail 설정 (또는 네이버 등)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,      // your-email@gmail.com
    pass: process.env.APP_PASSWORD // 앱 비밀번호
  }
});

// 이메일 전송 API
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: to || process.env.EMAIL, // 기본값: 본인에게 전송
      subject: subject || '워크플로우 결과',
      text: text,
      html: html || `<pre>${text}</pre>`
    });
    
    console.log('✅ 이메일 전송 완료:', info.messageId);
    res.json({ 
      success: true, 
      messageId: info.messageId 
    });
    
  } catch (error) {
    console.error('❌ 전송 실패:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 건강 체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📧 이메일 서버 실행 중: http://localhost:${PORT}`);
});
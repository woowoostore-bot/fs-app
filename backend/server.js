require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const { getCorpCodeByName } = require('./db');
const app = express();

// .env 환경변수 확인용 로그
console.log('OPENDART_API_KEY:', process.env.OPENDART_API_KEY);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log('PORT:', process.env.PORT);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/search', (req, res) => {
  const { corpName, bsnsYear, reprtCode } = req.body;
  getCorpCodeByName(corpName, (err, corpCode) => {
    if (err) return res.status(500).json({ error: 'DB 오류' });
    if (!corpCode) return res.status(404).json({ error: '회사코드 없음' });

    const apiUrl = 'https://opendart.fss.or.kr/api/fnlttSinglAcnt.json';
    axios.get(apiUrl, {
      params: {
        crtfc_key: process.env.OPENDART_API_KEY,
        corp_code: corpCode,
        bsns_year: bsnsYear,
        reprt_code: reprtCode
      }
    }).then(apiRes => {
      res.json(apiRes.data);
    }).catch(e => {
      res.status(500).json({ error: 'OpenDART API 오류' });
    });
  });
});

// Gemini API를 이용한 재무제표 설명 엔드포인트
app.post('/api/explain', async (req, res) => {
  const { corpName, bsnsYear, reprtCode, data } = req.body;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) return res.status(500).json({ error: 'Gemini API 키가 없습니다.' });
  if (!data || !Array.isArray(data.list)) return res.status(400).json({ error: '재무제표 데이터가 올바르지 않습니다.' });

  // 요약할 데이터(계정명, 금액 등)만 추출
  const summary = data.list.map(i => `${i.account_nm}(${i.fs_nm}): ${i.thstrm_amount}`).join(', ');
  const prompt = `다음은 ${corpName}의 ${bsnsYear}년 주요 재무제표 정보입니다. 각 항목의 의미와 특징을 쉽게 요약해서 설명해줘.\n${summary}`;

  try {
    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        params: { key: geminiApiKey },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const explain = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '설명 결과가 없습니다.';
    res.json({ explain });
  } catch (e) {
    console.error('Gemini API 오류:', e?.response?.data || e.message || e);
    res.status(500).json({
      error: 'Gemini API 오류',
      detail: e?.response?.data || e.message || e
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행중: http://localhost:${PORT}`)); 
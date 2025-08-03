const Database = require('better-sqlite3');
const path = require('path');

// 배포 환경에서는 절대 경로 사용
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../corpCode/corpcode.db')
  : path.join(__dirname, '../corpCode/corpcode.db');

let db;
try {
  db = new Database(dbPath);
  console.log('데이터베이스 연결 성공:', dbPath);
} catch (error) {
  console.error('데이터베이스 연결 실패:', error);
  console.error('시도한 경로:', dbPath);
  
  // 파일 존재 여부 확인
  const fs = require('fs');
  if (fs.existsSync(dbPath)) {
    console.log('파일은 존재하지만 데이터베이스 연결에 실패했습니다.');
  } else {
    console.log('데이터베이스 파일이 존재하지 않습니다.');
  }
  
  // 배포 환경에서 데이터베이스 파일이 없을 경우를 대비한 처리
  if (process.env.NODE_ENV === 'production') {
    console.log('배포 환경에서 데이터베이스 파일을 찾을 수 없습니다.');
  }
}

function getCorpCodeByName(name, callback) {
  try {
    if (!db) {
      return callback(new Error('데이터베이스가 연결되지 않았습니다.'));
    }
    const row = db.prepare("SELECT corp_code FROM corp WHERE corp_name = ?").get(name);
    callback(null, row ? row.corp_code : null);
  } catch (err) {
    callback(err);
  }
}

module.exports = { getCorpCodeByName }; 
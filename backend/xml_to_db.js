const fs = require('fs');
const Database = require('better-sqlite3');
const xml2js = require('xml2js');

const xmlPath = './corpCode/CORPCODE.xml';
const dbPath = './corpCode/corpcode.db';

const db = new Database(dbPath);
db.prepare(`CREATE TABLE IF NOT EXISTS corp (
  corp_code TEXT PRIMARY KEY,
  corp_name TEXT,
  stock_code TEXT,
  modify_date TEXT
)`).run();

fs.readFile(xmlPath, (err, data) => {
  if (err) throw err;
  xml2js.parseString(data, (err, result) => {
    if (err) throw err;
    const list = result.result.list;
    const insert = db.prepare("INSERT OR REPLACE INTO corp VALUES (?, ?, ?, ?)");
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          item.corp_code[0],
          item.corp_name[0],
          item.stock_code[0],
          item.modify_date[0]
        );
      }
    });
    insertMany(list);
    db.close();
    console.log('DB 변환 완료!');
  });
}); 
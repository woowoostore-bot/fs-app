import sqlite3
import xml.etree.ElementTree as ET

xml_path = "corpCode/CORPCODE.xml"
db_path = "corpCode/corpcode.db"

conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("""
CREATE TABLE IF NOT EXISTS corp (
    corp_code TEXT PRIMARY KEY,
    corp_name TEXT,
    stock_code TEXT,
    modify_date TEXT
)
""")
conn.commit()

context = ET.iterparse(xml_path, events=("end",))
for event, elem in context:
    if elem.tag == "list":
        corp_code = elem.findtext("corp_code")
        corp_name = elem.findtext("corp_name")
        stock_code = elem.findtext("stock_code")
        modify_date = elem.findtext("modify_date")
        cur.execute(
            "INSERT OR REPLACE INTO corp VALUES (?, ?, ?, ?)",
            (corp_code, corp_name, stock_code, modify_date)
        )
        elem.clear()
conn.commit()
conn.close()
print("DB 변환 완료!") 
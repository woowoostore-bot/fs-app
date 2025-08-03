import os
import requests
from dotenv import load_dotenv

# .env 파일에서 API 키 읽기
load_dotenv()
API_KEY = os.getenv("OPENDART_API_KEY")

if not API_KEY:
    raise Exception("OPENDART_API_KEY가 .env 파일에 없습니다.")

url = f"https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key={API_KEY}"

response = requests.get(url)
if response.status_code == 200:
    with open("corpCode.zip", "wb") as f:
        f.write(response.content)
    print("회사코드 파일(corpCode.zip) 다운로드 완료!")
else:
    print("다운로드 실패:", response.status_code, response.text) 
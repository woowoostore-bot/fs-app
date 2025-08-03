import os
import sqlite3
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import plotly.graph_objs as go
import plotly.io as pio

load_dotenv()
API_KEY = os.getenv("OPENDART_API_KEY")
DB_PATH = "corpCode/corpcode.db"

app = Flask(__name__)

def format_amount(val):
    try:
        num = int(str(val).replace(",", ""))
        if abs(num) >= 1_0000_0000_0000:
            return f"{num/1_0000_0000_0000:.2f}조"
        elif abs(num) >= 1_0000_0000:
            return f"{num/1_0000_0000:.2f}억"
        elif abs(num) >= 1_0000:
            return f"{num/1_0000:.2f}만"
        else:
            return f"{num:,}"
    except:
        return val or "-"

# 회사명으로 회사코드 검색
def get_corp_code_by_name(name):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT corp_code FROM corp WHERE corp_name = ?", (name,))
    row = cur.fetchone()
    conn.close()
    return row[0] if row else None

# 오픈다트 API로 재무제표 데이터 조회
def get_financial_statement(corp_code, bsns_year, reprt_code):
    url = "https://opendart.fss.or.kr/api/fnlttSinglAcnt.json"
    params = {
        "crtfc_key": API_KEY,
        "corp_code": corp_code,
        "bsns_year": bsns_year,
        "reprt_code": reprt_code
    }
    res = requests.get(url, params=params)
    return res.json()

@app.route('/', methods=['GET', 'POST'])
def index():
    chart_html = None
    error = None
    table_html = None
    thstrm_nm = frmtrm_nm = bfefrmtrm_nm = ""
    if request.method == 'POST':
        corp_name = request.form['corp_name']
        bsns_year = request.form['bsns_year']
        reprt_code = request.form['reprt_code']
        corp_code = get_corp_code_by_name(corp_name)
        if not corp_code:
            error = f"회사명 '{corp_name}'에 해당하는 회사코드를 찾을 수 없습니다."
        else:
            data = get_financial_statement(corp_code, bsns_year, reprt_code)
            if data.get('status') != '000':
                error = f"오픈다트 API 오류: {data.get('message')}"
            else:
                items = data.get('list', [])
                if not items:
                    error = "시각화할 데이터가 없습니다."
                else:
                    # 연도명 추출(첫 항목 기준)
                    thstrm_nm = items[0].get('thstrm_nm', '당기')
                    frmtrm_nm = items[0].get('frmtrm_nm', '전기')
                    bfefrmtrm_nm = items[0].get('bfefrmtrm_nm', '전전기')
                    # 표 생성 (계정명, 구분, 당기금액, 전기금액, 전전기금액)
                    table_html = f'<table border="1"><tr><th>계정명</th><th>구분</th><th>당기금액({thstrm_nm})</th><th>전기금액({frmtrm_nm})</th><th>전전기금액({bfefrmtrm_nm})</th></tr>'
                    for i in items:
                        table_html += f"<tr><td>{i.get('account_nm','')}</td><td>{i.get('fs_nm','')}</td><td>{format_amount(i.get('thstrm_amount',''))}</td><td>{format_amount(i.get('frmtrm_amount',''))}</td><td>{format_amount(i.get('bfefrmtrm_amount',''))}</td></tr>"
                    table_html += '</table>'
                    # 차트 생성 (계정명+구분)
                    x = [f"{i['account_nm']}({i.get('fs_nm','')})" for i in items]
                    y = []
                    for i in items:
                        try:
                            y.append(int(str(i['thstrm_amount']).replace(",", "")))
                        except:
                            y.append(0)
                    fig = go.Figure([go.Bar(x=x, y=y, text=[format_amount(i.get('thstrm_amount','')) for i in items], textposition='auto')])
                    fig.update_layout(title=f"{corp_name} ({bsns_year}) 주요 재무정보", xaxis_title="계정명(구분)", yaxis_title="당기금액", margin=dict(b=150))
                    chart_html = pio.to_html(fig, full_html=False)
    return render_template('index.html', chart_html=chart_html, error=error, table_html=table_html)

if __name__ == '__main__':
    app.run(debug=True) 
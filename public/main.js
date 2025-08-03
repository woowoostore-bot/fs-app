document.getElementById('searchForm').onsubmit = async function(e) {
  e.preventDefault();
  document.getElementById('error').textContent = '';
  document.getElementById('resultTable').innerHTML = '';
  document.getElementById('balanceSheetBox').innerHTML = '';
  document.getElementById('explainBox')?.remove();
  
  // 기존 쉽게 설명 버튼 제거
  const existingExplainBtn = document.getElementById('explainBtn');
  if (existingExplainBtn) {
    existingExplainBtn.remove();
  }
  
  const form = e.target;
  const data = {
    corpName: form.corpName.value,
    bsnsYear: form.bsnsYear.value,
    reprtCode: form.reprtCode.value
  };
  
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  
  const result = await res.json();
  if (!res.ok || result.status !== '000') {
    document.getElementById('error').textContent = result.error || result.message || '오류';
    return;
  }
  
  // 표 생성
  let html = '<table class="table table-bordered"><thead><tr><th>계정명</th><th>구분</th><th>당기금액</th><th>전기금액</th></tr></thead><tbody>';
  result.list.forEach(i => {
    html += `<tr>
      <td>${i.account_nm}</td>
      <td>${i.fs_nm}</td>
      <td>${formatAmount(i.thstrm_amount)}</td>
      <td>${formatAmount(i.frmtrm_amount)}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('resultTable').innerHTML = html;
  
  // 재무상태표 박스 차트 생성
  createBalanceSheetBox(result.list);
  
  // 차트 생성
  const ctx = document.getElementById('chart').getContext('2d');
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: result.list.map(i => i.account_nm + '(' + i.fs_nm + ')'),
      datasets: [{
        label: '당기금액',
        data: result.list.map(i => parseInt((i.thstrm_amount || '0').replace(/,/g, '')) || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } }
      }
    }
  });
  
  // 쉽게 설명 버튼 추가
  const explainBtn = document.createElement('button');
  explainBtn.id = 'explainBtn';
  explainBtn.textContent = '쉽게 설명';
  explainBtn.className = 'btn btn-info my-2';
  explainBtn.onclick = async function() {
    explainBtn.disabled = true;
    explainBtn.textContent = '설명 생성중...';
    document.getElementById('explainBox')?.remove();
    
    const explainRes = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        corpName: form.corpName.value,
        bsnsYear: form.bsnsYear.value,
        reprtCode: form.reprtCode.value,
        data: result
      })
    });
    
    const explainData = await explainRes.json();
    const box = document.createElement('div');
    box.id = 'explainBox';
    box.className = 'alert alert-success';
    box.innerHTML = '<b>Gemini 요약 설명:</b><br>' + (explainData.explain || explainData.error || '설명 결과가 없습니다.');
    document.getElementById('resultTable').after(box);
    explainBtn.disabled = false;
    explainBtn.textContent = '쉽게 설명';
  };
  
  document.getElementById('resultTable').after(explainBtn);
};

function formatAmount(val) {
  if (!val) return '-';
  const num = parseInt(val.replace(/,/g, ''));
  if (isNaN(num)) return val;
  if (Math.abs(num) >= 1_0000_0000_0000) return (num/1_0000_0000_0000).toFixed(2) + '조';
  if (Math.abs(num) >= 1_0000_0000) return (num/1_0000_0000).toFixed(2) + '억';
  if (Math.abs(num) >= 1_0000) return (num/1_0000).toFixed(2) + '만';
  return num.toLocaleString();
}

function createBalanceSheetBox(data) {
  // 재무상태표 항목 분류
  const assets = [];
  const liabilities = [];
  const equity = [];
  
  data.forEach(item => {
    const amount = parseInt((item.thstrm_amount || '0').replace(/,/g, '')) || 0;
    const itemData = {
      name: item.account_nm,
      amount: amount,
      formattedAmount: formatAmount(item.thstrm_amount)
    };
    
    // 계정명에 따라 분류
    const accountName = item.account_nm.toLowerCase();
    if (accountName.includes('자산') || accountName.includes('유동자산') || accountName.includes('비유동자산') || 
        accountName.includes('현금') || accountName.includes('예금') || accountName.includes('단기금융상품') ||
        accountName.includes('매출채권') || accountName.includes('재고자산') || accountName.includes('투자자산') ||
        accountName.includes('유형자산') || accountName.includes('무형자산') || accountName.includes('기타자산')) {
      assets.push(itemData);
    } else if (accountName.includes('부채') || accountName.includes('유동부채') || accountName.includes('비유동부채') ||
               accountName.includes('매입채무') || accountName.includes('미지급금') || accountName.includes('사채') ||
               accountName.includes('장기차입금') || accountName.includes('기타부채')) {
      liabilities.push(itemData);
    } else if (accountName.includes('자본') || accountName.includes('자본금') || accountName.includes('자본잉여금') ||
               accountName.includes('자본조정') || accountName.includes('이익잉여금') || accountName.includes('자기주식') ||
               accountName.includes('기타자본항목') || accountName.includes('비지배지분')) {
      equity.push(itemData);
    }
  });
  
  // 총액 계산
  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);
  
  // 박스 차트 HTML 생성
  let html = `
    <div class="equation">
      자산 = 부채 + 자본
    </div>
    <div class="balance-sheet-container">
      <div class="assets-box">
        <div class="box-title assets-title">자산</div>
        ${assets.map(item => `
          <div class="box-item asset">
            <span class="item-name">${item.name}</span>
            <span class="item-amount">${item.formattedAmount}</span>
          </div>
        `).join('')}
        <div class="total-amount assets-total">
          총 자산: ${formatAmount(totalAssets.toString())}
        </div>
      </div>
      
      <div class="liabilities-equity-box">
        <div class="box-title liabilities-title">부채</div>
        ${liabilities.map(item => `
          <div class="box-item liability">
            <span class="item-name">${item.name}</span>
            <span class="item-amount">${item.formattedAmount}</span>
          </div>
        `).join('')}
        <div class="total-amount liabilities-total">
          총 부채: ${formatAmount(totalLiabilities.toString())}
        </div>
        
        <div class="box-title equity-title" style="margin-top: 20px;">자본</div>
        ${equity.map(item => `
          <div class="box-item equity">
            <span class="item-name">${item.name}</span>
            <span class="item-amount">${item.formattedAmount}</span>
          </div>
        `).join('')}
        <div class="total-amount equity-total">
          총 자본: ${formatAmount(totalEquity.toString())}
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('balanceSheetBox').innerHTML = html;
} 
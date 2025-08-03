document.getElementById('searchForm').onsubmit = async function(e) {
  e.preventDefault();
  document.getElementById('error').textContent = '';
  document.getElementById('resultTable').innerHTML = '';
  document.getElementById('explainBox')?.remove();
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
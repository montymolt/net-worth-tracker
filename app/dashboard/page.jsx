import { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [categories, setCategories] = useState(['cash','stocks','crypto']);

  useEffect(() => {
    fetch('/sample-data.json').then(r=>r.json()).then(setData);
  }, []);

  useEffect(() => {
    if (!data || data.length===0) return;
    // draw chart
    const ctx = document.getElementById('nw-chart');
    if (!ctx) return;
    const labels = data.map(d=>d.date);
    const totals = data.map(d => d.assets.reduce((s,a)=>s+a.value,0));
    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets:[{label:'Net Worth', data:totals, borderColor:'rgb(59,130,246)'}]},
    });
    return () => chart.destroy();
  }, [data]);

  function addDay() {
    const day = prompt('Date (YYYY-MM-DD)');
    if (!day) return;
    const checking = Number(prompt('Checking amount', '0'))||0;
    const amzn = Number(prompt('AMZN value', '0'))||0;
    const btc = Number(prompt('BTC value', '0'))||0;
    const newEntry = { date: day, assets:[{name:'Checking',category:'cash',value:checking},{name:'AMZN',category:'stocks',value:amzn},{name:'BTC',category:'crypto',value:btc}] };
    setData(prev=>[...prev,newEntry]);
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <button className="btn" onClick={addDay}>Add Day</button>
        <button className="btn" onClick={()=>{ const c = prompt('Categories (comma)'); if(c) setCategories(c.split(',').map(s=>s.trim()));}}>Edit Categories</button>
      </div>
      <canvas id="nw-chart" width="800" height="300"></canvas>
      <h3 className="mt-6">Data</h3>
      <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(data,null,2)}</pre>
    </div>
  );
}

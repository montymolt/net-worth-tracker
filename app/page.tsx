'use client'
import { useEffect, useState } from 'react'

type Item = { id: string; name: string; value: number; type: 'asset'|'liability' }

export default function Page(){
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [type, setType] = useState<'asset'|'liability'>('asset')
  const [editing, setEditing] = useState<string | null>(null)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('nw_items')
      if(raw) setItems(JSON.parse(raw))
    }catch(e){ console.error('load', e) }
  },[])

  useEffect(()=>{
    try{ localStorage.setItem('nw_items', JSON.stringify(items)) }catch(e){ console.error('save', e) }
  },[items])

  const add = ()=>{
    const v = Number(value)
    if(!name || isNaN(v)) return
    if(editing){
      setItems(prev=>prev.map(i=> i.id===editing ? {...i, name, value: v, type} : i))
      setEditing(null)
    } else {
      setItems(prev=>[{ id: String(Date.now()), name, value: v, type }, ...prev])
    }
    setName(''); setValue('')
  }

  const edit = (id:string)=>{
    const it = items.find(i=>i.id===id); if(!it) return
    setEditing(id); setName(it.name); setValue(String(it.value)); setType(it.type)
  }

  const remove = (id:string)=> setItems(prev=>prev.filter(i=>i.id!==id))

  const assets = items.filter(i=>i.type==='asset').reduce((s,n)=>s+n.value,0)
  const liabilities = items.filter(i=>i.type==='liability').reduce((s,n)=>s+n.value,0)
  const net = assets - liabilities

  const exportCSV = ()=>{
    const rows = [['id','name','value','type'], ...items.map(i=>[i.id, i.name, String(i.value), i.type])]
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"").join(',')).join('\n')
    const blob = new Blob([csv], {type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='networth.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  const importCSV = (file:File | null)=>{
    if(!file) return
    const reader = new FileReader();
    reader.onload = (e)=>{
      try{
        const text = String(e.target?.result || '');
        const lines = text.split(/\r?\n/).filter(Boolean)
        const parsed = lines.slice(1).map(l=>{
          const cols = l.split(',').map(s=>s.replace(/^"|"$/g,''))
          return { id: cols[0]||String(Date.now()), name: cols[1]||'', value: Number(cols[2]||0), type: (cols[3] as any)||'asset' }
        })
        setItems(prev=>[...parsed, ...prev])
      }catch(e){ console.error('csv', e) }
    }
    reader.readAsText(file)
  }

  return (
    <main style={{padding:24,fontFamily:'system-ui,Segoe UI,Roboto'}}>
      <h1>Net Worth Tracker (MVP)</h1>
      <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Value" value={value} onChange={e=>setValue(e.target.value)} />
        <select value={type} onChange={e=>setType(e.target.value as any)}>
          <option value="asset">Asset</option>
          <option value="liability">Liability</option>
        </select>
        <button onClick={add}>{editing? 'Save': 'Add'}</button>
        <input style={{display:'none'}} id='csvfile' type='file' accept='.csv' onChange={e=>importCSV(e.target.files?.[0]||null)} />
        <button onClick={()=>document.getElementById('csvfile')?.dispatchEvent(new MouseEvent('click'))}>Import CSV</button>
        <button onClick={exportCSV}>Export CSV</button>
        <button onClick={()=>{ setItems([]); localStorage.removeItem('nw_items') }}>Clear</button>
      </div>
      <div style={{marginTop:18}}>
        <div>Assets: ${assets.toFixed(2)}</div>
        <div>Liabilities: ${liabilities.toFixed(2)}</div>
        <div style={{fontWeight:700,marginTop:8}}>Net Worth: ${net.toFixed(2)}</div>
      </div>
      <ul style={{marginTop:18}}>
        {items.map(it=> (
          <li key={it.id} style={{marginBottom:8,display:'flex',gap:8,alignItems:'center'}}>
            <div style={{flex:1}}><strong>{it.name}</strong> — ${it.value.toFixed(2)} <em>({it.type})</em></div>
            <div>
              <button onClick={()=>edit(it.id)}>Edit</button>
              <button style={{marginLeft:8}} onClick={()=>remove(it.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

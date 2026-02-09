'use client'
import { useEffect, useState } from 'react'

type Item = { id: string; name: string; value: number; type: 'asset'|'liability' }

export default function Page(){
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [type, setType] = useState<'asset'|'liability'>('asset')

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
    setItems(prev=>[{ id: String(Date.now()), name, value: v, type }, ...prev])
    setName(''); setValue('')
  }

  const remove = (id:string)=> setItems(prev=>prev.filter(i=>i.id!==id))

  const assets = items.filter(i=>i.type==='asset').reduce((s,n)=>s+n.value,0)
  const liabilities = items.filter(i=>i.type==='liability').reduce((s,n)=>s+n.value,0)
  const net = assets - liabilities

  return (
    <main style={{padding:24,fontFamily:'system-ui,Segoe UI,Roboto'}}>
      <h1>Net Worth Tracker (MVP)</h1>
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Value" value={value} onChange={e=>setValue(e.target.value)} />
        <select value={type} onChange={e=>setType(e.target.value as any)}>
          <option value="asset">Asset</option>
          <option value="liability">Liabilities</option>
        </select>
        <button onClick={add}>Add</button>
      </div>
      <div style={{marginTop:18}}>
        <div>Assets: ${assets.toFixed(2)}</div>
        <div>Liabilities: ${liabilities.toFixed(2)}</div>
        <div style={{fontWeight:700,marginTop:8}}>Net Worth: ${net.toFixed(2)}</div>
      </div>
      <ul style={{marginTop:18}}>
        {items.map(it=> (
          <li key={it.id} style={{marginBottom:8}}>
            <strong>{it.name}</strong> — ${it.value.toFixed(2)} ({it.type})
            <button style={{marginLeft:8}} onClick={()=>remove(it.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </main>
  )
}

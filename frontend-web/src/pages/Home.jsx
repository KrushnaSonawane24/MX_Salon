import React, { useEffect, useState } from 'react'
import api, { setAuth } from '../lib/api'

export default function Home(){
  const [salons, setSalons] = useState([])
  useEffect(()=>{ (async()=>{
    try{
  const r = await api.get('/salons')
      setSalons(r.data)
    }catch{}
  })() },[])

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {salons.map(s=> (
        <div key={s.id} className="card p-4">
          <div className="font-semibold text-lg">{s.name}</div>
          <div className="text-sm text-gray-600">{s.city}</div>
          <div className="mt-2 text-sm">Rating: {s.rating ?? 0}</div>
        </div>
      ))}
    </div>
  )
}

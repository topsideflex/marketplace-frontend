import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App(){
  const [listings,setListings] = useState([]);
  const [token,setToken] = useState(localStorage.getItem('token')||'');
  const [user,setUser] = useState(null);
  const [form, setForm] = useState({title:'',desc:'',price:'',auction:false,category:''});
  const [categories,setCategories] = useState([]);

  useEffect(()=>{ fetchListings(); fetchCategories(); },[]);

  async function fetchListings(){
    const res = await fetch(API + '/api/listings');
    const data = await res.json();
    setListings(data);
  }
  async function fetchCategories(){
    const res = await fetch(API + '/api/categories');
    const data = await res.json();
    setCategories(data);
  }

  async function registerDemo(){
    const res = await fetch(API + '/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Demo Seller',email:'seller@example.com',password:'pass',role:'seller'})});
    const json = await res.json();
    if(json.token){ localStorage.setItem('token',json.token); setToken(json.token); setUser(json.user); alert('registered'); }
  }

  async function loginDemo(){
    const res = await fetch(API + '/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'seller@example.com',password:'pass'})});
    const json = await res.json();
    if(json.token){ localStorage.setItem('token',json.token); setToken(json.token); setUser(json.user); alert('logged in'); }
  }

  async function createListing(e){
    e.preventDefault();
    if(!token){ alert('login first'); return; }
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.desc);
    formData.append('price', form.price);
    formData.append('category_id', form.category);
    formData.append('auction', form.auction ? '1' : '0');
    const res = await fetch(API + '/api/listings', {method:'POST', headers:{'Authorization':'Bearer ' + token}, body: formData});
    const json = await res.json();
    if(json.id){ alert('listing created'); fetchListings(); }
  }

  return <div style={{fontFamily:'Arial',padding:20}}>
    <h1>Marketplace (minimal)</h1>
    <div style={{display:'flex',gap:20}}>
      <div style={{flex:2}}>
        <h2>Listings</h2>
        {listings.map(l=>(
          <div key={l.id} style={{border:'1px solid #ccc',padding:10,marginBottom:10}}>
            <h3>{l.title} {l.auction?'<auction>':''}</h3>
            <p>{l.description}</p>
            <p>Price: ${l.price} | Category: {l.category_name} | Seller: {l.seller_name}</p>
          </div>
        ))}
      </div>
      <div style={{flex:1}}>
        <h3>Auth</h3>
        <button onClick={registerDemo}>Register demo seller</button>
        <button onClick={loginDemo}>Login demo seller</button>
        <h3>Create Listing (seller)</h3>
        <form onSubmit={createListing}>
          <input placeholder="title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/><br/>
          <textarea placeholder="description" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} required/><br/>
          <input placeholder="price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/><br/>
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            <option value="">Select category</option>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select><br/>
          <label><input type="checkbox" checked={form.auction} onChange={e=>setForm({...form,auction:e.target.checked})}/> Auction</label><br/>
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);

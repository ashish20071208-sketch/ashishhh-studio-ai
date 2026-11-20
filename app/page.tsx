"use client";
import { useMemo, useState } from "react";

type Pack = { design_brief: string; thumbnails: { concept: string; headline: string; visual_direction: string; background: string; layout: string; image_prompt: string }[]; youtube_titles: string[]; tags: string[]; hashtags: string[]; instagram_caption: string; carousel: { slide: number; heading: string; body: string; visual: string }[] };
type Photo = { file: File; preview: string; instruction: string };
const initialOutputs = { thumbnails:true, titles:true, tags:true, caption:true, carousel:false };
export default function Home() {
 const [topic,setTopic]=useState(""); const [headline,setHeadline]=useState(""); const [instructions,setInstructions]=useState("");
 const [photos,setPhotos]=useState<Photo[]>([]); const [lang,setLang]=useState("Marathi + English");
 const [palette,setPalette]=useState("Neon contrast"); const [font,setFont]=useState("Mukta"); const [style,setStyle]=useState("Cinematic"); const [ratio,setRatio]=useState("YouTube 16:9");
 const [outputs,setOutputs]=useState(initialOutputs); const [carouselCount,setCarouselCount]=useState(7);
 const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [pack,setPack]=useState<Pack|null>(null);
 const [images,setImages]=useState<string[]>([]); const [generatingImages,setGeneratingImages]=useState(false);
 const photoSummary = useMemo(()=>photos.map((p,i)=>`Photo ${i+1}: ${p.file.name} — ${p.instruction||"no special instruction"}`).join("\n"),[photos]);
 function addFiles(files: FileList|null){ if(!files)return; const next=[...photos]; Array.from(files).filter(f=>f.type.startsWith("image/")).forEach(file=>next.push({file,preview:URL.createObjectURL(file),instruction:""})); setPhotos(next); }
 function updatePhoto(i:number, patch:Partial<Photo>){setPhotos(old=>old.map((p,j)=>j===i?{...p,...patch}:p));}
 function movePhoto(i:number,delta:number){setPhotos(old=>{const a=[...old],j=i+delta;if(j<0||j>=a.length)return old;[a[i],a[j]]=[a[j],a[i]];return a;});}
 async function generate(){setError("");setPack(null);setImages([]);if(!topic.trim()){setError("कृपया विषय लिहा.");return;}setBusy(true);
  try{
   const fd=new FormData();fd.append("topic",topic);fd.append("headline",headline);fd.append("instructions",instructions);fd.append("language",lang);fd.append("palette",palette);fd.append("font",font);fd.append("style",style);fd.append("ratio",ratio);fd.append("carouselCount",String(carouselCount));fd.append("outputs",JSON.stringify(outputs));photos.forEach((p,i)=>{fd.append("photos",p.file);fd.append("photoInstructions",p.instruction);});
   const res=await fetch("/api/create-pack",{method:"POST",body:fd});const data=await res.json();if(!res.ok)throw new Error(data.error||"Generation failed");setPack(data);
  }catch(e){setError(e instanceof Error?e.message:"Something went wrong");}finally{setBusy(false);}
 }
 async function generateImagePrompts(){if(!pack)return;setGeneratingImages(true);setError("");
  try{const res=await fetch("/api/generate-thumbnails",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompts:pack.thumbnails.map(t=>t.image_prompt),ratio})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Image generation failed");setImages(data.images||[]);}
  catch(e){setError(e instanceof Error?e.message:"Image generation failed");}finally{setGeneratingImages(false);}
 }
 function downloadData(url:string,name:string){const a=document.createElement("a");a.href=url;a.download=name;a.click();}
 return <main className="shell">
  <header><div className="brandmark">✦</div><div><b>Ashishhh Studio AI</b><small>REAL AI CREATIVE STUDIO · V4</small></div><span className="status">API-ready workspace</span></header>
  <section className="hero"><div className="eyebrow">CREATE · OPTIMIZE · PUBLISH</div><h1>Your creative director,<br/><em>powered by AI.</em></h1><p>एक विषय, तुमचे फोटो आणि तुमच्या सूचना — त्यातून YouTube व Instagram साठी पूर्ण क्रिएटिव्ह पॅक तयार करा.</p></section>
  <div className="workspace">
   <aside className="panel">
    <h2>01 / Creative Brief</h2>
    <label>विषय / Topic *</label><textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="उदा. मँडेलब्रॉट सेट म्हणजे काय?"/>
    <label>Thumbnail headline</label><input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="उदा. अनंत विश्वाचं रहस्य!"/>
    <label>Reference photos (multiple)</label><div className="upload"><input type="file" accept="image/*" multiple onChange={e=>addFiles(e.target.files)}/><small>एकावेळी अनेक फोटो निवडा</small></div>
    {photos.map((p,i)=><div className="photo" key={p.preview}><img src={p.preview}/><div className="photobody"><b>Photo {i+1}: {p.file.name}</b><input value={p.instruction} onChange={e=>updatePhoto(i,{instruction:e.target.value})} placeholder="उदा. उजवीकडे ठेवा; चेहरा बदलू नका"/><div className="miniactions"><button onClick={()=>movePhoto(i,-1)} disabled={!i}>↑</button><button onClick={()=>movePhoto(i,1)} disabled={i===photos.length-1}>↓</button><button onClick={()=>setPhotos(old=>old.filter((_,j)=>j!==i))}>Remove</button></div></div></div>)}
    <label>Creative instructions / डिझाइन सूचना</label><textarea value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="पहिला फोटो उजवीकडे, दुसरा डावीकडे छोटा. टेक्स्ट मध्यभागी. बॅकग्राऊंडला गडद निळे अंतराळ. चेहऱ्याची ओळख बदलू नका."/>
    <div className="two"><div><label>Language</label><select value={lang} onChange={e=>setLang(e.target.value)}><option>Marathi + English</option><option>Marathi</option><option>English</option><option>Hindi</option></select></div><div><label>Format</label><select value={ratio} onChange={e=>setRatio(e.target.value)}><option>YouTube 16:9</option><option>Instagram 4:5</option><option>Story / Reel 9:16</option></select></div></div>
    <div className="two"><div><label>Color theory</label><select value={palette} onChange={e=>setPalette(e.target.value)}>{["Neon contrast","Complementary","Analogous","Luxury gold","Minimal light","Earthy"].map(x=><option>{x}</option>)}</select></div><div><label>Marathi font</label><select value={font} onChange={e=>setFont(e.target.value)}>{["Mukta","Noto Sans Devanagari","Hind","Anek Devanagari","Tiro Devanagari Marathi"].map(x=><option>{x}</option>)}</select></div></div>
    <label>Visual style</label><select value={style} onChange={e=>setStyle(e.target.value)}>{["Cinematic","Educational","Futuristic","Minimal premium","Bold viral"].map(x=><option>{x}</option>)}</select>
    <label>Generate outputs</label><div className="checks">{Object.entries({thumbnails:"3 thumbnail concepts",titles:"3 YouTube titles",tags:"Tags + hashtags",caption:"Instagram caption",carousel:"Carousel storyboard"}).map(([k,v])=><label className="check" key={k}><input type="checkbox" checked={(outputs as any)[k]} onChange={e=>setOutputs(o=>({...o,[k]:e.target.checked}))}/>{v}</label>)}</div>
    <label>Carousel slides</label><select value={carouselCount} onChange={e=>setCarouselCount(Number(e.target.value))}>{[5,7,10,15].map(n=><option value={n}>{n}</option>)}</select>
    <button className="primary wide" onClick={generate} disabled={busy}>{busy?"AI is thinking…":"✦ Generate AI content pack"}</button>
    {error&&<p className="error">{error}</p>}
    <p className="hint">फोटो आणि API कॉल्स सुरक्षित backend मार्फत जातात. API key फक्त server environment मध्ये ठेवा.</p>
   </aside>
   <section className="panel results">
    <div className="resulthead"><div><h2>02 / AI Outputs</h2><p>तुमच्या brief वरून तयार केलेले परिणाम</p></div><span className="tag">V4 · REAL API</span></div>
    {!pack&&<div className="empty"><div>✧</div><h3>तुमची पुढची कल्पना इथे जिवंत होईल.</h3><p>डावीकडे brief भरा आणि Generate दाबा.</p></div>}
    {pack&&<>
     <section className="block"><h3>Creative Director Brief</h3><p>{pack.design_brief}</p></section>
     {outputs.thumbnails&&<section className="block"><h3>Three thumbnail concepts</h3><div className="concepts">{pack.thumbnails.map((t,i)=><article className="concept" key={i}><span>CONCEPT 0{i+1}</span><h4>{t.concept}</h4><b>{t.headline}</b><p>{t.visual_direction}</p><small>Background: {t.background}</small><small>Layout: {t.layout}</small><details><summary>Image prompt</summary><p>{t.image_prompt}</p></details></article>)}</div><button className="secondary" onClick={generateImagePrompts} disabled={generatingImages}>{generatingImages?"Generating images…":"Generate 3 AI thumbnail images"}</button>{images.length>0&&<div className="generated">{images.map((src,i)=><div key={i}><img src={src}/><button className="secondary" onClick={()=>downloadData(src,`ashishhh-thumbnail-${i+1}.png`)}>Download PNG</button></div>)}</div>}</section>}
     {outputs.titles&&<section className="block"><h3>YouTube titles</h3><ol>{pack.youtube_titles.map((x,i)=><li key={i}>{x}</li>)}</ol></section>}
     {outputs.tags&&<section className="block"><h3>Tags & hashtags</h3><p>{pack.tags.join(", ")}</p><div className="chips">{pack.hashtags.map(x=><span key={x}>{x}</span>)}</div></section>}
     {outputs.caption&&<section className="block"><h3>Instagram caption</h3><p className="pre">{pack.instagram_caption}</p></section>}
     {outputs.carousel&&<section className="block"><h3>Carousel storyboard</h3><div className="slides">{pack.carousel.map(x=><article key={x.slide}><small>SLIDE {x.slide}</small><b>{x.heading}</b><p>{x.body}</p><em>{x.visual}</em></article>)}</div></section>}
    </>}
   </section>
  </div>
  <footer>Ashishhh Studio AI · V4 starter · Deploy independently</footer>
 </main>;
}

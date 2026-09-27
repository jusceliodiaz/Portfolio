const projects = [
 {id:'mediterranean',name:'Mediterranean retreat',type:'Architecture',cover:'italy_4.jpg',note:'A coastal sequence exploring stone, soft daylight and the relationship between interior space and the sea.',images:['italy_4.jpg','italy_1.jpg','italy_5.jpg','italy_9.jpg','italy_8.jpg','italy_10.jpg','italy_2.jpg','italy_3.jpg']},
 {id:'casa-muze',name:'Casa Müze',type:'Immersive',cover:'muze.jpg',note:'An immersive architectural experience bringing real-scale architecture, real-time visualisation, sound and light together before construction.',images:['muze.jpg','muze2.jpg','muze3.jpg'],link:'https://www.youtube.com/watch?v=8n9Irv9ph9k',linkText:'Watch the experience'},
 {id:'beach-house',name:'Beach House',type:'Real-time',cover:'21.jpg',note:'An Unreal Engine 5 environment with a focus on lighting, materials and a cinematic approach to the coastal landscape.',images:['21.jpg','render_001.jpg','render_002.jpg','render_003.jpg','render_004.jpg'],link:'https://jdworks.gumroad.com/l/hhhoc',linkText:'Explore the UE5 environment'},
 {id:'tropical-residence',name:'Tropical residence',type:'Architecture',cover:'22.jpg',note:'A selection of residential views, from the surrounding landscape to intimate spaces shaped by timber, vegetation and light.',images:['22.jpg','29.jpg','25.jpg','26.jpg']},
 {id:'waterfront',name:'Waterfront perspectives',type:'Real-time',cover:'2.jpg',note:'Architectural visualisation at the water’s edge. A study of scale, coastal context and the spaces between buildings.',images:['2.jpg','espanha_1.jpg']},
 {id:'residential',name:'Residential studies',type:'Architecture',cover:'5.jpg',note:'Selected exterior and interior imagery exploring proportion, atmosphere and the connection to the landscape.',images:['5.jpg','24.jpg','20.jpg','32.jpg']}
];
const card = p => `<a class="tile" href="portfolio-v2.html?project=${p.id}"><div class="tile-image"><img src="images/${p.cover}" alt="${p.name} — architectural visualisation" loading="lazy" decoding="async"></div><div class="caption"><h3>${p.name} ↗</h3><span>${p.type}</span></div></a>`;
const selected = document.querySelector('#selected-grid');
if(selected) selected.innerHTML = projects.slice(0,4).map(card).join('');
const grid = document.querySelector('#portfolio-grid');
if(grid){
 const requested = new URLSearchParams(location.search).get('project');
 const project = projects.find(p => p.id === requested);
 if(project){
  document.title = `${project.name} — Juscélio Diaz`;
  document.querySelector('#portfolio-intro').hidden=true;
  document.querySelector('.filters').hidden=true;
  grid.hidden=true;
  const detail=document.querySelector('#project-detail');
  detail.hidden=false;
  detail.innerHTML=`<a class="text-link back" href="portfolio-v2.html">← All work</a><article class="project"><div class="project-heading"><div><span class="eyebrow">${project.type} / Selected work</span><h1>${project.name}</h1></div><p>${project.note}</p></div><div class="project-images">${project.images.map((src,i)=>`<button type="button" data-image="${i}" aria-label="Enlarge ${project.name}, image ${i+1}"><img src="images/${src}" alt="${project.name}, view ${i+1}" ${i?'loading="lazy"':'fetchpriority="high"'}></button>`).join('')}</div>${project.link?`<div class="project-links"><a class="text-link" href="${project.link}" target="_blank" rel="noopener">${project.linkText} ↗</a></div>`:''}</article>`;
  const dialog=document.querySelector('dialog');
  let active=0;
  const show=i=>{active=(i+project.images.length)%project.images.length;dialog.querySelector('img').src=`images/${project.images[active]}`;dialog.querySelector('img').alt=`${project.name}, view ${active+1}`;dialog.querySelector('[data-count]').textContent=`${active+1} / ${project.images.length}`;};
  detail.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{show(Number(button.dataset.image));dialog.showModal();document.body.style.overflow='hidden';}));
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{document.body.style.overflow='';});
  dialog.querySelector('[data-prev]').onclick=()=>show(active-1);
  dialog.querySelector('[data-next]').onclick=()=>show(active+1);
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();show(active+1);}if(event.key==='ArrowLeft'){event.preventDefault();show(active-1);}});
 }else{
  grid.innerHTML=projects.map(card).join('');
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
   document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   const matches=projects.filter(p=>button.dataset.filter==='All'||p.type===button.dataset.filter);
   grid.innerHTML=matches.map(card).join('');
   document.querySelector('#result-count').textContent=`${matches.length} ${matches.length === 1 ? 'collection' : 'collections'}`;
  }));
 }
}


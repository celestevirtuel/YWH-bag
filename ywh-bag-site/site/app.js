const C=window.YWH,$=s=>document.querySelector(s),view=$('#view');
const DEMO=window.YWH_DEMO||[];
let P=[],cart=JSON.parse(localStorage.getItem('ywh-cart')||'{}');
const money=v=>Number(v).toLocaleString('fr-FR')+' '+C.CURRENCY,esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function csv(t){const r=[];let row=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'&&t[i+1]=='"'){c+='"';i++}else if(ch=='"')q=false;else c+=ch}else if(ch=='"')q=true;else if(ch==','){row.push(c);c=''}else if(ch=='\n'){row.push(c);r.push(row);row=[];c=''}else if(ch!='\r')c+=ch}row.push(c);r.push(row);return r}
async function load(){if(!C.SHEET_CSV_URL){P=DEMO;return}
 try{const rows=csv(await (await fetch(C.SHEET_CSV_URL)).text()),h=rows[0].map(x=>x.trim().toLowerCase());
 P=rows.slice(1).filter(r=>r[0]).map(r=>{const o={};h.forEach((k,i)=>o[k]=(r[i]||'').trim());return{id:o.id||o.nom,nom:o.nom,prix:parseFloat(o.prix)||0,image:o.image,description:o.description,nouveau:/^(oui|1|true|vrai|x)$/i.test(o.nouveau),stock:o.stock}}).filter(p=>!/^(0|non|epuise)$/i.test(p.stock||'1'))}catch(e){P=DEMO}}
const ph=p=>`<div class="ph">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.nom)}" loading="lazy">`:`<img class="ghost" src="assets/logo.png" alt="">`}${p.nouveau?'<span class="tag">Nouveau</span>':''}</div>`;
const card=p=>`<article class="card">${ph(p)}<button class="quick" data-add="${esc(p.id)}">Ajouter au panier</button><h3>${esc(p.nom)}</h3><p class="pr">${money(p.prix)}</p>${p.description?`<p class="ds">${esc(p.description)}</p>`:''}</article>`;
const save=()=>{localStorage.setItem('ywh-cart',JSON.stringify(cart));$('#count').textContent=Object.values(cart).reduce((a,b)=>a+b,0)};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('show'),1800)}
const R={
'':()=>{const n=P.filter(p=>p.nouveau).slice(0,4),f=(n.length?n:P.slice(0,4));return `
<section class="hero"><div class="float">${ph(P[0]||{})}</div><div class="float">${ph(P[1]||{})}</div><div><img class="logo" src="assets/logo.png" alt="YWH bag"><p>Des sacs pour elle, doux, chics et pleins de caractère.</p><a class="btn" href="#produits">Découvrir les sacs</a></div></section>
<div class="mq" aria-hidden="true"><div>${'<span>Nouvelle collection</span><span>✿</span><span>Sacs pour femmes</span><span>✿</span>'.repeat(8)}</div></div>
<section class="wrap sec"><div class="head"><h2>Les nouveautés</h2><a class="btn alt" href="#nouveautes">Tout voir</a></div><div class="grid">${f.map(card).join('')}</div></section>
<section class="band"><h2>Un sac, c’est la touche qui change tout.</h2><a class="btn" href="#produits">Voir toute la collection</a></section>`},
produits:()=>`<div class="wrap"><div class="page-h"><h1>Produits</h1><p>Tous nos sacs, rien que pour elle.</p></div><div class="sec grid">${P.map(card).join('')}</div></div>`,
nouveautes:()=>{const n=P.filter(p=>p.nouveau);return `<div class="wrap"><div class="page-h"><h1>Nouveautés</h1><p>Les derniers modèles arrivés.</p></div>${n.length?`<div class="sec grid">${n.map(card).join('')}</div>`:'<p class="empty">Les prochains modèles arrivent bientôt.</p>'}</div>`},
panier:()=>{const L=Object.entries(cart).map(([id,q])=>({p:P.find(x=>x.id==id),q})).filter(x=>x.p),tot=L.reduce((a,x)=>a+x.p.prix*x.q,0);
 if(!L.length)return `<div class="wrap"><div class="page-h"><h1>Panier</h1></div><p class="empty">Ton panier est vide.<br><br><a class="btn" href="#produits">Voir les sacs</a></p></div>`;
 const msg=encodeURIComponent('Bonjour YWH bag, je souhaite commander :\n'+L.map(x=>`- ${x.p.nom} x${x.q}`).join('\n')+`\nTotal : ${money(tot)}`);
 const go=C.WHATSAPP?`https://wa.me/${C.WHATSAPP}?text=${msg}`:C.EMAIL?`mailto:${C.EMAIL}?subject=Commande&body=${msg}`:'#contact';
 return `<div class="wrap"><div class="page-h"><h1>Panier</h1></div><div class="cart"><div>${L.map(x=>`<div class="line">${ph(x.p)}<div><h3>${esc(x.p.nom)}</h3><div class="qty"><button data-q="${esc(x.p.id)}" data-d="-1" aria-label="Moins">−</button><span>${x.q}</span><button data-q="${esc(x.p.id)}" data-d="1" aria-label="Plus">+</button></div><button class="rm" data-rm="${esc(x.p.id)}">Retirer</button></div><b>${money(x.p.prix*x.q)}</b></div>`).join('')}</div><aside class="sum"><h3>Récapitulatif</h3><div class="t"><span>Total</span><span>${money(tot)}</span></div><a class="btn" href="${go}" style="display:block;text-align:center">Envoyer ma commande</a></aside></div></div>`},
contact:()=>`<div class="wrap"><div class="page-h"><h1>Contact</h1><p>Une question, un modèle qui te plaît ? Écris-nous.</p></div><div class="sec"><div class="links">${C.WHATSAPP?`<a class="btn" href="https://wa.me/${C.WHATSAPP}">WhatsApp</a>`:''}${C.INSTAGRAM?`<a class="btn alt" href="${C.INSTAGRAM}">Instagram</a>`:''}</div><form class="ct" id="cf"><input name="n" placeholder="Ton prénom" required aria-label="Prénom"><input name="e" type="email" placeholder="Ton e-mail" required aria-label="E-mail"><textarea name="m" placeholder="Ton message" required aria-label="Message"></textarea><button class="btn">Envoyer le message</button></form></div></div>`};
function route(){const r=(location.hash.replace(/^#\/?/,'')||'');const k=R[r]?r:'';view.innerHTML=R[k]();document.querySelectorAll('[data-r]').forEach(a=>a.classList.toggle('on',a.dataset.r===k));scrollTo(0,0);
 const cf=$('#cf');if(cf)cf.onsubmit=e=>{e.preventDefault();const d=new FormData(cf),t=encodeURIComponent(`${d.get('m')}\n\n${d.get('n')} — ${d.get('e')}`);if(C.EMAIL)location.href=`mailto:${C.EMAIL}?subject=Message YWH bag&body=${t}`;else if(C.WHATSAPP)location.href=`https://wa.me/${C.WHATSAPP}?text=${t}`;else toast('Contact bientôt disponible')}}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.add){cart[t.dataset.add]=(cart[t.dataset.add]||0)+1;save();toast('Ajouté au panier')}
 if(t.dataset.q){const id=t.dataset.q;cart[id]=Math.max(1,(cart[id]||1)+ +t.dataset.d);save();route()}
 if(t.dataset.rm){delete cart[t.dataset.rm];save();route()}});
const mn=document.createElement('nav');mn.className='mnav';mn.innerHTML='<a href="#accueil" data-r="">Accueil</a><a href="#produits" data-r="produits">Produits</a><a href="#nouveautes" data-r="nouveautes">Nouveau</a><a href="#contact" data-r="contact">Contact</a>';document.body.append(mn);
addEventListener('hashchange',route);load().then(()=>{save();route()});

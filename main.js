(function(){
  var root=document.documentElement;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage=document.getElementById('stage');
  var video=document.getElementById('heroVideo');

  requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('go');});});

  function tryPlay(){
    video.muted=true;
    try{var p=video.play(); if(p&&p.catch){p.catch(function(){});}}catch(e){}
  }
  if(reduce){ video.removeAttribute('autoplay'); video.pause(); }
  else{
    {
      tryPlay();
      video.addEventListener('canplay',tryPlay,{once:true});
      /* If the browser held autoplay back, start on the first interaction. */
      ['pointerdown','keydown','scroll','touchstart'].forEach(function(ev){
        window.addEventListener(ev,function h(){ if(video.paused) tryPlay(); window.removeEventListener(ev,h); },{passive:true});
      });
      document.addEventListener('visibilitychange',function(){ if(!document.hidden && video.paused) tryPlay(); });
    }
    /* The loop lights the ground-floor switchgear room for roughly the first and last 2.5s.
       While it is lit, the service + distribution trace runs hot. */
    var live=false;
    (function tick(){
      var t=video.currentTime, d=video.duration||15.9;
      var on=!video.paused && (t<2.4 || t>d-2.4);
      if(on!==live){ live=on; stage.classList.toggle('energized',on); }
      requestAnimationFrame(tick);
    })();
  }
  setTimeout(function(){root.classList.add('settled');},reduce?0:4600);

  /* ground to power */
  var sec=document.getElementById('g2p');
  var dwg=document.getElementById('dwg');
  var layers=[].slice.call(dwg.querySelectorAll('.layer'));
  var items=[].slice.call(document.querySelectorAll('#steps li'));
  var current=0;
  root.classList.add('staged-ready');
  dwg.classList.add('staged','staged-svg');

  function setStage(n){
    if(n===current) return; current=n;
    layers.forEach(function(g,i){
      g.classList.toggle('on',i<n);
      g.classList.toggle('current',i===n-1);
    });
    items.forEach(function(li,i){
      li.classList.toggle('active',i===n-1);
      li.classList.toggle('done',i<n-1);
    });
  }
  function onScroll(){
    if(reduce){ setStage(4); items.forEach(function(li){li.querySelector('button').style.setProperty('--p','100%');}); return; }
    var r=sec.getBoundingClientRect();
    var total=sec.offsetHeight-window.innerHeight;
    var p=Math.min(1,Math.max(0,-r.top/Math.max(1,total)));
    var n=Math.min(4,1+Math.floor(p*4*0.999));
    setStage(n);
    items.forEach(function(li,i){
      var f=Math.min(1,Math.max(0,p*4-i));
      li.querySelector('button').style.setProperty('--p',(f*100).toFixed(1)+'%');
    });
  }
  items.forEach(function(li,i){
    li.querySelector('button').addEventListener('click',function(){
      if(reduce) return;
      var total=sec.offsetHeight-window.innerHeight;
      var y=sec.getBoundingClientRect().top+window.scrollY+total*((i+.5)/4);
      window.scrollTo({top:y,behavior:'smooth'});
    });
  });
  var mq=matchMedia('(max-width:760px)');
  function vb(){dwg.setAttribute('viewBox',mq.matches?'50 80 1000 430':'0 0 1200 520');}
  vb(); mq.addEventListener&&mq.addEventListener('change',vb);
  setStage(1);
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  onScroll();
})();


/* ---------- Services: click a tile, a card opens, tiles reflow around it ---------- */
(function(){
  var root=document.getElementById('services'); if(!root) return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var card=document.createElement('li'); card.className='sv-card'; card.setAttribute('role','region'); card.setAttribute('aria-live','polite');
  card.innerHTML='<button class="x" type="button" aria-label="Close">\u00d7</button><span class="mono k"></span><h4></h4><p></p>';
  var active=null;
  function tiles(){return [].slice.call(root.querySelectorAll('.items > li:not(.sv-card)'));}
  function flip(change){
    var els=tiles(), first=els.map(function(el){return el.getBoundingClientRect();});
    change();
    if(reduce||!els[0].animate) return;
    els.forEach(function(el,i){
      var r=el.getBoundingClientRect(), dx=first[i].left-r.left, dy=first[i].top-r.top;
      if(dx||dy) el.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'none'}],{duration:380,easing:'cubic-bezier(.2,.7,.2,1)'});
    });
  }
  function close(){
    if(!active) return;
    flip(function(){card.remove(); active.classList.remove('on'); active.setAttribute('aria-expanded','false');});
    active=null;
  }
  function open(btn){
    flip(function(){
      if(active){active.classList.remove('on'); active.setAttribute('aria-expanded','false');}
      var list=btn.closest('.items');
      card.querySelector('.k').textContent=list.getAttribute('data-group')||'';
      card.querySelector('h4').textContent=btn.getAttribute('data-title');
      card.querySelector('p').textContent=btn.getAttribute('data-info');
      list.insertBefore(card,list.firstChild);
      btn.classList.add('on'); btn.setAttribute('aria-expanded','true');
      active=btn;
    });
    card.style.animation='none'; void card.offsetWidth; card.style.animation='';
  }
  root.addEventListener('click',function(ev){
    var btn=ev.target.closest('.items button[data-info]');
    if(btn){ if(btn===active) close(); else open(btn); return; }
    if(ev.target.closest('.sv-card .x')) close();
  });
  document.addEventListener('keydown',function(ev){ if(ev.key==='Escape') close(); });
})();

/* ---------- Why us: each point slides in from the right as it scrolls into view ---------- */
(function(){
  var items=[].slice.call(document.querySelectorAll('.why-list li'));
  if(!items.length) return;
  if(!('IntersectionObserver' in window)){items.forEach(function(li){li.classList.add('in');});return;}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){ if(en.isIntersecting){en.target.classList.add('in'); io.unobserve(en.target);} });
  },{threshold:.35,rootMargin:'0px 0px -8% 0px'});
  items.forEach(function(li){io.observe(li);});
})();

/* ---------- Quote form ---------- */
(function(){
  var f=document.getElementById('quote'); if(!f) return;
  var st=document.getElementById('quoteStatus');
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    if(f._honey.value) return;
    if(!f.checkValidity()){ st.textContent='Please fill in your name, phone and what you need done.'; f.reportValidity(); return; }
    var url=f.getAttribute('data-endpoint');
    if(!url){ st.textContent='Prototype: this form is not connected yet. Please call 402.498.9585.'; return; }
    st.textContent='Sending\u2026';
    fetch(url,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(f)}).then(function(r){return r.json().then(function(d){if(!r.ok||d.success===false||d.success==='false') throw 0; return d;});}).then(function(){
      f.reset(); st.textContent='Thanks. We will be in touch shortly.';
    }).catch(function(){ st.textContent='Could not send. Please call 402.498.9585.'; });
  });
})();

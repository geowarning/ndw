/* Delayed, keyboard-accessible explanations attached to displayed units. */
(function () {
  var timer, active, tooltip;
  var definitions = {
    M: ['地震震级：表示地震大小的对数尺度，并非当地震动烈度。','Earthquake magnitude: a logarithmic measure of event size, not local shaking intensity.'],
    MMI: ['修订麦加利烈度：表示特定地点感受到的震动强度。','Modified Mercalli Intensity: shaking intensity experienced at a particular location.'],
    km: ['千米：距离或深度单位，1 km = 1,000 m。','Kilometres: distance or depth; 1 km = 1,000 metres.'],
    area: ['平方千米：面积单位，1 km² = 1,000,000 m²。','Square kilometres: area; 1 km² = 1,000,000 square metres.'],
    ha: ['公顷：面积单位，1 ha = 10,000 m² = 0.01 km²。','Hectares: area; 1 ha = 10,000 square metres = 0.01 km².'],
    speed: ['千米每小时：速度单位。','Kilometres per hour: a measure of speed.'],
    mph: ['英里每小时：速度单位，1 mph ≈ 1.609 km/h。','Miles per hour: speed; 1 mph ≈ 1.609 km/h.'],
    ms: ['米每秒：速度单位，1 m/s = 3.6 km/h。','Metres per second: speed; 1 m/s = 3.6 km/h.'],
    deg: ['度：经纬度的角度单位，用于标记地球上的位置。','Degrees: latitude/longitude angles locating a point on Earth.']
  };
  function hide() { clearTimeout(timer); if(active)active.removeAttribute('aria-describedby');active=null;if(tooltip)tooltip.hidden=true; }
  function show(el) {
    hide();active=el;
    timer=setTimeout(function(){
      if(!el.isConnected)return hide();
      if(!tooltip){tooltip=document.createElement('div');tooltip.id='unit-help-tooltip';tooltip.className='unit-help-tooltip';tooltip.setAttribute('role','tooltip');document.body.appendChild(tooltip);}
      var language=window.__modules.i18n.getLang();tooltip.textContent=window.NDLocale.phrase(definitions[el.dataset.unit][0],definitions[el.dataset.unit][1],language);tooltip.hidden=false;el.setAttribute('aria-describedby',tooltip.id);
      var rect=el.getBoundingClientRect(), box=tooltip.getBoundingClientRect();
      tooltip.style.left=Math.max(8,Math.min(innerWidth-box.width-8,rect.left))+'px';
      tooltip.style.top=(rect.bottom+box.height+12<innerHeight?rect.bottom+8:Math.max(8,rect.top-box.height-8))+'px';
    },600);
  }
  function enhance(root) {
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[],node;
    while((node=walker.nextNode()))if(node.parentElement&&!node.parentElement.closest('[data-unit],svg,script,style,select,textarea,.unit-help-tooltip'))nodes.push(node);
    nodes.forEach(function(node){
      var re=/\b(?:MMI|M(?:[<>≥≤]?\d+(?:\.\d+)?\+?)|km\/h|km[²2]|km|ha|mph|m\/s)(?![a-zA-Z0-9])|°/g, text=node.nodeValue,match,last=0,fragment=document.createDocumentFragment();
      while((match=re.exec(text))){
        fragment.appendChild(document.createTextNode(text.slice(last,match.index)));
        var unit=match[0],key=unit==='MMI'?'MMI':unit[0]==='M'?'M':unit==='km/h'?'speed':/^km[²2]$/.test(unit)?'area':unit==='m/s'?'ms':unit==='°'?'deg':unit;
        var span=document.createElement('span');span.className='unit-help';span.dataset.unit=key;span.tabIndex=0;span.textContent=unit;
        span.setAttribute('aria-label',unit+' · '+window.NDLocale.text('Unit explanation',window.__modules.i18n.getLang()));
        fragment.appendChild(span);last=re.lastIndex;
      }
      if(last){fragment.appendChild(document.createTextNode(text.slice(last)));node.replaceWith(fragment);}
    });
  }
  document.addEventListener('pointerover',function(e){var el=e.target.closest('[data-unit]');if(el&&el!==active)show(el);});
  document.addEventListener('pointerout',function(e){if(active&&e.target.closest('[data-unit]')===active&&!active.contains(e.relatedTarget))hide();});
  document.addEventListener('focusin',function(e){if(e.target.matches('[data-unit]'))show(e.target);});
  document.addEventListener('focusout',function(e){if(e.target.matches('[data-unit]'))hide();});
  document.addEventListener('click',function(e){var el=e.target.closest('[data-unit]');if(el)show(el);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')hide();});
  window.addEventListener('hashchange',hide);window.addEventListener('scroll',hide,true);
  window.NDUnits={enhance:enhance};
})();

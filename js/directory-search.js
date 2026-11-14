/* Unicode-aware, ordered substring matching shared by directory searches. */
(function(root){
  function fold(value){return String(value||'').normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase().replace(/\s+/g,' ').trim();}
  var nameCache={},termCache=new WeakMap();
  function names(iso){if(nameCache[iso])return nameCache[iso];return nameCache[iso]= ['zh','en','es','fr','it','ar'].map(function(locale){try{return new Intl.DisplayNames([locale],{type:'region'}).of(iso);}catch(e){return '';}});}
  function terms(r){if(termCache.has(r))return termCache.get(r);var result=[r.organization,r.region,r.iso,r.iso3,r.city,r.state,r.services].concat(r.serviceScope?[r.serviceScope.description.en,r.serviceScope.description.zh].concat(r.serviceScope.locations||[]):[]).concat(r.aliases||[],r.iso?names(r.iso):[]).map(fold).filter(Boolean);termCache.set(r,result);return result;}
  function matches(r,q){var needle=fold(q);return !needle||terms(r).some(function(term){return term.includes(needle);});}
  var api={fold:fold,matches:matches,names:names};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.NDDirectorySearch=api;
})(typeof window==='object'?window:globalThis);

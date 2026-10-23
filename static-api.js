'use strict';
window.PDMStatic=(()=>{
 const jsonCache=new Map(),documentCache=new Map(),textCache=new Map(),pending=new Map();
 let worker,workerReady,serial=0;
 const root=new URL('./',document.baseURI);
 const normalize=value=>String(value).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replaceAll('’',"'");
 async function read(path){
  if(location.protocol==='file:')throw Error('Cette version doit être ouverte depuis un hébergement web ou le serveur de prévisualisation, pas par double-clic sur index.html.');
  if(!jsonCache.has(path))jsonCache.set(path,fetch(new URL(path,root)).then(async response=>{
   if(!response.ok)throw Error('Fichier indisponible : '+path);
   const value=await response.json();
   if(path==='data/catalog.json'){
    const terms=new Map(value.terms.map(term=>[term.id,term]));
    const groups={concepts:'concept',persons:'person',places:'place',organizations:'organization',events:'event',heritage_entities:'heritage'};
    for(const record of value.documents){record.tags=record.tag_ids.map(id=>terms.get(id));for(const [key,type]of Object.entries(groups))record[key]=record.tags.filter(t=>t.type===type&&t.status!=='rejected').map(t=>t.label);}
   }
   return value;
  }).catch(error=>{jsonCache.delete(path);throw error;}));
  return jsonCache.get(path);
 }
 function call(message){const id=++serial;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});worker.postMessage({...message,id});});}
 async function ready(){
  if(!workerReady)workerReady=(async()=>{
   const catalog=await read('data/catalog.json');
   worker=new Worker(new URL('search-worker.js',root));
   worker.onmessage=({data})=>{const task=pending.get(data.id);if(!task)return;pending.delete(data.id);data.error?task.reject(Error(data.error)):task.resolve(data.value);};
   worker.onerror=()=>{for(const task of pending.values())task.reject(Error('Le moteur de recherche n’a pas pu démarrer.'));pending.clear();};
   await call({type:'init',catalog:{documents:catalog.documents},lengths:catalog.search.lengths,averageLength:catalog.search.averageLength});
  })();
  return workerReady;
 }
 async function fullDocument(id){
  if(!/^PDM-\d+$/.test(id))throw Error('Identifiant de notice invalide');
  if(!documentCache.has(id))documentCache.set(id,read('data/documents/'+id+'.json'));
  return documentCache.get(id);
 }
 async function snippet(record,query){
  const words=normalize(query).match(/[\p{L}\p{N}]+/gu)||[];
  if(!words.length)return record.excerpt;
  if(!textCache.has(record.id))textCache.set(record.id,read('data/texts/'+record.id+'.json'));
  const text=await textCache.get(record.id),normalized=normalize(text);
  let start=-1;for(const word of words){const position=normalized.indexOf(word);if(position>=0&&(start<0||position<start))start=position;}
  // Certaines requêtes portent uniquement sur la notice, sans occurrence dans la transcription.
  return start>=0?text.slice(Math.max(0,start-90),Math.max(0,start-90)+330):record.title;
 }
 async function enrich(results,query,start=0,end=30){
  if(!query?.trim())return;
  const slice=results.slice(start,end);let next=0;
  await Promise.all(Array.from({length:Math.min(6,slice.length)},async()=>{while(next<slice.length){const record=slice[next++];record.excerpt=await snippet(record,query);}}));
 }
 async function api(path,options){
  if(options?.method&&options.method!=='GET')throw Error('Version de consultation : les modifications sont réservées à l’application locale.');
  const url=new URL(path,'https://static.invalid');
  if(url.pathname==='/api/corpus')return read('data/catalog.json');
  if(url.pathname.startsWith('/api/document/'))return fullDocument(decodeURIComponent(url.pathname.split('/').at(-1)));
  if(url.pathname==='/api/validation-log')return [];
  if(url.pathname==='/api/search'){
   await ready();const catalog=await read('data/catalog.json'),query=url.searchParams.get('q')||'';
   const result=await call({type:'search',params:Object.fromEntries(url.searchParams)});
   const results=result.ids.map(index=>({...catalog.documents[index]}));
   await enrich(results,query);
   return {count:result.count,results,facets:result.facets};
  }
  throw Error('Cette action n’est pas disponible dans la version statique.');
 }
 return {api,enrich};
})();

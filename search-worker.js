'use strict';
let catalog, lengths, averageLength, revision;
const shards = new Map();
const fields = {minister:'minister',theme:'concepts',place:'places',person:'persons',organization:'organizations',heritage:'heritage_entities',event:'events',type:'document_type'};
const normalize = value => String(value).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replaceAll('’',"'");
const tokens = value => [...new Set(normalize(value).match(/[\p{L}\p{N}]+/gu)||[])];
function shardNumber(word){let hash=2166136261;for(const c of word){hash=Math.imul((hash^c.codePointAt(0))>>>0,16777619)>>>0;}return hash&63;}
async function postings(word){
 const number=shardNumber(word),name=number.toString(16).padStart(2,'0');
 if(!shards.has(number))shards.set(number,fetch(new URL('search/'+name+'.json?v='+encodeURIComponent(revision),self.location),{cache:'no-cache'}).then(async response=>{if(!response.ok)throw Error('Index de recherche indisponible');return response.json();}));
 return (await shards.get(number))[word]||[];
}
async function search(params){
 const query=params.q||'', words=tokens(query),scores=new Map();
 let matches=null;
 if(words.length){
  const lists=await Promise.all(words.map(postings));
  for(const list of lists){
   const ids=new Set(list.map(p=>p[0]));
   matches=matches===null?ids:new Set([...matches].filter(id=>ids.has(id)));
   const idf=Math.log(1+(catalog.documents.length-list.length+.5)/(list.length+.5));
   for(const [id,tf] of list){const weight=idf*(tf*2.2)/(tf+1.2*(.25+.75*lengths[id]/averageLength));scores.set(id,(scores.get(id)||0)+weight);}
  }
 }else if(query.trim()){matches=new Set();}
 let ids=catalog.documents.map((_,index)=>index).filter(index=>matches===null||matches.has(index));
 for(const [key,field]of Object.entries(fields))if(params[key])ids=ids.filter(id=>Array.isArray(catalog.documents[id][field])?catalog.documents[id][field].includes(params[key]):catalog.documents[id][field]===params[key]);
 for(const [key,compare]of [['from',(a,b)=>a>=b],['to',(a,b)=>a<=b]])if(params[key])ids=ids.filter(id=>catalog.documents[id].year!=null&&compare(catalog.documents[id].year,Number(params[key])));
 ids.sort(words.length?(a,b)=>(scores.get(b)||0)-(scores.get(a)||0)||a-b:(a,b)=>(catalog.documents[b].date||'').localeCompare(catalog.documents[a].date||''));
 const facets={};
 for(const [key,field]of Object.entries(fields)){
  const counts=new Map();for(const id of ids){const value=catalog.documents[id][field];for(const label of new Set(Array.isArray(value)?value:[value]))if(label!=null)counts.set(label,(counts.get(label)||0)+1);}
  facets[key]=[...counts].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]),'fr')).map(([label,count])=>({label,count}));
 }
 const years=new Map();for(const id of ids){const year=catalog.documents[id].year;if(year)years.set(year,(years.get(year)||0)+1);}
 facets.year=[...years].sort((a,b)=>a[0]-b[0]).map(([year,count])=>({label:String(year),count}));
 return {count:ids.length,ids,facets};
}
self.onmessage=async ({data})=>{
 try{
  if(data.type==='init'){catalog=data.catalog;lengths=data.lengths;averageLength=data.averageLength;revision=data.revision||'static';self.postMessage({id:data.id,value:true});return;}
  self.postMessage({id:data.id,value:await search(data.params)});
 }catch(error){self.postMessage({id:data.id,error:error.message});}
};

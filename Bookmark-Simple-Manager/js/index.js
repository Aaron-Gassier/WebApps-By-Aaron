const STORAGE_KEY = "myWebAppsGrid";
const LOG_KEY = "myWebAppsLog";
const MAX_CELLS = 100;
const MS = 1000, DAY = 86400*MS, WEEK = 7*DAY, MONTH = 30*DAY, YEAR = 365*DAY;
const PERIODS = [
  {key:"day", label:"Past 24 h", span:DAY},
  {key:"week", label:"Past Week", span:WEEK},
  {key:"month", label:"Past Month", span:MONTH},
  {key:"year", label:"Past Year", span:YEAR},
  {key:"all", label:"All‑Time", span:Infinity}
];
/* ---------- helpers ---------- */
function loadApps(){let arr;try{arr=JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{arr=[]}const filled=new Array(MAX_CELLS).fill(null);for(let i=0;i<Math.min(arr.length,MAX_CELLS);i++)filled[i]=arr[i];return filled;}
function saveApps(a){localStorage.setItem(STORAGE_KEY,JSON.stringify(a));}
function makeFavicon(url){try{return new URL(url).origin+"/favicon.ico"}catch{return""}}
function loadLogs(){try{return JSON.parse(localStorage.getItem(LOG_KEY))||[]}catch{return[]}}
function saveLogs(l){localStorage.setItem(LOG_KEY,JSON.stringify(l))}
function recordClick(name,url){const logs=loadLogs();logs.push({ts:Date.now(),name,url});saveLogs(logs);renderStats();}
function csvEscape(v){return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function downloadCSV(){const logs=loadLogs();let csv="timestamp,iso_date,name,url\n";logs.forEach(l=>{csv+=`${l.ts},${new Date(l.ts).toISOString()},${csvEscape(l.name)},${csvEscape(l.url)}\n`});const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="bookmark-usage-log.csv";a.style.display="none";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);}
/* ---------- stats ---------- */
function buildLeaderboards(){const container=document.getElementById("leaderboards");container.innerHTML="";const logs=loadLogs();const now=Date.now();PERIODS.forEach(p=>{
  const counts={};
  logs.forEach(l=>{if(now-l.ts<=p.span){counts[l.name]=(counts[l.name]||0)+1}});
  const items=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const board=document.createElement("div");board.className="board";
  const h3=document.createElement("h3");h3.textContent=p.label;board.appendChild(h3);
  const ol=document.createElement("ol");items.slice(0,10).forEach(([name,c])=>{const li=document.createElement("li");li.textContent=`${name} – ${c}`;ol.appendChild(li);});if(items.length===0){const li=document.createElement("li");li.textContent="No data";ol.appendChild(li);}board.appendChild(ol);
  container.appendChild(board);
});}
function renderStats(){buildLeaderboards();}
/* ---------- grid / drag & drop ---------- */
function createTile(app,index,apps){const {name,url}=app;const a=document.createElement("a");a.href=url;a.className="tile";a.target="_blank";a.rel="noopener";a.draggable=true;
  a.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",index);a.classList.add("dragging")});
  a.addEventListener("dragend",()=>a.classList.remove("dragging"));
  a.addEventListener("click",()=>recordClick(name,url));
  const gear=document.createElement("button");gear.className="settings-btn";gear.textContent="⚙️";gear.title="Options";gear.addEventListener("click",e=>onSettings(e,index,apps));
  const icon=document.createElement("div");icon.className="tile-icon";
  const img=document.createElement("img");img.src=makeFavicon(url);img.alt="";img.loading="lazy";img.onerror=()=>{icon.textContent=name[0]?.toUpperCase()||"?"};icon.appendChild(img);
  const label=document.createElement("div");label.className="tile-label";label.textContent=name;
  a.appendChild(gear);a.appendChild(icon);a.appendChild(label);return a;}
function onSettings(e,index,apps){e.preventDefault();e.stopPropagation();const choice=prompt("Type R to rename this bookmark or D to delete it (cancel to exit):");if(!choice)return;const first=choice.trim().toLowerCase()[0];if(first==="r"){const newName=prompt("Enter the new name:",apps[index].name);if(newName&&newName.trim()){apps[index].name=newName.trim();saveApps(apps);render();}}else if(first==="d"){if(confirm(`Delete '${apps[index].name}'?`)){apps[index]=null;saveApps(apps);render();}}}
function render(){const grid=document.getElementById("grid");grid.innerHTML="";const apps=loadApps();
  for(let i=0;i<MAX_CELLS;i++){const cell=document.createElement("div");cell.className="cell";cell.dataset.index=i;
    cell.addEventListener("dragover",e=>{e.preventDefault();cell.classList.add("drag-over")});
    cell.addEventListener("dragleave",()=>cell.classList.remove("drag-over"));
    cell.addEventListener("drop",e=>{e.preventDefault();cell.classList.remove("drag-over");const fromIndex=parseInt(e.dataTransfer.getData("text/plain"),10);const toIndex=i;if(fromIndex===toIndex)return;const temp=apps[fromIndex];apps[fromIndex]=apps[toIndex];apps[toIndex]=temp;saveApps(apps);render();});
    const app=apps[i];if(app)cell.appendChild(createTile(app,i,apps));grid.appendChild(cell);
  }}
/* ---------- add button ---------- */
document.getElementById("add-btn").addEventListener("click",()=>{const url=prompt("Enter the website URL (include https://)");if(!url)return;const name=prompt("Name for this website:");if(!name)return;const apps=loadApps();const emptyIndex=apps.findIndex(x=>x===null);if(emptyIndex===-1){alert("All 100 cells are full! Delete or move something first.");return;}apps[emptyIndex]={name:name.trim(),url:url.trim()};saveApps(apps);render();});
document.getElementById("download-log").addEventListener("click",downloadCSV);
/* ---------- initial render ---------- */
render();renderStats();
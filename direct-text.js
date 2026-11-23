/** NotaPDF Studio 2.2 — rich, directly burnt PDF text boxes.
 * Kept separate from the legacy pop-up editor, selection engine and marks.
 * Uses no new runtime dependencies; standard PDF fonts are embedded on demand.
 */
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const FONT_CHOICES=Object.freeze({'Arial':'Arial','Times New Roman':'Times New Roman','Courier New':'Courier New'});
const LINE_HEIGHTS=[0.95,1,1.05,1.15];
const COLOR_RE=/^#[\da-f]{6}$/i;
const sizeOf=b=>clamp(Number(b.fontSize)||14,6,72);
const spacingOf=b=>LINE_HEIGHTS.includes(Number(b.lineHeight))?Number(b.lineHeight):1;
const alignmentOf=b=>['left','center','right'].includes(b.align)?b.align:'left';
const colorOf=b=>COLOR_RE.test(b.color||'')?b.color.toLowerCase():'#161616';
const familyOf=b=>FONT_CHOICES[b.fontFamily]||'Arial';
const toHex=value=>{
 if(typeof value!=='string')return null;
 if(COLOR_RE.test(value.trim()))return value.trim().toLowerCase();
 const short=/^#([0-9a-f]{3})$/i.exec(value.trim());
 if(short)return '#'+[...short[1]].map(c=>c+c).join('').toLowerCase();
 const rgb=/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(value.trim());
 if(rgb&&(!rgb[4]||Number(rgb[4])>0))return '#'+rgb.slice(1,4).map(c=>clamp(Number(c),0,255).toString(16).padStart(2,'0')).join('');
 return null;
};
const cssFamily=value=>/courier|monospace/i.test(value)?'Courier New':/times|georgia|serif/i.test(value)&&!/sans-serif/i.test(value)?'Times New Roman':'Arial';
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const legacyHtml=box=>htmlEscape(box.text||'').replace(/\r\n?|\n/g,'<br>');
const allowedTags=new Set(['B','STRONG','I','EM','U','SPAN','FONT','DIV','P','BR']);

/** Strip links, event handlers, images and unrecognized styles before persistence and rendering. */
export function sanitizeDirectTextHtml(html){
 const wrapper=document.createElement('div');wrapper.innerHTML=String(html||'').slice(0,300000);
 const clean=document.createElement('div');
 function visit(source,parent){
  for(const child of source.childNodes){
   if(child.nodeType===3){parent.append(document.createTextNode(child.nodeValue||''));continue;}
   if(child.nodeType!==1)continue;
   if(['SCRIPT','STYLE','IFRAME','SVG','OBJECT','FORM','IMG'].includes(child.tagName))continue;
   const allowed=allowedTags.has(child.tagName);
   const result=allowed?document.createElement(child.tagName.toLowerCase()):document.createDocumentFragment();
   if(allowed&&child.tagName==='FONT'){
    const color=toHex(child.getAttribute('color'));if(color)result.setAttribute('color',color);
    const face=child.getAttribute('face');if(face)result.setAttribute('face',cssFamily(face));
   }
   if(allowed){
    const style=child.style;
    const color=toHex(style.color),background=toHex(style.backgroundColor);
    if(color)result.style.color=color;
    if(background)result.style.backgroundColor=background;
    if(style.fontWeight==='bold'||Number(style.fontWeight)>=600)result.style.fontWeight='bold';
    if(style.fontStyle==='italic')result.style.fontStyle='italic';
    if(style.textDecorationLine.includes('underline')||style.textDecoration.includes('underline'))result.style.textDecoration='underline';
    if(style.fontFamily)result.style.fontFamily=cssFamily(style.fontFamily);
    if(style.fontSize){const size=parseFloat(style.fontSize);if(Number.isFinite(size))result.style.fontSize=clamp(size,6,72)+'px';}
   }
   if(child.tagName==='BR'&&allowed){parent.append(result);continue;}
   visit(child,result);parent.append(result);
  }
 }
 visit(wrapper,clean);
 return clean.innerHTML.slice(0,300000);
}

/** DOM traversal turns a safe HTML fragment into text runs with per-selection formatting. */
export function directTextRuns(box){
 const shell=document.createElement('div');shell.innerHTML=sanitizeDirectTextHtml(box.html??legacyHtml(box));
 const base={fontFamily:familyOf(box),fontSize:sizeOf(box),color:colorOf(box),background:null,bold:false,italic:false,underline:false};
 const out=[];
 function append(text,style){if(!text)return;const last=out[out.length-1];const same=last&&JSON.stringify(last.style)===JSON.stringify(style);if(same)last.text+=text;else out.push({text,style:{...style}});}
 function newline(){const last=out[out.length-1];if(!last||last.text.endsWith('\n'))return;append('\n',base);}
 function visit(node,style){
  if(node.nodeType===3){append((node.nodeValue||'').replace(/\r\n?/g,'\n').replace(/\t/g,'    '),style);return;}
  if(node.nodeType!==1)return;
  const tag=node.tagName;
  if(tag==='BR'){append('\n',style);return;}
  const block=tag==='DIV'||tag==='P';
  if(block&&out.length)newline();
  const next={...style};
  if(['B','STRONG'].includes(tag))next.bold=true;
  if(['I','EM'].includes(tag))next.italic=true;
  if(tag==='U')next.underline=true;
  if(tag==='FONT'){
   if(node.getAttribute('color'))next.color=toHex(node.getAttribute('color'))||next.color;
   if(node.getAttribute('face'))next.fontFamily=cssFamily(node.getAttribute('face'));
  }
  const css=node.style;
  if(css.fontWeight==='bold'||Number(css.fontWeight)>=600)next.bold=true;
  if(css.fontStyle==='italic')next.italic=true;
  if(css.textDecorationLine.includes('underline')||css.textDecoration.includes('underline'))next.underline=true;
  if(css.fontFamily)next.fontFamily=cssFamily(css.fontFamily);
  if(css.fontSize){const val=parseFloat(css.fontSize);if(Number.isFinite(val))next.fontSize=clamp(val,6,72);}
  if(css.color)next.color=toHex(css.color)||next.color;
  if(css.backgroundColor)next.background=toHex(css.backgroundColor)||next.background;
  for(const child of node.childNodes)visit(child,next);
  if(block&&node.nextSibling)newline();
 }
 for(const child of shell.childNodes)visit(child,base);
 // A trailing DOM paragraph separator is not an extra line in the PDF.
 if(out.length&&out[out.length-1].text==='\n')out.pop();
 return out;
}

/** Character-wise metrics preserve formatting across word boundaries and wrap long words. */
export function layoutDirectTextRuns(runs,width,defaultFontSize,lineMultiplier,fontFor){
 const glyphs=[];
 for(const run of runs){
  const font=fontFor(run.style);
  for(const c of Array.from(run.text)){
   const char=c==='\t'?'    ':c;
   glyphs.push({char,style:run.style,font,width:char==='\n'?0:font.widthOfTextAtSize(char,run.style.fontSize)});
  }
 }
 const lines=[];let current=[];let lineWidth=0;
 const push=()=>{while(current.length&&/^\s$/u.test(current.at(-1).char)) {lineWidth-=current.at(-1).width;current.pop();}lines.push({glyphs:current,width:Math.max(0,lineWidth),maxSize:Math.max(defaultFontSize,...current.map(x=>x.style.fontSize))});current=[];lineWidth=0;};
 function add(g){if(!current.length&&/^\s$/u.test(g.char))return;current.push(g);lineWidth+=g.width;}
 let i=0;
 while(i<glyphs.length){
  if(glyphs[i].char==='\n'){push();i++;continue;}
  const whitespace=/^\s$/u.test(glyphs[i].char);
  let j=i+1;while(j<glyphs.length&&glyphs[j].char!=='\n'&&/^\s$/u.test(glyphs[j].char)===whitespace)j++;
  const group=glyphs.slice(i,j),w=group.reduce((sum,g)=>sum+g.width,0);
  if(!whitespace&&current.length&&lineWidth+w>width+.02)push();
  for(const glyph of group){
   if(current.length&&lineWidth+glyph.width>width+.02&&!whitespace)push();
   if(whitespace&&current.length&&lineWidth+glyph.width>width+.02){push();break;}
   add(glyph);
  }
  i=j;
 }
 if(current.length||!lines.length||(glyphs.at(-1)?.char==='\n'))push();
 let totalHeight=0;
 for(const line of lines){line.top=totalHeight;line.height=line.maxSize*lineMultiplier;totalHeight+=line.height;}
 return {lines,height:totalHeight};
}

/** Invert PDF.js's display rotation, including CropBox offsets. */
export function visualPointToPdf(x,y,crop,angle){
 const r=((angle%360)+360)%360;
 switch(r){
  case 0:return {x:crop.x+x,y:crop.y+crop.height-y};
  case 90:return {x:crop.x+y,y:crop.y+x};
  case 180:return {x:crop.x+crop.width-x,y:crop.y+y};
  case 270:return {x:crop.x+crop.width-y,y:crop.y+crop.height-x};
  default:throw new Error('Rotação de página não suportada para texto incorporado: '+angle+'°.');
 }
}

/** Retained public utility used by existing regression tests. */
export function wrapPdfText(text,font,fontSize,maxWidth){
 const style={fontSize};const runs=[{text:String(text).replace(/\r\n?/g,'\n'),style}];
 return layoutDirectTextRuns(runs,maxWidth,fontSize,1,()=>font).lines.map(line=>line.glyphs.map(g=>g.char).join(''));
}
const channels=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);

/** Permanently writes selectable styled PDF text + highlight rectangles (no annotation objects).
 * On unsupported glyphs, rasterize only that box as transparent PDF page content.
 */
export async function burnDirectTextBoxes(doc,pages,boxes){
 if(!boxes?.length)return 0;
 const {StandardFonts,rgb,degrees}=window.PDFLib;
 const fonts=new Map();
 async function fontFor(style){
  const group=style.fontFamily==='Times New Roman'?'TimesRoman':style.fontFamily==='Courier New'?'Courier':'Helvetica';
  const suffix=group==='TimesRoman'?(style.bold?(style.italic?'BoldItalic':'Bold'):(style.italic?'Italic':'')):(style.bold?(style.italic?'BoldOblique':'Bold'):(style.italic?'Oblique':''));
  const name=StandardFonts[group+suffix];
  if(!fonts.has(name))fonts.set(name,await doc.embedFont(name));
  return fonts.get(name);
 }
 let count=0;
 for(const box of boxes){
  const runs=directTextRuns(box);
  if(!runs.some(run=>run.text.trim()))continue;
  const page=pages[box.page-1];if(!page)throw new Error(`A caixa de texto está vinculada a uma página inexistente (${box.page}).`);
  const angle=((page.getRotation()?.angle||0)%360+360)%360;
  const crop=page.getCropBox?.()||{x:0,y:0,...page.getSize()};
  const displayW=angle%180===0?crop.width:crop.height;
  const displayH=angle%180===0?crop.height:crop.width;
  const left=box.x*displayW,top=box.y*displayH;
  const width=box.width*displayW,height=box.height*displayH;
  if(width<8||height<8)throw new Error(`A caixa de texto da página ${box.page} é muito pequena.`);
  const enriched=[],fontByStyle=new Map();let hasUnsupported=false;
  for(const run of runs){
   const font=await fontFor(run.style);fontByStyle.set(run.style,font);enriched.push({...run,font});
   try{font.encodeText(run.text.replace(/\n/g,''));}catch{hasUnsupported=true;}
  }
  const fontLookup=style=>fontByStyle.get(style)||enriched[0].font;
  let layout=null;
  if(!hasUnsupported){
   layout=layoutDirectTextRuns(enriched,width-1.5,sizeOf(box),spacingOf(box),fontLookup);
   if(layout.height>height+0.5)throw new Error(`Texto da página ${box.page} não cabe na altura da caixa. Aumente-a ou reduza a fonte.`);
  }
  if(hasUnsupported){
   // Keep style fidelity for emoji/unsupported alphabets; this is still page content,
   // never a PDF pop-up annotation. Existing html2canvas is already a dependency.
   const shell=document.createElement('div');shell.className='direct-text-raster';
   shell.style.cssText=`position:fixed;left:-20000px;top:0;width:${width}px;height:${height}px;overflow:hidden;background:transparent;box-sizing:border-box;white-space:pre-wrap;overflow-wrap:break-word;line-height:${spacingOf(box)};font-size:${sizeOf(box)}px;font-family:${familyOf(box)};color:${colorOf(box)};text-align:${alignmentOf(box)};`;
   shell.innerHTML=sanitizeDirectTextHtml(box.html??legacyHtml(box));document.body.append(shell);
   try{
    if(shell.scrollHeight>height+2)throw new Error(`Texto da página ${box.page} excede a altura da caixa.`);
    const rendered=await window.html2canvas(shell,{scale:2,backgroundColor:null,useCORS:false,logging:false,allowTaint:false});
    const image=await doc.embedPng(rendered.toDataURL('image/png'));
    const point=visualPointToPdf(left,top+height,crop,angle);
    page.drawImage(image,{x:point.x,y:point.y,width,height,rotate:degrees(angle)});
   }finally{shell.remove()}
  }else{
   for(const line of layout.lines){
    const xStart=left+(alignmentOf(box)==='center'?(width-line.width)/2:alignmentOf(box)==='right'?width-line.width:0);
    const baseline=top+line.top+line.maxSize*.84;
    const parts=[];let current=null;
    for(const glyph of line.glyphs){
     if(current&&current.font===glyph.font&&current.style===glyph.style){current.text+=glyph.char;current.width+=glyph.width;}
     else{current={font:glyph.font,style:glyph.style,text:glyph.char,width:glyph.width};parts.push(current)}
    }
    let dx=0;
    for(const part of parts){
     const style=part.style, x=xStart+dx;
     if(style.background){
      const highlightHeight=style.fontSize*1.03;
      const point=visualPointToPdf(x,baseline+style.fontSize*.18,crop,angle);
      page.drawRectangle({x:point.x,y:point.y,width:part.width,height:highlightHeight,rotate:degrees(angle),color:rgb(...channels(style.background))});
     }
     const point=visualPointToPdf(x,baseline,crop,angle);
     page.drawText(part.text,{x:point.x,y:point.y,rotate:degrees(angle),font:part.font,size:style.fontSize,color:rgb(...channels(style.color))});
     if(style.underline){
      const start=visualPointToPdf(x,baseline+style.fontSize*.09,crop,angle);
      const end=visualPointToPdf(x+part.width,baseline+style.fontSize*.09,crop,angle);
      page.drawLine({start,end,thickness:Math.max(.5,style.fontSize*.055),color:rgb(...channels(style.color))});
     }
     dx+=part.width;
    }
   }
  }
  count++;
 }
 return count;
}

export function createDirectTextController({state,pageContainer,layer,notify,commit}){
 let activeId=null;
 const boxes=()=>state.textBoxes||[];
 const view=()=>state.currentViewport;
 const selectionWithin=editor=>{
  const sel=window.getSelection();return sel&&sel.rangeCount&&editor.contains(sel.anchorNode)&&editor.contains(sel.focusNode);
 };
 function refreshSelection(){for(const node of layer.querySelectorAll('.direct-text-box')){const active=node.dataset.textId===activeId;node.classList.toggle('active',active);if(active&&node.__fitToolbar)requestAnimationFrame(node.__fitToolbar)}}
 function activate(id){activeId=id;refreshSelection()}
 function draw(viewport){
  layer.replaceChildren();if(!viewport)return;
  for(const box of boxes().filter(b=>b.page===state.page)){
   const node=document.createElement('div');node.className='direct-text-box';node.dataset.textId=box.id;
   function position(){node.style.left=box.x*viewport.width+'px';node.style.top=box.y*viewport.height+'px';node.style.width=box.width*viewport.width+'px';node.style.height=box.height*viewport.height+'px';}
   position();
   const editor=document.createElement('div');editor.className='direct-text-editor';editor.contentEditable='true';editor.spellcheck=true;
   editor.setAttribute('role','textbox');editor.setAttribute('aria-multiline','true');editor.setAttribute('aria-label','Texto incorporado na página '+box.page);
   editor.innerHTML=sanitizeDirectTextHtml(box.html??legacyHtml(box));
   let rangeSaved=null;
   function snapshotSelection(){if(selectionWithin(editor))rangeSaved=window.getSelection().getRangeAt(0).cloneRange();}
   function restoreSelection(){
    if(!rangeSaved||!editor.contains(rangeSaved.commonAncestorContainer)){editor.focus();return false;}
    editor.focus();const sel=window.getSelection();sel.removeAllRanges();sel.addRange(rangeSaved);return true;
   }
   function save(){box.html=sanitizeDirectTextHtml(editor.innerHTML);box.text=editor.innerText.replace(/\r\n?/g,'\n');overflow();commit();}
   function overflow(){node.classList.toggle('text-overflow',editor.scrollHeight>editor.clientHeight+3);}
   function repaint(){
    const zoom=state.zoom;
    // Use a CSS transform rather than scaling only the base font: mixed-size spans
    // must zoom by exactly the same factor as the PDF canvas.
    editor.style.width=100/zoom+'%';editor.style.height=100/zoom+'%';editor.style.transform=`scale(${zoom})`;
    editor.style.fontSize=sizeOf(box)+'px';editor.style.lineHeight=String(spacingOf(box));
    editor.style.color=colorOf(box);editor.style.textAlign=alignmentOf(box);editor.style.fontFamily=familyOf(box);
    overflow();
   }
   repaint();
   editor.addEventListener('input',()=>{box.html=sanitizeDirectTextHtml(editor.innerHTML);box.text=editor.innerText;overflow();});
   editor.addEventListener('blur',save);
   editor.addEventListener('keyup',snapshotSelection);
   editor.addEventListener('mouseup',snapshotSelection);
   editor.addEventListener('pointerup',snapshotSelection);
   editor.addEventListener('pointerdown',()=>activate(box.id));
   editor.addEventListener('paste',e=>{e.preventDefault();const text=e.clipboardData?.getData('text/plain')||'';document.execCommand('insertText',false,text)});
   editor.addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    if((e.ctrlKey||e.metaKey)&&['b','i','u'].includes(key)){
     e.preventDefault();e.stopPropagation();document.execCommand(({b:'bold',i:'italic',u:'underline'})[key],false);snapshotSelection();save();return;
    }
    // Keep Ctrl+Z/Y inside the native editor instead of activating PDF-level history.
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Escape'].includes(e.key)||(e.ctrlKey||e.metaKey))e.stopPropagation();
    if(e.key==='Escape')editor.blur();
   });
   const toolbar=document.createElement('div');toolbar.className='direct-text-toolbar';toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Formatação de texto no PDF');
   node.__fitToolbar=()=>{
    if(!node.isConnected||!node.classList.contains('active'))return;
    toolbar.style.left='-1px';toolbar.style.top='';toolbar.style.bottom='calc(100% + 5px)';
    const rect=toolbar.getBoundingClientRect();let shift=0;
    if(rect.right>window.innerWidth-6)shift-=rect.right-(window.innerWidth-6);
    if(rect.left+shift<6)shift+=6-(rect.left+shift);
    toolbar.style.left=(shift-1)+'px';
    if(rect.top<6){toolbar.style.bottom='auto';toolbar.style.top='calc(100% + 5px)';}
   };
   toolbar.addEventListener('pointerdown',e=>{snapshotSelection();if(e.target.closest('button:not(.direct-text-drag)'))e.preventDefault();});
   const grip=document.createElement('button');grip.type='button';grip.className='direct-text-drag';grip.textContent='⠿';grip.title='Arrastar caixa';grip.setAttribute('aria-label','Arrastar caixa');toolbar.append(grip);
   const group=(label)=>{const el=document.createElement('span');el.className='direct-text-tools-group';el.setAttribute('aria-label',label);toolbar.append(el);return el};
   const fontGroup=group('Fonte e tamanho');
   const family=document.createElement('select');family.className='direct-text-font';family.title='Fonte: aplicar à seleção ou definir a fonte padrão';family.setAttribute('aria-label','Fonte');
   for(const name of Object.keys(FONT_CHOICES)){const opt=document.createElement('option');opt.value=name;opt.textContent=name;family.append(opt)}
   family.value=familyOf(box);fontGroup.append(family);
   const size=document.createElement('input');size.className='direct-text-size';size.type='number';size.min='6';size.max='72';size.step='1';size.value=String(sizeOf(box));size.title='Tamanho (6–72 pt), inclusive para texto selecionado';size.setAttribute('aria-label','Tamanho da fonte');fontGroup.append(size);
   const formatting=group('Estilo e cores');
   function commandButton(label,title,cmd){const b=document.createElement('button');b.type='button';b.textContent=label;b.title=title;b.setAttribute('aria-label',title);b.addEventListener('click',()=>{restoreSelection();document.execCommand(cmd,false);snapshotSelection();save()});formatting.append(b);return b;}
   const bold=commandButton('B','Negrito (Ctrl+B / ⌘B)','bold');bold.className='direct-text-bold';bold.style.fontWeight='bold';
   const italic=commandButton('I','Itálico (Ctrl+I / ⌘I)','italic');italic.style.fontStyle='italic';
   const underline=commandButton('U̲','Sublinhado (Ctrl+U / ⌘U)','underline');underline.className='direct-text-underline';
   const color=document.createElement('input');color.type='color';color.className='direct-text-color';color.value=colorOf(box);color.title='Cor do texto selecionado';color.setAttribute('aria-label','Cor do texto selecionado');formatting.append(color);
   const highlight=document.createElement('button');highlight.type='button';highlight.className='direct-text-highlight';highlight.textContent='🖍';highlight.title='Destacar seleção em amarelo';highlight.setAttribute('aria-label','Aplicar marca-texto amarelo à seleção');formatting.append(highlight);
   function applyStyleToSelection(property,value){
    restoreSelection();const sel=window.getSelection();if(!sel||!sel.rangeCount||sel.isCollapsed){notify('Selecione as palavras que deseja formatar.',2600);return false;}
    // Insert per-text-node spans: works across existing bold/color tags and paragraphs.
    const range=sel.getRangeAt(0).cloneRange(),walker=document.createTreeWalker(editor,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode()){
     const text=walker.currentNode;if(!text.nodeValue?.length||!range.intersectsNode(text))continue;
     const start=text===range.startContainer?range.startOffset:0,end=text===range.endContainer?range.endOffset:text.length;
     if(end>start)nodes.push({text,start,end});
    }
    let first=null,last=null;
    for(const {text,start,end} of nodes){
     const r=document.createRange();r.setStart(text,start);r.setEnd(text,end);
     const span=document.createElement('span');span.style[property]=value;r.surroundContents(span);
     if(!first)first=span;last=span;
    }
    if(!first)return false;
    const next=document.createRange();next.setStartBefore(first);next.setEndAfter(last);sel.removeAllRanges();sel.addRange(next);rangeSaved=next.cloneRange();
    save();return true;
   }
   family.addEventListener('change',()=>{
    if(restoreSelection()&&window.getSelection()?.toString())applyStyleToSelection('fontFamily',family.value);
    else{box.fontFamily=family.value;repaint();save()}
   });
   size.addEventListener('change',()=>{
    const value=clamp(Number(size.value)||sizeOf(box),6,72);size.value=String(value);
    if(restoreSelection()&&window.getSelection()?.toString())applyStyleToSelection('fontSize',value+'px');
    else{box.fontSize=value;repaint();save()}
   });
   color.addEventListener('change',()=>{
    if(restoreSelection()&&window.getSelection()?.toString())applyStyleToSelection('color',color.value);
    else{box.color=color.value;repaint();save()}
   });
   highlight.addEventListener('click',()=>{
    if(!restoreSelection()||!window.getSelection()?.toString()){notify('Selecione uma palavra ou trecho antes de aplicar o marca-texto.',2800);return}
    applyStyleToSelection('backgroundColor','#fff200');
   });
   const paragraph=group('Parágrafo');
   function selector(title,values,current,handler){
    const select=document.createElement('select');select.title=title;select.setAttribute('aria-label',title);
    for(const [value,label] of values){const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.append(opt)}
    select.value=String(current);select.addEventListener('change',()=>{handler(select.value);repaint();save()});paragraph.append(select);
   }
   selector('Alinhamento do parágrafo',[['left','Esq.'],['center','Centro'],['right','Dir.']],alignmentOf(box),v=>box.align=v);
   selector('Espaçamento entre linhas',[['0.95','0,95×'],['1','1,0×'],['1.05','1,05×'],['1.15','1,15×']],spacingOf(box),v=>box.lineHeight=Number(v));
   const remove=document.createElement('button');remove.type='button';remove.className='direct-text-remove';remove.textContent='×';remove.title='Excluir caixa (desfazer disponível)';remove.setAttribute('aria-label','Excluir caixa de texto');remove.addEventListener('click',()=>{state.textBoxes=boxes().filter(b=>b.id!==box.id);activeId=null;commit();draw(view());notify('Caixa excluída. É possível desfazer.',2200)});toolbar.append(remove);
   const resize=document.createElement('button');resize.type='button';resize.textContent='◢';resize.className='direct-text-resize';resize.title='Redimensionar caixa';resize.setAttribute('aria-label','Redimensionar caixa de texto');
   node.append(editor,toolbar,resize);layer.append(node);
   node.addEventListener('pointerdown',()=>activate(box.id));
   function pointerGesture(handle,kind){
    handle.addEventListener('pointerdown',e=>{
     if(e.button!==0)return;e.preventDefault();e.stopPropagation();activate(box.id);
     const rect=pageContainer.getBoundingClientRect(),startX=e.clientX,startY=e.clientY;
     const initial={x:box.x,y:box.y,width:box.width,height:box.height};handle.setPointerCapture(e.pointerId);
     const move=event=>{
      const dx=(event.clientX-startX)/rect.width,dy=(event.clientY-startY)/rect.height;
      if(kind==='move'){box.x=clamp(initial.x+dx,0,1-box.width);box.y=clamp(initial.y+dy,0,1-box.height)}
      else{
       const minW=Math.min(.98,Math.max(50*state.zoom/rect.width,.035));const minH=Math.min(.98,Math.max(22*state.zoom/rect.height,.02));
       box.width=clamp(initial.width+dx,minW,1-box.x);box.height=clamp(initial.height+dy,minH,1-box.y);
      }
      position();node.__fitToolbar?.();
     };
     const finish=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',finish);commit();overflow();};
     handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
    });
   }
   pointerGesture(grip,'move');pointerGesture(resize,'resize');
  }
  refreshSelection();
 }
 function addBox(e){
  const viewport=view();if(!viewport||state.locked||state.placing)return;
  const rect=pageContainer.getBoundingClientRect();
  const atX=clamp((e.clientX-rect.left)/rect.width,0,1),atY=clamp((e.clientY-rect.top)/rect.height,0,1);
  const width=clamp(260*state.zoom/viewport.width,.1,.8),height=clamp(90*state.zoom/viewport.height,.04,.5);
  const box={id:'t'+Array.from(crypto.getRandomValues(new Uint8Array(8)),v=>v.toString(16).padStart(2,'0')).join(''),page:state.page,
   x:Math.min(atX,1-width),y:Math.min(atY,1-height),width,height,text:'',html:'',fontFamily:'Arial',fontSize:14,color:'#161616',align:'left',lineHeight:1};
  state.textBoxes.push(box);commit();activeId=box.id;draw(viewport);
  [...layer.querySelectorAll('.direct-text-box')].find(n=>n.dataset.textId===box.id)?.querySelector('.direct-text-editor')?.focus();
  notify('Caixa criada. Selecione palavras para negrito, cor e marca-texto; mova pela alça ⠿.',5000);
 }
 pageContainer.addEventListener('contextmenu',e=>{
  if(!state.pdf||state.locked||state.placing||e.target.closest('.note-marker,.note-popup,.old-annotation,.direct-text-box'))return;
  e.preventDefault();e.stopPropagation();addBox(e);
 });
 pageContainer.addEventListener('pointerdown',e=>{if(!e.target.closest('.direct-text-box')){activeId=null;refreshSelection()}},true);
 return {draw,close:()=>{activeId=null;layer.replaceChildren()},burn:burnDirectTextBoxes};
}

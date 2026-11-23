/** NotaPDF Studio — non-destructive PDF selection clipboard support.
 * Only intercepts Copy when a nonempty selection belongs entirely to the
 * PDF.js text layer. Popup/rich editors, inputs and all other shortcuts retain
 * their native behavior. The clipboard receives both text/plain and text/html.
 */
const hex = value => '#' + value.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0')).join('');
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isSpace = ch => /\s|\u00a0/u.test(ch);
const normalizeChar = ch => ch === '\u00a0' ? ' ' : ch;
export function flattenCopiedText(value){
 return String(value).replace(/[\r\n\u2028\u2029\u000b\f]+/g,' ').replace(/[\t\u00a0 ]+/g,' ').trim();
}
const colorHex = (raw) => {
 let nums = null;
 if(raw?.length === 1 && (Array.isArray(raw[0]) || ArrayBuffer.isView(raw[0])))nums = Array.from(raw[0]);
 else if(raw?.length >= 3)nums = Array.from(raw).slice(0,3);
 if(!nums || nums.length < 3 || !nums.every(v=>Number.isFinite(Number(v))))return null;
 nums = nums.slice(0,3).map(Number);
 return hex(Math.max(...nums) <= 1 ? nums.map(v=>v*255) : nums);
};
const grayHex = (raw) => {
 const x = Number(raw?.[0]);
 if(!Number.isFinite(x))return null;
 const c = Math.max(0, Math.min(255, Math.round(x * (x > 1 ? 1 : 255))));
 return hex([c,c,c]);
};
const same = (a,b) => normalizeChar(a) === normalizeChar(b);

/** Recover text paint order, font references and fill colours from PDF.js.
 * This works for normal vector text, including pdf-lib's burnt-in rich boxes.
 * Colours inside non-RGB patterns remain unknown rather than guessed.
 */
export function pdfPaintGlyphs(list, OPS){
 if(!list?.fnArray || !list?.argsArray || !OPS || list.fnArray.length > 125000)return [];
 const chars=[];
 let paint={fontName:null,fontSize:0,color:'#000000'};
 const stack=[];
 const show = arg => {
  if(!Array.isArray(arg))return;
  for(const glyph of arg){
   if(!glyph || typeof glyph !== 'object' || typeof glyph.unicode !== 'string')continue;
   for(let k=0;k<glyph.unicode.length;k++)chars.push({char:glyph.unicode[k],...paint});
  }
 };
 for(let i=0;i<list.fnArray.length;i++){
  const op=list.fnArray[i], a=list.argsArray[i]||[];
  if(op===OPS.save || op===OPS.paintFormXObjectBegin)stack.push({...paint});
  else if(op===OPS.restore || op===OPS.paintFormXObjectEnd){if(stack.length)paint=stack.pop();}
  else if(op===OPS.setFont){paint={...paint,fontName:a[0],fontSize:Math.abs(Number(a[1])||0)};}
  else if(op===OPS.setFillRGBColor){paint={...paint,color:colorHex(a)||paint.color};}
  else if(op===OPS.setFillGray){paint={...paint,color:grayHex(a)||paint.color};}
  else if(op===OPS.setFillCMYKColor){
   const c=Array.from(a).map(Number);
   if(c.length>=4 && c.slice(0,4).every(Number.isFinite)){
    const [cy,ma,ye,k]=c;
    paint={...paint,color:hex([255*(1-cy)*(1-k),255*(1-ma)*(1-k),255*(1-ye)*(1-k)])};
   }
  }
  else if(op===OPS.showText || op===OPS.showSpacedText || op===OPS.nextLineShowText)show(a[0]);
  else if(op===OPS.nextLineSetSpacingShowText)show(a[2]);
 }
 return chars;
}

/** Match text content to glyphs using painting order, allowing PDF.js to
 * synthesize spaces from positioned runs. No style is invented on mismatch.
 */
export function matchPaintStyles(value,glyphs,from=0){
 if(!value || !glyphs?.length)return null;
 const max=Math.min(glyphs.length,from+280);
 let first=-1;
 for(let candidate=Math.max(0,from);candidate<max;candidate++){
  if(isSpace(glyphs[candidate].char) || !same(glyphs[candidate].char,value[0]) && !isSpace(value[0]))continue;
  let g=candidate,success=true,nonspace=0;
  for(let k=0;k<value.length;k++){
   const ch=value[k];
   if(isSpace(ch)){
    if(g<glyphs.length && isSpace(glyphs[g].char))g++;
    continue;
   }
   let skips=0;
   while(g<glyphs.length && isSpace(glyphs[g].char) && skips++<8)g++;
   if(g>=glyphs.length || !same(ch,glyphs[g].char)){success=false;break;}
   g++;nonspace++;
  }
  if(success && nonspace){first=candidate;break;}
 }
 if(first<0)return null;
 let g=first;
 let last=null;
 const styles=[];
 for(let k=0;k<value.length;k++){
  const ch=value[k];
  if(isSpace(ch)){
   if(g<glyphs.length && isSpace(glyphs[g].char)){last=glyphs[g];g++;}
   styles.push(last);
  }else{
   let skips=0;
   while(g<glyphs.length && isSpace(glyphs[g].char) && skips++<8)g++;
   if(g>=glyphs.length || !same(ch,glyphs[g].char))return null;
   last=glyphs[g++];styles.push(last);
  }
 }
 return {styles,next:g};
}

function fontNameStyle(fontName,fontObj,textStyle){
 const name=String(fontObj?.name || fontObj?.fontFamily || fontName || '');
 const familyFromName=/courier|mono/i.test(name)?'Courier New':/times|garamond|georgia|roman/i.test(name)?'Times New Roman':/helvetica|arial|sans|liberation/i.test(name)?'Arial':null;
 const fontFamily=familyFromName || textStyle?.fontFamily || 'Arial';
 const bold=fontObj?.bold===true || /bold|black|semibold|demi/i.test(name);
 const italic=fontObj?.italic===true || /italic|oblique/i.test(name);
 return {fontFamily,bold,italic};
}

/** Build immutable per-character style information for a rendered text span. */
export function pdfSpanCopyStyle(item,style,fontObj,paintMatch){
 const baseFont=fontNameStyle(item.fontName,fontObj,style);
 const fontSize=Math.max(6,Math.min(96,Math.round((Math.hypot(Number(item.transform?.[0])||0,Number(item.transform?.[1])||0)||12)*10)/10));
 const base={...baseFont,fontSize,color:'#000000',background:null};
 const chars=Array.from({length:item.str.length},(_,i)=>{
  const paint=paintMatch?.styles?.[i];
  if(!paint)return base;
  const f=paint.fontName && paint.fontName!==item.fontName
   ?fontNameStyle(paint.fontName,null,style):baseFont;
  return {...base,...f,color:paint.color||base.color};
 });
 return {base,chars};
}

/** Yellow highlighting is a filled rectangle in the PDF, not a text style.
 * Recover this *visually* from the original rendered page only while copying.
 * A detection failure simply omits the background style. */
export function yellowBackgroundForRect(rect, canvas){
 if(!canvas || !rect || rect.width<1 || rect.height<1)return null;
 try{
  const bounds=canvas.getBoundingClientRect();
  if(!bounds.width || !bounds.height)return null;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)return null;
  const scaleX=canvas.width/bounds.width, scaleY=canvas.height/bounds.height;
  const colors=[];
  for(const yf of [.13,.34,.64,.82])for(const xf of [.08,.22,.40,.60,.78,.93]){
   const x=Math.round((rect.left+rect.width*xf-bounds.left)*scaleX);
   const y=Math.round((rect.top+rect.height*yf-bounds.top)*scaleY);
   if(x<0 || y<0 || x>=canvas.width || y>=canvas.height)continue;
   const data=ctx.getImageData(x,y,1,1).data;
   const [r,g,b]=data;
   // Saturated yellow, allowing the editor's #FFF200 and standard yellow grifos.
   if(r>=185 && g>=165 && b<=170 && b<r*.8 && b<g*.84)colors.push([r,g,b]);
  }
  return colors.length>=5 ? hex(colors.sort((a,b)=>b[0]+b[1]-a[0]-a[1])[Math.floor(colors.length/2)]) : null;
 }catch{return null;}
}

/** Underline is a separate vector stroke, not a PDF text attribute.
 * Recognize a nearly continuous line just below a run's baseline in the
 * rendered page. If detection is ambiguous, do not claim it is underlined. */
export function underlineForRect(rect,canvas,color){
 if(!rect || rect.width<18 || !canvas || !/^#[\da-f]{6}$/i.test(color||''))return false;
 try{
  const bounds=canvas.getBoundingClientRect();
  if(!bounds.width||!bounds.height)return false;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)return false;
  const scaleX=canvas.width/bounds.width, scaleY=canvas.height/bounds.height;
  const target=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
  for(const fy of [.89,.98,1.05,1.12]){
   let samples=0,matched=0;
   for(let i=0;i<11;i++){
    const x=Math.round((rect.left+rect.width*(.1+.08*i)-bounds.left)*scaleX);
    const y=Math.round((rect.top+rect.height*fy-bounds.top)*scaleY);
    if(x<0||y<0||x>=canvas.width||y>=canvas.height)continue;
    const data=ctx.getImageData(x,y,1,1).data;
    samples++;
    if(target.every((v,c)=>Math.abs(v-data[c])<=40))matched++;
   }
   if(samples>=9 && matched>=Math.ceil(samples*.85))return true;
  }
 }catch{}
 return false;
}

function rectOfFragment(node,start,end){
 try{
  const fragment=document.createRange();fragment.setStart(node,start);fragment.setEnd(node,end);
  const rectangles=[...fragment.getClientRects()].filter(r=>r.width>.5 && r.height>.5);
  return rectangles[0]||null;
 }catch{return null;}
}
function cssFor(style){
 const props=[];
 if(style.fontFamily)props.push('font-family:'+String(style.fontFamily).replace(/[^a-z\- ]/gi,'')+',sans-serif');
 if(style.fontSize>0)props.push('font-size:'+Number(style.fontSize)+'pt');
 if(style.bold)props.push('font-weight:bold');
 if(style.italic)props.push('font-style:italic');
 if(style.underline)props.push('text-decoration:underline');
 if(/^#[0-9a-f]{6}$/i.test(style.color||''))props.push('color:'+style.color);
 if(/^#[0-9a-f]{6}$/i.test(style.background||''))props.push('background-color:'+style.background);
 return props.join(';');
}
function styleId(s){return [s.fontFamily,s.fontSize,s.bold,s.italic,s.color,s.background,s.underline].join('|')}
function appendPiece(segments,text,style){
 if(!text)return;
 const s={...style};
 const last=segments.at(-1);
 if(last && styleId(last.style)===styleId(s))last.text+=text;
 else segments.push({text,style:s});
}

/** Assemble plain and HTML clipboard data from the *live* PDF.js selection.
 * Uses no stale saved range and never touches editable text boxes or popups.
 */
export function pdfSelectionClipboard(selection,layer,spanStyles,canvas){
 if(!selection?.rangeCount || selection.isCollapsed || !layer.contains(selection.anchorNode) || !layer.contains(selection.focusNode))return null;
 const range=selection.getRangeAt(0);
 const spans=[...layer.querySelectorAll('span')].filter(span=>span.firstChild?.nodeType===3 && span.firstChild.length);
 const segments=[];
 let previous=null,partCount=0;
 for(const span of spans){
  const textNode=span.firstChild;
  if(!range.intersectsNode(textNode))continue;
  let begin=range.startContainer===textNode?range.startOffset:0;
  let finish=range.endContainer===textNode?range.endOffset:textNode.length;
  begin=Math.max(0,Math.min(textNode.length,begin));
  finish=Math.max(0,Math.min(textNode.length,finish));
  if(finish<=begin)continue;
  const rect=rectOfFragment(textNode,begin,finish);
  const state=spanStyles.get(span);
  const current=state?.base || {fontFamily:'Arial',fontSize:12,color:'#000000',bold:false,italic:false,background:null};
  // TextLayer is absolutely positioned. Add a space at a real line/word gap,
  // but not between directly adjacent styled spans of the same word.
  if(previous && rect){
   const newLine=Math.abs(rect.top-previous.top)>Math.max(rect.height,previous.height)*.46;
   const gap=rect.left-previous.right;
   if(newLine || gap>Math.max(2,Math.min(rect.height,previous.height)*.26))appendPiece(segments,' ',current);
  }
  // Never transfer PDF.js's transparent selection-layer colour: use recovered
  // paint colour and sample the canvas for yellow rectangles behind the ink.
  const background=yellowBackgroundForRect(rect,canvas);
  const underline=underlineForRect(rect,canvas,current.color);
  const string=textNode.data;
  for(let j=begin;j<finish;j++){
   const ch=string[j];
   const style={...(state?.chars?.[j]||current)};
   if(background)style.background=background;
   if(underline)style.underline=true;
   appendPiece(segments,ch,style);
  }
  if(rect)previous=rect;
  partCount++;
  if(partCount>10000)break; // Avoid unbounded sync copy work.
 }
 if(!segments.length)return null;
 // The PDF may contain explicit hard returns; copied content is always one
 // paragraph. Plain text is suitable for search; HTML retains inline styles.
 let text=flattenCopiedText(segments.map(p=>p.text).join(''));
 if(!text)return null;
 const flattened=[];
 for(const segment of segments){
  const s=segment.text.replace(/[\r\n\u2028\u2029\u000b\f]/g,' ').replace(/[\t\u00a0 ]+/g,' ');
  appendPiece(flattened,s,segment.style);
 }
 // Avoid multiple spaces created by line-boundary inference, including across
 // spans with different formatting.
 const htmlParts=[];
 let needsSpace=false;
 for(const part of flattened){
  for(const match of part.text.matchAll(/\s+|\S+/g)){
   const token=match[0];
   if(/^\s+$/.test(token)){needsSpace=htmlParts.length>0;continue;}
   if(needsSpace)htmlParts.push(' ');
   needsSpace=false;
   htmlParts.push('<span style="'+cssFor(part.style)+'">'+escapeHtml(token)+'</span>');
  }
 }
 return {text,html:'<div style="white-space:normal">'+htmlParts.join('')+'</div>'};
}

export function copyPdfSelection(event,layer,spanStyles,canvas){
 if(!event.clipboardData || event.defaultPrevented)return false;
 const focused=document.activeElement;
 if(focused?.closest?.('input,textarea,select,[contenteditable],[role="textbox"]'))return false;
 const payload=pdfSelectionClipboard(window.getSelection(),layer,spanStyles,canvas);
 if(!payload)return false;
 event.clipboardData.setData('text/plain',payload.text);
 event.clipboardData.setData('text/html',payload.html);
 event.preventDefault();
 return true;
}

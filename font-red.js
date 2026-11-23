/** NotaPDF Studio — isolated font-ink red appearance.
 * The original PDF text stream is never removed or overwritten. Its glyphs
 * remain selectable/searchable; a tightly cropped opaque image reproduces
 * the local page background with the glyph ink tinted red. This is an
 * appearance-level operation, NOT an edit to the original PDF font operators.
 */
export const FONT_RED = '#ff0000';
const validHex = value => /^#[0-9a-f]{6}$/i.test(value || '');
const clamp = (value, a, b) => Math.max(a, Math.min(b, value));
const luminance = rgb => .2126*rgb[0] + .7152*rgb[1] + .0722*rgb[2];

export function redFontPatch(canvas, viewport, rect, color=FONT_RED){
 if(!validHex(color))throw new Error('Cor de fonte inválida.');
 const a=viewport.convertToViewportPoint(rect.x1, rect.y1-.55);
 const b=viewport.convertToViewportPoint(rect.x2, rect.y2+.55);
 const left=Math.min(a[0],b[0]),top=Math.min(a[1],b[1]);
 const width=Math.abs(a[0]-b[0]),height=Math.abs(a[1]-b[1]);
 if(!(width>.1 && height>.1))throw new Error('Seleção de texto sem área suficiente.');
 const sx=canvas.width/viewport.width,sy=canvas.height/viewport.height;
 const patch=document.createElement('canvas');
 patch.width=Math.max(1,Math.ceil(width*sx));patch.height=Math.max(1,Math.ceil(height*sy));
 const ctx=patch.getContext('2d',{willReadFrequently:true});
 // Use the PDF-rendered pixels, including colored or non-white page backgrounds.
 // Never place a white rectangle beneath the original text.
 ctx.drawImage(canvas,left*sx,top*sy,width*sx,height*sy,0,0,patch.width,patch.height);
 const image=ctx.getImageData(0,0,patch.width,patch.height),pixels=image.data;
 const channels=[[],[],[]],step=Math.max(1,Math.floor(Math.sqrt((patch.width*patch.height)/3500)));
 for(let y=0;y<patch.height;y+=step)for(let x=0;x<patch.width;x+=step){
  const k=(y*patch.width+x)*4;
  for(let c=0;c<3;c++)channels[c].push(pixels[k+c]);
 }
 // Median channel estimates the nearby background in ordinary selectable PDFs.
 // The method is deliberately conservative for photos/complex colored artwork.
 const bg=channels.map(ch=>{ch.sort((a,b)=>a-b);return ch[Math.floor(ch.length*.55)]??255});
 const backgroundLight=luminance(bg),lightInk=backgroundLight<108;
 const red=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 const denom=lightInk?Math.max(50,255-backgroundLight):Math.max(50,backgroundLight);
 let changed=0;
 for(let k=0;k<pixels.length;k+=4){
  const src=[pixels[k],pixels[k+1],pixels[k+2]],lum=luminance(src);
  const contrast=(lightInk?lum-backgroundLight:backgroundLight-lum)/denom;
  const strength=clamp((contrast-.045)/.91,0,1);
  if(strength<.015)continue;
  changed++;
  for(let c=0;c<3;c++)pixels[k+c]=Math.round(bg[c]*(1-strength)+red[c]*strength);
  pixels[k+3]=255;
 }
 // A selected PDF text run that contains no visible ink should not be painted.
 if(changed===0)throw new Error('Não foi possível identificar as letras nesta seleção.');
 ctx.putImageData(image,0,0);
 return {canvas:patch,left,top,width,height};
}

/** PDF.js screenshot follows page rotation; PDF page drawImage uses user space.
 * Return a counter-rotated bitmap so the final letters stay upright and exactly
 * aligned at /Rotate 0, 90, 180 or 270 (including non-square selections).
 */
export function pdfOrientedPatch(image,rotation){
 const angle=((Number(rotation)||0)%360+360)%360;
 if(!angle)return image;
 if(![90,180,270].includes(angle))throw new Error('Rotação de página não suportada para a cor da fonte.');
 const out=document.createElement('canvas');
 out.width=angle%180?image.height:image.width;
 out.height=angle%180?image.width:image.height;
 const cx=out.getContext('2d');
 cx.translate(out.width/2,out.height/2);
 cx.rotate(-angle*Math.PI/180);
 cx.drawImage(image,-image.width/2,-image.height/2);
 return out;
}

export function normalizeRedFontMarks(raw,totalPages){
 if(!Array.isArray(raw))return [];
 return raw.slice(0,5000).flatMap(mark=>{
  if(!mark||!Number.isInteger(mark.page)||mark.page<1||mark.page>totalPages||!Array.isArray(mark.rects))return [];
  const rects=mark.rects.slice(0,2000).filter(r=>
   r && ['x1','x2','y1','y2'].every(key=>Number.isFinite(r[key])) &&
   r.x2>r.x1&&r.y2>r.y1 && Math.max(Math.abs(r.x1),Math.abs(r.x2),Math.abs(r.y1),Math.abs(r.y2))<1e7
  ).map(r=>({x1:r.x1,x2:r.x2,y1:r.y1,y2:r.y2}));
  return rects.length?[{page:mark.page,type:'fontRed',color:FONT_RED,rects}]:[];
 });
}

/** Red ink in a flattened PDF may be drawn as appearance imagery over the
 * unchanged vector text. Restore the visible red color in rich Ctrl+C HTML
 * using geometry saved in NPSData; no alteration to plain text is necessary.
 */
export function redFontCopyStyle(source,geometry,page,marks){
 if(!source||!geometry?.width||!Number.isFinite(geometry.y)||!Array.isArray(marks)||!marks.length)return source;
 const candidates=marks.filter(m=>m.page===page&&m.type==='fontRed'&&Array.isArray(m.rects));
 if(!candidates.length)return source;
 const lineHeight=geometry.height||12;
 const baseY=geometry.y;
 const rectangles=candidates.flatMap(m=>m.rects).filter(r=>r.y2>baseY-lineHeight*.27&&r.y1<baseY+lineHeight*.85 && r.x2>geometry.x && r.x1<geometry.x+geometry.width);
 if(!rectangles.length)return source;
 const chars=source.chars?.map((style,i)=>{
  const first=geometry.starts?.[i]??i/Math.max(1,geometry.text.length);
  const last=geometry.ends?.[i]??(i+1)/Math.max(1,geometry.text.length);
  const center=geometry.x+geometry.width*(first+last)/2;
  return rectangles.some(r=>center>=r.x1&&center<=r.x2)?{...style,color:FONT_RED}:style;
 });
 return chars?{...source,chars}:source;
}

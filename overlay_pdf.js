/** NotaPDF v1.6.1 — PDF Optional Content Group (OCG) overlay.
 * The picture is a page image in a default-OFF optional layer, NOT a large widget.
 * Only the small icon remains interactive. PDF viewers without Acrobat JS can
 * still read the PDF; for rich interactive popups use the NotaPDF web viewer.
 */
const own = id => /^[A-Za-z0-9_-]{1,64}$/.test(id);
const imageKey = id => 'NPSIMG_' + id;
const propKey = id => 'NPSOC_' + id;
const ocgName = id => 'NPS_POPUP_' + id;
function name(v) { return window.PDFLib.PDFName.of(v); }
/** pdf-lib 1.17.1: context.lookup(undefined, PDFDict/PDFArray) THROWS.
 * Optional PDF dictionary entries must be checked before passing a type guard.
 * Keep strict checking for an existing entry of the wrong type; do not
 * silently replace or erase original resources from third-party PDFs.
 */
function optionalObject(doc, raw, Type) {
  if (raw === undefined || raw === null) return undefined;
  const object = doc.context.lookup(raw);
  if (object === undefined || object === null || object === window.PDFLib.PDFNull || object?.toString?.() === 'null') return undefined;
  if (!(object instanceof Type)) {
    throw new Error('Estrutura PDF incompatível: recurso opcional com tipo inesperado (' +
      (object?.constructor?.name || typeof object) + ').');
  }
  return object;
}
function dictCopy(doc, src) {
  const dst=doc.context.obj({});
  if(src?.keys) for(const key of src.keys())dst.set(key,src.get(key));
  return dst;
}
function copyResourceDictionary(doc, page) {
  const {PDFDict}=window.PDFLib;
  const resources=dictCopy(doc, page.node.Resources());
  for(const key of ['Properties','XObject']) {
    const n=name(key),existing=optionalObject(doc,resources.get(n),PDFDict);
    resources.set(n,dictCopy(doc,existing));
  }
  page.node.set(name('Resources'),resources);
  return resources;
}
function contentsRefs(doc,page){
  // .Contents() dereferences a single stream in pdf-lib. A stream placed
  // directly in a PDF /Contents array is invalid, so always preserve its
  // original *reference* by reading the raw /Contents entry instead.
  const raw=page.node.get?.(name('Contents')) ?? page.node.Contents?.();
  if(!raw || raw?.toString?.() === 'null')return [];
  const {PDFArray}=window.PDFLib;
  const resolved=doc.context.lookup(raw);
  if(resolved instanceof PDFArray) return Array.from({length:resolved.size()},(_,i)=>resolved.get(i));
  // A singular /Contents entry is normally a PDFRef to a PDFStream.
  return [raw];
}
function setContents(doc,page,refs){page.node.set(name('Contents'),doc.context.obj(refs));}
function appendOCG(doc,groupRef){
  const {PDFArray,PDFDict,PDFName}=window.PDFLib;
  let opt=optionalObject(doc,doc.catalog.get(name('OCProperties')),PDFDict);
  // OCG dictionaries may already exist in legal / professionally authored PDFs.
  if(!opt){opt=doc.context.obj({OCGs:[],D:{BaseState:PDFName.of('ON'),Order:[],OFF:[]}});doc.catalog.set(name('OCProperties'),opt);}
  let groups=optionalObject(doc,opt.get(name('OCGs')),PDFArray);
  if(!groups){groups=doc.context.obj([]);opt.set(name('OCGs'),groups);}
  groups.push(groupRef);
  let config=optionalObject(doc,opt.get(name('D')),PDFDict);
  if(!config){config=doc.context.obj({BaseState:PDFName.of('ON')});opt.set(name('D'),config);}
  let order=optionalObject(doc,config.get(name('Order')),PDFArray);
  if(!order){order=doc.context.obj([]);config.set(name('Order'),order);}
  order.push(groupRef);
  let off=optionalObject(doc,config.get(name('OFF')),PDFArray);
  if(!off){off=doc.context.obj([]);config.set(name('OFF'),off);}
  off.push(groupRef);
}
export function overlayPosition(note,width,height,boxWidth,boxHeight){
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const iconX=clamp(note.x*width,16,width-16),iconY=clamp(height-note.y*height,16,height-16);
  const w=Math.min(boxWidth,width-12),h=Math.min(boxHeight,height-12);
  // Prefer the left of the icon, but never go beyond the page boundary.
  const left=clamp(iconX-w-13,6,Math.max(6,width-w-6));
  const bottom=clamp(iconY-h/2,6,Math.max(6,height-h-6));
  return {iconX,iconY,left,bottom,width:w,height:h};
}
export function addOverlay(doc,page,note,image,geometry) {
  if(!own(note.id))throw new Error('Identificador de nota inválido.');
  const {PDFString,PDFName}=window.PDFLib;
  const ocgRef=doc.context.register(doc.context.obj({Type:PDFName.of('OCG'),Name:PDFString.of(ocgName(note.id)),Intent:PDFName.of('View')}));
  appendOCG(doc,ocgRef);
  const res=copyResourceDictionary(doc,page);
  res.lookup(name('Properties')).set(name(propKey(note.id)),ocgRef);
  res.lookup(name('XObject')).set(name(imageKey(note.id)),image.ref);
  const g=geometry;
  const stream=`q\n/OC /${propKey(note.id)} BDC\n${g.width.toFixed(3)} 0 0 ${g.height.toFixed(3)} ${g.left.toFixed(3)} ${g.bottom.toFixed(3)} cm\n/${imageKey(note.id)} Do\nEMC\nQ\n`;
  const entry=doc.context.flateStream(stream,{NPSOverlay:PDFString.of(note.id)});
  const streamRef=doc.context.register(entry);
  setContents(doc,page,[...contentsRefs(doc,page),streamRef]);
  return {ocgRef,streamRef};
}
export function overlayActions(id, hover=true, click=true){
  if(!own(id))throw new Error('ID inválido.');
  const layer=ocgName(id),field='NPS_'+id+'_state';
  const lookup=`var aa=this.getOCGs(this.pageNum)||[],o=null;for(var k=0;k<aa.length;k++){if(aa[k].name===${JSON.stringify(layer)}){o=aa[k];break;}}`;
  const state=`var s=this.getField(${JSON.stringify(field)});`;
  const enter=hover?`try{${lookup}if(o)o.state=true;}catch(e){}`:'';
  const exit=hover?`try{${lookup}${state}if(o&&(!s||s.value!=="1"))o.state=false;}catch(e){}`:'';
  const up=click?`try{${lookup}${state}if(o){var pinned=!!(s&&s.value==="1");o.state=!pinned;if(s)s.value=pinned?"0":"1";}}catch(e){}`:'';
  return {enter,exit,up};
}
export function addIconTrigger(doc, form, page, note, iconImage, geometry){
  const {PDFName,PDFString}=window.PDFLib;
  const icon=form.createButton('NPS_'+note.id+'_icon'),size=23;
  icon.addToPage('',page,{x:geometry.iconX-size/2,y:geometry.iconY-size/2,width:size,height:size,borderWidth:0});
  icon.setImage(iconImage);
  const state=form.createTextField('NPS_'+note.id+'_state');state.setText('0');
  const actions=overlayActions(note.id,note.hover,note.click);
  const widget=icon.acroField.getWidgets()[0];
  for(const [event,script] of [['E',actions.enter],['X',actions.exit],['U',actions.up]]) {
    if(!script)continue;
    let aa=widget.dict.lookup(PDFName.of('AA'));
    if(!aa||typeof aa.set!=='function')aa=doc.context.obj({});
    aa.set(PDFName.of(event),doc.context.obj({S:PDFName.of('JavaScript'),JS:PDFString.of(script)}));
    widget.dict.set(PDFName.of('AA'),aa);
  }
}
function removeRefs(arr,toDrop){
  if(!arr?.size)return;
  for(let i=arr.size()-1;i>=0;i--)if(toDrop.has(arr.get(i).toString()))arr.remove(i);
}
/** Remove only NotaPDF-owned optional layers, image resources and content streams.
 * Must be called after stripping v1.5 appendices and before adding fresh overlays. */
export function removeOldOverlays(doc,pages){
  const {PDFDict,PDFArray}=window.PDFLib;
  const removed=new Map(), droppedOCGs=new Set();let streams=0;
  for(const page of pages){
    const refs=contentsRefs(doc,page),keep=[];
    for(const ref of refs){
      const stream=doc.context.lookup(ref);
      const marker=stream?.dict?.get?.(name('NPSOverlay'))?.asString?.();
      if(marker&&own(marker)){
        if(ref.objectNumber!==undefined)removed.set(ref.toString(),ref);
        streams++;
      }else keep.push(ref);
    }
    if(keep.length!==refs.length)setContents(doc,page,keep);
    // Resources may have been shared; shallow-copy before removing our entries.
    const resources=page.node.Resources();if(!resources)continue;
    const copy=dictCopy(doc,resources);let touched=false;
    for(const [key,prefix] of [['Properties','NPSOC_'],['XObject','NPSIMG_']]){
      const old=optionalObject(doc,copy.get(name(key)),PDFDict);
      if(!old?.keys)continue;
      const next=dictCopy(doc,old);
      for(const k of old.keys()){
        if(k.toString().replace(/^\//,'').startsWith(prefix)){
          const value=old.get(k);
          if(value?.objectNumber!==undefined)removed.set(value.toString(),value);
          if(prefix==='NPSOC_'&&value)droppedOCGs.add(value.toString());
          next.delete(k);touched=true;
        }
      }
      if(touched)copy.set(name(key),next);
    }
    if(touched)page.node.set(name('Resources'),copy);
  }
  const opt=optionalObject(doc,doc.catalog.get(name('OCProperties')),PDFDict);
  if(opt && droppedOCGs.size){
    const all=optionalObject(doc,opt.get(name('OCGs')),PDFArray);removeRefs(all,droppedOCGs);
    const config=optionalObject(doc,opt.get(name('D')),PDFDict);
    if(config){for(const key of ['Order','OFF','ON'])removeRefs(optionalObject(doc,config.get(name(key)),PDFArray),droppedOCGs);}
  }
  for(const ref of removed.values())if(ref.objectNumber!==undefined)doc.context.delete(ref);
  return streams;
}
export function overlayLabel(id){return ocgName(id);}

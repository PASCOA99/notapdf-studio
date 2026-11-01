/** Standard PDF /Text and /Link annotations. Neither consumes an invisible overlay. */
export function notePlainText(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  root.querySelectorAll('img').forEach(img => img.replaceWith(document.createTextNode(' [Imagem: abrir a nota completa] ')));
  root.querySelectorAll('br,p,div,li,tr,h1,h2,h3').forEach(node => node.append(document.createTextNode('\n')));
  const text = root.textContent.replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/\n[ \t]*/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
  return text.slice(0,4000) || 'Nota com imagem. Clique no ícone ao lado para visualizar o conteúdo completo.';
}
export function addPdfAnnotation(doc,page,kind,rect,properties={}) {
  const {PDFName}=window.PDFLib;
  const entry=doc.context.obj({Type:PDFName.of('Annot'),Subtype:PDFName.of(kind),Rect:rect,
    F:4,...properties});
  const ref=doc.context.register(entry);
  page.node.addAnnot(ref);
  return ref;
}
export function addPortableNote(doc,origin,details,position,preview,identity,iconImage){
  const {PDFName,PDFString,PDFHexString}=window.PDFLib;
  const {x,y,size}=position;
  // Render the little yellow icon as a removable, stationary PDF /Stamp.
  // Never paint it permanently into source-page content: otherwise deleting
  // the note or re-exporting could leave "ghost" icons and duplicate streams.
  const iconAppearance=doc.context.flateStream(`q\n${size} 0 0 ${size} 0 0 cm\n/NpsIcon Do\nQ\n`,{
    Type:PDFName.of('XObject'),Subtype:PDFName.of('Form'),FormType:1,
    BBox:[0,0,size,size],Resources:{XObject:{NpsIcon:iconImage.ref}}
  });
  const iconRef=doc.context.register(iconAppearance);
  addPdfAnnotation(doc,origin,'Stamp',[x-size/2,y-size/2,x+size/2,y+size/2],{
    NM:PDFString.of('NPS_STAMP_'+identity),Name:PDFName.of('Approved'),
    AP:{N:iconRef},Border:[0,0,0]
  });
  // PDF /Link is an in-document navigation action, not Acrobat JavaScript.
  addPdfAnnotation(doc,origin,'Link',[x-size/2,y-size/2,x+size/2,y+size/2],{
    Border:[0,0,0],H:PDFName.of('N'), NM:PDFString.of('NPS_LINK_'+identity),
    A:{S:PDFName.of('GoTo'),D:[details.ref,PDFName.of('Fit')]}
  });
  // The native note has a separate small target to preserve the GoTo link's click.
  const sideX=Math.min(x+size/2+3,origin.getSize().width-15);
  addPdfAnnotation(doc,origin,'Text',[sideX,y-7,sideX+14,y+7],{
    Name:PDFName.of('Comment'),Open:false,C:[1,.88,.38],
    T:PDFHexString.fromText(preview.title),Contents:PDFHexString.fromText(preview.text),
    NM:PDFString.of('NPS_TEXT_'+identity)
  });
  addPdfAnnotation(doc,details,'Link',[28,details.getSize().height-54,198,details.getSize().height-24],{
    Border:[0,0,0],H:PDFName.of('N'),NM:PDFString.of('NPS_BACK_'+identity),
    A:{S:PDFName.of('GoTo'),D:[origin.ref,PDFName.of('Fit')]}
  });
}
export function removePortableAnnotations(doc,pages){
  const {PDFName}=window.PDFLib;
  let removed=0;
  const toDelete=new Map();
  for(const page of pages){
    const annots=page.node.Annots();if(!annots)continue;
    for(let i=annots.size()-1;i>=0;i--){
      const annot=doc.context.lookup(annots.get(i));
      const marker=annot?.get?.(PDFName.of('NM'));
      const value=marker?.asString?.()||'';
      if(/^NPS_(STAMP|LINK|TEXT|BACK)_[a-zA-Z0-9_-]+$/.test(value)){
        const ref=annots.get(i);
        if(value.startsWith('NPS_STAMP_')){
          try {const ap=annot.lookup(PDFName.of('AP'))?.get(PDFName.of('N'));
            if(ap?.objectNumber!==undefined){toDelete.set(ap.toString(),ap);
              const stream=doc.context.lookup(ap);
              const images=stream?.dict?.lookup(PDFName.of('Resources'))?.lookup(PDFName.of('XObject'));
              if(images?.keys)for(const key of images.keys()){
                const imgRef=images.get(key);
                if(imgRef?.objectNumber!==undefined)toDelete.set(imgRef.toString(),imgRef);
              }
            }
          }catch{}
        }
        annots.remove(i);
        if(ref?.objectNumber!==undefined)doc.context.delete(ref);
        removed++;
      }
    }
  }
  for(const ref of toDelete.values())doc.context.delete(ref);
  return removed;
}
export function stripOldAppendices(doc,project) {
  if(!project?.portableAppendices)return 0;
  const n=project.portableAppendices;
  if(!Number.isSafeInteger(n)||n<0||n>doc.getPageCount()-1 ||
    !Number.isSafeInteger(project.originalPages)||project.originalPages<1||
    doc.getPageCount()!==project.originalPages+n){
    throw new Error('O PDF apresenta páginas de notas inconsistentes: exportação interrompida para preservar o documento.');
  }
  const {PDFName}=window.PDFLib;
  // pdf-lib removes the page from the tree but does not always GC its image
  // XObjects. Reclaim only large objects exclusive to our generated appendices.
  const refs=new Map();
  const add=(r)=>{if(r?.objectNumber!==undefined)refs.set(r.toString(),r)};
  const oldPages=doc.getPages().slice(project.originalPages);
  const liveImages=new Set();
  const getImages=page=>{
    try {const dic=page.node.Resources()?.lookup(PDFName.of('XObject'));
      return dic?.keys?.().map(key=>dic.get(key)).filter(Boolean)||[];
    } catch {return []}
  };
  for(const page of doc.getPages().slice(0,project.originalPages))
    for(const r of getImages(page))if(r?.objectNumber!==undefined)liveImages.add(r.toString());
  for(const page of oldPages){
    add(page.ref);
    for(const r of getImages(page))if(!liveImages.has(r.toString()))add(r);
    try {const content=page.node.Contents();
      if(content?.size)for(let i=0;i<content.size();i++)add(content.get(i));
      else add(content);
    }catch{}
    const annots=page.node.Annots();
    if(annots)for(let i=0;i<annots.size();i++){
      const r=annots.get(i),a=doc.context.lookup(r),nm=a?.get?.(PDFName.of('NM'))?.asString?.()||'';
      if(/^NPS_BACK_[a-zA-Z0-9_-]+$/.test(nm))add(r);
    }
  }
  for(let i=0;i<n;i++)doc.removePage(doc.getPageCount()-1);
  for(const r of refs.values())doc.context.delete(r);
  return n;
}

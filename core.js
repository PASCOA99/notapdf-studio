/** Helpers without external dependencies; also used in smoke tests. */
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const newId = () => 'n' + Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2,'0')).join('');
export function utf8ToBase64(s) {
  const bytes = new TextEncoder().encode(s); let binary = '';
  for (let i=0;i<bytes.length;i+=8192) binary += String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(binary);
}
export function base64ToUtf8(s) {
  const binary = atob(s); const bytes = new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
export function normalizeNote(n, totalPages) {
  if (!n || !Number.isInteger(n.page) || n.page < 1 || n.page > totalPages) return null;
  return {
    id: /^[a-zA-Z0-9_-]{1,64}$/.test(n.id || '') ? n.id : newId(),
    page: n.page, x: clamp(Number(n.x)||0, 0.02, .98),
    y: clamp(Number(n.y)||0, 0.02, .98),
    title: String(n.title || 'Nota').slice(0,100),
    html: String(n.html || '<p></p>').slice(0,1500000),
    bg: /^#[a-fA-F0-9]{6}$/.test(n.bg||'')?n.bg:'#fffdf4',
    border: /^#[a-fA-F0-9]{6}$/.test(n.border||'')?n.border:'#c7b18a',
    width:clamp(Number(n.width)||340,200,520),
    height:clamp(Number(n.height)||300,170,650),
    hover:n.hover!==false, click:n.click!==false
  };
}
export function popupCoordinates(anchorX, anchorTop, pageW, pageH, w, h) {
  const xx = clamp(anchorX-w-12, 6, Math.max(6,pageW-w-6));
  const yy = clamp(pageH-anchorTop-h/2, 6, Math.max(6,pageH-h-6));
  return { x:xx, y:yy };
}
/** Acrobat field rectangles use [left, top, right, bottom] in page points.
 * While the note is closed its widget MUST stay outside the page: some viewers
 * intercept text selection through an invisible/hidden AcroForm widget.
 * Keeping the same width/height also preserves the cached image appearance. */
export function popupFieldRects(x, y, width, height) {
  const sane = n => Math.round(Number(n) * 1000) / 1000;
  const w=sane(width),h=sane(height),left=sane(x),bottom=sane(y);
  const margin=48;
  return {
    visible:[left,sane(bottom+h),sane(left+w),bottom],
    parked:[sane(-w-margin),-margin,-margin,sane(-h-margin)]
  };
}
/** Acrobat JavaScript for the icon and the pop-up's close action.
 * The bounding rectangle only returns to the PDF page while the pop-up is OPEN.
 * No large, invisible interactive rectangle is left over selectable page text. */
export function makeActions(id, hover, click, rects=null) {
  const popup = `NPS_${id}_popup`;
  const state = `NPS_${id}_state`;
  const field = `(this.getField(${JSON.stringify(popup)}))`;
  const stateField = `(this.getField(${JSON.stringify(state)}))`;
  const reveal = (rects ? `p.rect=${JSON.stringify(rects.visible)};` : '') + 'p.display=display.visible;';
  const conceal = 'p.display=display.hidden;' + (rects ? `p.rect=${JSON.stringify(rects.parked)};` : '');
  const enter = hover ? `var p=${field};if(p){${reveal}}` : '';
  const exit = hover ? `var p=${field},s=${stateField};if(p&&(!s||s.value!=="1")){${conceal}}` : '';
  const down = click ? `var p=${field},s=${stateField};if(p&&s){s.value=(s.value==="1"?"0":"1");if(s.value==="1"){${reveal}}else{${conceal}}}` : '';
  const close = `var p=${field},s=${stateField};if(p){if(s)s.value="0";${conceal}}`;
  return { enter, exit, down, close };
}
export function printableName(name) { return (name || 'documento').replace(/\.pdf$/i,'').replace(/[^a-z0-9_áàãâéêíóôõúç -]/gi,'_').slice(0,85) + '_com_notas.pdf'; }

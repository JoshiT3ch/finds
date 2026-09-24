const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = process.cwd();
const all = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? all(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const files = [...all('src'), ...all('utils')].filter(f => /\.tsx?$/.test(f));
fs.mkdirSync('.migration/original', {recursive:true});
for (const file of files) { const dest=path.join('.migration/original',file); fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest); }
const skip = /(?:layout|proxy|client|error|loading)\.tsx?$/;
const relative = (file,target) => {const p=path.relative(path.dirname(file),target).replaceAll('\\','/');return p.startsWith('.')?p:'./'+p;};
const escape = s => s.replaceAll('\\','\\\\').replaceAll('`','\\`').replaceAll('${','\\${');
for (const file of files) {
  const normalized=file.replaceAll('\\','/');
  if (skip.test(file) && !normalized.endsWith('browse-client.tsx')) continue;
  if (/CategoryNav|ListingGallery|HeaderSearch|conversation-refresh|auth\/confirm/.test(normalized)) continue;
  let source=fs.readFileSync(file,'utf8');
  if (normalized.endsWith('sell-form.tsx')) {
    const start=source.indexOf('  useEffect(() =>'); const end=source.indexOf('  const fieldError =',start);
    source=source.slice(0,start)+source.slice(end);
    source=source.replace('        noValidate','        data-sell-form="true"');
  }
  if (normalized.endsWith('my-listings.tsx')) {
    const start=source.indexOf('function ListingControls(');const end=source.indexOf('function ListingImage(',start);
    source=source.slice(0,start)+`function ListingControls({ listing }) {
      const nextStatus = listing.status === 'available' ? 'sold' : 'available';
      return <div className="mt-5 border-t border-sage-200 pt-4 flex flex-wrap gap-3">
        <form action="/actions/updateListingStatus" method="post" data-reload="true">
          <input type="hidden" name="listingId" value={listing.id}/><input type="hidden" name="status" value={nextStatus}/>
          <button className="rounded-md border border-sage-300 bg-surface px-3 py-2 text-sm font-semibold" type="submit">{listing.status === 'available' ? 'Mark as Sold' : 'Mark as Available'}</button>
        </form>
        <form action="/actions/deleteListing" method="post" data-reload="true" data-confirm="Delete this listing? This cannot be undone.">
          <input type="hidden" name="listingId" value={listing.id}/><input type="hidden" name="confirmation" value="delete"/>
          <button className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold" type="submit">Delete</button>
        </form>
      </div>;
    }\n`+source.slice(end);
  }
  if (normalized.endsWith('browse-client.tsx')) {
    const start=source.indexOf('  const resetFilters =');const end=source.indexOf('  const hasActiveFilters',start);
    source=source.slice(0,start)+source.slice(end);
    source=source.replace('const [selectedSize, setSelectedSize] = useState("")', 'const [selectedSize, setSelectedSize] = useState(queryParam("size"))');
    source=source.replace('const [selectedCondition, setSelectedCondition] = useState("")', 'const [selectedCondition, setSelectedCondition] = useState(queryParam("condition"))');
    source=source.replace('useState<SortOrder>("newest")','useState<SortOrder>(queryParam("sort") || "newest")');
    source=source.replace('<div className="mb-8 rounded-2xl', '<form action="/browse" method="get" data-browse-filters="true" className="mb-8 rounded-2xl');
    source=source.replace('            <div className="mb-6">','            <div className="mb-6">');
    source=source.replace(/<\/div>\s*\n\s*<div className="mb-6">/, '<button type="submit" className="mt-4 rounded-lg bg-sage-300 px-4 py-2 font-semibold">Apply filters</button></form>\n<div className="mb-6">');
    for(const name of ['department','search','category','size','condition','sort']) source=source.replace('id="'+name+'"','id="'+name+'" name="'+name+'"');
    source=source.replaceAll('onClick={resetFilters}', 'data-clear-filters="true" type="button"');
  }
  const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function replaceChildren(node) {
    let text=source.slice(node.getStart(sf),node.end);const edits=[];
    node.forEachChild(child => {const next=convert(child); if(next!==source.slice(child.getStart(sf),child.end)) edits.push([child.getStart(sf)-node.getStart(sf),child.end-node.getStart(sf),next]);});
    for(const [start,end,value] of edits.reverse()) text=text.slice(0,start)+value+text.slice(end);
    return text;
  }
  function convert(node) {
    if(ts.isImportDeclaration(node)) {
      const mod=node.moduleSpecifier.text;
      if(mod==='react'||mod==='next/link'||mod==='next/image'||mod==='next/cache'||mod==='next/server')return '';
      let target=mod;
      if(mod==='next/navigation'||mod==='next/headers') target=relative(file,'server/request.js');
      else if(mod.startsWith('@/')) target=relative(file,'src/'+mod.slice(2)+'.js');
      else if(mod.startsWith('.')) target=mod+'.js';
      return source.slice(node.getStart(sf),node.end).replace(node.moduleSpecifier.getText(sf),JSON.stringify(target));
    }
    if(ts.isExpressionStatement(node)) {
      if(ts.isStringLiteral(node.expression)&&/^use (client|server)$/.test(node.expression.text))return '';
      if(ts.isCallExpression(node.expression)&&['useEffect','revalidatePath'].includes(node.expression.expression.getText(sf)))return '';
      if(ts.isAwaitExpression(node.expression)&&node.expression.expression.getText(sf)==='connection()')return '';
    }
    if(ts.isVariableStatement(node)) {
      const decl=node.declarationList.declarations[0];const init=decl?.initializer;
      if(init&&ts.isCallExpression(init)) {
        const name=init.expression.getText(sf);
        if(name==='useRouter'||name==='useRef') return '';
        if(name==='useState') return `const ${decl.name.elements[0].name.getText(sf)} = ${convert(init.arguments[0])};`;
        if(name==='useActionState') return `const ${decl.name.elements[0].name.getText(sf)} = ${convert(init.arguments[1])}; const ${decl.name.elements[1].name.getText(sf)} = "/actions/${init.arguments[0].getText(sf)}"; const ${decl.name.elements[2].name.getText(sf)} = false;`;
      }
      if(decl?.name.getText(sf)==='dynamic')return '';
    }
    if(ts.isCallExpression(node)&&node.expression.getText(sf)==='useMemo')return `(${convert(node.arguments[0])})()`;
    if(ts.isJsxElement(node)||ts.isJsxSelfClosingElement(node)||ts.isJsxFragment(node)) {
      const fragment=ts.isJsxFragment(node);const opening=fragment?null:(ts.isJsxElement(node)?node.openingElement:node);
      let tag=opening?.tagName.getText(sf);const originalTag=tag;
      if(tag==='Link')tag='a';if(tag==='Image')tag='img';
      const component=tag&&/^[A-Z]/.test(tag);
      const children=ts.isJsxSelfClosingElement(node)?[]:node.children;
      const props=[];let textValue=null;
      for(const a of opening?.attributes.properties||[]) {
        if(ts.isJsxSpreadAttribute(a)){props.push('...'+convert(a.expression));continue;}
        const key=a.name.getText(sf);if(key==='key'||key==='ref'||key.startsWith('on')||key==='priority'||key==='sizes')continue;
        let value=a.initializer?(ts.isStringLiteral(a.initializer)?JSON.stringify(a.initializer.text):convert(a.initializer.expression)):'true';
        if(tag==='textarea'&&(key==='value'||key==='defaultValue')) {textValue=value;continue;}
        props.push(JSON.stringify(key)+': '+value);
      }
      if(originalTag==='Image')props.push('"loading": "lazy"');
      if(tag==='form'&&props.some(p=>p.startsWith('"action"'))&&!props.some(p=>p.startsWith('"method"')))props.push('"method": "post"');
      if(normalized.endsWith('ItemActions.tsx')&&tag==='button'&&opening.attributes.properties.some(a=>a.name?.getText(sf)==='onClick'))props.push('"data-save-item": listingId || ""');
      if(normalized.endsWith('sell-form.tsx')) {
        const click=opening?.attributes.properties.find(a=>a.name?.getText(sf)==='onClick');
        if(click) {const val=click.initializer?.expression?.getText(sf);if(val==='resetForm')props.push('"data-clear-form": true');if(val==='handlePreview')props.push('"data-preview-listing": true');}
      }
      if(tag==='select') {const i=props.findIndex(p=>p.startsWith('"value":'));if(i>=0)props[i]=props[i].replace('"value":','"data-value":');}
      const content=children.map(child=>{
        if(ts.isJsxText(child)) {const lines=child.text.replaceAll('\r','').split('\n'); const text=lines.map((l,i)=>{let v=l.replaceAll('\t',' ');if(i>0)v=v.trimStart();if(i<lines.length-1)v=v.trimEnd();return v;}).filter(Boolean).join(' ');return escape(text);}
        if(ts.isJsxExpression(child))return child.expression?'${'+convert(child.expression)+'}':'';
        const converted=convert(child);
        return converted.startsWith('html`') ? converted.slice(5,-1) : '${'+converted+'}';
      }).join('');
      if(component) {if(content)props.push('children: html`'+content+'`');return 'partial(() => '+tag+'({'+props.join(', ')+'}))';}
      if(fragment)return 'html`'+content+'`';
      const voidTag=['img','input','br','hr','meta','link','source','wbr','area','embed','col'].includes(tag);
      const attrNames={className:'class',htmlFor:'for',strokeWidth:'stroke-width',strokeLinecap:'stroke-linecap',strokeLinejoin:'stroke-linejoin',fillRule:'fill-rule',clipRule:'clip-rule',tabIndex:'tabindex'};
      const dynamic=[];let staticAttrs='';
      for(const prop of props) {
        const m=prop.match(/^"([^"]+)": ("(?:[^"\\]|\\.)*")$/s);
        if(m){const name=attrNames[m[1]]||m[1].toLowerCase();const value=JSON.parse(m[2]).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');staticAttrs+=' '+name+'="'+escape(value)+'"';}
        else dynamic.push(prop);
      }
      const block=['main','section','div','header','footer','form','nav','aside','ul','ol','li','h1','h2','h3','p','label','input','select','option','button','dl','dt','dd'].includes(tag);
      return 'html`'+(block?'\n':'')+'<'+tag+staticAttrs+(dynamic.length?'${attrs({'+dynamic.join(', ')+'})}':'')+'>'+ (voidTag?'':(textValue?'${'+textValue+'}':content)+'</'+tag+'>')+'`';
    }
    return replaceChildren(node);
  }
  let converted=sf.statements.map(convert).join('\n');
  const output=ts.transpileModule(converted,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},fileName:file.replace(/\.tsx?$/,'.ts')}).outputText;
  let final=output;
  if(final.includes('html`')||final.includes('attrs(')||final.includes('partial('))final=`import { html, attrs, partial } from ${JSON.stringify(relative(file,'server/html.js'))};\n`+final;
  if(final.includes('queryParam('))final=`import { queryParam } from ${JSON.stringify(relative(file,'server/request.js'))};\n`+final;
  final=final.replaceAll('const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;', 'const configuredSupabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;');
  fs.writeFileSync(file.replace(/\.tsx?$/,'.js'),final);
}
console.log('Converted server logic and page templates to JavaScript.');

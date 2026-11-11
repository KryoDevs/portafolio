const {Resvg}=require('@resvg/resvg-js');const fs=require('fs');const root=require('path').join(__dirname,'../assets/img/');
for(const name of ['kori','kori-feliz','kori-dormido','kori-lluvia']){
 let svg=fs.readFileSync(root+'stickers/'+name+'.svg','utf8');
 svg=svg.replace('<circle class="moon" cx="140" cy="148" r="126"/>','');
 fs.writeFileSync(root+'stickers/'+name+'.png',new Resvg(svg,{fitTo:{mode:'width',value:560}}).render().asPng());
}
const mascot=fs.readFileSync(root+'kori.svg','utf8').replace('<svg ', '<svg x="792" y="150" width="330" height="354" ');
/* OG con la tipografía propia del sitio (Bricolage Grotesque, subconjunto para esta imagen). */
const fuentes=['assets/fonts/og-display.ttf','assets/fonts/og-mono.ttf'];
const og=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
 <linearGradient id="cielo" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#eef2f6"/><stop offset="1" stop-color="#dbe2e9"/>
 </linearGradient>
 <pattern id="trama" width="26" height="26" patternUnits="userSpaceOnUse">
  <circle cx="1.4" cy="1.4" r="1.1" fill="#0f1f2e" opacity="0.09"/>
 </pattern>
</defs>
<rect width="1200" height="630" fill="url(#cielo)"/>
<rect x="720" y="0" width="480" height="630" fill="url(#trama)"/>
<circle cx="960" cy="330" r="252" fill="#dbe2e9"/>
<circle cx="960" cy="330" r="252" fill="none" stroke="#0b6e7a" stroke-opacity="0.28" stroke-width="1.5"/>
<circle cx="960" cy="330" r="196" fill="#e9edf1"/>
<rect x="0" y="0" width="14" height="630" fill="#c24e1a"/>
<g font-family="Bricolage" fill="#0f1f2e">
 <text x="70" y="108" font-size="42" font-weight="800" letter-spacing="-1">kryo<tspan fill="#c24e1a">.</tspan></text>
 <text x="70" y="258" font-size="57" font-weight="800" letter-spacing="-2.4">Tecnología que conecta.</text>
 <text x="70" y="330" font-size="57" font-weight="800" letter-spacing="-2.4">Soluciones que funcionan.</text>
</g>
<g font-family="Mono" fill="#45586b" font-weight="400">
 <text x="70" y="404" font-size="19" letter-spacing="2.2">DESARROLLO WEB · REDES · SOPORTE</text>
</g>
<g font-family="Bricolage" fill="#0f1f2e" font-weight="600">
 <text x="70" y="536" font-size="21">Nicolás Díaz · Valdivia, Chile</text>
</g>
<rect x="70" y="560" width="368" height="1.5" fill="#b9c4cf"/>
${mascot}</svg>`;
fs.writeFileSync(root+'og-image.png',new Resvg(og,{font:{fontFiles:fuentes,loadSystemFonts:false,defaultFontFamily:'Bricolage'}}).render().asPng());
/* Iconos de app (manifest y apple-touch) derivados del favicon */
const fav=fs.readFileSync(root+'favicon.svg','utf8');
fs.mkdirSync(root+'icons',{recursive:true});
fs.writeFileSync(root+'icons/icon.svg',fav);
for(const [name,size] of [['icon-180.png',180],['icon-512.png',512]]){
  fs.writeFileSync(root+'icons/'+name,new Resvg(fav,{fitTo:{mode:'width',value:size}}).render().asPng());
}
const mask='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#0b6e7a"/>'+fav.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 40 160 132">','<svg x="76" y="107" width="360" height="297" viewBox="60 40 160 132">')+'</svg>';
fs.writeFileSync(root+'icons/icon-maskable-512.png',new Resvg(mask,{fitTo:{mode:'width',value:512}}).render().asPng());


const {Resvg}=require('@resvg/resvg-js');const fs=require('fs');const root=require('path').join(__dirname,'../assets/img/');
for(const name of ['kori','kori-feliz','kori-dormido','kori-lluvia']){
 let svg=fs.readFileSync(root+'stickers/'+name+'.svg','utf8');
 svg=svg.replace('<circle class="moon" cx="140" cy="148" r="126"/>','');
 fs.writeFileSync(root+'stickers/'+name+'.png',new Resvg(svg,{fitTo:{mode:'width',value:560}}).render().asPng());
}
const mascot=fs.readFileSync(root+'kori.svg','utf8').replace('<svg ', '<svg x="750" y="130" width="350" height="375" ');
const og=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f6f2e7"/><rect x="740" y="65" width="390" height="500" rx="28" fill="#ede8d9"/><g font-family="sans-serif" fill="#20362b"><text x="70" y="105" font-size="46" font-weight="bold">kryo<tspan fill="#c2472e">.</tspan></text><text x="70" y="245" font-size="46" font-weight="bold">Tecnología que conecta.</text><text x="70" y="320" font-size="40" font-weight="bold">Soluciones que funcionan.</text><text x="70" y="400" font-size="24" fill="#5f6e5e">Desarrollo web · Redes · Soporte</text><text x="70" y="540" font-size="22" fill="#5f6e5e">Nicolás Díaz · Valdivia, Chile</text></g>${mascot}</svg>`;
fs.writeFileSync(root+'og-image.png',new Resvg(og).render().asPng());
/* Iconos de app (manifest y apple-touch) derivados del favicon */
const fav=fs.readFileSync(root+'favicon.svg','utf8');
fs.mkdirSync(root+'icons',{recursive:true});
fs.writeFileSync(root+'icons/icon.svg',fav);
for(const [name,size] of [['icon-180.png',180],['icon-512.png',512]]){
  fs.writeFileSync(root+'icons/'+name,new Resvg(fav,{fitTo:{mode:'width',value:size}}).render().asPng());
}
const mask='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#1e6b50"/>'+fav.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 40 160 132">','<svg x="76" y="107" width="360" height="297" viewBox="60 40 160 132">')+'</svg>';
fs.writeFileSync(root+'icons/icon-maskable-512.png',new Resvg(mask,{fitTo:{mode:'width',value:512}}).render().asPng());


/* Course extension: all diagrams use mathematical +Y up, column vectors.
   Engine snippets are labeled independently; no engine matrix layout is implied. */
const gdDocs='https://docs.godotengine.org/en/stable/tutorials/math/matrices_and_transforms.html';
const ueDocs='https://dev.epicgames.com/documentation/en-us/unreal-engine/coordinate-system-and-spaces-in-unreal-engine';
const matDocs='https://dev.epicgames.com/documentation/en-us/unreal-engine/math-material-expressions-in-unreal-engine';
const extraLessons=[
{title:'Degrees and radians',kind:'angle',lead:'Two units for the same turn. Move the angle slider; the arrow does not care which unit describes it.',
idea:'A degree is 1/360 of a turn. A radian is the angle that covers an arc one radius long. A whole circle has circumference 2πr, so one turn is 2π radians. π is approximately 3.14159. Radians are not more precise; they simply fit circle equations naturally.',
formula:'radians = degrees × π / 180',code:'# Godot (Node3D): radians\nrotate_y(deg_to_rad(90.0))\n# Or use the degree property\nrotation_degrees.y = 90.0\n\n// Unreal C++: FRotator(Pitch, Yaw, Roll), degrees\nSetActorRotation(FRotator(0, 90, 0));',
steps:['90° = π/2 ≈ 1.571 radians; 180° = π; 360° = 2π.','A variable named angle does not tell you its unit. Check the function, not just the engine. Godot sin() and Unreal FMath::Sin() take radians; Unreal exposes degree-based trig functions too.','A 90°/second turn becomes 1.571 radians/second. Multiply that rate by delta time before applying it.'],
tryIt:'Set 180°, then 360°. Predict the radians first.',answer:'180° is π radians. 360° is 2π radians: one complete turn back to the starting direction.',stats:['Degrees','Radians','Turns'],source:'https://docs.godotengine.org/en/stable/classes/class_node3d.html'},
{title:'Engine axes and local space',kind:'basis',lead:'“Move forward” means follow the object’s own axis, not always a fixed world axis.',
idea:'World space is the level’s shared coordinate system. Local space is attached to an object. Rotate an object and its local axes rotate with it. The diagram uses a generic 2D plane; the table below gives actual engine conventions.',
formula:'world offset = right × local X + up × local Y',code:'# Godot 3D conventional forward (-Z)\nvar forward = -global_transform.basis.z.normalized()\n\n// Unreal C++ conventional forward (+X)\nFVector Forward = GetActorForwardVector();\n// Blueprint: Get Actor Forward Vector',
steps:['Godot 3D: +X right, +Y up, −Z conventional forward. Unreal: +X forward, +Y right, +Z up. Imported meshes may face a different direction.','The changing arrows are local directions expressed in world coordinates. The gray grid stays fixed. A gun muzzle offset follows those arrows when the character turns.','Godot is right-handed; Unreal is left-handed. Do not blindly copy rotation signs or raw matrix entries between them.'],
tryIt:'Rotate to 90°. Where does local +X point in this math diagram?',answer:'Up the diagram. Its world components are now (0, 1), although its local coordinates remain (1, 0).',stats:['Rotation','Local X in world','Local Y in world'],source:ueDocs},
{title:'Matrices 1: a table with a job',kind:'matrix',lead:'A matrix is a rectangular table of numbers. We will start with just four numbers, not sixteen.',
idea:'“2 × 2” means two rows and two columns. A row goes across; a column goes down. For this course, columns tell you where the original unit axes end up. The first column is the new X axis; the second is the new Y axis.',
formula:'M = [ a  b ; c  d ]',code:'// Course math notation (column vectors)\nnew_x_axis = (a, c)\nnew_y_axis = (b, d)\n// Identity: a=1, b=0, c=0, d=1',
steps:['Identity is the “do nothing” matrix: X stays (1,0), Y stays (0,1). Like multiplying a number by 1.','Change a to 2: a step along X becomes two steps right. Change b: Y steps now also travel sideways. That slant is shear.','A matrix is not always a transform. It is a general table; here we give it the job of mapping vectors.'],
tryIt:'Use Identity, then set a to 2. What happens to a square?',answer:'Its width doubles. Its height stays the same because the second column remains (0, 1).',stats:['New X axis','New Y axis','Area factor'],source:gdDocs},
{title:'Matrices 2: multiply a point',kind:'matrix',lead:'A point (2, 1) says: take two X steps and one Y step. A matrix changes what those steps mean.',
idea:'Multiply each transformed axis by the matching input coordinate, then add the results. This is matrix–vector multiplication. The live arithmetic below is the whole operation—no hidden step.',
formula:'M × (x,y) = (a×x + b×y, c×x + d×y)',code:'// For M = [2 1; 0 1] and p = (2,1):\nx_out = 2*2 + 1*1; // 5\ny_out = 0*2 + 1*1; // 1\n// Output = (5,1)',
steps:['Read across row 1 and multiply by the input column: that gives output X. Repeat row 2 for output Y.','The same result is 2×new_X_axis + 1×new_Y_axis. The table method and the arrow method are two views of one calculation.','Applying the operation to every mesh vertex transforms the whole mesh. You do not need a different formula for each vertex.'],
tryIt:'Set a=2, b=1, c=0, d=1. Predict the transformed point (2,1).',answer:'(5,1). Two copies of (2,0) plus one copy of (1,1).',stats:['Input point','Output point','Area factor'],source:gdDocs},
{title:'Matrices 3: rotate, scale, shear',kind:'matrix',lead:'The same multiplication can stretch, rotate, reflect, or slant a shape. Presets make those jobs visible.',
idea:'Rotation chooses perpendicular unit axes pointing in new directions. Scale changes axis lengths. Shear makes axes no longer perpendicular. A negative scale can reflect the shape.',
formula:'rotation = [ cos θ  −sin θ ; sin θ  cos θ ]',code:'// 90° rotation in this +Y-up diagram:\nM = [0 -1; 1 0]\nM * (2,1) = (-1,2)\n// Scale twice in X:\nS = [2 0; 0 1]',
steps:['Click Rotate 90°. The point turns around the origin; the square does not change size.','Click Shear. The square becomes a parallelogram. Rotation alone cannot do that.','The determinant ad−bc is signed area scaling in 2D. Zero means the plane has collapsed to a line or point; an inverse cannot recover lost coordinates. Negative means orientation has flipped.'],
tryIt:'Set d to 0 with the other identity values. Where did height go?',answer:'Every Y coordinate becomes zero. Multiple different inputs now share the same output, so this matrix cannot be undone.',stats:['New X axis','New Y axis','Determinant'],source:gdDocs},
{title:'Matrices 4: translation and 4×4',kind:'translate',lead:'A 2×2 matrix cannot move the origin. Translation needs an extra ingredient.',
idea:'Any ordinary matrix times the zero vector is still zero. To include movement, extend a 2D point (x,y) to (x,y,1). Now the last column can add translation. That is a homogeneous coordinate—not another physical direction.',
formula:'[1 0 tx; 0 1 ty; 0 0 1] × [x;y;1] = [x+tx;y+ty;1]',code:'// 3D affine form using course column convention:\nM = [ a b c tx\n      d e f ty\n      g h i tz\n      0 0 0  1 ]\npoint     = M * (x,y,z,1)\ndirection = M * (x,y,z,0)',
steps:['A point gets w=1 so translation applies. A direction gets w=0 so moving the object does not change the direction.','In 3D the linear part needs 3×3 numbers. Add translation and the homogeneous row and you get 4×4. You still use the same row-times-column arithmetic.','Godot Transform3D stores Basis plus origin (a compact 3×4 affine transform). Unreal FTransform stores translation, quaternion rotation, and scale—not a literal sixteen-number array.'],
tryIt:'Set translation X to 2. Compare the point and direction outputs.',answer:'The point (2,1) becomes (4,1). The direction stays (2,1), because translation multiplies its w=0.',stats:['Translation','Point output','Direction output'],source:'https://docs.godotengine.org/en/stable/classes/class_transform3d.html'},
{title:'Matrices 5: order matters',kind:'order',lead:'Rotate a point, then move it. Now swap the order. The two results are different.',
idea:'Matrix multiplication combines operations. In our column-vector convention, T×R×p means rotate p first, then translate. Read the actions from right to left. This is not element-by-element multiplication of the two tables.',
formula:'(A×B)[row,col] = sum of A[row,k]×B[k,col]',code:'// Point p=(1,0), rotate 90°, translate (2,0):\nT * R * p = (2,1)\nR * T * p = (0,3)\n// Unreal native matrix conventions differ.\n// Prefer engine transform helpers to ported raw tables.',
steps:['R turns (1,0) into (0,1); T then adds (2,0), producing (2,1).','T first makes (3,0); R then turns that into (0,3). This is why rotating around the world origin can look like orbiting instead of spinning.','With column vectors, parent_world × child_local gives child_world. Order is part of the meaning. Matrix storage layout and multiplication convention are separate concepts.'],
tryIt:'Set angle to 0°. Why do the two markers meet?',answer:'The rotation becomes identity, so it no longer changes the translation. At 90° they split again.',stats:['Rotate then move','Move then rotate','Translation'],source:gdDocs},
{title:'Matrices 6: inverse and engine basis',kind:'inverse',lead:'An inverse answers: which local point produced this world point?',
idea:'Godot Basis is a 3×3 linear transform. Its x, y, z columns are transformed local axes; it can represent rotation, scale, and shear. Position is separate in Transform3D.origin. Unreal usually exposes the equivalent tasks through FTransform and direction helpers.',
formula:'world = basis × local + origin; local = inverse_transform × world',code:'# Godot Node3D\nvar world_point = to_global(local_point)\nvar recovered = to_local(world_point)\n# General transform inverse (nonzero determinant):\nvar back = global_transform.affine_inverse() * world_point\n\n// Unreal C++\nauto T = GetActorTransform();\nauto W = T.TransformPosition(LocalPoint);\nauto L = T.InverseTransformPosition(W);\n// Blueprint: Transform Location / Inverse Transform Location',
steps:['The demo rotates local (2,1), adds an origin offset, then reverses those operations. The recovered point stays (2,1).','To undo A then B, undo B first, then A. Subtract the origin before applying the inverse basis.','A pure rotation has inverse equal to transpose (swap rows and columns). That shortcut does not generally work for scaled or sheared bases. Zero scale prevents an inverse.','Unreal FTransform does not represent arbitrary shear. Combining rotated nonuniform scales can require a general matrix; do not assume all transform representations have identical capabilities.'],
tryIt:'Change angle and origin offset. Does the recovered local point move?',answer:'No. Its world address changes, but reversing the same transform recovers (2,1).',stats:['Local','World','Recovered local'],source:'https://docs.godotengine.org/en/stable/classes/class_basis.html'},
{title:'Material math: colors are vectors',kind:'color',lead:'A color is three numbers. Mixing colors uses the same lerp you used for movement.',
idea:'RGB holds red, green, and blue components. Multiplication and addition normally work component by component. A scalar multiplies every channel. A mask is a number used to control where an effect happens.',
formula:'result = A×(1−mask) + B×mask',code:'// Godot spatial shader, inside fragment():\nALBEDO = mix(vec3(0.1,0.3,0.8),\n             vec3(0.9,0.4,0.1), mask);\n\n// Unreal material nodes:\n// VectorParameter A/B → Lerp A/B\n// ScalarParameter mask → Lerp Alpha\n// Lerp → Base Color',
steps:['At mask 0, use A. At 1, use B. At 0.5, use the halfway value of each channel.','Multiplying by 0 produces black; multiplying by 1 preserves the color. Adding 0 does nothing.','These are numeric teaching swatches. Real lighting, sRGB-to-linear conversion, exposure, and tone mapping affect the displayed result. Values above 1 can be meaningful for HDR/emission.'],
tryIt:'Set mask to 0.5. Calculate the red channel.',answer:'0.1×0.5 + 0.9×0.5 = 0.5. The complete result is (0.5,0.35,0.45).',stats:['Blend mask','Output RGB','Operation'],source:matDocs},
{title:'UVs: coordinates for a texture',kind:'uv',lead:'A shader evaluates numbers across a surface. UV gives each sample a two-number address.',
idea:'U and V are texture coordinates. Multiplying them changes how many times a pattern fits on the surface; adding offsets changes which part you sample. Here a checker pattern stands in for an image.',
formula:'sample_uv = UV × tiles + offset',code:'// Godot shader sampling (texture needs repeat enabled):\nvec2 uv = UV * tiles + vec2(offset, 0.0);\nALBEDO = texture(albedo_texture, uv).rgb;\n\n// Unreal material nodes:\n// TextureCoordinate → Multiply(tiles) → Add(offset)\n// → TextureSample UVs',
steps:['A UV scale of 4 samples four repetitions along each axis, making each tile smaller. It does not make the mesh bigger.','Offsets move the sampling address, not the mesh. Increasing U offset makes the visible sampled pattern travel toward decreasing U.','Coordinates outside 0–1 need a wrapping rule. Repeat tiles; clamp holds the edge. The demo deliberately repeats.'],
tryIt:'Set tiles from 1 to 2. How many repeats cover the whole square?',answer:'Two along U and two along V: four total. Doubling both axes quadruples the count.',stats:['Tiles per axis','U offset','Wrapping'],source:'https://dev.epicgames.com/documentation/en-us/unreal-engine/coordinates-material-expressions-in-unreal-engine'},
{title:'Shader masks: step and smoothstep',kind:'mask',lead:'A procedural circle is a distance test at every pixel—not a pre-painted image.',
idea:'Subtract the center from UV, measure the vector length, and compare it with a radius. step is a hard threshold; smoothstep creates a smooth transition between two thresholds.',
formula:'mask = 1 − smoothstep(radius−softness, radius, distance)',code:'// Godot shader fragment snippet:\nfloat d = length(UV - vec2(0.5));\nfloat mask = 1.0 - smoothstep(0.25, 0.3, d);\nALBEDO = vec3(mask);\n\n// Unreal: TextureCoordinate → Subtract(0.5)\n// → Length → SmoothStep → OneMinus\n// → Lerp Alpha or an appropriate material mask input',
steps:['Subtraction makes the center (0,0). Length gives radial distance. All pixels at the same distance get the same value.','The inverse makes the inside white (1) and the outside black (0). Use that number to blend colors, not only for transparency.','Softness needs a positive interval. The demo switches to a hard comparison at zero instead of calling smoothstep with equal edges. A non-square UV display stretches this circle.'],
tryIt:'Set softness to 0, then 0.1. Which pixels change?',answer:'Pixels near the edge. The center stays 1 and distant outside pixels stay 0; only the transition widens.',stats:['Radius','Softness','Center mask'],source:matDocs},
{title:'Shader time: waves and normals',kind:'wave',lead:'Time turns a static formula into animation. Amplitude sets size; frequency sets repetitions per second.',
idea:'sin() outputs −1 to 1. Multiply by amplitude to set the displacement. Add time to the phase to animate it. A normal is a direction perpendicular to a surface, used for lighting; changing vertex positions may also require updating normals.',
formula:'height = amplitude × sin(2π × frequency × time + phase)',code:'// Godot spatial shader vertex snippet:\nVERTEX.y += sin(TIME * 6.2831853 * frequency\n                + VERTEX.x) * amplitude;\n\n// Unreal material Sine (default Period=1):\n// Time → Multiply(frequency) → Sine\n// → Multiply(amplitude) → Multiply((0,0,1))\n// → World Position Offset',
steps:['For a 1 Hz pulse, Godot sin() takes TIME×2π. Unreal Material Sine with its default Period=1 takes Time directly for one cycle/second. That material node differs from radian-based FMath::Sin().','The Unreal chain here bobs uniformly along world Z. The Godot snippet includes VERTEX.x, creating a spatial wave along local X. The graph isolates one point (phase=0).','Shaders change rendering, not automatically collision geometry. Vertex displacement can leave physics and normals unchanged. These snippets explain displacement, not a complete water material.','For simple diffuse shading, max(dot(normal, direction_to_light),0) is brightest when directions align. Both vectors must be normalized and in the same coordinate space.'],
tryIt:'Double frequency. Does the wave become taller?',answer:'No: it completes twice as many cycles per second. Only amplitude controls height.',stats:['Time','Height','Cycles per second'],source:matDocs}
];
extraLessons.forEach(l=>lessons.push(l));
lessons[6].code='// Frame-rate-independent exponential smoothing:\nalpha = 1 - exp(-2.2 * dt)\nsmooth = lerp(smooth, target, alpha)\nconstant = move_toward(constant, target, 150 * dt)';
lessons[7].code='// +Y-up math convention, downward gravity:\nvelocity = (cos(angle), sin(angle)) * speed\nvelocity.y -= gravity_magnitude * delta_time';
const style=document.createElement('style');
style.textContent='.course-nav{position:static}.nav-list{display:block}.nav-button{font-size:14px}.lesson-details{margin-top:22px}.lesson-details p{max-width:75ch}.lesson-details li{margin:12px 0}.lesson-details a{color:var(--accent)}.math-table{border-collapse:collapse;margin:12px 0;font-variant-numeric:tabular-nums}.math-table td,.math-table th{border:1px solid var(--border);padding:8px 14px;text-align:center}.calculation{white-space:pre-wrap;font:16px/1.7 monospace}.formula{overflow-wrap:anywhere}.controls label{flex-wrap:wrap}.explain{grid-template-columns:1fr}.btn:disabled{opacity:.5} @media(max-width:800px){.nav-list{display:flex}.nav-button{min-width:48px}.visual canvas{min-height:260px;aspect-ratio:auto}}';
document.head.append(style);
document.querySelector('.hero p').textContent='Start with movement, then learn engine spaces, matrices from scratch, and practical material and shader math. Take one lesson at a time.';
const details=document.createElement('section');details.className='lesson-details';
document.querySelector('.footer-actions').before(details);
let running=false;
const originalRender=renderLesson,originalDraw=drawLesson;
renderLesson=function(){
 originalRender();running=false;canvas.setAttribute('aria-label',lessons[index].lead);
 state.a=1;state.b=0;state.c=0;state.d=1;state.tx=2;state.angle=45;state.mix=.5;state.tiles=2;state.offset=0;state.radius=.3;state.soft=.05;state.freq=1;state.amp=1;
 const l=lessons[index];details.replaceChildren();
 if(index>=8){
  const heading=document.createElement('h3');heading.textContent='Work through it';details.append(heading);
  const ol=document.createElement('ol');l.steps.forEach(s=>{const li=document.createElement('li');li.textContent=s;ol.append(li)});details.append(ol);
  const calc=document.createElement('div');calc.id='live-calculation';calc.className='calculation';details.prepend(calc);
  const prompt=document.createElement('p');prompt.textContent='Try it: '+l.tryIt;details.append(prompt);
  const reveal=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Show explanation';const answer=document.createElement('p');answer.textContent=l.answer;reveal.append(summary,answer);details.append(reveal);
  const source=document.createElement('a');source.href=l.source;source.textContent='Engine reference';source.target='_blank';source.rel='noopener';details.append(source);
  if(index===9){
   const table=document.createElement('table');table.className='math-table';
   table.innerHTML='<tr><th>3D convention</th><th>Godot</th><th>Unreal</th></tr><tr><td>Right</td><td>+X</td><td>+Y</td></tr><tr><td>Up</td><td>+Y</td><td>+Z</td></tr><tr><td>Forward</td><td>−Z</td><td>+X</td></tr>';
   details.prepend(table);
  }
  const k=l.kind;
  if(['angle','basis','order','inverse'].includes(k))slider('Angle (degrees)',0,360,45,1,v=>state.angle=v);
  if(k==='matrix'){
   ['a','b','c','d'].forEach(key=>slider(key,-2,2,state[key],.25,v=>state[key]=v));
   function preset(label,vals){button(label,()=>{['a','b','c','d'].forEach((key,i)=>{state[key]=vals[i];const input=ui.controls.querySelectorAll('input')[i];input.value=vals[i];input.previousSibling.textContent=key+': '+vals[i]})})}
   preset('Identity',[1,0,0,1]);preset('Rotate 90°',[0,-1,1,0]);preset('Shear',[1,1,0,1]);
  }
  if(['translate','inverse'].includes(k))slider('Origin X',-2,2,2,.1,v=>state.tx=v);
  if(k==='color')slider('Blend mask',0,1,.5,.01,v=>state.mix=v);
  if(k==='uv'){slider('Tiles',1,6,2,1,v=>state.tiles=v);slider('U offset',0,1,0,.01,v=>state.offset=v)}
  if(k==='mask'){slider('Radius',.1,.45,.3,.01,v=>state.radius=v);slider('Softness',0,.1,.05,.01,v=>state.soft=v)}
  if(k==='wave'){slider('Frequency (Hz)',.25,2,1,.25,v=>state.freq=v);slider('Amplitude',.2,1.5,1,.1,v=>state.amp=v)}
 }else{
  if(index===3)ui.controls.querySelector('button').hidden=true;
  const note=document.createElement('p');note.textContent='Examples in lessons 1–8 are engine-neutral pseudocode. Diagrams use +Y up; Godot 2D screen coordinates use +Y down. Use Play for motion; drag vectors in lessons 1–3.';details.append(note);
  if(index===2){state.mouseX=550;state.mouseY=125;const bs=ui.controls.querySelectorAll('button');bs[0].onclick=()=>{state.mouseX=550;state.mouseY=225};bs[1].onclick=()=>{state.mouseX=550;state.mouseY=125};bs[1].textContent='Diagonal (1, 1)'}
 }
 if([3,4,6,7].includes(index)||lessons[index].kind==='wave'){
  const b=button('Play',()=>{running=!running;b.textContent=running?'Pause':'Play'});
  button('Step 0.1 s',()=>{running=false;b.textContent='Play';drawLesson(.1)});
 }
};
function n(v){return (Math.abs(v)<.00001?0:v).toFixed(2)}
function pair(x,y){return '('+n(x)+', '+n(y)+')'}
function mathPoint(x,y){return [450+x*45,240-y*45]}
function mathArrow(x,y,color,label){arrow(...mathPoint(0,0),...mathPoint(x,y),color,label)}
function square(a,b,c,d){const p=[[0,0],[1,0],[1,1],[0,1]];ctx.beginPath();p.forEach(([x,y],i)=>{const q=mathPoint(a*x+b*y,c*x+d*y);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.closePath();ctx.globalAlpha=.15;ctx.fillStyle=C().accent;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=C().accent;ctx.stroke()}
drawLesson=function(dt){
 if(index<8){
  // Keep the original comparison labels and numeric readouts consistent.
  if(index===3)state.mode='wrong';
  if(index===6){const before=state.lerp;originalDraw(dt);state.lerp=800+(before-800)*Math.exp(-2.2*dt);return}
  originalDraw(dt);return
 }
 grid();const l=lessons[index],k=l.kind,col=C(),angle=state.angle*Math.PI/180,co=Math.cos(angle),si=Math.sin(angle);
 const calc=document.getElementById('live-calculation');
 if(k==='angle'||k==='basis'){
  ctx.beginPath();ctx.arc(450,240,120,0,2*Math.PI);ctx.strokeStyle=col.border;ctx.stroke();
  mathArrow(co*2.65,si*2.65,col.accent,'local X');
  if(k==='basis')mathArrow(-si*2.65,co*2.65,col.accent2,'local Y');
  setStats(k==='angle'?[state.angle+'°',n(angle),n(state.angle/360)]:[state.angle+'°',pair(co,si),pair(-si,co)]);
  calc.textContent=k==='angle'?state.angle+' × π / 180 = '+n(angle)+' radians':'World offset for local (2,1): 2 × '+pair(co,si)+' + '+pair(-si,co)+' = '+pair(2*co-si,2*si+co);
 }
 if(k==='matrix'){
  const {a,b,c,d}=state,ox=2*a+b,oy=2*c+d,det=a*d-b*c;
  square(a,b,c,d);mathArrow(a,c,col.accent,'new X');mathArrow(b,d,col.accent2,'new Y');dot(...mathPoint(2,1),col.muted,6);dot(...mathPoint(ox,oy),col.good,9);
  text('Gray: input (2,1) • Green: transformed point',35,35,col.text);
  calc.innerHTML='<table class="math-table" aria-label="Two by two transformation matrix"><tr><th></th><th>Column X</th><th>Column Y</th></tr><tr><th>Row X</th><td>'+n(a)+'</td><td>'+n(b)+'</td></tr><tr><th>Row Y</th><td>'+n(c)+'</td><td>'+n(d)+'</td></tr></table>';
  const work=document.createElement('div');work.textContent='X output = '+n(a)+' × 2 + '+n(b)+' × 1 = '+n(ox)+'\nY output = '+n(c)+' × 2 + '+n(d)+' × 1 = '+n(oy)+'\nDeterminant = '+n(a)+' × '+n(d)+' − '+n(b)+' × '+n(c)+' = '+n(det);calc.append(work);
  setStats(index===11?['(2,1)',pair(ox,oy),n(det)]:[pair(a,c),pair(b,d),n(det)]);
 }
 if(['translate','order','inverse'].includes(k)){
  let x=2,y=1;
  if(k==='translate'){x+=state.tx;calc.textContent='Point: (2,1,1) → '+pair(x,y)+'\nDirection: (2,1,0) → (2,1)';setStats([pair(state.tx,0),pair(x,y),'(2,1)'])}
  if(k==='order'){x=co+2;y=si;const bx=3*co,by=3*si;dot(...mathPoint(bx,by),col.accent2,11);text('Orange: move, then rotate',35,65,col.text);calc.textContent='T×R×p = '+pair(x,y)+'\nR×T×p = '+pair(bx,by);setStats([pair(x,y),pair(bx,by),'(2,0)'])}
  if(k==='inverse'){x=2*co-si+state.tx;y=2*si+co;const rx=co*(x-state.tx)+si*y,ry=-si*(x-state.tx)+co*y;setStats(['(2,1)',pair(x,y),pair(rx,ry)]);calc.textContent='1. Rotate (2,1): '+pair(x-state.tx,y)+'\n2. Add origin: '+pair(x,y)+'\n3. Subtract origin, then rotate back: '+pair(rx,ry)}
  dot(...mathPoint(x,y),col.accent,10);text('Blue: transformed point',35,35,col.text);line(...mathPoint(0,0),...mathPoint(x,y),col.accent,2);
 }
 if(k==='color'){
  const a=[.1,.3,.8],b=[.9,.4,.1],rgb=a.map((v,i)=>v*(1-state.mix)+b[i]*state.mix);
  [a,rgb,b].forEach((v,i)=>{ctx.fillStyle='rgb('+v.map(x=>Math.round(x*255)).join(',')+')';ctx.fillRect(75+i*260,90,230,250);text(['A','Result','B'][i],190+i*260,370,col.text,'center',22)});
  setStats([n(state.mix),rgb.map(n).join(', '),'Per-channel lerp']);calc.textContent='Red = 0.1 × (1 − '+n(state.mix)+') + 0.9 × '+n(state.mix)+' = '+n(rgb[0]);
 }
 if(k==='uv'||k==='mask'){
  for(let j=0;j<100;j++)for(let i=0;i<100;i++){
   const u=(i+.5)/100,v=(j+.5)/100;let value;
   if(k==='uv')value=(Math.floor((u*state.tiles+state.offset)*2)+Math.floor(v*state.tiles*2))%2;
   else{const d=Math.hypot(u-.5,v-.5);const t=state.soft?Math.max(0,Math.min(1,(d-state.radius+state.soft)/state.soft)):Number(d>=state.radius);value=1-t*t*(3-2*t)}
   ctx.fillStyle=k==='uv'?(value?col.accent:col.panel):'rgb('+[1,1,1].map(()=>Math.round(value*255)).join(',')+')';ctx.fillRect(270+i*3.6,40+j*3.6,3.7,3.7);
  }
  setStats(k==='uv'?[state.tiles,n(state.offset),'Repeat']:[n(state.radius),n(state.soft),'1.00']);
  calc.textContent=k==='uv'?'At UV (0.25, 0.5): sample address = '+pair(.25*state.tiles+state.offset,.5*state.tiles):'Center distance = 0. Edge distance = radius. White means 1; black means 0.';
 }
 if(k==='wave'){
  state.t+=dt;const h=state.amp*Math.sin(2*Math.PI*state.freq*state.t);
  ctx.beginPath();for(let i=0;i<=700;i++){const t=i/175,y=225-80*state.amp*Math.sin(2*Math.PI*state.freq*t);i?ctx.lineTo(100+i,y):ctx.moveTo(100+i,y)}ctx.strokeStyle=col.accent;ctx.lineWidth=3;ctx.stroke();
  dot(100+(state.t%4)*175,225-h*80,col.accent2,10);text('0 s',100,420);text('4 s',800,420);text('Time (seconds)',450,420,col.text,'center');
  setStats([n(state.t)+' s',n(h),state.freq+' Hz']);calc.textContent='Phase = 2π × '+state.freq+' × '+n(state.t)+' radians\nHeight = '+n(state.amp)+' × sin(phase) = '+n(h);
 }
};
// Retain stable lesson indices so existing completion marks remain valid.
ui.nav.replaceChildren();
lessons.forEach((l,i)=>{const b=document.createElement('button');b.className='nav-button';b.setAttribute('aria-label','Lesson '+(i+1)+': '+l.title);b.innerHTML='<span class="num">'+(i+1)+'</span><span>'+l.title+'</span>';b.onclick=()=>{index=i;renderLesson()};ui.nav.append(b)});
frame=function(now){const dt=Math.min(.05,(now-last)/1000);last=now;drawLesson(running?dt:0);requestAnimationFrame(frame)};

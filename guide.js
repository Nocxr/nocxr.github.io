/* Reference-guide structure layered over the interactive math demonstrations. */
const pidIndex=lessons.push({
  title:'PID controllers: correct toward a target',kind:'pid',
  lead:'A PID controller turns error into a correction. Tune proportional, integral, and derivative strength and watch the system settle—or overshoot.',
  idea:'P reacts to the error right now. I accumulates past error to remove a lasting offset. D reacts to how quickly error changes, adding damping. Games use PID-style control for steering, hovering, cameras, motors, and network correction.',
  formula:'output = Kp×error + Ki×∫error dt + Kd×d(error)/dt',
  code:'error = target - value\nintegral += error * dt\nderivative = (error - previous_error) / dt\noutput = kp*error + ki*integral + kd*derivative',
  steps:['Start with I and D at zero. Raise P until the response is quick but begins to overshoot.','Raise D to resist rapid change and reduce oscillation. D is sensitive to noisy measurements, so real systems often filter it.','Add a small I only when a steady bias keeps the value from reaching the target. Clamp the accumulated integral to prevent windup.','The same equation controls one scalar axis. For 2D or 3D movement, run it per axis or control a vector error carefully. Rotations need angle wrapping or quaternion-aware error.'],
  tryIt:'Set P high and D to zero, then add D. What changes?',answer:'High P alone tends to overshoot and oscillate. D pushes against rapid error changes, so the system usually settles sooner.',
  stats:['Current value','Error','Controller output'],source:'https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/pidcontroller.html'
})-1;
const guideSections = [
  {name:'Foundations', entries:[0,1,2,8]},
  {name:'Motion over time', entries:[3,4,6,7,pidIndex]},
  {name:'Directions and spaces', entries:[5,9]},
  {name:'Matrices and transforms', entries:[10,11,12,13,14,15]},
  {name:'Materials and shaders', entries:[16,17,18,19]}
];
const entryOrder = guideSections.flatMap(section=>section.entries);
const sectionFor = new Map(guideSections.flatMap(section=>section.entries.map(i=>[i,section.name])));

lessons[0] = {
  ...lessons[0],
  title:'Coordinates, axes, and position',
  lead:'Every 3D tool uses X, Y, and Z, but they do not all agree on which axis means up or forward. Start with the map before moving values between them.',
  idea:'A coordinate system defines an origin, three perpendicular axes, positive directions, and handedness. A position is an address measured from an origin. “Forward” is an application convention rather than a fourth mathematical axis.',
  formula:'position = origin + right×x + up×y + forward×z',
  code:'// Switch between 2D and 3D above.\n// The formula, diagram, values, and engine examples all follow your choice.',
  stats:['Horizontal coordinate','Vertical coordinate','Distance from origin']
};

let foundationDimension='2d';
let rotationDimension='2d';
lessons[8]={...lessons[8],title:'Angles and rotation: 2D to 3D'};
const foundationContent={
  0:{
    '2d':{lead:'A 2D position is an address on a flat plane. Drag the point to change its X and Y coordinates.',idea:'A 2D position has two components. X usually describes left and right. The meaning of Y depends on the space: a math-style world diagram often uses +Y up, while screen and UI coordinates commonly use +Y down.',formula:'position = (x, y)',code:'position_2d = Vector2(x, y)',stats:['X position','Y position','Distance from origin']},
    '3d':{lead:'A 3D position adds depth. Adjust X, Y, and Z and watch one point move through a projected 3D space.',idea:'A 3D position has three components measured from an origin. The axes are perpendicular, but engines disagree about which one is up and which direction counts as forward. The comparison below is your translation map.',formula:'position = (x, y, z)',code:'position_3d = Vector3(x, y, z)',stats:['World position','Ground-plane distance','Distance from origin']}
  },
  1:{
    '2d':{lead:'A 2D vector packages horizontal and vertical change. Drag its end to change direction and length.',idea:'A vector is an offset, not an address. In 2D, its X and Y components form the two short sides of a right triangle; its length is the hypotenuse.',formula:'length = √(x² + y²)',code:'offset = target_2d - current_2d',stats:['2D vector','Length','Angle']},
    '3d':{lead:'A 3D vector adds a Z component. Adjust all three components to see how they combine into one direction and length.',idea:'The same right-triangle idea extends to 3D. X, Y, and Z are component distances; the vector length combines all three. Subtracting two 3D positions produces the offset between them.',formula:'length = √(x² + y² + z²)',code:'offset = target_3d - current_3d',stats:['3D vector','Length','Horizontal length']}
  },
  2:{
    '2d':{lead:'Normalize a 2D vector to keep its direction while changing its length to one.',idea:'A unit vector carries direction without speed. Divide both components by the original length. A zero-length vector has no direction, so use the engine\'s safe normalization method.',formula:'unit = (x, y) ÷ √(x² + y²)',code:'direction = offset_2d.normalized()',stats:['2D input vector','Raw length','Normalized length']},
    '3d':{lead:'Normalization works the same way in 3D: divide X, Y, and Z by the vector\'s total length.',idea:'The normalized arrow points exactly the same way but has length one. You can then multiply it by a speed, distance, or force without the original magnitude leaking into the result.',formula:'unit = (x, y, z) ÷ √(x² + y² + z²)',code:'direction = offset_3d.normalized()',stats:['3D input vector','Raw length','Normalized length']}
  }
};

const rotationContent={
  '2d':{lead:'In 2D, rotation needs one angle: turn around the axis pointing out of the screen.',idea:'A 2D object rotates within one plane, so one signed angle is enough. Sine and cosine turn that angle into a direction. The diagram uses radians internally while showing both units.',formula:'direction = (cos θ, sin θ)',code:'angle_radians = degrees × π / 180',stats:['Degrees','Radians','Turns']},
  '3d':{lead:'In 3D, an object can rotate around X, Y, and Z. Use the angle slider to rotate around the shown Y axis.',idea:'Three-dimensional orientation is not just “a 3D angle.” Euler angles store three ordered rotations and are readable, but order matters and gimbal lock can occur. Engines commonly use quaternions internally and expose Euler angles for editing.',formula:'orientation = rotation_axis + angle',code:'orientation = Quaternion(axis, angle_radians)',stats:['Y-axis rotation','Radians','Forward direction']}
};

const dimensionNotes={
  3:['2D: velocity and position usually use Vector2.','3D: use Vector3; delta time works identically on X, Y, and Z.'],
  4:['2D: acceleration changes a Vector2 velocity.','3D: gravity, thrust, and steering are Vector3 values; the integration steps are unchanged.'],
  5:['2D: dot products compare directions in a plane.','3D: the same dot product compares full spatial directions and is widely used for vision cones and lighting.'],
  6:['2D and 3D use the same interpolation math; only the number of vector components changes.','For rotations, interpolate angles carefully; 3D orientation usually uses quaternion interpolation such as slerp.'],
  7:['2D: this diagram is a side view with horizontal X and vertical Y.','3D: choose a launch plane, then add a sideways component; gravity still acts along the engine\'s vertical axis.'],
  9:['2D: a basis is two perpendicular local axes and one rotation angle.','3D: a basis has three local axes. Godot Basis stores them directly; Unity and Unreal expose equivalent transform-direction helpers.'],
  10:['2D: two basis axes fit in a 2×2 matrix.','3D: three basis axes fit in a 3×3 matrix; the meaning of rows and columns is otherwise the same.'],
  11:['2D: multiply a 2×2 matrix by a Vector2.','3D: multiply a 3×3 matrix by a Vector3; each output component gains one more multiply-and-add.'],
  12:['2D: rotation, scale, shear, and reflection act on a plane.','3D: the same operations can act differently along three axes, and rotations can combine in different orders.'],
  13:['2D affine transforms commonly use 3×3 homogeneous matrices.','3D affine transforms commonly use 4×4 matrices, or a compact translation/rotation/scale representation.'],
  14:['2D transform order changes whether an object spins or orbits in a plane.','3D has the same order problem across three rotation axes, which makes engine transform helpers especially useful.'],
  15:['2D inverse transforms recover local Vector2 values.','3D inverse transforms recover local Vector3 values; nonzero scale is required for a usable inverse.'],
  16:['2D: colors and masks often shade sprites or UI pixels.','3D: the same vector math shades surface points, then lighting and normals contribute more inputs.'],
  17:['2D: UVs map directly across a sprite or screen rectangle.','3D: UVs unwrap a model\'s surface into a 2D texture plane; the UV math itself stays two-dimensional.'],
  18:['2D: distance fields make circles, outlines, and sprite effects.','3D: the same masks can run in UV space, world space, or object space depending on the effect.'],
  19:['2D: time can animate color, UVs, or sprite vertices.','3D: vertex displacement needs a 3D direction and may require updated normals or matching collision.']
};
dimensionNotes[pidIndex]=['2D: run one controller per position axis, or feed it a Vector2 error when the output can remain a vector.','3D: translation can use Vector3 error; orientation control needs wrapped angle error or quaternion-aware rotation error.'];

function makeDimensionComparison(notes){
  const section=document.createElement('section');section.className='dimension-comparison';
  const h=document.createElement('h3');h.textContent='2D vs 3D';
  const grid=document.createElement('div');grid.className='dimension-grid';
  notes.forEach((note,i)=>{const card=document.createElement('article');card.innerHTML=`<h4>${i?'3D':'2D'}</h4><p>${note.replace(/^2D: |^3D: /,'')}</p>`;grid.append(card)});
  section.append(h,grid);return section;
}

const fundamentals = {
  0:['The origin is (0,0) in 2D and (0,0,0) in 3D. World positions are measured from the world origin; local positions are measured from an object or parent origin.','A position and a direction can use the same number of components, but they mean different things. Translating an object changes a position, not a direction.','Axis colors are commonly X red, Y green, Z blue, but rely on the labels—not color alone.'],
  1:['A vector has components, such as (3,4), and a length. It can describe an offset, velocity, force, surface normal, or direction.','Subtract positions to get the vector from one position to another: target − current. Reversing the order reverses the arrow.','Vectors must be in the same coordinate space before you add them or take their dot product.'],
  2:['A normalized vector has length 1, so it describes direction without carrying speed.','Do not normalize the zero vector manually: division by zero has no valid direction. Use each engine’s safe normalization behavior.','Normalize once when appropriate; repeatedly normalizing data that should preserve magnitude destroys useful information.'],
  3:['Speed uses distance per second. Multiplying by seconds per frame produces distance per frame. The units cancel cleanly.','Variable frame updates are useful for presentation and input. Physics engines generally use a fixed simulation step.','Delta time fixes rate-based movement, but it does not automatically make every numerical simulation stable.'],
  4:['Velocity has direction and speed. Acceleration describes how velocity changes each second.','Gravity is acceleration, not a fixed downward movement amount. It changes vertical velocity over time.','The order velocity += acceleration×dt, then position += velocity×dt is a common simple integrator called semi-implicit Euler.'],
  5:['For unit vectors, dot = cos(angle). This turns an angle comparison into a cheap number comparison.','A positive dot means generally ahead; zero means perpendicular; negative means behind.','Normalize first if you want only the angle. Otherwise vector lengths also scale the result.'],
  6:['Lerp’s t is a fraction between endpoints—not automatically seconds or speed.','Repeated frame-by-frame lerp eases toward a target. Use a delta-time-aware alpha if behavior should match across frame rates.','Move-toward is easier when you need a fixed number of units per second.'],
  7:['Cosine and sine split launch speed into horizontal and vertical components.','This entry uses a +Y-up diagram, so downward gravity subtracts from Y velocity. Engine axis conventions change the component/sign.','Ignoring drag, horizontal velocity stays constant while gravity changes vertical velocity.'],
  8:['Degrees and radians are units for the same angle, like inches and centimeters for the same length.','A whole turn is 360° or 2π radians. Half a turn is 180° or π radians.','APIs within one engine may use different units. Function documentation wins over guessing.'],
  9:['World axes stay fixed; local axes rotate and scale with the object. Parent space is the local space of the parent.','Transforming a direction ignores translation. Transforming a position includes translation.','Engine “forward” helpers are usually clearer and safer than memorizing a raw basis column.']
};

const engineExamples = {
  0:{
    Godot:'# Node3D world position\nglobal_position = Vector3(2, 1, -3)\nvar forward = -global_transform.basis.z',
    Unity:'// Transform world position\ntransform.position = new Vector3(2, 1, -3);\nVector3 forward = transform.forward; // local +Z',
    Unreal:'// Unreal distance units are centimeters by default\nSetActorLocation(FVector(200, 100, 300));\nFVector Forward = GetActorForwardVector(); // local +X'
  },
  1:{
    Godot:'var offset = target.global_position - global_position\nvar distance = offset.length()',
    Unity:'Vector3 offset = target.position - transform.position;\nfloat distance = offset.magnitude;',
    Unreal:'FVector Offset = Target - GetActorLocation();\nfloat Distance = Offset.Size();'
  },
  2:{
    Godot:'var direction = offset.normalized()',
    Unity:'Vector3 direction = offset.normalized;',
    Unreal:'FVector Direction = Offset.GetSafeNormal();'
  },
  3:{
    Godot:'func _process(delta):\n    position += velocity * delta',
    Unity:'void Update() {\n    transform.position += velocity * Time.deltaTime;\n}',
    Unreal:'void Tick(float DeltaSeconds) {\n    AddActorWorldOffset(Velocity * DeltaSeconds);\n}'
  },
  4:{
    Godot:'velocity += acceleration * delta\nposition += velocity * delta',
    Unity:'velocity += acceleration * Time.deltaTime;\ntransform.position += velocity * Time.deltaTime;',
    Unreal:'Velocity += Acceleration * DeltaSeconds;\nAddActorWorldOffset(Velocity * DeltaSeconds);'
  },
  5:{
    Godot:'var facing = forward.dot(to_target.normalized())',
    Unity:'float facing = Vector3.Dot(forward, toTarget.normalized);',
    Unreal:'float Facing = FVector::DotProduct(Forward, ToTarget.GetSafeNormal());'
  },
  6:{
    Godot:'position = position.move_toward(target, speed * delta)',
    Unity:'transform.position = Vector3.MoveTowards(\n    transform.position, target, speed * Time.deltaTime);',
    Unreal:'Location = FMath::VInterpConstantTo(\n    Location, Target, DeltaSeconds, Speed);'
  },
  7:{
    Godot:'velocity.y -= gravity * delta\nposition += velocity * delta',
    Unity:'velocity += Physics.gravity * Time.deltaTime;\ntransform.position += velocity * Time.deltaTime;',
    Unreal:'Velocity.Z += GetWorld()->GetGravityZ() * DeltaSeconds;\nAddActorWorldOffset(Velocity * DeltaSeconds);'
  },
  8:{
    Godot:'var radians = deg_to_rad(90.0)\nvar degrees = rad_to_deg(radians)',
    Unity:'float radians = 90f * Mathf.Deg2Rad;\nfloat value = Mathf.Sin(radians);',
    Unreal:'float Radians = FMath::DegreesToRadians(90.f);\nfloat Value = FMath::Sin(Radians); // FRotator uses degrees'
  },
  9:{
    Godot:'var world_direction = global_transform.basis * local_direction\nvar local_point = to_local(world_point)',
    Unity:'Vector3 worldDirection = transform.TransformDirection(localDirection);\nVector3 localPoint = transform.InverseTransformPoint(worldPoint);',
    Unreal:'FTransform T = GetActorTransform();\nFVector WorldDirection = T.TransformVectorNoScale(LocalDirection);\nFVector LocalPoint = T.InverseTransformPosition(WorldPoint);'
  },
  13:{
    Godot:'var t = Transform3D(Basis.IDENTITY, Vector3(2, 0, 0))\nvar world_point = t * local_point',
    Unity:'Matrix4x4 m = Matrix4x4.Translate(new Vector3(2, 0, 0));\nVector3 worldPoint = m.MultiplyPoint3x4(localPoint);',
    Unreal:'FTransform T(FRotator::ZeroRotator, FVector(200, 0, 0));\nFVector WorldPoint = T.TransformPosition(LocalPoint);'
  },
  15:{
    Godot:'var world_point = to_global(local_point)\nvar local_again = to_local(world_point)',
    Unity:'Vector3 worldPoint = transform.TransformPoint(localPoint);\nVector3 localAgain = transform.InverseTransformPoint(worldPoint);',
    Unreal:'FTransform T = GetActorTransform();\nFVector WorldPoint = T.TransformPosition(LocalPoint);\nFVector LocalAgain = T.InverseTransformPosition(WorldPoint);'
  },
  16:{
    Godot:'// Godot shader\nALBEDO = mix(color_a, color_b, mask);',
    Unity:'// Unity HLSL\nfloat3 result = lerp(colorA, colorB, mask);',
    Unreal:'// Unreal Material graph\nColor A + Color B → Lerp\nMask → Lerp Alpha\nLerp → Base Color'
  },
  17:{
    Godot:'vec2 sample_uv = UV * tiles + offset;\nALBEDO = texture(albedo_texture, sample_uv).rgb;',
    Unity:'float2 sampleUV = input.uv * tiles + offset;\nfloat3 color = SAMPLE_TEXTURE2D(tex, sampler_tex, sampleUV).rgb;',
    Unreal:'TextureCoordinate → Multiply(Tiles) → Add(Offset)\n→ Texture Sample UVs'
  },
  18:{
    Godot:'float d = length(UV - vec2(0.5));\nfloat mask = 1.0 - smoothstep(inner, outer, d);',
    Unity:'float d = length(input.uv - float2(0.5, 0.5));\nfloat mask = 1.0 - smoothstep(inner, outer, d);',
    Unreal:'TextureCoordinate → Subtract(0.5) → Length\n→ SmoothStep → OneMinus'
  },
  19:{
    Godot:'VERTEX.y += sin(TIME * TAU * frequency + VERTEX.x) * amplitude;',
    Unity:'positionOS.y += sin(_Time.y * 6.283185 * frequency\n                    + positionOS.x) * amplitude;',
    Unreal:'Time → Multiply(Frequency) → Sine (default period 1)\n→ Multiply(Amplitude) → World Position Offset'
  }
};

const foundationEngineExamples={
  '2d':{
    0:{
      Godot:'# Node2D: +Y points down on the 2D canvas\nposition = Vector2(120, 80)',
      Unity:'// A 2D game commonly keeps Z at zero\ntransform.position = new Vector3(3f, 2f, 0f);',
      Unreal:'// Paper2D projects choose a plane; this uses X/Z\nSetActorLocation(FVector(300, 0, 200));'
    },
    1:{
      Godot:'var offset: Vector2 = target.position - position\nvar distance = offset.length()',
      Unity:'Vector2 offset = targetPosition - currentPosition;\nfloat distance = offset.magnitude;',
      Unreal:'FVector2D Offset = Target2D - Current2D;\nfloat Distance = Offset.Size();'
    },
    2:{
      Godot:'var direction: Vector2 = offset.normalized()',
      Unity:'Vector2 direction = offset.normalized;',
      Unreal:'FVector2D Direction = Offset.GetSafeNormal();'
    }
  },
  '3d':{0:engineExamples[0],1:engineExamples[1],2:engineExamples[2]}
};

const rotationEngineExamples={
  '2d':{
    Godot:'rotation = deg_to_rad(90.0)\n# Node2D rotation is radians',
    Unity:'transform.rotation = Quaternion.Euler(0f, 0f, 90f);\n// Rotate in the XY plane around Z',
    Unreal:'// Paper2D example using a Z-axis world rotation\nSetActorRotation(FRotator(0.f, 0.f, 90.f));'
  },
  '3d':{
    Godot:'rotate_y(deg_to_rad(90.0))\nvar forward = -global_transform.basis.z',
    Unity:'transform.rotation = Quaternion.Euler(0f, 90f, 0f);\nVector3 forward = transform.forward;',
    Unreal:'SetActorRotation(FRotator(0.f, 90.f, 0.f));\nFVector Forward = GetActorForwardVector();'
  }
};
const basisEngineExamples={
  '2d':{
    Godot:'var world_direction = global_transform.basis_xform(local_direction)\nvar local_point = to_local(world_point)',
    Unity:'Vector2 worldDirection = transform.TransformDirection(localDirection);\nVector2 localPoint = transform.InverseTransformPoint(worldPoint);',
    Unreal:'// FVector2D is useful for planar math\n// Actor world transforms still use FVector/FTransform'
  },
  '3d':engineExamples[9]
};
engineExamples[pidIndex]={
  Godot:'var error := target - value\nintegral = clamp(integral + error * delta, -limit, limit)\nvar output := kp*error + ki*integral + kd*(error-last_error)/delta',
  Unity:'float error = target - value;\nintegral = Mathf.Clamp(integral + error * Time.deltaTime, -limit, limit);\nfloat output = kp*error + ki*integral + kd*(error-lastError)/Time.deltaTime;',
  Unreal:'float Error = Target - Value;\nIntegral = FMath::Clamp(Integral + Error*DeltaSeconds, -Limit, Limit);\nfloat Output = Kp*Error + Ki*Integral + Kd*(Error-LastError)/DeltaSeconds;'
};

function makeEngineExamples(examples,headingText='Engine examples'){
  const section=document.createElement('section');section.className='engine-examples';
  const heading=document.createElement('h3');heading.textContent=headingText;section.append(heading);
  const grid=document.createElement('div');grid.className='engine-grid';
  for(const [engine,code] of Object.entries(examples)){
    const article=document.createElement('article');article.className='engine-card';
    const h=document.createElement('h4');h.textContent=engine;
    const pre=document.createElement('pre');const codeEl=document.createElement('code');codeEl.textContent=code;pre.append(codeEl);article.append(h,pre);grid.append(article);
  }
  section.append(grid);return section;
}

function makeAxisComparison(){
  const wrap=document.createElement('section');wrap.className='axis-comparison';
  const h=document.createElement('h3');h.textContent='Blender, Unity, Godot, and Unreal';
  const p=document.createElement('p');p.textContent='These are the common 3D world conventions. “Forward” can still vary by asset, camera, or API, so use engine helpers when possible.';
  const scroller=document.createElement('div');scroller.className='table-scroll';
  const table=document.createElement('table');table.className='math-table';
  table.innerHTML='<thead><tr><th>Tool</th><th>Handedness</th><th>Right</th><th>Up</th><th>Common forward</th></tr></thead><tbody><tr><th>Blender</th><td>Right-handed</td><td>+X</td><td>+Z</td><td>−Y for common export/model orientation</td></tr><tr><th>Unity</th><td>Left-handed</td><td>+X</td><td>+Y</td><td>+Z</td></tr><tr><th>Godot</th><td>Right-handed</td><td>+X</td><td>+Y</td><td>−Z for Camera3D/gameplay</td></tr><tr><th>Unreal</th><td>Left-handed</td><td>+Y</td><td>+Z</td><td>+X</td></tr></tbody>';
  scroller.append(table);wrap.append(h,p,scroller);
  const note=document.createElement('p');note.className='axis-note';note.textContent='Blender and Unreal are Z-up. Unity and Godot are Y-up. Exporters usually convert axes for you; problems appear when code, metadata, or custom import logic assumes the source axes survived unchanged.';wrap.append(note);
  const links=document.createElement('p');links.className='reference-links';links.innerHTML='<a href="https://docs.blender.org/manual/en/latest/files/import_export/usd.html" target="_blank" rel="noopener">Blender axis export</a> · <a href="https://docs.unity3d.com/6000.0/Documentation/Manual/QuaternionAndEulerRotationsInUnity.html" target="_blank" rel="noopener">Unity coordinates</a> · <a href="https://docs.godotengine.org/en/stable/classes/class_basis.html" target="_blank" rel="noopener">Godot Basis</a> · <a href="https://dev.epicgames.com/documentation/en-us/unreal-engine/coordinate-system-and-spaces-in-unreal-engine" target="_blank" rel="noopener">Unreal coordinates</a>';
  wrap.append(links);return wrap;
}

function rebuildGuideNavigation(){
  ui.nav.replaceChildren();
  const select=document.createElement('select');select.className='entry-select';select.setAttribute('aria-label','Choose a guide entry');
  for(const section of guideSections){
    const group=document.createElement('section');group.className='nav-section';
    const heading=document.createElement('h3');heading.textContent=section.name;group.append(heading);
    const optionGroup=document.createElement('optgroup');optionGroup.label=section.name;
    for(const entryIndex of section.entries){
      const button=document.createElement('button');button.className='nav-button';button.dataset.entry=entryIndex;button.innerHTML='<span>'+lessons[entryIndex].title+'</span>';button.onclick=()=>goToEntry(entryIndex);group.append(button);
      const option=document.createElement('option');option.value=entryIndex;option.textContent=lessons[entryIndex].title;optionGroup.append(option);
    }
    ui.nav.append(group);select.append(optionGroup);
  }
  select.onchange=()=>goToEntry(Number(select.value));
  document.querySelector('.course-nav').append(select);
}

function goToEntry(entryIndex){
  index=entryIndex;renderLesson();
  if(matchMedia('(max-width: 800px)').matches)document.querySelector('.lesson').scrollIntoView({block:'start'});
}

document.querySelector('.hero h1').textContent='Game Math Guide';
document.querySelector('.hero p').textContent='A visual reference for the math behind movement, transforms, matrices, materials, and shaders—with engine-specific examples where they help.';
document.querySelector('.progress-label').innerHTML='<strong>Browse sections</strong>';
document.querySelector('.progress-track')?.remove();
updateProgress=function(){};

const sectionedRender=renderLesson;
renderLesson=function(){
  sectionedRender();
  if(index<3){
    const content=foundationContent[index][foundationDimension];
    ui.lead.textContent=content.lead;ui.idea.textContent=content.idea;ui.formula.textContent=content.formula;ui.code.textContent=content.code;
    ui.readout.innerHTML=content.stats.map(s=>`<div class="stat"><small>${s}</small><strong>—</strong></div>`).join('');
    state.fx=index===0?2:3;state.fy=index===0?1.5:2;state.fz=index===0?-2:1.5;
    const modeGroup=document.createElement('div');modeGroup.className='dimension-switch';modeGroup.setAttribute('aria-label','Diagram dimension');
    ['2d','3d'].forEach(mode=>{const b=document.createElement('button');b.className='btn';b.textContent=mode.toUpperCase();b.setAttribute('aria-pressed',foundationDimension===mode);b.onclick=()=>{foundationDimension=mode;renderLesson()};modeGroup.append(b)});
    ui.controls.prepend(modeGroup);
    if(foundationDimension==='3d'){
      [...ui.controls.children].forEach(child=>{if(child!==modeGroup)child.remove()});
      slider('X',-3,3,state.fx,.1,v=>state.fx=v);slider('Y',-3,3,state.fy,.1,v=>state.fy=v);slider('Z',-3,3,state.fz,.1,v=>state.fz=v);
    }
  }
  if(index===8||index===9){
    if(index===8){
      const content=rotationContent[rotationDimension];
      ui.lead.textContent=content.lead;ui.idea.textContent=content.idea;ui.formula.textContent=content.formula;ui.code.textContent=content.code;
      ui.readout.innerHTML=content.stats.map(s=>`<div class="stat"><small>${s}</small><strong>—</strong></div>`).join('');
    }else if(rotationDimension==='2d'){
      ui.lead.textContent='A 2D local space has two axes that rotate with the object. Rotate them and compare them with the fixed world grid.';
      ui.idea.textContent='In 2D, local right and local up can be built from one angle. Converting a local offset to world space means multiplying each local component by its rotated axis, then adding them.';
      ui.formula.textContent='world offset = local X×right + local Y×up';
    }else{
      ui.lead.textContent='A 3D local space has right, up, and forward axes that rotate with the object. The diagram shows a yaw around Y.';
      ui.idea.textContent='In 3D, a basis is three local axes expressed in world coordinates. Godot exposes this as Basis; Unity and Unreal commonly expose transform-direction helpers.';
      ui.formula.textContent='world direction = basis × local direction';
      ui.readout.innerHTML=['Yaw','Local right','Local forward'].map(s=>`<div class="stat"><small>${s}</small><strong>—</strong></div>`).join('');
    }
    const modeGroup=document.createElement('div');modeGroup.className='dimension-switch';modeGroup.setAttribute('aria-label','Rotation dimension');
    ['2d','3d'].forEach(mode=>{const b=document.createElement('button');b.className='btn';b.textContent=mode.toUpperCase();b.setAttribute('aria-pressed',rotationDimension===mode);b.onclick=()=>{rotationDimension=mode;renderLesson()};modeGroup.append(b)});
    ui.controls.prepend(modeGroup);
  }
  if(index===pidIndex){
    state.pidKp=3;state.pidKi=.25;state.pidKd=1.4;state.pidTarget=2;state.pidValue=-2;state.pidVelocity=0;state.pidIntegral=0;state.pidLastError=4;state.pidOutput=0;state.pidTrail=[];
    slider('P gain',0,8,3,.1,v=>state.pidKp=v);slider('I gain',0,2,.25,.05,v=>state.pidKi=v);slider('D gain',0,4,1.4,.1,v=>state.pidKd=v);slider('Target',-3,3,2,.1,v=>state.pidTarget=v);
    const play=button('Play',()=>{running=!running;play.textContent=running?'Pause':'Play'},true);
    button('Reset',()=>{state.pidValue=-2;state.pidVelocity=0;state.pidIntegral=0;state.pidLastError=state.pidTarget-state.pidValue;state.pidTrail=[]});
  }
  const orderPosition=entryOrder.indexOf(index);
  ui.num.textContent=sectionFor.get(index)+' · Entry '+(orderPosition+1)+' of '+entryOrder.length;
  ui.prev.textContent='← Previous entry';
  ui.prev.disabled=orderPosition===0;
  ui.complete.textContent=orderPosition===entryOrder.length-1?'End of guide':'Next entry →';
  ui.complete.disabled=orderPosition===entryOrder.length-1;
  ui.prev.onclick=()=>{if(orderPosition>0)goToEntry(entryOrder[orderPosition-1])};
  ui.complete.onclick=()=>{if(orderPosition<entryOrder.length-1)goToEntry(entryOrder[orderPosition+1])};
  ui.nav.querySelectorAll('[data-entry]').forEach(button=>button.classList.toggle('active',Number(button.dataset.entry)===index));
  const select=document.querySelector('.entry-select');if(select)select.value=String(index);

  if(index<8){
    details.replaceChildren();
    const notes=fundamentals[index];
    if(notes){const section=document.createElement('section');const h=document.createElement('h3');h.textContent='Basics to remember';const ul=document.createElement('ul');notes.forEach(note=>{const li=document.createElement('li');li.textContent=note;ul.append(li)});section.append(h,ul);details.append(section)}
  }else{
    const oldHeading=details.querySelector('h3');if(oldHeading&&oldHeading.textContent==='Work through it')oldHeading.textContent='Breakdown';
    if(fundamentals[index]){const section=document.createElement('section');const h=document.createElement('h3');h.textContent='Basics to remember';const ul=document.createElement('ul');fundamentals[index].forEach(note=>{const li=document.createElement('li');li.textContent=note;ul.append(li)});section.append(h,ul);details.prepend(section)}
  }
  if(dimensionNotes[index])details.append(makeDimensionComparison(dimensionNotes[index]));
  if(index===0)details.prepend(makeAxisComparison());
  const examples=index<3?foundationEngineExamples[foundationDimension][index]:index===8?rotationEngineExamples[rotationDimension]:index===9?basisEngineExamples[rotationDimension]:engineExamples[index];
  if(examples)details.append(makeEngineExamples(examples,index<3?foundationDimension.toUpperCase()+' engine examples':'Engine examples'));
};

const sectionedDraw=drawLesson;
function project3D(x,y,z){return [450+x*72-z*46,260-y*72+z*28]}
function draw3DAxes(){
  const c=C(),o=project3D(0,0,0),x=project3D(4.4,0,0),y=project3D(0,3.2,0),z=project3D(0,0,3.8);
  ctx.fillStyle=c.panel;ctx.fillRect(0,0,900,450);
  for(let i=-3;i<=3;i++){const a=project3D(-4,0,i),b=project3D(4,0,i),d=project3D(i,0,-3),e=project3D(i,0,3);line(...a,...b,c.border,1);line(...d,...e,c.border,1)}
  arrow(...o,...x,c.accent,'+X');arrow(...o,...y,c.good,'+Y');arrow(...o,...z,c.accent2,'+Z');text('Projected 3D view',24,30,c.muted);
  return o;
}
function drawFoundation3D(){
  const c=C(),o=draw3DAxes(),x=state.fx,y=state.fy,z=state.fz,p=project3D(x,y,z),ground=project3D(x,0,z),len=Math.hypot(x,y,z),horizontal=Math.hypot(x,z);
  line(...ground,...p,c.muted,2,[6,5]);line(...o,...ground,c.border,2,[6,5]);
  if(index===0){dot(...p,c.accent,11);text(`(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`,p[0]+15,p[1]-14,c.text);setStats([`(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`,horizontal.toFixed(3),len.toFixed(3)])}
  if(index===1){arrow(...o,...p,c.accent,'vector');setStats([`(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`,len.toFixed(3),horizontal.toFixed(3)])}
  if(index===2){
    arrow(...o,...p,c.accent,'raw');
    const unit=len?[x/len,y/len,z/len]:[0,0,0],u=project3D(unit[0],unit[1],unit[2]);arrow(...o,...u,c.accent2,'unit');
    setStats([`(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`,len.toFixed(3),len?'1.000':'0.000']);
  }
}
function drawRotationOrBasis3D(){
  const c=C(),o=draw3DAxes(),a=state.angle*Math.PI/180,rx=Math.cos(a),rz=-Math.sin(a),fx=-Math.sin(a),fz=-Math.cos(a),right=project3D(rx*2.4,0,rz*2.4),forward=project3D(fx*2.4,0,fz*2.4),up=project3D(0,2.4,0);
  arrow(...o,...right,c.accent,'local right');
  arrow(...o,...forward,c.accent2,'local forward');
  if(index===9)arrow(...o,...up,c.good,'local up');
  const calc=document.getElementById('live-calculation');
  if(calc)calc.textContent=`Yaw ${state.angle}° = ${(a).toFixed(3)} radians\nRight = (${rx.toFixed(2)}, 0, ${rz.toFixed(2)})\nForward = (${fx.toFixed(2)}, 0, ${fz.toFixed(2)})`;
  setStats(index===8?[`${state.angle}°`,a.toFixed(3),`(${fx.toFixed(2)}, 0, ${fz.toFixed(2)})`]:[`${state.angle}°`,`(${rx.toFixed(2)}, 0, ${rz.toFixed(2)})`,`(${fx.toFixed(2)}, 0, ${fz.toFixed(2)})`]);
}
function drawPID(dt){
  const c=C();grid();
  const error=state.pidTarget-state.pidValue;
  if(dt>0){
    state.pidIntegral=Math.max(-8,Math.min(8,state.pidIntegral+error*dt));
    const derivative=(error-state.pidLastError)/dt;
    state.pidOutput=state.pidKp*error+state.pidKi*state.pidIntegral+state.pidKd*derivative;
    state.pidVelocity+=state.pidOutput*dt;state.pidVelocity*=Math.exp(-.35*dt);state.pidValue+=state.pidVelocity*dt;state.pidLastError=error;
    state.pidTrail.push(state.pidValue);if(state.pidTrail.length>220)state.pidTrail.shift();
  }
  const toX=v=>450+v*105,targetX=toX(state.pidTarget),valueX=toX(state.pidValue);
  line(70,290,830,290,c.border,5);line(targetX,220,targetX,350,c.good,3);text('target',targetX,205,c.good,'center');dot(valueX,290,c.accent,13);
  const forceEnd=Math.max(45,Math.min(855,valueX+state.pidOutput*14));arrow(valueX,330,forceEnd,330,c.accent2,'output');
  if(state.pidTrail.length>1){ctx.beginPath();state.pidTrail.forEach((v,i)=>{const px=80+i*(740/219),py=105-Math.max(-3.5,Math.min(3.5,v))*20;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.strokeStyle=c.accent;ctx.lineWidth=2;ctx.stroke();text('value history',80,35,c.muted)}
  const calc=document.getElementById('live-calculation');
  if(calc)calc.textContent=`P = ${state.pidKp.toFixed(2)} × ${error.toFixed(2)}\nI = ${state.pidKi.toFixed(2)} × ${state.pidIntegral.toFixed(2)}\nOutput = ${state.pidOutput.toFixed(2)}`;
  setStats([state.pidValue.toFixed(2),error.toFixed(2),state.pidOutput.toFixed(2)]);
}
drawLesson=function(dt){
  if(index<3&&foundationDimension==='3d'){drawFoundation3D();return}
  if((index===8||index===9)&&rotationDimension==='3d'){drawRotationOrBasis3D();return}
  if(index===pidIndex){drawPID(dt);return}
  sectionedDraw(dt);
  if(index<3)text('2D plane · +X right · +Y up',24,30,C().muted);
};

const guideStyle=document.createElement('style');
guideStyle.textContent=`
  .course-nav{position:sticky;top:16px;max-height:calc(100vh - 32px);overflow:auto}
  .progress-label{padding:8px 10px 12px;color:var(--text)}
  .nav-section{margin:0 0 14px}.nav-section h3{margin:0 10px 5px;color:var(--muted);font-size:12px;letter-spacing:.08em;text-transform:uppercase}
  .nav-section .nav-button{display:block;padding:8px 10px;font-size:14px}.nav-section .nav-button.active{background:var(--accent);color:white}
  .entry-select{display:none;width:100%;padding:10px;border:1px solid var(--border);border-radius:9px;background:var(--panel);color:var(--text)}
  .lesson-details>section{border-top:1px solid var(--border);padding-top:18px;margin-top:22px}.lesson-details h3{margin:0 0 8px}.lesson-details ul{margin:8px 0;padding-left:22px}.lesson-details li{margin:8px 0}
  .axis-comparison{border-top:0!important;margin-top:0!important;padding-top:0!important}.axis-comparison p{margin:6px 0 12px}.axis-note{color:var(--muted)}
  .table-scroll{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}.table-scroll .math-table{display:table;min-width:620px;width:100%}
  .reference-links{font-size:14px}.reference-links a{color:var(--accent)}
  .engine-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.engine-card{min-width:0}.engine-card h4{margin:0 0 6px}.engine-card pre{height:100%;margin:0;font-size:13px}
  .dimension-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.dimension-grid article{background:var(--panel2);padding:12px;border-radius:10px}.dimension-grid h4,.dimension-grid p{margin:0}.dimension-grid p{color:var(--muted)}
  .dimension-switch{display:flex;gap:6px;padding-right:4px;border-right:1px solid var(--border)}
  .controls label{display:grid;grid-template-columns:10.5rem 10rem;gap:8px}.controls label>span{display:block;width:10.5rem;font-variant-numeric:tabular-nums}.controls input[type=range]{width:10rem;min-width:0}
  @media(max-width:800px){
    .course-nav{position:static;max-height:none;overflow:visible}.progress-label{display:none}.nav-list{display:none}.entry-select{display:block}.engine-grid{grid-template-columns:1fr}.engine-card pre{height:auto}
  }
  @media(max-width:520px){.dimension-grid{grid-template-columns:1fr}.dimension-switch{width:100%;border-right:0}.dimension-switch .btn{width:auto;flex:1}.controls label{grid-template-columns:1fr;width:100%}.controls label>span{width:100%}.controls input[type=range]{width:100%}}
`;
document.head.append(guideStyle);
rebuildGuideNavigation();

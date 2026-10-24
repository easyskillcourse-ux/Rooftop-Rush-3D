import * as THREE from 'three';
import { CharacterSkin } from '../types';

export class CharacterModel {
  public group: THREE.Group;
  public bodyRoot: THREE.Group; // Rotated so the character faces forward in the direction of travel (-Z)

  // Body parts
  public torso: THREE.Group;
  public headGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public backpack: THREE.Mesh;
  public shieldBubble: THREE.Mesh;
  public magnetRing: THREE.Mesh;

  // Articulated Joints
  public leftElbow!: THREE.Group;
  public rightElbow!: THREE.Group;
  public leftKnee!: THREE.Group;
  public rightKnee!: THREE.Group;
  public leftShoe!: THREE.Group;
  public rightShoe!: THREE.Group;
  public capGroup!: THREE.Group;

  // Materials for skin customization
  private jacketMat: THREE.MeshStandardMaterial;
  private accentMat: THREE.MeshStandardMaterial;
  private pantsMat: THREE.MeshStandardMaterial;
  private shoesMat: THREE.MeshStandardMaterial;
  private backpackMat: THREE.MeshStandardMaterial;
  private skinMat: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial;
  private eyeMat: THREE.MeshBasicMaterial;
  private pupilMat: THREE.MeshBasicMaterial;
  private visorMat: THREE.MeshPhysicalMaterial;

  constructor(skin: CharacterSkin) {
    this.group = new THREE.Group();
    this.group.name = 'PlayerCharacter';

    // The bodyRoot is rotated 180 degrees (Math.PI) so the model's front (face, chest, shoes)
    // points directly FORWARD along the path (-Z direction of travel), not backward toward the camera!
    this.bodyRoot = new THREE.Group();
    this.bodyRoot.name = 'BodyRoot';
    this.bodyRoot.rotation.y = Math.PI;
    this.group.add(this.bodyRoot);

    // Base materials with PBR roughness/metalness variation
    this.jacketMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skin.colors.jacket),
      roughness: 0.45,
      metalness: 0.1,
    });

    this.accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skin.colors.jacketAccent),
      roughness: 0.3,
      metalness: 0.2,
    });

    this.pantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skin.colors.pants),
      roughness: 0.7,
      metalness: 0.05,
    });

    this.shoesMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skin.colors.shoes),
      roughness: 0.25,
      metalness: 0.3,
    });

    this.backpackMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skin.colors.backpack),
      roughness: 0.5,
      metalness: 0.15,
    });

    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xffdbac, // warm stylized peach skin
      roughness: 0.6,
      metalness: 0.0,
    });

    this.hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skin.colors.hair),
      roughness: 0.8,
      metalness: 0.05,
    });

    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    this.visorMat = new THREE.MeshPhysicalMaterial({
      color: skin.colors.visor ? new THREE.Color(skin.colors.visor) : 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.7,
      transparent: true,
      opacity: skin.colors.visor ? 0.9 : 0.0,
      visible: !!skin.colors.visor,
    });

    // 1. TORSO & JACKET
    this.torso = new THREE.Group();
    this.torso.position.y = 1.05; // Pivot around hip/waist

    // Main torso jacket (tapered athletic form)
    const jacketGeom = new THREE.CylinderGeometry(0.32, 0.25, 0.65, 12);
    const jacketMesh = new THREE.Mesh(jacketGeom, this.jacketMat);
    jacketMesh.castShadow = true;
    jacketMesh.receiveShadow = true;
    this.torso.add(jacketMesh);

    // Jacket Zipper & Collar Accent (Front of body)
    const zipperGeom = new THREE.BoxGeometry(0.06, 0.64, 0.04);
    const zipperMesh = new THREE.Mesh(zipperGeom, this.accentMat);
    zipperMesh.position.set(0, 0, 0.15);
    this.torso.add(zipperMesh);

    // Collar
    const collarGeom = new THREE.TorusGeometry(0.24, 0.07, 8, 16);
    collarGeom.rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeom, this.accentMat);
    collarMesh.position.set(0, 0.32, 0);
    this.torso.add(collarMesh);

    // BACKPACK (Back of body, faces camera in world space)
    const backpackGeom = new THREE.BoxGeometry(0.36, 0.42, 0.22);
    this.backpack = new THREE.Mesh(backpackGeom, this.backpackMat);
    this.backpack.position.set(0, 0.05, -0.22);
    this.backpack.castShadow = true;
    this.torso.add(this.backpack);

    // Backpack outer pouch
    const pouchGeom = new THREE.BoxGeometry(0.26, 0.22, 0.08);
    const pouchMesh = new THREE.Mesh(pouchGeom, this.accentMat);
    pouchMesh.position.set(0, -0.05, -0.34);
    this.torso.add(pouchMesh);

    // 2. HEAD & FACE
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.58, 0);

    // Face / Head mesh
    const headGeom = new THREE.SphereGeometry(0.26, 16, 14);
    headGeom.scale(1, 1.15, 1);
    const headMesh = new THREE.Mesh(headGeom, this.skinMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Swept-back cartoon parkour hair tufts
    const hairGeom = new THREE.ConeGeometry(0.28, 0.32, 8);
    hairGeom.rotateX(-0.5);
    const hairMesh = new THREE.Mesh(hairGeom, this.hairMat);
    hairMesh.position.set(0, 0.22, -0.05);
    hairMesh.castShadow = true;
    this.headGroup.add(hairMesh);

    // Bangs tuft under cap
    const tuftGeom = new THREE.BoxGeometry(0.26, 0.12, 0.16);
    tuftGeom.rotateX(0.2);
    const tuftMesh = new THREE.Mesh(tuftGeom, this.hairMat);
    tuftMesh.position.set(0, 0.22, 0.14);
    this.headGroup.add(tuftMesh);

    // Backwards Parkour Snapback Cap (Preserves iconic blue shirt, hat, and sneakers look)
    this.capGroup = new THREE.Group();
    this.capGroup.position.set(0, 0.16, 0);

    const capDomeGeom = new THREE.SphereGeometry(0.275, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const capDomeMesh = new THREE.Mesh(capDomeGeom, this.jacketMat);
    capDomeMesh.castShadow = true;
    this.capGroup.add(capDomeMesh);

    // Backwards curved brim
    const brimGeom = new THREE.CylinderGeometry(0.29, 0.29, 0.03, 12, 1, false, Math.PI * 0.7, Math.PI * 0.6);
    brimGeom.rotateX(0.25);
    const brimMesh = new THREE.Mesh(brimGeom, this.accentMat);
    brimMesh.position.set(0, 0.02, -0.06);
    brimMesh.castShadow = true;
    this.capGroup.add(brimMesh);

    this.headGroup.add(this.capGroup);

    // Cartoon eyes (Facing forward)
    const eyeGeom = new THREE.SphereGeometry(0.065, 8, 8);
    eyeGeom.scale(1, 1.3, 0.5);

    const leftEye = new THREE.Mesh(eyeGeom, this.eyeMat);
    leftEye.position.set(-0.09, 0.04, 0.23);
    const rightEye = new THREE.Mesh(eyeGeom, this.eyeMat);
    rightEye.position.set(0.09, 0.04, 0.23);
    this.headGroup.add(leftEye, rightEye);

    // Pupils
    const pupilGeom = new THREE.SphereGeometry(0.035, 6, 6);
    pupilGeom.scale(1, 1, 0.3);
    const leftPupil = new THREE.Mesh(pupilGeom, this.pupilMat);
    leftPupil.position.set(-0.09, 0.04, 0.26);
    const rightPupil = new THREE.Mesh(pupilGeom, this.pupilMat);
    rightPupil.position.set(0.09, 0.04, 0.26);
    this.headGroup.add(leftPupil, rightPupil);

    // Cyber Visor (if active)
    const visorGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12, 1, false, 0, Math.PI);
    visorGeom.rotateY(Math.PI / 2);
    const visorMesh = new THREE.Mesh(visorGeom, this.visorMat);
    visorMesh.position.set(0, 0.04, 0.06);
    this.headGroup.add(visorMesh);

    this.torso.add(this.headGroup);

    // 3. ARTICULATED ARMS (Shoulder -> Upper Arm -> Elbow -> Forearm & Glove)
    this.leftArm = this.createArm(-1);
    this.leftArm.position.set(-0.38, 0.25, 0);
    this.torso.add(this.leftArm);

    this.rightArm = this.createArm(1);
    this.rightArm.position.set(0.38, 0.25, 0);
    this.torso.add(this.rightArm);

    this.bodyRoot.add(this.torso);

    // 4. ARTICULATED LEGS (Hip -> Thigh -> Knee -> Shin & Running Sneaker)
    this.leftLeg = this.createLeg(-1);
    this.leftLeg.position.set(-0.18, 0.76, 0);
    this.bodyRoot.add(this.leftLeg);

    this.rightLeg = this.createLeg(1);
    this.rightLeg.position.set(0.18, 0.76, 0);
    this.bodyRoot.add(this.rightLeg);

    // 5. SHIELD POWER-UP BUBBLE
    const shieldGeom = new THREE.SphereGeometry(1.2, 16, 12);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      depthWrite: false,
    });
    this.shieldBubble = new THREE.Mesh(shieldGeom, shieldMat);
    this.shieldBubble.position.set(0, 1.0, 0);
    this.shieldBubble.visible = false;
    this.group.add(this.shieldBubble);

    // 6. MAGNET RING
    const magnetGeom = new THREE.TorusGeometry(0.8, 0.06, 6, 16);
    magnetGeom.rotateX(Math.PI / 2);
    const magnetMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.7,
    });
    this.magnetRing = new THREE.Mesh(magnetGeom, magnetMat);
    this.magnetRing.position.set(0, 0.9, 0);
    this.magnetRing.visible = false;
    this.group.add(this.magnetRing);
  }

  private createArm(side: -1 | 1): THREE.Group {
    const shoulderGroup = new THREE.Group();

    // Upper sleeve (jacket) hanging from shoulder
    const sleeveGeom = new THREE.CylinderGeometry(0.1, 0.085, 0.28, 8);
    sleeveGeom.translate(0, -0.14, 0);
    const sleeveMesh = new THREE.Mesh(sleeveGeom, this.jacketMat);
    sleeveMesh.castShadow = true;
    shoulderGroup.add(sleeveMesh);

    // Elbow joint (bends forward for athletic sprinter posture)
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, -0.28, 0);
    elbowGroup.rotation.x = 1.05; // bent forward ~60 degrees

    // Forearm
    const forearmGeom = new THREE.CylinderGeometry(0.08, 0.068, 0.26, 8);
    forearmGeom.translate(0, -0.13, 0);
    const forearmMesh = new THREE.Mesh(forearmGeom, this.skinMat);
    forearmMesh.castShadow = true;
    elbowGroup.add(forearmMesh);

    // Glove / Hand in athletic sprint fist
    const gloveGeom = new THREE.BoxGeometry(0.12, 0.13, 0.12);
    gloveGeom.translate(0, -0.27, 0);
    const gloveMesh = new THREE.Mesh(gloveGeom, this.accentMat);
    gloveMesh.castShadow = true;
    elbowGroup.add(gloveMesh);

    shoulderGroup.add(elbowGroup);

    if (side === -1) {
      this.leftElbow = elbowGroup;
    } else {
      this.rightElbow = elbowGroup;
    }

    return shoulderGroup;
  }

  private createLeg(side: -1 | 1): THREE.Group {
    const hipGroup = new THREE.Group();

    // Upper pants thigh
    const thighGeom = new THREE.CylinderGeometry(0.13, 0.105, 0.32, 8);
    thighGeom.translate(0, -0.16, 0);
    const thighMesh = new THREE.Mesh(thighGeom, this.pantsMat);
    thighMesh.castShadow = true;
    hipGroup.add(thighMesh);

    // Knee Joint (pivots backward during run cycle)
    const kneeGroup = new THREE.Group();
    kneeGroup.position.set(0, -0.32, 0);

    // Shin (lower pants)
    const shinGeom = new THREE.CylinderGeometry(0.105, 0.088, 0.30, 8);
    shinGeom.translate(0, -0.15, 0);
    const shinMesh = new THREE.Mesh(shinGeom, this.pantsMat);
    shinMesh.castShadow = true;
    kneeGroup.add(shinMesh);

    // Running Sneaker
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.30, 0.06);

    // White rubber sole
    const soleGeom = new THREE.BoxGeometry(0.18, 0.08, 0.38);
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const soleMesh = new THREE.Mesh(soleGeom, soleMat);
    soleMesh.position.set(0, -0.04, 0);
    soleMesh.castShadow = true;
    shoeGroup.add(soleMesh);

    // Upper sneaker shoe
    const shoeGeom = new THREE.BoxGeometry(0.16, 0.11, 0.34);
    const shoeMesh = new THREE.Mesh(shoeGeom, this.shoesMat);
    shoeMesh.position.set(0, 0.04, 0);
    shoeMesh.castShadow = true;
    shoeGroup.add(shoeMesh);

    // Neon accent stripe
    const stripeGeom = new THREE.BoxGeometry(0.17, 0.035, 0.16);
    const stripeMesh = new THREE.Mesh(stripeGeom, this.accentMat);
    stripeMesh.position.set(0, 0.045, 0);
    shoeGroup.add(stripeMesh);

    kneeGroup.add(shoeGroup);
    hipGroup.add(kneeGroup);

    if (side === -1) {
      this.leftKnee = kneeGroup;
      this.leftShoe = shoeGroup;
    } else {
      this.rightKnee = kneeGroup;
      this.rightShoe = shoeGroup;
    }

    return hipGroup;
  }

  public applySkin(skin: CharacterSkin) {
    this.jacketMat.color.set(skin.colors.jacket);
    this.accentMat.color.set(skin.colors.jacketAccent);
    this.pantsMat.color.set(skin.colors.pants);
    this.shoesMat.color.set(skin.colors.shoes);
    this.backpackMat.color.set(skin.colors.backpack);
    this.hairMat.color.set(skin.colors.hair);

    if (skin.colors.visor) {
      this.visorMat.color.set(skin.colors.visor);
      this.visorMat.visible = true;
      this.visorMat.opacity = 0.9;
    } else {
      this.visorMat.visible = false;
    }
  }

  // ==========================================
  // PROCEDURAL ANIMATIONS (SMOOTH & NATURAL)
  // ==========================================

  // Idle on title screen / menu
  public animateIdle(time: number) {
    const breath = Math.sin(time * 3) * 0.025;
    this.torso.position.y = 1.05 + breath;
    this.torso.rotation.x = Math.sin(time * 1.5) * 0.015;
    this.torso.rotation.y = 0;
    this.torso.rotation.z = 0;
    this.headGroup.rotation.x = -Math.sin(time * 1.5) * 0.025;

    this.leftArm.rotation.x = Math.sin(time * 2) * 0.04;
    this.rightArm.rotation.x = -Math.sin(time * 2) * 0.04;
    this.leftArm.rotation.z = 0.12;
    this.rightArm.rotation.z = -0.12;
    if (this.leftElbow) this.leftElbow.rotation.x = 0.8;
    if (this.rightElbow) this.rightElbow.rotation.x = 0.8;

    this.leftLeg.rotation.x = 0;
    this.rightLeg.rotation.x = 0;
    if (this.leftKnee) this.leftKnee.rotation.x = 0.05;
    if (this.rightKnee) this.rightKnee.rotation.x = 0.05;
    if (this.leftShoe) this.leftShoe.rotation.x = 0;
    if (this.rightShoe) this.rightShoe.rotation.x = 0;
  }

  // Running cycle: Smooth, organic, natural forward sprint
  // Perfectly synchronized with 20-30 units/s forward velocity
  public animateRun(time: number, speedRate: number) {
    // Cadence scales smoothly and continuously with forward running speed
    const cadence = 11.2 * Math.min(1.45, Math.max(0.75, speedRate));
    const cycle = time * cadence;
    const stride = Math.sin(cycle);
    const cosStride = Math.cos(cycle);
    const bounce = Math.abs(Math.sin(cycle)) * 0.07;

    // Torso forward athletic sprint lean and subtle pelvic twist
    this.torso.position.y = 1.05 + bounce;
    this.torso.rotation.x = 0.20; // athletic forward sprint lean
    this.torso.rotation.y = cosStride * 0.06; // natural pelvis & spine counter-rotation
    this.torso.rotation.z = -stride * 0.03; // subtle natural weight roll

    // Head stabilizes forward looking at oncoming track
    this.headGroup.rotation.x = -0.10 + bounce * 0.2;
    this.headGroup.rotation.y = -cosStride * 0.03;

    // Alternating natural arm swing with bent elbows pumping forward
    this.leftArm.rotation.x = -stride * 0.72;
    this.rightArm.rotation.x = stride * 0.72;
    this.leftArm.rotation.z = 0.14 + Math.abs(stride) * 0.06;
    this.rightArm.rotation.z = -0.14 - Math.abs(stride) * 0.06;

    if (this.leftElbow && this.rightElbow) {
      // Forearms pump up forward when arm drives forward
      this.leftElbow.rotation.x = 1.05 + Math.max(0, -stride) * 0.40;
      this.rightElbow.rotation.x = 1.05 + Math.max(0, stride) * 0.40;
    }

    // Natural articulated leg stride:
    // Left leg swing forward (stride > 0): hip lifts forward, knee bends up to clear ground
    // Left leg push off (stride < 0): hip extends back, knee straightens
    this.leftLeg.rotation.x = stride * 0.68;
    this.rightLeg.rotation.x = -stride * 0.68;

    if (this.leftKnee && this.rightKnee) {
      this.leftKnee.rotation.x = Math.max(0.04, stride * 0.85);
      this.rightKnee.rotation.x = Math.max(0.04, -stride * 0.85);
    }

    if (this.leftShoe && this.rightShoe) {
      this.leftShoe.rotation.x = -stride * 0.22;
      this.rightShoe.rotation.x = stride * 0.22;
    }
  }

  // Jump animation: knees tuck up dynamically, arms open for aerodynamic balance
  public animateJump(velocityY: number) {
    this.torso.position.y = 1.08;
    this.torso.rotation.x = 0.24;
    this.torso.rotation.y = 0;
    this.torso.rotation.z = 0;

    // Arms open outward for balance
    this.leftArm.rotation.x = -0.35;
    this.rightArm.rotation.x = -0.35;
    this.leftArm.rotation.z = 0.55;
    this.rightArm.rotation.z = -0.55;
    if (this.leftElbow) this.leftElbow.rotation.x = 0.7;
    if (this.rightElbow) this.rightElbow.rotation.x = 0.7;

    // Both knees tuck up dynamically during ascent
    this.leftLeg.rotation.x = 0.42;
    this.rightLeg.rotation.x = 0.28;
    if (this.leftKnee) this.leftKnee.rotation.x = 0.85;
    if (this.rightKnee) this.rightKnee.rotation.x = 0.70;
  }

  // Falling animation: legs extend downward to prepare for contact, arms raise slightly
  public animateFall(velocityY: number) {
    this.torso.position.y = 1.05;
    this.torso.rotation.x = 0.12;
    this.torso.rotation.y = 0;

    this.leftArm.rotation.x = 0.25;
    this.rightArm.rotation.x = 0.25;
    this.leftArm.rotation.z = 0.45;
    this.rightArm.rotation.z = -0.45;
    if (this.leftElbow) this.leftElbow.rotation.x = 0.9;
    if (this.rightElbow) this.rightElbow.rotation.x = 0.9;

    this.leftLeg.rotation.x = -0.15;
    this.rightLeg.rotation.x = -0.15;
    if (this.leftKnee) this.leftKnee.rotation.x = 0.12;
    if (this.rightKnee) this.rightKnee.rotation.x = 0.12;
    if (this.leftShoe) this.leftShoe.rotation.x = 0;
    if (this.rightShoe) this.rightShoe.rotation.x = 0;
  }

  // Landing compression animation: smooth knee flex and rebound
  public animateLanding(progress: number) {
    // progress: 0.0 (impact) -> 1.0 (recovered)
    const compression = Math.sin(progress * Math.PI) * 0.18;
    this.torso.position.y = 1.05 - compression;
    this.torso.rotation.x = 0.22 + compression * 0.25;

    this.leftArm.rotation.x = -compression * 0.6;
    this.rightArm.rotation.x = -compression * 0.6;
    this.leftArm.rotation.z = 0.25;
    this.rightArm.rotation.z = -0.25;

    this.leftLeg.rotation.x = compression * 0.3;
    this.rightLeg.rotation.x = compression * 0.3;
    if (this.leftKnee) this.leftKnee.rotation.x = compression * 0.7;
    if (this.rightKnee) this.rightKnee.rotation.x = compression * 0.7;
  }

  // Sliding animation: low slide with body tilted back, feet sliding forward under obstacles
  public animateSlide(progress: number) {
    this.torso.position.y = 0.50;
    this.torso.rotation.x = -0.85; // lean back low
    this.torso.rotation.y = 0.16;
    this.torso.rotation.z = 0;

    this.headGroup.rotation.x = 0.65;

    this.leftArm.rotation.x = 0.9;
    this.leftArm.rotation.z = 0.35;
    this.rightArm.rotation.x = 0.7;
    this.rightArm.rotation.z = -0.4;
    if (this.leftElbow) this.leftElbow.rotation.x = 0.5;
    if (this.rightElbow) this.rightElbow.rotation.x = 0.5;

    // Leading leg extended forward, trailing leg tucked low
    this.leftLeg.rotation.x = 1.10;
    this.rightLeg.rotation.x = -0.35;
    if (this.leftKnee) this.leftKnee.rotation.x = 0.10;
    if (this.rightKnee) this.rightKnee.rotation.x = 1.15;
  }

  // Flailing fall when plummeting into a gap
  public animatePlummet(time: number) {
    this.torso.position.y = 1.05;
    this.torso.rotation.x = 0.4 + Math.sin(time * 8) * 0.3;
    this.torso.rotation.z = Math.sin(time * 9) * 0.35;

    this.leftArm.rotation.x = Math.sin(time * 14) * 1.3;
    this.rightArm.rotation.x = Math.cos(time * 14) * 1.3;
    this.leftArm.rotation.z = 0.8;
    this.rightArm.rotation.z = -0.8;

    this.leftLeg.rotation.x = Math.cos(time * 12) * 1.0;
    this.rightLeg.rotation.x = Math.sin(time * 12) * 1.0;
    if (this.leftKnee) this.leftKnee.rotation.x = 0.6;
    if (this.rightKnee) this.rightKnee.rotation.x = 0.6;
  }

  public updatePowerupVisuals(shieldActive: boolean, magnetActive: boolean, time: number) {
    this.shieldBubble.visible = shieldActive;
    if (shieldActive) {
      this.shieldBubble.rotation.y = time * 2;
      this.shieldBubble.rotation.x = time * 1.2;
      const s = 1.0 + Math.sin(time * 8) * 0.05;
      this.shieldBubble.scale.set(s, s, s);
    }

    this.magnetRing.visible = magnetActive;
    if (magnetActive) {
      this.magnetRing.position.y = 0.8 + Math.sin(time * 6) * 0.2;
      this.magnetRing.rotation.z = time * 4;
      const ms = 1.0 + Math.sin(time * 10) * 0.1;
      this.magnetRing.scale.set(ms, ms, ms);
    }
  }
}

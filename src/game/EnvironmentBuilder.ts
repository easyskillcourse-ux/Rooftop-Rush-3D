import * as THREE from 'three';
import { EnvironmentTheme, GraphicsQuality } from '../types';
import { LANE_WIDTH } from './constants';

export class EnvironmentBuilder {
  // Shared Stylized Cartoon Materials (Reused across all chunks)
  private pathPlankMat: THREE.MeshStandardMaterial;
  private wetPlankMat: THREE.MeshStandardMaterial;
  private ropeMat: THREE.MeshStandardMaterial;
  private woodPostMat: THREE.MeshStandardMaterial;
  private lanternGlassMat: THREE.MeshBasicMaterial;
  private lanternFrameMat: THREE.MeshStandardMaterial;

  private trunkMat: THREE.MeshStandardMaterial;
  private foliageDeepGreenMat: THREE.MeshStandardMaterial;
  private foliageVibrantGreenMat: THREE.MeshStandardMaterial;
  private foliageLimeMat: THREE.MeshStandardMaterial;
  private grassTuftMat: THREE.MeshStandardMaterial;
  private flowerRedMat: THREE.MeshStandardMaterial;
  private flowerYellowMat: THREE.MeshStandardMaterial;
  private flowerBlueMat: THREE.MeshStandardMaterial;
  private flowerWhiteMat: THREE.MeshStandardMaterial;

  private mossyRockMat: THREE.MeshStandardMaterial;
  private cliffMat: THREE.MeshStandardMaterial;
  private groundDirtMat: THREE.MeshStandardMaterial;
  private groundGrassMat: THREE.MeshStandardMaterial;

  private riverWaterMat: THREE.MeshStandardMaterial;
  private waterfallMat: THREE.MeshStandardMaterial;
  private waterFoamMat: THREE.MeshBasicMaterial;

  private cloudMat: THREE.MeshStandardMaterial;
  private distantMountainMat: THREE.MeshStandardMaterial;
  private buildingWallMat: THREE.MeshStandardMaterial;

  // ========================================================
  // REUSABLE SHARED GEOMETRY CACHE (Zero-Allocation on Spawn)
  // ========================================================
  private plankGeom: THREE.BoxGeometry;
  private nailGeom: THREE.CylinderGeometry;
  private postGeom: THREE.CylinderGeometry;
  private postCapGeom: THREE.ConeGeometry;
  private lanternFrameGeom: THREE.CylinderGeometry;
  private lanternBulbGeom: THREE.SphereGeometry;
  private curbGeom: THREE.BoxGeometry;
  private sleeperGeom: THREE.BoxGeometry;
  private grassBladeGeom: THREE.ConeGeometry;
  private flowerStemGeom: THREE.CylinderGeometry;
  private flowerPetalGeom: THREE.SphereGeometry;
  private flowerCenterGeom: THREE.SphereGeometry;
  private treeTrunkGeom: THREE.CylinderGeometry;
  private treeRootGeom: THREE.BoxGeometry;
  private foliagePuffGeom1: THREE.DodecahedronGeometry;
  private foliagePuffGeom2: THREE.DodecahedronGeometry;
  private foliagePuffGeom3: THREE.DodecahedronGeometry;
  private fernFrondGeom: THREE.ConeGeometry;
  private rockBaseGeom: THREE.DodecahedronGeometry;
  private rockMossGeom: THREE.DodecahedronGeometry;
  private mountainGeom: THREE.ConeGeometry;
  private cloudPuffGeom: THREE.SphereGeometry;
  private bankGeom: THREE.BoxGeometry;
  private skyscraperGeom: THREE.BoxGeometry;

  // Animated elements registry (updated in tick)
  public animatedRivers: THREE.Mesh[] = [];
  public animatedWaterfalls: THREE.Mesh[] = [];
  public animatedSwayObjects: THREE.Group[] = [];

  constructor() {
    // 1. CARTOON WOOD & BRIDGES MATERIALS
    this.pathPlankMat = new THREE.MeshStandardMaterial({
      color: 0xc27838,
      roughness: 0.65,
      metalness: 0.05,
    });

    this.wetPlankMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e28,
      roughness: 0.18,
      metalness: 0.15,
    });

    this.ropeMat = new THREE.MeshStandardMaterial({
      color: 0xdf9b4a,
      roughness: 0.85,
    });

    this.woodPostMat = new THREE.MeshStandardMaterial({
      color: 0x6d3d19,
      roughness: 0.7,
    });

    this.lanternGlassMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    this.lanternFrameMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4, metalness: 0.8 });

    // 2. FOLIAGE & FLOWER MATERIALS
    this.trunkMat = new THREE.MeshStandardMaterial({ color: 0x543216, roughness: 0.8 });
    this.foliageDeepGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
    this.foliageVibrantGreenMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
    this.foliageLimeMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.55 });
    this.grassTuftMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 });

    this.flowerRedMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });
    this.flowerYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    this.flowerBlueMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
    this.flowerWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

    // 3. ROCKS, CLIFFS & GROUND MATERIALS
    this.mossyRockMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.85 });
    this.cliffMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    this.groundDirtMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.95 });
    this.groundGrassMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.75 });

    // 4. WATER MATERIALS
    this.riverWaterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.25,
      transparent: true,
      opacity: 0.85,
    });

    this.waterfallMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.8,
    });

    this.waterFoamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });

    // 5. CLOUDS, MOUNTAINS & SKY
    this.cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, transparent: true, opacity: 0.9 });
    this.distantMountainMat = new THREE.MeshStandardMaterial({ color: 0x22543d, roughness: 0.9 });
    this.buildingWallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    // ========================================================
    // PRE-ALLOCATE REUSABLE GEOMETRIES
    // ========================================================
    const pathWidth = LANE_WIDTH * 3 + 1.2;
    this.plankGeom = new THREE.BoxGeometry(pathWidth, 0.28, 0.9);
    this.nailGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 4);

    this.postGeom = new THREE.CylinderGeometry(0.14, 0.18, 1.8, 6);
    this.postGeom.translate(0, 0.9, 0);

    this.postCapGeom = new THREE.ConeGeometry(0.22, 0.2, 4);
    this.postCapGeom.translate(0, 1.9, 0);

    this.lanternFrameGeom = new THREE.CylinderGeometry(0.1, 0.14, 0.26, 4);
    this.lanternBulbGeom = new THREE.SphereGeometry(0.08, 6, 4);

    this.curbGeom = new THREE.BoxGeometry(0.35, 0.28, 60.0);
    this.sleeperGeom = new THREE.BoxGeometry(pathWidth * 0.9, 0.12, 0.6);

    this.grassBladeGeom = new THREE.ConeGeometry(0.08, 0.45, 3);
    this.grassBladeGeom.translate(0, 0.22, 0);

    this.flowerStemGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 3);
    this.flowerStemGeom.translate(0, 0.175, 0);
    this.flowerCenterGeom = new THREE.SphereGeometry(0.06, 5, 4);
    this.flowerPetalGeom = new THREE.SphereGeometry(0.05, 4, 3);
    this.flowerPetalGeom.scale(1, 0.4, 1.3);

    this.treeTrunkGeom = new THREE.CylinderGeometry(0.3, 0.52, 3.2, 6);
    this.treeTrunkGeom.translate(0, 1.6, 0);

    this.treeRootGeom = new THREE.BoxGeometry(0.24, 0.35, 0.7);
    this.treeRootGeom.translate(0, 0.17, 0.35);

    this.foliagePuffGeom1 = new THREE.DodecahedronGeometry(1.8, 0);
    this.foliagePuffGeom2 = new THREE.DodecahedronGeometry(1.4, 0);
    this.foliagePuffGeom3 = new THREE.DodecahedronGeometry(1.2, 0);

    this.fernFrondGeom = new THREE.ConeGeometry(0.35, 1.7, 3);
    this.fernFrondGeom.scale(1, 0.15, 1);
    this.fernFrondGeom.translate(0, 0.85, 0);
    this.fernFrondGeom.rotateX(0.7);

    this.rockBaseGeom = new THREE.DodecahedronGeometry(1.4, 0);
    this.rockBaseGeom.scale(1, 0.75, 1.2);
    this.rockMossGeom = new THREE.DodecahedronGeometry(1.3, 0);
    this.rockMossGeom.scale(0.95, 0.35, 1.15);
    this.rockMossGeom.translate(0, 0.65, 0);

    this.mountainGeom = new THREE.ConeGeometry(22, 34, 5);
    this.mountainGeom.translate(0, 17, 0);

    this.cloudPuffGeom = new THREE.SphereGeometry(2.4, 6, 5);
    this.bankGeom = new THREE.BoxGeometry(6, 6, 60.0);
    this.skyscraperGeom = new THREE.BoxGeometry(16, 40, 16);
  }

  // ==========================================
  // 1. PLAYABLE PATH & SUSPENSION BRIDGES WITH GAP SUPPORT
  // ==========================================
  public createPathMesh(
    theme: EnvironmentTheme,
    length: number,
    gaps: { localStart: number; localEnd: number }[] = []
  ): THREE.Group {
    const group = new THREE.Group();
    const pathWidth = LANE_WIDTH * 3 + 1.2;

    const isWet = theme === 'MONSOON_RAIN';
    const isBridge = theme === 'RIVER_CROSSING' || theme === 'MOUNTAIN_BRIDGE' || theme === 'MONSOON_RAIN';
    const plankMat = isWet ? this.wetPlankMat : this.pathPlankMat;

    const isInsideGap = (z: number) => {
      return gaps.some((g) => z <= g.localStart && z >= g.localEnd);
    };

    if (isBridge) {
      // SUSPENSION BRIDGE USING SHARED PLANK GEOMETRY
      const plankCount = Math.floor(length / 1.2);
      for (let i = 0; i < plankCount; i++) {
        const z = -length / 2 + (i + 0.5) * 1.2;
        // Skip planks in gap zones
        if (isInsideGap(z)) continue;

        const plank = new THREE.Mesh(this.plankGeom, plankMat);
        plank.position.set(0, -0.14, z);
        plank.receiveShadow = true;
        group.add(plank);

        // Nails (reused geometry)
        const nailL = new THREE.Mesh(this.nailGeom, this.lanternFrameMat);
        nailL.position.set(-pathWidth / 2 + 0.3, 0.02, z);
        const nailR = new THREE.Mesh(this.nailGeom, this.lanternFrameMat);
        nailR.position.set(pathWidth / 2 - 0.3, 0.02, z);
        group.add(nailL, nailR);
      }

      // Suspension ropes along sides (using straight lightweight cylinders)
      const ropeGeom = new THREE.CylinderGeometry(0.06, 0.06, length, 5);
      ropeGeom.rotateX(Math.PI / 2);
      const ropeL = new THREE.Mesh(ropeGeom, this.ropeMat);
      ropeL.position.set(-pathWidth / 2 - 0.05, 0.95, 0);
      const ropeR = new THREE.Mesh(ropeGeom, this.ropeMat);
      ropeR.position.set(pathWidth / 2 + 0.05, 0.95, 0);
      group.add(ropeL, ropeR);

      // Wooden bridge posts spaced every 12 units
      for (let z = -length / 2 + 5; z < length / 2; z += 12) {
        if (!isInsideGap(z)) {
          group.add(this.createBridgePost(-pathWidth / 2 - 0.05, z));
          group.add(this.createBridgePost(pathWidth / 2 + 0.05, z));
        }
      }

      // River gorge underneath
      if (theme === 'RIVER_CROSSING' || theme === 'MONSOON_RAIN') {
        group.add(this.createRiverGorge(length, pathWidth));
      }
    } else {
      // LUSH FOREST DIRT & STONE PATHWAY
      // If gaps exist, split the base ground around gaps
      if (gaps.length === 0) {
        const baseGeom = new THREE.BoxGeometry(pathWidth + 2.5, 0.8, length);
        const base = new THREE.Mesh(baseGeom, this.groundGrassMat);
        base.position.set(0, -0.4, 0);
        base.receiveShadow = true;
        group.add(base);

        const dirtGeom = new THREE.BoxGeometry(pathWidth, 0.08, length);
        const dirt = new THREE.Mesh(dirtGeom, this.groundDirtMat);
        dirt.position.set(0, 0.01, 0);
        dirt.receiveShadow = true;
        group.add(dirt);
      } else {
        // Build segmented ground around gap
        const zMin = -length / 2;
        const zMax = length / 2;
        const gap = gaps[0];
        // Section 1: from zMax down to gap.localStart
        const len1 = Math.max(0.1, zMax - gap.localStart);
        const center1 = zMax - len1 / 2;
        const base1 = new THREE.Mesh(new THREE.BoxGeometry(pathWidth + 2.5, 0.8, len1), this.groundGrassMat);
        base1.position.set(0, -0.4, center1);
        group.add(base1);

        // Section 2: from gap.localEnd down to zMin
        const len2 = Math.max(0.1, gap.localEnd - zMin);
        const center2 = zMin + len2 / 2;
        const base2 = new THREE.Mesh(new THREE.BoxGeometry(pathWidth + 2.5, 0.8, len2), this.groundGrassMat);
        base2.position.set(0, -0.4, center2);
        group.add(base2);
      }

      // Embedded wooden sleepers (omitting in gap)
      for (let z = -length / 2 + 3; z < length / 2; z += 4.5) {
        if (!isInsideGap(z)) {
          const sleeper = new THREE.Mesh(this.sleeperGeom, this.pathPlankMat);
          sleeper.position.set(0, 0.04, z);
          sleeper.receiveShadow = true;
          group.add(sleeper);
        }
      }

      // Side Curbs
      const curbL = new THREE.Mesh(this.curbGeom, this.mossyRockMat);
      curbL.position.set(-pathWidth / 2 - 0.15, 0.1, 0);
      const curbR = new THREE.Mesh(this.curbGeom, this.mossyRockMat);
      curbR.position.set(pathWidth / 2 + 0.15, 0.1, 0);
      group.add(curbL, curbR);

      this.populateTrailFringes(group, length, pathWidth);
    }

    return group;
  }

  // Bridge Post with carved timber cap and warm glowing lantern
  private createBridgePost(x: number, z: number): THREE.Group {
    const postGroup = new THREE.Group();
    postGroup.position.set(x, 0, z);

    const post = new THREE.Mesh(this.postGeom, this.woodPostMat);
    post.castShadow = true;
    const cap = new THREE.Mesh(this.postCapGeom, this.woodPostMat);
    postGroup.add(post, cap);

    // Hanging lantern
    const lantern = new THREE.Group();
    lantern.position.set(x > 0 ? 0.3 : -0.3, 1.45, 0);
    const frame = new THREE.Mesh(this.lanternFrameGeom, this.lanternFrameMat);
    const bulb = new THREE.Mesh(this.lanternBulbGeom, this.lanternGlassMat);
    lantern.add(frame, bulb);
    postGroup.add(lantern);

    return postGroup;
  }

  // Populate grass tufts & flowers along edges using shared geometries
  private populateTrailFringes(group: THREE.Group, length: number, pathWidth: number) {
    const edgeOffset = pathWidth / 2 + 0.6;
    for (let z = -length / 2 + 3; z < length / 2; z += 3.8) {
      // Left grass
      const leftGrass = this.createGrassClump();
      leftGrass.position.set(-edgeOffset - 0.4, 0.05, z);
      group.add(leftGrass);

      // Right grass
      const rightGrass = this.createGrassClump();
      rightGrass.position.set(edgeOffset + 0.4, 0.05, z);
      group.add(rightGrass);

      // Wildflower
      if (Math.random() < 0.5) {
        const flower = this.createCartoonFlower();
        const side = Math.random() > 0.5 ? 1 : -1;
        flower.position.set(side * (edgeOffset + 0.6), 0.05, z + 1);
        group.add(flower);
      }
    }
  }

  private createGrassClump(): THREE.Group {
    const clump = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(this.grassBladeGeom, this.grassTuftMat);
      blade.rotation.y = (i * Math.PI * 2) / 3;
      blade.rotation.z = (i === 0 ? 0.2 : i === 1 ? -0.2 : 0);
      clump.add(blade);
    }
    return clump;
  }

  private createCartoonFlower(): THREE.Group {
    const flower = new THREE.Group();
    const stem = new THREE.Mesh(this.flowerStemGeom, this.foliageVibrantGreenMat);
    flower.add(stem);

    const petalChoice = Math.random();
    const petalMat =
      petalChoice < 0.35
        ? this.flowerRedMat
        : petalChoice < 0.7
        ? this.flowerYellowMat
        : this.flowerBlueMat;

    const center = new THREE.Mesh(this.flowerCenterGeom, this.flowerYellowMat);
    center.position.y = 0.35;
    flower.add(center);

    for (let p = 0; p < 4; p++) {
      const ang = (p * Math.PI) / 2;
      const petal = new THREE.Mesh(this.flowerPetalGeom, petalMat);
      petal.position.set(Math.cos(ang) * 0.08, 0.35, Math.sin(ang) * 0.08);
      flower.add(petal);
    }

    return flower;
  }

  // River gorge underneath bridge
  private createRiverGorge(length: number, pathWidth: number): THREE.Group {
    const gorge = new THREE.Group();

    // Reusable water plane
    const waterGeom = new THREE.PlaneGeometry(pathWidth * 4.2, length, 2, 4);
    waterGeom.rotateX(-Math.PI / 2);
    const riverMesh = new THREE.Mesh(waterGeom, this.riverWaterMat);
    riverMesh.position.set(0, -5.2, 0);
    gorge.add(riverMesh);
    this.animatedRivers.push(riverMesh);

    // River banks
    const leftBank = new THREE.Mesh(this.bankGeom, this.cliffMat);
    leftBank.position.set(-pathWidth * 2.2 - 2, -3.5, 0);
    const rightBank = new THREE.Mesh(this.bankGeom, this.cliffMat);
    rightBank.position.set(pathWidth * 2.2 + 2, -3.5, 0);
    gorge.add(leftBank, rightBank);

    // Foam spray strips
    const foamGeom = new THREE.PlaneGeometry(0.8, length);
    foamGeom.rotateX(-Math.PI / 2);
    const foamL = new THREE.Mesh(foamGeom, this.waterFoamMat);
    foamL.position.set(-pathWidth * 1.5, -5.15, 0);
    const foamR = new THREE.Mesh(foamGeom, this.waterFoamMat);
    foamR.position.set(pathWidth * 1.5, -5.15, 0);
    gorge.add(foamL, foamR);

    return gorge;
  }

  // ==========================================
  // 2. SCENERY POPULATION (REUSING GEOMETRIES)
  // ==========================================
  public populateScenery(
    theme: EnvironmentTheme,
    length: number,
    quality: GraphicsQuality = 'HIGH'
  ): THREE.Group {
    const scenery = new THREE.Group();

    if (theme === 'LUSH_FOREST' || theme === 'RIVER_CROSSING' || theme === 'MONSOON_RAIN') {
      const isMonsoon = theme === 'MONSOON_RAIN';
      // Balanced tree spacing to prevent clutter and save CPU/GPU draw calls
      const treeSpacing = quality === 'LOW' ? 16 : quality === 'MEDIUM' ? 12 : 9;

      for (let z = -length / 2 + 4; z < length / 2; z += treeSpacing) {
        // Left cartoon tree
        const treeLeft = this.createStylizedCartoonTree(isMonsoon ? 'MONSOON' : 'LUSH');
        treeLeft.position.set(-8.5, 0, z);
        scenery.add(treeLeft);
        this.animatedSwayObjects.push(treeLeft);

        // Right cartoon tree
        const treeRight = this.createStylizedCartoonTree(isMonsoon ? 'MONSOON' : 'LUSH');
        treeRight.position.set(8.5, 0, z + 3);
        scenery.add(treeRight);
        this.animatedSwayObjects.push(treeRight);

        // Mossy Boulder (shared geometry)
        if (Math.random() < 0.5) {
          const boulder = new THREE.Group();
          const rBase = new THREE.Mesh(this.rockBaseGeom, this.mossyRockMat);
          const rMoss = new THREE.Mesh(this.rockMossGeom, this.foliageDeepGreenMat);
          boulder.add(rBase, rMoss);
          const side = Math.random() > 0.5 ? 1 : -1;
          boulder.position.set(side * 5.2, 0.3, z + 1);
          scenery.add(boulder);
        }

        // Cartoon Fern
        if (quality !== 'LOW' && Math.random() < 0.5) {
          const fern = new THREE.Group();
          for (let f = 0; f < 5; f++) {
            const frond = new THREE.Mesh(this.fernFrondGeom, this.foliageLimeMat);
            frond.rotation.y = (f * Math.PI * 2) / 5;
            fern.add(frond);
          }
          fern.position.set((Math.random() > 0.5 ? 1 : -1) * 5.5, 0.1, z + 2);
          scenery.add(fern);
        }
      }

      // Distant rolling mountains (only 2 per chunk, low poly 5 segments)
      const mtnL = new THREE.Mesh(this.mountainGeom, this.distantMountainMat);
      mtnL.position.set(-42, -5, 0);
      const mtnR = new THREE.Mesh(this.mountainGeom, this.distantMountainMat);
      mtnR.position.set(42, -5, 8);
      scenery.add(mtnL, mtnR);
    } else if (theme === 'MOUNTAIN_BRIDGE') {
      // Canyon pillars and drifting clouds
      const pillarL = new THREE.Mesh(this.mountainGeom, this.cliffMat);
      pillarL.position.set(-25, -12, 0);
      const pillarR = new THREE.Mesh(this.mountainGeom, this.cliffMat);
      pillarR.position.set(25, -12, 10);
      scenery.add(pillarL, pillarR);

      // Puffy Cloud (shared geometry)
      const cloud = new THREE.Group();
      for (let c = 0; c < 4; c++) {
        const puff = new THREE.Mesh(this.cloudPuffGeom, this.cloudMat);
        puff.position.set((c - 1.5) * 2.5, 0, 0);
        cloud.add(puff);
      }
      cloud.position.set(0, -7, 0);
      scenery.add(cloud);
    } else {
      // SUNSET CITY ROOFTOPS
      const towerL = new THREE.Mesh(this.skyscraperGeom, this.buildingWallMat);
      towerL.position.set(-22, -10, 0);
      const towerR = new THREE.Mesh(this.skyscraperGeom, this.buildingWallMat);
      towerR.position.set(22, -10, 8);
      scenery.add(towerL, towerR);
    }

    return scenery;
  }

  // Stylized Cartoon Tree with Shared Geometries
  private createStylizedCartoonTree(variant: 'LUSH' | 'MONSOON'): THREE.Group {
    const tree = new THREE.Group();

    // Trunk (shared geometry)
    const trunk = new THREE.Mesh(this.treeTrunkGeom, this.trunkMat);
    trunk.castShadow = true;
    tree.add(trunk);

    // Roots
    for (let r = 0; r < 3; r++) {
      const root = new THREE.Mesh(this.treeRootGeom, this.trunkMat);
      root.rotation.y = (r * Math.PI * 2) / 3;
      tree.add(root);
    }

    // Canopy puffs using pre-cached dodecahedron geometries
    const canopy = new THREE.Group();
    canopy.position.y = 3.2;

    const materials =
      variant === 'MONSOON'
        ? [this.foliageDeepGreenMat, this.foliageVibrantGreenMat]
        : [this.foliageVibrantGreenMat, this.foliageLimeMat, this.foliageDeepGreenMat];

    const centerMesh = new THREE.Mesh(this.foliagePuffGeom1, materials[0]);
    centerMesh.castShadow = true;
    canopy.add(centerMesh);

    const puff1 = new THREE.Mesh(this.foliagePuffGeom2, materials[1]);
    puff1.position.set(-1.0, 0.4, 0.5);
    const puff2 = new THREE.Mesh(this.foliagePuffGeom2, materials[2 % materials.length]);
    puff2.position.set(1.0, 0.3, -0.4);
    const puff3 = new THREE.Mesh(this.foliagePuffGeom3, materials[0]);
    puff3.position.set(0.1, 1.2, 0.2);

    canopy.add(puff1, puff2, puff3);
    tree.add(canopy);

    return tree;
  }

  // ==========================================
  // 3. ANIMATION UPDATE (OPTIMIZED LOOP)
  // ==========================================
  public updateAnimations(time: number, dt: number) {
    // 1. Gentle tree wind sway (skip expensive trig for inactive ones)
    const swayCount = Math.min(this.animatedSwayObjects.length, 18);
    for (let i = 0; i < swayCount; i++) {
      const tree = this.animatedSwayObjects[i];
      tree.rotation.z = Math.sin(time * 2.0 + i) * 0.035;
    }

    // 2. River water subtle bob
    for (let i = 0; i < this.animatedRivers.length; i++) {
      this.animatedRivers[i].position.y = -5.2 + Math.sin(time * 2.5 + i) * 0.04;
    }
  }

  // Cleanup references on chunk recycling
  public cleanupMesh(group: THREE.Group) {
    this.animatedSwayObjects = this.animatedSwayObjects.filter((obj) => obj.parent !== null);
    this.animatedRivers = this.animatedRivers.filter((r) => r.parent !== null);
    this.animatedWaterfalls = this.animatedWaterfalls.filter((wf) => wf.parent !== null);
  }
}

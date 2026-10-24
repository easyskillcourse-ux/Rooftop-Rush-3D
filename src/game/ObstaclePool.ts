import * as THREE from 'three';
import { EnvironmentTheme, ObstacleData, CollectibleData } from '../types';
import { LANE_WIDTH } from './constants';

export class ObstaclePool {
  // Stylized Cartoon Materials (Reused)
  private woodBarkMat: THREE.MeshStandardMaterial;
  private woodPlankMat: THREE.MeshStandardMaterial;
  private hazardBarMat: THREE.MeshStandardMaterial;
  private lanternGlowMat: THREE.MeshBasicMaterial;
  private stoneArchMat: THREE.MeshStandardMaterial;
  private bannerMat: THREE.MeshStandardMaterial;
  private goldStarMat: THREE.MeshBasicMaterial;

  private coinGoldMat: THREE.MeshStandardMaterial;
  private gemEmeraldMat: THREE.MeshStandardMaterial;
  private shieldBlueMat: THREE.MeshStandardMaterial;
  private magnetPinkMat: THREE.MeshStandardMaterial;
  private multPurpleMat: THREE.MeshStandardMaterial;

  // Checkered Finish Gate Materials
  private checkeredTex: THREE.CanvasTexture;
  private checkeredBannerMat: THREE.MeshStandardMaterial;
  private finishLineGroundMat: THREE.MeshStandardMaterial;
  private finishTrussMat: THREE.MeshStandardMaterial;
  private finishGoldGlowMat: THREE.MeshBasicMaterial;

  // Pre-allocated Shared Geometries
  private hurdleBarGeom: THREE.CylinderGeometry;
  private hurdlePlateGeom: THREE.BoxGeometry;
  private hurdleLegGeom: THREE.CylinderGeometry;

  private finishTrussPostGeom: THREE.BoxGeometry;
  private finishTrussBeamGeom: THREE.BoxGeometry;
  private finishBannerGeom: THREE.BoxGeometry;
  private finishGroundStripGeom: THREE.BoxGeometry;
  private finishFlagPoleGeom: THREE.CylinderGeometry;
  private finishFlagGeom: THREE.BoxGeometry;

  private gantryBeamGeom: THREE.BoxGeometry;
  private gantryPostGeom: THREE.CylinderGeometry;
  private gantryLanternGeom: THREE.SphereGeometry;

  private crateGeom: THREE.BoxGeometry;
  private crateBraceGeom: THREE.BoxGeometry;
  private boulderGeom: THREE.DodecahedronGeometry;

  private pendulumRopeGeom: THREE.CylinderGeometry;
  private pendulumLogGeom: THREE.CylinderGeometry;
  private pendulumBandGeom: THREE.TorusGeometry;

  private archPostGeom: THREE.CylinderGeometry;
  private archBeamGeom: THREE.BoxGeometry;
  private archBannerGeom: THREE.BoxGeometry;
  private archStarGeom: THREE.DodecahedronGeometry;

  private coinGeom: THREE.CylinderGeometry;
  private coinStarGeom: THREE.BoxGeometry;
  private gemGeom: THREE.OctahedronGeometry;
  private powerupOrbGeom: THREE.SphereGeometry;
  private powerupRingGeom: THREE.TorusGeometry;
  private magnetGeom: THREE.TorusGeometry;
  private magnetTipGeom: THREE.BoxGeometry;
  private multiplierBadgeGeom: THREE.DodecahedronGeometry;

  constructor() {
    this.woodBarkMat = new THREE.MeshStandardMaterial({ color: 0x543216, roughness: 0.8 });
    this.woodPlankMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 });
    this.hazardBarMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    this.lanternGlowMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    this.stoneArchMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
    this.bannerMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
    this.goldStarMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    this.coinGoldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.9 });
    this.gemEmeraldMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.1, metalness: 0.2 });
    this.shieldBlueMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.6 });
    this.magnetPinkMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2, metalness: 0.6 });
    this.multPurpleMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.2, metalness: 0.6 });

    // Checkered Finish Gate Procedural Canvas Texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const tileSize = 32;
      for (let y = 0; y < 64; y += tileSize) {
        for (let x = 0; x < 256; x += tileSize) {
          ctx.fillStyle = (x / tileSize + y / tileSize) % 2 === 0 ? '#ffffff' : '#0f172a';
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }
    this.checkeredTex = new THREE.CanvasTexture(canvas);
    this.checkeredTex.magFilter = THREE.NearestFilter;
    this.checkeredTex.wrapS = THREE.RepeatWrapping;
    this.checkeredTex.wrapT = THREE.RepeatWrapping;

    this.checkeredBannerMat = new THREE.MeshStandardMaterial({
      map: this.checkeredTex,
      roughness: 0.3,
      metalness: 0.1,
    });
    this.finishLineGroundMat = new THREE.MeshStandardMaterial({
      map: this.checkeredTex,
      roughness: 0.4,
    });
    this.finishTrussMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.25,
      metalness: 0.8,
    });
    this.finishGoldGlowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    // Checkered Finish Gate Geometries
    this.finishTrussPostGeom = new THREE.BoxGeometry(0.5, 4.4, 0.5);
    this.finishTrussBeamGeom = new THREE.BoxGeometry(LANE_WIDTH * 3.6, 0.5, 0.5);
    this.finishBannerGeom = new THREE.BoxGeometry(LANE_WIDTH * 3.2, 0.9, 0.12);
    this.finishGroundStripGeom = new THREE.BoxGeometry(LANE_WIDTH * 3.4, 0.04, 2.0);
    this.finishFlagPoleGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
    this.finishFlagGeom = new THREE.BoxGeometry(0.8, 0.5, 0.02);

    // Pre-cache Geometries
    this.hurdleBarGeom = new THREE.CylinderGeometry(0.12, 0.12, LANE_WIDTH * 0.96, 6);
    this.hurdleBarGeom.rotateZ(Math.PI / 2);
    this.hurdlePlateGeom = new THREE.BoxGeometry(0.5, 0.22, 0.16);
    this.hurdleLegGeom = new THREE.CylinderGeometry(0.09, 0.12, 0.75, 4);

    this.gantryBeamGeom = new THREE.BoxGeometry(LANE_WIDTH * 1.05, 0.5, 0.35);
    this.gantryPostGeom = new THREE.CylinderGeometry(0.1, 0.12, 2.4, 5);
    this.gantryLanternGeom = new THREE.SphereGeometry(0.16, 6, 6);

    this.crateGeom = new THREE.BoxGeometry(1.5, 1.4, 1.5);
    this.crateBraceGeom = new THREE.BoxGeometry(1.54, 0.14, 1.54);
    this.boulderGeom = new THREE.DodecahedronGeometry(1.1, 0);

    this.pendulumRopeGeom = new THREE.CylinderGeometry(0.05, 0.05, 3.4, 4);
    this.pendulumRopeGeom.translate(0, -1.7, 0);
    this.pendulumLogGeom = new THREE.CylinderGeometry(0.38, 0.38, 1.8, 6);
    this.pendulumLogGeom.rotateZ(Math.PI / 2);
    this.pendulumLogGeom.translate(0, -3.4, 0);
    this.pendulumBandGeom = new THREE.TorusGeometry(0.4, 0.04, 4, 8);
    this.pendulumBandGeom.rotateY(Math.PI / 2);

    this.archPostGeom = new THREE.CylinderGeometry(0.3, 0.4, 3.8, 6);
    this.archBeamGeom = new THREE.BoxGeometry(LANE_WIDTH * 3.4, 0.6, 0.6);
    this.archBannerGeom = new THREE.BoxGeometry(LANE_WIDTH * 2.2, 0.7, 0.1);
    this.archStarGeom = new THREE.DodecahedronGeometry(0.35, 0);

    this.coinGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 12);
    this.coinGeom.rotateX(Math.PI / 2);
    this.coinStarGeom = new THREE.BoxGeometry(0.22, 0.22, 0.15);

    this.gemGeom = new THREE.OctahedronGeometry(0.45, 0);
    this.powerupOrbGeom = new THREE.SphereGeometry(0.48, 8, 8);
    this.powerupRingGeom = new THREE.TorusGeometry(0.58, 0.06, 4, 12);

    this.magnetGeom = new THREE.TorusGeometry(0.42, 0.1, 6, 12, Math.PI);
    this.magnetTipGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    this.multiplierBadgeGeom = new THREE.DodecahedronGeometry(0.48, 0);
  }

  // Create 3D Stylized Cartoon Obstacle Mesh (Using shared geometries)
  public createObstacleMesh(obs: ObstacleData, theme: EnvironmentTheme): THREE.Group {
    const group = new THREE.Group();
    group.name = `Obstacle_${obs.id}`;
    group.position.set(obs.lane * LANE_WIDTH, 0, obs.z);

    if (obs.type === 'BARRIER_LOW') {
      const bar = new THREE.Mesh(this.hurdleBarGeom, this.woodPlankMat);
      bar.position.set(0, 0.62, 0);
      bar.castShadow = true;
      group.add(bar);

      const plate = new THREE.Mesh(this.hurdlePlateGeom, this.hazardBarMat);
      plate.position.set(0, 0.62, 0);
      group.add(plate);

      const leg1 = new THREE.Mesh(this.hurdleLegGeom, this.woodBarkMat);
      leg1.position.set(-LANE_WIDTH * 0.42, 0.35, 0);
      const leg2 = new THREE.Mesh(this.hurdleLegGeom, this.woodBarkMat);
      leg2.position.set(LANE_WIDTH * 0.42, 0.35, 0);
      group.add(leg1, leg2);
    } else if (obs.type === 'BARRIER_HIGH') {
      const beam = new THREE.Mesh(this.gantryBeamGeom, this.woodBarkMat);
      beam.position.set(0, 1.9, 0);
      beam.castShadow = true;
      group.add(beam);

      const lantern = new THREE.Mesh(this.gantryLanternGeom, this.lanternGlowMat);
      lantern.position.set(0, 1.48, 0);
      group.add(lantern);

      const post1 = new THREE.Mesh(this.gantryPostGeom, this.woodBarkMat);
      post1.position.set(-LANE_WIDTH * 0.5, 1.2, 0);
      const post2 = new THREE.Mesh(this.gantryPostGeom, this.woodBarkMat);
      post2.position.set(LANE_WIDTH * 0.5, 1.2, 0);
      group.add(post1, post2);
    } else if (obs.type === 'FALLEN_LOG' || obs.type === 'CRATE') {
      const crate = new THREE.Mesh(this.crateGeom, this.woodPlankMat);
      crate.position.set(0, 0.7, 0);
      crate.castShadow = true;
      crate.receiveShadow = true;
      group.add(crate);

      const b1 = new THREE.Mesh(this.crateBraceGeom, this.woodBarkMat);
      b1.position.set(0, 0.12, 0);
      const b2 = new THREE.Mesh(this.crateBraceGeom, this.woodBarkMat);
      b2.position.set(0, 1.28, 0);
      group.add(b1, b2);
    } else if (obs.type === 'WATER_TANK') {
      const boulder = new THREE.Mesh(this.boulderGeom, this.stoneArchMat);
      boulder.position.set(0, 0.75, 0);
      boulder.castShadow = true;
      group.add(boulder);
    } else if (obs.type === 'SWINGING_LOG') {
      const logPivot = new THREE.Group();
      logPivot.name = 'PendulumPivot';
      logPivot.position.set(0, 4.4, 0);

      const rope = new THREE.Mesh(this.pendulumRopeGeom, this.woodBarkMat);
      logPivot.add(rope);

      const log = new THREE.Mesh(this.pendulumLogGeom, this.woodBarkMat);
      log.castShadow = true;
      logPivot.add(log);

      const band1 = new THREE.Mesh(this.pendulumBandGeom, this.hazardBarMat);
      band1.position.set(-0.6, -3.4, 0);
      const band2 = new THREE.Mesh(this.pendulumBandGeom, this.hazardBarMat);
      band2.position.set(0.6, -3.4, 0);
      logPivot.add(band1, band2);

      group.add(logPivot);
    } else if (obs.type === 'CHECKPOINT_ARCH') {
      group.position.set(0, 0, obs.z);

      const postL = new THREE.Mesh(this.archPostGeom, this.stoneArchMat);
      postL.position.set(-LANE_WIDTH * 1.5, 1.9, 0);
      const postR = new THREE.Mesh(this.archPostGeom, this.stoneArchMat);
      postR.position.set(LANE_WIDTH * 1.5, 1.9, 0);
      group.add(postL, postR);

      const archBeam = new THREE.Mesh(this.archBeamGeom, this.stoneArchMat);
      archBeam.position.set(0, 3.8, 0);
      group.add(archBeam);

      const banner = new THREE.Mesh(this.archBannerGeom, this.bannerMat);
      banner.position.set(0, 3.2, 0);
      group.add(banner);

      const star = new THREE.Mesh(this.archStarGeom, this.goldStarMat);
      star.position.set(0, 4.3, 0);
      group.add(star);
    } else if (obs.type === 'FINISH_GATE') {
      group.position.set(0, 0, obs.z);

      // 1. Two Main Gantry Posts (Left & Right)
      const postL = new THREE.Mesh(this.finishTrussPostGeom, this.finishTrussMat);
      postL.position.set(-LANE_WIDTH * 1.6, 2.2, 0);
      const postR = new THREE.Mesh(this.finishTrussPostGeom, this.finishTrussMat);
      postR.position.set(LANE_WIDTH * 1.6, 2.2, 0);
      group.add(postL, postR);

      // Red/White hazard base plates
      const hazardPlateGeom = new THREE.BoxGeometry(0.56, 0.8, 0.56);
      const hazardL = new THREE.Mesh(hazardPlateGeom, this.hazardBarMat);
      hazardL.position.set(-LANE_WIDTH * 1.6, 0.4, 0);
      const hazardR = new THREE.Mesh(hazardPlateGeom, this.hazardBarMat);
      hazardR.position.set(LANE_WIDTH * 1.6, 0.4, 0);
      group.add(hazardL, hazardR);

      // 2. High Overhead Gantry Truss
      const trussBeam = new THREE.Mesh(this.finishTrussBeamGeom, this.finishTrussMat);
      trussBeam.position.set(0, 4.4, 0);
      group.add(trussBeam);

      // 3. Black-and-White Checkered Finish Banner
      const banner = new THREE.Mesh(this.finishBannerGeom, this.checkeredBannerMat);
      banner.position.set(0, 3.8, 0);
      group.add(banner);

      // 4. Ground Checkered Finish Line Strip across platform
      const groundStrip = new THREE.Mesh(this.finishGroundStripGeom, this.finishLineGroundMat);
      groundStrip.position.set(0, 0.02, 0);
      group.add(groundStrip);

      // 5. Crown / Golden Star on Top
      const finishStar = new THREE.Mesh(this.archStarGeom, this.finishGoldGlowMat);
      finishStar.position.set(0, 4.95, 0);
      group.add(finishStar);

      // 6. Checkered Finish Flags on Top of Posts
      const flagPoleL = new THREE.Mesh(this.finishFlagPoleGeom, this.finishTrussMat);
      flagPoleL.position.set(-LANE_WIDTH * 1.6, 4.8, 0);
      const flagL = new THREE.Mesh(this.finishFlagGeom, this.checkeredBannerMat);
      flagL.position.set(-LANE_WIDTH * 1.6 + 0.4, 5.1, 0);
      group.add(flagPoleL, flagL);

      const flagPoleR = new THREE.Mesh(this.finishFlagPoleGeom, this.finishTrussMat);
      flagPoleR.position.set(LANE_WIDTH * 1.6, 4.8, 0);
      const flagR = new THREE.Mesh(this.finishFlagGeom, this.checkeredBannerMat);
      flagR.position.set(LANE_WIDTH * 1.6 - 0.4, 5.1, 0);
      group.add(flagPoleR, flagR);

      // 7. Golden Glow Beacons on Base
      const beaconGeom = new THREE.SphereGeometry(0.2, 8, 8);
      const beaconL = new THREE.Mesh(beaconGeom, this.finishGoldGlowMat);
      beaconL.position.set(-LANE_WIDTH * 1.6, 0.9, 0);
      const beaconR = new THREE.Mesh(beaconGeom, this.finishGoldGlowMat);
      beaconR.position.set(LANE_WIDTH * 1.6, 0.9, 0);
      group.add(beaconL, beaconR);
    }

    return group;
  }

  // Create 3D Stylized Cartoon Collectible Mesh (Using shared geometries)
  public createCollectibleMesh(item: CollectibleData): THREE.Group {
    const group = new THREE.Group();
    group.name = `Collectible_${item.id}`;
    group.position.set(item.lane * LANE_WIDTH, item.y, item.z);

    if (item.type === 'COIN') {
      const coin = new THREE.Mesh(this.coinGeom, this.coinGoldMat);
      coin.castShadow = true;
      group.add(coin);

      const star = new THREE.Mesh(this.coinStarGeom, this.goldStarMat);
      group.add(star);
    } else if (item.type === 'GEM') {
      const gem = new THREE.Mesh(this.gemGeom, this.gemEmeraldMat);
      gem.castShadow = true;
      group.add(gem);
    } else if (item.type === 'POWERUP_SHIELD') {
      const orb = new THREE.Mesh(this.powerupOrbGeom, this.shieldBlueMat);
      const ring = new THREE.Mesh(this.powerupRingGeom, this.shieldBlueMat);
      group.add(orb, ring);
    } else if (item.type === 'POWERUP_MAGNET') {
      const magnet = new THREE.Mesh(this.magnetGeom, this.magnetPinkMat);
      const tipL = new THREE.Mesh(this.magnetTipGeom, this.stoneArchMat);
      tipL.position.set(-0.42, 0, 0);
      const tipR = new THREE.Mesh(this.magnetTipGeom, this.stoneArchMat);
      tipR.position.set(0.42, 0, 0);
      group.add(magnet, tipL, tipR);
    } else if (item.type === 'POWERUP_MULTIPLIER') {
      const badge = new THREE.Mesh(this.multiplierBadgeGeom, this.multPurpleMat);
      group.add(badge);
    }

    return group;
  }
}

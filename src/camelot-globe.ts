/* eslint-disable @typescript-eslint/no-explicit-any */
import ThreeGlobe from 'three-globe';
import { WebGLRenderer, Scene } from 'three';
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  PointLight,
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {LitElement, html, css} from 'lit';
import {customElement, query} from 'lit/decorators.js';

import countries from './files/globe-data-min.json';
import airports from './files/airports_filtered.json';

const nizza = { lat: 43.7102, lng: 7.2620, code: "LogiPharma" }

@customElement('camelot-globe')
export class CamelotGlobe extends LitElement {
  @query('main') main!: HTMLElement;
  @query('canvas') canvas!: HTMLCanvasElement;

  static override styles = css`
    :host {
      display: block;
      opacity: 1;
    }
  `;

  private scene: Scene = new Scene()
  private camera: PerspectiveCamera = new PerspectiveCamera();

  private renderer?: WebGLRenderer;
  private controls?: OrbitControls;
  private Globe: any;

  constructor() {
    super();

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  override firstUpdated() {
    const width = this.main.offsetWidth;
    const height = this.main.offsetHeight;

    this.renderer = new WebGLRenderer({antialias: true, canvas: this.canvas, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    // Initialize scene, light
    this.scene.add(new AmbientLight(0xbbbbbb, 0.3));
    this.renderer?.setAnimationLoop(() => this.paint())
    this.renderer.setClearColor(0xffffff, 0);

    // Initialize camera, light
    this.camera = new PerspectiveCamera();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const dLight = new DirectionalLight(0xffffff, 0.8);
    dLight.position.set(-800, 2000, 400);
    this.camera.add(dLight);

    const dLight1 = new DirectionalLight(0x7982f6, 1);
    dLight1.position.set(-200, 500, 200);
    this.camera.add(dLight1);

    const dLight2 = new PointLight(0x8566cc, 0.5);
    dLight2.position.set(-200, 500, 200);
    this.camera.add(dLight2);

    this.camera.position.z = 320;
    this.camera.position.x = 0;
    this.camera.position.y = 0;

    this.scene.add(this.camera);

    // Additional effects
    this.scene.fog = new Fog(0x6dc6fa, 400, 6000);

    // Initialize controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 200;
    this.controls.maxDistance = 500;
    this.controls.rotateSpeed = 0.8;
    this.controls.enableZoom = false;
    this.controls.autoRotate = false;

    this.controls.minPolarAngle = Math.PI / 3.5;
    this.controls.maxPolarAngle = Math.PI - Math.PI / 3;

    // Shuffle array
    const shuffled = airports.sort(() => 0.5 - Math.random());

    // Get sub-array of first n elements after shuffled
    const arcsData = shuffled.slice(0, 30).map((startAirport) => {
      const endAirport = airports[ Math.floor((airports.length - 1) * Math.random())]

      return {
        startLat: startAirport.lat,
        startLng: startAirport.lng,
        endLat: endAirport.lat,
        endLng: endAirport.lng,
        color: ['#FF567B', '#4397FF'][Math.round(Math.random() * 1)],
      }
    });

    this.Globe = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    })
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(true)
      .atmosphereColor('#53A1EC')
      .atmosphereAltitude(0.25)
      .hexPolygonColor((e: any) => {
        return 'rgba(255,255,255, 0.7)';
      })
      .labelsData([...airports, nizza])
      .labelColor(() => '#FFEE89')
      .labelText((e: any) => e.code)
      .labelDotRadius(0.3)
      .labelText("code")
      .labelResolution(6)
      .labelAltitude(0.01)
      .pointsData([...airports, nizza])
      .pointColor(() => "#FFEE89")
      .pointsMerge(true)
      .pointAltitude(0.07)
      .pointRadius(0.05);

    // NOTE Arc animations are followed after the globe enters the scene
    setTimeout(() => {
      this.Globe.arcsData(arcsData)
        .arcColor((e: any) => {
          return e.color;
        })
        .arcDashLength(0.7)
        .arcDashGap(4)
        .arcDashAnimateTime(3000)
        .arcStroke(1)
        .arcsTransitionDuration(1000)
        .arcDashInitialGap(() => Math.random() * 5);
    }, 1000);

    this.Globe.rotateY(-Math.PI * (1 / 9));
    // this.Globe.rotateZ(-Math.PI / 4);

    const globeMaterial = this.Globe.globeMaterial();
    globeMaterial.color = new Color(0x0057FF);
    globeMaterial.emissive = new Color(0x53A1EC);
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 2;

    this.scene.add(this.Globe);

    this.paint();
  }

  paint() {
    // this.Globe.rotation.x += 0.001;
    this.Globe.rotation.y += 0.001;

    this.renderer!.render(this.scene, this.camera);
    this.controls!.update()
  }

  override render() {
    return html`
    <main style="height: 100%; width: 100%">
      <canvas>
    </main>
    `;
  }

  onWindowResize() {
    this.camera.aspect = this.main.offsetWidth / this.main.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer!.setSize(this.main.offsetWidth, this.main.offsetHeight);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'camelot-globe': CamelotGlobe;
  }
}

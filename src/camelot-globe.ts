/* eslint-disable @typescript-eslint/no-explicit-any */
import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene } from "three";
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  PointLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import countries from "./files/globe-data-min.json";
import travelHistory from "./files/my-flights.json";
import airportHistory from "./files/my-airports.json";

@customElement('camelot-globe')
export class CamelotGlobe extends LitElement {
  static override styles = css`
    :host {
      display: block;
      opacity: 1;
    }
  `;

  /**
   * The name to say "Hello" to.
   */
  @property()
  name = 'World';

  /**
   * The number of times the button has been clicked.
   */
  @property({type: Number})
  count = 0;

  private root!: HTMLElement;
  private renderer!: WebGLRenderer; 
  private camera: any; 
  private scene!: Scene;
  private controls: any;
  private mouseX = 0;
  private mouseY = 0;
  private windowHalfX = window.innerWidth / 2;
  private windowHalfY = window.innerHeight / 2;
  private Globe: any;

  constructor() {
    super()

    window.addEventListener("resize", this.onWindowResize, false);
  }

  override firstUpdated () {
    this.root = this.shadowRoot!.getElementById('root')!

    const width = this.root.offsetWidth
    const height = this.root.offsetHeight

    this.renderer = new WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    // Initialize scene, light
    this.scene = new Scene();
    this.scene.add(new AmbientLight(0xbbbbbb, 0.3));
    this.renderer.setClearColor(0xffffff, 0)
    // this.scene.background = new Color(0x0D1B36);
    // this.scene.setClearColor(0xffffff, 0)

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

    this.camera.position.z = 400;
    this.camera.position.x = 0;
    this.camera.position.y = 0;

    this.scene.add(this.camera);

    // // Additional effects
    this.scene.fog = new Fog(0x6DC6FA, 400, 6000);

    // Helpers
    // const axesHelper = new AxesHelper(800);
    // scene.add(axesHelper);
    // var helper = new DirectionalLightHelper(dLight);
    // scene.add(helper);
    // var helperCamera = new CameraHelper(dLight.shadow.camera);
    // scene.add(helperCamera);

    // Initialize controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dynamicDampingFactor = 0.01;
    this.controls.enablePan = false;
    this.controls.minDistance = 200;
    this.controls.maxDistance = 500;
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomSpeed = 1;
    this.controls.autoRotate = false;

    this.controls.minPolarAngle = Math.PI / 3.5;
    this.controls.maxPolarAngle = Math.PI - Math.PI / 3;

    // Gen random data
    const N = 20;

    const arcsData = [...Array(N).keys()].map(() => ({
      startLat: (Math.random() - 0.5) * 180,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 180,
      endLng: (Math.random() - 0.5) * 360,
      color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
    }));

    this.Globe = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    })
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(true)
      .atmosphereColor("#3a228a")
      .atmosphereAltitude(0.25)
      .hexPolygonColor((e: any) => {
        if (
          ["KGZ", "KOR", "THA", "RUS", "UZB", "IDN", "KAZ", "MYS"].includes(
            e.properties.ISO_A3
          )
        ) {
          return "rgba(255,255,255, 1)";
        } else return "rgba(255,255,255, 0.7)";
      })
      .labelsData(airportHistory.airports)
      .labelColor(() => "#ffcb21")
      .labelDotOrientation((e: any) => {
        return e.text === "ALA" ? "top" : "right";
      })
      // .labelDotRadius(0.3)
      // .labelSize((e: any) => e.size)
      // .labelText("city")
      // .labelResolution(6)
      // .labelAltitude(0.01)
      // .pointsData(airportHistory.airports)
      // .pointColor(() => "#ffffff")
      // .pointsMerge(true)
      // .pointAltitude(0.07)
      // .pointRadius(0.05);


    // NOTE Arc animations are followed after the globe enters the scene
    setTimeout(() => {
      this.Globe.arcsData(travelHistory.flights)
      .arcColor((e: any) => {
        return e.status ? "#9cff00" : "#FF4000";
      })
      .arcAltitude((e: any) => {
        return e.arcAlt;
      })
      .arcStroke((e: any) => {
        return e.status ? 0.5 : 0.3;
      })
      .arcDashLength(0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(1000)
      .arcsTransitionDuration(1000)
    }, 10000);

    const globeMaterial = this.Globe.globeMaterial();
    globeMaterial.color = new Color(0x3a228a);
    globeMaterial.emissive = new Color(0x220038);
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 2;
  
    this.scene.add(this.Globe);

    this.draw();
    this.root?.appendChild(this.renderer.domElement)
  }

  draw() {
    // this.Globe.rotation.x += 0.001;
    this.Globe.rotation.y += 0.001;

    this.controls.update()
    this.renderer.render( this.scene, this.camera );
    requestAnimationFrame( this.draw.bind(this) );
  }

  override render() {
    return html`
      <div id="root" style="height: 100%; width: 100%"></div>
    `;
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.windowHalfX = window.innerWidth / 1.5;
    this.windowHalfY = window.innerHeight / 1.5;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'camelot-globe': CamelotGlobe;
  }
}

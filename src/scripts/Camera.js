
import * as PIXI from 'pixi.js'
import gsap from 'gsap';

import Sprite from './Sprite';

export class Camera {
  constructor (app, ctx) {
    this._app = app;
    this._ctx = ctx;
    this._stage = null;
    this._container = null;

    this._loadPitures = [];
    this._pictures = [];

    this.init();
  }

  init () {
    this.build();
  }

  setImages (pictures) {
    this._pictures = pictures;

    // Set Loader from images
    this._loadPitures = PIXI.Loader.shared;
    this._loadPitures.add(pictures).load();

    this._loadPitures.onProgress.add(({ progress }) => {
      const percent = Math.ceil(progress);
      document.body.style = `--progress: ${percent}%`
    });

    this._loadPitures.onComplete.add(() => this.onLoadPictures());
  }

  onLoadPictures () {
    const resourcesKeys = Object.keys(this._loadPitures.resources);
    this._container = new PIXI.Container();
    this._container.sortableChildren = true;

    resourcesKeys.forEach((img, index) => {
      const texture = this._loadPitures.resources[img].texture;
      const opts = {
        width: 320,
        height: 510,
        z: resourcesKeys.length - index,
        offset: 16,
        index
      }
      new Sprite(this._container, texture, opts);
      // container2.zIndex = resourcesKeys.length - index;
    })


    this._stage.stage.addChild(this._container)

    this.doHiddenLoad();
  }

  //
  doHiddenLoad () {
    // Timeline Progress
    const frame = this._app.querySelector('.frame');
    const frameCircle = frame.querySelector('.load-circle');
    const frameProgress = frame.querySelector('.progress');

    const tl = gsap.timeline({
      onComplete: () => frame.classList.add('hidden')
    });

    // const containerChilds = container.children;
    const innerWidth = window.innerWidth;

    tl.to([frameCircle, frameProgress], { opacity: 0, duration: 1 })
    tl.addLabel("fadeOut", "+=0")
    tl.to(frame, { opacity: 0, duration: 0.5 }, "fadeOut")
    tl.to(this._container.children, {
      startAt: {
        alpha: (index) => index != 0 ? 0 : 1,
      },
      x: (index) => (innerWidth - 320) / 2 + ((320 + 32) * index),
      alpha: 1,
      delay: 0.2,
      duration: 0.8,
      ease: "power4.inOut",
      stagger: {
        from: "end",
        amount: 0.1
      }
    })

    // this._container.x = 
  }

  // Create the Application
  build () {
    this._stage = new PIXI.Application({
      // resizeTo: window,
      autoResize: true,
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      powerPreference: "high-performance",
      view: this._ctx,
      resolution: window.devicePixelRatio,
      backgroundColor: 0xE2E2E2
    });

    this._stage.render()
  }
}


export default Camera;
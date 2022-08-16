
import fit from 'math-fit';
import gradientFilter from './../img/gradient-filter.png'
import gridImages from './imgs';

const canvas = document.querySelector('#canvas');
const frameCircle = document.querySelector('.frame');

// Create the Application
const app = new PIXI.Application({
  // width: innerWidth,
  // height: innerHeight,
  // transparent: true,
  // autoStart: false,
  resizeTo: window,
  autoResize: true,
  antialias: true,
  powerPreference: "high-performance",
  view: canvas,
  resolution: window.devicePixelRatio,
  backgroundColor: 0xE2E2E2
});

// Viewport Config
const margin = 48;
const slidesInView = 3.25;
const width = (window.innerWidth - 2 * margin) / slidesInView;
const height = window.innerHeight * 0.8;

let direction = 0;
let isMouseOver = false;
let isInteractive = false;
let scroll = 0;
let scrollTarget = 0;

const thumbs = [];
const numbers = gridImages.length * (width + margin)
let displamentFilter = null;

// Create the main cointainer
const container = new PIXI.Container();
app.stage.addChild(container);

// Set Loader from images
PIXI.Loader.shared
  .add(gridImages)
  .load(onLoadImages);

function onLoadImages () {
  const resourcesKeys = Object.keys(PIXI.Loader.shared.resources)

  resourcesKeys.forEach((img, index) => {
    const texture = PIXI.Loader.shared.resources[img].texture;
    const sprite = new PIXI.Sprite(texture)
    const spriteContainer = new PIXI.Container();
    const mainContainer = new PIXI.Container();

    const mask = new PIXI.Graphics();
    mask.beginFill(0xFFFFFF);
    mask.drawRect(0, 0, width, height);

    sprite.mask = mask;

    // Set cover size's
    const {
      texture: {
        orig: { width: spritWidth, height: spritHeight }
      }
    } = sprite;

    const sizeFromParent = { w: width, h: height };
    const sizeFromSprite = { w: spritWidth, h: spritHeight };
    const cover = fit(sizeFromSprite, sizeFromParent);

    sprite.anchor.set(0.5)
    sprite.position.set(sprite.texture.orig.width / 2, sprite.texture.orig.height / 2)
    if (index < slidesInView) sprite.alpha = 0;

    spriteContainer.position.set(cover.left, cover.top)
    spriteContainer.scale.set(cover.scale)

    mainContainer.x = (width + margin) * index;
    mainContainer.y = height / 10;

    // Interactive
    sprite.interactive = true;
    sprite.buttonMode = true;
    mainContainer.interactive = true;
    mainContainer.on('mouseover', (e) => onMouseOver(e));
    mainContainer.on('mouseout', (e) => onMouseOut(e));
    mainContainer.on('click', (ev) => onClick(ev));

    // AddChilds
    spriteContainer.addChild(sprite)
    mainContainer.addChild(spriteContainer)
    mainContainer.addChild(mask);

    // 
    thumbs.push(mainContainer)
    container.addChild(mainContainer)
  })

  gsap.to(frameCircle, {
    opacity: 0,
    duration: 1,
    onComplete: () => {
      frameCircle.classList.add('hidden');
    }
  })

  anime();
  filter();
}

// When Start
const anime = () => {
  const containerChilds = container.children;
  const timeline = gsap.timeline({
    delay: 1,
    onComplete: () => {
      isInteractive = true;
      scrollTarget = -5;
    }
  });

  // Set animations in only sprites in viewport
  for (let i = 0; i < slidesInView; i++) {
    const child = containerChilds[i].children[0].children[0];

    const {
      texture: {
        orig: { height: spritHeight }
      }
    } = child;

    const duration = 1;
    const delay = (duration - (0.05 * i)) * -1;

    timeline.fromTo(child,
      {
        y: spritHeight,
        alpha: 0,
      },
      {
        y: spritHeight / 2,
        alpha: 1,
        duration,
        delay,
        ease: 'Power2.easeInOut',
        onStart: function () {
          child.buttonMode = false;
        },
        onComplete: function () {
          child.buttonMode = true;
        }
      }
    )

    timeline.fromTo(child.scale,
      {
        x: 2,
        y: 2
      },
      {
        x: 1,
        y: 1,
        duration,
        delay,
        ease: 'Power2.easeOut'
      }
    )
  }
}

// Filters
const filter = () => {
  const displamentSprite = PIXI.Sprite.from(gradientFilter);
  app.stage.addChild(displamentSprite)

  // Set cover size's
  const { texture: { orig: { width: spritWidth, height: spritHeight } } } = displamentSprite;

  const sizeFromParent = { w: window.innerWidth, h: window.innerHeight };
  const sizeFromSprite = { w: 512, h: 512 };
  const cover = fit(sizeFromSprite, sizeFromParent);

  displamentSprite.position.set(cover.left, cover.top)
  displamentSprite.scale.set(cover.scale, cover.scale)

  displamentFilter = new PIXI.filters.DisplacementFilter(displamentSprite);
  displamentFilter.scale.x = -100;
  displamentFilter.scale.y = 0;
  container.filters = [displamentFilter]
}

// Events Callback's
const onMouseOver = (e) => {
  const el = e.target;
  if (!isMouseOver && isInteractive) isMouseOver = true;

  if (el && isInteractive) {
    gsap.to(el.scale, {
      duration: 1,
      x: 1.25,
      y: 1.25
    })
  }
}

const onMouseOut = (e) => {
  const el = e.currentTarget.children[0].children[0];
  if (isMouseOver && isInteractive) setTimeout(isMouseOver = false, 300);

  if (el && isInteractive) {
    gsap.to(el.scale, {
      duration: 1,
      x: 1,
      y: 1
    })
  }
}

const onClick = () => {
  console.log('click')
}

const onScroll = () => {
  document.addEventListener('mousewheel', ({ wheelDelta }) => {
    if (!isMouseOver) scroll = wheelDelta * -1;
  })
}

// Tick Event
const calcPos = (currentScroll, sprite) => (currentScroll + sprite + numbers + width + margin) % numbers - width - margin;

app.ticker.add((delta) => {
  // Scroll
  scroll -= (scroll - scrollTarget) * 0.1;
  scroll *= 0.75;

  // Direction
  direction = scroll > 0 ? -1 : 1;

  thumbs.forEach(item => {
    if (!isMouseOver) item.position.x = calcPos(scroll, item.position.x);
  })

  if (displamentFilter) displamentFilter.scale.x = direction * Math.abs(scroll);

  app.renderer.render(container);
});

// Init Events
const onInitEvents = () => {
  onScroll();
}

onInitEvents();
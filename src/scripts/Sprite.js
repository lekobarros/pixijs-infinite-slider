import * as PIXI from 'pixi.js';
import fit from 'math-fit';

export class Sprite {
  constructor (stage, texture, options) {
    this._stage = stage;
    this._texture = texture;
    this._sprite = null;
    this.options = options;

    this.build();
  }

  build () {
    this._sprite = new PIXI.Sprite(this._texture)
    this._spriteWrap = new PIXI.Container();
    this._container = new PIXI.Container();
    this._container.zIndex = this.options.z;

    const mask = new PIXI.Graphics();
    mask.beginFill(0xFFFFFF);
    mask.drawRect(0, 0, this.options.width, this.options.height);

    this._sprite.mask = mask;

    // Set cover size's
    const {
      texture: {
        orig: { width: spritWidth, height: spritHeight }
      }
    } = this._sprite;

    const sizeFromParent = { w: this.options.width, h: this.options.height };
    const sizeFromSprite = { w: spritWidth, h: spritHeight };
    const cover = fit(sizeFromSprite, sizeFromParent);

    this._sprite.anchor.set(0.5)
    this._sprite.position.set(this._sprite.texture.orig.width / 2, this._sprite.texture.orig.height / 2)
    // this._container.alpha = 0;

    this._spriteWrap.position.set(cover.left, cover.top)
    this._spriteWrap.scale.set(cover.scale)

    const { innerWidth, innerHeight } = window;
    // this._container.x = (innerWidth / 2 - this.options.width / 2) * (this.options.index + 1);
    this._container.x = (innerWidth - this.options.width) / 2; // + (this.options.index * this.options.offset);
    // + ((this.options.width * this.options.index) + this.options.offset)
    // this._container.x = (this.options.width + this.options.offset) * this.options.index;
    this._container.y = (innerHeight - this.options.height) / 2;
    // this._container.scale.set(0.4)

    // Interactive
    // sprite.interactive = true;
    // sprite.buttonMode = true;
    // mainContainer.interactive = true;
    // mainContainer.on('mouseover', (e) => onMouseOver(e));
    // mainContainer.on('mouseout', (e) => onMouseOut(e));
    // mainContainer.on('click', (ev) => onClick(ev));

    // Add Childs
    this._spriteWrap.addChild(this._sprite)
    this._container.addChild(this._spriteWrap)
    this._container.addChild(mask);

    // 
    // thumbs.push(mainContainer)
    // mainContainer.parentGroup = blueGroup;
    this._stage.addChild(this._container)
  }
}

export default Sprite;
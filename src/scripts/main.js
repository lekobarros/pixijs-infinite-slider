import Camera from './Camera';

// Resources
import gridImages from './imgs';

const app = document.querySelector('#app');
const canvas = document.querySelector('#canvas');

const camera = new Camera(app, canvas);
camera.setImages(gridImages);
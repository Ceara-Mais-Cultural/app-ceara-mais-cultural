import icons from './icons';
import images from './images';
import colors from './colors';

const MUNICIPIOS = [
  {
    id: 1,
    name: 'Fortaleza',
  },
  {
    id: 2,
    name: 'Juazeiro do Norte',
  },
  {
    id: 3,
    name: 'Caucaia',
  },
  {
    id: 4,
    name: 'Maracanaú',
  },
  {
    id: 5,
    name: 'Sobral',
  },
];

const BAIRROS = [
  {
    id: 1,
    name: 'Paupina',
    city: 1,
    city_name: 'Fortaleza',
  },
  {
    id: 2,
    name: 'São Bento',
    city: 1,
    city_name: 'Fortaleza',
  },
  {
    id: 3,
    name: 'Angico',
    city: 3,
    city_name: 'Caucaia',
  },
  {
    id: 4,
    name: 'Araticuba',
    city: 3,
    city_name: 'Caucaia',
  },
];

export { icons, images, colors, MUNICIPIOS, BAIRROS};

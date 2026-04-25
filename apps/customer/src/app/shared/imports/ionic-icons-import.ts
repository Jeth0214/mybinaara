import { addIcons } from 'ionicons';
import {
  searchOutline,
  locationOutline,
  timeOutline,
  hammerOutline,
  cubeOutline,
  appsOutline,
  cutOutline,
  leafOutline,
  colorPaletteOutline,
  gridOutline,
  storefrontOutline,
  mapOutline
} from 'ionicons/icons';

export const registerGlobalIcons = () => {
  addIcons({
    'search-outline': searchOutline,
    'location-outline': locationOutline,
    'time-outline': timeOutline,
    'hammer-outline': hammerOutline,
    'cube-outline': cubeOutline,
    'apps-outline': appsOutline,
    'cut-outline': cutOutline,
    'leaf-outline': leafOutline,
    'color-palette-outline': colorPaletteOutline,
    'grid-outline': gridOutline,
    'storefront-outline': storefrontOutline,
    'map-outline': mapOutline
  });
};

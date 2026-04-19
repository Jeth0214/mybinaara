import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  searchOutline,
  locationOutline,
  personOutline
} from 'ionicons/icons';

export const registerGlobalIcons = () => {
  addIcons({
    'notifications-outline': notificationsOutline,
    'search-outline': searchOutline,
    'location-outline': locationOutline,
    'person-outline': personOutline,
    // Add new globally used icons here
  });
};
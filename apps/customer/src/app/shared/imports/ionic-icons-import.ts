import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  searchOutline,
  locationOutline,
  personOutline,
  timeOutline,
  hammerOutline,
  logInOutline,
} from 'ionicons/icons';

export const registerGlobalIcons = () => {
  addIcons({
    'notifications-outline': notificationsOutline,
    'search-outline': searchOutline,
    'location-outline': locationOutline,
    'person-outline': personOutline,
    'time-outline': timeOutline,
    'hammer-outline': hammerOutline,
    'log-in-outline': logInOutline,
    // Add new globally used icons here
  });
};
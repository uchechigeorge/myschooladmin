import { ActionSheetOptions } from '@ionic/core';
import { profilePhotoActionSheetID } from '../models/components-id';

type actionSheetHandler = () => void | boolean | Promise<void | boolean>;

export const profilePicActionSheetOptions = (galleryFunction?: actionSheetHandler, cameraFunction?: actionSheetHandler): ActionSheetOptions => {
  let options: ActionSheetOptions = {
    buttons: [
      {
        icon: 'image',
        text: 'Choose from Gallery',
        cssClass: 'profile-action-sheet-button',
        handler: () => {
          if(galleryFunction){
            galleryFunction();
          }
          else 
            console.log('Gallery clicked');
        }
      },
      {
        icon: 'camera',
        text: 'Take a photo',
        cssClass: 'profile-action-sheet-button',
        handler: () => {
          if(cameraFunction)
            cameraFunction();
          else
            console.log('Camera clicked');
        }
      },
    ],
    header: 'Profile Photo',
    id: profilePhotoActionSheetID,
 }

 return options;
}
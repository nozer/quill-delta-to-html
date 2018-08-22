
import * as url from './../helpers/url';

interface IMention {
   [index: string]: string | undefined,
   'name'?: string,
   'target'?: string,
   'slug'?: string,
   'class'?: string,
   'avatar'?: string,
   'id'?: string,
   'end-point'?: string
}

class MentionSanitizer {

   static sanitize(dirtyObj: IMention): IMention {

      var cleanObj: any = {};

      if (!dirtyObj || typeof dirtyObj !== 'object') {
         return cleanObj;
      }

      if (dirtyObj.class && MentionSanitizer.IsValidClass(dirtyObj.class)) {
         cleanObj.class = dirtyObj.class;
      }

      if (dirtyObj.id && MentionSanitizer.IsValidId(dirtyObj.id)) {
         cleanObj.id = dirtyObj.id;
      }

      if (MentionSanitizer.IsValidTarget(dirtyObj.target+'')) {
         cleanObj.target = dirtyObj.target;
      }

      if (dirtyObj.avatar) {
         cleanObj.avatar = url.sanitize(dirtyObj.avatar + '');
      }

      if (dirtyObj['end-point']) {
         cleanObj['end-point'] = url.sanitize(dirtyObj['end-point'] + '');
      }

      if (dirtyObj.slug) {
         cleanObj.slug = (dirtyObj.slug + '');
      }

      return cleanObj;
   }
   
   static IsValidClass(classAttr: string) {
      return !!classAttr.match(/^[a-zA-Z0-9_\-]{1,500}$/i);
   }

   static IsValidId(idAttr: string) {
      return !!idAttr.match(/^[a-zA-Z0-9_\-\:\.]{1,500}$/i);
   }

   static IsValidTarget(target: string) {
      return ['_self', '_blank', '_parent', '_top'].indexOf(target) > -1;
   }

}

export { MentionSanitizer, IMention }

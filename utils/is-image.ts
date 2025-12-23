export default function isAnImage(image: File | string): boolean {
  if ( typeof image === "string" ) return true;

  if ( 
    image.type !== "image/gif" && 
    image.type !== "image/jpeg" && 
    image.type !== "image/png" && 
    image.type !== "image/webp"
  ){
    return false;
  }

  return true;
}

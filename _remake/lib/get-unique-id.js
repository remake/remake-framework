import nanoidGenerate from "nanoid/generate";
const nanoidLength = 14;
const nanoidAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// Collision probability of unique ids (source: https://zelark.github.io/nano-id-cc/): 
// if you generate 1000 IDS per hour, it will take ~15 years in order to have a 
// 1% probability of one collision with the current settings
export default function getUniqueId () {
  return nanoidGenerate(nanoidAlphabet, nanoidLength);
}
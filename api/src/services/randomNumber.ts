const ENCODING = '0123456789';
const ENCODING_LEN = ENCODING.length;

function randomChar() {
  let buffer = new Uint8Array(1);
  buffer[0] = Math.floor(Math.random() * 255);
  let num = buffer[0] / 0xff;
  let rand = Math.floor(num * ENCODING_LEN);
  return ENCODING.charAt(Math.min(rand, ENCODING_LEN - 1));
}

export function randomNum() {
  let str = '';
  for (let len = 10; len > 0; len--) {
    str = randomChar() + str;
  }
  let mod;
  let now = Date.now();
  for (let len = 10; len > 0; len--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return parseInt(str);
}

"use strict";

import {furigana} from './furigana.js';

export function furiganaMarkdownIt(options) {
  return function(md) {
    md.inline.ruler.push("furigana", furigana(options));
  };
};

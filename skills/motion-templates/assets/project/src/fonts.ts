import {continueRender, delayRender} from 'remotion';
import {trackFont} from './fontGate';
import mont600 from '@fontsource/montserrat/files/montserrat-latin-600-normal.woff2';
import mont700 from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff2';

// Montserrat (OFL-1.1) is bundled locally, so renders need no network and no system fonts.
// Latin only: CJK text needs an extra open font (not bundled yet).
export const FONT_FAMILY = 'MontserratLocal';

let loaded = false;
export const ensureFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading fonts');
  const all = Promise.all(
    [
      ['600', mont600],
      ['700', mont700],
    ].map(([weight, url]) =>
      new FontFace(FONT_FAMILY, `url(${url}) format('woff2')`, {weight}).load().then((f) => {
        document.fonts.add(f);
      }),
    ),
  );
  trackFont(all);
  all
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};

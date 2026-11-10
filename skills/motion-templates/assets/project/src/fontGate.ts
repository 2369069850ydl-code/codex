import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

// Font loads in flight. Text must not be laid out before every face it may use is registered:
// otherwise Chrome looks for a system fallback font, which crashes the headless browser here.
const pending: Promise<unknown>[] = [];
export const trackFont = (p: Promise<unknown>) => {
  pending.push(p.catch(() => undefined));
};

let settled = false;
/** False until all tracked font loads have finished; holds the render until then. */
export const useFontsReady = () => {
  const [ready, setReady] = useState(settled);
  useEffect(() => {
    if (ready) return;
    const h = delayRender('fonts gate');
    const wait = (): Promise<unknown> => {
      const n = pending.length;
      return Promise.all(pending).then(() => (pending.length > n ? wait() : undefined));
    };
    wait().then(() => {
      settled = true;
      setReady(true);
      continueRender(h);
    });
  }, [ready]);
  return ready;
};

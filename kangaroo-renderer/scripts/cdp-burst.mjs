// Animation smoke check: trigger a jump / a fold-target jump, then capture a
// burst of screenshots to prove intermediate animation frames exist (i.e. no
// teleporting under the demand frameloop).
import fs from 'node:fs';

const CDP_PORT = process.env.CDP_PORT ?? '9345';
const BASE = process.argv[2] ?? 'http://[::1]:5183';
const OUT_DIR = process.argv[3] ?? 'verify-shots';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
const ws = new WebSocket((await res.json()).webSocketDebuggerUrl);
await new Promise((r, j) => {
  ws.addEventListener('open', r);
  ws.addEventListener('error', j);
});

let nextId = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});
const cdp = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true });
const send = (m, p) => cdp(m, p, sessionId);
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 860,
  height: 1150,
  deviceScaleFactor: 1,
  mobile: false,
});

fs.mkdirSync(OUT_DIR, { recursive: true });

const evaljs = (expression) =>
  send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
const store = (call) => evaljs(`window.__problemStore.getState().${call}`);
const shot = async (name) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(data, 'base64'));
  console.log('saved', name);
};
const burst = async (prefix, count, intervalMs) => {
  for (let i = 0; i < count; i++) {
    await shot(`${prefix}-${i}`);
    await sleep(intervalMs);
  }
};

// --- Jump: idle a while first so the old bug (huge first-frame delta) would
// reproduce, then trigger one turn and capture mid-hop frames.
await send('Page.navigate', { url: `${BASE}/?problem=MK_G5_6_2023_AnimalJumpRace` });
await sleep(4000);
await sleep(3000); // idle gap on purpose
await store('stepTurn()');
await burst('burst-jump', 5, 110);

// --- Fold: jump the TARGET straight 0 -> 90 (like clicking the slider
// track); the tween should produce intermediate poses.
await send('Page.navigate', { url: `${BASE}/?problem=MK_G5_6_2023_CubeNetFold` });
await sleep(4000);
await sleep(2000); // idle gap
await store('setFoldAngle(90)');
await burst('burst-fold', 5, 110);
// Reset should unfold smoothly too.
await store('reset()');
await burst('burst-reset', 4, 140);

await cdp('Target.closeTarget', { targetId });
ws.close();
console.log('done');

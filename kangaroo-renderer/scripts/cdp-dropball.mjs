// Drop-ball animation smoke check: click the first column after an idle gap
// and capture a burst to confirm the stack-fall animates (delta clamp fix).
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
await send('Emulation.setDeviceMetricsOverride', {
  width: 860,
  height: 1150,
  deviceScaleFactor: 1,
  mobile: false,
});

fs.mkdirSync(OUT_DIR, { recursive: true });
const shot = async (name) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(data, 'base64'));
  console.log('saved', name);
};

await send('Page.navigate', { url: `${BASE}/?problem=MK_G1_2_2025_DropBall` });
await sleep(4000);
await sleep(3000); // idle gap so the old huge-delta bug would reproduce

// Click the top ball of the first column. Reference shots are downscaled to
// 766px wide; scale up to the real 860px viewport (factor ~1.123).
const click = { x: 261, y: 337 };
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...click });
await send('Input.dispatchMouseEvent', {
  type: 'mousePressed', button: 'left', clickCount: 1, ...click,
});
await send('Input.dispatchMouseEvent', {
  type: 'mouseReleased', button: 'left', clickCount: 1, ...click,
});
for (let i = 0; i < 4; i++) {
  await shot(`burst-drop-${i}`);
  await sleep(120);
}

await cdp('Target.closeTarget', { targetId });
ws.close();
console.log('done');

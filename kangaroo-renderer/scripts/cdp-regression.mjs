// One-off regression pass: load every other existing problem and screenshot it.
import fs from 'node:fs';

const CDP_PORT = process.env.CDP_PORT ?? '9345';
const BASE = process.argv[2] ?? 'http://[::1]:5183';
const OUT_DIR = process.argv[3] ?? 'verify-shots';
const PROBLEMS = ['MK_G1_2_2021_GearRatio', 'MK_G1_2_2025_DropBall', 'MK_G5_6_2020_Cube3x3x3'];

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
for (const id of PROBLEMS) {
  await send('Page.navigate', { url: `${BASE}/?problem=${id}` });
  await sleep(4000);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${OUT_DIR}/regress-${id}.png`, Buffer.from(data, 'base64'));
  console.log('saved', id);
}
await cdp('Target.closeTarget', { targetId });
ws.close();
console.log('done');

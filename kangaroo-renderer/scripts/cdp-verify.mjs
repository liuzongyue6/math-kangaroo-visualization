// Temporary end-to-end smoke check: drives the dev server through headless
// Edge via CDP (no extra npm deps; uses Node's built-in fetch + WebSocket)
// and captures screenshots of both reworked problems.
import fs from 'node:fs';

const CDP_PORT = process.env.CDP_PORT ?? '9345';
const BASE = process.argv[2] ?? 'http://localhost:5173';
const OUT_DIR = process.argv[3] ?? 'verify-shots';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getBrowserWS() {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
  return (await res.json()).webSocketDebuggerUrl;
}

function makeCDP(ws) {
  let nextId = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });
  return (method, params = {}, sessionId) => {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  };
}

async function main() {
  const ws = new WebSocket(await getBrowserWS());
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  const cdp = makeCDP(ws);

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

  const goto = async (url) => {
    await send('Page.navigate', { url });
    await sleep(4000);
  };
  const evaljs = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  };
  const shot = async (name) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(data, 'base64'));
    console.log('saved', name);
  };
  const store = (call) => evaljs(`window.__problemStore.getState().${call}`);

  // --- Animal Jump Race ---
  await goto(`${BASE}/?problem=MK_G5_6_2023_AnimalJumpRace`);
  await shot('jump-default-20');
  await store(`setParam('num_nodes', 12)`);
  await sleep(900);
  await shot('jump-12-spaces');
  for (let i = 0; i < 3; i++) {
    await store('stepTurn()');
    await sleep(750);
  }
  await shot('jump-12-after-3-turns');

  // --- Cube Net Fold ---
  await goto(`${BASE}/?problem=MK_G5_6_2023_CubeNetFold`);
  await shot('fold-0');
  await store('setFoldAngle(45)');
  await sleep(700);
  await shot('fold-45');
  await store('setFoldAngle(90)');
  await sleep(700);
  await shot('fold-90');
  await store('setFoldAngle(-90)');
  await sleep(700);
  await shot('fold-neg90');

  await cdp('Target.closeTarget', { targetId });
  ws.close();
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

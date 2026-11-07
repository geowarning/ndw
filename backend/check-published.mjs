import { assertSnapshotReady } from './publish-snapshot.mjs';

const base = new URL(process.argv[2]);
// Pages may report HTTP for a custom domain even when its HTTPS endpoint works.
if (base.protocol === 'http:') base.protocol = 'https:';
if (base.protocol !== 'https:') throw Error('Expected HTTPS deployment URL');
let failure;
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    const url = new URL('public-data/warnings.json', base);
    url.searchParams.set('health', Date.now());
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw Error('Published snapshot returned HTTP ' + response.status);
    console.log('Published snapshot healthy:', assertSnapshotReady(await response.json()));
    failure = null;
    break;
  } catch (error) {
    failure = error;
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
if (failure) throw failure;

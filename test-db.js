const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

const p = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Tpxjf7u6DCtH@ep-withered-shadow-a4gnj7n7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  connectionTimeoutMillis: 15000
});

p.query('SELECT 1 as test')
  .then(r => { console.log('SUCCESS', r.rows); p.end(); })
  .catch(e => { console.error('FAIL', e.message); p.end(); });

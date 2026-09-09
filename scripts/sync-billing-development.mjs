import fs from 'node:fs';
import { spawn } from 'node:child_process';
import dotenv from 'dotenv';
const values = dotenv.parse(fs.readFileSync('.env.local'));
const project = JSON.parse(fs.readFileSync('.vercel/project.json','utf8'));
if (project.projectName !== 'sakatl' || !values.STRIPE_SECRET_KEY?.startsWith('sk_test_')) throw new Error('Expected Sakatl test configuration.');
const keys = ['STRIPE_SECRET_KEY','NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY','STRIPE_PRICE_MONTHLY','STRIPE_PRICE_ANNUAL','STRIPE_TAX_RATE','STRIPE_PORTAL_CONFIGURATION','APP_URL','BILLING_ENABLED','BILLING_LIVE_READY'];
for (const key of keys) {
  if (!values[key]) continue;
  await new Promise((resolve,reject)=>{
    const child = spawn('npx.cmd',['vercel','env','add',key,'development','--force','--yes','--project',project.projectId],{shell:true,windowsHide:true,stdio:['pipe','pipe','pipe']});
    child.stdin.end(values[key]);
    child.stdout.resume(); child.stderr.resume();
    child.on('error',reject);
    child.on('exit',code=>code===0?resolve():reject(new Error(`Could not synchronize ${key}; exit ${code}`)));
  });
  console.log(`Development configured: ${key}`);
}
// The CLI listener signing secret is local and must never become a deployed webhook secret.

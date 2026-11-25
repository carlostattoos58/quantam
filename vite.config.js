import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'server_db.json');

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading server_db.json:', e);
  }
  return { members: [], keys: [] };
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing server_db.json:', e);
  }
}

function localSyncPlugin() {
  return {
    name: 'local-sync-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url.split('?')[0];

        // 1. GET /api/members
        if (req.method === 'GET' && url === '/api/members') {
          const db = readDb();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(db.members || []));
          return;
        }

        // 2. POST /api/members
        if (req.method === 'POST' && url === '/api/members') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const newMember = JSON.parse(body);
              const db = readDb();
              db.members = db.members || [];
              const idx = db.members.findIndex(m => m.email?.toLowerCase() === newMember.email?.toLowerCase());
              if (idx >= 0) {
                db.members[idx] = { ...db.members[idx], ...newMember };
              } else {
                db.members.unshift(newMember);
              }
              writeDb(db);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, member: newMember }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 3. GET /api/keys
        if (req.method === 'GET' && url === '/api/keys') {
          const db = readDb();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(db.keys || []));
          return;
        }

        // 4. POST /api/keys
        if (req.method === 'POST' && url === '/api/keys') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const db = readDb();
              db.keys = db.keys || [];

              if (Array.isArray(payload)) {
                payload.forEach(item => {
                  const idx = db.keys.findIndex(k => k.key_value === item.key_value);
                  if (idx >= 0) {
                    db.keys[idx] = { ...db.keys[idx], ...item };
                  } else {
                    db.keys.unshift(item);
                  }
                });
              } else if (payload?.key_value) {
                const idx = db.keys.findIndex(k => k.key_value === payload.key_value);
                if (idx >= 0) {
                  db.keys[idx] = { ...db.keys[idx], ...payload };
                } else {
                  db.keys.unshift(payload);
                }
              }

              writeDb(db);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 5. POST /api/balances
        if (req.method === 'POST' && url === '/api/balances') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { email, id, balance } = JSON.parse(body);
              const db = readDb();
              db.members = db.members || [];
              const idx = db.members.findIndex(m =>
                (email && m.email?.toLowerCase() === email.toLowerCase()) ||
                (id && m.id === id)
              );
              if (idx >= 0) {
                db.members[idx].balance = parseFloat(balance) || 0;
                writeDb(db);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, member: db.members[idx] }));
              } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Member not found' }));
              }
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localSyncPlugin()],
});

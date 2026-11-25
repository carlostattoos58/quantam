// Cross-window and server sync service for Quantam EA v5

export async function fetchServerMembers() {
  try {
    const res = await fetch('/api/members');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('quantam_all_members', JSON.stringify(data));
        return data;
      }
    }
  } catch {}

  try {
    const local = JSON.parse(localStorage.getItem('quantam_all_members') || '[]');
    if (local.length > 0) return local;
  } catch {}

  return [];
}

export async function saveServerMember(member) {
  try {
    const local = JSON.parse(localStorage.getItem('quantam_all_members') || '[]');
    const idx = local.findIndex(m => m.email?.toLowerCase() === member.email?.toLowerCase());
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...member };
    } else {
      local.unshift(member);
    }
    localStorage.setItem('quantam_all_members', JSON.stringify(local));
  } catch {}

  try {
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
  } catch {}
}

export async function fetchServerKeys() {
  try {
    const res = await fetch('/api/keys');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('quantam_admin_keys', JSON.stringify(data));
        return data;
      }
    }
  } catch {}

  try {
    const local = JSON.parse(localStorage.getItem('quantam_admin_keys') || '[]');
    if (local.length > 0) return local;
  } catch {}

  return [];
}

export async function saveServerKey(keyOrKeys) {
  try {
    const local = JSON.parse(localStorage.getItem('quantam_admin_keys') || '[]');
    const items = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    items.forEach(k => {
      const idx = local.findIndex(x => x.key_value === k.key_value);
      if (idx >= 0) {
        local[idx] = { ...local[idx], ...k };
      } else {
        local.unshift(k);
      }
    });
    localStorage.setItem('quantam_admin_keys', JSON.stringify(local));
  } catch {}

  try {
    await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keyOrKeys)
    });
  } catch {}
}

export async function updateServerBalance(member, newBalance) {
  const parsed = parseFloat(newBalance) || 0;
  const email = member.email || member;

  if (email) {
    localStorage.setItem('quantam_balance_' + email, parsed.toString());
  }
  if (member.id) {
    localStorage.setItem('quantam_balance_' + member.id, parsed.toString());
  }

  // Update in local members list
  try {
    const local = JSON.parse(localStorage.getItem('quantam_all_members') || '[]');
    const idx = local.findIndex(m => m.email?.toLowerCase() === email.toLowerCase());
    if (idx >= 0) {
      local[idx].balance = parsed;
      localStorage.setItem('quantam_all_members', JSON.stringify(local));
    }
  } catch {}

  try {
    await fetch('/api/balances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, id: member.id, balance: parsed })
    });
  } catch {}

  window.dispatchEvent(new Event('quantam_balance_updated'));
}

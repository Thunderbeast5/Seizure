import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';

interface SendSosParams {
  userName: string;
  contactName?: string;
  addressHint?: string; // optional pre-known place name
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

async function getCurrentCoordinates(): Promise<Coordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  } catch (e) {
    console.warn('SOS: location fetch failed', e);
    return null;
  }
}

function formatSosMessage(userName: string, coords: Coordinates | null, addressHint?: string, contactName?: string): string {
  const header = '🚨 EMERGENCY ALERT 🚨';
  const who = `\n\nUser: ${userName}`;
  let locationBlock = '';
  if (coords) {
    const { latitude, longitude } = coords;
    const mapsQuery = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const mapsDir = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    locationBlock = `\nLocation: ${addressHint || 'Unknown'}\nCoordinates: ${latitude}, ${longitude}\n\n📍 View location: ${mapsQuery}\n🚗 Get directions: ${mapsDir}`;
  } else {
    locationBlock = `\nLocation: Unknown (location permission not granted)`;
  }
  const status = `\nSafety Zone Status: Outside`;
  const footer = contactName ? `\n\nPlease respond immediately!\n\nContact: ${contactName}` : `\n\nPlease respond immediately!`;
  return `${header}${who}${locationBlock}${status}${footer}`;
}

async function fetchSmsCapableDeviceIden(apiKey: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.pushbullet.com/v2/devices', {
      headers: { 'Access-Token': apiKey },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const devices: any[] = json?.devices || [];
    const phone = devices.find((d: any) => d?.active && d?.has_sms);
    return phone?.iden || null;
  } catch {
    return null;
  }
}

function getDefaultCountryCode(): string {
  const extra: any = (Constants as any).expoConfig?.extra || (Constants as any).manifest?.extra || {};
  const code = (extra.DEFAULT_COUNTRY_CODE || '+91').toString();
  return code.startsWith('+') ? code : `+${code}`;
}

function normalizePhoneNumber(raw: string): string {
  const trimmed = (raw || '').replace(/\s|-/g, '');
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('+')) return trimmed;
  // If it starts with 0, drop leading 0 (local format)
  const dropped = trimmed.replace(/^0+/, '');
  return `${getDefaultCountryCode()}${dropped}`;
}

async function sendPushbulletSms(number: string, message: string): Promise<{ ok: boolean; status?: number; responseText?: string; usedDeviceIden?: string; }> {
  try {
    const extra: any = (Constants as any).expoConfig?.extra || (Constants as any).manifest?.extra || {};
    const apiKey: string | undefined = extra.PUSHBULLET_API_KEY;
    const deviceIden: string | undefined = extra.PUSHBULLET_DEVICE_IDEN;
    if (!apiKey || !deviceIden) {
      console.error('SOS: Missing Pushbullet config in app.json extra');
      return { ok: false };
    }

    const url = 'https://api.pushbullet.com/v2/texts';
    const e164 = normalizePhoneNumber(number);
    const body = JSON.stringify({
      data: {
        target_device_iden: deviceIden,
        addresses: [e164],
        message,
      },
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Access-Token': apiKey,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (res.ok) {
      return { ok: true, usedDeviceIden: deviceIden };
    }

    // If initial attempt failed, try to auto-discover an SMS-capable device and retry once
    const firstText = await res.text();
    const fallbackIden = await fetchSmsCapableDeviceIden(apiKey);
    if (fallbackIden && fallbackIden !== deviceIden) {
      const retryBody = JSON.stringify({
        data: {
          target_device_iden: fallbackIden,
          addresses: [e164],
          message,
        },
      });
      const retryRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Access-Token': apiKey,
          'Content-Type': 'application/json',
        },
        body: retryBody,
      });
      if (retryRes.ok) {
        return { ok: true, usedDeviceIden: fallbackIden };
      }
      const retryText = await retryRes.text();
      console.warn('SOS: Pushbullet SMS failed (retry)', retryRes.status, retryText);
      return { ok: false, status: retryRes.status, responseText: retryText };
    }

    console.warn('SOS: Pushbullet SMS failed', res.status, firstText);
    return { ok: false, status: res.status, responseText: firstText };
  } catch (e) {
    console.error('SOS: Pushbullet SMS error', e);
    return { ok: false };
  }
}

export const sosService = {
  async sendSosToNumbers(numbers: string[], params: SendSosParams): Promise<{ sent: string[]; failed: Array<{ number: string; status?: number; responseText?: string; reason?: string; }>; message: string; coords: Coordinates | null; }> {
    const coords = await getCurrentCoordinates();
    const message = formatSosMessage(params.userName, coords, params.addressHint, params.contactName);
    const sent: string[] = [];
    const failed: Array<{ number: string; status?: number; responseText?: string; reason?: string; }> = [];

    // 1) Try device SMS first via expo-sms (preferred)
    try {
      const smsAvailable = await SMS.isAvailableAsync();
      if (smsAvailable) {
        for (const raw of numbers) {
          const e164 = normalizePhoneNumber(raw);
          try {
            const result = await SMS.sendSMSAsync([e164], message);
            if (result?.result === 'sent' || result?.result === 'unknown') {
              sent.push(raw);
            } else {
              failed.push({ number: raw, reason: `composer:${result?.result || 'cancelled'}` });
            }
          } catch (e: any) {
            failed.push({ number: raw, reason: 'sms_error' });
          }
        }
      } else {
        // SMS not available; fall back entirely to Pushbullet below
      }
    } catch {
      // Ignore and fall back
    }

    // 2) For any failures (or if SMS unavailable), try Pushbullet as backup
    const remaining = numbers.filter(n => !sent.includes(n));
    if (remaining.length > 0) {
      for (const number of remaining) {
        const result = await sendPushbulletSms(number, message);
        if (result.ok) {
          sent.push(number);
          // remove any prior failed record for this number
          const idx = failed.findIndex(f => f.number === number);
          if (idx !== -1) failed.splice(idx, 1);
        } else {
          // add or update failed info
          const existing = failed.find(f => f.number === number);
          if (existing) {
            existing.status = result.status;
            existing.responseText = result.responseText;
          } else {
            failed.push({ number, status: result.status, responseText: result.responseText });
          }
        }
      }
    }

    return { sent, failed, message, coords };
  },
};

export type { Coordinates };



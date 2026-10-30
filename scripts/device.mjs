// Reads the simulator's name and iOS version from argent, so every results
// file records the device it was actually run on.
import { execFileSync } from 'node:child_process';

export const platformOf = (udid) => (/^[0-9A-F]{8}-[0-9A-F]{4}-/i.test(udid) ? 'ios' : 'android');

function androidInfo(serial) {
  const prop = (p) => execFileSync('adb', ['-s', serial, 'shell', 'getprop', p], { encoding: 'utf8' }).trim();
  const avd = prop('ro.boot.qemu.avd_name');
  return { name: avd ? `${avd.replace(/_/g, ' ')} emulator` : prop('ro.product.model'), runtime: `Android ${prop('ro.build.version.release')} (API ${prop('ro.build.version.sdk')})` };
}

export function deviceInfo(udid) {
  if (platformOf(udid) === 'android') return androidInfo(udid);
  const { devices } = JSON.parse(execFileSync('argent', ['run', 'list-devices', '--json'], { encoding: 'utf8', maxBuffer: 64 << 20 }));
  const d = devices.find((x) => x.udid === udid);
  if (!d) throw new Error(`simulator ${udid} not in argent list-devices`);
  // com.apple.CoreSimulator.SimRuntime.iOS-27-0 → iOS 27.0
  const m = d.runtime.match(/SimRuntime\.(\w+)-(\d+)-(\d+)/);
  return { name: d.name, runtime: m ? `${m[1]} ${m[2]}.${m[3]}` : d.runtime };
}

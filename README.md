# lib-net-tree

A terminal version of `net_tree.py` for [HackHub](https://store.steampowered.com/app/2980270/HackHub__Ultimate_Hacker_Simulator/).\
It lists every device on a network as a table or as JSON, so you can use it from your own scripts.

```
$ net_tree 178.203.253.95
Generating network tree...
+-----------------------+-------------+----------+----------------------+-------------+
| ip                    | lanIp       | type     | name                 | parent      |
+-----------------------+-------------+----------+----------------------+-------------+
| 178.203.253.95        | 192.168.1.1 | ROUTER   |                      |             |
| ├─ 238.236.15.159     | 192.168.1.2 | SPLITTER |                      | 192.168.1.1 |
| │  ├─ 187.181.92.197  | 192.168.1.3 | HOST     |                      | 192.168.1.2 |
| │  └─ 121.160.143.252 | 192.168.1.7 | PRINTER  | MODEL: Sharp MX-3071 | 192.168.1.2 |
| └─ 47.35.131.200      | 192.168.1.8 | SPLITTER |                      | 192.168.1.1 |
|    └─ 130.94.197.92   | 192.168.1.9 | PRINTER  | MODEL: Zebra GX430t  | 192.168.1.8 |
+-----------------------+-------------+----------+----------------------+-------------+
```

## Features

- Accepts any IP in the network, not only the router's. A local `192.168.1.x` address maps your own Wi-Fi network.
- Shows the same information as the NetTree window, in the same tree order.
- Plays fair: it needs `python3`, takes as long as `net_tree.py`, and counts for the same quest objectives.
- Documented in the in-game Handbook, under **FrekLib**.

## Usage

```
apt-get install python3
apt-get install net_tree

net_tree <ip>          # table
net_tree <ip> -json    # JSON
```

### In scripts

```typescript
interface NetTreeEntry {
    ip: string;
    lanIp: string | null;
    type: string;          // ROUTER, DEVICE, FIREWALL, SPLITTER or PRINTER
    nameType: "ESSID" | "MODEL" | "HOST" | null; // what name is, null when there is none
    name: string | null;   // Wi-Fi name, printer model, or host name
    parent: string | null; // LAN IP of the parent, null for the router
}

const out = await Shell.Process.exec("net_tree 178.203.253.95 -json", { silent: true });
const devices: NetTreeEntry[] = JSON.parse(out);

const printers = devices.filter(d => d.type === "PRINTER");
```

## Building

Requires [Bun](https://bun.sh).

```sh
bun install
bun run build
```

Copy `dist/mod.js` and `dist/manifest.json` into `<HackHub>/mods/lib-net-tree/`, then restart the game.

## License

[MIT](LICENSE). Fork it, change it, and build on it!

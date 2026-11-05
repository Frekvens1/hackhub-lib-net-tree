import { Handbook } from "@hotbunny/hackhub-content-sdk";

/** Shared Handbook category for Frek mods. Other mods add articles to it by using the same name. */
const CATEGORY = "FrekLib";
const ENTRY_ID = "freklib-net-tree";

const CONTENT = `### Lib - net_tree

Lists every device on a network: the router and each host behind it, with their
public IP, LAN IP, type, name and the LAN IP of their parent. Works from any
IP in the network, not only the router's.

### Install

Needs python3, like \`net_tree.py\`:

\`\`\`
apt-get install python3
apt-get install net_tree
\`\`\`

### Terminal

\`\`\`
net_tree <ip>          # table
net_tree <ip> -json    # JSON array
\`\`\`

A local \`192.168.1.x\` address maps the Wi-Fi network you are connected to.
The root router has no \`parent\`. Running it counts as running
\`python3 net_tree.py\` for quest objectives, and it takes the same time.

### In scripts

Run the command with \`-json\` and parse the output:

\`\`\`typescript
interface NetTreeEntry {
    ip: string;
    lanIp: string | null;
    type: string; // ROUTER, DEVICE, FIREWALL, SPLITTER or PRINTER
    nameType: "ESSID" | "MODEL" | "HOST" | null; // what name is, null when there is none
    name: string | null; // Wi-Fi name, printer model, or host name
    parent: string | null; // LAN IP of the parent, null for the router
}

const output = await Shell.Process.exec("net_tree 44.154.37.64 -json", { silent: true });
const devices: NetTreeEntry[] = JSON.parse(output);

for (const d of devices) {
  println(d.ip + " | " + d.lanIp + " | " + d.type + " | parent: " + (d.parent ?? "-"));
}
\`\`\`

### Find the router

\`\`\`typescript
const router = devices.find(d => d.parent === null);
\`\`\`
`;

export function registerHandbook(): void {
    Handbook.registerEntry({ id: ENTRY_ID, category: CATEGORY, title: "net_tree", content: CONTENT, order: 10 });
}

export function unregisterHandbook(): void {
    Handbook.unregisterEntry(ENTRY_ID);
}

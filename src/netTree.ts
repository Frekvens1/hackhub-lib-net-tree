import { Network, type SubnetInfo } from "@hotbunny/hackhub-content-sdk";

/** One device in a network, as `net_tree -json` prints it. */
export interface NetTreeEntry {
    /** Public IP of the device. */
    ip: string;
    /** LAN IP of the device. */
    lanIp: string | null;
    /** `ROUTER`, `DEVICE`, `FIREWALL`, `SPLITTER` or `PRINTER`. */
    type: string;
    /** The hostname as NetTree GUI labels it. Null when there is no name. */
    nameType: NameType | null;
    /** The router's Wi-Fi name, the printer's model, or the host's name (sometimes a person's). */
    name: string | null;
    /** LAN IP of the parent device. Null for the router at the top, or if the parent has no LAN IP. */
    parent: string | null;
}

export type NameType = "ESSID" | "MODEL" | "HOST";

/** A device plus the tree lines drawn before its IP, e.g. "│  ├─ ". */
export interface NetTreeRow {
    entry: NetTreeEntry;
    branch: string;
}

/** The game's IPv4 check (`Network.IsIp`). */
const IPV4 = /^(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(?:\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$/;

export const isIp = (ip: string): boolean => IPV4.test(ip);

/** The NetTree GUI's label for a device's name, which depends only on its type. */
const nameTypeOf = (type: string): NameType =>
    type === "ROUTER" ? "ESSID" : type === "PRINTER" ? "MODEL" : "HOST";

/**
 * The game's `GetSubnetRouter`: the subnet itself if it is a router, otherwise
 * the nearest router above it, or null if there is none.
 *
 * The SDK hides each subnet's parent, so this rebuilds the parent links by
 * asking every subnet for its children, then climbs them.
 */
function findRouter(start: SubnetInfo): SubnetInfo | null {
    if (start.type === "ROUTER") return start;

    const parentOf = new Map<string, SubnetInfo>();
    for (const subnet of Network.getAllSubnets()) {
        for (const child of Network.getChildSubnets(subnet.ip)) parentOf.set(child.ip, subnet);
    }

    const seen = new Set([start.ip]);
    for (let up = parentOf.get(start.ip); up && !seen.has(up.ip); up = parentOf.get(up.ip)) {
        if (up.type === "ROUTER") return up;
        seen.add(up.ip);
    }
    return null;
}

/**
 * What the game's `net_tree.py` shows for `ip`: the router `ip` sits behind and
 * every device below it, depth-first. A local 192.168.1.x address means the
 * Wi-Fi network the player is connected to. Null when there is no such router.
 */
export function getNetTree(ip: string): NetTreeRow[] | null {
    if (ip.startsWith("192.168.1.")) ip = Network.getConnectedWifi()?.ip ?? ip;

    const start = Network.getSubnet(ip);
    const router = start && findRouter(start);
    if (!router) return null;

    const rows: NetTreeRow[] = [];
    const visited = new Set<string>();
    const walk = (s: SubnetInfo, parent: SubnetInfo | null, branch: string, indent: string) => {
        visited.add(s.ip);
        const name = s.hostname || null;
        rows.push({
            branch,
            entry: {
                ip: s.ip,
                lanIp: s.lanIp ?? null,
                type: s.type,
                nameType: name ? nameTypeOf(s.type) : null,
                name,
                parent: parent?.lanIp ?? null,
            },
        });

        const children = Network.getChildSubnets(s.ip).filter(c => !visited.has(c.ip));
        children.forEach((child, i) => {
            const last = i === children.length - 1;
            walk(child, s, indent + (last ? "└─ " : "├─ "), indent + (last ? "   " : "│  "));
        });
    };
    walk(router, null, "", "");
    return rows;
}

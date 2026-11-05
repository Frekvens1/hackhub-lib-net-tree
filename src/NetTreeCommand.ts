import { Command, Events, RegisterCommand, Shell, type CommandTools, type FileInfo } from "@hotbunny/hackhub-content-sdk";
import { getNetTree, isIp } from "./netTree";

/** How long the game's net_tree.py takes before showing its chart. */
const GENERATE_DELAY_MS = 1000;

/** The file `python3 net_tree.py` runs, as the game reports it in `Python3.ExecFile`. */
const NET_TREE_FILE = {
    name: "net_tree",
    extension: "py",
    data: { cmd: "NetTree" },
} as unknown as FileInfo;

/** Type labels the NetTree GUI uses in place of the raw type. JSON keeps the raw type. */
const TYPE_LABELS: Record<string, string> = { DEVICE: "HOST" };

const isJsonFlag = (arg: string) => /^--?json$/i.test(arg);

/**
 * net_tree [ip address] [-json]
 *
 * The game's `python3 net_tree.py`, with the chart printed as a table, or as a
 * JSON array of NetTreeEntry with -json (or --json). Same requirements, checks,
 * timing and events as the original.
 */
@RegisterCommand
export class NetTreeCommand extends Command {
    CommandName = "net_tree";
    // Hidden until the player runs `apt-get install net_tree`.
    PackageName = "net_tree";
    Description = "List all devices on a network as a tree: ip, lanIp, type, name, parent";
    Autocomplete = [
        { label: "net_tree", type: "STRING" as const },
        { label: "<ip>", type: "IP" as const },
    ];

    async Run(tools: CommandTools) {
        if (!Shell.isPackageInstalled("python3")) {
            tools.printError("net_tree requires python3. Install it with: apt-get install python3");
            return;
        }

        const args = tools.getArgs();
        const toolArgs = args.filter(a => !isJsonFlag(a));
        await this.runNetTree(tools, toolArgs, args.some(isJsonFlag));

        // python3 fires this after every run of a tool file, whatever the result.
        Events.emit("Python3.ExecFile", { file: NET_TREE_FILE, args: toolArgs });
    }

    /** The body of the game's net_tree.py, printing text instead of opening the GUI. */
    private async runNetTree(tools: CommandTools, args: string[], json: boolean) {
        if (args.length !== 1) {
            tools.printError("Usage: net_tree [ip address] [-json]");
            return;
        }
        const [ip] = args;
        if (!isIp(ip)) {
            tools.printError("Error: Invalid ip address.");
            return;
        }
        const rows = getNetTree(ip);
        if (!rows) {
            tools.printError("Error: Subnet not found.");
            return;
        }

        // Progress text is left out of -json so scripts get clean JSON.
        if (!json) tools.println("Generating network tree...");
        await tools.sleep(GENERATE_DELAY_MS);

        if (json) {
            tools.println(JSON.stringify(rows.map(r => r.entry)));
        } else {
            tools.printTable(
                ["ip", "lanIp", "type", "name", "parent"],
                rows.map(({ entry: e, branch }) => [
                    branch + e.ip,
                    e.lanIp ?? "",
                    TYPE_LABELS[e.type] ?? e.type,
                    e.nameType ? `${e.nameType}: ${e.name}` : "",
                    e.parent ?? "",
                ]),
            );
        }

        // Quests listen for this to complete their "run net_tree.py" objectives.
        Events.emit("Python3.NetTree", { ip });
    }
}

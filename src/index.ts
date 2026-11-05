import { Bootstrap, RegisterModPackage } from "@hotbunny/hackhub-content-sdk";

@RegisterModPackage
export default class LibNetTree extends Bootstrap {

    Settings = [
        {
            key: "difficulty",
            label: "Difficulty",
            type: "select" as const,
            default: "normal",
            options: [
                { label: "Easy", value: "easy" },
                { label: "Normal", value: "normal" },
                { label: "Hard", value: "hard" },
            ],
        },
        {
            key: "showHints",
            label: "Show Hints",
            type: "toggle" as const,
            default: true,
        },
    ];

    async OnModPackageLoaded() {
        console.log("[lib-net-tree] lib-net-tree loaded successfully!");
    }

    OnModPackageUnloaded() {
        console.log("[lib-net-tree] lib-net-tree unloaded.");
    }
}

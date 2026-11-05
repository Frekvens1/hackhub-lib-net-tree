import { Bootstrap, RegisterModPackage } from "@hotbunny/hackhub-content-sdk";
import "./NetTreeCommand";
import { registerHandbook, unregisterHandbook } from "./handbook";

@RegisterModPackage
export default class LibNetTree extends Bootstrap {
    OnModPackageLoaded() {
        registerHandbook();
    }

    OnModPackageUnloaded() {
        unregisterHandbook();
    }
}

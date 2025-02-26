import { findServers } from "findServers.js";

/** @param {NS} ns **/
export async function main(ns) {
    const servers = findServers(ns);
    
    for (const server of servers) {
        if (ns.hasRootAccess(server)) {
            ns.killall(server);
            ns.tprint(`🛑 ${server}에서 모든 스크립트를 종료했습니다.`);
        }
    }
}

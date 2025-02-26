import { findServers } from "findServers.js";
import { calculateScore } from "calculateScore.js";

/** @param {NS} ns **/
export function getBestTarget(ns) {
    const servers = findServers(ns);
    let bestServer = null;
    let bestScore = -Infinity;

    for (const server of servers) {
        if (server === "home") continue;
        if (!ns.hasRootAccess(server) || ns.getServer(server).moneyMax === 0) continue;

        const score = calculateScore(ns, server);
        if (score > bestScore) {
            bestScore = score;
            bestServer = server;
        }
    }
    return { server: bestServer, score: bestScore };
    
}

/** @param {NS} ns **/
export async function main(ns) {
    const bestTarget = getBestTarget(ns);

    if (!bestTarget.server) {
        ns.tprint("❌ 적절한 해킹 대상이 없습니다.");
        return;
    }

    ns.tprint(`🎯 최고의 해킹 대상: ${bestTarget.server}`);
    ns.tprint(`💰 해킹 점수: ${bestTarget.score.toFixed(2)}`);
}

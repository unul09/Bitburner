import { findServers } from "findServers.js";

/** @param {NS} ns **/
export function calculateScore(ns, server) {
    const player = ns.getPlayer();
    const serverInfo = ns.getServer(server);

    // 해킹 성공 확률
    const hackChance = ns.formulas.hacking.hackChance(serverInfo, player);
    // 해킹으로 얻는 예상 금액
    const hackMoney = ns.formulas.hacking.hackPercent(serverInfo, player) * serverInfo.moneyMax;
    // 성장률
    const growRate = ns.formulas.hacking.growPercent(serverInfo, 1, player);
    // 약화 속도
    const weakenTime = ns.formulas.hacking.weakenTime(serverInfo, player);

    // 점수 계산 (가중치는 필요에 따라 조정 가능)
    const score = (hackChance * hackMoney) / (weakenTime * (1 / growRate));

    return score;
}

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args.length < 1) {
        const servers = findServers(ns);
        for (const server of servers) {
            const score = calculateScore(ns, server);
            if (score == 0) {
              continue;
            }
            ns.tprint(`🔍 서버: ${server} | 💰 해킹 점수: ${score.toFixed(2)}`);
        }
        return;
    }

    const server = ns.args[0];
    const score = calculateScore(ns, server);
    
    ns.tprint(`🔍 서버: ${server}`);
    ns.tprint(`💰 해킹 점수: ${score.toFixed(2)}`);
}

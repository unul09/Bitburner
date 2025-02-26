import { getBestTarget } from "getBestTarget.js";
import { calculateRatio } from "calculateRatio.js";
import { findServers } from "findServers.js";

/** @param {NS} ns **/
export async function main(ns) {
    const player = ns.getPlayer();
    
    let currentTarget = null;
    let currentRatios = null;

    ns.tprint(`🚀 자동 해킹 시작!`);

    while (true) {
        const bestTarget = getBestTarget(ns);
        if (!bestTarget.server) {
            ns.tprint("❌ 적절한 해킹 대상이 없습니다. 10초 후 다시 시도...");
            await ns.sleep(10000);
            continue;
        }

        // 점수가 기존보다 20% 이상 높다면 변경, 아니면 유지
        if (currentTarget!=bestTarget || bestTarget.score > currentTarget.score * 1.2) {
            ns.tprint(`🎯 새로운 해킹 대상 선정: ${bestTarget.server} (점수: ${bestTarget.score.toFixed(2)})`);
            currentTarget = bestTarget;
        } else {
            ns.tprint(`✅ 기존 해킹 대상 유지: ${currentTarget.server} (점수: ${bestTarget.score.toFixed(2)})`); // 점수 표기는 갱신 
        }

        // 대상 서버의 최적 해킹 비율 계산
        const newRatios = calculateRatio(ns, currentTarget.server);
        if (!newRatios) {
            ns.tprint(`❌ ${currentTarget.server}의 비율을 계산할 수 없습니다. 10초 후 다시 시도...`);
            await ns.sleep(10000);
            continue;
        }

        // Ratio가 변경되지 않았다면 그대로 진행
        if (currentTarget!=bestTarget || JSON.stringify(currentRatios) !== JSON.stringify(newRatios)) {
            ns.tprint(`🔄 비율 변경 감지! 기존 실행 중인 작업을 종료 후 재실행.`);
            ns.scriptKill("hack.js", "home");
            ns.scriptKill("weaken.js", "home");
            ns.scriptKill("grow.js", "home");
            currentRatios = newRatios;
        } else {
            ns.tprint(`📊 동일한 비율 유지 - Weaken: ${currentRatios.weakenRatio}, Grow: ${currentRatios.growRatio}, Hack: ${currentRatios.hackRatio}`);
        }

        // 재평가 주기를 현재 타겟의 weaken 실행 시간으로 설정
        const interval = Math.max(30000, ns.formulas.hacking.weakenTime(ns.getServer(currentTarget.server), player) + 2000); // 최소 30초

        // 스크립트가 실행될 서버 목록
        const servers = findServers(ns).filter(server => ns.hasRootAccess(server));
        if (!servers.includes("home")) {
            servers.push("home");
        }

        for (const server of servers) {
            let availableRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
            if (availableRam < 1.75) continue; // RAM 부족하면 제외

            // home 이며 여분 공간 남겨둠
            if (server === "home") {
                availableRam *= 0.9;
            }

            const weakenRam = ns.getScriptRam("weaken.js");
            const growRam = ns.getScriptRam("grow.js");
            const hackRam = ns.getScriptRam("hack.js");

            const weakenThreads = Math.max(1, Math.floor((availableRam * currentRatios.weakenRatio) / weakenRam));
            const growThreads = Math.max(1, Math.floor((availableRam * currentRatios.growRatio) / growRam));
            const hackThreads = Math.max(1, Math.floor((availableRam * currentRatios.hackRatio) / hackRam));

            if (hackThreads > 0) ns.exec("hack.js", server, hackThreads, currentTarget.server);
            if (weakenThreads > 0) ns.exec("weaken.js", server, weakenThreads, currentTarget.server);
            if (growThreads > 0) ns.exec("grow.js", server, growThreads, currentTarget.server);
        }

        ns.tprint(`⏳ 다음 재평가까지 ${Math.round(interval / 1000)}초 대기...`);
        await ns.sleep(interval);
    }
}

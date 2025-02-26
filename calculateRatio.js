/** @param {NS} ns **/
export function calculateRatio(ns, server) {
    const serverInfo = ns.getServer(server);

    if (!serverInfo.hasAdminRights || serverInfo.moneyMax === 0) {
        ns.tprint(`❌ ${server} 서버는 해킹할 수 없습니다.`);
        return null;
    }

    const moneyFactor = serverInfo.moneyAvailable / serverInfo.moneyMax;
    const securityFactor = (serverInfo.hackDifficulty - serverInfo.minDifficulty) / serverInfo.minDifficulty;

    let weakenRatio, growRatio, hackRatio;

    if (moneyFactor < 0.5) {
        weakenRatio = 0.20;
        growRatio = 0.79;
        hackRatio = 0.01;
    } else if (securityFactor > 0.5) {
        weakenRatio = 0.50;
        growRatio = 0.40;
        hackRatio = 0.10;
    } else {
        weakenRatio = 0.30;
        growRatio = 0.50;
        hackRatio = 0.20;
    }

    return { weakenRatio, growRatio, hackRatio };
}

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args.length < 1) {
        ns.tprint("❌ 사용법: run calculateRatio.js [서버이름]");
        return;
    }

    const server = ns.args[0];
    const ratios = calculateRatio(ns, server);

    if (ratios) {
        ns.tprint(`📊 서버: ${server}`);
        ns.tprint(`🔻 Weaken 비율: ${ratios.weakenRatio}`);
        ns.tprint(`🌱 Grow 비율: ${ratios.growRatio}`);
        ns.tprint(`💰 Hack 비율: ${ratios.hackRatio}`);
    }
}

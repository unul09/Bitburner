/** @param {NS} ns **/
export async function main(ns) {
    const scripts = ["auto-stock-trader.js", "share-leftspace.js", "autoHack.js"];
    
    for (const script of scripts) {
        if (!ns.fileExists(script, "home")) {
            ns.tprint(`❌ ${script} 파일이 home에 없습니다.`);
            continue;
        }

        const ramRequired = ns.getScriptRam(script);
        const availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");

        if (availableRam >= ramRequired) {
            ns.exec(script, "home");
            ns.tprint(`✅ ${script} 실행 완료!`);
        } else {
            ns.tprint(`⚠️ RAM 부족으로 ${script} 실행 불가!`);
        }
    }
}

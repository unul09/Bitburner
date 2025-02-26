/** @param {NS} ns **/
export async function main(ns) {
    const home = "home";
    const shareScript = "share.js";

    // home 서버의 최대 RAM과 사용 중인 RAM 가져오기
    const maxRam = ns.getServerMaxRam(home);
    const usedRam = ns.getServerUsedRam(home);
    
    // 사용 가능한 RAM 계산
    const availableRam = maxRam - usedRam;

    // share.js의 한 스레드당 RAM 사용량 가져오기
    const shareRam = ns.getScriptRam(shareScript, home);

    // 실행 가능한 스레드 수 계산
    const threads = Math.floor(availableRam / shareRam / 4);

    if (threads > 0) {
        ns.tprint(`🚀 home에서 share.js 실행! (스레드: ${threads})`);
        ns.run(shareScript, threads);
    } else {
        ns.tprint("⚠️ home에서 실행할 RAM이 부족합니다.");
    }
}

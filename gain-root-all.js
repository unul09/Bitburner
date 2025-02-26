/** @param {NS} ns **/
export async function main(ns) {
    const servers = scanAllServers(ns);
    
    for (const server of servers) {
        await tryHackServer(ns, server);
    }
}

/**
 * 모든 서버를 스캔하여 리스트를 반환
 * @param {NS} ns
 * @returns {string[]} 서버 목록
 */
function scanAllServers(ns) {
    let servers = new Set(["home"]);
    let queue = ["home"];

    while (queue.length > 0) {
        let current = queue.shift();
        let found = ns.scan(current);
        
        for (let server of found) {
            if (!servers.has(server)) {
                servers.add(server);
                queue.push(server);
            }
        }
    }

    return Array.from(servers);
}

/**
 * 특정 서버에 루트 권한을 시도하고 해킹할 수 있도록 설정
 * @param {NS} ns
 * @param {string} target
 */
async function tryHackServer(ns, target) {
    if (ns.hasRootAccess(target)) {
        ns.tprint(`🔓 ${target}은 이미 루트 권한이 있습니다.`);
    } else {
        ns.tprint(`🚀 ${target}에 루트 권한을 시도 중...`);
        
        let portsRequired = ns.getServerNumPortsRequired(target);
        let openPorts = 0;

        if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(target); openPorts++; }
        if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(target); openPorts++; }
        if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(target); openPorts++; }
        if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(target); openPorts++; }
        if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(target); openPorts++; }

        if (openPorts >= portsRequired) {
            ns.nuke(target);
            ns.tprint(`✅ ${target}에 루트 권한을 획득했습니다!`);
        } else {
            ns.tprint(`❌ ${target}에 루트 권한을 얻지 못했습니다. (필요한 포트: ${portsRequired}, 현재 열린 포트: ${openPorts})`);
            return;
        }
    }

    if (ns.hasRootAccess(target)) {
        if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(target)) {
            ns.tprint(`💰 ${target} 해킹 시작!`);
            ns.exec("simple-hack.js", "home", 1, target); // 해킹을 실행하는 기본 스크립트
        } else {
            ns.tprint(`🔒 해킹 레벨이 부족합니다. (필요: ${ns.getServerRequiredHackingLevel(target)}, 현재: ${ns.getHackingLevel()})`);
        }

        // Source-File 4가 있을 경우에만 백도어 설치
        if (ns.singularity && ns.singularity.installBackdoor) {
            ns.tprint(`🚪 ${target}에 백도어 설치 시도 중...`);
            
            try {
                await ns.singularity.installBackdoor();
                ns.tprint(`✅ ${target}에 백도어 설치 완료!`);
            } catch (error) {
                ns.tprint(`⚠️ ${target}에 백도어 설치 실패: ${error}`);
            }
        } else {
            ns.tprint(`⚠️ Source-File 4가 없어 자동 백도어 설치가 불가능합니다. 직접 실행하세요:`);
            ns.tprint(`🔗 connect ${target}`);
            ns.tprint(`🛠 run backdoor`);
        }
    }
}

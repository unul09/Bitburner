// 'home'을 시작으로 네트워크에 연결된 모든 서버를 탐색하여 찾음

/** @param {NS} ns **/
export function findServers(ns) {
    let servers = new Set();
    let queue = ["home"];
    
    while (queue.length > 0) {
        let server = queue.pop();
        for (let connected of ns.scan(server)) {
            if (!servers.has(connected)) {
                servers.add(connected);
                queue.push(connected);
            }
        }
    }

    for (const purchasedServer of ns.getPurchasedServers()) {
        servers.add(purchasedServer);
    }

    return Array.from(servers);
}


/** @param {NS} ns **/
export async function main(ns) {
    const servers = findServers(ns);
    ns.tprint("🔍 발견된 서버 목록:\n" + servers.join("\n"));
}

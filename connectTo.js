/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args.length === 0) {
        ns.tprint("❌ 사용법: run connectTo.js <서버이름>");
        return;
    }

    const target = ns.args[0]; // 인자로 서버 이름 받기
    let path = findPath(ns, target);

    if (!path) {
        ns.tprint(`❌ 서버 "${target}" 를 찾을 수 없습니다.`);
        return;
    }

    // ns.tprint(`✅ "${target}" 서버로 연결 중...`);
    // for (const server of path) {
    //     ns.singularity.connect(server); // 순서대로 connect
    // }
    let command = path.map(server => `connect ${server}`).join("; ");
    ns.tprint(`✅ "${target}" 서버로 연결하려면 아래 명령어를 실행하세요:\n\n${command}`);
}

/**
 * BFS를 사용하여 home에서 target까지의 경로 찾기
 */
function findPath(ns, target) {
    let queue = [["home"]];
    let visited = new Set();

    while (queue.length > 0) {
        let path = queue.shift();
        let current = path[path.length - 1];

        if (current === target) return path;

        visited.add(current);
        let neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push([...path, neighbor]);
            }
        }
    }
    return null; // 경로 없음
}

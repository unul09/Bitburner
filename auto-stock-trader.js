/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    ns.print("🔍 주식 자동 매매 시작...");

    if (!ns.stock.hasTIXAPIAccess()) {
        ns.tprint("❌ TIX API가 없습니다! 먼저 업그레이드하세요.");
        return;
    }
    if (!ns.stock.has4SDataTIXAPI()) {
        ns.tprint("⚠️ 4S Market Data TIX API가 없습니다. 예측 기능이 제한됩니다.");
    }

    const investPercentage = 0.8; // 투자할 자본 비율 (80%)
    const sellThreshold = 0.55;   // 매도 기준 (예측 55% 미만 시 매도)
    const buyThreshold = 0.6;     // 매수 기준 (예측 60% 이상 시 매수)
    const minInvestment = 5000000; // 최소 투자 금액 설정 (너무 적은 거래 방지) 5m

    while (true) {
        ns.clearLog(); // 로그 정리
        const stocks = ns.stock.getSymbols();
        let myMoney = ns.getServerMoneyAvailable("home");
        let investMoney = myMoney * investPercentage;

        for (const sym of stocks) {
            const forecast = ns.stock.getForecast(sym);
            const maxShares = ns.stock.getMaxShares(sym);
            const [ownedShares, avgPrice] = ns.stock.getPosition(sym);
            const price = ns.stock.getPrice(sym);
            
            if (ownedShares > 0) { // 이미 보유한 주식
                const potentialProfit = price - avgPrice;
                if (forecast < sellThreshold) {
                    ns.stock.sellStock(sym, ownedShares);
                    ns.print(`📉 [매도] ${sym} ${ownedShares}주, 가격: ${price.toFixed(2)}, 예상 이익: ${potentialProfit.toFixed(2)*ownedShares}`);
                }
            } else { // 새로운 주식 매수
                if (forecast > buyThreshold && investMoney > minInvestment) {
                    const sharesToBuy = Math.floor((investMoney / price) / 5);
                    if (sharesToBuy > 0 && sharesToBuy <= maxShares) {
                        ns.stock.buyStock(sym, sharesToBuy);
                        ns.print(`📈 [매수] ${sym} ${sharesToBuy}주, 가격: ${price.toFixed(2)}`);
                    }
                }
            }
        }
        await ns.stock.nextUpdate();
    }
}

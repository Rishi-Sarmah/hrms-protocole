"use strict";
/**
 * Serializes a Firestore session document into a natural-language text summary
 * suitable for generating vector embeddings.
 *
 * The quality of this serialization directly determines the quality of
 * vector similarity search results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeSession = serializeSession;
function formatNumber(n) {
    if (n === 0)
        return "0";
    if (Math.abs(n) >= 1_000_000)
        return `${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000)
        return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
}
function formatDate(isoDate) {
    try {
        return new Date(isoDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }
    catch {
        return isoDate;
    }
}
function executionRate(forecast, achievement) {
    if (forecast === 0)
        return "N/A";
    return `${((achievement / forecast) * 100).toFixed(1)}%`;
}
function serializeSession(doc) {
    const parts = [];
    // -- Header --
    const name = doc.sessionName || "Unnamed Session";
    const desc = doc.description ? ` — ${doc.description}` : "";
    const period = doc.startDate && doc.endDate
        ? ` (${formatDate(doc.startDate)} to ${formatDate(doc.endDate)})`
        : "";
    parts.push(`Session: "${name}"${desc}${period}.`);
    const data = doc.data;
    if (!data)
        return parts.join("\n");
    // -- Personnel --
    if (data.staff && data.staff.length > 0) {
        const totalMale = data.staff.reduce((s, r) => s + (r.male || 0), 0);
        const totalFemale = data.staff.reduce((s, r) => s + (r.female || 0), 0);
        const totalStaff = totalMale + totalFemale;
        // Group by category
        const categories = {};
        for (const row of data.staff) {
            const cat = row.category || "Other";
            if (!categories[cat])
                categories[cat] = { male: 0, female: 0 };
            categories[cat].male += row.male || 0;
            categories[cat].female += row.female || 0;
        }
        const catSummary = Object.entries(categories)
            .map(([cat, counts]) => `${cat}: ${counts.male + counts.female} (${counts.male}M/${counts.female}F)`)
            .join("; ");
        parts.push(`Personnel: ${totalStaff} total staff (${totalMale} male, ${totalFemale} female). ` +
            `Management cadre: ${data.managementCount || 0}. ` +
            `Salary mass: ${formatNumber(data.salaryMassCDF || 0)} CDF. ` +
            `By category — ${catSummary}.`);
    }
    // -- Budget --
    if (data.budget) {
        const b = data.budget;
        const summarizeBudgetSection = (label, rows) => {
            if (!rows || rows.length === 0)
                return "";
            const totalForecast = rows.reduce((s, r) => s + (r.forecast || 0), 0);
            const totalAchievement = rows.reduce((s, r) => s + (r.achievement || 0), 0);
            const topItems = rows
                .filter((r) => r.forecast > 0 || r.achievement > 0)
                .sort((a, b) => (b.achievement || 0) - (a.achievement || 0))
                .slice(0, 5)
                .map((r) => `${r.label}: forecast ${formatNumber(r.forecast)}, achieved ${formatNumber(r.achievement)} (${executionRate(r.forecast, r.achievement)})`)
                .join("; ");
            return (`${label}: total forecast ${formatNumber(totalForecast)}, ` +
                `achieved ${formatNumber(totalAchievement)} ` +
                `(${executionRate(totalForecast, totalAchievement)}). ` +
                (topItems ? `Top items — ${topItems}.` : ""));
        };
        const prodSummary = summarizeBudgetSection("Production", b.production);
        const chargesSummary = summarizeBudgetSection("Charges", b.charges);
        // Treasury
        const receiptsTotal = (b.treasuryReceipts || []).reduce((s, r) => s + (r.achievement || 0), 0);
        const disbursementsTotal = (b.treasuryDisbursements || []).reduce((s, r) => s + (r.achievement || 0), 0);
        const balance = receiptsTotal - disbursementsTotal;
        parts.push(`Budget: ${prodSummary} ${chargesSummary} ` +
            `Treasury: receipts ${formatNumber(receiptsTotal)}, ` +
            `disbursements ${formatNumber(disbursementsTotal)}, ` +
            `balance ${formatNumber(balance)}.`);
    }
    // -- Exploitation --
    if (data.exploitation) {
        const ex = data.exploitation;
        // Operating data
        if (ex.operatingData && ex.operatingData.length > 0) {
            const opSummary = ex.operatingData
                .filter((r) => r.volume?.kgs > 0 || r.value?.cif > 0 || r.value?.fob > 0)
                .map((r) => {
                const vol = r.volume?.kgs ? `${formatNumber(r.volume.kgs)} kgs` : "";
                const val = r.value?.cif
                    ? `CIF ${formatNumber(r.value.cif)}`
                    : r.value?.fob
                        ? `FOB ${formatNumber(r.value.fob)}`
                        : "";
                return `${r.category} ${r.subcategory}: ${[vol, val].filter(Boolean).join(", ")}`;
            })
                .join("; ");
            if (opSummary) {
                parts.push(`Exploitation — Operating data: ${opSummary}.`);
            }
        }
        // Failures
        if (ex.failures && ex.failures.length > 0) {
            const failSummary = ex.failures
                .filter((r) => Number(r.count) > 0)
                .map((r) => `${r.name}: ${r.count}`)
                .join("; ");
            if (failSummary) {
                parts.push(`Failures/Damages: ${failSummary}.`);
            }
        }
        // Lab analysis
        if (ex.labAnalysis && ex.labAnalysis.length > 0) {
            const totalReceived = ex.labAnalysis.reduce((s, r) => s + (r.received || 0), 0);
            const totalAnalyzed = ex.labAnalysis.reduce((s, r) => s + (r.analyzed || 0), 0);
            const totalNonCompliant = ex.labAnalysis.reduce((s, r) => s + (r.nonCompliant || 0), 0);
            const complianceRate = totalAnalyzed > 0
                ? (((totalAnalyzed - totalNonCompliant) / totalAnalyzed) * 100).toFixed(1)
                : "N/A";
            const labDetails = ex.labAnalysis
                .filter((r) => r.received > 0)
                .map((r) => `${r.product || r.category}: ${r.received} received, ${r.analyzed} analyzed, ${r.nonCompliant} non-compliant`)
                .join("; ");
            parts.push(`Lab Analysis: ${totalReceived} total samples received, ${totalAnalyzed} analyzed, ` +
                `${totalNonCompliant} non-compliant (${complianceRate}% compliance). ` +
                `Breakdown — ${labDetails}.`);
        }
        // Metrology
        if (ex.metrology && ex.metrology.length > 0) {
            const metroSummary = ex.metrology
                .filter((r) => Number(r.count) > 0)
                .map((r) => `${r.name}: ${r.count}`)
                .join("; ");
            if (metroSummary) {
                parts.push(`Metrology: ${metroSummary}.`);
            }
        }
        // Technical Control
        if (ex.technicalControl && ex.technicalControl.length > 0) {
            const tcSummary = ex.technicalControl
                .filter((r) => Number(r.count) > 0)
                .map((r) => `${r.name}: ${r.count}`)
                .join("; ");
            if (tcSummary) {
                parts.push(`Technical Control: ${tcSummary}.`);
            }
        }
    }
    return parts.join("\n");
}
//# sourceMappingURL=serialize.js.map
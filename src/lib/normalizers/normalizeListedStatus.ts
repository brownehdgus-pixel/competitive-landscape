export type NormalizedListedStatus = "listed" | "private" | "unknown";

export function normalizeListedStatus(value: unknown): NormalizedListedStatus {
  if (value === null || value === undefined) return "unknown";

  const v = String(value).trim().toLowerCase();

  if (!v) return "unknown";

  const privateTerms = [
    "unlisted",
    "non-listed",
    "non listed",
    "not listed",
    "private",
    "privately held",
    "private company",
    "startup",
    "venture-backed",
    "venture backed",
  ];

  if (privateTerms.some((term) => v.includes(term))) {
    return "private";
  }

  const listedTerms = [
    "public",
    "public company",
    "publicly traded",
    "stock exchange",
    "nasdaq",
    "nyse",
    "amex",
    "lse",
    "aim",
    "euronext",
    "xetra",
    "tse",
    "tsx",
    "hkex",
    "sgx",
    "kosdaq",
    "kospi",
    "krx",
    "ticker",
    "listed company",
  ];

  if (listedTerms.some((term) => v.includes(term))) {
    return "listed";
  }

  if (v === "listed") return "listed";

  return "unknown";
}

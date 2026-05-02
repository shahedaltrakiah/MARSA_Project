/** MARSA Terms and Conditions — English (assembled from parts). */
import { TERMS_PART_1 } from "./terms-part1"
import { TERMS_PROHIBITED_UL } from "./terms-prohibited-ul"
import { TERMS_PART_2 } from "./terms-part2"

export const TERMS_HTML_EN = `${TERMS_PART_1.trim()}
${TERMS_PROHIBITED_UL.trim()}
${TERMS_PART_2.trim()}
`.trim()

/** @deprecated Use TERMS_HTML_EN; kept for explicit naming consistency */
export const TERMS_HTML = TERMS_HTML_EN

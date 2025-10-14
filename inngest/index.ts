import { processOrder } from "./functions/process-order"
import { monitorPositions } from "./functions/monitor-positions"
import { closePosition } from "./functions/close-position"
import { processWithdrawal } from "./functions/process-withdrawal"
import { processKYC } from "./functions/process-kyc"
import { generateDailyReport } from "./functions/daily-report"
import { monitorMargin } from "./functions/monitor-margin"

export const functions = [
  processOrder,
  monitorPositions,
  closePosition,
  processWithdrawal,
  processKYC,
  generateDailyReport,
  monitorMargin,
]

import { weeklySalesRecap, findWarmContacts } from './sales.js';
import { analyzeContact, draftFollowupEmail, meetingRecapToReport } from './contacts.js';

export const prompts = [
  weeklySalesRecap,
  findWarmContacts,
  analyzeContact,
  draftFollowupEmail,
  meetingRecapToReport,
];

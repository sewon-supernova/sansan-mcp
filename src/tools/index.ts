import {
  listRecentBizCards,
  searchBizCards,
  getBizCard,
  getBizCardImage,
  getBizCardTags,
  createBizCard,
} from './bizCards.js';
import { getPerson } from './persons.js';
import { listTags } from './tags.js';
import { listReports, createReport } from './reports.js';
import { getUser, listUsers } from './users.js';
import { listDepartments, listOrganizationDepartments } from './organization.js';

export const tools = [
  searchBizCards,
  listRecentBizCards,
  getBizCard,
  getBizCardImage,
  getBizCardTags,
  createBizCard,
  getPerson,
  listTags,
  listReports,
  createReport,
  getUser,
  listUsers,
  listDepartments,
  listOrganizationDepartments,
];

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

const CSV_HEADERS = [
  "id",
  "url",
  "endDate",
  "participations",
  "targetParticipations",
  "status",
  "tags",
  "createdAt"
];

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, "..", "..", "data");
const CSV_FILE_PATH = path.join(DATA_DIR, "contests.csv");

async function ensureCsvFileExists() {
  await fsp.mkdir(DATA_DIR, { recursive: true });

  if (!fs.existsSync(CSV_FILE_PATH)) {
    const headerRow = `${CSV_HEADERS.join(",")}\n`;
    await fsp.writeFile(CSV_FILE_PATH, headerRow, "utf8");
    return;
  }

  const stats = await fsp.stat(CSV_FILE_PATH);
  if (stats.size === 0) {
    const headerRow = `${CSV_HEADERS.join(",")}\n`;
    await fsp.writeFile(CSV_FILE_PATH, headerRow, "utf8");
  }
}

async function readContests() {
  await ensureCsvFileExists();
  const content = await fsp.readFile(CSV_FILE_PATH, "utf8");
  if (!content.trim()) {
    return [];
  }

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  return rows.map((row) => ({
    id: row.id || "",
    url: row.url || "",
    endDate: row.endDate || "",
    participations: toNumber(row.participations),
    targetParticipations: toNumber(row.targetParticipations),
    status: row.status || "",
    tags: row.tags || "",
    createdAt: row.createdAt || ""
  }));
}

async function writeContests(contests) {
  await ensureCsvFileExists();
  const csv = stringify(contests, {
    header: true,
    columns: CSV_HEADERS
  });
  await fsp.writeFile(CSV_FILE_PATH, csv, "utf8");
}

async function appendContest(contest) {
  await ensureCsvFileExists();
  const csvLine = stringify([contest], {
    header: false,
    columns: CSV_HEADERS
  });
  await fsp.appendFile(CSV_FILE_PATH, csvLine, "utf8");
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

module.exports = {
  CSV_FILE_PATH,
  ensureCsvFileExists,
  readContests,
  writeContests,
  appendContest
};

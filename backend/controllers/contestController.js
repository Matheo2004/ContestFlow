const crypto = require("crypto");
const {
  readContests,
  writeContests,
  appendContest
} = require("../utils/csv");

function normalizeContestInput(input, existingContest) {
  const base = existingContest || {};

  const normalizeNumber = (value, fallback = 0) => {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  let tags = base.tags || "";
  if (Array.isArray(input.tags)) {
    tags = input.tags.join("|");
  } else if (typeof input.tags === "string") {
    tags = input.tags.trim();
  }

  return {
    id: base.id || input.id || generateId(),
    url: typeof input.url === "string" ? input.url.trim() : (base.url || ""),
    endDate:
      typeof input.endDate === "string" ? input.endDate.trim() : (base.endDate || ""),
    participations: normalizeNumber(
      input.participations,
      normalizeNumber(base.participations, 0)
    ),
    targetParticipations: normalizeNumber(
      input.targetParticipations,
      normalizeNumber(base.targetParticipations, 0)
    ),
    status:
      typeof input.status === "string" ? input.status.trim() : (base.status || "active"),
    tags,
    createdAt: base.createdAt || new Date().toISOString()
  };
}

function generateId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function isValidUrl(value) {
  if (!value || typeof value !== "string") {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function hasDuplicateUrl(contests, url, excludeId) {
  const target = String(url).trim().toLowerCase();
  return contests.some((contest) => {
    if (excludeId && contest.id === excludeId) {
      return false;
    }
    return String(contest.url).trim().toLowerCase() === target;
  });
}

async function getContests(_req, res) {
  try {
    const contests = await readContests();
    return res.json(contests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    return res.status(500).json({ error: "Failed to fetch contests" });
  }
}

async function createContest(req, res) {
  try {
    const contests = await readContests();
    const contest = normalizeContestInput(req.body || {});

    if (!contest.url) {
      return res.status(400).json({ error: "url is required" });
    }

    if (!isValidUrl(contest.url)) {
      return res.status(400).json({ error: "url must be a valid http(s) URL" });
    }

    if (hasDuplicateUrl(contests, contest.url)) {
      return res.status(409).json({ error: "Contest with this URL already exists" });
    }

    await appendContest(contest);
    return res.status(201).json(contest);
  } catch (error) {
    console.error("Error creating contest:", error);
    return res.status(500).json({ error: "Failed to create contest" });
  }
}

async function updateContest(req, res) {
  try {
    const { id } = req.params;
    const contests = await readContests();
    const index = contests.findIndex((contest) => contest.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const updatedContest = normalizeContestInput(req.body || {}, contests[index]);

    if (!updatedContest.url) {
      return res.status(400).json({ error: "url is required" });
    }

    if (!isValidUrl(updatedContest.url)) {
      return res.status(400).json({ error: "url must be a valid http(s) URL" });
    }

    if (hasDuplicateUrl(contests, updatedContest.url, id)) {
      return res.status(409).json({ error: "Contest with this URL already exists" });
    }

    contests[index] = updatedContest;
    await writeContests(contests);

    return res.json(updatedContest);
  } catch (error) {
    console.error("Error updating contest:", error);
    return res.status(500).json({ error: "Failed to update contest" });
  }
}

async function deleteContest(req, res) {
  try {
    const { id } = req.params;
    const contests = await readContests();
    const exists = contests.some((contest) => contest.id === id);

    if (!exists) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const filtered = contests.filter((contest) => contest.id !== id);
    await writeContests(filtered);

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting contest:", error);
    return res.status(500).json({ error: "Failed to delete contest" });
  }
}

module.exports = {
  getContests,
  createContest,
  updateContest,
  deleteContest
};

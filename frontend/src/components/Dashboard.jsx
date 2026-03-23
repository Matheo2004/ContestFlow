import { useEffect, useMemo, useState } from "react";
import ContestForm from "./ContestForm";
import ContestTable from "./ContestTable";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function Dashboard() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchContests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/contests`);
      if (!response.ok) {
        throw new Error("Failed to fetch contests.");
      }
      const data = await response.json();
      setContests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unexpected error while fetching contests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      const text = `${contest.url} ${contest.tags} ${contest.status}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : (contest.status || "active") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contests, search, statusFilter]);

  const addContest = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/contests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to add contest.");
      }

      const created = await response.json();
      setContests((prev) => [created, ...prev]);
      return true;
    } catch (err) {
      setError(err.message || "Unexpected error while adding contest.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateContest = async (id, payload) => {
    setUpdating(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/contests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update contest.");
      }

      const updated = await response.json();
      setContests((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return true;
    } catch (err) {
      setError(err.message || "Unexpected error while updating contest.");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deleteContest = async (id) => {
    setDeletingId(id);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/contests/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to delete contest.");
      }
      setContests((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Unexpected error while deleting contest.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-800">Instagram Contest Dashboard</h1>
          <p className="text-sm text-slate-600">
            Manage giveaway contests from CSV-backed API data.
          </p>
        </header>

        <ContestForm onSubmit={addContest} isSubmitting={submitting} />

        <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:flex-row">
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm md:max-w-sm"
              type="text"
              placeholder="Search URL, tags or status..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="rounded border border-slate-300 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="completed">completed</option>
            </select>
          </div>
          <button
            type="button"
            onClick={fetchContests}
            className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            Refresh
          </button>
        </section>

        {loading && (
          <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Loading contests...
          </div>
        )}

        {error && (
          <div className="rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && (
          <ContestTable
            contests={filteredContests}
            onUpdateContest={updateContest}
            onDeleteContest={deleteContest}
            isUpdating={updating}
            deletingId={deletingId}
          />
        )}
      </div>
    </main>
  );
}

export default Dashboard;

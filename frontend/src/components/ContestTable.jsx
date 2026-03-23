import { useMemo, useState } from "react";

const EMPTY_EDIT = {
  url: "",
  endDate: "",
  participations: 0,
  targetParticipations: 0,
  status: "active",
  tags: ""
};

function isEndingSoon(endDate) {
  if (!endDate) {
    return false;
  }

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) {
    return false;
  }

  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  return diffMs >= 0 && diffMs <= threeDaysMs;
}

function formatDateFr(endDate) {
  if (!endDate) {
    return "-";
  }

  const date = new Date(endDate);
  if (Number.isNaN(date.getTime())) {
    return endDate;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function ContestTable({
  contests,
  onUpdateContest,
  onDeleteContest,
  isUpdating,
  deletingId
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState(EMPTY_EDIT);

  const sortedContests = useMemo(
    () =>
      [...contests].sort((a, b) => {
        const aDate = a.endDate ? new Date(a.endDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.endDate ? new Date(b.endDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      }),
    [contests]
  );

  const startEdit = (contest) => {
    setEditingId(contest.id);
    setEditValues({
      url: contest.url || "",
      endDate: contest.endDate ? contest.endDate.slice(0, 10) : "",
      participations: contest.participations ?? 0,
      targetParticipations: contest.targetParticipations ?? 0,
      status: contest.status || "active",
      tags: contest.tags || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues(EMPTY_EDIT);
  };

  const onEditField = (event) => {
    const { name, value } = event.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    const payload = {
      ...editValues,
      participations: Number(editValues.participations || 0),
      targetParticipations: Number(editValues.targetParticipations || 0)
    };
    const success = await onUpdateContest(id, payload);
    if (success) {
      cancelEdit();
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-3 py-3">URL</th>
            <th className="min-w-36 px-3 py-3 whitespace-nowrap">End date</th>
            <th className="px-3 py-3">Participations</th>
            <th className="px-3 py-3">Target</th>
            <th className="px-3 py-3">Status</th>
            <th className="min-w-56 px-3 py-3">Tags</th>
            <th className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedContests.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-slate-500" colSpan={7}>
                No contests found.
              </td>
            </tr>
          )}
          {sortedContests.map((contest) => {
            const editing = editingId === contest.id;
            const rowHighlight = isEndingSoon(contest.endDate)
              ? "bg-amber-50"
              : "bg-white";

            return (
              <tr key={contest.id} className={`border-t border-slate-100 ${rowHighlight}`}>
                <td className="px-3 py-2 align-top">
                  {editing ? (
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      name="url"
                      type="url"
                      value={editValues.url}
                      onChange={onEditField}
                    />
                  ) : (
                    <a
                      href={contest.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {contest.url}
                    </a>
                  )}
                </td>
                <td className="min-w-36 px-3 py-2 align-top whitespace-nowrap">
                  {editing ? (
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      name="endDate"
                      type="date"
                      value={editValues.endDate}
                      onChange={onEditField}
                    />
                  ) : (
                    formatDateFr(contest.endDate)
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {editing ? (
                    <input
                      className="w-24 rounded border border-slate-300 px-2 py-1"
                      name="participations"
                      type="number"
                      min="0"
                      value={editValues.participations}
                      onChange={onEditField}
                    />
                  ) : (
                    contest.participations
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {editing ? (
                    <input
                      className="w-24 rounded border border-slate-300 px-2 py-1"
                      name="targetParticipations"
                      type="number"
                      min="0"
                      value={editValues.targetParticipations}
                      onChange={onEditField}
                    />
                  ) : (
                    contest.targetParticipations
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {editing ? (
                    <select
                      className="rounded border border-slate-300 px-2 py-1"
                      name="status"
                      value={editValues.status}
                      onChange={onEditField}
                    >
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="completed">completed</option>
                    </select>
                  ) : (
                    contest.status || "active"
                  )}
                </td>
                <td className="min-w-56 px-3 py-2 align-top">
                  {editing ? (
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      name="tags"
                      type="text"
                      value={editValues.tags}
                      onChange={onEditField}
                    />
                  ) : (
                    contest.tags || "-"
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => saveEdit(contest.id)}
                          className="rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded bg-slate-400 px-3 py-1 text-white hover:bg-slate-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(contest)}
                          className="rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === contest.id}
                          onClick={() => onDeleteContest(contest.id)}
                          className="rounded bg-rose-600 px-3 py-1 text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                        >
                          {deletingId === contest.id ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ContestTable;

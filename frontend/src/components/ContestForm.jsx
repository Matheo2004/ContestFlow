import { useState } from "react";

const INITIAL_FORM = {
  url: "",
  endDate: "",
  participations: "",
  targetParticipations: "",
  status: "active",
  tags: ""
};

function ContestForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await onSubmit({
      ...form,
      participations: Number(form.participations || 0),
      targetParticipations: Number(form.targetParticipations || 0)
    });

    if (success) {
      setForm(INITIAL_FORM);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6"
    >
      <input
        className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2"
        name="url"
        type="url"
        placeholder="https://instagram.com/..."
        value={form.url}
        onChange={handleChange}
        required
      />
      <input
        className="rounded border border-slate-300 px-3 py-2 text-sm"
        name="endDate"
        type="date"
        value={form.endDate}
        onChange={handleChange}
      />
      <input
        className="rounded border border-slate-300 px-3 py-2 text-sm"
        name="participations"
        type="number"
        min="0"
        placeholder="Participations"
        value={form.participations}
        onChange={handleChange}
      />
      <input
        className="rounded border border-slate-300 px-3 py-2 text-sm"
        name="targetParticipations"
        type="number"
        min="0"
        placeholder="Target"
        value={form.targetParticipations}
        onChange={handleChange}
      />
      <select
        className="rounded border border-slate-300 px-3 py-2 text-sm"
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        <option value="active">active</option>
        <option value="paused">paused</option>
        <option value="completed">completed</option>
      </select>
      <input
        className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-5"
        name="tags"
        type="text"
        placeholder="fashion|summer|reel"
        value={form.tags}
        onChange={handleChange}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Adding..." : "Add Contest"}
      </button>
    </form>
  );
}

export default ContestForm;

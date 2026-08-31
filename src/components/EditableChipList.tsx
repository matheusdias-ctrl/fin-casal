"use client";

import { useState, useTransition } from "react";

type Item = { id: string; name: string };

/**
 * Lista de "chips" (categorias, tipos de investimento, etc.) com adicionar,
 * renomear (clique no texto) e excluir. Recebe Server Actions já vinculadas
 * ao que for específico do contexto (ex: tipo despesa/receita).
 */
export function EditableChipList({
  items,
  onAdd,
  onRename,
  onDelete,
  placeholder,
}: {
  items: Item[];
  onAdd: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  placeholder: string;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setError(null);
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      try {
        await onAdd(name);
        setNewName("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao adicionar.");
      }
    });
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditingValue(item.name);
    setError(null);
  }

  function commitEdit() {
    if (!editingId) return;
    const id = editingId;
    const name = editingValue.trim();
    if (!name) {
      setEditingId(null);
      return;
    }
    startTransition(async () => {
      try {
        await onRename(id, name);
        setEditingId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao renomear.");
      }
    });
  }

  function handleDelete(item: Item) {
    setError(null);
    startTransition(async () => {
      try {
        await onDelete(item.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao excluir.");
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark"
          >
            {editingId === item.id ? (
              <input
                autoFocus
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="w-28 rounded border-none bg-white px-1 py-0.5 text-slate-900 outline-none ring-1 ring-brand"
              />
            ) : (
              <button type="button" onClick={() => startEdit(item)} className="hover:underline">
                {item.name}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(item)}
              disabled={isPending}
              aria-label={`Excluir ${item.name}`}
              className="opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={placeholder}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending || !newName.trim()}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

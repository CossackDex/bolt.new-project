import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Trash2, Edit, X, Check, MessageSquare } from 'lucide-react';

type Note = {
  id: string
  user_id: string
  project_id: string | null
  task_id: string | null
  content: string
  created_at: string
  updated_at: string
};

interface NotesProps {
  projectId?: string | null;
  taskId?: string | null;
}

export default function Notes({ projectId, taskId }: NotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [projectId, taskId]);

  const loadNotes = async () => {
    setLoading(true);
    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    const { data, error } = await query;

    if (data && !error) {
      setNotes(data);
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setSaving(true);
    const { error } = await supabase.from('notes').insert({
      user_id: user?.id!,
      project_id: projectId || null,
      task_id: taskId || null,
      content: newNoteContent.trim(),
    });

    if (!error) {
      setNewNoteContent('');
      loadNotes();
    }
    setSaving(false);
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editContent.trim()) return;

    setSaving(true);
    const { error } = await supabase
      .from('notes')
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', editingNote.id);

    if (!error) {
      setEditingNote(null);
      setEditContent('');
      loadNotes();
    }
    setSaving(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return;

    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (!error) {
      loadNotes();
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">Notes</h3>
        <span className="text-sm text-slate-500">({notes.length})</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddNote}
            disabled={!newNoteContent.trim() || saving}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="bg-white rounded-lg border border-slate-200 p-4">
            {editingNote?.id === note.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateNote}
                    disabled={!editContent.trim() || saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium text-sm transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-slate-700 text-sm mb-3 whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(note)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">No notes yet. Add your first note above.</p>
        </div>
      )}
    </div>
  );
}

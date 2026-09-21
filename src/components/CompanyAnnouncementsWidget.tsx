import React, { useState } from 'react';
import { CompanyAnnouncement } from '../types';
import {
  Megaphone,
  Pin,
  AlertTriangle,
  Calendar,
  Sparkles,
  ChevronRight,
  Shield,
  Plus,
  X,
  Send,
} from 'lucide-react';

interface CompanyAnnouncementsWidgetProps {
  announcements: CompanyAnnouncement[];
  canPublish?: boolean;
  onPublishAnnouncement?: (announcement: Omit<CompanyAnnouncement, 'id' | 'publishedAt'>) => void;
}

export const CompanyAnnouncementsWidget: React.FC<CompanyAnnouncementsWidgetProps> = ({
  announcements,
  canPublish = false,
  onPublishAnnouncement,
}) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<CompanyAnnouncement | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CompanyAnnouncement['category']>('HR Announcement');
  const [priority, setPriority] = useState<CompanyAnnouncement['priority']>('normal');
  const [isPinned, setIsPinned] = useState(false);

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (onPublishAnnouncement) {
      onPublishAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        publishedBy: 'Sunita Adhikari (HR Manager)',
        isPinned,
      });
    }
    setTitle('');
    setContent('');
    setShowPublishModal(false);
  };

  const categoryBadges: { [cat: string]: string } = {
    'Festive Holiday': 'bg-amber-100 text-amber-900 border-amber-300',
    'Urgent Notice': 'bg-rose-100 text-rose-900 border-rose-300',
    'Policy Update': 'bg-blue-100 text-blue-900 border-blue-300',
    'HR Announcement': 'bg-emerald-100 text-emerald-900 border-emerald-300',
    'Health & Safety': 'bg-orange-100 text-orange-900 border-orange-300',
  };

  return (
    <div id="company-announcements-widget" className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Company Notices & Announcements
            </h4>
            <p className="text-[11px] text-slate-500">
              Corporate updates, festival bonus notices & safety advisories
            </p>
          </div>
        </div>

        {canPublish && (
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Publish Notice
          </button>
        )}
      </div>

      {/* Announcements Carousel / List */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {sortedAnnouncements.map((anc) => (
          <div
            key={anc.id}
            onClick={() => setSelectedAnnouncement(anc)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.005] ${
              anc.priority === 'urgent'
                ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                : anc.isPinned
                ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                : 'bg-slate-50/70 border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {anc.isPinned && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 flex items-center gap-0.5">
                    <Pin className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
                    Pinned
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    categoryBadges[anc.category] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {anc.category}
                </span>
                {anc.priority === 'urgent' && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider animate-pulse">
                    Urgent
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                {anc.publishedAt.split(' ')[0]}
              </span>
            </div>

            <h5 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
              {anc.title}
            </h5>
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
              {anc.content}
            </p>

            <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[10px] text-slate-400">
              <span>By {anc.publishedBy}</span>
              <span className="text-blue-700 font-bold flex items-center gap-0.5 group-hover:underline">
                Read Notice <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Read Notice Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    categoryBadges[selectedAnnouncement.category]
                  }`}
                >
                  {selectedAnnouncement.category}
                </span>
                {selectedAnnouncement.priority === 'urgent' && (
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase">
                    Urgent
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {selectedAnnouncement.title}
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>
                <p className="font-semibold text-slate-700">{selectedAnnouncement.publishedBy}</p>
                <p className="text-[11px] text-slate-400">Published: {selectedAnnouncement.publishedAt}</p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Notice Modal (for Manager) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-700" />
              Broadcast Company Announcement
            </h3>

            <form onSubmit={handlePublish} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Bada Dashain Bonus & Advance Disbursal"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="HR Announcement">HR Announcement</option>
                    <option value="Festive Holiday">Festive Holiday</option>
                    <option value="Policy Update">Policy Update</option>
                    <option value="Urgent Notice">Urgent Notice</option>
                    <option value="Health & Safety">Health & Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Body
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Write full text of the notice, guidelines or instructions..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin-check"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="pin-check" className="text-xs font-medium text-slate-700">
                  Pin to top of employee mobile app notice board
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

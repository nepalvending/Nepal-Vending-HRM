import React, { useState } from 'react';
import { Employee, SupportChatMessage } from '../types';
import {
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  X,
  Send,
  ExternalLink,
  Flame,
  Ambulance,
  Shield,
  Heart,
  UserCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface EmergencySosDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmployee: Employee;
  chatMessages: SupportChatMessage[];
  onSendMessage: (msg: string) => void;
}

const QUICK_INQUIRIES = [
  'Leave quota & Loss of Pay (LOP) query',
  'Biometric punch not registered today',
  'Urgent medical expense / cash advance',
  'Field vehicle / vending kiosk breakdown',
  'Emergency leave request for today',
];

export const EmergencySosDrawer: React.FC<EmergencySosDrawerProps> = ({
  isOpen,
  onClose,
  currentEmployee,
  chatMessages,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'dial' | 'chat'>('dial');
  const [typedMessage, setTypedMessage] = useState('');
  const [dialConfirmNumber, setDialConfirmNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    onSendMessage(typedMessage.trim());
    setTypedMessage('');
  };

  const handleQuickChip = (text: string) => {
    onSendMessage(text);
  };

  const triggerDial = (number: string, label: string) => {
    setDialConfirmNumber(`${label} (${number})`);
    setTimeout(() => {
      window.location.href = `tel:${number.replace(/[^0-9+]/g, '')}`;
    }, 300);
    setTimeout(() => setDialConfirmNumber(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs">
      <div
        id="emergency-sos-drawer"
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-700 to-slate-900 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs animate-pulse">
                <ShieldAlert className="w-5 h-5 text-rose-200" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">SOS & Emergency Support</h3>
                <p className="text-[11px] text-rose-100">
                  One-Tap Emergency Dial & HR Support Chat
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1 mt-3 p-1 bg-black/20 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dial')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'dial' ? 'bg-white text-rose-800 shadow-xs font-bold' : 'text-white/80 hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              One-Tap Dial
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chat' ? 'bg-white text-rose-800 shadow-xs font-bold' : 'text-white/80 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              HR Support Chat
            </button>
          </div>
        </div>

        {/* Body */}
        {activeTab === 'dial' ? (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {dialConfirmNumber && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Connecting to {dialConfirmNumber}...
              </div>
            )}

            {/* Corporate & Manager Contacts */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Company & Manager Hotlines
              </h4>

              {/* Company HR Hotline */}
              <button
                type="button"
                onClick={() => triggerDial('+977-1-4421234', 'Nepal Vending HR')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                      Nepal Vending Corporate HR
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">+977-1-4421234 (Ext 101)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 group-hover:bg-emerald-700">
                  <PhoneCall className="w-3 h-3" />
                  Dial
                </span>
              </button>

              {/* Line Manager */}
              <button
                type="button"
                onClick={() => triggerDial('+977-9851098765', 'Sunita Adhikari (HR Manager)')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-teal-800">
                      Sunita Adhikari (HR & Ops Manager)
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">+977-9851098765</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1 group-hover:bg-teal-800">
                  <PhoneCall className="w-3 h-3" />
                  Dial
                </span>
              </button>

              {/* Personal Emergency Contact */}
              {currentEmployee.emergencyContactPhone && (
                <button
                  type="button"
                  onClick={() =>
                    triggerDial(
                      currentEmployee.emergencyContactPhone!,
                      currentEmployee.emergencyContactName || 'Family Contact'
                    )
                  }
                  className="w-full p-3 rounded-xl border border-amber-200 hover:border-amber-400 bg-amber-50/60 hover:bg-amber-100/60 flex items-center justify-between text-left transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-200 text-amber-900">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-950">
                        {currentEmployee.emergencyContactName} ({currentEmployee.emergencyContactRelation || 'Next of Kin'})
                      </p>
                      <p className="text-[11px] text-amber-700 font-mono">
                        {currentEmployee.emergencyContactPhone}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold flex items-center gap-1 group-hover:bg-amber-700">
                    <PhoneCall className="w-3 h-3" />
                    Dial
                  </span>
                </button>
              )}
            </div>

            {/* National Emergency Services */}
            <div className="space-y-2 pt-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nepal National Emergency (Toll-Free)
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {/* Police */}
                <button
                  type="button"
                  onClick={() => triggerDial('100', 'Nepal Police')}
                  className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-bold text-blue-950">Nepal Police</span>
                  </div>
                  <p className="text-lg font-black text-blue-800 font-mono">100</p>
                  <p className="text-[10px] text-blue-600">Free 24/7 Police Dispatch</p>
                </button>

                {/* Ambulance */}
                <button
                  type="button"
                  onClick={() => triggerDial('102', 'Nepal Ambulance Service')}
                  className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Ambulance className="w-4 h-4 text-rose-700" />
                    <span className="text-xs font-bold text-rose-950">Ambulance</span>
                  </div>
                  <p className="text-lg font-black text-rose-800 font-mono">102</p>
                  <p className="text-[10px] text-rose-600">Red Cross & Paramedics</p>
                </button>

                {/* Fire Brigade */}
                <button
                  type="button"
                  onClick={() => triggerDial('101', 'Fire Brigade (Damkal)')}
                  className="p-3 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-orange-700" />
                    <span className="text-xs font-bold text-orange-950">Fire Brigade</span>
                  </div>
                  <p className="text-lg font-black text-orange-800 font-mono">101</p>
                  <p className="text-[10px] text-orange-600">Kathmandu Damkal</p>
                </button>

                {/* Blood Bank */}
                <button
                  type="button"
                  onClick={() => triggerDial('+977-1-4288485', 'Nepal Red Cross Central Blood Bank')}
                  className="p-3 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-red-700" />
                    <span className="text-xs font-bold text-red-950">Blood Bank</span>
                  </div>
                  <p className="text-xs font-black text-red-800 font-mono">01-4288485</p>
                  <p className="text-[10px] text-red-600">Central Red Cross, Soaltee</p>
                </button>
              </div>
            </div>

            {/* WhatsApp Quick Chat */}
            <div className="pt-2">
              <a
                href="https://wa.me/9779851098765?text=Namaste%20Sunita%20ji,%20I%20am%20reaching%20out%20from%20Nepal%20Vending%20field%20support."
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Open WhatsApp Direct Chat (+977-9851098765)
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Live Chat Section */
          <div className="flex-1 flex flex-col h-[calc(100%-120px)] overflow-hidden">
            {/* Messages Feed */}
            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-slate-50">
              {chatMessages.map((msg) => {
                const isMe = msg.sender === 'employee';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-500">{msg.senderName}</span>
                      <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-emerald-700 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Chips */}
            <div className="p-2 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-1.5">
              {QUICK_INQUIRIES.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickChip(chip)}
                  className="shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type your message or HR inquiry..."
                className="flex-1 text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-500">
            For critical life-threatening situations, dial 100 / 102 immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

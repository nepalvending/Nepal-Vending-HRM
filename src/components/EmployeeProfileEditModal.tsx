import React, { useState } from 'react';
import { Employee } from '../types';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Calendar,
  ShieldAlert,
  X,
  Check,
  Camera,
  FileText,
} from 'lucide-react';

interface EmployeeProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSave: (updatedEmployee: Employee) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const EmployeeProfileEditModal: React.FC<EmployeeProfileEditModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
}) => {
  const [phone, setPhone] = useState(employee.phone);
  const [email, setEmail] = useState(employee.email);
  const [address, setAddress] = useState(employee.address || '');
  const [bloodGroup, setBloodGroup] = useState(employee.bloodGroup || 'O+');
  const [dateOfBirth, setDateOfBirth] = useState(employee.dateOfBirth || '1995-09-22');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>(employee.maritalStatus);
  const [emergencyContactName, setEmergencyContactName] = useState(employee.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(employee.emergencyContactPhone || '');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(employee.emergencyContactRelation || '');
  const [bio, setBio] = useState(employee.bio || '');
  const [avatar, setAvatar] = useState(employee.avatar);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Employee = {
      ...employee,
      phone,
      email,
      address,
      bloodGroup,
      dateOfBirth,
      maritalStatus,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      bio,
      avatar,
    };
    onSave(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="employee-profile-edit-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <img
                src={avatar}
                alt={employee.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-white text-emerald-800 p-1 rounded-full shadow-xs">
                <Camera className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Edit Personal Profile
                <span className="text-[11px] font-medium bg-white/20 px-2 py-0.5 rounded-full">
                  {employee.employeeCode}
                </span>
              </h3>
              <p className="text-xs text-emerald-100">{employee.name} • {employee.designation}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Profile Avatar
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`relative shrink-0 rounded-full p-0.5 transition-all ${
                    avatar === av ? 'ring-2 ring-emerald-600 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt="Avatar option" className="w-10 h-10 rounded-full object-cover" />
                  {avatar === av && (
                    <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-600 text-white rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Mobile Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                placeholder="+977-98XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                placeholder="employee@nepalvending.com.np"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Current Residential Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                placeholder="Ward No, Area, City (e.g. Shantinagar-34, Kathmandu)"
              />
            </div>
          </div>

          {/* Personal Info & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Date of Birth (AD)
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Used for company birthday tracking</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                Marital Status
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as 'single' | 'married')}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
              >
                <option value="single">Single (अविवाहित)</option>
                <option value="married">Married (विवाहित)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-0.5">Affects tax deduction slab</p>
            </div>
          </div>

          {/* Emergency Contact Block */}
          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-3">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Emergency Contact (One-Tap SOS Reference)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-amber-800 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Pooja Shrestha"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-amber-800 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={emergencyContactRelation}
                  onChange={(e) => setEmergencyContactRelation(e.target.value)}
                  placeholder="e.g. Spouse / Parent"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-amber-800 mb-1">
                  Emergency Phone
                </label>
                <input
                  type="text"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+977-98XXXXXXXX"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              Role Description / Notes
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800 resize-none"
              placeholder="Brief summary of your field route or technical specialization..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:bg-emerald-500"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved Successfully!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

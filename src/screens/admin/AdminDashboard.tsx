import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole, AccountStatus } from '../../types/auth';
import { TELANGANA_CLASSES, ALL_SUBJECT_NAMES } from '../../data/syllabusData';
import {
  fetchCompanyAdminDashboard,
  fetchAdminSchools,
  createAdminSchool,
  updateAdminSchool,
  updateAdminSchoolStatus,
  fetchAdminTeacherAssignments,
  createAdminTeacherAssignment,
  updateAdminTeacherAssignment,
  deleteAdminTeacherAssignment,
} from '../../services/organizationService';
import {
  adminCreateAccount,
  adminListAccounts,
  adminUpdateAccountStatus,
} from '../../services/auth/authService';
import {
  CompanyAdminDashboardData,
  School,
  TeacherAssignment,
} from '../../types/organization';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ShieldCheck,
  Building,
  Users,
  GraduationCap,
  Award,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Edit2,
  UserPlus,
  Trash2,
  Layers,
  BookOpen,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  CheckSquare,
} from 'lucide-react';
import { getAuthHeaders } from '../../services/auth/authService';

interface TeacherRequestItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  qualification?: string;
  schoolName: string;
  requestedClasses: string[];
  requestedSubjects: string[];
  otherSubject?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
  activeSection?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  activeSection = 'overview',
}) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<CompanyAdminDashboardData | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'schools' | 'assignments' | 'users'>('overview');

  // Search and filters
  const [schoolSearch, setSchoolSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [userSearch, setUserSearch] = useState('');

  // Modals state
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [schoolFormData, setSchoolFormData] = useState({
    name: '',
    schoolCode: '',
    address: '',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    contactEmail: '',
    contactPhone: '',
    principalId: '',
  });

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({
    teacherId: '',
    schoolId: '',
    classLevel: 'Class 10',
    subjectId: 'mathematics',
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'teacher' as UserRole,
    schoolId: '',
    classLevel: 'Class 10',
    assignedClasses: ['Class 10'],
    assignedSubjects: ['Mathematics'],
    mobileNumber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // ---- Teacher Approval Requests ----
  const [teacherRequests, setTeacherRequests] = useState<TeacherRequestItem[]>([]);
  const [requestSubTab, setRequestSubTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [approveTarget, setApproveTarget] = useState<TeacherRequestItem | null>(null);
  const [approveClasses, setApproveClasses] = useState<string[]>([]);
  const [approveSubjects, setApproveSubjects] = useState<string[]>([]);
  const [approveStatus, setApproveStatus] = useState<'active' | 'inactive'>('active');
  const [rejectTarget, setRejectTarget] = useState<TeacherRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reqActionLoading, setReqActionLoading] = useState(false);

  const pendingRequests = teacherRequests.filter((r) => r.status === 'pending');
  const approvedRequests = teacherRequests.filter((r) => r.status === 'approved');
  const rejectedRequests = teacherRequests.filter((r) => r.status === 'rejected');

  // Subject options for the approve modal: the full curriculum subject list
  // plus any custom "Other Subject" the teacher requested, so it can be
  // reviewed and assigned in one place.
  const approveSubjectOptions = approveTarget
    ? Array.from(
        new Set([
          ...ALL_SUBJECT_NAMES,
          ...(approveTarget.otherSubject ? [approveTarget.otherSubject] : []),
        ])
      )
    : [];

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dash, schs, asgns, usrs] = await Promise.all([
        fetchCompanyAdminDashboard(),
        fetchAdminSchools(),
        fetchAdminTeacherAssignments(),
        adminListAccounts(),
      ]);
      setDashboardData(dash);
      setSchools(schs);
      setAssignments(asgns);
      setUsersList(usrs);

      // Teacher approval requests (real records; failure must not break the rest)
      try {
        const reqRes = await fetch('/api/admin/teacher-requests', {
          headers: getAuthHeaders(),
        });
        const reqData = await reqRes.json();
        if (reqRes.ok) {
          setTeacherRequests(reqData.requests || []);
        }
      } catch (reqErr) {
        console.error('Failed to load teacher requests:', reqErr);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // School handlers
  const handleOpenCreateSchool = () => {
    setEditingSchool(null);
    setSchoolFormData({
      name: '',
      schoolCode: '',
      address: '',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      contactEmail: '',
      contactPhone: '',
      principalId: '',
    });
    setFormError(null);
    setFormSuccess(null);
    setShowSchoolModal(true);
  };

  const handleOpenEditSchool = (sch: School) => {
    setEditingSchool(sch);
    setSchoolFormData({
      name: sch.name,
      schoolCode: sch.schoolCode,
      address: sch.address || '',
      city: sch.city || 'Hyderabad',
      district: sch.district || 'Hyderabad',
      state: sch.state || 'Telangana',
      contactEmail: sch.contactEmail || '',
      contactPhone: sch.contactPhone || '',
      principalId: sch.principalId || '',
    });
    setFormError(null);
    setFormSuccess(null);
    setShowSchoolModal(true);
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!schoolFormData.name.trim() || !schoolFormData.schoolCode.trim()) {
      setFormError('School Name and unique School Code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSchool) {
        await updateAdminSchool(editingSchool.id, schoolFormData);
        setFormSuccess('School updated successfully.');
      } else {
        await createAdminSchool(schoolFormData);
        setFormSuccess('School created successfully.');
      }
      await loadAllData();
      setTimeout(() => setShowSchoolModal(false), 800);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save school');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSchoolStatus = async (sch: School) => {
    const nextStatus: AccountStatus = sch.status === 'active' ? 'suspended' : 'active';
    try {
      await updateAdminSchoolStatus(sch.id, nextStatus);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update school status');
    }
  };

  // Assignment handlers
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!assignmentFormData.teacherId || !assignmentFormData.schoolId) {
      setFormError('Please select both a Teacher and a School.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdminTeacherAssignment(assignmentFormData);
      setFormSuccess('Teacher assigned successfully.');
      await loadAllData();
      setTimeout(() => setShowAssignmentModal(false), 800);
    } catch (err: any) {
      setFormError(err.message || 'Failed to assign teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to remove this teacher assignment?')) return;
    try {
      await deleteAdminTeacherAssignment(assignmentId);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete assignment');
    }
  };

  // User handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!userFormData.fullName.trim() || !userFormData.email.trim() || !userFormData.password) {
      setFormError('Please fill in name, email, and initial password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSchool = schools.find((s) => s.id === userFormData.schoolId);
      await adminCreateAccount({
        role: userFormData.role,
        fullName: userFormData.fullName,
        email: userFormData.email,
        password: userFormData.password,
        mobileNumber: userFormData.mobileNumber || undefined,
        schoolName: selectedSchool ? selectedSchool.name : undefined,
        assignedClasses: userFormData.assignedClasses,
        assignedSubjects: userFormData.assignedSubjects,
      });
      setFormSuccess(`Account for ${userFormData.fullName} created successfully.`);
      await loadAllData();
      setTimeout(() => setShowUserModal(false), 800);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (targetUser: UserProfile) => {
    const nextStatus: AccountStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      await adminUpdateAccountStatus(targetUser.id, nextStatus);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  // Teacher request handlers
  const openApproveModal = (req: TeacherRequestItem) => {
    setApproveTarget(req);
    setApproveClasses(req.requestedClasses || []);
    const requested = [...(req.requestedSubjects || [])];
    if (req.otherSubject && !requested.includes(req.otherSubject)) {
      requested.push(req.otherSubject);
    }
    setApproveSubjects(requested);
    setApproveStatus('active');
    setFormError(null);
    setFormSuccess(null);
  };

  const handleApproveRequest = async () => {
    if (!approveTarget) return;
    if (approveClasses.length === 0 || approveSubjects.length === 0) {
      setFormError('Select at least one class and one subject for this teacher.');
      return;
    }
    const school = schools[0]; // Slate High School is the configured real school
    setReqActionLoading(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/teacher-requests/${approveTarget.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          schoolId: school?.id,
          assignedClasses: approveClasses,
          assignedSubjects: approveSubjects,
          accountStatus: approveStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve request.');
      setFormSuccess(data.message || 'Teacher approved.');
      setApproveTarget(null);
      await loadAllData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to approve request.');
    } finally {
      setReqActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setFormError('A rejection reason is required.');
      return;
    }
    setReqActionLoading(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/teacher-requests/${rejectTarget.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject request.');
      setFormSuccess(data.message || 'Request rejected.');
      setRejectTarget(null);
      setRejectReason('');
      await loadAllData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to reject request.');
    } finally {
      setReqActionLoading(false);
    }
  };

  const filteredSchools = schools.filter((s) => {
    if (!schoolSearch.trim()) return true;
    const q = schoolSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.schoolCode.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q);
  });

  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.schoolName?.toLowerCase().includes(q);
    }
    return true;
  });

  const teachersOnly = usersList.filter((u) => u.role === 'teacher');
  const principalsOnly = usersList.filter((u) => u.role === 'principal');

  if (isLoading && !dashboardData) {
    return (
      <DashboardLayout
        currentPath="/admin"
        onNavigate={onNavigate}
        title="Admin Portal"
        subtitle="Rishi Digital Solutions Master Administration"
      >
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Loading Platform Administration...</h3>
          <p className="text-xs text-slate-500 mt-1">Connecting to Rishi Digital Solutions Database</p>
        </div>
      </DashboardLayout>
    );
  }

  const kpis = dashboardData?.overview;

  return (
    <DashboardLayout
      currentPath="/admin"
      onNavigate={onNavigate}
      title="Admin Portal"
      subtitle="Rishi Digital Solutions Master Administration"
    >
      <div id="admin-dashboard-view" className="space-y-6 sm:space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                Rishi Digital Solutions
              </span>
              <span className="text-xs text-slate-500 font-medium">Master Company Administration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              RDS SMART LEARN Central Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Institution onboarding, multi-school authorization, teacher grade allocations, and platform telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Syllabus View</span>
          </button>
          <button
            onClick={loadAllData}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            title="Refresh Platform Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Platform Overview KPIs */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            id="admin-kpi-schools"
            title="Partner Schools"
            value={kpis.totalSchools}
            subtitle={`${kpis.activeSchools} active institutions`}
            icon={Building}
            iconColor="blue"
          />

          <StatCard
            id="admin-kpi-students"
            title="Enrolled Learners"
            value={kpis.totalStudents}
            subtitle={`${kpis.activeUsers} active users`}
            icon={GraduationCap}
            iconColor="emerald"
          />

          <StatCard
            id="admin-kpi-teachers"
            title="Teaching Faculty"
            value={kpis.totalTeachers}
            subtitle={`${kpis.totalPrincipals} Principals registered`}
            icon={Users}
            iconColor="purple"
          />

          <StatCard
            id="admin-kpi-assessments"
            title="Assessments Completed"
            value={kpis.totalTestsCompleted}
            subtitle={`${kpis.recentRegistrationsCount} new accounts in last 7 days`}
            icon={Award}
            iconColor="indigo"
          />
        </div>
      )}

      {/* 3. Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Platform Performance', icon: Award },
          { id: 'requests', label: `Teacher Requests (${pendingRequests.length})`, icon: FileText },
          { id: 'schools', label: `Schools Management (${schools.length})`, icon: Building },
          { id: 'assignments', label: `Teacher Allocations (${assignments.length})`, icon: Layers },
          { id: 'users', label: `User Accounts (${usersList.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: Platform Overview */}
      {activeTab === 'overview' && dashboardData && (
        <DashboardCard
          id="admin-overview-breakdown"
          title={
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>Partner Institution Performance Telemetry</span>
            </div>
          }
          subtitle="Real-time academic telemetry across onboarded schools"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="rds-table">
              <thead>
                <tr>
                  <th>School & Code</th>
                  <th>Location</th>
                  <th>Principal</th>
                  <th>Enrolled Learners</th>
                  <th>Teaching Faculty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.schools.map((sch) => (
                  <tr key={sch.id}>
                    <td>
                      <div>
                        <p className="font-bold text-slate-900">{sch.name}</p>
                        <p className="text-[11px] text-blue-600 font-mono font-semibold">{sch.schoolCode}</p>
                      </div>
                    </td>
                    <td className="text-slate-600 text-xs">
                      {sch.city || '—'}, {sch.district || '—'}
                    </td>
                    <td className="text-slate-700 font-medium">{sch.principalName || 'Unassigned'}</td>
                    <td>
                      <span className="font-bold text-slate-900">{sch.totalStudents ?? 0}</span>
                    </td>
                    <td className="font-mono text-slate-700">{sch.totalTeachers ?? 0}</td>
                    <td>
                      <StatusBadge status={sch.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}

      {/* TAB: Teacher Approval Requests */}
      {activeTab === 'requests' && (
        <DashboardCard
          id="admin-teacher-requests"
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Teacher Approval Requests</span>
            </div>
          }
          subtitle="Permission-based signups — teachers only gain portal access after your approval"
          bodyClassName="p-0"
        >
          <div className="px-5 pt-4 flex items-center gap-1 bg-slate-50 border-b border-slate-200">
            {(['pending', 'approved', 'rejected'] as const).map((st) => {
              const count =
                st === 'pending' ? pendingRequests.length : st === 'approved' ? approvedRequests.length : rejectedRequests.length;
              return (
                <button
                  key={st}
                  onClick={() => setRequestSubTab(st)}
                  className={`px-4 py-2 text-xs font-bold capitalize rounded-t-lg transition-colors ${
                    requestSubTab === st
                      ? 'bg-white text-blue-700 border border-b-white border-slate-200 -mb-px'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          {requestSubTab === 'pending' && (
            pendingRequests.length === 0 ? (
              <div className="p-10">
                <EmptyState
                  icon={CheckCircle2}
                  title="No pending teacher requests"
                  description="New teacher signup requests will appear here for your review and approval."
                />
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{req.fullName}</p>
                        <p className="text-xs text-slate-500">{req.email}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                        Pending
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold">School:</span> {req.schoolName}</p>
                      {req.phone && <p><span className="font-semibold">Phone:</span> {req.phone}</p>}
                      {req.employeeId && <p><span className="font-semibold">Employee ID:</span> {req.employeeId}</p>}
                      {req.qualification && <p><span className="font-semibold">Qualification:</span> {req.qualification}</p>}
                      <p><span className="font-semibold">Requested Classes:</span> {(req.requestedClasses || []).join(', ') || '—'}</p>
                      <p><span className="font-semibold">Requested Subjects:</span> {(req.requestedSubjects || []).join(', ') || '—'}</p>
                      {req.otherSubject && (
                        <p>
                          <span className="font-semibold">Other Subject:</span>{' '}
                          <span className="font-bold text-slate-900">{req.otherSubject}</span>
                        </p>
                      )}
                      <p className="text-slate-400">{new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        id={`approve-request-${req.id}`}
                        onClick={() => openApproveModal(req)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Review &amp; Approve
                      </button>
                      <button
                        id={`reject-request-${req.id}`}
                        onClick={() => {
                          setRejectTarget(req);
                          setRejectReason('');
                          setFormError(null);
                        }}
                        className="flex-1 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          {requestSubTab === 'approved' && (
            approvedRequests.length === 0 ? (
              <div className="p-10">
                <EmptyState icon={Users} title="No approved requests yet" description="Approved teacher accounts will be listed here." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="rds-table">
                  <thead>
                    <tr><th>Teacher</th><th>School</th><th>Classes</th><th>Subjects</th><th>Approved On</th></tr>
                  </thead>
                  <tbody>
                    {approvedRequests.map((r) => (
                      <tr key={r.id}>
                        <td><p className="font-bold text-slate-900">{r.fullName}</p><p className="text-[11px] text-slate-500">{r.email}</p></td>
                        <td>{r.schoolName}</td>
                        <td>{(r.requestedClasses || []).join(', ')}</td>
                        <td>
                          {(r.requestedSubjects || []).join(', ') || '—'}
                          {r.otherSubject && (
                            <span className="block text-[11px] text-slate-500">Other: {r.otherSubject}</span>
                          )}
                        </td>
                        <td className="text-xs">{r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {requestSubTab === 'rejected' && (
            rejectedRequests.length === 0 ? (
              <div className="p-10">
                <EmptyState icon={XCircle} title="No rejected requests" description="Rejected teacher requests (with reasons) will be listed here." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="rds-table">
                  <thead>
                    <tr><th>Teacher</th><th>Email</th><th>Rejection Reason</th><th>Reviewed On</th></tr>
                  </thead>
                  <tbody>
                    {rejectedRequests.map((r) => (
                      <tr key={r.id}>
                        <td className="font-bold text-slate-900">{r.fullName}</td>
                        <td className="text-xs">{r.email}</td>
                        <td className="text-xs text-red-700">{r.rejectionReason || '—'}</td>
                        <td className="text-xs">{r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </DashboardCard>
      )}

      {/* TAB 2: Schools Management */}
      {activeTab === 'schools' && (
        <DashboardCard
          id="admin-schools-table"
          title={
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>Partner Educational Institutions ({schools.length})</span>
            </div>
          }
          subtitle="Register new schools, manage institutional codes, assign principals, and control active status"
          headerAction={
            <div className="flex items-center gap-3">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search school name or code..."
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <button
                onClick={handleOpenCreateSchool}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add School</span>
              </button>
            </div>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="rds-table">
              <thead>
                <tr>
                  <th>Institution</th>
                  <th>Code</th>
                  <th>Location</th>
                  <th>Principal</th>
                  <th>Students / Faculty</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map((sch) => (
                  <tr key={sch.id}>
                    <td className="font-bold text-slate-900">{sch.name}</td>
                    <td className="font-mono font-bold text-blue-600">{sch.schoolCode}</td>
                    <td className="text-slate-600 text-xs">
                      {sch.city}, {sch.district}
                    </td>
                    <td className="text-slate-700">
                      {sch.principalName || (sch.principalId ? 'Assigned' : 'Unassigned')}
                    </td>
                    <td className="text-slate-700">
                      {sch.totalStudents ?? 0} Students / {sch.totalTeachers ?? 0} Teachers
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleSchoolStatus(sch)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <StatusBadge status={sch.status} size="sm" />
                      </button>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleOpenEditSchool(sch)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors"
                        title="Edit School"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}

      {/* TAB 3: Teacher Assignments */}
      {activeTab === 'assignments' && (
        <DashboardCard
          id="admin-assignments-table"
          title={
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Teacher Class & Subject Allocations ({assignments.length})</span>
            </div>
          }
          subtitle="Authorize teachers for grade levels and subject diagnostics across institutions"
          headerAction={
            <button
              onClick={() => {
                setAssignmentFormData({
                  teacherId: teachersOnly[0]?.id || '',
                  schoolId: schools[0]?.id || '',
                  classLevel: 'Class 10',
                  subjectId: 'mathematics',
                });
                setFormError(null);
                setFormSuccess(null);
                setShowAssignmentModal(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Teacher</span>
            </button>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="rds-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>School</th>
                  <th>Grade / Class</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((asgn) => (
                  <tr key={asgn.id}>
                    <td className="font-bold text-slate-900">{asgn.teacherName || asgn.teacherId}</td>
                    <td className="text-slate-700">{asgn.schoolName || asgn.schoolId}</td>
                    <td className="font-bold text-blue-600">{asgn.classLevel}</td>
                    <td className="capitalize text-slate-700">{asgn.subjectId}</td>
                    <td>
                      <StatusBadge status={asgn.isActive !== false ? 'active' : 'inactive'} size="sm" />
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDeleteAssignment(asgn.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition-colors"
                        title="Remove Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}

      {/* TAB 4: User Accounts Management */}
      {activeTab === 'users' && (
        <DashboardCard
          id="admin-users-table"
          title={
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>All Platform User Accounts ({usersList.length})</span>
            </div>
          }
          subtitle="Manage roles, institution association, and account statuses"
          headerAction={
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['all', 'teacher', 'principal', 'student', 'company_admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                      userRoleFilter === r ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setUserFormData({
                    fullName: '',
                    email: '',
                    password: '',
                    role: 'teacher',
                    schoolId: schools[0]?.id || '',
                    classLevel: 'Class 10',
                    assignedClasses: ['Class 10'],
                    assignedSubjects: ['Mathematics'],
                    mobileNumber: '',
                  });
                  setFormError(null);
                  setFormSuccess(null);
                  setShowUserModal(true);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </button>
            </div>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="rds-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>School</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <p className="font-bold text-slate-900">{u.fullName}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </td>
                    <td>
                      <span className="capitalize font-semibold text-slate-700 text-xs">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-slate-700">{u.schoolName || '—'}</td>
                    <td>
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <StatusBadge status={u.status} size="sm" />
                      </button>
                    </td>
                    <td className="text-right">
                      <span className="text-slate-400 font-mono text-[11px]">ID: {u.id.substring(0, 8)}...</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}

      {/* 5. MODAL: Add / Edit School */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>{editingSchool ? 'Edit Partner School' : 'Onboard Partner School'}</span>
              </h3>
              <button onClick={() => setShowSchoolModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSchool} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Telangana Model School"
                    value={schoolFormData.name}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">School Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TSMS-HYD-01"
                    value={schoolFormData.schoolCode}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, schoolCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={schoolFormData.city}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">District</label>
                  <input
                    type="text"
                    value={schoolFormData.district}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">State</label>
                  <input
                    type="text"
                    value={schoolFormData.state}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="admin@school.ts.gov.in"
                    value={schoolFormData.contactEmail}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assign Principal</label>
                  <select
                    value={schoolFormData.principalId}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, principalId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="">-- Select Principal (Optional) --</option>
                    {principalsOnly.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-2xs"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingSchool ? 'Save Changes' : 'Create School'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Assign Teacher */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Assign Teacher to Classroom</span>
              </h3>
              <button onClick={() => setShowAssignmentModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Teacher *</label>
                <select
                  required
                  value={assignmentFormData.teacherId}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="">-- Choose Teacher --</option>
                  {teachersOnly.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select School *</label>
                <select
                  required
                  value={assignmentFormData.schoolId}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, schoolId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="">-- Choose School --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.schoolCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Class Level</label>
                  <select
                    value={assignmentFormData.classLevel}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, classLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {TELANGANA_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Subject</label>
                  <select
                    value={assignmentFormData.subjectId}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="mathematics">Mathematics</option>
                    <option value="physical_science">Physical Science</option>
                    <option value="biological_science">Biological Science</option>
                    <option value="general_science">General Science</option>
                    <option value="social_studies">Social Studies</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-2xs"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Create User Account */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Create Platform Account</span>
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="principal">Principal</option>
                    <option value="company_admin">Company Admin</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Associated School</label>
                  <select
                    value={userFormData.schoolId}
                    onChange={(e) => setUserFormData({ ...userFormData, schoolId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="">-- Choose School --</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@school.ts.gov.in"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 8 characters"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-2xs"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 8. MODAL: Approve Teacher Request */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Approve Teacher Request</span>
              </h3>
              <button onClick={() => setApproveTarget(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-slate-700 space-y-1">
              <p><span className="font-bold">{approveTarget.fullName}</span> · {approveTarget.email}</p>
              <p>School: {schools[0]?.name || approveTarget.schoolName}</p>
              <p><span className="font-semibold">Requested Classes:</span> {(approveTarget.requestedClasses || []).join(', ') || '—'}</p>
              <p><span className="font-semibold">Requested Subjects:</span> {(approveTarget.requestedSubjects || []).join(', ') || '—'}</p>
              {approveTarget.otherSubject && (
                <p><span className="font-bold">Other Subject:</span> {approveTarget.otherSubject}</p>
              )}
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{formError}</div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Assign Class(es) *</label>
              <div className="flex flex-wrap gap-2">
                {TELANGANA_CLASSES.map((cls) => {
                  const active = approveClasses.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setApproveClasses((prev) => prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-500'}`}
                    >
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Assign Subject(s) *</label>
              <div className="flex flex-wrap gap-2">
                {approveSubjectOptions.map((sub) => {
                  const active = approveSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setApproveSubjects((prev) => prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-500'}`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Account Status *</label>
              <select
                value={approveStatus}
                onChange={(e) => setApproveStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active — teacher can sign in immediately</option>
                <option value="inactive">Inactive — account created but disabled</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setApproveTarget(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors">
                Cancel
              </button>
              <button
                id="confirm-approve-request-btn"
                onClick={handleApproveRequest}
                disabled={reqActionLoading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {reqActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Approve &amp; Create Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 9. MODAL: Reject Teacher Request */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Reject Request</h3>
              <button onClick={() => setRejectTarget(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Rejecting <span className="font-bold">{rejectTarget.fullName}</span> ({rejectTarget.email}). The applicant will see this reason if they attempt to sign in.
            </p>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{formError}</div>
            )}

            <label className="block">
              <span className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Rejection Reason *</span>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Position already filled for this subject."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </label>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setRejectTarget(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors">
                Cancel
              </button>
              <button
                id="confirm-reject-request-btn"
                onClick={handleRejectRequest}
                disabled={reqActionLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {reqActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Reject Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

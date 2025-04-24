import { useState } from "react";
import { useUserStore } from "../store/userStore";
import { useAttendance } from "../hooks/useAttendance";
import { format, parseISO } from "date-fns";
import { Employee } from "../types/attendance";

export const Dashboard = () => {
  const logout = useUserStore((s) => s.logout);
  const { data, isLoading, error } = useAttendance();
  const [activeTab, setActiveTab] = useState<"today" | "yesterday">("today");

  const todayEmployees = data?.attendance_data?.current_day?.employees ?? [];
  const yesterdayEmployees = data?.attendance_data?.yesterday?.employees ?? [];

  const formatTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = parseISO(dateString);
    return format(date, "h:mm a");
  };

  const getStatus = (employee: Employee) => {
    if (!employee.checked_in_at) return "Absent";
    if (!employee.checked_out_at) return "Working";
    return "Completed";
  };

  const statusColors: Record<string, string> = {
    Working: "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    Absent: "bg-gray-100 text-gray-800",
  };

  // Calculate statistics
  const currentEmployees = activeTab === "today" ? todayEmployees : yesterdayEmployees;
  
  const stats = {
    totalEmployees: currentEmployees.length,
    presentCount: currentEmployees.filter(e => e.checked_in_at).length,
    workingCount: currentEmployees.filter(e => e.checked_in_at && !e.checked_out_at).length,
    completedCount: currentEmployees.filter(e => e.checked_in_at && e.checked_out_at).length,
    averageCheckIn: calculateAverageTime(currentEmployees.map(e => e.checked_in_at)),
    averageCheckOut: calculateAverageTime(currentEmployees.map(e => e.checked_out_at)),
  };

  function calculateAverageTime(times: (string | null)[]): string {
    const validTimes = times
      .filter(Boolean)
      .map(time => parseISO(time!).getTime());
    
    if (validTimes.length === 0) return "--";
    
    const average = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
    return format(new Date(average), "h:mm a");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {data?.team?.name ?? "Team Dashboard"}
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 underline"
          >
            Logout
          </button>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="p-4 text-center text-gray-500">
            Loading attendance data...
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md text-center">
            Error fetching attendance data
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Employees" 
            value={stats.totalEmployees} 
            icon="👥"
          />
          <StatCard 
            title="Present Today" 
            value={`${stats.presentCount}/${stats.totalEmployees}`} 
            icon="✅"
          />
          <StatCard 
            title="Still Working" 
            value={stats.workingCount} 
            icon="⏳"
          />
          <StatCard 
            title="Avg. Check-in" 
            value={stats.averageCheckIn} 
            icon="⏰"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <TabButton
              active={activeTab === "today"}
              onClick={() => setActiveTab("today")}
            >
              Today ({data?.attendance_data?.current_day?.date})
            </TabButton>
            <TabButton
              active={activeTab === "yesterday"}
              onClick={() => setActiveTab("yesterday")}
            >
              Yesterday ({data?.attendance_data?.yesterday?.date})
            </TabButton>
          </nav>
        </div>

        {/* Attendance List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeTab === "today" ? todayEmployees : yesterdayEmployees).map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              formatTime={formatTime}
              getStatus={getStatus}
              statusColors={statusColors}
              isYesterday={activeTab === "yesterday"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Reusable Components

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <span className="text-lg">{icon}</span>
    </div>
    <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
      active
        ? "border-indigo-500 text-indigo-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    {children}
  </button>
);

const EmployeeCard = ({
  employee: emp,
  formatTime,
  getStatus,
  statusColors,
  isYesterday,
}: {
  employee: Employee;
  formatTime: (dateString: string | null) => string | null;
  getStatus: (employee: Employee) => string;
  statusColors: Record<string, string>;
  isYesterday: boolean;
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-lg p-4 ${
      isYesterday ? "opacity-80 hover:opacity-100" : "hover:border-gray-300"
    } transition-all`}
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-medium text-lg text-gray-900">{emp.name}</h3>
        <span className="text-xs text-gray-500">{emp.timezone}</span>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          statusColors[getStatus(emp)]
        }`}
      >
        {getStatus(emp)}
      </span>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
      <div>
        <p className="text-gray-500">Check-in</p>
        <p className="font-medium">
          {emp.checked_in_at ? formatTime(emp.checked_in_at) : "--"}
        </p>
      </div>
      <div>
        <p className="text-gray-500">Check-out</p>
        <p className="font-medium">
          {emp.checked_out_at ? (
            formatTime(emp.checked_out_at)
          ) : (
            <span className="text-blue-500">
              {isYesterday ? "No checkout" : "Still working"}
            </span>
          )}
        </p>
      </div>
    </div>

    {emp.checkout_message && (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Note:</span> {emp.checkout_message}
        </p>
      </div>
    )}
  </div>
);
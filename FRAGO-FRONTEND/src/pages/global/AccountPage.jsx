import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  LogOut,
  ChevronRight,
  Package,
  Heart,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-[80vh] bg-gray-50 pt-10 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Profile Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-700 ring-8 ring-green-50/50">
            <User size={48} strokeWidth={1.5} />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {user.full_name}
            </h1>
            <p className="text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {user.role}
              </span>
              <span className="text-sm">• Member since 2025</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-all font-semibold text-sm group"
          >
            <LogOut
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Quick Actions */}
          <div className="md:col-span-1 space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <Package
                  size={20}
                  className="text-gray-400 group-hover:text-green-600"
                />
                <span className="font-medium text-gray-700">My Orders</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <Heart
                  size={20}
                  className="text-gray-400 group-hover:text-green-600"
                />
                <span className="font-medium text-gray-700">Wishlist</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <Bell
                  size={20}
                  className="text-gray-400 group-hover:text-green-600"
                />
                <span className="font-medium text-gray-700">Notifications</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>

          {/* Right: Personal Details */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-2">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ">
              <InfoCard
                icon={<Mail size={20} />}
                label="Email Address"
                value={user.email}
              />
              <InfoCard
                icon={<Phone size={20} />}
                label="Phone Number"
                value={user.phone || "Not provided"}
              />
              <InfoCard
                icon={<MapPin size={20} />}
                label="Default Address"
                value={user.address || "Not provided"}
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2 p-4 bg-gray-50 rounded-2xl flex items-start gap-4 border border-dashed border-gray-200">
                <Shield className="text-green-600 shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                    Account Security
                  </p>
                  <p className="text-xs text-gray-500">
                    Your account is secured with 256-bit encryption and
                    multi-step verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, className = "" }) {
  return (
    <div
      className={`p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 transition-colors hover:bg-gray-50 ${className}`}
    >
      <div className="flex items-center gap-3 mb-2 text-gray-400">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-gray-900 font-medium ml-8">{value}</p>
    </div>
  );
}

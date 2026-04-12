import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Edit,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, token, logout, updateUserContext } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleSave = async () => {
    if (!formData.full_name) {
      toast.error("Full name is required");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/auth/profile/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateUserContext(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-[80vh] bg-gray-50 pt-10 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
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
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-900 text-white hover:bg-green-800 rounded-2xl transition-all font-semibold text-sm shadow-lg shadow-green-900/10"
              >
                <Edit size={18} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-900 text-white hover:bg-green-800 rounded-2xl transition-all font-semibold text-sm shadow-lg shadow-green-900/10 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl transition-all font-semibold text-sm"
                >
                  <X size={18} />
                  Cancel
                </button>
              </>
            )}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Quick Actions */}
          <div className="md:col-span-1 space-y-4">
            <Link
              to="/account/orders"
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Package
                  size={20}
                  className="text-gray-400 group-hover:text-green-600"
                />
                <span className="font-medium text-gray-700">My Orders</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </Link>
            <Link
              to="/wishlist"
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Heart
                  size={20}
                  className="text-gray-400 group-hover:text-green-600"
                />
                <span className="font-medium text-gray-700">Wishlist</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </Link>
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
                icon={<User size={20} />}
                label="Full Name"
                value={formData.full_name}
                isEditing={isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
              <InfoCard
                icon={<Phone size={20} />}
                label="Phone Number"
                value={formData.phone}
                isEditing={isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <InfoCard
                icon={<MapPin size={20} />}
                label="Default Address"
                value={formData.address}
                isEditing={isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-4 border border-dashed border-gray-200">
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

function InfoCard({
  icon,
  label,
  value,
  className = "",
  isEditing = false,
  onChange,
}) {
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
      {isEditing && onChange ? (
        <input
          type="text"
          value={value}
          onChange={onChange}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-900/10 focus:border-green-800 transition-all outline-none"
        />
      ) : (
        <p className="text-gray-900 font-medium ml-8">
          {value || "Not provided"}
        </p>
      )}
    </div>
  );
}

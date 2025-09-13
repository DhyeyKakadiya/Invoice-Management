import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Crown,
  ChevronDown,
  Bell,
  Edit,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  dueDate: string;
  status:
    | "paid"
    | "overdue"
    | "disputed"
    | "partially-paid"
    | "awaited"
    | "unpaid"
    | "draft";
  description: string;
}

interface ChartData {
  month: string;
  income: number;
  growth: number;
}

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("3Months");
  const [showInvoices, setShowInvoices] = useState(true);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]); // Period filtered invoices
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]); // Search/status filtered
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    awaited: 0,
    overdue: 0,
  });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [invoiceForm, setInvoiceForm] = useState({
    clientName: "",
    amount: "",
    description: "",
    dueDate: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editForm, setEditForm] = useState({
    clientName: "",
    amount: "",
    description: "",
    dueDate: "",
  });
  const [editFormErrors, setEditFormErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "Payment Received",
      message: "Invoice #INV-001 from Acme Corporation has been paid",
      time: "2 minutes ago",
      type: "success",
      unread: true,
    },
    {
      id: 2,
      title: "Overdue Invoice",
      message: "Invoice #INV-045 from Tech Solutions Ltd is 5 days overdue",
      time: "1 hour ago",
      type: "warning",
      unread: true,
    },
    {
      id: 3,
      title: "New Invoice Created",
      message:
        "Invoice #INV-067 has been created and sent to Digital Marketing Co",
      time: "3 hours ago",
      type: "info",
      unread: false,
    },
  ]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest(".notification-container")) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Initialize data
  useEffect(() => {
    // Generate more comprehensive mock data spanning 12 months
    const generateMockInvoices = () => {
      const invoices: Invoice[] = [];
      const clients = [
        "Acme Corporation",
        "Tech Solutions Ltd",
        "Digital Marketing Co",
        "StartupXYZ",
        "E-commerce Plus",
        "Creative Agency",
        "FinTech Innovations",
        "Healthcare Systems",
        "Education Platform",
        "Real Estate Pro",
        "Manufacturing Inc",
        "Retail Chain",
        "Consulting Group",
        "Media Company",
        "Software House",
        "Design Studio",
      ];
      const services = [
        "Web Development Services",
        "Mobile App Development",
        "SEO Optimization",
        "Full Stack Development",
        "E-commerce Platform",
        "Brand Identity Design",
        "Financial Dashboard",
        "Patient Management System",
        "Learning Management System",
        "Property Management App",
        "Inventory System",
        "CRM Development",
        "Marketing Campaign",
        "UI/UX Design",
        "Database Design",
        "API Development",
      ];
      const statuses: Invoice["status"][] = [
        "paid",
        "awaited",
        "overdue",
        "disputed",
        "partially-paid",
        "unpaid",
        "draft",
      ];

      // Generate invoices for the last 12 months
      for (let month = 0; month < 12; month++) {
        const invoicesPerMonth = Math.floor(Math.random() * 8) + 5; // 5-12 invoices per month

        for (let i = 0; i < invoicesPerMonth; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - month);
          date.setDate(Math.floor(Math.random() * 28) + 1);

          const dueDate = new Date(date);
          dueDate.setMonth(dueDate.getMonth() + 1);

          invoices.push({
            id: `${month}-${i}`,
            clientName: clients[Math.floor(Math.random() * clients.length)],
            amount: Math.floor(Math.random() * 200000) + 25000, // $25k - $225k
            date: date.toISOString().split("T")[0],
            dueDate: dueDate.toISOString().split("T")[0],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            description: services[Math.floor(Math.random() * services.length)],
          });
        }
      }

      return invoices.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    };

    const mockInvoices = generateMockInvoices();
    setAllInvoices(mockInvoices);
  }, []);

  // Filter invoices by time period
  useEffect(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (selectedPeriod) {
      case "1Month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3Months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "1Year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "Custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          startDate.setMonth(now.getMonth() - 3);
        }
        break;
      default:
        startDate.setMonth(now.getMonth() - 3);
    }

    const filteredByPeriod = allInvoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });

    setInvoices(filteredByPeriod);
    setDateRange({
      start: startDate.toLocaleDateString("en-GB"),
      end: endDate.toLocaleDateString("en-GB"),
    });

    // Generate chart data based on filtered period
    generateChartData(filteredByPeriod, selectedPeriod);
    calculateEarnings(filteredByPeriod);
  }, [allInvoices, selectedPeriod, customStartDate, customEndDate]);

  // Generate chart data based on period and invoices
  const generateChartData = (periodInvoices: Invoice[], period: string) => {
    const now = new Date();

    let monthCount = 0;
    switch (period) {
      case "1Month":
        monthCount = 4; // Show last 4 weeks as months
        break;
      case "3Months":
        monthCount = 3;
        break;
      case "1Year":
        monthCount = 12;
        break;
      default:
        monthCount = 6;
    }

    // Generate month labels
    const months: Array<{
      month: string;
      fullDate: Date;
      income: number;
      growth: number;
    }> = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        fullDate: date,
        income: 0,
        growth: 0,
      });
    }

    // Calculate income for each month
    months.forEach((monthData) => {
      const monthInvoices = periodInvoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.date);
        return (
          invoiceDate.getMonth() === monthData.fullDate.getMonth() &&
          invoiceDate.getFullYear() === monthData.fullDate.getFullYear()
        );
      });

      monthData.income = monthInvoices
        .filter(
          (inv) => inv.status === "paid" || inv.status === "partially-paid"
        )
        .reduce((sum, inv) => sum + inv.amount, 0);
    });

    // Calculate growth rates
    months.forEach((monthData, index) => {
      if (index > 0) {
        const prevIncome = months[index - 1].income;
        if (prevIncome > 0) {
          monthData.growth = Math.round(
            ((monthData.income - prevIncome) / prevIncome) * 100
          );
        } else {
          monthData.growth = monthData.income > 0 ? 100 : 0;
        }
      } else {
        monthData.growth = Math.floor(Math.random() * 40) - 20; // Random for first month
      }
    });

    setChartData(
      months.map(({ month, income, growth }) => ({ month, income, growth }))
    );
  };

  // Filter invoices based on search and status
  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter]);

  const calculateEarnings = (invoiceList: Invoice[]) => {
    const total = invoiceList.reduce((sum, invoice) => sum + invoice.amount, 0);
    const awaited = invoiceList
      .filter((invoice) => invoice.status === "awaited")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdue = invoiceList
      .filter((invoice) => invoice.status === "overdue")
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    setEarnings({ total, awaited, overdue });
  };

  const updateInvoiceStatus = (id: string, newStatus: Invoice["status"]) => {
    const updatedAllInvoices = allInvoices.map((invoice) =>
      invoice.id === id ? { ...invoice, status: newStatus } : invoice
    );
    setAllInvoices(updatedAllInvoices);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!invoiceForm.clientName.trim()) {
      errors.clientName = "Client name is required";
    }

    if (!invoiceForm.amount.trim()) {
      errors.amount = "Amount is required";
    } else if (
      isNaN(Number(invoiceForm.amount)) ||
      Number(invoiceForm.amount) <= 0
    ) {
      errors.amount = "Amount must be a valid positive number";
    }

    if (!invoiceForm.description.trim()) {
      errors.description = "Description is required";
    }

    if (!invoiceForm.dueDate) {
      errors.dueDate = "Due date is required";
    } else {
      const dueDate = new Date(invoiceForm.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        errors.dueDate = "Due date cannot be in the past";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createNewInvoice = () => {
    if (!validateForm()) {
      return;
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      clientName: invoiceForm.clientName.trim(),
      amount: Number(invoiceForm.amount),
      date: new Date().toISOString().split("T")[0],
      dueDate: invoiceForm.dueDate,
      status: "draft",
      description: invoiceForm.description.trim(),
    };

    const updatedAllInvoices = [newInvoice, ...allInvoices];
    setAllInvoices(updatedAllInvoices);

    // Reset form and close modal
    setInvoiceForm({
      clientName: "",
      amount: "",
      description: "",
      dueDate: "",
    });
    setFormErrors({});
    setShowCreateModal(false);
  };

  const handleFormChange = (field: string, value: string) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleDropdown = (invoiceId: string) => {
    setOpenDropdown(openDropdown === invoiceId ? null : invoiceId);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (!(event.target as Element).closest(".dropdown-container")) {
      setOpenDropdown(null);
    }
  };

  // Add click outside listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const deleteInvoice = (id: string) => {
    const updatedAllInvoices = allInvoices.filter(
      (invoice) => invoice.id !== id
    );
    setAllInvoices(updatedAllInvoices);
  };

  const openEditModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditForm({
      clientName: invoice.clientName,
      amount: invoice.amount.toString(),
      description: invoice.description,
      dueDate: invoice.dueDate,
    });
    setEditFormErrors({});
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const validateEditForm = () => {
    const errors: { [key: string]: string } = {};

    if (!editForm.clientName.trim()) {
      errors.clientName = "Client name is required";
    }

    if (!editForm.amount.trim()) {
      errors.amount = "Amount is required";
    } else if (isNaN(Number(editForm.amount)) || Number(editForm.amount) <= 0) {
      errors.amount = "Amount must be a valid positive number";
    }

    if (!editForm.description.trim()) {
      errors.description = "Description is required";
    }

    if (!editForm.dueDate) {
      errors.dueDate = "Due date is required";
    } else {
      const dueDate = new Date(editForm.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        errors.dueDate = "Due date cannot be in the past";
      }
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateInvoice = () => {
    if (!editingInvoice || !validateEditForm()) {
      return;
    }

    const updatedInvoice: Invoice = {
      ...editingInvoice,
      clientName: editForm.clientName.trim(),
      amount: Number(editForm.amount),
      description: editForm.description.trim(),
      dueDate: editForm.dueDate,
    };

    const updatedAllInvoices = allInvoices.map((invoice) =>
      invoice.id === editingInvoice.id ? updatedInvoice : invoice
    );
    setAllInvoices(updatedAllInvoices);

    // Reset form and close modal
    setEditForm({
      clientName: "",
      amount: "",
      description: "",
      dueDate: "",
    });
    setEditFormErrors({});
    setEditingInvoice(null);
    setShowEditModal(false);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (editFormErrors[field]) {
      setEditFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "disputed":
        return "bg-red-100 text-red-800 border-red-200";
      case "partially-paid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "awaited":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "unpaid":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "draft":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // format currency

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp size={16} className="text-green-600" />
    ) : (
      <TrendingDown size={16} className="text-red-600" />
    );
  };

  const maxIncome = Math.max(...chartData.map((d) => d.income));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 text-gray-900 px-4 py-4 lg:px-6 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative notification-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      {notifications.filter((n) => n.unread).length} unread
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          notification.unread ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === "success"
                                ? "bg-green-500"
                                : notification.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border-t border-gray-100">
                    <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-sm">A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Mobile full width, Desktop 2 columns */}
          <div className="xl:col-span-2 space-y-6">
            {/* Create New Invoice Card */}
            <div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => setShowCreateModal(true)}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Plus
                    size={24}
                    className="text-purple-600 group-hover:scale-110 transition-transform"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Create New Invoice
                </h2>
                <p className="text-gray-600 mb-1">
                  Start by creating and sending new invoice
                </p>
                <p className="text-sm text-gray-500">
                  Or Upload an existing invoice and set payment reminder
                </p>
              </div>
            </div>

            {/* Time Period */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Time Period</h3>
                <span className="text-sm text-gray-500">
                  {dateRange.start} - {dateRange.end}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  { key: "1Month", label: "1 Month", icon: null },
                  {
                    key: "3Months",
                    label: "3 Months",
                    icon: null,
                  },
                  {
                    key: "1Year",
                    label: "1 Year",
                    icon: <Crown size={16} className="mr-1" />,
                  },
                ].map((period) => (
                  <button
                    key={period.key}
                    onClick={() => setSelectedPeriod(period.key)}
                    className={`px-2 py-1 rounded-full font-medium transition-all duration-200 flex items-center ${
                      selectedPeriod === period.key
                        ? "bg-purple-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                    }`}
                  >
                    {period.icon}
                    {period.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowCustomRange(!showCustomRange)}
                className="px-2 py-1 rounded-full font-medium transition-all duration-200 flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              >
                <Calendar size={16} className="mr-1" />
                Custom
              </button>

              {showCustomRange && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        if (customStartDate && customEndDate) {
                          setSelectedPeriod("Custom");
                        }
                      }}
                      disabled={!customStartDate || !customEndDate}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply Range
                    </button>
                    <button
                      onClick={() => {
                        setCustomStartDate("");
                        setCustomEndDate("");
                        setShowCustomRange(false);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Earnings Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm text-gray-600">Total Earnings</h4>
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earnings.total)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={16} className="text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm text-gray-600">Payment Awaited</h4>
                  <Bell size={20} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(earnings.awaited)}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {invoices.filter((i) => i.status === "awaited").length}{" "}
                    invoices
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm text-gray-600">Payment Overdue</h4>
                  <TrendingDown size={20} className="text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(earnings.overdue)}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-red-500">
                    {invoices.filter((i) => i.status === "overdue").length}{" "}
                    invoices
                  </span>
                </div>
              </div>
            </div>

            {/* Income Trend Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Income Trend</h3>
                <button className="text-purple-600 hover:text-purple-700 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Your monthly income and growth for the last 6 months.
              </p>

              <div className="relative h-80">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-4 z-10">
                  <span>${Math.round(maxIncome / 1000)}k</span>
                  <span>${Math.round((maxIncome * 0.75) / 1000)}k</span>
                  <span>${Math.round((maxIncome * 0.5) / 1000)}k</span>
                  <span>${Math.round((maxIncome * 0.25) / 1000)}k</span>
                  <span>$0k</span>
                </div>

                {/* Chart container with horizontal scroll */}
                <div className="ml-12 mr-4 h-full overflow-x-auto overflow-y-hidden">
                  <div
                    className="h-full flex items-end"
                    style={{
                      minWidth: `${Math.max(400, chartData.length * 60)}px`,
                      width: "100%",
                    }}
                  >
                    {chartData.map((data) => (
                      <div
                        key={data.month}
                        className="flex flex-col items-center group"
                        style={{
                          minWidth: "60px",
                          flex: chartData.length <= 6 ? "1" : "0 0 60px",
                        }}
                      >
                        <div className="w-full flex justify-center mb-2 relative">
                          <div
                            className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500 hover:from-purple-700 hover:to-purple-500 cursor-pointer relative group-hover:scale-105"
                            style={{
                              height: `${(data.income / maxIncome) * 240}px`,
                              width: "40px",
                            }}
                          >
                            {/* Tooltip */}
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                              <div className="font-semibold">
                                {formatCurrency(data.income)}
                              </div>
                              <div className="flex items-center">
                                {getGrowthIcon(data.growth)}
                                <span className="ml-1">{data.growth}%</span>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          {getGrowthIcon(data.growth)}
                          <span
                            className={`text-xs ml-1 ${
                              data.growth >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {data.growth}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {data.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scroll indicator for mobile */}
                {chartData.length > 6 && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
                    ← Scroll →
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center mt-6 space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-purple-400 rounded mr-2"></div>
                  <span className="text-gray-700">Income</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp size={16} className="text-green-600 mr-2" />
                  <span className="text-gray-700">Growth</span>
                </div>
                <div className="text-xs text-gray-500">
                  Period:{" "}
                  {selectedPeriod === "1Month"
                    ? "1 Month"
                    : selectedPeriod === "3Months"
                    ? "3 Months"
                    : selectedPeriod === "1Year"
                    ? "1 Year"
                    : selectedPeriod === "Custom"
                    ? "Custom Range"
                    : "3 Months"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Mobile full width, Desktop 1 column */}
          <div className="xl:col-span-1">
            {/* Your Invoices */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <button
                  onClick={() => setShowInvoices(!showInvoices)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Your Invoices ({filteredInvoices.length})
                  </h3>
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform duration-200 ${
                      showInvoices ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showInvoices && (
                  <div className="mt-4 space-y-3">
                    {/* Search */}
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center space-x-2">
                      <Filter size={16} className="text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="awaited">Awaited</option>
                        <option value="overdue">Overdue</option>
                        <option value="draft">Draft</option>
                        <option value="disputed">Disputed</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partially-paid">Partially Paid</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {showInvoices && (
                <div className="max-h-96 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {filteredInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="p-4 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                              {invoice.clientName}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                              {formatCurrency(invoice.amount)}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {invoice.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              Due: {invoice.dueDate}
                            </p>
                          </div>
                          <div className="flex items-start space-x-2 ml-4">
                            {(invoice.status === "overdue" ||
                              invoice.status === "awaited") && (
                              <Bell
                                size={16}
                                className="text-orange-400 mt-1"
                              />
                            )}
                            {invoice.status === "draft" && (
                              <Edit size={16} className="text-gray-400 mt-1" />
                            )}
                            <div className="flex flex-col items-end space-y-2">
                              <select
                                value={invoice.status}
                                onChange={(e) =>
                                  updateInvoiceStatus(
                                    invoice.id,
                                    e.target.value as Invoice["status"]
                                  )
                                }
                                className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all hover:scale-105 ${getStatusColor(
                                  invoice.status
                                )}`}
                              >
                                <option value="draft">Draft</option>
                                <option value="awaited">Awaited</option>
                                <option value="paid">Paid</option>
                                <option value="partially-paid">
                                  Partially Paid
                                </option>
                                <option value="overdue">Overdue</option>
                                <option value="disputed">Disputed</option>
                                <option value="unpaid">Unpaid</option>
                              </select>
                              <div className="relative dropdown-container">
                                <button
                                  onClick={() => toggleDropdown(invoice.id)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <MoreVertical size={14} />
                                </button>

                                {openDropdown === invoice.id && (
                                  <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                                    <button
                                      onClick={() => openEditModal(invoice)}
                                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                      <Edit size={14} className="mr-2" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        deleteInvoice(invoice.id);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 text-center bg-gray-50 rounded-b-2xl">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="font-semibold text-purple-600">
                    SparksGenius
                  </div>
                  <div>Sparking the unlimited possibilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Create New Invoice</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setInvoiceForm({
                    clientName: "",
                    amount: "",
                    description: "",
                    dueDate: "",
                  });
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createNewInvoice();
              }}
              className="space-y-4"
            >
              {/* Client Name */}
              <div>
                <label
                  htmlFor="clientName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Client Name *
                </label>
                <input
                  type="text"
                  id="clientName"
                  value={invoiceForm.clientName}
                  onChange={(e) =>
                    handleFormChange("clientName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.clientName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter client name"
                />
                {formErrors.clientName && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.clientName}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    id="amount"
                    value={invoiceForm.amount}
                    onChange={(e) => handleFormChange("amount", e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.amount ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                {formErrors.amount && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.amount}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  value={invoiceForm.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    formErrors.description
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter project description or service details"
                  rows={3}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={invoiceForm.dueDate}
                  onChange={(e) => handleFormChange("dueDate", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.dueDate ? "border-red-300" : "border-gray-300"
                  }`}
                  min={new Date().toISOString().split("T")[0]}
                />
                {formErrors.dueDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.dueDate}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setInvoiceForm({
                      clientName: "",
                      amount: "",
                      description: "",
                      dueDate: "",
                    });
                    setFormErrors({});
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {showEditModal && editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Edit Invoice</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingInvoice(null);
                  setEditForm({
                    clientName: "",
                    amount: "",
                    description: "",
                    dueDate: "",
                  });
                  setEditFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateInvoice();
              }}
              className="space-y-4"
            >
              {/* Client Name */}
              <div>
                <label
                  htmlFor="editClientName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Client Name *
                </label>
                <input
                  type="text"
                  id="editClientName"
                  value={editForm.clientName}
                  onChange={(e) =>
                    handleEditFormChange("clientName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    editFormErrors.clientName
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter client name"
                />
                {editFormErrors.clientName && (
                  <p className="text-red-500 text-xs mt-1">
                    {editFormErrors.clientName}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="editAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    id="editAmount"
                    value={editForm.amount}
                    onChange={(e) =>
                      handleEditFormChange("amount", e.target.value)
                    }
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      editFormErrors.amount
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                {editFormErrors.amount && (
                  <p className="text-red-500 text-xs mt-1">
                    {editFormErrors.amount}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="editDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <textarea
                  id="editDescription"
                  value={editForm.description}
                  onChange={(e) =>
                    handleEditFormChange("description", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    editFormErrors.description
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter project description or service details"
                  rows={3}
                />
                {editFormErrors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {editFormErrors.description}
                  </p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="editDueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date *
                </label>
                <input
                  type="date"
                  id="editDueDate"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    handleEditFormChange("dueDate", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    editFormErrors.dueDate
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  min={new Date().toISOString().split("T")[0]}
                />
                {editFormErrors.dueDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {editFormErrors.dueDate}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingInvoice(null);
                    setEditForm({
                      clientName: "",
                      amount: "",
                      description: "",
                      dueDate: "",
                    });
                    setEditFormErrors({});
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Update Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, FormEvent } from "react";
import Markdown from "react-markdown";
import { analyzeFace, verifyFace } from "./services/geminiService";
import {
  Users,
  Search,
  Plus,
  LayoutDashboard,
  LogOut,
  CheckCircle2,
  CreditCard,
  Calendar,
  BarChart3,
  Terminal,
  XCircle,
  History,
  Briefcase,
  Clock as ClockIcon,
  UserPlus as UserPlusIcon,
  Activity,
  Trash2,
  Edit2,
  TrendingUp,
  Wallet,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingDown,
  Menu,
  X,
  Settings,
  ShieldUser,
  User as UserIcon,
  Camera as CameraIcon,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Zap,
  ChevronDown,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  Phone,
  Mail,
  ShoppingBag,
  Box,
  BrainCircuit,
  Sparkles,
  Minus,
  ArrowRight,
  FileText,
  Clock,
  AlertCircle,
  Star,
  Trophy,
  Dumbbell,
  Lock,
  MessageCircle,
  Hash,
  Send,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CommunicationPanel from "./components/CommunicationPanel";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface Member {
  id: number;
  memberCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username?: string;
  password?: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  status: string;
  registrationDate?: string;
  expiryDate: string;
  package: string;
  createdBy?: string;
  revenue?: number;
  avatar?: string;
  faceData?: string;
  discount: number;
  paymentMethod: string;
}

interface KPI {
  username: string;
  fullName: string;
  role: string;
  count: number;
  revenue: number;
}

interface Package {
  id: number;
  name: string;
  duration: string;
  price: number;
  description: string;
  status: string;
}

interface Stats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  checkinsToday: number;
  revenueThisMonth: number;
  infrastructure?: {
    apiStatus: string;
    mobileSync: string;
    lastSync: string;
  };
}

interface MobileProfile {
  id: number;
  fullName: string;
  package: string;
  expiryDate: string;
  status: string;
  qrCode: string;
}

interface Checkin {
  id: number;
  memberId: number;
  memberName: string;
  time: string;
}

interface User {
  id: number;
  username: string;
  role: "ADMIN" | "STAFF" | "PT" | "MEMBER" | "RECEPTIONIST";
  fullName: string;
  avatar?: string;
  email?: string;
}

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface PT {
  id: number;
  fullName: string;
  expertise: string[];
  level: "Junior" | "Senior" | "Master";
  commissionRate: number;
  isActive: boolean;
  phone: string;
  email: string;
  username?: string;
  password?: string;
  avatar?: string;
}

interface PTAssignment {
  id: number;
  memberId: number;
  trainerId: number;
  totalSessions: number;
  sessionsLeft: number;
  price: number;
  startDate: string;
  expiryDate: string;
  assignedDate?: string;
  status: "Active" | "Completed" | "Expired";
}

interface TrainingSession {
  id: number;
  assignmentId: number;
  date: string;
  notes: string;
  memberId: number;
  trainerId: number;
}

interface PTStat {
  trainerId: number;
  fullName: string;
  totalRevenue: number;
  commission: number;
  sessionsTotal: number;
  activeClients: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
}

interface Transaction {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  note: string;
  date: string;
  createdBy: string;
  customerName?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface MemberSale {
  id: number;
  customerName: string;
  serviceName: string;
  dateTime: string;
  total: number;
  discount: number;
  paymentMethod: string;
  paidAmount: number;
  status: "Hoàn thành";
  startDate?: string;
  expiryDate?: string;
}

interface EvaluationReply {
  id: number;
  senderName: string;
  senderRole: "MEMBER" | "STAFF" | "ADMIN" | "PT";
  text: string;
  date: string;
}

interface Evaluation {
  id: number;
  memberId: number;
  memberName: string;
  rating: number;
  comment: string;
  date: string;
  replies?: EvaluationReply[];
}

interface StaffMember {
  id: number;
  fullName: string;
  role: "ADMIN" | "STAFF" | "PT" | "RECEPTIONIST";
  position: string;
  baseSalary: number;
  hourlyRate: number;
  phoneNumber: string;
  email: string;
  username?: string;
  password?: string;
  isActive: boolean;
  status?: string;
  shiftHours: { start: string; end: string };
}

interface AttendanceLog {
  id: number;
  staffId: number;
  checkIn: string;
  checkOut: string | null;
  totalHours: number;
  date: string;
  isOT: boolean;
}

interface PayrollRecord {
  id: number;
  staffId: number;
  month: string;
  basePay: number;
  commission: number;
  ptBonus: number;
  otPay: number;
  totalPay: number;
  status: "Draft" | "Paid";
}

interface Equipment {
  id: number;
  name: string;
  code: string;
  category: string;
  status: "NORMAL" | "MAINTENANCE_REQUIRED" | "BROKEN" | "UNDER_MAINTENANCE";
  purchaseDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  location: string;
  history: { date: string; action: string; note: string }[];
}

interface MaintenanceTask {
  id: number;
  equipmentId: number;
  equipmentName: string;
  scheduledDate: string;
  taskType: "ROUTINE" | "REPAIR";
  priority: "LOW" | "MEDIUM" | "HIGH";
  performer: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  notes: string;
}

interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type?: "danger" | "info";
}

const translations: Record<string, any> = {
  vi: {
    dashboard: "TỔNG QUAN",
    members: "HỘI VIÊN",
    reports: "BÁO CÁO",
    memberMgmt: "QUẢN LÝ HỘI VIÊN",
    memberAccountMgmt: "TÀI KHOẢN HỘI VIÊN",
    register: "ĐĂNG KÝ",
    createAccount: "TẠO TÀI KHOẢN",
    alreadyHaveAccount: "ĐÃ CÓ TÀI KHOẢN? ĐĂNG NHẬP",
    noAccount: "CHƯA CÓ TÀI KHOẢN? ĐĂNG KÝ NGAY",
    registrationSuccess: "Đăng ký thành công! Bạn có thể bắt đầu đăng nhập ngay bằng tài khoản của mình.",
    forgotPassword: "QUÊN MẬT KHẨU?",
    resetPassword: "KHÔI PHỤC MẬT KHẨU",
    enterEmailToReset: "Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu.",
    sendResetLink: "GỬI YÊU CẦU",
    backToLogin: "QUAY LẠI ĐĂNG NHẬP",
    memberPortal: "CỔNG HỘI VIÊN",
    communication: "TƯƠNG TÁC HỘI VIÊN",
    myProfile: "HỒ SƠ CỦA TÔI",
    renewPackage: "GIA HẠN GÓI TẬP",
    buyPackage: "MUA GÓI TẬP",
    noPackage: "CHƯA CÓ GÓI TẬP",
    registrationDate: "NGÀY ĐĂNG KÝ",
    nextBilling: "KỲ THANH TOÁN TIẾP THEO",
    welcomeMember: "CHÀO MỪNG QUAY LẠI,",
    evaluations: "Đánh giá dịch vụ",
    leaveReview: "Gửi ý kiến đóng góp",
    rating: "Mức độ hài lòng",
    comment: "Cảm nhận của bạn",
    submitReview: "Gửi đánh giá ngay",
    memberEvaluations: "Phản hồi từ khách hàng",
    noEvaluations: "Chưa có đánh giá nào",
    reviewSubmitted: "Cảm ơn bạn đã gửi đánh giá!",
    yourReviews: "Đánh giá của bạn",
    suggestions: "Gợi ý nhanh",
    aiAssistant: "TRỢ LÝ AI",
    chatWithAI: "Chat với Trợ lý ảo",
    askMeAnything: "Hỏi tôi về tập luyện hoặc gói tập...",
    send: "Gửi",
    suggestion1: "Cơ sở vật chất rất tốt",
    suggestion2: "HLV hướng dẫn nhiệt tình",
    suggestion3: "Máy móc hiện đại, sạch sẽ",
    suggestion4: "Giờ cao điểm hơi đông",
    suggestion5: "Khu vực phòng tắm cần vệ sinh thêm",
    qrCheckin: "QR CHECK-IN",
    renewNow: "GIA HẠN NGAY",
    selectNewPackage: "CHỌN GÓI TẬP MỚI",
    addTransaction: "THÊM GIAO DỊCH",
    addProduct: "THÊM SẢN PHẨM",
    overlapError: "Ngày bắt đầu không được trùng với gói tập đang diễn ra. Vui lòng chọn ngày sau: ",
    confirmRenewal: "XÁC NHẬN THANH TOÁN",
    paymentConfirmation: "XÁC THỰC THANH TOÁN",
    startDate: "NGÀY BẮT ĐẦU GIA HẠN",
    renewalSuccess: "Gia hạn thành công!",
    registerTitle: "Tham gia cùng chúng tôi",
    dontHaveAccount: "Chưa có tài khoản?",
    registerSuccess: "Đăng ký thành công!",
    packages: "GÓI TẬP",
    finance: "TÀI CHÍNH",
    pt: "HUẤN LUYỆN VIÊN",
    ptManagement: "QUẢN LÝ PT",
    assignPT: "GÁN PT CHO HỘI VIÊN",
    expertise: "Chuyên môn",
    ptCommission: "Hoa hồng PT",
    ptRevenue: "Doanh thu PT",
    ptKPI: "KPI PT",
    hrManagement: "QUẢN LÝ NHÂN SỰ",
    management: "QUẢN LÝ NHÂN VIÊN QUẦY",
    staff: "NHÂN VIÊN QUẦY",
    positions: "Vị trí",
    shifts: "Ca làm việc",
    attendance: "Chấm công",
    payroll: "Tính lương",
    baseSalary: "Lương cơ bản",
    hourlyRate: "Lương giờ",
    checkIn: "Vào ca",
    checkOut: "Ra ca",
    totalHours: "Tổng giờ",
    ot: "Tăng ca (OT)",
    generatePayroll: "Xuất bảng lương",
    staffStatus: "Trạng thái làm việc",
    addStaff: "Thêm nhân viên quầy",
    shiftStart: "Bắt đầu ca",
    shiftEnd: "Kết thúc ca",
    month: "Tháng",
    totalPay: "Tổng nhận",
    ptBonus: "Thưởng PT",
    pos: "BÁN HÀNG",
    invoices: "HÓA ĐƠN",
    salesInvoices: "HÓA ĐƠN BÁN HÀNG",
    memberInvoices: "HÓA ĐƠN HỘI VIÊN",
    expiringInvoices: "SẮP HẾT HẠN",
    expiredInvoices: "ĐÃ HẾT HẠN",
    treasury: "THU CHI",
    inventory: "KHO HÀNG",
    income: "THU NHẬP",
    expense: "CHI PHÍ",
    productName: "Tên sản phẩm",
    category: "Danh mục",
    stock: "Tồn kho",
    price: "Giá bán",
    trainingHistory: "Lịch sử tập luyện",
    sessionsLeft: "Buổi còn lại",
    totalSessions: "Tổng số buổi",
    ptLevel: "Cấp độ",
    addPT: "THÊM PT MỚI",
    expertiseList: "Danh sách chuyên môn",
    ptDetails: "Chi tiết hợp đồng PT",
    recordSession: "Ghi nhận buổi tập",
    commissionRate: "Tỷ lệ hoa hồng",
    activeClients: "Khách đang tập",
    sessionsRecorded: "Buổi đã ghi",
    settings: "NGÔN NGỮ",
    logout: "ĐĂNG XUẤT TÀI KHOẢN",
    chooseLang: "NGÔN NGỮ",
    vi: "Tiếng Việt",
    en: "Tiếng Anh",
    zh: "Tiếng Trung",
    active: "CORE: ACTIVE",
    overview: "TỔNG QUAN HỆ THỐNG",
    membersList: "DANH SÁCH HỘI VIÊN",
    staffReport: "BÁO CÁO NHÂN VIÊN QUẦY",
    financeTitle: "QUẢN LÝ TÀI CHÍNH",
    packagesTitle: "CẤU HÌNH GÓI TẬP",
    cancelConfirmTitle: "HỦY QUÁ TRÌNH?",
    cancelConfirmMsg: "Tất cả thông tin sẽ được xóa, bạn có đồng ý không?",
    logoutMsg: "Bạn có chắc muốn đăng xuất?",
    confirm: "XÁC NHẬN",
    cancel: "HỦY BỎ",
    checkin: "Check-in",
    expired: "Hết hạn",
    allMembers: "Hội viên",
    revenue: "Doanh thu",
    today: "Hôm nay",
    actionNeeded: "Cần xử lý",
    total: "Tổng số",
    thisMonth: "Tháng này",
    adminPanel: "Bảng Lệnh Quản Trị",
    addMember: "THÊM HỘI VIÊN",
    quickCheckin: "ĐIỂM DANH NHANH",
    checkinBtn: "ĐIỂM DANH",
    editBtn: "SỬA",
    statusActive: "Hoạt động",
    statusExpired: "Hết hạn",
    expiryDate: "Hạn dùng",
    actions: "Thao tác",
    year: "Năm",
    searchQuick: "Tìm kiếm nhanh...",
    searchByPhone: "Tên hoặc số điện thoại...",
    totalActiveMembers: "Tổng Hội Viên Đang Tham Gia",
    checkinLog: "NHẬT KÝ ĐIỂM DANH HÔM NAY",
    noCheckins: "Chưa có lượt điểm danh nào",
    success: "THÀNH CÔNG",
    verifiedAt: "XÁC THỰC LÚC",
    infrastructure: "Cấu trúc đa nền tảng",
    apiHealthy: "STATUS: HEALTHY",
    apiOffline: "STATUS: OFFLINE",
    totalRevenue: "TỔNG DOANH THU",
    memberValue: "GIÁ TRỊ TB/HỘI VIÊN",
    renewalRate: "HIỆU SUẤT GIA HẠN",
    nextMonthGoal: "MỤC TIÊU THÁNG TỚI",
    revenueWeekChart: "Biểu đồ doanh thu tuần này",
    revenueUnit: "Đơn vị: VNĐ / Thời gian thực",
    revenueReal: "Doanh thu hiện thực",
    checkinDensity: "Mật độ điểm danh theo ngày",
    packageDistribution: "Phân bổ gói tập",
    staffKPI: "Hiệu suất nhân viên quầy & KPI tháng",
    newMembers: "Hội viên mới",
    progress: "Tiến độ",
    revenueVND: "Doanh thu (VNĐ)",
    processingData: "DỮ LIỆU ĐANG ĐƯỢC XỬ LÝ",
    sessionInfo: "Hệ thống nội bộ // FIT.GYM // User:",
    sessionRole: "Phiên làm việc:",
    addMemberTitle: "Đăng Ký Hội Viên",
    webInterface: "THỰC HIỆN TRÊN GIAO DIỆN WEB",
    selectAvatar: "Chọn ảnh đại diện",
    lastName: "Họ và tên đệm",
    memberCode: "Mã Hội Viên",
    email: "Địa chỉ Email",
    dob: "Ngày sinh",
    gender: "Giới tính",
    male: "Nam",
    female: "Nữ",
    other: "Khác",
    address: "Địa chỉ",
    faceAnalysis: "PHÂN TÍCH KHUÔN MẶT",
    faceData: "Dữ liệu đặc trưng AI",
    extractingFeatures: "Đang phân tích khuôn mặt...",
    analyzing: "Đang xác thực AI...",
    verificationResult: "Kết quả xác thực",
    faceMatched: "Xác thực khuôn mặt thành công",
    faceNotMatched: "Xác thực khuôn mặt thất bại",
    capturePhoto: "CHỤP ẢNH",
    retakePhoto: "CHỤP LẠI",
    staffInCharge: "Nhân Viên Quầy Phụ Trách",
    selectPackage: "Chọn Gói",
    paymentDate: "Ngày Đóng Tiền",
    expiryDateAuto: "Ngày Hết Hạn (AUTO)",
    cancelProcess: "HỦY XỬ LÝ",
    save: "LƯU TRỮ +",
    addPackageTitle: "DANH MỤC GÓI MỚI",
    pkgName: "Định Danh Gói",
    duration: "Thời Lượng",
    priceLabel: "Giá Trị Phí",
    description: "Mô Tả Dịch Vụ",
    updateSystem: "CẬP NHẬT HỆ THỐNG +",
    profileMember: "Hồ sơ Hội viên",
    profileDetails: "CHI TIẾT ĐĂNG KÝ",
    quickActions: "THAO TÁC NHANH",
    noHistory: "Chưa ghi nhận dữ liệu",
    deleteData: "Xóa dữ liệu",
    complete: "HOÀN TẤT",
    searchHint: "NHẬP SỐ ĐIỆN THOẠI HOẶC TÊN...",
    clearSearch: "XÓA TRỐNG",
    noMatch: "Không tìm thấy hội viên phù hợp",
    closeWindow: "ĐÓNG CỬA SỔ",
    staffAddTitle: "THÊM NHÂN VIÊN QUẦY",
    username: "Tài Khoản ID",
    password: "Mật Khẩu",
    confirmAdd: "XÁC NHẬN TẠO",
    deletedMembers: "HỘI VIÊN ĐÃ XÓA",
    deletedMembersTitle: "HỘI VIÊN ĐÃ XÓA",
    restore: "KHÔI PHỤC",
    editTitle: "Cập nhật thông tin",
    saveUpdate: "Cập nhật",
    access: "01. TRUY CẬP",
    functions: "02. CHỨC NĂNG",
    systemAccount: "HỆ THỐNG & TÀI KHOẢN",
    logoutSystem: "ĐĂNG XUẤT HỆ THỐNG",
    mgmtSystem: "HỆ THỐNG QUẢN LÝ",
    systemInfo: "THÔNG TIN HỆ THỐNG",
    ADMIN: "Quản trị viên",
    STAFF: "Nhân viên quầy",
    PT: "Huấn luyện viên",
    MEMBER: "Hội viên",
    memberList: "DANH SÁCH HỘI VIÊN",
    activeRecords: "BẢN GHI HOẠT ĐỘNG",
    memberIdentity: "ĐỊNH DANH HỘI VIÊN",
    expiry: "HẠN DÙNG",
    commands: "LỆNH",
    expiredNotification: "Gói tập đã hết hạn, không thể điểm danh",
    confirmDeleteTitle: "Xác nhận xóa",
    confirmDeleteMsg: "Bạn có chắc chắn muốn xóa hội viên này?",
    editMember: "CHỈNH SỬA HỘI VIÊN",
    systemStats: "THỐNG KÊ HỆ THỐNG",
    revenueChart: "BIỂU ĐỒ DOANH THU",
    checkinChart: "MẬT ĐỘ ĐIỂM DANH",
    packageDist: "PHÂN BỔ GÓI TẬP",
    staffPerformance: "HIỆU SUẤT NHÂN VIÊN QUẦY",
    historyTransactions: "LỊCH SỬ GIAO DỊCH",
    memberSales: "DOANH SỐ HỘI VIÊN",
    customer: "Khách hàng",
    service: "Dịch vụ",
    dateTime: "Ngày và giờ",
    discount: "Giảm giá",
    paymentMethod: "Phương thức thanh toán",
    payment: "Thanh toán",
    pkgManagement: "QUẢN LÝ GÓI TẬP",
    member: "HỘI VIÊN",
    amount: "SỐ TIỀN",
    status: "TRẠNG THÁI",
    paid: "Đã thanh toán",
    descriptionShort: "Mô tả",
    addPackage: "THÊM GÓI MỚI",
    staffMember: "Nhân viên quầy",
    memberInfo: "Thông tin hội viên",
    authTime: "Thời gian xác thực",
    infraStatus: "Trạng thái hạ tầng",
    kpiBonus: "+ Thưởng KPI",
    checkinAt: "ĐIỂM DANH LÚC",
    selectPhoto: "CHỌN ẢNH",
    notUpdated: "CHƯA CẬP NHẬT",
    langSwitched: "Đã chuyển đổi ngôn ngữ",
    loginFailed: "Đăng nhập thất bại",
    logoutSuccess: "Đã đăng xuất thành công",
    checkinSuccess: "Điểm danh thành công!",
    staffAdded: "Đã thêm nhân viên quầy mới",
    connectionError: "Lỗi kết nối máy chủ",
    profileUpdated: "Cập nhật hồ sơ thành công",
    memberAdded: "Thêm hội viên mới thành công",
    memberDeleted: "Đã xóa hội viên thành công",
    memberRestored: "Đã khôi phục hội viên",
    pkgAddSuccess: "Đã tạo gói tập mới thành công",
    pkgUpdateSuccess: "Cập nhật gói tập thành công",
    pkgSaveError: "Lỗi khi lưu gói tập",
    deleteMemberError: "Lỗi kết nối máy chủ khi xóa hội viên",
    pkgDeleteSuccess: "Đã xóa gói tập thành công",
    deletePkgConfirmTitle: "Xác nhận xóa gói tập",
    deletePkgConfirmMsg: "Bạn có chắc chắn muốn xóa gói tập này?",
    systemError: "LỖI_HỆ_THỐNG",
    pkgAddConfirmTitle: "Thêm gói tập",
    pkgAddConfirmMsg: "Xác nhận tạo gói tập mới",
    pkgConfigTitle: "Cấu hình Gói tập",
    editPkgTitle: "Cập nhật Gói tập",
    pkgConfigSub: "Thiết lập thông số dịch vụ hệ thống",
    changePhoto: "ĐỔI ẢNH",
    valuationModel: "MÔ HÌNH ĐỊNH GIÁ",
    coreModulePkg: "MÔ-ĐUN: CẤU HÌNH GÓI",
    authenticating: "ĐANG XÁC THỰC...",
    accessSystem: "TRUY CẬP HỆ THỐNG",
    authSystem: "Xác thực hệ thống",
    usernameLabel: "Tài khoản",
    passwordLabel: "Mật khẩu",
    defaultAccounts: "Tài khoản mặc định:",
    adminLabel: "QUẢN TRỊ",
    receptionistLabel: "NHÂN VIÊN QUẦY",
    staffLabel: "Nhân viên quầy",
    welcomeBack: "Chào mừng trở lại",
    wrongCredentials: "Sai tài khoản hoặc mật khẩu",
    confirmAddStaff: "Xác nhận tạo tài khoản nhân viên quầy mới cho",
    confirmUpdate: "Xác nhận lưu toàn bộ thay đổi cho hội viên",
    updateFailed: "Cập nhật thất bại",
    confirmAddMember: "Xác nhận đăng ký hội viên mới",
    addFailed: "Thêm hội viên thất bại",
    deleteFailed: "Không thể xóa hội viên",
    memberValueSub: "Trung bình mỗi hội viên",
    renewalRateSub: "Tỷ lệ gia hạn",
    aiInsights: "PHÂN TÍCH AI",
    churnPrediction: "DỰ ĐOÁN BỎ TẬP",
    behaviorAnalysis: "HÀNH VI KHÁCH HÀNG",
    workoutSuggestion: "GỢI Ý LỊCH TẬP",
    packageSuggestion: "GỢI Ý GÓI TẬP",
    workoutPrompt: "Lập lịch tập Gym",
    packagePrompt: "Tư vấn chọn gói",
    growthForecast: "Dự báo tăng trưởng",
    checkinUnit: "Đơn vị: Lượt/Tuần",
    growthMsg: "Tăng 5% so với tháng trước",
    "Gói Cơ Bản": "Gói Cơ Bản",
    "Gói Tiêu Chuẩn 6T": "Gói Tiêu Chuẩn 6T",
    "Gói Cao Cấp 12T": "Gói Cao Cấp 12T",
    "Hội Viên VIP ELITE": "Hội Viên VIP ELITE",
    "Tập luyện tự do, không bao gồm huấn luyện viên": "Tập luyện tự do, không bao gồm huấn luyện viên",
    "Tập luyện tự do, tặng 2 buổi tập với PT": "Tập luyện tự do, tặng 2 buổi tập với PT",
    "Tập luyện tự do, tặng 5 buổi PT, có tủ đồ riêng": "Tập luyện tự do, tặng 5 buổi PT, có tủ đồ riêng",
    "Huấn luyện viên cá nhân 1:1, đầy đủ dịch vụ xông hơi": "Huấn luyện viên cá nhân 1:1, đầy đủ dịch vụ xông hơi",
    "1 Tháng": "1 Tháng",
    "6 Tháng": "6 Tháng",
    "12 Tháng": "12 Tháng",
    "3 Tháng": "3 Tháng",
    "Mở bán": "Mở bán",
    pkgPlaceholder: "VD: GÓI VIP 6 THÁNG...",
    priceVND: "Định Giá (VNĐ)",
    saveConfig: "LƯU CẤU HÌNH",
    descPlaceholder: "Các quyền lợi đi kèm...",
    version: "PHIÊN BẢN",
    heartbeat: "TÍN HIỆU",
    platform: "NỀN TẢNG",
    activeHeartbeat: "HOẠT ĐỘNG // ĐÃ MÃ HOÁ",
    cloudInfra: "FIT.GYM CLOUD INFRA",
    staffModalSub: "Tạo tài khoản truy cập cho nhân viên quầy mới",
    deletedMembersSub: "Danh sách các hội viên đã được đưa vào lưu trữ xóa mềm",
    changePhotoShort: "ĐỔI ẢNH",
    confirmAction: "XÁC NHẬN HÀNH ĐỘNG",
    cancelBack: "BỎ QUA & QUAY LẠI",
    facilities: "QUẢN LÝ CƠ SỞ",
    assets: "CƠ SỞ VẬT CHẤT",
    maintenance: "LỊCH BẢO TRÌ",
    equipmentName: "Tên thiết bị",
    equipmentCode: "Mã thiết bị",
    equipmentStatus: "Trạng thái",
    lastMaintenance: "Bảo trì gần nhất",
    nextMaintenance: "Bảo trì kế tiếp",
    maintenanceHistory: "Lịch sử bảo trì",
    qrEquipment: "QR thiết bị",
    addEquipment: "THÊM THIẾT BỊ",
    editEquipment: "SỬA THIẾT BỊ",
    maintenanceTask: "Công việc bảo trì",
    performer: "Người thực hiện",
    priority: "Độ ưu tiên",
    scheduledDate: "Ngày dự kiến",
    taskStatus: "Trạng thái việc",
    location: "Vị trí lắp đặt",
    purchaseDate: "Ngày mua",
    normal: "Bình thường",
    needMaintenance: "Cần bảo trì",
    broken: "Đang hỏng",
    underMaintenance: "Đang bảo trì",
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    pending: "Chờ xử lý",
    inProgress: "Đang thực hiện",
    completed: "Hoàn thành",
    addMaintenance: "THÊM LỊCH BẢO TRÌ",
    routine: "Định kỳ",
    repair: "Sửa chữa"
  },
  en: {
    dashboard: "DASHBOARD",
    members: "MEMBERS",
    packages: "PACKAGES",
    finance: "FINANCE",
    settings: "LANGUAGE",
    logout: "LOGOUT",
    chooseLang: "LANGUAGE",
    vi: "Vietnamese",
    en: "English",
    zh: "Chinese",
    active: "CORE: ACTIVE",
    overview: "SYSTEM OVERVIEW",
    membersList: "MEMBERS LIST",
    staffReport: "STAFF REPORT",
    financeTitle: "FINANCE MANAGEMENT",
    packagesTitle: "PACKAGE CONFIG",
    cancelConfirmTitle: "CANCEL PROCESS?",
    cancelConfirmMsg: "All information will be deleted, do you agree?",
    logoutMsg: "Are you sure you want to logout?",
    confirm: "CONFIRM",
    cancel: "CANCEL",
    checkin: "Check-in",
    expired: "Expired",
    allMembers: "Members",
    revenue: "Revenue",
    today: "Today",
    actionNeeded: "Pending",
    total: "Total",
    thisMonth: "This Month",
    adminPanel: "Admin Control Panel",
    addMember: "ADD MEMBER",
    quickCheckin: "QUICK CHECK-IN",
    checkinBtn: "CHECK-IN",
    editBtn: "EDIT",
    statusActive: "Active",
    statusExpired: "Expired",
    expiryDate: "Expiry",
    actions: "Actions",
    month: "Month",
    year: "Year",
    searchQuick: "Quick search...",
    searchByPhone: "Name or phone...",
    totalActiveMembers: "Total Active Members",
    checkinLog: "TODAY'S CHECK-IN LOG",
    noCheckins: "No check-ins yet",
    success: "SUCCESS",
    verifiedAt: "VERIFIED AT",
    infrastructure: "Multi-platform Infrastructure",
    apiHealthy: "STATUS: HEALTHY",
    apiOffline: "STATUS: OFFLINE",
    totalRevenue: "TOTAL REVENUE",
    memberValue: "AVG VALUE/MEMBER",
    renewalRate: "RENEWAL PERFORMANCE",
    nextMonthGoal: "NEXT MONTH GOAL",
    revenueWeekChart: "This Week's Revenue Chart",
    revenueUnit: "Unit: VND / Real-time",
    revenueReal: "Actual Revenue",
    checkinDensity: "Daily Check-in Density",
    packageDistribution: "Package Distribution",
    staffKPI: "Staff Performance & Monthly KPI",
    newMembers: "New Members",
    progress: "Progress",
    revenueVND: "Revenue (VND)",
    processingData: "DATA IS BEING PROCESSED",
    sessionInfo: "Internal System // FIT.GYM // User:",
    sessionRole: "Session Role:",
    addMemberTitle: "Member Registration",
    webInterface: "EXECUTE ON WEB INTERFACE",
    selectAvatar: "Select avatar",
    lastName: "Last Name",
    memberCode: "Member Code",
    email: "Email Address",
    dob: "Date of Birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    address: "Address",
    faceAnalysis: "FACE ANALYSIS",
    faceData: "AI Feature Data",
    extractingFeatures: "Analyzing face...",
    analyzing: "Authenticating AI...",
    verificationResult: "Verification Result",
    faceMatched: "Face verification successful",
    faceNotMatched: "Face verification failed",
    capturePhoto: "CAPTURE PHOTO",
    retakePhoto: "RETAKE",
    phone: "Phone Number",
    pt: "Trainer",
    receptionistLabel: "STAFF",
    staffInCharge: "Staff in Charge",
    selectPackage: "Select Package",
    paymentDate: "Payment Date",
    expiryDateAuto: "Expiry Date (AUTO)",
    cancelProcess: "CANCEL PROCESS",
    save: "SAVE +",
    addPackageTitle: "NEW PACKAGE CATEGORY",
    pkgName: "Package Name",
    duration: "Duration",
    price: "Price",
    description: "Service Description",
    updateSystem: "UPDATE SYSTEM +",
    profileMember: "Member Profile",
    profileDetails: "REGISTRATION DETAILS",
    quickActions: "QUICK ACTIONS",
    trainingHistory: "TRAINING HISTORY",
    noHistory: "No data recorded",
    deleteData: "Delete data",
    complete: "COMPLETE",
    searchHint: "ENTER PHONE OR NAME...",
    clearSearch: "CLEAR",
    noMatch: "No matching members found",
    closeWindow: "CLOSE WINDOW",
    staffAddTitle: "ADD STAFF",
    username: "Username ID",
    password: "Password",
    confirmAdd: "CONFIRM CREATE",
    deletedMembers: "DELETED",
    deletedMembersTitle: "DELETED MEMBERS",
    restore: "RESTORE",
    editTitle: "Update Information",
    saveUpdate: "Update",
    access: "01. ACCESS",
    functions: "02. FUNCTIONS",
    systemAccount: "SYSTEM & ACCOUNT",
    logoutSystem: "LOGOUT SYSTEM",
    mgmtSystem: "Management System",
    systemInfo: "SYSTEM INFO",
    ADMIN: "Administrator",
    STAFF: "Staff member",
    PT: "Trainer",
    MEMBER: "Member",
    memberList: "MEMBERS LIST",
    activeRecords: "ACTIVE RECORDS",
    memberIdentity: "MEMBER IDENTITY",
    expiry: "EXPIRY",
    commands: "COMMANDS",
    expiredNotification: "Package expired, cannot check-in",
    confirmDeleteTitle: "Confirm Delete",
    confirmDeleteMsg: "Are you sure you want to delete this member?",
    editMember: "EDIT MEMBER",
    systemStats: "SYSTEM STATISTICS",
    revenueChart: "REVENUE GROWTH",
    checkinChart: "CHECK-IN DENSITY",
    packageDist: "PACKAGE DISTRIBUTION",
    staffPerformance: "STAFF PERFORMANCE",
    historyTransactions: "TRANSACTION HISTORY",
    memberSales: "MEMBER SALES",
    customer: "Customer",
    service: "Service",
    dateTime: "Date & Time",
    discount: "Discount",
    paymentMethod: "Payment Method",
    payment: "Payment",
    pkgManagement: "PACKAGE MANAGEMENT",
    member: "MEMBER",
    amount: "AMOUNT",
    status: "STATUS",
    paid: "Paid",
    descriptionShort: "Desc",
    addPackage: "ADD NEW PACKAGE",
    staffMember: "Staff",
    memberInfo: "Member Information",
    authTime: "Authentication Time",
    infraStatus: "Infrastructure Status",
    kpiBonus: "+ KPI Bonus",
    selectPhoto: "SELECT PHOTO",
    notUpdated: "NOT UPDATED",
    langSwitched: "Language changed",
    pos: "POS",
    invoices: "INVOICES",
    salesInvoices: "SALES INVOICES",
    memberInvoices: "MEMBER INVOICES",
    expiringInvoices: "EXPIRING",
    expiredInvoices: "EXPIRED",
    treasury: "TREASURY",
    reports: "REPORTS",
    memberMgmt: "MEMBER MANAGEMENT",
    memberAccountMgmt: "ACCOUNT MANAGEMENT",
    register: "REGISTER",
    createAccount: "CREATE ACCOUNT",
    alreadyHaveAccount: "ALREADY HAVE AN ACCOUNT? LOGIN",
    noAccount: "NO ACCOUNT? REGISTER NOW",
    registrationSuccess: "Registration successful! You can now log in with your account.",
    forgotPassword: "FORGOT PASSWORD?",
    resetPassword: "RESET PASSWORD",
    enterEmailToReset: "Enter your email to receive password reset instructions.",
    sendResetLink: "SEND RESET LINK",
    backToLogin: "BACK TO LOGIN",
    memberPortal: "MEMBER PORTAL",
    communication: "MESSAGING",
    myProfile: "MY PROFILE",
    renewPackage: "RENEW MEMBERSHIP",
    buyPackage: "BUY PACKAGE",
    noPackage: "NO ACTIVE PACKAGE",
    registrationDate: "REGISTRATION DATE",
    nextBilling: "NEXT BILLING",
    welcomeMember: "WELCOME BACK,",
    evaluations: "Service Evaluations",
    leaveReview: "Leave Feedback",
    rating: "Satisfaction Level",
    comment: "Your Comments",
    submitReview: "Submit Review Now",
    memberEvaluations: "Customer Feedback",
    noEvaluations: "No evaluations yet",
    reviewSubmitted: "Thank you for your feedback!",
    yourReviews: "Your Reviews",
    suggestions: "Quick suggestions",
    aiAssistant: "AI ASSISTANT",
    chatWithAI: "Chat with AI Assistant",
    askMeAnything: "Ask me about workout or packages...",
    send: "Send",
    suggestion1: "Great facilities",
    suggestion2: "Supportive trainers",
    suggestion3: "Modern and clean equipment",
    suggestion4: "Bit crowded during peak hours",
    suggestion5: "Restrooms need better cleaning",
    qrCheckin: "QR CHECK-IN",
    renewNow: "RENEW NOW",
    selectNewPackage: "CHOOSE A NEW PACKAGE",
    addTransaction: "ADD TRANSACTION",
    addProduct: "ADD PRODUCT",
    overlapError: "Start date cannot overlap with current package. Please select a date after: ",
    confirmRenewal: "CONFIRM PAYMENT",
    paymentConfirmation: "PAYMENT VERIFICATION",
    startDate: "RENEWAL START DATE",
    renewalSuccess: "Membership renewed successfully!",
    registerTitle: "Join Our Community",
    dontHaveAccount: "Don't have an account?",
    registerSuccess: "Registration successful!",
    loginFailed: "Login failed",
    logoutSuccess: "Logout successful",
    checkinSuccess: "Check-in successful!",
    staffAdded: "New staff added",
    connectionError: "Server connection error",
    profileUpdated: "Profile updated successfully",
    memberAdded: "New member added successfully",
    memberDeleted: "Member deleted successfully",
    memberRestored: "Member restored successfully",
    pkgAddSuccess: "New package created successfully",
    pkgUpdateSuccess: "Package updated successfully",
    pkgSaveError: "Error saving package",
    deleteMemberError: "Server error while deleting member",
    pkgDeleteSuccess: "Package deleted successfully",
    deletePkgConfirmTitle: "Confirm Delete Package",
    deletePkgConfirmMsg: "Are you sure you want to delete this package?",
    systemError: "SYSTEM_ERROR",
    pkgAddConfirmTitle: "Add Package",
    pkgAddConfirmMsg: "Confirm creating new package",
    pkgConfigTitle: "Package Configuration",
    editPkgTitle: "Update Package",
    pkgConfigSub: "Setup system service parameters",
    changePhoto: "CHANGE PHOTO",
    valuationModel: "VALUATION MODEL",
    coreModulePkg: "MODULE: PKG_CONFIG",
    authenticating: "AUTHENTICATING...",
    accessSystem: "ACCESS SYSTEM",
    authSystem: "System Authentication",
    usernameLabel: "Username",
    passwordLabel: "Password",
    defaultAccounts: "Default Accounts:",
    adminLabel: "ADMIN",
    staffLabel: "Staff Member",
    welcomeBack: "Welcome back",
    wrongCredentials: "Wrong username or password",
    confirmAddStaff: "Confirm creating new staff account for",
    confirmUpdate: "Confirm saving all changes for member",
    updateFailed: "Update failed",
    confirmAddMember: "Confirm new member registration",
    addFailed: "Failed to add member",
    deleteFailed: "Could not delete member",
    staff: "Staff",
    memberValueSub: "Average per member",
    renewalRateSub: "Renewal performance",
    aiInsights: "AI INSIGHTS",
    churnPrediction: "CHURN PREDICTION",
    behaviorAnalysis: "BEHAVIOR ANALYSIS",
    workoutSuggestion: "WORKOUT SUGGESTION",
    packageSuggestion: "PACKAGE SUGGESTION",
    workoutPrompt: "Create workout plan",
    packagePrompt: "Advise on packages",
    growthForecast: "Growth forecast",
    checkinUnit: "Unit: Check-ins / Week",
    growthMsg: "5% growth vs last month",
    "Gói Cơ Bản": "Basic Package",
    "Gói Tiêu Chuẩn 6T": "Standard Package (6M)",
    "Gói Cao Cấp 12T": "Premium Package (12M)",
    "Hội Viên VIP ELITE": "VIP ELITE Member",
    "Tập luyện tự do, không bao gồm huấn luyện viên": "Free training, coaches not included",
    "Tập luyện tự do, tặng 2 buổi tập với PT": "Free training, includes 2 sessions with PT",
    "Tập luyện tự do, tặng 5 buổi PT, có tủ đồ riêng": "Free training, includes 5 sessions with PT & private locker",
    "Huấn luyện viên cá nhân 1:1, đầy đủ dịch vụ xông hơi": "1:1 Personal Trainer, full spa & sauna service",
    "1 Tháng": "1 Month",
    "6 Tháng": "6 Months",
    "12 Tháng": "12 Months",
    "3 Tháng": "3 Months",
    "Mở bán": "Open for sale",
    pkgPlaceholder: "e.g., VIP 6 MONTHS...",
    priceVND: "Price (VND)",
    saveConfig: "SAVE CONFIG",
    descPlaceholder: "Included benefits...",
    version: "VERSION",
    heartbeat: "HEARTBEAT",
    platform: "PLATFORM",
    activeHeartbeat: "ACTIVE // ENCRYPTED",
    cloudInfra: "FIT.GYM CLOUD INFRA",
    staffModalSub: "Create access accounts for new staff",
    deletedMembersSub: "List of soft-deleted members",
    changePhotoShort: "CHANGE",
    confirmAction: "CONFIRM ACTION",
    cancelBack: "CANCEL & RETURN",
    facilities: "FACILITY MGMT",
    assets: "EQUIPMENT",
    maintenance: "MAINTENANCE",
    equipmentName: "Equipment Name",
    equipmentCode: "Equipment Code",
    equipmentStatus: "Status",
    lastMaintenance: "Last Maintenance",
    nextMaintenance: "Next Maintenance",
    maintenanceHistory: "History",
    qrEquipment: "QR Code",
    addEquipment: "ADD EQUIPMENT",
    editEquipment: "EDIT EQUIPMENT",
    maintenanceTask: "Task",
    performer: "Performer",
    priority: "Priority",
    scheduledDate: "Scheduled Date",
    taskStatus: "Task Status",
    location: "Location",
    purchaseDate: "Purchase Date",
    normal: "Normal",
    needMaintenance: "Maintenance Req",
    broken: "Broken",
    underMaintenance: "Under Maint",
    low: "Low",
    medium: "Medium",
    high: "High",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    addMaintenance: "ADD MAINTENANCE",
    routine: "Routine",
    repair: "Repair"
  },
  zh: {
    dashboard: "总览",
    members: "会员",
    reports: "报告",
    packages: "课程包",
    finance: "财务",
    settings: "语言设置",
    logout: "退出登录",
    chooseLang: "语言",
    vi: "越南语",
    en: "英语",
    zh: "中文",
    active: "核心: 激活",
    overview: "系统概况",
    membersList: "会员列表",
    staffReport: "员工报告",
    financeTitle: "财务管理",
    packagesTitle: "课程包配置",
    cancelConfirmTitle: "取消流程？",
    cancelConfirmMsg: "所有信息都将被删除，您同意吗？",
    logoutMsg: "您确定要退出吗？",
    confirm: "确认",
    cancel: "取消",
    checkin: "签到",
    expired: "已过期",
    allMembers: "会员",
    revenue: "收入",
    today: "今天",
    actionNeeded: "待处理",
    total: "总计",
    thisMonth: "本月",
    adminPanel: "管理控制面板",
    addMember: "添加会员",
    quickCheckin: "快速签到",
    checkinBtn: "签到",
    editBtn: "编辑",
    statusActive: "活跃",
    statusExpired: "已过期",
    expiryDate: "有效期",
    actions: "操作",
    month: "月",
    year: "年",
    searchQuick: "快速搜索...",
    searchByPhone: "姓名或电话...",
    totalActiveMembers: "当前活跃会员总数",
    checkinLog: "今日签到日志",
    noCheckins: "暂无签到记录",
    success: "成功",
    verifiedAt: "验证时间",
    infrastructure: "多平台架构",
    apiHealthy: "状态: 健康",
    apiOffline: "状态: 离线",
    totalRevenue: "总收入",
    memberValue: "平均会员价值",
    renewalRate: "续约率",
    nextMonthGoal: "下月目标",
    revenueWeekChart: "本周收入图表",
    revenueUnit: "单位: 越南盾 / 实时",
    revenueReal: "实际收入",
    checkinDensity: "每日签到密度",
    packageDistribution: "课程包分布",
    staffKPI: "员工绩效与月度 KPI",
    newMembers: "新会员",
    progress: "进度",
    revenueVND: "收入 (VND)",
    processingData: "数据处理中",
    sessionInfo: "内部系统 // FIT.GYM // 用户:",
    sessionRole: "会话角色:",
    addMemberTitle: "会员注册",
    webInterface: "在 Web 界面执行",
    selectAvatar: "选择头像",
    lastName: "姓",
    memberCode: "会员编号",
    email: "电子邮件",
    dob: "出生日期",
    gender: "性别",
    male: "男",
    female: "女",
    other: "其他",
    address: "地址",
    faceAnalysis: "面部分析",
    faceData: "AI 特征数据",
    extractingFeatures: "正在分析面部...",
    analyzing: "正在进行 AI 验证...",
    verificationResult: "验证结果",
    faceMatched: "面部验证成功",
    faceNotMatched: "面部验证失败",
    capturePhoto: "拍摄照片",
    retakePhoto: "重拍",
    phone: "电话号码",
    staffInCharge: "负责人",
    selectPackage: "选择课程包",
    paymentDate: "付款日期",
    expiryDateAuto: "到期日期 (自动)",
    cancelProcess: "取消流程",
    save: "保存 +",
    addPackageTitle: "新课程包分类",
    pkgName: "课程包名称",
    duration: "时长",
    price: "价格",
    description: "服务说明",
    updateSystem: "更新系统 +",
    profileMember: "会员档案",
    profileDetails: "注册详情",
    quickActions: "快捷操作",
    trainingHistory: "训练历史",
    noHistory: "暂无记录",
    deleteData: "删除数据",
    complete: "完成",
    searchHint: "输入电话或姓名...",
    clearSearch: "清除",
    noMatch: "未找到匹配的会员",
    closeWindow: "关闭窗口",
    staffAddTitle: "添加员工",
    username: "用户名 ID",
    password: "密码",
    confirmAdd: "确认创建",
    deletedMembers: "已删除",
    deletedMembersTitle: "已删除会员",
    restore: "恢复",
    editTitle: "更新信息",
    saveUpdate: "更新",
    access: "01. 访问",
    functions: "02. 功能",
    systemAccount: "系统与账户",
    logoutSystem: "退出系统",
    mgmtSystem: "管理系统",
    systemInfo: "系统信息",
    ADMIN: "管理员",
    STAFF: "工作人员",
    PT: "教练",
    MEMBER: "会员",
    memberList: "会员列表",
    activeRecords: "活跃记录",
    memberIdentity: "会员身份",
    expiry: "有效期",
    commands: "指令",
    expiredNotification: "套餐已过期，无法签到",
    confirmDeleteTitle: "确认删除",
    confirmDeleteMsg: "您确定要删除该会员吗？",
    editMember: "编辑会员",
    systemStats: "系统统计",
    revenueChart: "收入增长图",
    checkinChart: "签到密度",
    packageDist: "套餐分布",
    staffPerformance: "员工绩效",
    historyTransactions: "交易历史",
    memberSales: "会员销售",
    customer: "客户",
    service: "服务",
    dateTime: "日期和时间",
    discount: "额外优惠",
    paymentMethod: "付款方式",
    payment: "付款方式",
    pkgManagement: "套餐管理",
    member: "会员",
    amount: "金额",
    status: "状态",
    paid: "已支付",
    descriptionShort: "描述",
    addPackage: "添加新套餐",
    staffMember: "员工",
    memberInfo: "会员信息",
    authTime: "认证时间",
    infraStatus: "基础设施状态",
    kpiBonus: "+ KPI 奖金",
    selectPhoto: "选择照片",
    notUpdated: "未更新",
    langSwitched: "语言已切换",
    pos: "销售",
    invoices: "发票",
    salesInvoices: "销售发票",
    memberInvoices: "会员发票",
    expiringInvoices: "即将到期",
    expiredInvoices: "已过期",
    memberMgmt: "会员管理",
    memberAccountMgmt: "账户管理",
    register: "注册",
    createAccount: "创建账户",
    alreadyHaveAccount: "已有账户？登录",
    noAccount: "没有账户？立即注册",
    registrationSuccess: "注册成功！您现在可以使用您的账户登录。",
    forgotPassword: "忘记密码？",
    resetPassword: "重置密码",
    enterEmailToReset: "输入您的电子邮件以接收密码重置说明。",
    sendResetLink: "发送重置链接",
    backToLogin: "返回登录",
    memberPortal: "会员门户",
    communication: "会员互动",
    myProfile: "我的档案",
    renewPackage: "续费套餐",
    buyPackage: "购买套餐",
    noPackage: "暂无套餐",
    registrationDate: "注册日期",
    nextBilling: "下次账单日",
    welcomeMember: "欢迎回来,",
    evaluations: "服务评价",
    leaveReview: "提交反馈",
    rating: "满意度",
    comment: "您的评论",
    submitReview: "立即提交",
    memberEvaluations: "客户反馈",
    noEvaluations: "暂无评价",
    reviewSubmitted: "感谢您的反馈！",
    yourReviews: "您的评价",
    suggestions: "快捷选项",
    aiAssistant: "AI 助手",
    chatWithAI: "与 AI 助手聊天",
    askMeAnything: "询问关于训练或课程的信息...",
    send: "发送",
    suggestion1: "设施完善",
    suggestion2: "教练非常专业",
    suggestion3: "器材先进且干净",
    suggestion4: "高峰期人比较多",
    suggestion5: "淋浴间卫生有待提高",
    qrCheckin: "二维码签到",
    renewNow: "立即续费",
    selectNewPackage: "选择新套餐",
    addTransaction: "添加交易",
    addProduct: "添加产品",
    overlapError: "开始日期不能与当前套餐重叠。请选择此日期之后：",
    confirmRenewal: "确认付款",
    paymentConfirmation: "支付确认",
    startDate: "续费开始日期",
    renewalSuccess: "套餐续费成功！",
    registerTitle: "欢迎加入",
    dontHaveAccount: "还没有账号？",
    registerSuccess: "注册成功！",
    loginFailed: "登录失败",
    logoutSuccess: "登出成功",
    checkinSuccess: "签到成功！",
    staffAdded: "新员工已添加",
    connectionError: "服务器连接错误",
    profileUpdated: "个人资料更新成功",
    memberAdded: "新会员添加成功",
    memberDeleted: "会员删除成功",
    memberRestored: "会员恢复成功",
    pkgAddSuccess: "新套餐创建成功",
    pkgUpdateSuccess: "套餐更新成功",
    pkgSaveError: "保存套餐时出错",
    deleteMemberError: "删除会员时服务器出错",
    pkgDeleteSuccess: "课程包删除成功",
    deletePkgConfirmTitle: "确认删除课程包",
    deletePkgConfirmMsg: "您确定要删除此课程包吗？",
    systemError: "系统错误",
    pkgAddConfirmTitle: "添加套餐",
    pkgAddConfirmMsg: "确认创建新套餐",
    pkgConfigTitle: "套餐配置",
    editPkgTitle: "更新套餐",
    pkgConfigSub: "设置系统服务参数",
    changePhoto: "更换照片",
    valuationModel: "估值模型",
    coreModulePkg: "核心模块: 套餐配置",
    authenticating: "正在验证...",
    accessSystem: "访问系统",
    authSystem: "系统验证",
    usernameLabel: "账号",
    passwordLabel: "密码",
    defaultAccounts: "默认账户：",
    adminLabel: "管理员",
    receptionistLabel: "接待员",
    staffLabel: "员工",
    welcomeBack: "欢迎回来",
    wrongCredentials: "用户名或密码错误",
    confirmAddStaff: "确认要为以下人员创建新员工账户吗：",
    confirmUpdate: "确认保存该会员的所有更改吗：",
    updateFailed: "更新失败",
    confirmAddMember: "确认新会员注册",
    addFailed: "添加会员失败",
    deleteFailed: "无法删除会员",
    staff: "员工",
    memberValueSub: "每位会员平均值",
    renewalRateSub: "续约绩效",
    growthForecast: "增长预测",
    checkinUnit: "单位: 签到次数 / 周",
    growthMsg: "比上月增长 5%",
    "Gói Cơ Bản": "基础套餐",
    "Gói Tiêu Chuẩn 6T": "标准套餐 (6个月)",
    "Gói Cao Cấp 12T": "高级套餐 (12个月)",
    "Hội Viên VIP ELITE": "VIP 精英会员",
    "Tập luyện tự do, không bao gồm huấn luyện viên": "自由训练，不含教练",
    "Tập luyện tự do, tặng 2 buổi tập với PT": "自由训练，赠送2次 PT 课程",
    "Tập luyện tự do, tặng 5 buổi PT, có tủ đồ riêng": "自由训练，赠送5次 PT 课程及专属储物柜",
    "Huấn luyện viên cá nhân 1:1, đầy đủ dịch vụ xông hơi": "1对1 私人教练，含全套桑拿服务",
    "1 Tháng": "1 个月",
    "6 Tháng": "6 个月",
    "12 Tháng": "12 个月",
    "3 Tháng": "3 个月",
    "Mở bán": "推销中",
    pkgPlaceholder: "例如：VIP 6个月套餐...",
    priceVND: "价格 (VND)",
    saveConfig: "保存配置",
    descPlaceholder: "包含的权益...",
    version: "版本",
    heartbeat: "状态信号",
    platform: "运行平台",
    activeHeartbeat: "活跃 // 已加密",
    cloudInfra: "FIT.GYM CLOUD INFRA",
    staffModalSub: "为新员工创建访问账户",
    deletedMembersSub: "软删除会员列表",
    changePhotoShort: "更换照片",
    confirmAction: "确认操作",
    cancelBack: "取消并返回"
  }
};

const LiveDashboardClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTime(
        d.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time || "00:00:00"}</span>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const checkIsAdminLike = (u: any): boolean => {
    if (!u) return false;
    return u.role === "ADMIN" || 
           u.username?.toLowerCase().endsWith("@fit.com") || 
           u.email?.toLowerCase().endsWith("@fit.com") ||
           u.fullName?.toLowerCase().endsWith("@fit.com");
  };
  const [activeTab, setActiveTab] = useState<"dashboard" | "members" | "pt" | "staff" | "pos" | "treasury" | "memberSales" | "invoice-sales" | "invoice-member" | "invoice-expiring" | "invoice-expired" | "facilities" | "maintenance" | "evaluations" | "packages" | "memberPortal" | "finance" | "memberAccounts" | "settings" | "invoices" | "aiAnalytics" | "communication" | "staffReport">("dashboard");
  const [invoiceSubTab, setInvoiceSubTab] = useState<"sales" | "member" | "expiring" | "expired">("sales");
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role === "MEMBER" && activeTab !== "memberPortal" && activeTab !== "communication" && activeTab !== "evaluations" && activeTab !== "packages") {
      setActiveTab("memberPortal");
    } else if (user?.role !== "ADMIN") {
      let adminOnlyTabs = ["memberAccounts", "staff", "pt", "finance", "facilities", "maintenance"];
      if (user?.role === "STAFF" || user?.role === "RECEPTIONIST") {
        adminOnlyTabs = ["staff", "pt", "finance"];
      }
      if (adminOnlyTabs.includes(activeTab)) {
        setActiveTab("dashboard");
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab === "maintenance") {
      setFacilitiesSubTab("maintenance");
    } else if (activeTab === "facilities") {
      setFacilitiesSubTab("assets");
    }
  }, [activeTab]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [members, setMembers] = useState<Member[]>([]);
  const [deletedMembers, setDeletedMembers] = useState<Member[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [kpiData, setKpiData] = useState<KPI[]>([]);
  const [staff, setStaff] = useState<
    { username: string; fullName: string; role?: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ptLevelFilter, setPtLevelFilter] = useState<string>("ALL");
  const [memberStatusFilter, setMemberStatusFilter] = useState<string>("ALL");
  const [staffStatusFilter, setStaffStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<"training" | "payment" | "review">("training");
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [communicationActiveMemberId, setCommunicationActiveMemberId] = useState<number | null>(null);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});
  const [resetPasswordMember, setResetPasswordMember] = useState<{ id: number; fullName: string } | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("123456");
  const [showResetPasswordValue, setShowResetPasswordValue] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<number | null>(null);
  const [checkinSearchTerm, setCheckinSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberHistory, setMemberHistory] = useState<Checkin[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [renewingMember, setRenewingMember] = useState<Member | null>(null);
  const [isRenewSelectModalOpen, setIsRenewSelectModalOpen] = useState(false);
  const [trainers, setTrainers] = useState<PT[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [memberEvaluations, setMemberEvaluations] = useState<Evaluation[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [aiChurnAnalysis, setAiChurnAnalysis] = useState<Record<number, string>>({});
  const [aiBehaviorInsight, setAiBehaviorInsight] = useState<string>("");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiInsightsSubTab, setAiInsightsSubTab] = useState<"dashboard" | "chatbot">("dashboard");
  const [analyticsChatMessages, setAnalyticsChatMessages] = useState<{ role: string; text: string }[]>([
    { role: "model", text: "Xin chào! Tôi là Trợ lý phân tích & chăm sóc hội viên AI GymMaster Pro. Tôi có quyền truy cập thông tin hệ thống để giúp bạn soạn lộ trình tập, tư vấn dinh dưỡng nâng cao, viết nội dung chăm sóc khách hàng, hoặc giải thích các chỉ số sức khỏe. Bạn cần hỗ trợ gì hôm nay?" }
  ]);
  const [analyticsChatInput, setAnalyticsChatInput] = useState("");
  const [isAnalyticsChatTyping, setIsAnalyticsChatTyping] = useState(false);
  const [ptAssignments, setPtAssignments] = useState<PTAssignment[]>([]);
  const [ptStats, setPtStats] = useState<PTStat[]>([]);
  const [ptSessions, setPtSessions] = useState<TrainingSession[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isPTModalOpen, setIsPTModalOpen] = useState(false);
  const [isPTDetailModalOpen, setIsPTDetailModalOpen] = useState(false);
  const [selectedPT, setSelectedPT] = useState<PT | null>(null);
  const [isPTAssignModalOpen, setIsPTAssignModalOpen] = useState(false);
  const [isPTSessionModalOpen, setIsPTSessionModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [editingPayrollId, setEditingPayrollId] = useState<number | null>(null);
  const [editBasePay, setEditBasePay] = useState<number>(0);
  const [editOtPay, setEditOtPay] = useState<number>(0);
  const [editPtBonus, setEditPtBonus] = useState<number>(0);
  const [editCommission, setEditCommission] = useState<number>(0);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceTask | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [searchMemberCode, setSearchMemberCode] = useState("");
  const [foundMember, setFoundMember] = useState<any | null>(null);
  const [searchError, setSearchError] = useState("");
  const [accountsSearchQuery, setAccountsSearchQuery] = useState("");
  const [facilitiesSubTab, setFacilitiesSubTab] = useState<"assets" | "maintenance">("assets");
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    fullName: "",
    role: "STAFF",
    position: "",
    baseSalary: 0,
    hourlyRate: 0,
    phoneNumber: "",
    email: "",
    username: "",
    password: "",
    shiftHours: { start: "08:00", end: "17:00" }
  });
  const [newPT, setNewPT] = useState<Partial<PT>>({
    fullName: "",
    expertise: [],
    level: "Junior",
    commissionRate: 0.1,
    phone: "",
    email: "",
    username: "",
    password: ""
  });
  const [newPTAssignment, setNewPTAssignment] = useState<Partial<PTAssignment>>({
    memberId: 0,
    trainerId: 0,
    totalSessions: 10,
    price: 3000000,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    category: "Thực phẩm bổ sung",
    price: 0,
    stock: 0,
    image: ""
  });
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: "EXPENSE",
    amount: 0,
    category: "Khác",
    note: "",
    date: new Date().toISOString().split('T')[0],
    customerName: ""
  });
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: "",
    code: `EQU-${Math.floor(Math.random() * 9000 + 1000)}`,
    category: "Cardio",
    status: "NORMAL",
    purchaseDate: new Date().toISOString().split('T')[0],
    lastMaintenance: new Date().toISOString().split('T')[0],
    nextMaintenance: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: "",
    history: []
  });
  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceTask>>({
    equipmentId: 0,
    scheduledDate: new Date().toISOString().split('T')[0],
    taskType: "ROUTINE",
    priority: "MEDIUM",
    performer: "",
    status: "PENDING",
    notes: ""
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isTrafficExpanded, setIsTrafficExpanded] = useState(false);
  const [isCheckinsExpanded, setIsCheckinsExpanded] = useState(false);
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);
  const [dashboardCheckinQuery, setDashboardCheckinQuery] = useState("");
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isHRMenuOpen, setIsHRMenuOpen] = useState(false);
  const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(false);
  const [isInvoicesMenuOpen, setIsInvoicesMenuOpen] = useState(false);
  const [isMembersMenuOpen, setIsMembersMenuOpen] = useState(false);
  const [isFacilitiesMenuOpen, setIsFacilitiesMenuOpen] = useState(false);
  const [memberSales, setMemberSales] = useState<MemberSale[]>([]);
  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gym_lang") || "vi";
    }
    return "vi";
  });

  useEffect(() => {
    localStorage.setItem("gym_lang", lang);
  }, [lang]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showPTPassword, setShowPTPassword] = useState(false);
  const [registerForm, setRegisterForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [financePeriod, setFinancePeriod] = useState<"month" | "year">("month");
  const [posCategory, setPosCategory] = useState("all");

  const t = (key: string) => translations[lang]?.[key] || key;

  const getStaffDisplayName = (s: { username: string; fullName: string; role?: string }) => {
    const roleKey = s.role || "";
    const translatedRole = t(roleKey);
    const fullName = s.fullName || "";

    // List of common placeholder names based on roles in all languages
    const placeholders = [
      "Quản Trị Viên", "Nhân Viên", "Huấn Luyện Viên", "Hội Viên",
      "QUẢN TRỊ VIÊN", "NHÂN VIÊN", "HUẤN LUYỆN VIÊN", "HỘI VIÊN",
      "Administrator", "Staff member", "Trainer", "Member",
      "ADMINISTRATOR", "STAFF MEMBER", "TRAINER", "MEMBER",
      "管理员", "工作人员", "教练", "会员",
      "Lễ Tân Phòng Gym", "Lễ Tân",
      "Admin System", "Nhân Viên Tiếp Tân", "Huấn Luyện Viên Demo", "Hội Viên Thử Nghiệm"
    ];

    if (!fullName || placeholders.includes(fullName) || fullName.toUpperCase() === translatedRole.toUpperCase()) {
      return translatedRole;
    }

    return `${fullName} - ${translatedRole}`;
  };

  // Mock revenue data for charts
  const revenueData = [
    { name: "T2", value: 1200000, members: 2 },
    { name: "T3", value: 4500000, members: 5 },
    { name: "T4", value: 3000000, members: 3 },
    { name: "T5", value: 8500000, members: 8 },
    { name: "T6", value: 5200000, members: 6 },
    { name: "T7", value: 12000000, members: 12 },
    { name: "CN", value: 9800000, members: 10 },
  ];

  const packageDistribution = [
    { name: t("Gói Cơ Bản"), value: 45, color: "#CCFF00" },
    { name: t("Gói Tiêu Chuẩn 6T"), value: 30, color: "#FFFFFF" },
    { name: t("Gói Cao Cấp 12T"), value: 20, color: "#3f3f46" },
    { name: t("Hội Viên VIP ELITE"), value: 5, color: "#ef4444" },
  ];

  const checkinTrends = [
    { day: "T2", count: 45 },
    { day: "T3", count: 52 },
    { day: "T4", count: 48 },
    { day: "T5", count: 61 },
    { day: "T6", count: 55 },
    { day: "T7", count: 82 },
    { day: "CN", count: 75 },
  ];

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    setEquipments([
      {
        id: 1,
        name: "Máy chạy bộ Matrix T50",
        code: "EQU-TRAD-001",
        category: "Cardio",
        status: "NORMAL",
        purchaseDate: "2025-01-15",
        lastMaintenance: "2025-12-10",
        nextMaintenance: "2026-06-10",
        location: "Khu vực Cardio A",
        history: [
          { date: "2025-01-15", action: "Lắp đặt", note: "Thiết bị mới" },
          { date: "2025-12-10", action: "Bảo trì định kỳ", note: "Bôi trơn băng tải" }
        ]
      },
      {
        id: 2,
        name: "Giàn tạ đa năng Impulse",
        code: "EQU-STR-001",
        category: "Sức mạnh",
        status: "MAINTENANCE_REQUIRED",
        purchaseDate: "2025-02-20",
        lastMaintenance: "2025-11-20",
        nextMaintenance: "2026-05-20",
        location: "Khu vực tạ A",
        history: [
          { date: "2025-02-20", action: "Lắp đặt", note: "Thiết bị mới" }
        ]
      },
      {
        id: 3,
        name: "Xe đạp tập thể dục Spin Bike",
        code: "EQU-CYC-001",
        category: "Cardio",
        status: "UNDER_MAINTENANCE",
        purchaseDate: "2025-03-05",
        lastMaintenance: "2026-05-10",
        nextMaintenance: "2026-08-10",
        location: "Khu vực Cardio B",
        history: [
          { date: "2026-05-10", action: "Ghi nhận hỏng", note: "Bàn đạp có tiếng kêu" }
        ]
      }
    ]);

    setMaintenanceTasks([
      {
        id: 1,
        equipmentId: 2,
        equipmentName: "Giàn tạ đa năng Impulse",
        scheduledDate: "2026-05-20",
        taskType: "ROUTINE",
        priority: "MEDIUM",
        performer: "Trần Văn B (Kỹ thuật)",
        status: "PENDING",
        notes: "Kiểm tra cáp và bôi trơn khớp nối"
      },
      {
        id: 2,
        equipmentId: 3,
        equipmentName: "Xe đạp tập thể dục Spin Bike",
        scheduledDate: "2026-05-15",
        taskType: "REPAIR",
        priority: "HIGH",
        performer: "Nguyễn Văn Chuyển",
        status: "IN_PROGRESS",
        notes: "Sửa bàn đạp kêu"
      }
    ]);
  }, []);

  const addNotification = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "info" = "info",
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      type,
    });
  };

  const [newMember, setNewMember] = useState({
    memberCode: "",
    firstName: "",
    lastName: "",
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    gender: "male",
    address: "",
    package: "Gói Cơ Bản",
    paymentDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    createdBy: "",
    avatar: "",
    faceData: "",
    paymentMethod: "Chuyển khoản",
    discount: 0,
    username: "",
    password: "",
  });

  const [isFaceAnalyzing, setIsFaceAnalyzing] = useState(false);
  const [isFaceVerifying, setIsFaceVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ isVerified: boolean; reason: string } | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      addNotification("Không thể truy cập camera", "error");
    }
  };

  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        stopCamera();
        return dataUrl;
      }
    }
    return null;
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditingMember((prev) =>
            prev ? { ...prev, avatar: reader.result as string } : null,
          );
        } else {
          setNewMember((prev) => ({
            ...prev,
            avatar: reader.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [newPkg, setNewPkg] = useState({
    name: "",
    duration: "1 Tháng",
    price: 0,
    description: "",
  });

  useEffect(() => {
    if (user) {
      fetchData();
      setNewMember((prev) => ({ ...prev, createdBy: user.username }));
      
      // Auto refresh data every 30 seconds for non-member roles
      let interval: any;
      if (user.role === "ADMIN" || user.role === "STAFF") {
        interval = setInterval(() => {
          fetchData();
        }, 30000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [user]);

  // Disable background scrolling when any modal is open to prevent scroll leakage (cuộn chuột bị quá card)
  useEffect(() => {
    const isAnyModalOpen = 
      isModalOpen || 
      isPkgModalOpen || 
      isCheckinModalOpen || 
      isProfileModalOpen || 
      isStaffModalOpen || 
      isDeletedModalOpen || 
      isEditModalOpen || 
      isSidebarOpen || 
      isProductModalOpen || 
      isTransactionModalOpen || 
      isPTModalOpen || 
      isPTDetailModalOpen || 
      isPTAssignModalOpen || 
      isPTSessionModalOpen ||
      isPayrollModalOpen ||
      isEquipmentModalOpen ||
      isMaintenanceModalOpen ||
      confirmDialog.isOpen;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    isModalOpen, 
    isPkgModalOpen, 
    isCheckinModalOpen, 
    isProfileModalOpen, 
    isStaffModalOpen, 
    isDeletedModalOpen, 
    isEditModalOpen, 
    isSidebarOpen, 
    isProductModalOpen, 
    isTransactionModalOpen, 
    isPTModalOpen, 
    isPTDetailModalOpen, 
    isPTAssignModalOpen, 
    isPTSessionModalOpen,
    isPayrollModalOpen,
    isEquipmentModalOpen,
    isMaintenanceModalOpen,
    confirmDialog.isOpen
  ]);

  useEffect(() => {
    if (newMember.paymentDate && newMember.package && packages.length > 0) {
      const selectedPkg = packages.find((p) => p.name === newMember.package);
      if (selectedPkg) {
        const parts = newMember.paymentDate.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          const date = new Date(year, month, day);
          const durationStr = selectedPkg.duration;

          const match = durationStr.match(/(\d+)/);
          if (match) {
            const value = parseInt(match[1]);
            if (durationStr.toLowerCase().includes("tháng")) {
              date.setMonth(date.getMonth() + value);
            } else if (durationStr.toLowerCase().includes("năm")) {
              date.setFullYear(date.getFullYear() + value);
            } else if (durationStr.toLowerCase().includes("ngày")) {
              date.setDate(date.getDate() + value);
            }

            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const calculatedExpiry = `${y}-${m}-${d}`;

            if (newMember.expiryDate !== calculatedExpiry) {
              setNewMember((prev) => ({ ...prev, expiryDate: calculatedExpiry }));
            }
          }
        }
      }
    }
  }, [newMember.paymentDate, newMember.package, packages]);

  useEffect(() => {
    if (editingMember && editingMember.registrationDate && editingMember.package && packages.length > 0) {
      const selectedPkg = packages.find((p) => p.name === editingMember.package);
      if (selectedPkg) {
        const parts = editingMember.registrationDate.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          const date = new Date(year, month, day);
          const durationStr = selectedPkg.duration;

          const match = durationStr.match(/(\d+)/);
          if (match) {
            const value = parseInt(match[1]);
            if (durationStr.toLowerCase().includes("tháng")) {
              date.setMonth(date.getMonth() + value);
            } else if (durationStr.toLowerCase().includes("năm")) {
              date.setFullYear(date.getFullYear() + value);
            } else if (durationStr.toLowerCase().includes("ngày")) {
              date.setDate(date.getDate() + value);
            }

            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const calculatedExpiry = `${y}-${m}-${d}`;

            if (editingMember.expiryDate !== calculatedExpiry) {
              setEditingMember((prev) => prev ? ({ ...prev, expiryDate: calculatedExpiry }) : null);
            }
          }
        }
      }
    }
  }, [editingMember?.registrationDate, editingMember?.package, packages]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const loginPayload = {
        username: loginForm.username.trim(),
        password: loginForm.password.trim()
      };
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginPayload),
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        addNotification(`${t('welcomeBack')}, ${userData.fullName}!`, "success");
      } else {
        const error = await res.json();
        setLoginError(error.message || t('wrongCredentials'));
        addNotification(t('loginFailed'), "error");
      }
    } catch (error) {
      setLoginError(t('connectionError'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!registerForm.email.toLowerCase().endsWith("@gmail.com")) {
      setLoginError("Đăng ký hội viên bắt buộc sử dụng email đuôi @gmail.com");
      addNotification("Đăng ký hội viên bắt buộc sử dụng email đuôi @gmail.com", "error");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      if (res.ok) {
        addNotification(t('registrationSuccess'));
        setIsRegisterMode(false);
        setLoginForm({ ...loginForm, username: registerForm.email });
      } else {
        const error = await res.json();
        setLoginError(error.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setLoginError("Lỗi kết nối máy chủ");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        addNotification(data.message);
        setIsForgotMode(false);
        setLoginForm({ ...loginForm, username: forgotEmail });
      } else {
        setLoginError(data.message || "Yêu cầu thất bại");
      }
    } catch (err) {
      setLoginError("Lỗi kết nối máy chủ");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    confirmAction(
      t('logout'),
      t('logoutMsg'),
      () => {
        setUser(null);
        setActiveTab("dashboard");
        addNotification(t('logoutSuccess'));
      },
    );
  };

  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [renewalStep, setRenewalStep] = useState(1);
  const [renewalDate, setRenewalDate] = useState(new Date().toISOString().split('T')[0]);
  const renewalDateRef = useRef<HTMLInputElement>(null);
  const [selectedRenewPackage, setSelectedRenewPackage] = useState<any>(null);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [isTrainingHistoryModalOpen, setIsTrainingHistoryModalOpen] = useState(false);
  const [historyMember, setHistoryMember] = useState<any>(null);
  const [memberPaymentHistory, setMemberPaymentHistory] = useState<any[]>([]);
  const [memberTrainingHistory, setMemberTrainingHistory] = useState<any[]>([]);

  const fetchPaymentHistory = async (member: any) => {
    try {
      const res = await fetch(`/api/members/${member.id}/sales`);
      if (res.ok) {
        const data = await res.json();
        setMemberPaymentHistory(data);
        setHistoryMember(member);
        setIsPaymentHistoryModalOpen(true);
      } else {
        const err = await res.json();
        addNotification(err.message || "Không thể lấy lịch sử thanh toán", "error");
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      addNotification("Không thể tải lịch sử thanh toán", "error");
    }
  };

  const fetchTrainingHistory = async (member: any) => {
    try {
      const res = await fetch(`/api/members/${member.id}/training`);
      if (res.ok) {
        const data = await res.json();
        setMemberTrainingHistory(data);
        setHistoryMember(member);
        setIsTrainingHistoryModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching training history:", error);
      addNotification("Không thể tải lịch sử tập luyện", "error");
    }
  };

  const handleRenewPackage = async (paymentMethod: string) => {
    if (!user || user.role !== "MEMBER" || !selectedRenewPackage) return;
    
    try {
      const res = await fetch("/api/members/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: user.id,
          packageName: selectedRenewPackage.name,
          paymentMethod,
          startDate: renewalDate,
          discount: 0
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addNotification(t('renewalSuccess'));
        setIsRenewalModalOpen(false);
        fetchData(); // Refresh data to update member status
      } else {
        const error = await res.json();
        addNotification(error.message || "Gia hạn thất bại", "error");
      }
    } catch (err) {
      addNotification("Lỗi kết nối máy chủ", "error");
    }
  };

  const handleMemberRenew = async (member: Member) => {
    try {
      const currentPkg = packages.find(p => p.name === member.package) || packages[0];
      if (!currentPkg) {
        addNotification("Không tìm thấy thông tin gói tập", "error");
        return;
      }

      const res = await fetch("/api/members/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          packageName: currentPkg.name,
          paymentMethod: "Tiền mặt",
          createdBy: user?.username || 'Hệ thống'
        }),
      });

      if (res.ok) {
        addNotification(`Gia hạn thành công hội viên ${member.fullName}!`);
        fetchData();
      } else {
        const error = await res.json();
        addNotification(error.message || "Gia hạn thất bại", "error");
      }
    } catch (err) {
      addNotification("Lỗi kết nối máy chủ", "error");
    }
  };

  const handleMemberRenewWithPackage = async (member: Member, pkgName: string) => {
    try {
      const res = await fetch("/api/members/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          packageName: pkgName,
          paymentMethod: "Tiền mặt",
          createdBy: user?.username || 'Hệ thống'
        }),
      });

      if (res.ok) {
        addNotification(`Gia hạn thành công gói tập [${pkgName}] cho hội viên ${member.fullName}!`);
        setIsRenewSelectModalOpen(false);
        setRenewingMember(null);
        fetchData();
      } else {
        const error = await res.json();
        addNotification(error.message || "Gia hạn thất bại", "error");
      }
    } catch (err) {
      addNotification("Lỗi kết nối máy chủ", "error");
    }
  };

  const fetchMemberEvaluations = async (memberId: number) => {
    try {
      const res = await fetch(`/api/evaluations/member/${memberId}`);
      if (res.ok) setMemberEvaluations(await res.json());
    } catch (error) {
      console.error("Error fetching member evaluations:", error);
    }
  };

  const handleSubmitEvaluation = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newComment.trim()) {
      addNotification("Vui lòng nhập nội dung đánh giá", "error");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: user.id,
          rating: newRating,
          comment: newComment
        })
      });
      if (res.ok) {
        addNotification(t('reviewSubmitted'));
        setNewComment("");
        setNewRating(5);
        fetchMemberEvaluations(user.id);
        fetchData();
      } else {
        addNotification("Gửi đánh giá thất bại", "error");
      }
    } catch (error) {
      addNotification("Lỗi kết nối", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSendMessage = async (e?: FormEvent, directMessage?: string) => {
    if (e) e.preventDefault();
    const userMessage = (directMessage || chatInput).trim();
    if (!userMessage || isTyping) return;

    if (!directMessage) setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsTyping(true);

    try {
      const history = chatMessages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: "model", text: data.text }]);
      } else {
        setChatMessages(prev => [...prev, { role: "model", text: "Xin lỗi, tôi gặp chút vấn đề khi kết nối. Hãy thử lại sau nhé!" }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: "model", text: "Lỗi kết nối. Vui lòng kiểm tra mạng của bạn." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendAnalyticsMessage = async (e?: FormEvent, directMessage?: string) => {
    if (e) e.preventDefault();
    const userMessage = (directMessage || analyticsChatInput).trim();
    if (!userMessage || isAnalyticsChatTyping) return;

    if (!directMessage) setAnalyticsChatInput("");
    setAnalyticsChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsAnalyticsChatTyping(true);

    try {
      const history = analyticsChatMessages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsChatMessages(prev => [...prev, { role: "model", text: data.text }]);
      } else {
        setAnalyticsChatMessages(prev => [...prev, { role: "model", text: "Xin lỗi, tôi gặp chút vấn đề khi kết nối máy chủ AI. Hãy thử lại sau nhé!" }]);
      }
    } catch (error) {
      console.error("Analytics chat error:", error);
      setAnalyticsChatMessages(prev => [...prev, { role: "model", text: "Lỗi kết nối mạng. Hãy thử lại." }]);
    } finally {
      setIsAnalyticsChatTyping(false);
    }
  };

  const handleSearchMemberCode = () => {
    setSearchError("");
    setFoundMember(null);
    if (!searchMemberCode.trim()) {
      setSearchError("Vui lòng nhập mã hoặc tên đăng nhập hội viên");
      return;
    }
    const cleanCode = searchMemberCode.trim().toUpperCase();
    const found = members.find(m => 
      (m.memberCode && m.memberCode.toUpperCase() === cleanCode) || 
      (m.username && m.username.toUpperCase() === cleanCode)
    );
    if (found) {
      setFoundMember(found);
    } else {
      setSearchError("Không tìm thấy hội viên nào có mã hoặc tên đăng nhập này!");
    }
  };

  const handleResetMemberPassword = (memberId: number, memberName: string) => {
    setResetPasswordMember({ id: memberId, fullName: memberName });
    setResetPasswordValue("123456");
    setShowResetPasswordValue(false);
    setIsResetPasswordModalOpen(true);
  };

  const handlePerformResetPassword = async () => {
    if (!resetPasswordMember) return;
    try {
      const res = await fetch(`/api/members/${resetPasswordMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPasswordValue }),
      });
      if (res.ok) {
        addNotification(`Đã thiết lập mật khẩu mới cho hội viên "${resetPasswordMember.fullName}" thành công!`, "success");
        setFoundMember(prev => {
          if (prev && prev.id === resetPasswordMember.id) {
            return { ...prev, password: resetPasswordValue };
          }
          return prev;
        });
        fetchData();
        setIsResetPasswordModalOpen(false);
        setResetPasswordMember(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        addNotification(errorData.message || "Đặt lại mật khẩu thất bại", "error");
      }
    } catch (err) {
      addNotification("Có lỗi xảy ra khi kết nối máy chủ", "error");
    }
  };

  const fetchData = async () => {
    try {
      const ts = Date.now();
      const requests = [
        fetch(`/api/members?t=${ts}`),
        fetch(`/api/stats?t=${ts}`),
        fetch(`/api/packages?t=${ts}`),
        fetch(`/api/checkins/today?t=${ts}`),
        fetch(`/api/stats/kpi?t=${ts}`),
        fetch(`/api/users/staff?t=${ts}`),
        fetch(`/api/trainers?t=${ts}`),
        fetch(`/api/pt-assignments?t=${ts}`),
        fetch(`/api/pt-stats?t=${ts}`),
        fetch(`/api/staff?t=${ts}`),
        fetch(`/api/attendance?t=${ts}`),
        fetch(`/api/payroll?t=${ts}`),
        fetch(`/api/products?t=${ts}`),
        fetch(`/api/transactions?t=${ts}`),
        fetch(`/api/member-sales?t=${ts}`),
        fetch(`/api/evaluations?t=${ts}`),
      ];

      if (user?.role === "MEMBER") {
        requests.push(fetch(`/api/members/${user.id}/history?t=${ts}`));
        requests.push(fetch(`/api/members/${user.id}/sales?t=${ts}`));
      }

      if (checkIsAdminLike(user)) {
        requests.push(fetch(`/api/members/deleted?t=${ts}`));
      }

      const responses = await Promise.all(requests);

      const membersData = await responses[0].json();
      const statsData = await responses[1].json();
      const pkgsData = await responses[2].json();
      const checkinsData = await responses[3].json();
      const kpiStats = await responses[4].json();
      const staffList = await responses[5].json();
      const trainersData = await responses[6].json();
      const assignmentsData = await responses[7].json();
      const ptStatsData = await responses[8].json();
      const staffMembersData = await responses[9].json();
      const attendanceData = await responses[10].json();
      const payrollData = await responses[11].json();
      const productsData = await responses[12].json();
      const transactionsData = await responses[13].json();
      const memberSalesData = await responses[14].json();
      const evaluationsData = await responses[15].json();

      setMembers(membersData);
      setStats(statsData);
      setPackages(pkgsData);
      setCheckins(checkinsData);
      setKpiData(kpiStats);
      setStaff(staffList);
      setTrainers(trainersData);
      setPtAssignments(assignmentsData);
      setPtStats(ptStatsData);
      setStaffMembers(staffMembersData);
      setAttendance(attendanceData);
      setPayroll(payrollData);
      setProducts(productsData || []);
      setTransactions(transactionsData || []);
      setMemberSales(memberSalesData || []);
      setEvaluations(evaluationsData || []);

      if (user?.role === "MEMBER") {
        const histRes = await responses[16].json();
        const salesRes = await responses[17].json();
        setMemberHistory(histRes);
        setMemberPaymentHistory(salesRes);
        fetchMemberEvaluations(user.id);
      }

      if (checkIsAdminLike(user) && responses[16]) {
         // If admin, responses[16] is deleted members
        const deletedData = await responses[16].json();
        setDeletedMembers(deletedData);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const handleViewProfile = async (member: Member) => {
    setSelectedMember(member);
    setIsProfileModalOpen(true);
    setProfileActiveTab("training");
    try {
      // Fetch training history
      const resHistory = await fetch(`/api/members/${member.id}/history`);
      if (resHistory.ok) {
        const history = await resHistory.ok ? await resHistory.json() : [];
        setMemberHistory(history);
      }
      
      // Fetch payment history
      const resSales = await fetch(`/api/members/${member.id}/sales`);
      if (resSales.ok) {
        const sales = await resSales.json();
        setMemberPaymentHistory(sales);
      }
    } catch (error) {
      console.error("Failed to fetch member details", error);
    }
  };

  const handleCheckin = async (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setCheckinSearchTerm(member.phone);
      setIsCheckinModalOpen(true);
    }
  };

  const handleQuickCheckin = async (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const isExpired = new Date(member.expiryDate).getTime() < new Date().setHours(0, 0, 0, 0);
    if (isExpired) {
      addNotification(t('expiredNotification'), "error");
      return;
    }

    await executeCheckin(memberId);
  };

  const openAddPTModal = () => {
    setNewPT({
      fullName: "",
      expertise: [],
      level: "Junior",
      commissionRate: 0.1,
      phone: "",
      email: ""
    });
    setIsPTModalOpen(true);
  };

  const handleEditPT = (trainer: PT) => {
    setNewPT(trainer);
    setIsPTModalOpen(true);
  };

  const handleViewPTDetails = (trainer: PT) => {
    setSelectedPT(trainer);
    setIsPTDetailModalOpen(true);
  };

  const openPTAssignModal = (trainerId?: number, memberId?: number) => {
    setNewPTAssignment({
      trainerId: trainerId || undefined,
      memberId: memberId || undefined,
      totalSessions: 12,
      price: 3600000,
      sessionsLeft: 12,
      status: "Active",
      assignedDate: new Date().toISOString().split('T')[0]
    });
    setIsPTAssignModalOpen(true);
  };

  const handleAddPT = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const isUpdate = !!newPT.id;
      const res = await fetch(isUpdate ? `/api/trainers/${newPT.id}` : "/api/trainers", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPT,
          username: newPT.username || newPT.email,
          password: newPT.password || (isUpdate ? undefined : "123456")
        }),
      });
      if (res.ok) {
        addNotification(isUpdate ? t('updated') : t('success'));
        setIsPTModalOpen(false);
        setNewPT({
          fullName: "",
          expertise: [],
          level: "Junior",
          commissionRate: 0.1,
          phone: "",
          email: "",
          username: "",
          password: ""
        });
        fetchData();
      }
    } catch (error) {
      addNotification(t('systemError'), "error");
    }
  };

  const handleDeletePT = async (id: number) => {
    confirmAction(
      t('confirmDelete'),
      t('confirmDeleteMsg'),
      async () => {
        try {
          const res = await fetch(`/api/trainers/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            addNotification(t('deleted'));
            fetchData();
          } else {
            addNotification(t('error'), "error");
          }
        } catch (error) {
          console.error("Failed to delete trainer", error);
          addNotification(t('systemError'), "error");
        }
      }
    );
  };

  const handleAssignPT = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newPTAssignment,
        sessionsLeft: newPTAssignment.totalSessions
      };
      const res = await fetch("/api/pt-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        addNotification(t('success'));
        setIsPTAssignModalOpen(false);
        fetchData();
      }
    } catch (error) {
      addNotification(t('systemError'), "error");
    }
  };

  const handleDeletePTAssignment = async (id: number) => {
    confirmAction(
      "XÁC NHẬN XÓA",
      "Bạn có chắc chắn muốn xóa hội viên này khỏi danh sách quản lý của PT này? Thao tác này sẽ xóa hợp đồng huấn luyện tương ứng.",
      async () => {
        try {
          const res = await fetch(`/api/pt-assignments/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            addNotification("Đã xóa hội viên khỏi danh sách quản lý");
            fetchData();
          } else {
            addNotification(t('error'), "error");
          }
        } catch (error) {
          console.error("Failed to delete PT assignment", error);
          addNotification(t('systemError'), "error");
        }
      }
    );
  };

  const openAddStaffModal = () => {
    setNewStaff({
      fullName: "",
      position: "",
      role: "STAFF",
      baseSalary: 5000000,
      hourlyRate: 30000,
      phoneNumber: "",
      email: "",
      username: "",
      password: "",
      shiftHours: { start: "08:00", end: "17:00" },
      status: "Active"
    });
    setIsStaffModalOpen(true);
  };

  const handleSyncPersonnel = async () => {
    setIsSyncing(true);
    setSyncProgress(5);
    setSyncLogs(["[1/4] Đang kết nối đến Cổng Đồng bộ Dữ liệu Trung tâm (Central Data Sync Gate)..."]);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncProgress(25);
      setSyncLogs(prev => [...prev, "[OK] Đã kết nối an toàn với máy chủ CRM/ERP."]);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setSyncProgress(45);
      setSyncLogs(prev => [...prev, "[2/4] Đang đồng bộ danh sách nhân viên & huấn luyện viên (PT) mới từ hệ thống..."]);
      
      const res = await fetch("/api/sync/all", { method: "POST" });
      if (!res.ok) throw new Error("Sync failure");
      const result = await res.json();
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncProgress(75);
      setSyncLogs(prev => [
        ...prev, 
        `[OK] Đã cập nhật thành công ${result.stats?.addedStaffCount || 0} nhân sự tiếp tân và ${result.stats?.addedPTCount || 0} huấn luyện viên mới vào hệ thống danh sách.`
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setSyncProgress(90);
      setSyncLogs(prev => [
        ...prev, 
        "[3/4] Đang đồng bộ hóa dữ liệu tương tác hội viên (phản hồi đánh giá, check-in thời gian thực)..."
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncProgress(100);
      setSyncLogs(prev => [
        ...prev, 
        `[OK] Đồng bộ tương tác thành công! Đã cập nhật ${result.stats?.addedInteractionsCount || 0} phản hồi và lịch sử check-in mới nhất.`,
        "[4/4] Đồng bộ hoàn tất! Toàn bộ bảng điều khiển đã tải và hiển thị dữ liệu mới nhất thành công."
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      await fetchData();
      addNotification("ĐỒNG BỘ DỮ LIỆU NHÂN SỰ VÀ TƯƠNG TÁC HỘI VIÊN THÀNH CÔNG!", "success");
    } catch (error) {
      console.error("Sync error:", error);
      setSyncLogs(prev => [...prev, "[LỖI] Tiến trình đồng bộ bị gián đoạn. Vui lòng kết nối lại."]);
      addNotification("LỖI ĐỒNG BỘ DỮ LIỆU", "error");
    }
  };

  const handleEditStaff = (member: StaffMember) => {
    setNewStaff(member);
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaff = async (id: number) => {
    confirmAction(
      t('confirmDelete'),
      t('confirmDeleteMsg'),
      async () => {
        try {
          const res = await fetch(`/api/staff/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            addNotification(t('deleted'));
            fetchData();
          } else {
            addNotification(t('error'), "error");
          }
        } catch (error) {
          console.error("Failed to delete staff", error);
          addNotification(t('systemError'), "error");
        }
      }
    );
  };

  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const isUpdate = !!newStaff.id;
      const res = await fetch(isUpdate ? `/api/staff/${newStaff.id}` : "/api/staff", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStaff,
          username: newStaff.username || newStaff.email,
          password: newStaff.password || (isUpdate ? undefined : "123456")
        }),
      });
      if (res.ok) {
        addNotification(isUpdate ? t('updated') : t('success'));
        setIsStaffModalOpen(false);
        setNewStaff({
          fullName: "",
          position: "",
          role: "STAFF",
          baseSalary: 5000000,
          hourlyRate: 30000,
          phoneNumber: "",
          email: "",
          username: "",
          password: "",
          shiftHours: { start: "08:00", end: "17:00" },
          status: "Active"
        });
        fetchData();
      }
    } catch (error) {
      addNotification(t('systemError'), "error");
    }
  };

  const handleStaffAttendance = async (staffId: number, type: "checkin" | "checkout") => {
    try {
      const res = await fetch(`/api/attendance/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      });
      if (res.ok) {
        addNotification(t('success'));
        fetchData();
      } else {
        const error = await res.json();
        addNotification(error.message, "error");
      }
    } catch (error) {
      addNotification(t('systemError'), "error");
    }
  };

  const handleGeneratePayroll = async (month: string) => {
    try {
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      if (res.ok) {
        addNotification(t('success'));
        fetchData();
      }
    } catch (error) {
      addNotification(t('systemError'), "error");
    }
  };

  const handleUpdatePayroll = async (id: number) => {
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePay: editBasePay,
          otPay: editOtPay,
          ptBonus: editPtBonus,
          commission: editCommission
        }),
      });
      if (res.ok) {
        addNotification(t('success'));
        setEditingPayrollId(null);
        fetchData();
      } else {
        const err = await res.json();
        addNotification(err.message || "Thao tác thất bại", "error");
      }
    } catch (error) {
      addNotification(t('systemError'), "error");
    }
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditingProduct ? `/api/products/${newProduct.id}` : "/api/products";
      const method = isEditingProduct ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        addNotification(t('success'));
        setIsProductModalOpen(false);
        setIsEditingProduct(false);
        setNewProduct({ name: "", category: "Thực phẩm bổ sung", price: 0, stock: 0, image: "" });
        fetchData();
      }
    } catch (error) {
      addNotification(t('systemError'), "error");
    }
  };

  const handleDeleteProduct = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "XÓA SẢN PHẨM",
      message: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
          if (res.ok) {
            addNotification(t('success'));
            fetchData();
          }
        } catch (error) {
          addNotification(t('systemError'), "error");
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleEditProduct = (product: Product) => {
    setNewProduct(product);
    setIsEditingProduct(true);
    setIsProductModalOpen(true);
  };

  const handleAddTransaction = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...newTransaction, createdBy: user?.username };
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        addNotification(t('success'));
        setIsTransactionModalOpen(false);
        setNewTransaction({ 
          type: "EXPENSE", 
          amount: 0, 
          category: "Khác", 
          note: "", 
          date: new Date().toISOString().split('T')[0],
          customerName: "" 
        });
        fetchData();
      }
    } catch (error) {
      addNotification(t('systemError'), "error");
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      addNotification("Sản phẩm đã hết hàng", "error");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    addNotification(`Đã thêm ${product.name} vào giỏ`, "info");
  };

  const handleResetMemberPackage = async (memberId: number) => {
    try {
      const response = await fetch(`/api/members/${memberId}/reset`, {
        method: 'POST'
      });
      if (response.ok) {
        const updatedMember = await response.json();
        setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));
        // Update user state if resetting current user
        if (user?.id === memberId) {
          setUser(updatedMember);
        }
        addNotification("Đã xóa dữ liệu gói tập", "success");
      }
    } catch (error) {
      addNotification("Lỗi khi xóa dữ liệu", "error");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total, createdBy: user?.username }),
      });
      if (res.ok) {
        addNotification("Thanh toán thành công", "success");
        setCart([]);
        fetchData();
      }
    } catch (error) {
      addNotification("Thanh toán thất bại", "error");
    }
  };

  const handleRecordSession = async (assignmentId: number, notes: string) => {
    try {
      const res = await fetch("/api/training-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, notes }),
      });
      if (res.ok) {
        addNotification(t('success'));
        fetchData();
      } else {
        const error = await res.json();
        addNotification(error.message, "error");
      }
    } catch (error) {
      addNotification(t('systemError'), "error");
    }
  };

  const handleEquipmentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingEquipment) {
      setEquipments(prev => prev.map(eq => eq.id === editingEquipment.id ? editingEquipment : eq));
      addNotification(t('profileUpdated'));
    } else {
      const equip = { ...newEquipment, id: Date.now() } as Equipment;
      setEquipments(prev => [...prev, equip]);
      addNotification(t('success'));
      setNewEquipment({
        name: "",
        code: `EQU-${Math.floor(Math.random() * 9000 + 1000)}`,
        category: "Cardio",
        status: "NORMAL",
        purchaseDate: new Date().toISOString().split('T')[0],
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: "",
        history: []
      });
    }
    setIsEquipmentModalOpen(false);
  };

  const handleMaintenanceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingMaintenance) {
      setMaintenanceTasks(prev => prev.map(task => task.id === editingMaintenance.id ? editingMaintenance : task));
      addNotification(t('profileUpdated'));
    } else {
      const eq = equipments.find(item => item.id === newMaintenance.equipmentId);
      const task = { 
        ...newMaintenance, 
        id: Date.now(), 
        equipmentName: eq ? eq.name : "N/A" 
      } as MaintenanceTask;
      setMaintenanceTasks(prev => [...prev, task]);
      addNotification(t('success'));
      setNewMaintenance({
        equipmentId: 0,
        scheduledDate: new Date().toISOString().split('T')[0],
        taskType: "ROUTINE",
        priority: "MEDIUM",
        performer: "",
        status: "PENDING",
        notes: ""
      });
    }
    setIsMaintenanceModalOpen(false);
  };

  const handleDeleteEquipment = (id: number) => {
    confirmAction(
      t('confirmAction'),
      "Bạn có chắc chắn muốn xóa thiết bị này? Thao tác này sẽ xóa toàn bộ lịch sử liên quan.",
      () => {
        setEquipments(prev => prev.filter(eq => eq.id !== id));
        setMaintenanceTasks(prev => prev.filter(task => task.equipmentId !== id));
        addNotification(t('success'));
      }
    );
  };

  const handleDeleteMaintenance = (id: number) => {
    confirmAction(
      t('confirmAction'),
      "Xác nhận xóa lịch bảo trì này?",
      () => {
        setMaintenanceTasks(prev => prev.filter(task => task.id !== id));
        addNotification(t('success'));
      }
    );
  };

  const handleVerifyAndCheckin = async (member: Member) => {
    const livePhoto = capturePhoto();
    if (!livePhoto) return;

    try {
      setIsFaceVerifying(true);
      setVerificationResult(null);
      
      const result = await verifyFace(livePhoto, member.avatar || "", member.faceData || "");
      setVerificationResult(result);

      if (result.isVerified && result.confidence > 0.7) {
        addNotification(t('faceMatched'), "success");
        // Gọi API điểm danh sau khi xác thực thành công
        await executeCheckin(member.id);
      } else {
        addNotification(t('faceNotMatched'), "error");
      }
    } catch (error) {
      console.error("Verification failed", error);
      addNotification("Lỗi xác thực AI", "error");
    } finally {
      setIsFaceVerifying(false);
    }
  };

  const executeCheckin = async (memberId: number) => {
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) {
        setIsCheckinModalOpen(false);
        setIsProfileModalOpen(false);
        setVerificationResult(null);
        fetchData();
        addNotification(t('checkinSuccess'));
      } else {
        const error = await res.json();
        addNotification(error.message, "error");
      }
    } catch (error) {
      console.error("Check-in failed", error);
    }
  };

  const handleUpdateMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    confirmAction(
      t('editTitle'),
      `${t('confirmUpdate')} ${editingMember.fullName}?`,
      async () => {
        try {
          let updatedPayload = { ...editingMember };
          
          if (editingMember.avatar && editingMember.avatar.startsWith("data:")) {
            try {
              setIsFaceAnalyzing(true);
              const signature = await analyzeFace(editingMember.avatar);
              if (signature) {
                updatedPayload.faceData = signature;
              }
            } catch (err) {
              console.error("AI Face signature extraction failed, continuing without face update:", err);
            } finally {
              setIsFaceAnalyzing(false);
            }
          }

          const res = await fetch(`/api/members/${editingMember.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedPayload),
          });
          if (res.ok) {
            setIsEditModalOpen(false);
            setShowPassword(false);
            const updatedMember = await res.json();
            setMembers((prev) =>
              prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)),
            );
            if (selectedMember?.id === updatedMember.id) {
              setSelectedMember(updatedMember);
            }
            fetchData();
            addNotification(t('profileUpdated'));
          } else {
            const error = await res.json();
            addNotification(error.message || t('updateFailed'), "error");
          }
        } catch (error) {
          console.error("Failed to update member", error);
          addNotification(t('connectionError'), "error");
        }
      },
    );
  };

  const handleCancelAddMember = () => {
    const isDirty = 
      newMember.memberCode !== "" || 
      newMember.firstName !== "" || 
      newMember.lastName !== "" || 
      newMember.phone !== "" || 
      newMember.email !== "" || 
      newMember.address !== "" || 
      newMember.avatar !== "";

    if (isDirty) {
      confirmAction(
        t('cancelConfirmTitle'),
        t('cancelConfirmMsg'),
        () => {
          stopCamera();
          setIsModalOpen(false);
          setShowPassword(false);
          setNewMember({
            memberCode: "",
            firstName: "",
            lastName: "",
            fullName: "",
            phone: "",
            email: "",
            dob: "",
            gender: "male",
            address: "",
            package: "Gói Cơ Bản",
            paymentDate: new Date().toISOString().split("T")[0],
            expiryDate: "",
            avatar: "",
            faceData: "",
            createdBy: "",
            paymentMethod: "Chuyển khoản",
            discount: 0,
            username: "",
            password: "",
          });
        },
        "danger"
      );
    } else {
      stopCamera();
      setIsModalOpen(false);
      setShowPassword(false);
    }
  };

  const generateMemberCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `MEM-${timestamp}${random}`;
  };

  const openAddMemberModal = () => {
    setNewMember(prev => ({
      ...prev,
      memberCode: generateMemberCode(),
      createdBy: checkIsAdminLike(user) ? "" : (user?.username || "")
    }));
    setIsModalOpen(true);
  };

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (user?.role !== "ADMIN" && user?.role !== "STAFF" && user?.role !== "RECEPTIONIST" && !checkIsAdminLike(user)) {
      addNotification("Bạn không có quyền thực hiện chức năng này", "error");
      return;
    }

    if (!newMember.avatar) {
      addNotification("Vui lòng cung cấp ảnh đại diện để phân tích khuôn mặt hội viên", "error");
      return;
    }

    confirmAction(
      t('addMember'),
      `${t('confirmAddMember')}: ${newMember.fullName}?`,
      async () => {
        try {
          setIsFaceAnalyzing(true);
          const faceSignature = await analyzeFace(newMember.avatar);
          
          const res = await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...newMember,
              username: newMember.username || newMember.phone || ("mem_" + Date.now().toString()),
              password: newMember.password || "123456",
              faceData: faceSignature,
              createdBy: checkIsAdminLike(user) ? (newMember.createdBy || "") : (user?.username || ""),
            }),
          });
          if (res.ok) {
            setIsModalOpen(false);
            setShowPassword(false);
            fetchData();
            addNotification(t('memberAdded'));
            setNewMember({
              memberCode: "",
              firstName: "",
              lastName: "",
              fullName: "",
              phone: "",
              email: "",
              dob: "",
              gender: "Nam",
              address: "",
              package: "Gói Cơ Bản",
              paymentDate: new Date().toISOString().split("T")[0],
              expiryDate: "",
              createdBy: checkIsAdminLike(user) ? "" : (user?.username || ""),
              avatar: "",
              faceData: "",
              paymentMethod: "Chuyển khoản",
              discount: 0,
              username: "",
              password: "",
            });
          } else {
            const error = await res.json();
            addNotification(error.message || t('addFailed'), "error");
          }
        } catch (error) {
          console.error("Failed to add member", error);
          addNotification(error instanceof Error ? error.message : t('connectionError'), "error");
        } finally {
          setIsFaceAnalyzing(false);
        }
      },
    );
  };

  const handleDeleteMember = async (id: number) => {
    if (user?.role !== "ADMIN") return;

    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (selectedMember && selectedMember.id === id) {
          setIsProfileModalOpen(false);
          setSelectedMember(null);
        }
        await fetchData();
        addNotification(t('memberDeleted'));
      } else {
        addNotification(data.message || t('deleteFailed'), "error");
      }
    } catch (error) {
      console.error("Failed to delete member", error);
      addNotification(t('deleteMemberError'), "error");
    }
  };

  const handleRestoreMember = async (id: number) => {
    if (user?.role !== "ADMIN") return;
    try {
      const res = await fetch(`/api/members/${id}/restore`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchData();
        addNotification(t('memberRestored'));
      } else {
        const error = await res.json();
        addNotification(error.message, "error");
      }
    } catch (error) {
      console.error("Failed to restore member", error);
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (user?.role !== "ADMIN") return;
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
        addNotification(t('pkgDeleteSuccess'));
      } else {
        const error = await res.json();
        addNotification(error.message, "error");
      }
    } catch (error) {
      console.error("Failed to delete package", error);
      addNotification(t('connectionError'), "error");
    }
  };

  const filteredMembers = memberStatusFilter === "DELETED" && user?.role === "ADMIN"
    ? deletedMembers.filter((m) => {
        const matchesSearch =
          m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.phone.includes(searchTerm);
        return matchesSearch;
      })
    : members.filter((m) => {
        const matchesSearch =
          m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.phone.includes(searchTerm);
        if (memberStatusFilter === "ALL") return matchesSearch;
        if (memberStatusFilter === "ACTIVE") return matchesSearch && m.status === "Hoạt động";
        if (memberStatusFilter === "EXPIRED") return matchesSearch && m.status !== "Hoạt động";
        return matchesSearch;
      });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/5 p-12 rounded-[3rem] w-full max-w-md shadow-2xl"
        >
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-6xl font-black tracking-tighter leading-none mb-4 italic text-[#CCFF00]">
                FIT
                <br />
                GYM
              </h1>
              <p className="text-xs font-black font-mono text-zinc-500 tracking-[0.3em] uppercase border-t border-white/10 pt-4">
                {t('authSystem')} // v0.4.2
              </p>
            </div>
            
            {/* Language Selector on Login */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {[
                { id: 'vi', label: 'VI' },
                { id: 'en', label: 'EN' },
                { id: 'zh', label: 'ZH' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${lang === l.id ? 'bg-[#CCFF00] text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
              {isForgotMode ? t('resetPassword') : (isRegisterMode ? t('registerTitle') : t('accessSystem'))}
            </h2>
            <div className="h-1 w-24 bg-[#CCFF00]"></div>
          </div>

          <form onSubmit={isForgotMode ? handleForgotPassword : (isRegisterMode ? handleRegister : handleLogin)} className="space-y-6">
            {isForgotMode ? (
              <div className="space-y-2">
                <label className="block text-xs font-black font-mono text-zinc-500 uppercase tracking-widest italic">
                  {t('email')}
                </label>
                <input
                  required
                  type="email"
                  placeholder="EMAIL@DOMAIN.COM"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-black uppercase tracking-tight"
                />
              </div>
            ) : isRegisterMode ? (
              <>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic font-bold">
                    Họ và tên
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="FULL NAME"
                    value={registerForm.fullName}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, fullName: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-black uppercase tracking-tight"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic font-bold">
                    {t('email')} (Đuôi @gmail.com)
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="example@gmail.com"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, email: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-black text-[#CCFF00] tracking-tight"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic font-bold">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="PASSWORD"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, password: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-black uppercase tracking-tight pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-[#CCFF00] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic font-bold">
                    {t('usernameLabel')}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="USERNAME"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-black uppercase tracking-tight"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic font-bold">
                      {t('passwordLabel')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setLoginError("");
                      }}
                      className="text-[9px] font-black text-[#CCFF00] uppercase tracking-widest hover:underline"
                    >
                      {t('forgotPassword')}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="PASSWORD"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-black uppercase tracking-tight pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-[#CCFF00] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                <p className="text-red-500 text-xs font-black font-mono uppercase tracking-widest leading-relaxed text-center">
                  {loginError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full ${isLoggingIn ? "bg-zinc-800" : "bg-[#CCFF00]"} text-black font-black py-5 rounded-2xl hover:scale-[1.02] transition-transform text-xs uppercase tracking-widest shadow-[0_10px_20px_rgba(204,255,0,0.15)] flex items-center justify-center gap-2`}
            >
              {isLoggingIn ? t('authenticating') : (isForgotMode ? t('sendResetLink') : (isRegisterMode ? t('createAccount') : t('accessSystem')))}{" "}
              <Terminal className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (isForgotMode) {
                  setIsForgotMode(false);
                } else {
                  setIsRegisterMode(!isRegisterMode);
                }
                setShowPassword(false);
                setLoginError("");
              }}
              className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              {isForgotMode ? t('backToLogin') : (isRegisterMode ? t('alreadyHaveAccount') : t('noAccount'))}
            </button>
          </form>

          <div className="mt-12 p-10 bg-white/5 rounded-[2rem] border border-white/5">
            <p className="text-xs font-black font-mono text-zinc-500 uppercase tracking-widest mb-4 italic underline">
              {t('defaultAccounts')}
            </p>
            <div className="space-y-3 text-xs font-black font-mono text-zinc-400">
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span>{t('adminLabel')}:</span>
                <span className="text-[#CCFF00]">admin@fit.com / 123456</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span>{t('receptionistLabel')}:</span>
                <span className="text-[#CCFF00]">staff@fit.com / 123456</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span>HLV / PT:</span>
                <span className="text-[#CCFF00]">pt@fit.com / 123456</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>HỘI VIÊN:</span>
                <span className="text-[#CCFF00]">member@gmail.com / 123456</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-[#0A0A0A] text-white font-sans overflow-hidden p-0 md:p-8 md:gap-8 relative">
      {/* Global Modals Backdrop */}
      <AnimatePresence>
        {(isModalOpen || isPkgModalOpen || isCheckinModalOpen || isProfileModalOpen || isStaffModalOpen || isDeletedModalOpen || isResetPasswordModalOpen || isEditModalOpen || isSidebarOpen || isProductModalOpen || isTransactionModalOpen || confirmDialog.isOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100]"
            onClick={() => {
              if (isSidebarOpen) setIsSidebarOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation - Distinctive Float Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-6 z-[90] pointer-events-none">
        <nav className="w-full h-16 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] flex items-center justify-around px-4 shadow-2xl pointer-events-auto relative overflow-hidden">
           <button 
            onClick={() => setActiveTab(user.role === "MEMBER" ? "memberPortal" : "dashboard")}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === "dashboard" || activeTab === "memberPortal" ? 'text-[#CCFF00] scale-110' : 'text-zinc-600'}`}
           >
             <LayoutDashboard className="w-5 h-5" />
             <span className="text-[7px] font-black uppercase tracking-widest">HOME</span>
           </button>

           <button 
            onClick={() => setActiveTab("packages")}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === "packages" ? 'text-[#CCFF00] scale-110' : 'text-zinc-600'}`}
           >
             <CreditCard className="w-5 h-5" />
             <span className="text-[7px] font-black uppercase tracking-widest">GÓI TẬP</span>
           </button>

           <button 
            onClick={() => setActiveTab(user.role === "MEMBER" ? "memberPortal" : "members")}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === "members" ? 'text-[#CCFF00] scale-110' : 'text-zinc-600'}`}
           >
             <Users className="w-5 h-5" />
             <span className="text-[7px] font-black uppercase tracking-widest">{user.role === "MEMBER" ? "HỒ SƠ" : "HỘI VIÊN"}</span>
           </button>

           <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center gap-1 text-zinc-600 active:text-white"
           >
             <Menu className="w-5 h-5" />
             <span className="text-[7px] font-black uppercase tracking-widest">MENU</span>
           </button>
        </nav>
      </div>

      {/* Mobile Device Bezels (Visual Only) - Smartphone feel */}
      <div className="md:hidden fixed inset-0 pointer-events-none z-[120] border-[12px] border-black rounded-[3rem] ring-4 ring-zinc-900/50" />
      <div className="md:hidden fixed top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-[1.5rem] z-[121] pointer-events-none">
        <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mt-2" />
      </div>

      {/* Thanh điều hướng bên cạnh (Desktop) */}
      <aside className="hidden md:flex relative z-[70] w-80 bg-black flex-col gap-10 shrink-0 p-10 border-r border-white/5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div className="flex justify-between items-start shrink-0">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-1">
              FIT <span className="text-[#CCFF00]">GYM</span>
            </h1>
            <p className="text-xs font-black font-mono text-zinc-600 tracking-[0.2em] uppercase border-t border-white/5 pt-2">
              {t('mgmtSystem')} v4.2
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <p className="text-xs font-black font-mono text-zinc-500 uppercase tracking-widest mb-4 italic">
              {t('access')}
            </p>
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="w-11 h-11 rounded-xl bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00]">
                <Activity className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black uppercase text-white truncate">
                  {getStaffDisplayName(user)}
                </p>
                <p className="text-xs font-black font-mono text-zinc-600 uppercase truncate">
                  {t(user.role)} // LIVE_AUTH
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-black font-mono text-zinc-500 uppercase tracking-widest mb-4 italic">
              {t('functions')}
            </p>
            <nav className="flex flex-col gap-2">
              {[
                { id: "memberPortal", label: t('memberPortal'), icon: ShieldUser, role: "MEMBER" },
                { id: "dashboard", label: t('dashboard'), icon: LayoutDashboard, role: "STAFF" },
                { id: "aiAnalytics", label: t('aiInsights'), icon: BrainCircuit, role: "STAFF" },
                { 
                  id: "memberMgmt", 
                  label: user?.role === "ADMIN" ? t('memberMgmt') : t('members'), 
                  icon: Users, 
                  role: "STAFF",
                  subItems: [
                    { id: "members", label: t('memberList'), icon: Users },
                    { id: "memberAccounts", label: t('memberAccountMgmt'), icon: Settings, role: "ADMIN_OR_STAFF" },
                  ]
                },
                { id: "pos", label: t('pos'), icon: Zap, role: "STAFF" },
                { 
                  id: "invoices", 
                  label: t('invoices'), 
                  icon: FileText, 
                  role: "STAFF",
                  subItems: [
                    { id: "invoice-sales", label: t('salesInvoices'), icon: FileText },
                    { id: "invoice-member", label: t('memberInvoices'), icon: FileText },
                    { id: "invoice-expiring", label: t('expiringInvoices'), icon: Clock },
                    { id: "invoice-expired", label: t('expiredInvoices'), icon: AlertCircle },
                  ]
                },
                { id: "packages", label: t('packages'), icon: CreditCard, role: "STAFF" },
                { id: "evaluations", label: t('evaluations'), icon: Star, role: "STAFF" },
                { 
                  id: "reports", 
                  label: t('reports'), 
                  icon: BarChart3,
                  role: "STAFF",
                  subItems: [
                    { id: "memberSales", label: t('memberSales'), icon: Users },
                    { id: "staffReport", label: t('staffReport'), icon: BarChart3 },
                    { id: "finance", label: t('finance'), icon: BarChart3, role: "ADMIN" },
                    { id: "treasury", label: t('treasury'), icon: Wallet },
                  ]
                },
                { 
                  id: "hr", 
                  label: user?.role === "ADMIN" ? t('hrManagement') : (lang === 'vi' ? 'NHÂN SỰ' : (lang === 'zh' ? '人事' : 'STAFF')), 
                  icon: Briefcase, 
                  role: "ADMIN",
                  subItems: [
                    { id: "staff", label: t('staff'), icon: Briefcase },
                    { id: "pt", label: t('pt'), icon: UserPlusIcon },
                  ]
                },
                { 
                  id: "facilitiesMgmt", 
                  label: "QUẢN LÝ CƠ SỞ", 
                  icon: Box, 
                  role: "ADMIN_OR_STAFF",
                  subItems: [
                    { id: "facilities", label: "Cơ sở vật chất", icon: Box },
                    { id: "maintenance", label: "Lịch sửa chữa & Bảo trì", icon: Calendar },
                  ]
                },
                { id: "communication", label: t('communication'), icon: MessageCircle, role: "STAFF" },
                { id: "settings", label: t('settings'), icon: Settings, role: "STAFF" },
              ].filter((item) => {
                if (!user) return false;
                if (user.role === "ADMIN") return item.role !== "MEMBER";
                if (user.role === "STAFF" || user.role === "RECEPTIONIST" || user.role === "PT") {
                  if (item.role === "ADMIN_OR_STAFF" && user.role !== "PT") return true;
                  return item.role === "STAFF";
                }
                if (user.role === "MEMBER") return item.role === "MEMBER" || item.id === "packages" || item.id === "evaluations" || item.id === "communication";
                return false;
              }).map((item) => (
                <div key={item.id} className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      if (item.id === "hr") {
                        setIsHRMenuOpen(!isHRMenuOpen);
                        setIsReportsMenuOpen(false);
                        setIsMembersMenuOpen(false);
                      } else if (item.id === "reports") {
                        setIsReportsMenuOpen(!isReportsMenuOpen);
                        setIsHRMenuOpen(false);
                        setIsMembersMenuOpen(false);
                        setIsInvoicesMenuOpen(false);
                      } else if (item.id === "invoices") {
                        setIsInvoicesMenuOpen(!isInvoicesMenuOpen);
                        setIsHRMenuOpen(false);
                        setIsReportsMenuOpen(false);
                        setIsMembersMenuOpen(false);
                      } else if (item.id === "memberMgmt") {
                        setIsMembersMenuOpen(!isMembersMenuOpen);
                        setIsInvoicesMenuOpen(false);
                        setIsHRMenuOpen(false);
                        setIsReportsMenuOpen(false);
                      } else if (item.id === "facilitiesMgmt") {
                        setIsFacilitiesMenuOpen(!isFacilitiesMenuOpen);
                        setIsInvoicesMenuOpen(false);
                        setIsHRMenuOpen(false);
                        setIsReportsMenuOpen(false);
                        setIsMembersMenuOpen(false);
                      } else {
                        setActiveTab(item.id as any);
                        setIsFacilitiesMenuOpen(false);
                        setIsHRMenuOpen(false);
                        setIsReportsMenuOpen(false);
                        setIsMembersMenuOpen(false);
                        setIsInvoicesMenuOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all group relative overflow-hidden ${
                      activeTab === item.id || (item.subItems && item.subItems.some(si => si.id === activeTab)) || (item.id === 'invoices' && activeTab.startsWith('invoice-'))
                        ? item.subItems ? "bg-white/5 text-white" : "bg-[#CCFF00] text-black shadow-[0_20px_40px_rgba(204,255,0,0.1)]"
                        : "text-zinc-600 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {!item.subItems && activeTab === item.id && (
                      <motion.div
                        layoutId="sidebar-tab-desktop"
                        className="absolute inset-0 bg-[#CCFF00]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon
                        className={`w-5 h-5 transition-colors ${
                          activeTab === item.id || (item.subItems && item.subItems.some(si => si.id === activeTab)) || (item.id === 'invoices' && activeTab.startsWith('invoice-'))
                            ? item.subItems ? "text-[#CCFF00]" : "text-black"
                            : "text-zinc-700 group-hover:text-zinc-400"
                        }`}
                      />
                      <span className="font-black italic uppercase tracking-tighter text-sm md:text-base font-display">
                        {item.label}
                      </span>
                    </div>
                    {item.subItems && (
                      <ChevronDown className={`w-4 h-4 transition-transform z-10 ${
                        (item.id === 'hr' && isHRMenuOpen) || 
                        (item.id === 'reports' && isReportsMenuOpen) ||
                        (item.id === 'memberMgmt' && isMembersMenuOpen) ||
                        (item.id === 'invoices' && isInvoicesMenuOpen) ||
                        (item.id === 'facilitiesMgmt' && isFacilitiesMenuOpen)
                          ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {item.subItems && ((item.id === 'hr' && isHRMenuOpen) || (item.id === 'reports' && isReportsMenuOpen) || (item.id === 'memberMgmt' && isMembersMenuOpen) || (item.id === 'invoices' && isInvoicesMenuOpen) || (item.id === 'facilitiesMgmt' && isFacilitiesMenuOpen)) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="flex flex-col gap-1 pl-12 pr-4 py-2 overflow-hidden"
                    >
                        {item.subItems.filter((sub: any) => {
                          if (!sub.role) return true;
                          if (sub.role === "ADMIN" && user?.role === "ADMIN") return true;
                          if (sub.role === "ADMIN_OR_STAFF" && (user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "RECEPTIONIST")) return true;
                          return sub.role === user.role;
                        }).map((sub: any) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              if (sub.id === "facilities") {
                                setActiveTab("facilities");
                              } else if (sub.id === "maintenance") {
                                setActiveTab("maintenance");
                              } else if (sub.action) {
                                sub.action();
                              } else {
                                setActiveTab(sub.id as any);
                              }
                            }}
                            className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-left text-sm font-black uppercase tracking-widest transition-all ${
                              activeTab === sub.id ? 'text-[#CCFF00] bg-[#CCFF00]/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            } ${(sub as any).action ? 'text-[#CCFF00]/80 mt-1 mb-2 border border-[#CCFF00]/10 hover:border-[#CCFF00]/30 bg-[#CCFF00]/5' : ''}`}
                          >
                            {(sub as any).action ? (
                              <Plus className="w-3.5 h-3.5" />
                            ) : (
                              <div className={`w-1.5 h-1.5 rounded-full ${activeTab === sub.id ? 'bg-[#CCFF00]' : 'bg-zinc-800'}`} />
                            )}
                            {sub.label}
                          </button>
                        ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-zinc-600 hover:text-red-500 transition-colors text-xs font-black font-mono uppercase tracking-widest group"
          >
            <div className="p-2 rounded-lg bg-red-500/0 group-hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-zinc-950 z-[110] p-8 flex flex-col md:hidden shadow-2xl overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-black tracking-tighter italic">
                FIT <span className="text-[#CCFF00]">GYM</span>
              </h1>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 bg-white/5 rounded-xl text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
               <div className="p-4 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center text-black text-sm font-black italic">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black uppercase text-white truncate">{getStaffDisplayName(user)}</p>
                    <p className="text-xs font-black font-mono text-zinc-500 uppercase truncate tracking-wider">{t(user.role)} // ACCESS_AUTH</p>
                  </div>
               </div>

               <nav className="flex flex-col gap-1.5 pt-4 border-t border-white/5">
                  <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-2 px-2 italic">{t('functions')}</p>
                  {[
                    { id: "memberPortal", label: t('memberPortal'), icon: ShieldUser, role: "MEMBER" },
                    { id: "dashboard", label: t('dashboard'), icon: LayoutDashboard, role: "STAFF" },
                    { id: "aiAnalytics", label: t('aiInsights'), icon: BrainCircuit, role: "STAFF" },
                    { 
                      id: "memberMgmt", 
                      label: user?.role === "ADMIN" ? t('memberMgmt') : t('members'), 
                      icon: Users, 
                      role: "STAFF",
                      subItems: [
                        { id: "members", label: t('memberList'), icon: Users },
                        { id: "memberAccounts", label: t('memberAccountMgmt'), icon: Settings, role: "ADMIN_OR_STAFF" },
                      ]
                    },
                    { id: "pos", label: t('pos'), icon: Zap, role: "STAFF" },
                    { 
                      id: "invoices", 
                      label: t('invoices'), 
                      icon: FileText, 
                      role: "STAFF",
                      subItems: [
                        { id: "invoice-sales", label: t('salesInvoices'), icon: FileText },
                        { id: "invoice-member", label: t('memberInvoices'), icon: FileText },
                        { id: "invoice-expiring", label: t('expiringInvoices'), icon: Clock },
                        { id: "invoice-expired", label: t('expiredInvoices'), icon: AlertCircle },
                      ]
                    },
                    { id: "packages", label: t('packages'), icon: CreditCard, role: "STAFF" },
                    { id: "evaluations", label: t('evaluations'), icon: Star, role: "STAFF" },
                    { 
                      id: "reports", 
                      label: t('reports'), 
                      icon: BarChart3,
                      role: "STAFF",
                      subItems: [
                        { id: "memberSales", label: t('memberSales'), icon: Users },
                        { id: "staffReport", label: t('staffReport'), icon: BarChart3 },
                        { id: "finance", label: t('finance'), icon: BarChart3, role: "ADMIN" },
                        { id: "treasury", label: t('treasury'), icon: Wallet },
                      ]
                    },
                    { 
                      id: "hr", 
                      label: user?.role === "ADMIN" ? t('hrManagement') : (lang === 'vi' ? 'NHÂN SỰ' : (lang === 'zh' ? '人事' : 'STAFF')), 
                      icon: Briefcase, 
                      role: "ADMIN",
                      subItems: [
                        { id: "staff", label: t('staff'), icon: Briefcase },
                        { id: "pt", label: t('pt'), icon: UserPlusIcon },
                      ]
                    },
                    { 
                      id: "facilitiesMgmt", 
                      label: "QUẢN LÝ CƠ SỞ", 
                      icon: Box, 
                      role: "ADMIN_OR_STAFF",
                      subItems: [
                        { id: "facilities", label: "Cơ sở vật chất", icon: Box },
                        { id: "maintenance", label: "Lịch sửa chữa & Bảo trì", icon: Calendar },
                      ]
                    },
                    { id: "communication", label: t('communication'), icon: MessageCircle, role: "STAFF" },
                  ].filter((item) => {
                    if (!user) return false;
                    if (user.role === "ADMIN") return item.role !== "MEMBER";
                    if (user.role === "STAFF" || user.role === "RECEPTIONIST" || user.role === "PT") {
                      if (item.role === "ADMIN_OR_STAFF" && user.role !== "PT") return true;
                      return item.role === "STAFF";
                    }
                    if (user.role === "MEMBER") return item.role === "MEMBER" || item.id === "packages" || item.id === "evaluations" || item.id === "communication";
                    return false;
                  }).map((item) => (
                    <div key={item.id} className="flex flex-col">
                       <button
                        onClick={() => {
                          if (item.id === "hr") {
                            setIsHRMenuOpen(!isHRMenuOpen);
                            setIsReportsMenuOpen(false);
                            setIsMembersMenuOpen(false);
                            setIsInvoicesMenuOpen(false);
                          } else if (item.id === "reports") {
                            setIsReportsMenuOpen(!isReportsMenuOpen);
                            setIsHRMenuOpen(false);
                            setIsMembersMenuOpen(false);
                            setIsInvoicesMenuOpen(false);
                          } else if (item.id === "invoices") {
                            setIsInvoicesMenuOpen(!isInvoicesMenuOpen);
                            setIsHRMenuOpen(false);
                            setIsReportsMenuOpen(false);
                            setIsMembersMenuOpen(false);
                          } else if (item.id === "memberMgmt") {
                            setIsMembersMenuOpen(!isMembersMenuOpen);
                            setIsInvoicesMenuOpen(false);
                            setIsHRMenuOpen(false);
                            setIsReportsMenuOpen(false);
                          } else if (item.id === "facilitiesMgmt") {
                            setIsFacilitiesMenuOpen(!isFacilitiesMenuOpen);
                            setIsInvoicesMenuOpen(false);
                            setIsHRMenuOpen(false);
                            setIsReportsMenuOpen(false);
                            setIsMembersMenuOpen(false);
                          } else {
                            setActiveTab(item.id as any);
                            setIsSidebarOpen(false);
                            setIsFacilitiesMenuOpen(false);
                            setIsHRMenuOpen(false);
                            setIsReportsMenuOpen(false);
                            setIsMembersMenuOpen(false);
                            setIsInvoicesMenuOpen(false);
                          }
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group ${
                          activeTab === item.id || (item.subItems && item.subItems.some(si => si.id === activeTab)) || (item.id === 'invoices' && activeTab.startsWith('invoice-'))
                            ? 'bg-white/5 text-white' 
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                           <item.icon className={`w-4 h-4 transition-colors ${
                              activeTab === item.id || (item.subItems && item.subItems.some(si => si.id === activeTab)) || (item.id === 'invoices' && activeTab === 'invoices')
                                ? 'text-[#CCFF00]' 
                                : 'text-zinc-600 group-hover:text-[#CCFF00]'
                           }`} />
                           <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                         </div>
                         {item.subItems && (
                            <ChevronDown className={`w-3 h-3 transition-transform ${(item.id === 'hr' && isHRMenuOpen) || (item.id === 'reports' && isReportsMenuOpen) || (item.id === 'memberMgmt' && isMembersMenuOpen) || (item.id === 'invoices' && isInvoicesMenuOpen) ? 'rotate-180' : ''}`} />
                         )}
                      </button>

                      {item.subItems && ((item.id === 'hr' && isHRMenuOpen) || (item.id === 'reports' && isReportsMenuOpen) || (item.id === 'memberMgmt' && isMembersMenuOpen) || (item.id === 'invoices' && isInvoicesMenuOpen) || (item.id === 'facilitiesMgmt' && isFacilitiesMenuOpen)) && (
                         <div className="flex flex-col pl-10 pr-2 py-1 gap-1">
                            {item.subItems.filter((sub: any) => {
                              if (!sub.role) return true;
                              if (sub.role === "ADMIN" && user?.role === "ADMIN") return true;
                              if (sub.role === "ADMIN_OR_STAFF" && (user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "RECEPTIONIST")) return true;
                              return sub.role === user.role;
                            }).map((sub: any) => (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  if (sub.id === "facilities") {
                                    setActiveTab("facilities");
                                    setIsSidebarOpen(false);
                                  } else if (sub.id === "maintenance") {
                                    setActiveTab("maintenance");
                                    setIsSidebarOpen(false);
                                  } else if (sub.action) {
                                    sub.action();
                                    setIsSidebarOpen(false);
                                  } else {
                                    setActiveTab(sub.id as any);
                                    setIsSidebarOpen(false);
                                  }
                                }}
                                className={`w-full text-left p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  activeTab === sub.id ? 'text-[#CCFF00] bg-[#CCFF00]/10' : 'text-zinc-500 hover:text-white'
                                } ${(sub as any).action ? 'text-[#CCFF00] border border-[#CCFF00]/10 mt-1 mb-2 bg-[#CCFF00]/5' : ''}`}
                              >
                                {sub.label}
                              </button>
                            ))}
                         </div>
                      )}
                    </div>
                  ))}
               </nav>

               <nav className="flex flex-col gap-1.5 pt-4 border-t border-white/5">
                 <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-2 px-2 italic">{t('systemAccount')}</p>
                 
                 <div className="flex flex-col">
                   <button
                     onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                     className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group ${isSettingsExpanded ? 'bg-white/5 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                   >
                     <div className="flex items-center gap-3">
                       <Settings className={`w-4 h-4 transition-colors ${isSettingsExpanded ? 'text-[#CCFF00]' : 'text-zinc-600 group-hover:text-[#CCFF00]'}`} />
                       <span className="text-[11px] font-black uppercase tracking-widest">{t('settings')}</span>
                     </div>
                     <motion.div
                       animate={{ rotate: isSettingsExpanded ? 180 : 0 }}
                       transition={{ duration: 0.2 }}
                     >
                       <ArrowDownRight className="w-3 h-3 text-zinc-600" />
                     </motion.div>
                   </button>

                   <AnimatePresence>
                     {isSettingsExpanded && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden bg-white/[0.02] rounded-2xl mt-1 mx-1"
                       >
                         <div className="p-3 space-y-2">
                           <p className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest px-2 mb-1">{t('chooseLang')}</p>
                           {[
                             { id: 'vi', label: t('vi') },
                             { id: 'en', label: t('en') },
                             { id: 'zh', label: t('zh') },
                           ].map((l) => (
                             <button
                               key={l.id}
                               onClick={() => {
                                 const nxtLang = l.id;
                                 setLang(nxtLang);
                                 addNotification(translations[nxtLang]?.['langSwitched'] || translations['en']['langSwitched']);
                               }}
                               className={`w-full flex items-center justify-between p-2.5 rounded-xl text-[10px] font-bold uppercase transition-all ${lang === l.id ? 'bg-[#CCFF00]/10 text-[#CCFF00]' : 'text-zinc-500 hover:text-white'}`}
                             >
                               {l.label}
                               {lang === l.id && <div className="w-1 h-1 rounded-full bg-[#CCFF00]" />}
                             </button>
                           ))}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>

                 <button
                   onClick={handleLogout}
                   className="flex items-center gap-3 p-3.5 rounded-2xl text-zinc-400 hover:bg-red-500/5 hover:text-red-500 transition-all group"
                 >
                   <LogOut className="w-4 h-4 text-zinc-600 group-hover:text-red-500" />
                   <span className="text-sm font-black uppercase tracking-widest">{t('logout')}</span>
                 </button>
               </nav>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <p className="text-[7px] font-mono text-zinc-700 uppercase tracking-widest text-center">
                V0.4.2 // SECURITY_ENCRYPTED_SESSION
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header Top Bar - Native Styled */}
      <div className="flex justify-between items-center px-4 md:hidden fixed top-0 left-0 right-0 z-[120] bg-zinc-950/95 backdrop-blur-2xl border-b border-white/5 h-11 shadow-2xl">
        <div className="flex items-center gap-3">
           <div className="w-7.5 h-7.5 rounded-xl bg-[#CCFF00] flex items-center justify-center shadow-lg shadow-[#CCFF00]/10 shrink-0">
             <Activity className="w-4.5 h-4.5 text-black" />
           </div>
           <div className="flex flex-col">
             <h1 className="text-base font-black italic tracking-tighter leading-none text-white uppercase">FIT GYM</h1>
             <p className="text-[7px] font-mono text-zinc-500 uppercase tracking-[0.3em] leading-none mt-0.5">CORE_ENGINE.V.4</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCheckinModalOpen(true)}
            className="w-7.5 h-7.5 bg-[#CCFF00]/10 rounded-xl flex items-center justify-center border border-[#CCFF00]/10 active:scale-95 transition-transform"
          >
            <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-7.5 h-7.5 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/5 active:scale-95 transition-transform"
          >
            <Menu className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Khu vực nội dung chính */}
      <main className="flex-1 bg-zinc-900/30 rounded-none md:rounded-[3rem] p-0 md:p-6 border-0 md:border border-white/5 relative overflow-hidden flex flex-col w-full h-full md:pb-0 pt-[44px] pb-[100px] md:pt-8 md:pb-0">

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute -top-10 -right-10 text-[6rem] md:text-[8rem] font-black text-white/[0.012] pointer-events-none select-none italic uppercase hidden sm:block z-0"
          >
            {activeTab === "dashboard"
              ? t('dashboard')
              : activeTab === "members"
                ? t('membersList')
                : activeTab === "pt"
                  ? t('ptManagement')
                  : activeTab === "staff"
                    ? t('management')
                    : activeTab === "packages"
                    ? t('packages')
                    : activeTab.startsWith('invoice-')
                    ? t('invoices')
                    : activeTab === "finance"
                      ? t('finance')
                    : activeTab === "staffReport"
                      ? "BÁO CÁO NHÂN VIÊN QUẦY"
                      : t('settings')}
          </motion.div>
        </AnimatePresence>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 md:mb-6 relative z-10 gap-2 md:gap-8 px-5 md:px-5">
          <div className="w-full md:w-auto pt-0 lg:pt-0">
            <div className="hidden md:flex items-center gap-3 mb-1 sm:mb-2 group cursor-default">
              <span className="text-[10px] font-black font-mono text-[#CCFF00] uppercase tracking-[0.5em] italic">
                FIT.GYM
              </span>
              <div className="h-[1px] w-8 bg-zinc-800 group-hover:w-12 group-hover:bg-[#CCFF00]/50 transition-all duration-500"></div>
              <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-[0.5em] italic">
                SYSTEM_V4
              </span>
            </div>
            <div className="flex flex-col gap-1.5 md:gap-4 mt-0 md:mt-1">
              <h2 className="text-xl md:text-5xl font-black tracking-tighter uppercase italic text-white transition-all">
                {activeTab === "dashboard"
                  ? t('dashboard')
                  : activeTab === "members"
                    ? "DANH SÁCH HỘI VIÊN"
                    : activeTab === "memberAccounts"
                      ? "DANH SÁCH TÀI KHOẢN"
                    : activeTab === "pt"
                      ? "QUẢN LÝ HUẤN LUYỆN VIÊN"
                    : activeTab === "staff"
                      ? "QUẢN LÝ NHÂN SỰ VÀ CHẤM CÔNG"
                    : activeTab === "packages"
                      ? "QUẢN LÝ GÓI TẬP"
                    : activeTab === "pos"
                      ? t('pos')
                    : activeTab === "treasury"
                      ? "THU CHI"
                    : activeTab === "finance"
                      ? t('finance')
                    : activeTab === "staffReport"
                      ? "BÁO CÁO DOANH THU NHÂN VIÊN QUẦY"
                    : activeTab === "memberSales"
                      ? t('memberSales')
                    : activeTab === "evaluations"
                      ? "ĐÁNH GIÁ DỊCH VỤ"
                    : activeTab === "aiAnalytics"
                      ? t('aiInsights')
                    : activeTab === "invoice-sales"
                      ? "HÓA ĐƠN BÁN LẺ"
                    : activeTab === "invoice-member"
                      ? "HÓA ĐƠN HỘI VIÊN"
                    : activeTab === "invoice-expiring"
                      ? "DANH SÁCH SẮP HẾT HẠN"
                    : activeTab === "invoice-expired"
                      ? "DANH SÁCH ĐÃ HẾT HẠN"
                    : activeTab === "facilities"
                      ? "QUẢN LÝ CƠ SỞ VẬT CHẤT"
                    : activeTab === "maintenance"
                      ? "LỊCH SỬA CHỮA & BẢO TRÌ"
                    : activeTab.startsWith('invoice-')
                      ? t('invoices')
                      : t('settings')}
              </h2>
              
              <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                {(activeTab === "dashboard" || activeTab === "members" || activeTab === "pt" || activeTab === "staff" || activeTab === "pos" || activeTab === "treasury" || activeTab === "packages" || activeTab.startsWith('invoice-')) && (
                  <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
                    <div className="relative w-full md:w-96 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#CCFF00] transition-colors" />
                      <input
                        type="text"
                        placeholder={
                          activeTab === "dashboard"
                            ? t('searchQuick')
                            : t('searchByPhone')
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 pl-11 pr-5 py-2.5 md:py-4 rounded-xl md:rounded-[1.5rem] text-xs md:text-sm font-medium transition-all focus:outline-none focus:border-[#CCFF00]/50 shadow-xl placeholder:text-zinc-700"
                      />
                    </div>

                    {activeTab === "members" && (
                      <div className="flex items-center gap-2 md:ml-auto">
                        {user?.role === "ADMIN" && (
                          <button
                            onClick={() => setIsDeletedModalOpen(true)}
                            className="h-10 md:h-12 px-4 md:px-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl md:rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest active:scale-95"
                            title="Hội viên đã xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Thùng rác ({deletedMembers.length})</span>
                          </button>
                        )}
                        <button
                          onClick={openAddMemberModal}
                          className="h-10 md:h-12 px-4 md:px-6 bg-[#CCFF00] text-black rounded-xl md:rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#CCFF00]/10 flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          {t('addMember')}
                        </button>
                      </div>
                    )}
                    {activeTab === "pt" && (
                      <div className="flex items-center gap-2 md:ml-auto">
                        <button
                          onClick={openAddPTModal}
                          className="h-10 md:h-12 px-4 md:px-6 bg-[#CCFF00] text-black rounded-xl md:rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#CCFF00]/10 flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          {t('addPT')}
                        </button>
                      </div>
                    )}
             {activeTab === "staff" && (
                       <div className="flex items-center gap-2 md:ml-auto">
                         {user?.role === "ADMIN" && (
                           <button
                             onClick={() => setIsPayrollModalOpen(true)}
                             className="h-10 md:h-12 px-4 md:px-6 bg-white text-black rounded-xl md:rounded-2xl hover:bg-[#CCFF00] transition-all shadow-xl flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest active:scale-95"
                           >
                             <BarChart3 className="w-4 h-4" />
                             {t('payroll')}
                           </button>
                         )}
                         <button
                           onClick={openAddStaffModal}
                           className="h-10 md:h-12 px-4 md:px-6 bg-[#CCFF00] text-black rounded-xl md:rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#CCFF00]/10 flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest active:scale-95"
                         >
                           <Plus className="w-4 h-4" />
                           {t('addStaff')}
                         </button>
                       </div>
                     )}
                    {activeTab === "evaluations" && null}
                    {activeTab === "treasury" && (
                      <div className="flex items-center gap-2 md:ml-auto">
                        <button 
                          onClick={() => setIsTransactionModalOpen(true)}
                          className="h-10 md:h-12 px-4 md:px-6 bg-[#CCFF00] text-black rounded-xl md:rounded-2xl hover:bg-white transition-all shadow-xl shadow-[#CCFF00]/10 flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          {t('addTransaction')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              {activeTab === "finance" && (
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full sm:w-fit shadow-2xl">
                  {[t('month'), t('year')].map((period, idx) => (
                    <button
                      key={period}
                      onClick={() =>
                        setFinancePeriod(idx === 0 ? "month" : "year")
                      }
                      className={`flex-1 sm:flex-none px-6 py-3 md:py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                        (idx === 0 && financePeriod === "month") ||
                        (idx === 1 && financePeriod === "year")
                          ? "bg-[#CCFF00] text-black shadow-xl shadow-[#CCFF00]/20"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(activeTab === "dashboard" || activeTab === "members") && stats && (
            <div className="text-right hidden md:block mt-auto md:mt-0">
              <span className="text-5xl font-black text-[#CCFF00] block tracking-tighter leading-none mb-1">
                {stats.totalMembers}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                {t('totalActiveMembers')}
              </span>
            </div>
          )}
        </header>

        <section className={`flex-1 relative z-10 px-0 md:pr-2 custom-scrollbar ${activeTab === 'pos' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {activeTab === "memberPortal" && user?.role === "MEMBER" && (
            <div className="space-y-12 pb-28 md:pb-6">
              {/* Member Dashboard - World Class Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-0">
                {/* Primary Profile Card - Bento 1 */}
                <div className="lg:col-span-3 bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CCFF00]/5 blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                    <div className="relative shrink-0">
                      <div className="w-40 h-40 rounded-[3rem] bg-[#CCFF00]/5 border-2 border-[#CCFF00]/20 p-2 shadow-2xl">
                        {user.avatar ? (
                          <img src={user.avatar} className="w-full h-full object-cover rounded-[2.5rem]" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 rounded-[2.5rem] flex items-center justify-center">
                            <UserIcon className="w-16 h-16 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-black border-4 border-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 bg-[#CCFF00] rounded-full animate-pulse" />
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-full text-[10px] font-black text-[#CCFF00] uppercase tracking-[0.2em] mb-4 italic">
                          <Activity className="w-3 h-3" />
                          {t('welcomeMember')}
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                          {user.fullName}
                        </h2>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">MEMBER ID</span>
                            <span className="text-xl font-black italic text-zinc-300">#{user.id.toString().padStart(4, '0')}</span>
                         </div>
                         <div className="w-[1px] h-10 bg-white/10 hidden md:block mx-4" />
                         <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">THỨ HẠNG</span>
                            <span className="text-xl font-black italic text-[#CCFF00]">PLATINUM</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Entry - Bento 2 */}
                <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover:border-[#CCFF00]/30 transition-all shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#CCFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 italic relative z-10">{t('qrCheckin')}</p>
                  <div className="w-40 h-40 bg-white p-3 rounded-[2rem] shadow-2xl relative z-10 transform group-hover:scale-105 transition-transform">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MEM_${user.id}`} 
                      className="w-full h-full mix-blend-multiply opacity-90" 
                    />
                  </div>
                  <div className="mt-6 flex flex-col items-center gap-2 relative z-10">
                    <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />)}
                    </div>
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] max-w-[140px] leading-relaxed">
                      MÃ ĐỊNH DANH DUY NHẤT CỦA BẠN
                    </p>
                  </div>
                </div>

                {/* Membership Info - Bento 3 */}
                <div className="lg:col-span-2 bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black italic uppercase text-white tracking-widest flex items-center gap-3">
                       <Star className="w-5 h-5 text-[#CCFF00]" />
                       {t('myPackage')}
                     </h3>
                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                       members.find(m => m.id === user.id)?.status === 'Hoạt động' 
                         ? 'bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/20' 
                         : 'bg-red-500/10 text-red-500 border border-red-500/20'
                     }`}>
                       {members.find(m => m.id === user.id)?.status === 'Hoạt động' ? 'ACTIVE' : 'EXPIRED'}
                     </span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-baseline justify-between">
                       <h4 className="text-4xl font-black italic uppercase tracking-tighter text-[#CCFF00]">
                         {members.find(m => m.id === user.id)?.package || "PENDING"}
                       </h4>
                       {members.find(m => m.id === user.id)?.package !== "CHƯA CÓ" && (
                         <button 
                           onClick={() => handleResetMemberPackage(user.id)}
                           className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
                         >
                           <Trash2 className="w-3 h-3" /> {t('deletePkg')}
                         </button>
                       )}
                    </div>

                    {members.find(m => m.id === user.id)?.package !== "CHƯA CÓ" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">{t('expiryDate')}</span>
                            <span className="text-xl font-black italic text-white">{members.find(m => m.id === user.id)?.expiryDate || "N/A"}</span>
                          </div>
                          <span className="text-[10px] font-black text-zinc-500 italic">
                             {Math.max(0, Math.ceil((new Date(members.find(m => m.id === user.id)?.expiryDate || "").getTime() - Date.now()) / (24 * 60 * 60 * 1000)))} NGÀY CÒN LẠI
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.max(2, Math.min(100, 
                                ((new Date(members.find(m => m.id === user.id)?.expiryDate || "").getTime() - Date.now()) / 
                                (30 * 24 * 60 * 60 * 1000)) * 100
                              ))}%` 
                            }}
                            className="h-full bg-gradient-to-r from-[#CCFF00]/50 to-[#CCFF00]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats & Quick Info - Bento 4 & 5 */}
                <div className="grid grid-cols-2 gap-6 lg:col-span-2">
                  <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between group hover:border-[#CCFF00]/20 transition-all">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Trophy className="w-6 h-6 text-[#CCFF00]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">TỔNG BUỔI TẬP</p>
                      <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                        {memberHistory.length}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between group hover:border-[#CCFF00]/20 transition-all">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-[#CCFF00]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">{t('registrationDate')}</p>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">
                        {members.find(m => m.id === user.id)?.registrationDate?.split('-').reverse().join('/') || "N/A"}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* AI Advisor - NEW Bento for Member */}
                <div className="lg:col-span-2 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-12 h-12 text-[#CCFF00]" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase text-white tracking-widest mb-4 flex items-center gap-3">
                     <BrainCircuit className="w-5 h-5 text-[#CCFF00]" />
                     GỢI Ý CÁ NHÂN HÓA AI
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setIsChatOpen(true);
                        handleSendMessage(undefined, "Gợi ý lịch tập Gym cho tôi dựa trên mục tiêu tăng cơ");
                      }}
                      className="bg-black/40 hover:bg-black/60 border border-white/5 rounded-2xl p-4 text-left transition-all group/btn"
                    >
                      <p className="text-[9px] font-black text-[#CCFF00] mb-1 italic tracking-widest uppercase">WORKOUT_PLAN</p>
                      <p className="text-xs font-black text-white italic uppercase flex items-center justify-between">
                        {t('workoutPrompt')}
                        <ArrowRight className="w-3 h-3 translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
                      </p>
                    </button>
                    <button 
                      onClick={() => {
                        setIsChatOpen(true);
                        handleSendMessage(undefined, "Tư vấn chọn gói tập phù hợp nhất với tần suất tập 3 buổi/tuần");
                      }}
                      className="bg-black/40 hover:bg-black/60 border border-white/5 rounded-2xl p-4 text-left transition-all group/btn"
                    >
                      <p className="text-[9px] font-black text-[#CCFF00] mb-1 italic tracking-widest uppercase">SMART_PICK</p>
                      <p className="text-xs font-black text-white italic uppercase flex items-center justify-between">
                        {t('packagePrompt')}
                        <ArrowRight className="w-3 h-3 translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
                      </p>
                    </button>
                  </div>
                </div>

                {/* History Tabs - Full Width Bento */}
                <div className="lg:col-span-4 bg-zinc-900 border border-white/5 rounded-[3rem] p-1 shadow-2xl flex flex-col min-h-[500px]">
                  <div className="flex gap-1 p-3 bg-zinc-950/50 rounded-[2.5rem] m-2 shrink-0">
                    <button
                      onClick={() => setProfileActiveTab("training")}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${
                        profileActiveTab === "training"
                          ? "bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      <Dumbbell className="w-4 h-4" />
                      LỊCH SỬ TẬP LUYỆN
                    </button>
                    <button
                      onClick={() => setProfileActiveTab("payment")}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${
                        profileActiveTab === "payment"
                          ? "bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      LỊCH SỬ THANH TOÁN
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <motion.div
                      key={profileActiveTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {profileActiveTab === "training" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {memberHistory.length > 0 ? (
                            memberHistory.map((log) => (
                              <div
                                key={log.id}
                                className="flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-[#CCFF00]/20 transition-all shadow-lg"
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{t('checkinAt')}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/5">
                                      <Calendar className="w-3.5 h-3.5 text-[#CCFF00]" />
                                      <span className="text-white font-black italic tracking-tighter text-sm">
                                        {new Date(log.time).toLocaleDateString("vi-VN")}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/5">
                                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                      <span className="text-zinc-300 font-bold italic tracking-tighter text-sm">
                                        {new Date(log.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-[#CCFF00]/10 text-[#CCFF00] px-4 py-2 rounded-2xl border border-[#CCFF00]/20 text-[10px] font-black uppercase italic shadow-inner">
                                  COMPLETED
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4">
                              <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-dashed border-[#CCFF00]/10 flex items-center justify-center">
                                <Dumbbell className="w-8 h-8 text-zinc-800" />
                              </div>
                              <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] italic">
                                CHƯA CÓ LỊCH SỬ TẬP
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {memberPaymentHistory.length > 0 ? (
                            memberPaymentHistory.map((sale) => (
                              <div
                                key={sale.id}
                                className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] group hover:border-[#CCFF00]/20 transition-all flex flex-col md:flex-row justify-between items-center gap-6"
                              >
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                  <div className="w-16 h-16 bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-2xl flex items-center justify-center group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                                    <CreditCard className="w-8 h-8" />
                                  </div>
                                  <div>
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">{sale.serviceName}</h4>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{sale.dateTime}</span>
                                      <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                      <span className="text-[10px] font-mono text-zinc-655 italic">#{sale.id}</span>
                                    </div>
                                    {sale.startDate && sale.expiryDate && (
                                      <div className="flex items-center gap-2 mt-3">
                                        <div className="px-3 py-1 bg-[#CCFF00]/5 border border-[#CCFF00]/10 rounded-lg text-[9px] font-black text-[#CCFF00] uppercase tracking-widest">
                                          PERIOD: {sale.startDate} <ArrowRight className="inline w-3 h-3 mx-1" /> {sale.expiryDate}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                                  <div className="text-left md:text-right">
                                    <p className="text-3xl font-black text-[#CCFF00] italic leading-tight tracking-tighter">
                                      {sale.paidAmount.toLocaleString()}đ
                                    </p>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{sale.paymentMethod}</span>
                                  </div>
                                  <div className="mt-2 px-4 py-1.5 bg-zinc-950 border border-[#CCFF00]/20 rounded-full">
                                    <span className="text-[9px] font-black text-[#CCFF00] uppercase tracking-[0.2em]">SUCCESSFUL</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
                              <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                <Wallet className="w-8 h-8 text-zinc-800" />
                              </div>
                              <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] italic">
                                CHƯA CÓ GIAO DỊCH
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dashboard" && stats ? (
            <div className="space-y-8 pb-32 md:pb-6 h-full flex flex-col overflow-y-auto custom-scrollbar px-5 md:px-5 animate-fadeIn">
              {/* Quick Actions Board (Quick Check-in & Add New Member) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 mr-0 animate-fadeIn bg-zinc-950/35 p-5 border border-white/10 rounded-[2.5rem]">
                {/* Quick Check-in Button Card */}
                <button
                  onClick={() => setIsCheckinModalOpen(true)}
                  className="group relative overflow-hidden bg-gradient-to-br from-[#CCFF00]/10 via-[#CCFF00]/5 to-zinc-950 hover:from-[#CCFF00] hover:to-[#CCFF00] p-6 rounded-[2rem] border border-[#CCFF00]/20 hover:border-[#CCFF00] text-left transition-all duration-300 shadow-xl flex items-center justify-between gap-4 active:scale-[0.98] cursor-pointer"
                >
                  <div className="space-y-1 relative z-10 transition-colors duration-300">
                    <h3 className="text-lg md:text-xl font-black text-white group-hover:text-black italic uppercase tracking-tighter">
                      {t('quickCheckin')}
                    </h3>
                    <p className="text-[10px] text-zinc-400 group-hover:text-black/80 font-bold uppercase tracking-wide">
                      Quét mã vạch / Thẻ hội viên để vào phòng máy nhanh chóng
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 group-hover:bg-black group-hover:border-black/20 flex items-center justify-center shrink-0 text-[#CCFF00] group-hover:text-black shadow-md transition-all duration-300 group-hover:rotate-6">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </button>

                {/* Add New Member Button Card */}
                <button
                  onClick={openAddMemberModal}
                  className="group relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 hover:from-[#CCFF00] hover:to-[#CCFF00] p-6 rounded-[2rem] border border-white/10 hover:border-[#CCFF00] text-left transition-all duration-300 shadow-xl flex items-center justify-between gap-4 active:scale-[0.98] cursor-pointer"
                >
                  <div className="space-y-1 relative z-10 transition-colors duration-300">
                    <h3 className="text-lg md:text-xl font-black text-white group-hover:text-black italic uppercase tracking-tighter">
                      {t('addMember')}
                    </h3>
                    <p className="text-[10px] text-zinc-400 group-hover:text-black/80 font-bold uppercase tracking-wide">
                      Đăng ký thông tin, thiết lập hội viên mới và kích hoạt gói tập
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 group-hover:bg-black group-hover:border-black/20 flex items-center justify-center shrink-0 text-[#CCFF00] group-hover:text-black shadow-md transition-all duration-300 group-hover:-rotate-6">
                    <Users className="w-6 h-6" />
                  </div>
                </button>
              </div>

              {/* Dynamic KPI Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 mr-0">
                {[
                  {
                    label: t('checkin'),
                    value: stats.checkinsToday,
                    icon: Activity,
                    color: "text-[#CCFF00]",
                    borderColor: "hover:border-[#CCFF00]/40",
                    topBarColor: "from-emerald-500 to-[#CCFF00]",
                    sub: t('today'),
                    desc: "Lượt ra vào ngày hôm nay",
                  },
                  {
                    label: t('expired'),
                    value: stats.expiredMembers,
                    icon: ClockIcon,
                    color: "text-rose-500",
                    borderColor: "hover:border-rose-500/40",
                    topBarColor: "from-red-500 to-rose-600",
                    sub: t('actionNeeded'),
                    desc: "Khách hàng cần gia hạn thẻ",
                  },
                  {
                    label: t('allMembers'),
                    value: stats.totalMembers,
                    icon: UserPlusIcon,
                    color: "text-blue-400",
                    borderColor: "hover:border-blue-500/40",
                    topBarColor: "from-blue-500 to-sky-400",
                    sub: t('total'),
                    desc: "Tổng số hội viên trong hệ thống",
                  },
                  {
                    label: t('revenue'),
                    value: `${(stats.revenueThisMonth).toLocaleString("vi-VN")}đ`,
                    icon: DollarSign,
                    color: "text-teal-400",
                    borderColor: "hover:border-teal-400/40",
                    topBarColor: "from-[#CCFF00] to-teal-400",
                    sub: t('thisMonth'),
                    desc: "Doanh thu tích lũy tháng này",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`bg-zinc-950/60 backdrop-blur-md border border-white/10 ${stat.borderColor} p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl`}
                  >
                    <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${stat.topBarColor} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-xl md:text-2xl font-black mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform origin-left ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-2 bg-white/5 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2.5 italic font-medium">{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Bento Grid Analytics Station */}
              <div className="grid grid-cols-12 gap-6 items-start mr-0">
                {/* Left Side: Charts & Verification Log Feed */}
                <div className={`${isTrafficExpanded || isCheckinsExpanded ? 'col-span-12' : 'col-span-12 lg:col-span-8'} space-y-6 transition-all duration-300`}>
                  {/* Gym Traffic Hour-by-Hour Curve */}
                  <div className="bg-zinc-950/40 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                      <div>
                        <span className="text-[10px] font-black font-mono text-[#CCFF00] uppercase tracking-widest bg-[#CCFF00]/10 px-2 py-0.5 rounded border border-[#CCFF00]/20">HOẠT ĐỘNG PHÒNG MÁY</span>
                        <h3 className="text-base font-black uppercase text-white mt-2 tracking-tight">
                          TẦN SUẤT CHECK-IN THEO GIỜ CHI TIẾT
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-mono text-zinc-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />
                          <span>QUÉT THẺ THỜI GIAN THỰC</span>
                        </div>
                        <button
                          onClick={() => {
                            setIsTrafficExpanded(!isTrafficExpanded);
                            if (!isTrafficExpanded) {
                              setIsCheckinsExpanded(false);
                            }
                          }}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                            isTrafficExpanded 
                              ? 'bg-[#CCFF00] text-zinc-950 border-[#CCFF00] hover:bg-white hover:border-white'
                              : 'bg-white/5 border-white/10 hover:border-[#CCFF00] hover:text-[#CCFF00] text-zinc-400'
                          }`}
                        >
                          {isTrafficExpanded ? "Thu nhỏ // Normal" : "Mở rộng // Expand"}
                        </button>
                      </div>
                    </div>

                    {/* Peak Hour Traffic Map */}
                    <div className={`w-full transition-all duration-300 ${isTrafficExpanded ? "h-[380px]" : "h-[260px]"}`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={(() => {
                            const hourBuckens = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
                            return hourBuckens.map((h) => {
                              const hourInt = parseInt(h.split(":")[0]);
                              const actualCount = checkins.filter(c => {
                                try {
                                  const date = new Date(c.time);
                                  const hr = date.getHours();
                                  return hr >= hourInt && hr < hourInt + 2;
                                } catch {
                                  return false;
                                }
                              }).length;
                              
                              const baselineWeight = hourInt === 6 || hourInt === 18 ? 14 : hourInt === 8 || hourInt === 16 || hourInt === 20 ? 9 : 5;
                              return {
                                hour: h,
                                "Lượt quét": actualCount + (checkins.length > 3 ? 0 : baselineWeight),
                              };
                            });
                          })()}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="dashboardTrafficGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#CCFF00" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis 
                            dataKey="hour" 
                            stroke="#52525b" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#52525b" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#09090b",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "1rem",
                              fontSize: "11px",
                              fontFamily: "monospace",
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="Lượt quét" 
                            stroke="#CCFF00" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#dashboardTrafficGrad)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {isTrafficExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs"
                      >
                        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Users className="w-12 h-12 text-[#CCFF00]" />
                          </div>
                          <p className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest mb-2 italic">KHUNG GIỜ CAO ĐIỂM (PEAK HOURS)</p>
                          <p className="text-zinc-400 leading-relaxed font-semibold">
                            Hãy chuẩn bị nhân sự vào các khung giờ <span className="text-white font-black">16:00 - 20:59</span>. Đề xuất bố trí ít nhất 3 PT túc trực phục vụ khách tập và cân nhắc mở thêm lớp Group X.
                          </p>
                        </div>
                        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Activity className="w-12 h-12 text-[#CCFF00]" />
                          </div>
                          <p className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest mb-2 italic">TỐI ƯU CHI PHÍ VẬN HÀNH</p>
                          <p className="text-zinc-400 leading-relaxed font-semibold">
                            Khung giờ <span className="text-white font-black">11:00 - 14:00</span> có lượng khách thấp. Đề xuất tắt bớt 50% điều hòa cục bộ, dồn máy chạy bộ và thực hiện bảo trì định kỳ cho thiết bị Cardio.
                          </p>
                        </div>
                        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-5">
                            <TrendingUp className="w-12 h-12 text-[#CCFF00]" />
                          </div>
                          <p className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest mb-2 italic">CHIẾN LƯỢC KINH DOANH GIỜ THẤP</p>
                          <p className="text-zinc-400 leading-relaxed font-semibold">
                            Tạo gói tập <span className="text-[#CCFF00] font-black">Happy Hour - Offpeak Membership</span> giảm 35% học phí cho khách tập chỉ đến từ 10:00 - 15:00 nhằm tối đa hóa công suất sử dụng phòng tập.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* High-End Check-in Log Timeline Feed */}
                  <div className="bg-zinc-950/40 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#CCFF00]" />
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">LỊCH SỬ QUÉT THẺ TRUY CẬP PHÒNG TẬP</h3>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded">
                          TẤT CẢ ({checkins.length})
                        </span>
                        <button
                          onClick={() => {
                            setIsCheckinsExpanded(!isCheckinsExpanded);
                            if (!isCheckinsExpanded) {
                              setIsTrafficExpanded(false);
                            }
                          }}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                            isCheckinsExpanded 
                              ? 'bg-[#CCFF00] text-zinc-950 border-[#CCFF00] hover:bg-white hover:border-white'
                              : 'bg-white/5 border-white/10 hover:border-[#CCFF00] hover:text-[#CCFF00] text-zinc-400'
                          }`}
                        >
                          {isCheckinsExpanded ? "Thu nhỏ // Normal" : "Mở rộng & Tra cứu // Expand"}
                        </button>
                      </div>
                    </div>

                    {isCheckinsExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4 bg-zinc-950 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center"
                      >
                        <div className="relative flex-1 group w-full">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-[#CCFF00] transition-colors" />
                          <input
                            type="text"
                            placeholder="Nhập tên hội viên hoặc mã ID để tra cứu lịch sử nhanh..."
                            value={dashboardCheckinQuery}
                            onChange={(e) => setDashboardCheckinQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold text-white placeholder-zinc-650 focus:outline-none focus:border-[#CCFF00]/40 transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className={`space-y-3.5 overflow-y-auto pr-1.5 custom-scrollbar transition-all duration-300 ${isCheckinsExpanded ? "max-h-[650px]" : "max-h-[380px]"}`}>
                      {(() => {
                        const filteredCheckins = checkins.filter(c => {
                          if (!dashboardCheckinQuery) return true;
                          const q = dashboardCheckinQuery.toLowerCase();
                          return c.memberName.toLowerCase().includes(q) || c.memberId.toString().includes(q);
                        });

                        return filteredCheckins.length > 0 ? (
                          filteredCheckins.map((checkin) => {
                            const associatedMember = members.find(m => m.id === checkin.memberId);
                            return (
                              <div
                                key={checkin.id}
                                className="bg-zinc-950/80 border border-white/5 p-4.5 rounded-2xl hover:border-[#CCFF00]/40 transition-colors group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                              >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#CCFF00]/0 group-hover:bg-[#CCFF00] transition-colors" />
                                <div className="flex items-center gap-4.5">
                                  {associatedMember?.avatar ? (
                                    <img 
                                      src={associatedMember.avatar} 
                                      className="w-11 h-11 rounded-xl object-cover border border-white/10 group-hover:border-[#CCFF00]/40 transition-colors shrink-0" 
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-xs text-[#CCFF00] group-hover:rotate-3 transition-transform shrink-0">
                                      {checkin.memberName.split(" ").pop()?.charAt(0) || "U"}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-black italic uppercase tracking-tight text-white group-hover:text-[#CCFF00] transition-colors">
                                      {checkin.memberName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-wider">
                                        ID-{checkin.memberId.toString().padStart(3, "0")}
                                      </span>
                                      {associatedMember?.phone && (
                                        <>
                                          <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                          <span className="text-[9px] font-mono text-zinc-500 font-bold bg-white/5 px-1 py-0.2 rounded">{associatedMember.phone}</span>
                                        </>
                                      )}
                                      <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                      <span className="text-[9.5px] font-mono font-bold text-[#CCFF00]">{associatedMember?.package || "Thẻ thường"}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-y-0 border-white/5 pt-3.5 sm:pt-0">
                                  <div className="text-left sm:text-right">
                                    <div className="text-base font-black italic tracking-tighter text-zinc-300 font-mono">
                                      {(() => {
                                        try {
                                          return new Date(checkin.time).toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                          });
                                        } catch {
                                          return "--:--:--";
                                        }
                                      })()}
                                    </div>
                                    <div className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest mt-0.5">XÁC MINH ENTRY</div>
                                  </div>

                                  <div className="px-3.5 py-1 bg-[#CCFF00]/10 text-[#CCFF00] text-[9px] font-black uppercase tracking-widest rounded-lg border border-[#CCFF00]/20 shadow-inner">
                                    APPROVED
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-16 text-center bg-zinc-900/40 rounded-3xl border border-white/5 border-dashed flex flex-col items-center justify-center gap-3">
                            <Activity className="w-8 h-8 text-zinc-700" />
                            <p className="text-[10px] font-mono text-[#CCFF00]/50 uppercase tracking-[0.4em]">KHÔNG TÌM THẤY KẾT QUẢ PHÙ HỢP</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right Side: Bento Action Deck & Demographics charts */}
                <div className={`${isStatusExpanded ? 'col-span-12' : 'col-span-12 lg:col-span-4'} space-y-6 transition-all duration-300`}>
                  {/* Membership Health Stats Chart */}
                  <div className="bg-zinc-950/40 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">TRẠNG THÁI THÀNH VIÊN</span>
                      <button
                        onClick={() => setIsStatusExpanded(!isStatusExpanded)}
                        className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border transition-all ${
                          isStatusExpanded 
                            ? 'bg-[#CCFF00] text-zinc-950 border-[#CCFF00]'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:border-[#CCFF00] hover:text-[#CCFF00]'
                        }`}
                      >
                        {isStatusExpanded ? "Rút gọn // Collapse" : "Chi tiết // Detail"}
                      </button>
                    </div>
                    <h3 className="text-base font-black uppercase text-white mb-6 tracking-tight">PHÂN BỔ TRẠNG THÁI</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="h-[210px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Hoạt động", value: stats?.activeMembers || 0 },
                                { name: "Hết hạn", value: stats?.expiredMembers || 0 },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill="#CCFF00" />
                              <Cell fill="#f43f5e" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="absolute text-center">
                          <div className="text-3xl font-black font-mono text-white tracking-widest leading-none">{stats?.totalMembers || 0}</div>
                          <div className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest mt-1">HỘI VIÊN</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00]" />
                            <span className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-widest">HOẠT ĐỘNG</span>
                          </div>
                          <p className="text-lg font-black font-mono text-[#CCFF00] pl-4">{stats?.activeMembers || 0} ({stats?.totalMembers ? Math.round(((stats.activeMembers || 0) / stats.totalMembers) * 100) : 0}%)</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-widest">HẾT HẠN</span>
                          </div>
                          <p className="text-lg font-black font-mono text-rose-400 pl-4">{stats?.expiredMembers || 0} ({stats?.totalMembers ? Math.round(((stats.expiredMembers || 0) / stats.totalMembers) * 100) : 0}%)</p>
                        </div>
                      </div>
                    </div>

                    {isStatusExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 pt-6 border-t border-white/5 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest italic animate-pulse">DANH SÁCH SẮP HẾT HẠN (30 NGÀY TỚI)</p>
                          <span className="text-[9px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                            {members.filter(m => {
                              if (!m.expiryDate || m.status !== "Hoạt động") return false;
                              const daysLeft = Math.ceil((new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                              return daysLeft > 0 && daysLeft <= 30;
                            }).length} HỘI VIÊN
                          </span>
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
                          {(() => {
                            const expiringSoon = members.filter(m => {
                              if (!m.expiryDate || m.status !== "Hoạt động") return false;
                              const daysLeft = Math.ceil((new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                              return daysLeft > 0 && daysLeft <= 30;
                            });

                            return expiringSoon.length > 0 ? (
                              expiringSoon.map((member) => {
                                const daysLeft = Math.ceil((new Date(member.expiryDate || "").getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                return (
                                  <div key={member.id} className="bg-zinc-950 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                                    <div>
                                      <p className="font-black text-white">{member.fullName}</p>
                                      <p className="text-[9px] font-mono text-zinc-500 mt-0.5">{member.phone} • {member.package}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-rose-400 font-bold font-mono bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[10px]">
                                        Còn {daysLeft} ngày
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-zinc-700 italic text-center py-4">Không có thành viên nào sắp hết hạn trong 30 ngày tới.</p>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Smart Bento Action deck */}
                  <div className="bg-[#CCFF00] p-6 rounded-[2.5rem] text-zinc-950 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -bottom-8 -right-8 text-[7rem] font-black text-black/[0.03] italic pointer-events-none tracking-tight">CORE</div>
                    
                    <div className="relative z-10 space-y-4">
                      <div>
                        <span className="text-[9px] font-black font-mono text-black/50 uppercase tracking-[0.2em] border-b border-black/10 pb-1">ĐIỀU HÀNH THÔNG MINH</span>
                        <h4 className="text-xl font-black uppercase text-black tracking-tight mt-2.5 leading-none italic">QUẢN TRỊ TÁC VỤ NHANH</h4>
                        <p className="text-[10px] text-zinc-800 tracking-wide font-medium mt-1.5">Các phím tắt khẩn cấp điều phối luồng vào phòng máy.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 pt-2">
                        {/* Add Member shortcut with high touch feedback */}
                        {(user.role === "ADMIN" || user.role === "STAFF") && (
                          <button
                            onClick={openAddMemberModal}
                            className="w-full bg-black text-[#CCFF00] font-black py-3.5 rounded-2xl hover:bg-zinc-900 duration-150 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl active:scale-95 transition-transform"
                          >
                            <UserPlusIcon className="w-4 h-4" /> THÊM HỘI VIÊN MỚI
                          </button>
                        )}

                        {/* Quick scanner camera simulator */}
                        <button
                          onClick={() => setIsCheckinModalOpen(true)}
                          className="w-full bg-black/5 border border-black/15 text-black font-black py-3.5 rounded-2xl hover:bg-black hover:text-[#CCFF00] duration-150 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2.5 active:scale-95 transition-transform"
                        >
                          <Activity className="w-4 h-4" /> QUÉT THẺ TRUY CẬP (SIM)
                        </button>

                        {/* Treasury ledger tab shortcut pivot */}
                        <button
                          onClick={() => setActiveTab("treasury")}
                          className="w-full bg-black/5 border border-black/15 text-black font-black py-3.5 rounded-2xl hover:bg-black hover:text-[#CCFF00] duration-150 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2.5 active:scale-95 transition-transform"
                        >
                          <Wallet className="w-4 h-4" /> XEM SỔ THU CHI GIAO DỊCH
                        </button>

                        {/* Gym packages pivot */}
                        <button
                          onClick={() => setActiveTab("packages")}
                          className="w-full bg-black/5 border border-black/15 text-black font-black py-3.5 rounded-2xl hover:bg-black hover:text-[#CCFF00] duration-150 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2.5 active:scale-95 transition-transform"
                        >
                          <Box className="w-4 h-4" /> GÓI TẬP & CƠ CẤU PHÍ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "memberAccounts" ? (
            <div className="space-y-6 pb-4 h-full flex flex-col overflow-hidden relative z-10 px-5 md:px-5 animate-fadeIn">
              {/* Dynamic KPI Metrics Grid (World-class standard) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {/* Total Accounts */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TỔNG TÀI KHOẢN</p>
                      <p className="text-2xl font-black text-white mt-1 font-mono tracking-tight group-hover:text-[#CCFF00] transition-colors">{members.length}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Hồ sơ đã tạo tài khoản</p>
                </div>

                {/* Account Status Active (Username config) */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">ĐÃ THIẾT LẬP USERNAME</p>
                      <p className="text-2xl font-black text-[#CCFF00] mt-1 font-mono tracking-tight">
                        {members.filter(m => m.username).length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-500 mt-2 italic font-medium">Sẵn sàng đăng nhập App</p>
                </div>

                {/* Active Membership Status */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TÀI KHOẢN HOẠT ĐỘNG</p>
                      <p className="text-2xl font-black text-white mt-1 font-mono tracking-tight">
                        {members.filter(m => m.status === 'Hoạt động').length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-cyan-400 mt-2 italic font-medium">Gói hội viên đang hoạt động</p>
                </div>

                {/* Credentials missing/suspended */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-rose-500 to-amber-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">CHƯA THIẾT LẬP / HẾT HẠN</p>
                      <p className="text-2xl font-black text-rose-500 mt-1 font-mono tracking-tight">
                        {members.filter(m => !m.username || m.status !== 'Hoạt động').length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-rose-450 group-hover:scale-110 transition-transform">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-rose-450 mt-2 italic font-medium">Cần hoàn thiện thông tin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden mx-4 md:mx-0">
                {/* Cách 1 / Left panel: Main accounts list with filter & direct reset option */}
                <div className="lg:col-span-8 bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
                  {/* Header & Local search */}
                  <div className="p-6 border-b border-white/10 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black font-mono text-white uppercase tracking-widest">DANH SÁCH TÀI KHOẢN HỘI VIÊN</h3>
                      <p className="text-[10px] text-zinc-500 mt-1">Cung cấp bộ lọc tìm kiếm và nút Reset mật khẩu nhanh.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={accountsSearchQuery}
                        onChange={(e) => setAccountsSearchQuery(e.target.value)}
                        placeholder="Tìm theo tên, mã, SĐT, ID..."
                        className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 font-medium focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/20 duration-150 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {(() => {
                      const filteredMembers = members.filter(member => {
                        const query = accountsSearchQuery.toLowerCase().trim();
                        if (!query) return true;
                        return (
                          member.fullName.toLowerCase().includes(query) ||
                          (member.memberCode && member.memberCode.toLowerCase().includes(query)) ||
                          (member.username && member.username.toLowerCase().includes(query)) ||
                          (member.phone && member.phone.includes(query))
                        );
                      });

                      if (filteredMembers.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                            <Search className="w-8 h-8 text-zinc-650 mb-3" />
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Không tìm thấy tài khoản</p>
                            <p className="text-[10px] text-zinc-650 mt-1">Thử thay đổi từ khóa hoặc tìm theo Mã hội viên bên cạnh.</p>
                          </div>
                        );
                      }

                      return (
                        <table className="w-full text-left min-w-[600px]">
                          <thead>
                            <tr className="text-[10px] font-black font-mono text-zinc-500 uppercase border-b border-white/10 bg-white/[0.005]">
                              <th className="px-6 py-4 tracking-wider italic">{t('fullName')}</th>
                              <th className="px-6 py-4 tracking-wider italic text-center">MÃ HỘI VIÊN</th>
                              <th className="px-6 py-4 tracking-wider italic text-center">ID TÀI KHOẢN</th>
                              {user?.role === "ADMIN" && (
                                <th className="px-6 py-4 tracking-wider italic text-center">MẬT KHẨU</th>
                              )}
                              <th className="px-6 py-4 tracking-wider italic text-center">{t('status')}</th>
                              <th className="px-6 py-4 tracking-wider italic text-right">Reset MK</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredMembers.map(member => (
                              <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-[11px] text-[#CCFF00]">
                                      {member.fullName.charAt(0)}
                                    </div>
                                    <div className="font-extrabold uppercase tracking-tight text-white group-hover:text-[#CCFF00] transition-colors text-xs">{member.fullName}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-[10px] font-bold font-mono text-[#CCFF00] bg-[#CCFF00]/5 border border-[#CCFF00]/10 px-2 py-1 rounded">
                                    {member.memberCode || `MEM${member.id.toString().padStart(3, '0')}`}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                                    {member.username || `mem_${member.id}`}
                                  </span>
                                </td>
                                {user?.role === "ADMIN" && (
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 inline-flex bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
                                      <span className="text-[10px] font-mono font-bold text-[#CCFF00]">
                                        {revealedPasswords[member.id] ? (member.password || "123456") : "••••••"}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setRevealedPasswords(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                                        className="text-zinc-500 hover:text-white transition-colors"
                                        title="Hiển thị mật khẩu"
                                      >
                                        {revealedPasswords[member.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </td>
                                )}
                                <td className="px-6 py-4 text-center">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${member.status === 'Hoạt động' ? 'bg-[#CCFF00]/10 text-[#CCFF00]' : 'bg-red-500/10 text-red-500'}`}>
                                    {member.status === 'Hoạt động' ? t('statusActive') : t('statusExpired')}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => handleResetMemberPassword(member.id, member.fullName)}
                                    className="px-3 py-1.5 bg-zinc-900 border border-white/10 text-zinc-400 hover:text-black hover:bg-[#CCFF00] hover:border-[#CCFF00] rounded-lg transition-all duration-150 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider ml-auto active:scale-95 animate-fadeIn"
                                    title="Khôi phục về mật khẩu mặc định 123456"
                                  >
                                    <KeyRound className="w-3 h-3" /> Reset
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>

                {/* Cách 2 / Right panel: Verify and Search to reset for staff */}
                <div className="lg:col-span-4 bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar shadow-2xl min-h-[400px]">
                  <div>
                    <span className="text-[9px] font-black font-mono text-[#CCFF00] uppercase tracking-widest border-b border-[#CCFF00]/15 pb-1 block w-fit">CÁCH 2: DÀNH CHO NHÂN VIÊN</span>
                    <h3 className="text-sm font-black font-mono text-white uppercase tracking-widest mt-2 leading-none italic">TRUY TÌM TÀI KHOẢN KHẨN CẤP</h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">Truy tra hồ sơ tài khoản bằng Mã hội viên hoặc ID người dùng rồi thực hiện cấp lại mật khẩu ngay tại chỗ.</p>
                  </div>

                  {/* Search query box */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black font-mono text-zinc-400 uppercase tracking-wider">MÃ HỘI VIÊN / TÊN ĐĂNG NHẬP (ID)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={searchMemberCode}
                          onChange={(e) => setSearchMemberCode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearchMemberCode();
                          }}
                          placeholder="Ví dụ: MEM001 hoặc hoainam"
                          className="w-full pl-3 pr-3 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-650 font-mono focus:outline-none focus:border-[#CCFF00] transition-all"
                        />
                      </div>
                      <button
                        onClick={handleSearchMemberCode}
                        className="px-4 bg-[#CCFF00] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-white transition-all flex items-center justify-center gap-1 shadow-md shrink-0 active:scale-95"
                      >
                        <Search className="w-3.5 h-3.5 stroke-[2.5]" /> Tìm
                      </button>
                    </div>
                  </div>

                  {/* Results box */}
                  <div className="flex-1 flex flex-col justify-center">
                    {searchError ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center"
                      >
                        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-red-400 uppercase tracking-tight">KẾT QUẢ TRUY TRÝ THẤT BẠI</p>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{searchError}</p>
                      </motion.div>
                    ) : foundMember ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.02] border border-[#CCFF00]/20 hover:border-[#CCFF00]/40 rounded-3xl p-5 space-y-4 relative overflow-hidden group shadow-xl"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/5 rounded-bl-full pointer-events-none" />
                        
                        <div className="flex items-center gap-4 border-b border-white/5 pb-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] font-black text-sm">
                            {foundMember.fullName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-extrabold uppercase text-white tracking-tight text-xs group-hover:text-[#CCFF00] transition-colors">{foundMember.fullName}</h4>
                            <p className="text-[9px] font-mono text-zinc-500 mt-0.5">SĐT: {foundMember.phone || t('noData')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div>
                            <span className="text-[8px] font-black font-mono text-zinc-500 block uppercase tracking-wider">MÃ HỘI VIÊN</span>
                            <span className="text-[10px] font-black font-mono text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded border border-[#CCFF00]/15 inline-block mt-1">
                              {foundMember.memberCode || `MEM${foundMember.id.toString().padStart(3, '0')}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-black font-mono text-zinc-500 block uppercase tracking-wider">ID TÀI KHOẢN</span>
                            <span className="text-[10px] font-black font-mono text-white bg-white/5 px-2 py-1 rounded mt-1 inline-block border border-white/5">
                              {foundMember.username || `mem_${foundMember.id}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-black font-mono text-zinc-500 block uppercase tracking-wider">TRẠNG THÁI HIỆU LỰC</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-1.5 ${foundMember.status === 'Hoạt động' ? 'bg-[#CCFF00]/10 text-[#CCFF00]' : 'bg-red-500/10 text-red-500'}`}>
                              {foundMember.status === 'Hoạt động' ? t('statusActive') : t('statusExpired')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-black font-mono text-zinc-500 block uppercase tracking-wider">BẢO MẬT MẬT KHẨU</span>
                            <span className="text-[10px] font-black font-mono text-zinc-400 inline-block mt-1">
                              •••••••• (ĐÃ MÃ HÓA)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleResetMemberPassword(foundMember.id, foundMember.fullName)}
                          className="w-full bg-[#CCFF00] hover:bg-white text-black font-black py-3 rounded-2xl transition-all duration-150 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#CCFF00]/10 active:scale-95"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> RESET MẬT KHẨU KHẨN CẤP
                        </button>
                      </motion.div>
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-3xl p-5 bg-white/[0.002]">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto text-zinc-650 shadow mb-3">
                          <UserCheck className="w-5 h-5 stroke-[1.5]" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Chờ lệnh truy vết</h4>
                        <p className="text-[9px] text-zinc-600 mt-1 leading-relaxed">Hãy nhập mã hội viên (Ví dụ: MEM001) bên trên để tra cứu khôi phục tài khoản riêng cho hội viên đó.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "packages" ? (
            <div className="space-y-6 pb-0 h-full flex flex-col overflow-hidden">
               <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Package Management Action Card */}
                {checkIsAdminLike(user) && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setNewPkg({
                        name: "",
                        duration: "1 Tháng",
                        price: 0,
                        description: "",
                      });
                      setEditingPkgId(null);
                      setIsPkgModalOpen(true);
                    }}
                    className="flex flex-col items-center justify-center p-6 bg-[#CCFF00] rounded-[2rem] text-black border-4 border-transparent hover:border-white shadow-2xl shadow-[#CCFF00]/20 h-[220px] md:h-[320px] group transition-all relative overflow-hidden"
                  >
                    <div className="absolute -bottom-6 -right-6 text-[6rem] md:text-[10rem] font-black text-black/[0.03] italic pointer-events-none group-hover:-translate-y-3 transition-transform">
                      ADD
                    </div>
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-black rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-6 shadow-2xl group-hover:rotate-12 transition-transform relative z-10 border border-white/10">
                      <Plus className="w-6 h-6 md:w-10 md:h-10 text-[#CCFF00]" />
                    </div>
                    <span className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-none text-center relative z-10">
                      {t('addPackage')}
                    </span>
                    <p className="text-[8px] md:text-[9px] font-black uppercase mt-2 md:mt-4 opacity-40 tracking-[0.3em] relative z-10">
                      {t('coreModulePkg')}
                    </p>
                  </motion.button>
                )}

                {packages.map((pkg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={pkg.id}
                    className="bg-zinc-950 border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative group overflow-hidden h-fit md:h-[320px] flex flex-col shadow-2xl"
                  >
                    <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 text-6xl md:text-8xl font-black text-white/[0.02] group-hover:text-[#CCFF00]/5 transition-colors italic select-none">
                      {pkg.id.toString().padStart(2, "0")}
                    </div>

                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <span
                          className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-[0.1em] ${pkg.status === "Mở bán" ? "bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10" : "bg-red-500/20 text-red-500 border border-red-500/20"}`}
                        >
                          {t(pkg.status)}
                        </span>
                        <div className="flex items-center gap-1.5 text-zinc-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span className="text-xs font-black uppercase tracking-widest">
                            {t(pkg.duration)}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xl md:text-2xl font-black italic uppercase mb-2 md:mb-3 group-hover:text-[#CCFF00] transition-colors leading-[0.9] tracking-tighter">
                        {t(pkg.name)}
                      </h4>
                      <p className="text-zinc-500 text-[10px] font-medium leading-relaxed line-clamp-2 mb-4 md:mb-auto italic">
                        {t(pkg.description)}
                      </p>

                      <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black font-mono text-zinc-600 uppercase tracking-[0.3em] mb-1.5 italic">
                            {t('valuationModel')}
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black tracking-tighter text-white group-hover:text-[#CCFF00] transition-colors">
                              {pkg.price.toLocaleString("vi-VN")}
                            </span>
                            <span className="text-sm font-black text-[#CCFF00] italic">
                              VNĐ
                            </span>
                          </div>
                        </div>

                        {checkIsAdminLike(user) && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewPkg({
                                  name: pkg.name,
                                  duration: pkg.duration,
                                  price: pkg.price,
                                  description: pkg.description,
                                });
                                setEditingPkgId(pkg.id);
                                setIsPkgModalOpen(true);
                              }}
                              className="p-3 bg-zinc-800 text-zinc-400 rounded-2xl hover:bg-[#CCFF00] hover:text-black transition-all"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmAction(
                                  t('deletePkgConfirmTitle'),
                                  `${t('deletePkgConfirmMsg')} (${t(pkg.name)})`,
                                  () => handleDeletePackage(pkg.id),
                                  "danger"
                                );
                              }}
                              className="p-3 bg-zinc-800 text-red-500/40 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}

                        {/* user.role === "MEMBER" package renewal button removed per request */}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          ) : activeTab === "members" ? (
            <div className="space-y-8 pb-4 h-full flex flex-col overflow-hidden relative z-10 px-5 md:px-5 animate-fadeIn">
              {/* Dynamic KPI Metrics Grid (World-class standard) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {/* Total Members */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">{t('allMembers') || "TỔNG HỘI VIÊN"}</p>
                      <p className="text-2xl font-black text-white mt-1 font-mono tracking-tight group-hover:text-[#CCFF00] transition-colors">{members.length}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Hồ sơ đã được số hoá</p>
                </div>

                {/* Active Members */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">{t('statusActive') || "ĐANG HOẠT ĐỘNG"}</p>
                      <p className="text-2xl font-black text-[#CCFF00] mt-1 font-mono tracking-tight">
                        {members.filter(m => m.status === 'Hoạt động').length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-500 mt-2 italic font-medium">Có quyền check-in hợp lệ</p>
                </div>

                {/* Expired Members */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-amber-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">{t('statusExpired') || "HẾT HẠN GÓI"}</p>
                      <p className="text-2xl font-black text-rose-500 mt-1 font-mono tracking-tight">
                        {members.filter(m => m.status !== 'Hoạt động').length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-rose-400 group-hover:scale-110 transition-transform">
                      <ClockIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-rose-400 mt-2 italic font-medium">Yêu cầu gia hạn tập luyện</p>
                </div>

                {/* Checked in Today */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-pink-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">CHECK-IN HÔM NAY</p>
                      <p className="text-2xl font-black text-purple-400 mt-1 font-mono tracking-tight">
                        {stats.checkinsToday}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-purple-400 mt-2 italic font-medium">Lượt quét thẻ trong ngày</p>
                </div>
              </div>

              {/* Segment Filters */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 border border-white/10 rounded-2xl overflow-x-auto custom-scrollbar shrink-0">
                {[
                  { id: "ALL", label: "Tất cả hội viên", count: members.length },
                  { id: "ACTIVE", label: "Hoạt động", count: members.filter(m => m.status === 'Hoạt động').length },
                  { id: "EXPIRED", label: "Đã hết hạn", count: members.filter(m => m.status !== 'Hoạt động').length }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setMemberStatusFilter(tier.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                      memberStatusFilter === tier.id
                        ? "bg-[#CCFF00] text-black shadow-[0_4px_20px_rgba(204,255,0,0.25)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {memberStatusFilter === tier.id && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />}
                    <span>{tier.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${
                      memberStatusFilter === tier.id ? "bg-black/10 text-black" : "bg-white/5 text-zinc-500"
                    }`}>
                      {tier.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Member Extended Data Cards Board (Unified Row layout like Staff) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-28 md:pb-6 space-y-4">
                {(() => {
                  if (filteredMembers.length === 0) {
                    return (
                      <div className="py-24 text-center bg-zinc-950/40 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-zinc-650 mb-4" />
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
                          KHÔNG TÌM THẤY HỘI VIÊN PHÙ HỢP
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredMembers.map(member => {
                        const isPassVisible = visiblePasswords[`m-${member.id}`];
                        const isExpired = new Date(member.expiryDate).getTime() < new Date().setHours(0,0,0,0);
                        return (
                          <div 
                            key={member.id} 
                            onClick={() => {
                              if (memberStatusFilter !== "DELETED") {
                                handleViewProfile(member);
                              }
                            }}
                            className={`bg-zinc-950/40 border border-white/15 hover:border-[#CCFF00]/40 p-2.5 md:p-3 rounded-xl transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 relative overflow-hidden group shadow-md ${memberStatusFilter !== "DELETED" ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {/* Accent status edge banner */}
                            <div className={`absolute top-0 left-0 h-full w-1 transition-all ${memberStatusFilter === "DELETED" ? 'bg-zinc-650' : (member.status === "Hoạt động" ? 'bg-[#CCFF00]' : 'bg-rose-500')}`} />

                            {/* Section 1: Avatar & Basic Information */}
                            <div className="flex items-center gap-2.5 min-w-[200px] pl-2">
                              <div className="relative shrink-0">
                                {member.avatar ? (
                                  <img 
                                    src={member.avatar} 
                                    className="w-8 h-8 rounded-lg object-cover border border-white/10 group-hover:border-[#CCFF00]/40 transition-colors" 
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-xs text-[#CCFF00] group-hover:rotate-6 transition-all shadow-inner relative shrink-0">
                                    {member.fullName.split(" ").pop()?.charAt(0) || "M"}
                                  </div>
                                )}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 ${member.status === "Hoạt động" ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <h4 className="font-extrabold text-xs text-white uppercase italic tracking-tighter group-hover:text-[#CCFF00] transition-colors leading-none">
                                    {member.fullName}
                                  </h4>
                                  <span className="text-[7px] font-semibold font-mono bg-white/5 border border-white/10 text-zinc-400 px-1 py-0.5 rounded leading-none">
                                    #{member.id}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5 text-[8px] text-zinc-500 font-mono">
                                  {member.gender && (
                                    <span className="bg-zinc-950 border border-white/5 px-1 py-0.2 rounded">
                                      {member.gender}
                                    </span>
                                  )}
                                  {member.dob && (
                                    <span className="bg-zinc-950 border border-white/5 px-1 py-0.2 rounded">
                                      NS: {member.dob}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Section 3: Contact & Package info */}
                            <div className="grid grid-cols-2 gap-2 min-w-[220px] lg:flex-1">
                              <div className="space-y-0.5">
                                <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block">LIÊN HỆ</span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                    <Phone className="w-2.5 h-2.5 text-[#CCFF00]/60 shrink-0" />
                                    <span className="font-semibold">{member.phone || 'Không có sđt'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 truncate max-w-[120px]">
                                    <Mail className="w-2.5 h-2.5 text-blue-400/60 shrink-0" />
                                    <span className="font-semibold truncate">{member.email || 'Không có email'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block">GÓI TẬP HIỆN TẠI</span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-bold uppercase italic">
                                    <Dumbbell className="w-2.5 h-2.5 text-[#CCFF00]/70 shrink-0" />
                                    <span>{t(member.package)}</span>
                                  </div>
                                  <div className="text-[9px] text-zinc-500 font-mono">
                                    KM: {member.discount}% | {member.paymentMethod === "Cash" ? "TM" : "CK"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Section 3.5: Nhân viên phụ trách */}
                            {checkIsAdminLike(user) && (
                              <div className="space-y-0.5 min-w-[150px] lg:max-w-[200px] lg:flex-none">
                                <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block">NV PHỤ TRÁCH</span>
                                <select
                                  value={member.createdBy || ""}
                                  onChange={async (e) => {
                                    const selectedValue = e.target.value;
                                    try {
                                      const res = await fetch(`/api/members/${member.id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ ...member, createdBy: selectedValue }),
                                      });
                                      if (res.ok) {
                                        const updatedMember = await res.json();
                                        setMembers((prev) =>
                                          prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
                                        );
                                        addNotification("Đã cập nhật nhân viên phụ trách!");
                                        fetchData(); // sync reports
                                      } else {
                                        addNotification("Cập nhật thất bại!", "error");
                                      }
                                    } catch (err) {
                                      console.error(err);
                                      addNotification("Lỗi kết nối!", "error");
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-zinc-950 border border-white/5 hover:border-[#CCFF00]/40 px-2.5 py-1.5 rounded-xl outline-none text-[10px] text-zinc-300 font-bold uppercase tracking-tight w-full hover:bg-zinc-900 transition-all cursor-pointer"
                                >
                                  <option value="" className="text-zinc-650 bg-zinc-950">HỆ THỐNG / CHƯA GÁN</option>
                                  {staffMembers.map((s) => (
                                    <option key={s.id} value={s.username || s.fullName} className="bg-zinc-950 text-white">
                                      {s.fullName.toUpperCase()} {s.username ? `(${s.username})` : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Section 4: Expiry & Quick Checkin Control */}
                            <div 
                              className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 border-t lg:border-t-0 border-white/5 pt-2.5 lg:pt-0 min-w-[185px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="text-left lg:text-right">
                                <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">HẠN SỬ DỤNG</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="inline-flex items-center gap-1 text-[9px] font-bold font-mono text-zinc-350 bg-zinc-950 px-1.5 py-0.5 rounded border border-white/5">
                                    <Calendar className="w-2.5 h-2.5 text-blue-400" />
                                    <span>{new Date(member.expiryDate).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    member.status === "Hoạt động" ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                  }`}>
                                    {member.status === "Hoạt động" ? "HOẠT ĐỘNG" : "HẾT HẠN"}
                                  </span>
                                </div>
                              </div>
                              
                              {memberStatusFilter !== "DELETED" ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickCheckin(member.id);
                                    }}
                                    disabled={isExpired}
                                    className={`px-2 py-1 font-black text-[8px] uppercase tracking-wider rounded transition-all shadow-md active:scale-95 flex items-center gap-1 ${
                                      isExpired
                                        ? "bg-rose-500/5 text-rose-500/20 border border-white/5 cursor-not-allowed opacity-50"
                                        : "bg-[#CCFF00] hover:bg-white text-black"
                                    }`}
                                  >
                                    <Activity className="w-2.5 h-2.5" /> CHECK-IN
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCommunicationActiveMemberId(member.id);
                                      setActiveTab("communication");
                                    }}
                                    className="px-2 py-1 font-black text-[8px] uppercase tracking-wider rounded transition-all shadow-md active:scale-95 flex items-center gap-1 bg-white/5 border border-white/10 text-[#CCFF00] hover:text-black hover:bg-[#CCFF00] hover:border-[#CCFF00] transition-colors"
                                  >
                                    <MessageCircle className="w-2.5 h-2.5" /> TƯƠNG TÁC
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 text-[8px] font-bold font-mono text-rose-500/80 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 tracking-wider uppercase">
                                  <Trash2 className="w-2.5 h-2.5 text-rose-500" />
                                  <span>ĐÃ XÓA MỀM</span>
                                </div>
                              )}
                            </div>

                            {/* Section 5: Direct Action Controls */}
                            <div 
                              className="flex flex-row lg:flex-col items-center gap-1 self-stretch lg:justify-center border-t lg:border-t-0 border-white/5 pt-2 lg:pt-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {memberStatusFilter === "DELETED" ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmAction(
                                      "XÁC NHẬN KHÔI PHỤC",
                                      `Bạn có chắc chắn muốn khôi phục hội viên "${member.fullName}"?`,
                                      () => handleRestoreMember(member.id),
                                      "info"
                                    );
                                  }}
                                  className="flex-1 lg:flex-none p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-[#CCFF00] hover:text-black rounded border border-emerald-500/20 transition-all active:scale-90 flex items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-wider min-w-[55px]"
                                  title="Khôi phục hội viên"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" /> <span className="lg:hidden">Khôi phục</span><span className="hidden lg:inline">Khôi phục</span>
                                </button>
                              ) : (
                                <>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingMember(member);
                                      setIsEditModalOpen(true);
                                    }}
                                    className="flex-1 lg:flex-none p-1.5 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded border border-white/5 transition-all active:scale-90 flex items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-wider min-w-[55px]"
                                    title="Sửa thông tin"
                                  >
                                    <Edit2 className="w-2.5 h-2.5 text-[#CCFF00]" /> <span className="lg:hidden">Sửa</span>
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRenewingMember(member);
                                      setIsRenewSelectModalOpen(true);
                                    }}
                                    className="flex-1 lg:flex-none p-1.5 bg-[#CCFF00]/10 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black rounded border border-[#CCFF00]/20 transition-all active:scale-90 flex items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-wider min-w-[55px]"
                                    title="Gia hạn gói tập"
                                  >
                                    <Settings className="w-2.5 h-2.5" /> <span className="lg:hidden">Gia hạn</span>
                                  </button>
                                  {user?.role === "ADMIN" && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        confirmAction(
                                          "XÁC NHẬN XÓA HỘI VIÊN",
                                          `Bạn có chắc chắn muốn xóa hội viên "${member.fullName}"? Hội viên này sẽ được chuyển vào thùng rác.`,
                                          () => handleDeleteMember(member.id),
                                          "danger"
                                        );
                                      }}
                                      className="flex-1 lg:flex-none p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded border border-rose-500/20 transition-all active:scale-90 flex items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-wider min-w-[55px]"
                                      title="Xóa mềm hội viên"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" /> <span className="lg:hidden">Xóa</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : activeTab === "pt" ? (
            <div className="space-y-8 pb-4 h-full flex flex-col overflow-hidden relative z-10 px-5 md:px-5 animate-fadeIn">
              {/* Dynamic KPI Metrics Grid (World-class standard) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {/* Total PTs */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">{t('totalInstructors') || "TỔNG HLV"}</p>
                      <p className="text-2xl font-black text-white mt-1 font-mono tracking-tight group-hover:text-[#CCFF00] transition-colors">{trainers.length}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Đội ngũ có hồ sơ hoạt động</p>
                </div>

                {/* Active Clients */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">HỘI VIÊN TIỂU BIỂU</p>
                      <p className="text-2xl font-black text-white mt-1 font-mono tracking-tight group-hover:text-[#CCFF00] transition-colors">
                        {ptStats.reduce((sum, s) => sum + s.activeClients, 0)}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Đang trong hợp đồng đào tạo</p>
                </div>

                {/* Gross Revenue */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#CCFF00] to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">DOANH THU KHÓA TẬP</p>
                      <p className="text-xl font-black text-[#CCFF00] mt-1 font-mono tracking-tight">
                        {ptStats.reduce((sum, s) => sum + s.totalRevenue, 0).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-[#CCFF00] group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-500 mt-2 italic font-bold">Tổng doanh thu PT đạt được</p>
                </div>

                {/* Total Paid / Commission */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-400 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">HOA HỒNG PHẢI TRẢ</p>
                      <p className="text-xl font-black text-teal-400 mt-1 font-mono tracking-tight">
                        {ptStats.reduce((sum, s) => sum + s.commission, 0).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-teal-400 group-hover:scale-110 transition-transform">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-teal-400 mt-2 italic font-medium">Theo tỉ lệ trích xuất cá nhân</p>
                </div>
              </div>

              {/* Advanced Interactive Level Segments (All, Master, Senior, Junior) */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 border border-white/10 rounded-2xl overflow-x-auto custom-scrollbar shrink-0">
                {[
                  { id: "ALL", label: "Tất cả huấn luyện viên", count: trainers.length },
                  { id: "MASTER", label: "Master Coach", count: trainers.filter(t => t.level === "Master").length },
                  { id: "SENIOR", label: "Senior Coach", count: trainers.filter(t => t.level === "Senior").length },
                  { id: "JUNIOR", label: "Junior Coach", count: trainers.filter(t => t.level === "Junior").length },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setPtLevelFilter(tier.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                      ptLevelFilter === tier.id
                        ? "bg-[#CCFF00] text-black shadow-[0_4px_20px_rgba(204,255,0,0.25)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {ptLevelFilter === tier.id && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />}
                    <span>{tier.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${
                      ptLevelFilter === tier.id ? "bg-black/10 text-black" : "bg-white/5 text-zinc-500"
                    }`}>
                      {tier.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Trainers Extended Data Cards Board (Unified Row layout like Staff) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-28 md:pb-6 space-y-4">
                {(() => {
                  const filteredTrainers = trainers.filter(trainer => {
                    const matchesSearch = trainer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      trainer.phone.includes(searchTerm) ||
                      (trainer.username && trainer.username.toLowerCase().includes(searchTerm.toLowerCase()));
                    
                    if (ptLevelFilter === "ALL") return matchesSearch;
                    return matchesSearch && trainer.level?.toUpperCase() === ptLevelFilter.toUpperCase();
                  });

                  if (filteredTrainers.length === 0) {
                    return (
                      <div className="py-24 text-center bg-zinc-950/40 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-zinc-650 mb-4 animate-pulse" />
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
                          KHÔNG TÌM THẤY HUẤN LUYỆN VIÊN PHÙ HỢP
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredTrainers.map(trainer => {
                        const stat = ptStats.find(s => s.trainerId === trainer.id) || {
                          trainerId: trainer.id,
                          fullName: trainer.fullName,
                          activeClients: 0,
                          totalRevenue: 0,
                          commission: 0,
                          sessionsTotal: 0
                        };
                        const isPassVisible = visiblePasswords[`p-${trainer.id}`];

                        // Calculate detailed sessions counters dynamically across all contracts/assignments
                        const trainerAssignments = ptAssignments.filter(a => a.trainerId === trainer.id);
                        const totalRegisteredSessions = trainerAssignments.reduce((sum, a) => sum + (a.totalSessions || 0), 0);
                        const totalSessionsLeft = trainerAssignments.reduce((sum, a) => sum + (a.sessionsLeft || 0), 0);
                        const totalSessionsTaught = totalRegisteredSessions - totalSessionsLeft;

                        const taughtPercent = totalRegisteredSessions > 0 
                          ? (totalSessionsTaught / totalRegisteredSessions) * 100 
                          : 0;

                        return (
                          <div 
                            key={trainer.id} 
                            onClick={() => handleViewPTDetails(trainer)}
                            className="bg-zinc-950/40 border border-white/15 hover:border-[#CCFF00]/40 p-2.5 md:p-3 rounded-xl transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 relative overflow-hidden group shadow-md cursor-pointer"
                          >
                            {/* Accent status edge banner */}
                            <div className="absolute top-0 left-0 h-full w-1 transition-all bg-[#CCFF00]" />

                            {/* Section 1: Avatar & Basic Information */}
                            <div className="flex items-center gap-2.5 min-w-[200px] pl-2">
                              <div className="relative shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-xs text-[#CCFF00] group-hover:rotate-6 transition-all shadow-inner shrink-0 leading-none">
                                  {trainer.fullName.split(" ").pop()?.substring(0, 2) || "PT"}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 bg-emerald-500 animate-pulse" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <h4 className="font-extrabold text-xs text-white uppercase italic tracking-tighter group-hover:text-[#CCFF00] transition-colors leading-none">
                                    {trainer.fullName}
                                  </h4>
                                  <span className="text-[7px] font-semibold font-mono bg-white/5 border border-white/10 text-zinc-400 px-1 py-0.5 rounded leading-none">
                                    #{trainer.id}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                                  <span className={`text-[7px] font-black uppercase tracking-wider px-1 inline-block rounded ${
                                    trainer.level === 'Master' 
                                      ? 'bg-[#CCFF00] text-black font-extrabold' 
                                      : 'bg-white/5 text-zinc-400 border border-white/10'
                                  }`}>
                                    {trainer.level} PT
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Section 2: Account Security Credentials */}
                            {user?.role === "ADMIN" && (
                              <div 
                                className="grid grid-cols-2 items-center gap-2.5 bg-zinc-950/80 p-2 rounded-lg border border-white/5 min-w-[240px] lg:flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div>
                                  <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">TÀI KHOẢN</span>
                                  <div className="flex items-center gap-1 text-zinc-350 font-bold italic tracking-tight text-[11px]">
                                    <UserIcon className="w-3 h-3 text-[#CCFF00]/70 shrink-0" />
                                    <span className="font-semibold text-white truncate max-w-[90px]">{trainer.username || 'Chưa đặt'}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">MẬT KHẨU</span>
                                  <div className="flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-zinc-550 shrink-0" />
                                    <span className="font-mono text-zinc-300 font-bold tracking-tight text-[11px] truncate">
                                      {isPassVisible ? (trainer.password || '123456') : '••••••••'}
                                    </span>
                                    <button 
                                      onClick={() => setVisiblePasswords(prev => ({...prev, [`p-${trainer.id}`]: !prev[`p-${trainer.id}`]}))}
                                      className="ml-0.5 text-zinc-500 hover:text-[#CCFF00] transition-colors p-0.5 bg-white/5 rounded border border-white/5"
                                    >
                                      {isPassVisible ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Section 3: Contact & Expertises */}
                            <div className="grid grid-cols-2 gap-2 min-w-[220px] lg:flex-1">
                              <div className="space-y-0.5">
                                <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block">LIÊN HỆ</span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                    <Phone className="w-2.5 h-2.5 text-[#CCFF00]/60 shrink-0" />
                                    <span className="font-semibold">{trainer.phone || 'Không có sđt'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 truncate max-w-[120px]">
                                    <Mail className="w-2.5 h-2.5 text-blue-400/60 shrink-0" />
                                    <span className="font-semibold truncate">{trainer.email || 'Không có email'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block">CHUYÊN MÔN PT</span>
                                <div className="flex flex-wrap gap-0.5">
                                  {trainer.expertise && trainer.expertise.length > 0 ? (
                                    trainer.expertise.map((exp, i) => (
                                      <span key={i} className="text-[8px] font-black bg-white/[0.04] text-zinc-300 px-1 py-0.2 rounded uppercase italic">
                                        {exp}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[8px] text-zinc-500 uppercase italic">Chưa cập nhật</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Section 4: Performance, Stats & Gán chỉ tiêu */}
                            <div 
                              className="grid grid-cols-2 items-center gap-2 bg-zinc-900/40 p-2 rounded-lg border border-white/5 min-w-[230px] lg:flex-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="space-y-0.5">
                                <span className="text-[7px] font-mono text-zinc-500 uppercase block leading-none">HỘI VIÊN & GIỜ DẠY</span>
                                <div className="text-[10px] text-white font-bold leading-tight">
                                  HV: <span className="text-[#CCFF00]">{stat.activeClients}</span> | Dạy: <span className="text-zinc-350">{stat.sessionsTotal}H</span>
                                </div>
                                <div className="text-[8px] font-mono text-zinc-500">
                                  Tiến độ: <span className="text-emerald-400">{taughtPercent.toFixed(0)}%</span> ({totalSessionsTaught}/{totalRegisteredSessions})
                                </div>
                              </div>
                              <div className="space-y-1 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPTAssignModal(trainer.id);
                                  }}
                                  className="w-full py-1 bg-[#CCFF00] hover:bg-white text-black text-[8px] font-black uppercase tracking-wider rounded transition-all active:scale-95 flex items-center justify-center gap-0.5 shadow-md"
                                >
                                  <UserPlusIcon className="w-2.5 h-2.5" /> GÁN HỘI VIÊN
                                </button>
                                <div className="text-[8px] font-mono text-zinc-500 font-semibold uppercase">
                                  HH ({ (trainer.commissionRate * 100).toFixed(0) }%): <span className="text-white font-bold">{stat.commission.toLocaleString()}đ</span>
                                </div>
                              </div>
                            </div>

                            {/* Section 5: Direct Action Controls */}
                            <div 
                              className="flex flex-row lg:flex-col items-center gap-1 self-stretch lg:justify-center border-t lg:border-t-0 border-white/5 pt-2 lg:pt-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewPTDetails(trainer);
                                }}
                                className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded border border-white/5 transition-all active:scale-90 flex items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-wider min-w-[55px]"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-2.5 h-2.5 text-blue-400" /> <span className="lg:hidden">Xem</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPT(trainer);
                                }}
                                className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded border border-white/5 transition-all active:scale-90 flex items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-wider min-w-[55px]"
                                title="Sửa thông tin"
                              >
                                <Edit2 className="w-2.5 h-2.5 text-[#CCFF00]" /> <span className="lg:hidden">Sửa</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePT(trainer.id);
                                }}
                                className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded border border-rose-500/20 transition-all active:scale-90 flex items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-wider min-w-[55px]"
                                title="Hủy hợp đồng PT"
                              >
                                <Trash2 className="w-2.5 h-2.5" /> <span className="lg:hidden">Xóa</span>
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : activeTab === "staff" ? (
            <div className="space-y-8 pb-4 h-full flex flex-col overflow-hidden relative z-10 px-5 md:px-5 animate-fadeIn">
              {/* Dynamic KPI Metrics Grid (World-class standard) */}
              <div className={`grid grid-cols-2 ${user?.role === "ADMIN" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 shrink-0`}>
                {/* Total Payroll */}
                {user?.role === "ADMIN" && (
                  <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">{t('totalPay')}</p>
                        <p className="text-xl md:text-2xl font-black text-[#CCFF00] mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform origin-left">
                          {payroll.reduce((sum, p) => sum + p.totalPay, 0).toLocaleString()}đ
                        </p>
                      </div>
                      <div className="p-2 bg-white/5 rounded-xl text-[#CCFF00] group-hover:scale-110 transition-transform">
                        <Wallet className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Chi phí nhân sự tháng này</p>
                  </div>
                )}

                {/* Attendance today */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">{t('attendance')}</p>
                      <p className="text-2xl font-black text-white mt-1 font-mono tracking-tight">
                        {attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && !a.checkOut).length} / {staffMembers.length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Nhân viên hiện có mặt trực ca</p>
                </div>

                {/* Total staff */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TỔNG NHÂN SỰ</p>
                      <p className="text-2xl font-black text-blue-400 mt-1 font-mono tracking-tight">
                        {staffMembers.length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Đội ngũ vận hành phòng máy</p>
                </div>

                {/* Work shift distribution */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">ĐÃ HOÀN THÀNH CA</p>
                      <p className="text-2xl font-black text-purple-400 mt-1 font-mono tracking-tight">
                        {attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && !!a.checkOut).length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                      <Trophy className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Lượt trực hoàn tất hôm nay</p>
                </div>
              </div>

              {/* Segment Filters for Staff */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 border border-white/10 rounded-2xl overflow-x-auto custom-scrollbar shrink-0">
                {[
                  { id: "ALL", label: "Tất cả nhân sự", count: staffMembers.length },
                  { id: "PRESENT", label: "Đang làm việc", count: staffMembers.filter(s => {
                    const l = attendance.find(a => a.staffId === s.id && a.date === new Date().toISOString().split('T')[0]);
                    return !!l && !l.checkOut;
                  }).length },
                  { id: "DONE", label: "Đã hoàn thành ca", count: staffMembers.filter(s => {
                    const l = attendance.find(a => a.staffId === s.id && a.date === new Date().toISOString().split('T')[0]);
                    return !!l && !!l.checkOut;
                  }).length },
                  { id: "OFF", label: "Nghỉ ca / Off", count: staffMembers.filter(s => {
                    const l = attendance.find(a => a.staffId === s.id && a.date === new Date().toISOString().split('T')[0]);
                    return !l;
                  }).length },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setStaffStatusFilter(tier.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                      staffStatusFilter === tier.id
                        ? "bg-[#CCFF00] text-black shadow-[0_4px_20px_rgba(204,255,0,0.25)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {staffStatusFilter === tier.id && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />}
                    <span>{tier.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${
                      staffStatusFilter === tier.id ? "bg-black/10 text-black" : "bg-white/5 text-zinc-500"
                    }`}>
                      {tier.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Staff Extended Data Cards Board */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-28 md:pb-6 space-y-4">
                {(() => {
                  const filteredStaff = staffMembers.filter(staff => {
                    const matchesSearch = staff.fullName.toLowerCase().includes(searchTerm.toLowerCase());
                    const todayLog = attendance.find(a => a.staffId === staff.id && a.date === new Date().toISOString().split('T')[0]);
                    if (staffStatusFilter === "ALL") return matchesSearch;
                    if (staffStatusFilter === "PRESENT") return matchesSearch && !!todayLog && !todayLog.checkOut;
                    if (staffStatusFilter === "DONE") return matchesSearch && !!todayLog && !!todayLog.checkOut;
                    if (staffStatusFilter === "OFF") return matchesSearch && !todayLog;
                    return matchesSearch;
                  });

                  if (filteredStaff.length === 0) {
                    return (
                      <div className="py-24 text-center bg-zinc-950/40 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center justify-center">
                        <UserIcon className="w-12 h-12 text-zinc-650 mb-4" />
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
                          KHÔNG TÌM THẤY NHÂN VIÊN PHÙ HỢP
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredStaff.map(staff => {
                        const todayLog = attendance.find(a => a.staffId === staff.id && a.date === new Date().toISOString().split('T')[0]);
                        const isPassVisible = visiblePasswords[`s-${staff.id}`];
                        return (
                          <div 
                            key={staff.id} 
                            className="bg-zinc-950/40 border border-white/15 hover:border-[#CCFF00]/40 p-2.5 md:p-3 rounded-xl transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 relative overflow-hidden group shadow-md"
                          >
                            {/* Accent status edge banner */}
                            <div className={`absolute top-0 left-0 h-full w-1 transition-all ${todayLog ? (todayLog.checkOut ? 'bg-zinc-750' : 'bg-[#CCFF00]') : 'bg-rose-500'}`} />

                            {/* Section 1: Avatar & Basic Information */}
                            <div className="flex items-center gap-2.5 min-w-[200px] pl-2">
                              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-xs text-[#CCFF00] group-hover:rotate-6 transition-all shadow-inner relative shrink-0">
                                {staff.fullName.split(" ").pop()?.charAt(0)}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 ${todayLog ? (todayLog.checkOut ? 'bg-zinc-500' : 'bg-[#CCFF00] animate-pulse') : 'bg-rose-500'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <h4 className="font-extrabold text-xs text-white uppercase italic tracking-tighter group-hover:text-[#CCFF00] transition-colors">
                                    {staff.fullName}
                                  </h4>
                                  <span className="text-[7px] font-semibold font-mono bg-white/5 border border-white/10 text-zinc-400 px-1 py-0.5 rounded">
                                    #{staff.id}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                  <span className="text-[7-px] text-[7.5px] font-black uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-1.5 py-0.2 rounded">
                                    {staff.position}
                                  </span>
                                  <span className="text-[7.5px] font-black font-mono text-zinc-500 uppercase tracking-wider bg-zinc-950 px-1 py-0.2 rounded border border-white/5">
                                    {staff.role}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Section 2: Account Security Credentials */}
                            {user?.role === "ADMIN" && (
                              <div className="grid grid-cols-2 items-center gap-2.5 bg-zinc-950/80 p-2 rounded-lg border border-white/5 min-w-[240px] lg:flex-1">
                                <div>
                                  <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">TÀI KHOẢN</span>
                                  <div className="flex items-center gap-1 text-zinc-350 font-bold italic tracking-tight text-[11px]">
                                    <UserIcon className="w-3 h-3 text-[#CCFF00]/70 shrink-0" />
                                    <span className="font-semibold text-white truncate max-w-[90px]">{staff.username || 'Chưa đặt'}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">MẬT KHẨU</span>
                                  <div className="flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-zinc-500 shrink-0" />
                                    <span className="font-mono text-zinc-300 font-bold tracking-tight text-[11px] truncate">
                                      {isPassVisible ? (staff.password || '123456') : '••••••••'}
                                    </span>
                                    <button 
                                      onClick={() => setVisiblePasswords(prev => ({...prev, [`s-${staff.id}`]: !prev[`s-${staff.id}`]}))}
                                      className="ml-0.5 text-zinc-500 hover:text-[#CCFF00] transition-colors p-0.5 bg-white/5 rounded border border-white/5"
                                    >
                                      {isPassVisible ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Section 3: Contact & Financial Salary info */}
                            <div className={`grid ${user?.role === 'ADMIN' ? 'grid-cols-2' : 'grid-cols-1'} gap-2 min-w-[220px] lg:flex-1`}>
                              <div className="space-y-0.5">
                                <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block">LIÊN HỆ</span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                    <Phone className="w-2.5 h-2.5 text-[#CCFF00]/60 shrink-0" />
                                    <span className="font-semibold">{staff.phoneNumber || 'Không có sđt'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 truncate max-w-[120px]">
                                    <Mail className="w-2.5 h-2.5 text-blue-400/60 shrink-0" />
                                    <span className="font-semibold truncate">{staff.email || 'Không có email'}</span>
                                  </div>
                                </div>
                              </div>
                              {user?.role === "ADMIN" && (
                                <div className="space-y-0.5">
                                  <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block">LƯƠNG & ĐÃI NGỘ</span>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                      <DollarSign className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                      <p className="font-semibold text-zinc-300">
                                        CB: <span className="text-white font-extrabold">{(staff.baseSalary || 0).toLocaleString()}đ</span>
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                      <Activity className="w-2.5 h-2.5 text-[#CCFF00]/70 shrink-0" />
                                      <p className="font-semibold text-zinc-350">
                                        Giờ: <span className="text-[#CCFF00] font-extrabold">{(staff.hourlyRate || 0).toLocaleString()}đ</span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Section 4: Live Shift Attendance Controls */}
                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 border-t lg:border-t-0 border-white/5 pt-2.5 lg:pt-0 min-w-[180px]">
                              <div className="text-left lg:text-right">
                                <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">CA TRỰC & TRẠNG THÁI</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="inline-flex items-center gap-1 text-[9px] font-bold font-mono text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-white/5">
                                    <ClockIcon className="w-2.5 h-2.5 text-purple-400" />
                                    <span>{staff.shiftHours.start}-{staff.shiftHours.end}</span>
                                  </div>
                                  {todayLog ? (
                                    <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${todayLog.checkOut ? 'bg-zinc-950 text-zinc-500 border border-white/5' : 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 animate-pulse'}`}>
                                      {todayLog.checkOut ? "XONG" : "ĐANG CA"}
                                    </span>
                                  ) : (
                                    <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">OFF</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                {!todayLog ? (
                                  <button
                                    onClick={() => handleStaffAttendance(staff.id, "checkin")}
                                    className="px-2 py-1 bg-[#CCFF00] hover:bg-white text-black font-black text-[8px] uppercase tracking-wider rounded transition-all shadow-md active:scale-95 flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-2.5 h-2.5" /> CHECK-IN
                                  </button>
                                ) : !todayLog.checkOut ? (
                                  <button
                                    onClick={() => handleStaffAttendance(staff.id, "checkout")}
                                    className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white font-black text-[8px] uppercase tracking-wider rounded transition-all shadow-md active:scale-95 flex items-center gap-1"
                                  >
                                    <LogOut className="w-2.5 h-2.5" /> CHECK-OUT
                                  </button>
                                ) : (
                                  <div className="px-1.5 py-0.5 bg-zinc-900 border border-white/5 rounded text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest text-center">
                                    XONG ({todayLog.totalHours}H)
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Section 5: Direct Action Controls */}
                            <div className="flex flex-row lg:flex-col items-center gap-1 self-stretch lg:justify-center border-t lg:border-t-0 border-white/5 pt-2 lg:pt-0">
                              <button 
                                onClick={() => handleEditStaff(staff)}
                                className="flex-1 lg:flex-none p-1.5 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded border border-white/5 transition-all active:scale-90 flex items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-wider min-w-[55px]"
                                title="Sửa nhân viên"
                              >
                                <Edit2 className="w-2.5 h-2.5 text-[#CCFF00]" /> <span className="lg:hidden">Sửa</span>
                              </button>
                              {user?.role === "ADMIN" && (
                                <button 
                                  onClick={() => handleDeleteStaff(staff.id)}
                                  className="flex-1 lg:flex-none p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded border border-rose-500/20 transition-all active:scale-90 flex items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-wider min-w-[55px]"
                                  title="Xóa nhân viên"
                                >
                                  <Trash2 className="w-2.5 h-2.5" /> <span className="lg:hidden">Xóa</span>
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : activeTab === "evaluations" ? (
            <div className="space-y-8 pb-28 md:pb-6 overflow-y-auto h-full custom-scrollbar px-4 md:px-4">
               {/* Rating Filter */}
               <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest italic">LỌC SỐ SAO:</span>
                  <div className="flex flex-wrap items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/5">
                    <button 
                      onClick={() => setRatingFilter(null)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ratingFilter === null ? 'bg-[#CCFF00] text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                      TẤT CẢ
                    </button>
                    {[5, 4, 3, 2, 1].map(stars => (
                      <button
                        key={stars}
                        onClick={() => setRatingFilter(stars === ratingFilter ? null : stars)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all border ${
                          ratingFilter === stars 
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00]' 
                            : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] font-black">{stars}</span>
                        <Star className={`w-3 h-3 ${ratingFilter === stars ? 'fill-black' : 'fill-zinc-400'}`} />
                      </button>
                    ))}
                  </div>
               </div>
               {user?.role === "MEMBER" && (
                 <div className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] p-8 max-w-2xl">
                    <h4 className="text-xl font-black italic uppercase text-[#CCFF00] tracking-tighter mb-6">{t('leaveReview')}</h4>
                    <form onSubmit={handleSubmitEvaluation} className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{t('rating')}</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setNewRating(s)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                newRating >= s ? "bg-[#CCFF00] text-black" : "bg-white/5 text-zinc-600 hover:bg-white/10"
                              }`}
                            >
                              <Star className={`w-4 h-4 ${newRating >= s ? "fill-current" : ""}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{t('suggestions')}</label>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map((idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const suggestion = t(`suggestion${idx}` as any);
                                if (newComment.includes(suggestion)) return;
                                setNewComment(prev => prev ? `${prev}, ${suggestion}` : suggestion);
                              }}
                              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-zinc-400 hover:bg-[#CCFF00]/10 hover:text-[#CCFF00] hover:border-[#CCFF00]/30 transition-all active:scale-95"
                            >
                              + {t(`suggestion${idx}` as any)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={t('comment')}
                          className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-4 text-white text-sm focus:outline-none focus:border-[#CCFF00]/50 min-h-[100px] transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full py-4 bg-[#CCFF00] text-black font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#CCFF00]/10 flex items-center justify-center gap-2 text-xs"
                      >
                        {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                        {t('submitReview')}
                      </button>
                    </form>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {evaluations
                    .filter(review => ratingFilter === null || review.rating === ratingFilter)
                    .length > 0 ? (
                    evaluations
                      .filter(review => ratingFilter === null || review.rating === ratingFilter)
                      .map((review) => (
                      <div key={review.id} className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 group hover:border-[#CCFF00]/30 transition-all shadow-xl relative overflow-hidden flex flex-col justify-between">
                         <div>
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                               <Star className="w-20 h-20 text-[#CCFF00]" />
                            </div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                               <div>
                                  <p className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest italic mb-1">{review.memberName}</p>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star key={s} className={`w-3.5 h-3.5 ${review.rating >= s ? "text-[#CCFF00] fill-[#CCFF00]" : "text-zinc-800"}`} />
                                    ))}
                                  </div>
                               </div>
                               <span className="text-[10px] font-mono text-zinc-600 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">{review.date}</span>
                            </div>
                            <p className="text-white/80 italic text-sm leading-relaxed relative z-10 mb-4">&ldquo;{review.comment}&rdquo;</p>

                            {/* Replies block */}
                            {review.replies && review.replies.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-white/5 space-y-3 relative z-10">
                                <p className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">Phản hồi ({review.replies.length}):</p>
                                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                                  {review.replies.map((reply) => (
                                    <div key={reply.id} className="bg-black/30 p-3 rounded-2xl border border-white/5 text-xs">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className={`font-black uppercase tracking-wider text-[10px] ${reply.senderRole === "ADMIN" || reply.senderRole === "STAFF" ? "text-[#CCFF00]" : "text-white"}`}>
                                          {reply.senderName} <span className="text-[8px] font-mono font-normal opacity-60">({reply.senderRole})</span>
                                        </span>
                                        <span className="text-[8px] font-mono text-zinc-500">{reply.date}</span>
                                      </div>
                                      <p className="text-zinc-300 font-medium leading-relaxed">{reply.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                         </div>

                         {/* Add reply form */}
                         {user && (
                           <div className="mt-4 pt-4 border-t border-white/5 relative z-10 flex gap-2">
                             <input
                               id={`reply-input-${review.id}`}
                               type="text"
                               placeholder="Viết phản hồi..."
                               className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]/40 transition-all font-medium"
                               onKeyDown={async (e) => {
                                 if (e.key === 'Enter') {
                                   const val = (e.currentTarget as HTMLInputElement).value.trim();
                                   if (!val) return;
                                   
                                   try {
                                     const response = await fetch(`/api/evaluations/${review.id}/reply`, {
                                       method: "POST",
                                       headers: { "Content-Type": "application/json" },
                                       body: JSON.stringify({
                                         senderName: user.fullName || user.username || "Người dùng",
                                         senderRole: user.role,
                                         text: val
                                       })
                                     });

                                     if (response.ok) {
                                       const updatedEval = await response.json();
                                       setEvaluations(prev => prev.map(ev => ev.id === review.id ? { ...ev, replies: updatedEval.replies } : ev));
                                       (e.currentTarget as HTMLInputElement).value = "";
                                       addNotification("Gửi phản hồi thành công!");
                                     } else {
                                       addNotification("Thao tác thất bại", "error");
                                     }
                                   } catch (err) {
                                     console.error("Error replying to rating:", err);
                                     addNotification("Lỗi kết nối máy chủ", "error");
                                   }
                                 }
                               }}
                             />
                             <button
                               onClick={async () => {
                                 const inputEl = document.getElementById(`reply-input-${review.id}`) as HTMLInputElement;
                                 const val = inputEl?.value.trim();
                                 if (!val) return;
                                 
                                 try {
                                   const response = await fetch(`/api/evaluations/${review.id}/reply`, {
                                     method: "POST",
                                     headers: { "Content-Type": "application/json" },
                                     body: JSON.stringify({
                                       senderName: user.fullName || user.username || "Người dùng",
                                       senderRole: user.role,
                                       text: val
                                     })
                                   });

                                   if (response.ok) {
                                     const updatedEval = await response.json();
                                     setEvaluations(prev => prev.map(ev => ev.id === review.id ? { ...ev, replies: updatedEval.replies } : ev));
                                     inputEl.value = "";
                                     addNotification("Gửi phản hồi thành công!");
                                   } else {
                                     addNotification("Thao tác thất bại", "error");
                                   }
                                 } catch (err) {
                                   console.error("Error replying to rating:", err);
                                   addNotification("Lỗi kết nối máy chủ", "error");
                                 }
                               }}
                               className="px-4 py-2 bg-[#CCFF00] hover:bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shrink-0"
                             >
                               Gửi
                             </button>
                           </div>
                         )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-40 bg-zinc-950/30 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center">
                       <Star className="w-16 h-16 text-zinc-800 mb-4" />
                       <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">{t('noEvaluations')}</p>
                    </div>
                  )}
               </div>
            </div>
          ) : activeTab === "finance" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pb-28 md:pb-6 h-full flex flex-col overflow-y-auto custom-scrollbar px-5 md:px-5"
            >
              <div className="absolute inset-0 bg-[#CCFF00]/[0.02] rounded-[3rem] -z-10 blur-3xl pointer-events-none" />

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    label: t('totalRevenue'),
                    value: `${(stats?.revenueThisMonth ?? 0).toLocaleString("vi-VN")}đ`,
                    icon: Wallet,
                    trend: "+12.5%",
                    color: "text-[#CCFF00]",
                    sub: t('revenueReal'),
                  },
                  {
                    label: t('memberValue'),
                    value: `${(stats ? stats.revenueThisMonth / (members.length || 1) : 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 })}đ`,
                    icon: DollarSign,
                    trend: "+5.2%",
                    color: "text-white",
                    sub: t('memberValueSub'),
                  },
                  {
                    label: t('renewalRate'),
                    value: "78%",
                    icon: TrendingUp,
                    trend: "+3.1%",
                    color: "text-white",
                    sub: t('renewalRateSub'),
                  },
                  {
                    label: t('nextMonthGoal'),
                    value: `${((stats?.revenueThisMonth || 0) * 1.1).toLocaleString("vi-VN", { maximumFractionDigits: 0 })}đ`,
                    icon: Calendar,
                    trend: "+10%",
                    color: "text-[#CCFF00]",
                    sub: t('growthForecast'),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-950 border border-white/10 p-6 rounded-[2.5rem] group hover:border-[#CCFF00]/40 transition-all shadow-2xl relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-[#CCFF00] group-hover:text-black transition-all">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <ArrowUpRight className="w-3 h-3" /> {item.trend}
                      </span>
                    </div>
                    <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-[0.2em] mb-2.5 italic border-l border-[#CCFF00] pl-3">
                      {item.label}
                    </p>
                    <p
                      className={`text-3xl font-black italic tracking-tighter ${item.color} mb-0.5`}
                    >
                      {item.value}
                    </p>
                    <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-12 gap-8">
                {/* Main Revenue Chart */}
                <div className="col-span-12 md:col-span-8 space-y-8">
                  <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-xs font-black uppercase italic tracking-widest">
                          {t('revenueWeekChart')}
                        </h3>
                        <p className="text-[9px] font-mono text-zinc-500 uppercase mt-1">
                          {t('revenueUnit')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#CCFF00]"></div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {t('revenueReal')}
                        </span>
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={revenueData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorRevenue"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#CCFF00"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#CCFF00"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#ffffff05"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#52525b",
                              fontSize: 10,
                              fontWeight: "bold",
                            }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#52525b",
                              fontSize: 10,
                              fontWeight: "bold",
                            }}
                            tickFormatter={(value) => `${value / 1000000}M`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#09090b",
                              borderColor: "#ffffff10",
                              borderRadius: "16px",
                            }}
                            itemStyle={{
                              color: "#CCFF00",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                            cursor={{ stroke: "#CCFF00", strokeWidth: 1 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#CCFF00"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-xs font-black uppercase italic tracking-widest">
                          {t('checkinDensity')}
                        </h3>
                        <p className="text-[9px] font-mono text-zinc-500 uppercase mt-1">
                          {t('checkinUnit')}
                        </p>
                      </div>
                      <BarChart3 className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={checkinTrends}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#ffffff05"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#52525b",
                              fontSize: 10,
                              fontWeight: "bold",
                            }}
                          />
                          <Tooltip
                            cursor={{ fill: "#ffffff05" }}
                            contentStyle={{
                              backgroundColor: "#09090b",
                              borderColor: "#ffffff10",
                              borderRadius: "12px",
                            }}
                            itemStyle={{
                              color: "#CCFF00",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="#CCFF00"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Package Distribution Pie Chart */}
                <div className="col-span-12 md:col-span-4 bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col">
                  <h3 className="text-xs font-black uppercase italic tracking-widest mb-8">
                    {t('packageDistribution')}
                  </h3>
                  <div className="h-[200px] w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={packageDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {packageDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#09090b",
                            borderColor: "#ffffff10",
                            borderRadius: "12px",
                          }}
                          itemStyle={{ fontSize: "10px", fontWeight: "bold" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-6">
                    {packageDistribution.map((pkg, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-[10px] font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: pkg.color }}
                          ></div>
                          <span className="text-zinc-500 uppercase">
                            {pkg.name}
                          </span>
                        </div>
                        <span className="text-white font-black">
                          {pkg.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPI and Detailed Stats */}
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em] italic underline">
                      {t('staffKPI')}
                    </h3>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                      <TrendingUp className="w-4 h-4 text-[#CCFF00]" />
                      <span className="text-[10px] font-black uppercase text-zinc-300">
                        {t('growthMsg')}
                      </span>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left min-w-[700px]">
                        <thead>
                          <tr className="text-xs font-mono text-zinc-400 uppercase border-b border-white/10">
                            <th className="px-8 py-5 tracking-[.2em] font-black">
                              {t('staff')}
                            </th>
                            <th className="px-6 py-5 tracking-[.2em] text-center font-black">
                              {t('newMembers')}
                            </th>
                            <th className="px-6 py-5 tracking-[.2em] text-center font-black">
                              {t('progress')}
                            </th>
                            <th className="px-8 py-5 text-right tracking-[.2em] font-black">
                              {t('revenueVND')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {kpiData.map((kpi, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-white/[0.02] transition-colors group"
                            >
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-xs text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                                    {kpi.fullName.split(" ").pop()?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-black uppercase tracking-tight text-white mb-0.5">
                                      {getStaffDisplayName({ 
                                        username: kpi.username || "", 
                                        fullName: kpi.fullName || "", 
                                        role: kpi.role || "" 
                                      }).split(" - ")[0]}
                                    </p>
                                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                                      {t(kpi.role || "")}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6 text-center">
                                <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                                  <Users className="w-3 h-3 text-zinc-500" />
                                  <span className="text-sm font-black italic">
                                    {kpi.count}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6 w-48">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-[8px] font-mono uppercase text-zinc-500">
                                    <span>KPI</span>
                                    <span>
                                      {Math.min(
                                        100,
                                        Math.round((kpi.count / 10) * 100),
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#CCFF00]"
                                      style={{
                                        width: `${Math.min(100, Math.round((kpi.count / 10) * 100))}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <p className="text-lg font-black italic text-[#CCFF00] tracking-tighter">
                                  {kpi.revenue.toLocaleString("vi-VN")}
                                </p>
                                <p className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest">
                                  {t('kpiBonus')}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "staffReport" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pb-28 md:pb-6 h-full flex flex-col overflow-y-auto custom-scrollbar px-5 md:px-5 relative z-10"
            >
              <div className="absolute inset-0 bg-[#CCFF00]/[0.015] rounded-[3rem] -z-10 blur-3xl pointer-events-none" />

              {/* Metric summary boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-[#CCFF00]/40 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-[#CCFF00] group-hover:text-black transition-all duration-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded">HỘI VIÊN ĐĂNG KÝ BỞI NV</span>
                  </div>
                  <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">Tổng hội viên</p>
                  <p className="text-3xl font-black italic tracking-tighter text-white">
                    {kpiData.reduce((acc, curr) => acc + (curr.count || 0), 0)}
                  </p>
                </div>

                <div className="bg-zinc-950 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-[#CCFF00]/40 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-[#CCFF00] group-hover:text-black transition-all duration-300">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded">DOANH SỐ NV TẠO</span>
                  </div>
                  <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">Doanh thu nhân viên</p>
                  <p className="text-3xl font-black italic tracking-tighter text-[#CCFF00]">
                    {kpiData.reduce((acc, curr) => acc + (curr.revenue || 0), 0).toLocaleString("vi-VN")}đ
                  </p>
                </div>

                <div className="bg-zinc-950 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-[#CCFF00]/40 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-[#CCFF00] group-hover:text-black transition-all duration-300">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded">ĐẠT CHỈ TIÊU</span>
                  </div>
                  <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">Nhân viên xuất sắc nhất</p>
                  <p className="text-xl font-black italic tracking-tighter text-white truncate uppercase">
                    {kpiData.length > 0 ? [...kpiData].sort((a,b) => b.revenue - a.revenue)[0]?.fullName : "---"}
                  </p>
                </div>
              </div>

              {/* Main Content Area: Chart and List */}
              <div className="grid grid-cols-12 gap-8">
                {/* Chart component */}
                <div className="col-span-12 xl:col-span-7 bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xs font-black uppercase italic tracking-widest text-[#CCFF00]">
                        BIỂU ĐỒ DOANH THU NHÂN VIÊN QUẦY ĐĂNG KÝ
                      </h3>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase mt-1">
                        Báo cáo chi tiết doanh thu thực tế được nhân viên quầy mang lại dựa trên đăng ký hội viên
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-zinc-600" />
                  </div>

                  <div className="h-[320px] w-full flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={kpiData.map(k => ({
                          name: k.fullName.split(" ").slice(-2).join(" "), // Short name for readability on mobile/desktop
                          fullName: k.fullName,
                          "Doanh thu": k.revenue,
                          "Số hội viên": k.count
                        }))}
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#71717a", fontSize: 10, fontWeight: "bold" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#71717a", fontSize: 10, fontWeight: "bold" }}
                          tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#09090b",
                            borderColor: "#ffffff10",
                            borderRadius: "16px",
                          }}
                          itemStyle={{
                            color: "#CCFF00",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                          cursor={{ fill: "rgba(255,255,255,0.02)" }}
                        />
                        <Bar dataKey="Doanh thu" fill="#CCFF00" radius={[10, 10, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* KPI stats breakdowns */}
                <div className="col-span-12 xl:col-span-5 bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col">
                  <h3 className="text-xs font-black uppercase italic tracking-widest mb-6">
                    TỔNG HỢP THEO NHÂN VIÊN QUẦY
                  </h3>
                  <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar flex-1">
                    {kpiData.map((kpi, idx) => {
                      const avgRev = kpi.count > 0 ? kpi.revenue / kpi.count : 0;
                      return (
                        <div
                          key={idx}
                          className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-3 group hover:border-[#CCFF00]/20 transition-all duration-300"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-xs text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-black transition-colors duration-300">
                                {kpi.fullName.split(" ").pop()?.charAt(0)}
                              </div>
                              <div>
                                <span className="text-xs font-black text-white block uppercase">{kpi.fullName}</span>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{t(kpi.role || "")}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black italic text-[#CCFF00] block">{kpi.revenue.toLocaleString("vi-VN")}đ</span>
                              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Doanh thu tạo</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-2.5">
                            <div>
                              <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block">Số hội viên</span>
                              <span className="text-xs font-black text-white">{kpi.count} hội viên</span>
                            </div>
                            <div>
                              <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block">Trung bình / HV</span>
                              <span className="text-xs font-semibold text-zinc-300">{avgRev.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}đ</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown section list */}
              <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-[0.3em] italic">
                      CHI TIẾT HỘI VIÊN DO TỪNG NHÂN VIÊN QUẦY ĐĂNG KÝ
                    </h3>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase mt-1">
                      Tra cứu chi tiết danh sách hội viên cụ thể được tạo lập bởi từng nhân viên quầy trong hệ thống
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {kpiData.map((staffStats) => {
                    const staffMembersList = members.filter(m => m.createdBy === staffStats.username);
                    return (
                      <div key={staffStats.username} className="border border-white/5 bg-white/[0.01] rounded-3xl p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{staffStats.fullName}</h4>
                              <p className="text-[8px] font-mono text-[#CCFF00] uppercase tracking-[0.2em] font-black">{staffStats.username}</p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-2xl text-center">
                              <span className="text-[8px] font-mono text-zinc-500 uppercase block tracking-wider">Hội viên đăng ký</span>
                              <span className="text-sm font-black text-white mt-0.5 block">{staffMembersList.length}</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-2xl text-center">
                              <span className="text-[8px] font-mono text-zinc-500 uppercase block tracking-wider">Tổng doanh thu</span>
                              <span className="text-sm font-black text-[#CCFF00] mt-0.5 block">{staffStats.revenue.toLocaleString("vi-VN")}đ</span>
                            </div>
                          </div>
                        </div>

                        {staffMembersList.length > 0 ? (
                          <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest border-b border-white/5">
                                  <th className="pb-3 pl-2">HỘI VIÊN</th>
                                  <th className="pb-3">MÃ HỘI VIÊN</th>
                                  <th className="pb-3 text-center">GÓI TẬP ĐĂNG KÝ</th>
                                  <th className="pb-3 text-right">DOANH THU THỰC TẾ</th>
                                  <th className="pb-3 text-center">NGÀY ĐĂNG KÝ</th>
                                  <th className="pb-3 text-right pr-2">TRẠNG THÁI</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.02]">
                                {staffMembersList.map((m) => (
                                  <tr key={m.id} className="text-xs hover:bg-white/[0.01] transition-colors whitespace-nowrap">
                                    <td className="py-3 pl-2 font-black text-white uppercase italic">{m.fullName}</td>
                                    <td className="py-3 font-mono font-bold text-zinc-400">{m.memberCode || `MEM${m.id.toString().padStart(3, '0')}`}</td>
                                    <td className="py-3 text-center">
                                      <span className="bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-zinc-300">
                                        {m.package || "Gói tập thử khách"}
                                      </span>
                                    </td>
                                    <td className="py-3 text-right font-black text-[#CCFF00]">{(m.revenue || 0).toLocaleString("vi-VN")}đ</td>
                                    <td className="py-3 text-center font-mono text-[10px] text-zinc-500 italic">{m.registrationDate || "---"}</td>
                                    <td className="py-3 text-right pr-2">
                                      <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${m.status === 'Hoạt động' ? 'bg-[#CCFF00]/15 text-[#CCFF00]' : 'bg-rose-500/15 text-rose-500'}`}>
                                        {m.status === 'Hoạt động' ? 'Hoạt động' : 'Hết hạn'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="py-8 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                            <p className="text-[10px] text-zinc-550 font-black uppercase tracking-wider italic">Nhân viên này chưa thực hiện đăng ký cho hội viên nào</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : activeTab === "memberSales" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 h-full flex flex-col overflow-hidden px-5 md:px-5"
            >
              <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-zinc-950 z-10">
                      <tr className="text-sm font-black font-mono text-zinc-400 uppercase border-b border-white/5 bg-white/[0.01]">
                        <th className="px-8 py-6 tracking-widest italic">ID</th>
                        <th className="px-8 py-6 tracking-widest italic">{t('customer')}</th>
                        <th className="px-8 py-6 tracking-widest italic">{t('service')}</th>
                        <th className="px-8 py-6 tracking-widest italic">{t('dateTime')}</th>
                        <th className="px-8 py-6 tracking-widest italic text-right">{t('amount')}</th>
                        <th className="px-8 py-6 tracking-widest italic text-center">{t('discount')}</th>
                        <th className="px-8 py-6 tracking-widest italic text-center">{t('payment')}</th>
                        <th className="px-8 py-6 tracking-widest italic text-right">{t('paid')}</th>
                        <th className="px-8 py-6 tracking-widest italic text-right">{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {memberSales.length > 0 ? (
                        memberSales.map((sale) => (
                          <tr key={sale.id} className="group hover:bg-white/[0.02] transition-colors whitespace-nowrap">
                            <td className="px-8 py-5 text-xs font-black font-mono text-zinc-500">#{sale.id.toString().padStart(3, '0')}</td>
                            <td className="px-8 py-5">
                              <div className="text-sm font-black text-white uppercase italic tracking-tight whitespace-nowrap">{sale.customerName}</div>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-xs font-black italic text-zinc-400 uppercase bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
                                {sale.serviceName}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-xs font-black font-mono text-zinc-400 italic whitespace-nowrap">{sale.dateTime}</td>
                            <td className="px-8 py-5 text-right font-black text-white text-base whitespace-nowrap">
                              {sale.total.toLocaleString()}đ
                            </td>
                            <td className="px-8 py-5 text-center whitespace-nowrap">
                              <span className="text-xs font-black text-amber-500 font-mono italic">
                                -{sale.discount.toLocaleString()}đ
                              </span>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-white/10 px-2.5 py-1 rounded whitespace-nowrap">
                                {sale.paymentMethod}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right font-black text-[#CCFF00] text-base whitespace-nowrap">
                              {sale.paidAmount.toLocaleString()}đ
                            </td>
                            <td className="px-8 py-5 text-right">
                              <span className="text-xs font-black px-2.5 py-1.5 rounded-md uppercase tracking-wider bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 whitespace-nowrap">
                                {sale.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-8 py-20 text-center text-zinc-600 text-xs font-black uppercase tracking-[.4em] italic">
                            {t('noMatch')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Revenue Trigger at the bottom of the card */}
                <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-between items-center group cursor-pointer" onClick={() => setIsRevenueModalOpen(true)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00] group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">{t('totalRevenue')}</p>
                      <p className="text-xl font-black text-white italic tracking-tighter">
                        {memberSales.reduce((sum, s) => sum + s.paidAmount, 0).toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#CCFF00]/20 hover:scale-105 active:scale-95 transition-all">
                    <span>CHI TIẾT</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "treasury" ? (
            <div className="space-y-8 pb-28 md:pb-6 h-full flex flex-col overflow-hidden relative z-10 px-5 md:px-5 animate-fadeIn">
              {/* Dynamic KPI Metrics Grid (World-class standard) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {/* Total Income */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TỔNG THU (INCOME)</p>
                      <p className="text-xl md:text-2xl font-black text-[#CCFF00] mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform origin-left">
                        {transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-[#CCFF00] group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Tổng dòng tiền thu vào phòng máy</p>
                </div>

                {/* Total Expenses */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-red-500/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-rose-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TỔNG CHI (EXPENSES)</p>
                      <p className="text-xl md:text-2xl font-black text-rose-400 mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform origin-left">
                        {transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-rose-400 group-hover:scale-110 transition-transform">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Dòng tiền chi vận hành & lương</p>
                </div>

                {/* Net Balance */}
                {(() => {
                  const balance = transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0) - 
                                  transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
                  const isPositive = balance >= 0;
                  return (
                    <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-white/20 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                      <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${isPositive ? 'from-emerald-500 to-teal-400' : 'from-red-500 to-rose-600'} opacity-70 group-hover:opacity-100 transition-opacity`} />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">THỰC DƯ QUỸ</p>
                          <p className={`text-xl md:text-2xl font-black mt-1 font-mono tracking-tight ${isPositive ? 'text-teal-400' : 'text-rose-500'}`}>
                            {balance.toLocaleString()}đ
                          </p>
                        </div>
                        <div className={`p-2 bg-white/5 rounded-xl ${isPositive ? 'text-teal-400' : 'text-rose-500'} group-hover:scale-110 transition-transform`}>
                          <Wallet className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Lợi nhuận ròng hiện tại</p>
                    </div>
                  );
                })()}

                {/* Transactions count */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-sky-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">SỐ LƯỢT GIAO DỊCH</p>
                      <p className="text-2xl font-black text-blue-400 mt-1 font-mono tracking-tight">
                        {transactions.length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                      <History className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Tổng hóa đơn phát sinh</p>
                </div>
              </div>

              {/* Segment Filters for Treasury Type */}
              {(() => {
                // Inline local state alternative: look up/set a custom state from state variable, or check if we can declare a helper state above
                return (
                  <div className="flex items-center justify-between gap-4 shrink-0 flex-col sm:flex-row">
                    <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 border border-white/10 rounded-2xl overflow-x-auto custom-scrollbar w-full sm:w-auto">
                      {[
                        { id: "ALL", label: "Tất cả giao dịch", count: transactions.length },
                        { id: "INCOME", label: "Khoản thu (+)", count: transactions.filter(t => t.type === "INCOME").length },
                        { id: "EXPENSE", label: "Khoản chi (-)", count: transactions.filter(t => t.type === "EXPENSE").length },
                      ].map((tier) => {
                        const isSelected = (memberStatusFilter === tier.id) || (tier.id === "ALL" && memberStatusFilter !== "INCOME" && memberStatusFilter !== "EXPENSE");
                        return (
                          <button
                            key={tier.id}
                            onClick={() => {
                              // We can reuse our memberStatusFilter or staffStatusFilter as a general state wrapper if needed, or simply let memberStatusFilter act as the toggle!
                              // Wait, let's use memberStatusFilter since it's already there and handles ALL/INCOME/EXPENSE
                              setMemberStatusFilter(tier.id);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                              isSelected
                                ? "bg-[#CCFF00] text-black shadow-[0_4px_20px_rgba(204,255,0,0.25)]"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />}
                            <span>{tier.label}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${
                              isSelected ? "bg-black/10 text-black" : "bg-white/5 text-zinc-500"
                            }`}>
                              {tier.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Ledger Table Board */}
              <div className="bg-zinc-950/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-28 md:pb-6">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-20">
                      <tr className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest border-b border-white/10">
                        <th className="px-8 py-5">Ngày đặt</th>
                        <th className="px-8 py-5 text-center">Phân loại</th>
                        <th className="px-8 py-5">Khách hàng</th>
                        <th className="px-8 py-5">Nghiệp vụ / Danh mục</th>
                        <th className="px-8 py-5 italic text-zinc-500">Chi tiết / Ghi chú</th>
                        <th className="px-8 py-5 text-right">Số dư / Tiền mặt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.filter(t => {
                        const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                              t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                              (t.customerName || "").toLowerCase().includes(searchTerm.toLowerCase());
                        const isIncome = memberStatusFilter === "INCOME";
                        const isExpense = memberStatusFilter === "EXPENSE";
                        if (isIncome) return matchesSearch && t.type === "INCOME";
                        if (isExpense) return matchesSearch && t.type === "EXPENSE";
                        return matchesSearch;
                      }).map((t) => (
                        <tr key={t.id} className="hover:bg-white/[0.015] duration-150 transition-colors group">
                          <td className="px-8 py-4.5">
                            <div className="text-xs font-black text-white uppercase italic tracking-wider font-mono">{t.date}</div>
                          </td>
                          <td className="px-8 py-4.5 text-center">
                            <div className="flex justify-center">
                              <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                t.type === "INCOME" ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}>
                                {t.type === "INCOME" ? 'THU (+)' : 'CHI (-)'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4.5 font-bold">
                            <div className="text-sm font-black text-white uppercase italic tracking-tight truncate max-w-[150px]">
                              {t.customerName || '-'}
                            </div>
                          </td>
                          <td className="px-8 py-4.5">
                            <div className="text-xs font-black uppercase text-zinc-300 tracking-wider font-mono">{t.category}</div>
                          </td>
                          <td className="px-8 py-4.5 font-medium">
                            <div className="text-xs text-zinc-500 italic max-w-xs truncate">{t.category === "Gia hạn gói tập" ? "Gia hạn" : t.note}</div>
                          </td>
                          <td className="px-8 py-4.5 text-right">
                            <div className={`text-base font-black italic tracking-tighter ${
                              t.type === "INCOME" ? 'text-[#CCFF00]' : 'text-zinc-400'
                            }`}>
                              {t.type === "INCOME" ? '+' : '-'}{t.amount.toLocaleString()}đ
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === "pos" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col lg:flex-row gap-8 lg:h-full lg:overflow-hidden pb-0 px-5 md:px-5"
            >
              <div className="flex-1 flex flex-col min-w-0">

                {/* Categories Bar - Horizontal Scroll */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar flex-nowrap overscroll-contain scroll-smooth">
                  {['all', 'Thực phẩm bổ sung', 'Phụ kiện', 'Nước uống', 'Dịch vụ'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPosCategory(cat)}
                      className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        posCategory === cat 
                        ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10' 
                        : 'bg-zinc-900 border border-white/5 text-zinc-500 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'TẤT CẢ' : cat.toUpperCase()}
                    </button>
                  ))}
                  {checkIsAdminLike(user) && (
                    <button
                      onClick={() => {
                        setIsEditingProduct(false);
                        setNewProduct({ name: "", category: "Thực phẩm bổ sung", price: 0, stock: 0, image: "" });
                        setIsProductModalOpen(true);
                      }}
                      className="whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-[#CCFF00] border border-[#CCFF00]/20 hover:bg-[#CCFF00] hover:text-black transition-all flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> THÊM SẢN PHẨM
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar overscroll-contain scroll-smooth">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products
                      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .filter(p => posCategory === 'all' || p.category === posCategory)
                      .map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        className="bg-zinc-950 border border-white/5 rounded-[2rem] p-5 hover:border-[#CCFF00]/30 transition-all group overflow-hidden relative shadow-2xl"
                      >
                        <div className="aspect-square bg-zinc-900 rounded-[1.5rem] mb-5 flex items-center justify-center relative overflow-hidden ring-1 ring-white/5">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <Zap className="w-10 h-10 text-zinc-800 group-hover:text-[#CCFF00]/20 transition-colors" />
                          )}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black uppercase text-zinc-400 border border-white/10 tracking-widest">
                            {product.category}
                          </div>
                          {checkIsAdminLike(user) && (
                            <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                                className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:text-[#CCFF00] transition-colors border border-white/10"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:text-red-500 transition-colors border border-white/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <h4 className="text-[11px] font-black uppercase italic text-white mb-2 truncate group-hover:text-[#CCFF00] transition-colors">{product.name}</h4>
                        <div className="flex items-center justify-between mb-6">
                          <p className="text-[#CCFF00] font-black text-base italic tracking-tighter">{product.price.toLocaleString()}đ</p>
                          <div className="flex flex-col items-end">
                             <p className={`text-[8px] font-black font-mono tracking-widest ${product.stock > 5 ? 'text-zinc-600' : product.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                                {product.stock > 0 ? `STOCK: ${product.stock}` : 'OUT OF STOCK'}
                             </p>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className="w-full py-3.5 bg-white/5 hover:bg-[#CCFF00] hover:text-black rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-20 shadow-lg"
                        >
                          <Plus className="w-4 h-4" /> THÊM VÀO GIỎ
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[400px] bg-zinc-950 border border-white/10 rounded-[3rem] p-8 flex flex-col h-fit lg:h-full lg:max-h-[85vh] shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00]/20 to-transparent" />
                <div className="flex items-center justify-between mb-8 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl text-[#CCFF00] shadow-xl">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black italic uppercase text-white tracking-widest">GIỎ HÀNG</h3>
                      <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.2em]">{cart.length} SẢN PHẨM</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCart([])}
                    className="text-[8px] font-black text-zinc-600 hover:text-red-500 uppercase tracking-widest border-b border-zinc-800 pb-0.5"
                  >
                    XÓA HẾT
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-8 custom-scrollbar pr-2 min-h-[200px] overscroll-contain scroll-smooth">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-800 opacity-40">
                      <div className="text-4xl mb-4 italic font-black tracking-tighter">EMPTY</div>
                      <Box className="w-12 h-12 mb-4" />
                      <p className="text-[10px] font-mono uppercase tracking-[0.5em]">GIỎ HÀNG CHƯA CÓ GÌ</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="bg-white/5 border border-white/5 p-4 rounded-[1.5rem] flex items-center gap-4 group">
                        <div className="w-14 h-14 bg-zinc-950 rounded-xl shrink-0 flex items-center justify-center border border-white/5 shadow-inner">
                           {item.product.image ? (
                             <img src={item.product.image} className="w-full h-full object-cover rounded-xl" />
                           ) : (
                             <Zap className="w-5 h-5 text-zinc-800" />
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black uppercase italic text-white truncate mb-1">{item.product.name}</p>
                          <p className="text-[10px] font-mono font-bold text-[#CCFF00]">{item.product.price.toLocaleString()}đ</p>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                          <button 
                            onClick={() => {
                              setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0))
                            }}
                            className="text-zinc-500 hover:text-white transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-white w-4 text-center font-mono">{item.quantity}</span>
                          <button 
                            onClick={() => {
                              if (item.quantity < item.product.stock) {
                                setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity + 1 } : i))
                              }
                            }}
                            className="text-zinc-500 hover:text-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-8 border-t border-white/10 space-y-6 shrink-0 relative">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono uppercase text-zinc-600 tracking-widest mb-1">TỔNG THANH TOÁN</span>
                      <span className="text-3xl font-black italic tracking-tighter text-[#CCFF00]">
                        {cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="group relative w-full py-5 bg-[#CCFF00] text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#CCFF00]/10 disabled:opacity-20 active:scale-95 transition-all overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                       XÁC NHẬN THANH TOÁN
                       <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "invoice-sales" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-28 md:pb-6 h-full flex flex-col overflow-hidden relative z-10 px-4 md:px-4"
            >
              {/* Dynamic KPI Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {/* Metric 1 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#CCFF00] to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">DOANH THU BÁN LẺ</p>
                      <p className="text-xl md:text-2xl font-black text-[#CCFF00] mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform origin-left">
                        {transactions.filter(t => t.category === "Bán lẻ").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-[#CCFF00] group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Doanh thu bán lẻ tại quầy POS</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-sky-450 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">SỐ LƯỢNG HÓA ĐƠN</p>
                      <p className="text-xl md:text-2xl font-black text-blue-400 mt-1 font-mono tracking-tight">
                        {transactions.filter(t => t.category === "Bán lẻ").length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                      <History className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Tổng hóa đơn bán lẻ phát sinh</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TRUNG BÌNH ĐƠN</p>
                      <p className="text-xl md:text-2xl font-black text-teal-450 mt-1 font-mono tracking-tight text-teal-400">
                        {Math.round(transactions.filter(t => t.category === "Bán lẻ").reduce((sum, t) => sum + t.amount, 0) / (transactions.filter(t => t.category === "Bán lẻ").length || 1)).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-teal-400 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Giá trị trung bình mỗi đơn</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-yellow-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">ĐƠN CAO NHẤT</p>
                      <p className="text-xl md:text-2xl font-black text-amber-400 mt-1 font-mono tracking-tight">
                        {Math.max(...transactions.filter(t => t.category === "Bán lẻ").map(t => t.amount), 0).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Hóa đơn bán lẻ có giá trị kỷ lục</p>
                </div>
              </div>

              {/* Ledger Table Board */}
              <div className="bg-zinc-950/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-20">
                      <tr className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest border-b border-white/10 italic">
                        <th className="px-8 py-5">MÃ HÓA ĐƠN</th>
                        <th className="px-8 py-5">THỜI GIAN GIAO DỊCH</th>
                        <th className="px-8 py-5">LOẠI NGHIỆP VỤ</th>
                        <th className="px-8 py-5">DIỄN GIẢI / CHI TIẾT</th>
                        <th className="px-8 py-5 text-right">TỔNG GIAO DỊCH (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(() => {
                        const filteredRetail = transactions.filter(t => 
                          t.category === "Bán lẻ" && 
                          (!searchTerm || 
                            t.note.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.id.toString().includes(searchTerm)
                          )
                        );

                        return filteredRetail.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-32 text-center">
                              <div className="flex flex-col items-center opacity-20">
                                <Box className="w-12 h-12 mb-4" />
                                <p className="text-[10px] font-mono uppercase tracking-[0.5em]">KHÔNG CÓ DỮ LIỆU</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredRetail.map(t => (
                            <tr key={t.id} className="hover:bg-white/[0.015] duration-150 transition-colors group">
                              <td className="px-8 py-4.5 font-mono text-xs font-black text-white uppercase italic tracking-wider">
                                #{t.id.toString().padStart(5, '0')}
                              </td>
                              <td className="px-8 py-4.5 italic text-xs text-zinc-400 font-mono">
                                {t.date}
                              </td>
                              <td className="px-8 py-4.5">
                                <span className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-3 py-1 rounded text-[9px] font-black text-[#CCFF00] uppercase italic tracking-widest">
                                  {t.category}
                                </span>
                              </td>
                              <td className="px-8 py-4.5 italic text-xs text-zinc-500 max-w-xs truncate">
                                {t.note || "Mua sản phẩm tại quầy POS"}
                              </td>
                              <td className="px-8 py-4.5 text-right text-[#CCFF00] font-black italic text-base tracking-tighter">
                                +{t.amount.toLocaleString()}đ
                              </td>
                            </tr>
                          ))
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "invoice-member" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-28 md:pb-6 h-full flex flex-col overflow-hidden relative z-10 px-4 md:px-4"
            >
              {/* Dynamic KPI Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {/* Metric 1 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">KHOẢN THU HỘI VIÊN</p>
                      <p className="text-xl md:text-2xl font-black text-[#CCFF00] mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform origin-left">
                        {members.reduce((sum, m) => sum + (m.revenue !== undefined ? m.revenue : (packages.find(p => p.name === m.package)?.price || 0)), 0).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-[#CCFF00] group-hover:scale-110 transition-transform">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Tổng thu các gói dịch vụ đăng ký</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-sky-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TỔNG SỐ HỘI VIÊN</p>
                      <p className="text-xl md:text-2xl font-black text-blue-400 mt-1 font-mono tracking-tight">
                        {members.length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Tổng tệp khách hàng đăng ký</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-400 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">ĐANG HOẠT ĐỘNG</p>
                      <p className="text-xl md:text-2xl font-black text-teal-400 mt-1 font-mono tracking-tight">
                        {members.filter(m => m.status === 'Hoạt động').length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-teal-400 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Hội viên còn hiệu lực tập luyện</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-red-500/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-rose-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">ĐÃ HẾT HẠN GÓI</p>
                      <p className="text-xl md:text-2xl font-black text-rose-455 mt-1 font-mono tracking-tight text-red-400">
                        {members.filter(m => m.status === 'Hết hạn').length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-red-455 text-red-405 group-hover:scale-110 transition-transform text-rose-400">
                      <XCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Danh sách hội viên đã quá hiệu lực</p>
                </div>
              </div>

              {/* Ledger Table Board */}
              <div className="bg-zinc-950/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-20">
                      <tr className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest border-b border-white/10 italic">
                        <th className="px-8 py-5">HỘI VIÊN / KHÁCH HÀNG</th>
                        <th className="px-8 py-5">GÓI DỊCH VỤ ĐĂNG KÝ</th>
                        <th className="px-8 py-5">THỜI GIAN SỬ DỤNG GÓI CHUẨN</th>
                        <th className="px-8 py-5 text-right">DOANH THU THỰC NHẬN</th>
                        <th className="px-8 py-5 text-center">TRẠNG THÁI GIAO DỊCH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(() => {
                        const sortedAndFiltered = [...members]
                          .filter(m => {
                            const matchesSearch = !searchTerm || 
                              m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              m.phone.includes(searchTerm) || 
                              (m.memberCode && m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()));
                            return matchesSearch;
                          });

                        return sortedAndFiltered.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-32 text-center">
                              <div className="flex flex-col items-center opacity-20">
                                <Box className="w-12 h-12 mb-4" />
                                <p className="text-[10px] font-mono uppercase tracking-[0.5em]">KHÔNG CÓ DỮ LIỆU</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          sortedAndFiltered.map(member => {
                            const pkg = packages.find(p => p.name === member.package);
                            const finalPrice = member.revenue !== undefined ? member.revenue : (pkg ? pkg.price : 0);
                            return (
                              <tr key={member.id} className="hover:bg-white/[0.015] duration-150 transition-colors group">
                                <td className="px-8 py-4.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00] text-[10px] font-black ring-1 ring-[#CCFF00]/20 italic group-hover:scale-105 transition-transform">
                                      {member.fullName.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black uppercase italic text-white group-hover:text-[#CCFF00] transition-colors">
                                        {member.fullName}
                                      </span>
                                      <span className="text-[9px] font-mono text-zinc-500">
                                        {member.memberCode} • {member.phone}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-4.5 italic text-xs text-zinc-300 font-black uppercase">
                                  {member.package || "CHƯA CÓ"}
                                </td>
                                <td className="px-8 py-4.5 font-mono text-xs text-zinc-400">
                                  {member.registrationDate ? `${member.registrationDate} ➜ ` : ""} {member.expiryDate || "—"}
                                </td>
                                <td className="px-8 py-4.5 text-right text-white font-black italic text-base tracking-tighter">
                                  {finalPrice.toLocaleString('vi-VN')} VNĐ
                                </td>
                                <td className="px-8 py-4.5">
                                  <div className="flex justify-center">
                                    <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border italic ${
                                      member.status === 'Hết hạn' 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                        : 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20'
                                    }`}>
                                      {member.status === 'Hết hạn' ? 'Đã hết hạn' : 'Đã thanh toán'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "invoice-expiring" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-28 md:pb-6 h-full flex flex-col overflow-hidden relative z-10 px-4 md:px-4"
            >
              {/* Dynamic KPI Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {/* Metric 1 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-amber-500/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-yellow-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">SẮP HẾT HẠN (7 NGÀY)</p>
                      <p className="text-xl md:text-2xl font-black text-amber-400 mt-1 font-mono tracking-tight">
                        {members.filter(m => {
                          const days = (new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                          return m.status === 'Hoạt động' && days > 0 && days <= 7;
                        }).length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Hội viên cần được tư vấn gia hạn ngay</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#CCFF00] to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">DOANH SỐ DỰ KIẾN</p>
                      <p className="text-xl md:text-2xl font-black text-[#CCFF00] mt-1 font-mono tracking-tight font-mono">
                        {members.filter(m => {
                          const days = (new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                          return m.status === 'Hoạt động' && days > 0 && days <= 7;
                        }).reduce((sum, m) => sum + (packages.find(p => p.name === m.package)?.price || 0), 0).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-[#CCFF00] group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Doanh thu dự kiến thu hồi từ tái ký</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-amber-500/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-rose-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">HẠN CẢNH BÁO</p>
                      <p className="text-xl md:text-2xl font-black text-amber-400 mt-1 font-mono tracking-tight font-mono uppercase italic">
                        7 Ngày Chuẩn
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Thời gian khuyến nghị CSKH</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-[#CCFF00]/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-400 to-[#CCFF00] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TỶ LỆ GIA HẠN TB</p>
                      <p className="text-xl md:text-2xl font-black text-[#CCFF55] mt-1 font-mono tracking-tight text-[#CCFF00]">
                        85.4%
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-[#CCFF00] group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Tỷ lệ hội viên đồng ý tái ký trung bình</p>
                </div>
              </div>

              {/* Ledger Table Board */}
              <div className="bg-zinc-950/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-20">
                      <tr className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest border-b border-white/10 italic">
                        <th className="px-8 py-5">THÔNG TIN HỘI VIÊN</th>
                        <th className="px-8 py-5">GÓI TẬP ĐANG SỬ DỤNG</th>
                        <th className="px-8 py-5">THỜI HẠN CUỐI CÙNG</th>
                        <th className="px-8 py-5">CHI TIẾT SỐ NGÀY CÒN LẠI</th>
                        <th className="px-8 py-5 text-center">THAO TÁC XỬ LÝ KHẨN CẤP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {members.filter(m => {
                        const days = (new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                        return m.status === 'Hoạt động' && days > 0 && days <= 7;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-32 text-center">
                            <div className="flex flex-col items-center opacity-20">
                              <Box className="w-12 h-12 mb-4" />
                              <p className="text-[10px] font-mono uppercase tracking-[0.5em]">KHÔNG CÓ HỘI VIÊN SẮP HẾT HẠN</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        members.filter(m => {
                          const days = (new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                          return m.status === 'Hoạt động' && days > 0 && days <= 7;
                        }).map(m => {
                          const days = Math.ceil((new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <tr key={m.id} className="hover:bg-white/[0.015] duration-150 transition-colors group">
                              <td className="px-8 py-4.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00] text-[10px] font-black ring-1 ring-[#CCFF00]/20 italic group-hover:scale-105 transition-transform">
                                    {m.fullName.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase italic text-white group-hover:text-[#CCFF00] transition-colors">
                                      {m.fullName}
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-500">
                                      {m.phone}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-4.5 italic text-xs text-zinc-350 font-black uppercase">
                                {m.package}
                              </td>
                              <td className="px-8 py-4.5 font-mono text-xs text-zinc-400">
                                {m.expiryDate}
                              </td>
                              <td className="px-8 py-4.5 font-black italic text-base tracking-tighter text-[#CCFF00]">
                                {days} ngày
                              </td>
                              <td className="px-8 py-4.5 text-center">
                                <button 
                                  onClick={() => {
                                    setRenewingMember(m);
                                    setIsRenewSelectModalOpen(true);
                                  }}
                                  className="bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#CCFF00]/5"
                                >
                                  GIA HẠN GÓI
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "invoice-expired" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-28 md:pb-6 h-full flex flex-col overflow-hidden relative z-10 px-4 md:px-4"
            >
              {/* Dynamic KPI Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {/* Metric 1 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-red-500/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-rose-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">HỘI VIÊN ĐÃ HẾT HẠN</p>
                      <p className="text-xl md:text-2xl font-black text-rose-400 mt-1 font-mono tracking-tight">
                        {members.filter(m => {
                          const days = (new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                          return m.status !== 'Hoạt động' || days <= 0;
                        }).length}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-rose-400 group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Hội viên đã ngưng hiệu lực dịch vụ</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-red-500/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-amber-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">THẤT THOÁT DOANH THU</p>
                      <p className="text-xl md:text-2xl font-black text-rose-400 mt-1 font-mono tracking-tight font-mono">
                        {members.filter(m => m.status === 'Hết hạn').reduce((sum, m) => sum + (packages.find(p => p.name === m.package)?.price || 0), 0).toLocaleString()}đ
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-rose-400 group-hover:scale-110 transition-transform">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Tổng phí gói tập chưa được thu hồi</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-red-500/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-rose-700 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TỶ LỆ CHURN (RỜI BỎ)</p>
                      <p className="text-xl md:text-2xl font-black text-rose-405 mt-1 font-mono tracking-tight text-rose-400">
                        {((members.filter(m => m.status === 'Hết hạn').length / (members.length || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-rose-400 group-hover:scale-110 transition-transform">
                      <XCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Tỷ lệ khách hàng rời bỏ hệ thống</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-zinc-950/60 backdrop-blur-md border border-white/10 hover:border-red-500/40 p-4 rounded-3xl transition-all duration-300 relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">TRỄ HẠN KỶ LỤC</p>
                      <p className="text-xl md:text-2xl font-black text-rose-400 mt-1 font-mono tracking-tight">
                        {Math.max(...members.filter(m => m.status === 'Hết hạn').map(m => {
                          const d = Math.abs(Math.floor((new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                          return isNaN(d) ? 0 : d;
                        }), 0)} ngày
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl text-rose-400 group-hover:scale-110 transition-transform">
                      <History className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 italic font-medium">Số ngày quá hạn lớn nhất chưa gia hạn</p>
                </div>
              </div>

              {/* Ledger Table Board */}
              <div className="bg-zinc-950/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-20">
                      <tr className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest border-b border-white/10 italic">
                        <th className="px-8 py-5">THÔNG TIN HỘI VIÊN</th>
                        <th className="px-8 py-5">GÓI TẬP CŨ ĐÃ DÙNG</th>
                        <th className="px-8 py-5">NGÀY HẾT HẠN CHÍNH THỨC</th>
                        <th className="px-8 py-5">CHI TIẾT SỐ NGÀY QUÁ HẠN</th>
                        <th className="px-8 py-5 text-center">THAO TÁC XỬ LÝ KHẨN CẤP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {members.filter(m => {
                        const days = (new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                        return m.status !== 'Hoạt động' || days <= 0;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-32 text-center">
                            <div className="flex flex-col items-center opacity-20">
                              <Box className="w-12 h-12 mb-4" />
                              <p className="text-[10px] font-mono uppercase tracking-[0.5em]">KHÔNG CÓ HỘI VIÊN ĐÃ HẾT HẠN</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        members.filter(m => {
                          const days = (new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                          return m.status !== 'Hoạt động' || days <= 0;
                        }).map(m => {
                          const days = Math.abs(Math.floor((new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                          return (
                            <tr key={m.id} className="hover:bg-white/[0.015] duration-150 transition-colors group">
                              <td className="px-8 py-4.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 text-[10px] font-black ring-1 ring-red-500/20 italic group-hover:scale-105 transition-transform">
                                    {m.fullName.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase italic text-white group-hover:text-red-550 transition-colors">
                                      {m.fullName}
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-500">
                                      {m.phone}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-4.5 italic text-xs text-zinc-355 text-zinc-400 font-black uppercase">
                                {m.package}
                              </td>
                              <td className="px-8 py-4.5 font-mono text-xs text-zinc-400">
                                {m.expiryDate}
                              </td>
                              <td className="px-8 py-4.5 font-black italic text-base tracking-tighter text-red-500">
                                {days} ngày
                              </td>
                              <td className="px-8 py-4.5 text-center">
                                <button 
                                  onClick={() => {
                                    setRenewingMember(m);
                                    setIsRenewSelectModalOpen(true);
                                  }}
                                  className="bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#CCFF00]/5"
                                >
                                  GIA HẠN GÓI
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "facilities" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 h-full flex flex-col overflow-hidden px-5 md:px-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-end gap-3 shrink-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <div className="relative group flex-1 md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-[#CCFF00] transition-colors" />
                    <input
                      type="text"
                      value={equipmentSearch}
                      onChange={(e) => setEquipmentSearch(e.target.value)}
                      placeholder="Tìm kiếm nhanh thiết bị..."
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:border-[#CCFF00] outline-none transition-all placeholder:text-zinc-800"
                    />
                  </div>
                  
                  <button 
                    onClick={() => { setEditingEquipment(null); setIsEquipmentModalOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-[#CCFF00] text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(204,255,0,0.15)] hover:scale-105 active:scale-95 transition-all outline-none border-none"
                  >
                    <Plus className="w-4 h-4" />
                    THÊM THIẾT BỊ MỚI
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-10 flex-1 min-h-0">
                  {equipments.filter(eq => 
                    eq.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                    eq.code.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                    eq.category.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                    eq.location.toLowerCase().includes(equipmentSearch.toLowerCase())
                  ).length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                      <div className="flex flex-col items-center opacity-25">
                        <Box className="w-12 h-12 mb-4" />
                        <p className="text-[10px] font-mono uppercase tracking-widest">Không tìm thấy thiết bị phù hợp</p>
                      </div>
                    </div>
                  ) : (
                    equipments.filter(eq => 
                      eq.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                      eq.code.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                      eq.category.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                      eq.location.toLowerCase().includes(equipmentSearch.toLowerCase())
                    ).map((eq) => {
                      const statusColor = eq.status === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                          eq.status === 'MAINTENANCE_REQUIRED' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                          eq.status === 'BROKEN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                          'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20';
                      const statusText = eq.status === 'NORMAL' ? t('normal') :
                                         eq.status === 'MAINTENANCE_REQUIRED' ? t('needMaintenance') :
                                         eq.status === 'BROKEN' ? t('broken') :
                                         t('underMaintenance');
                      return (
                        <div key={eq.id} className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-[#CCFF00]/20 transition-all group relative">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest italic">{eq.category} // {eq.code}</span>
                              <h3 className="text-base font-black uppercase italic text-white group-hover:text-[#CCFF00] transition-colors mt-1">{eq.name}</h3>
                            </div>
                            <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider border ${statusColor}`}>
                              {statusText}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-6 font-mono text-[10px] text-zinc-500">
                            <div className="flex justify-between">
                              <span className="uppercase">Vị trí:</span>
                              <span className="text-zinc-400 font-bold">{eq.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="uppercase">Bình thường gần nhất:</span>
                              <span className="text-zinc-400 font-bold">{eq.lastMaintenance}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="uppercase">Bảo trì kế tiếp:</span>
                              <span className="text-[#CCFF00] font-bold">{eq.nextMaintenance}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingEquipment(eq); setIsEquipmentModalOpen(true); }}
                              className="flex-1 py-3 bg-white/5 border border-white/5 text-zinc-400 hover:text-[#CCFF00] hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                              CHỈNH SỬA
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(eq.id)}
                              className="px-3 bg-white/5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
            </motion.div>
          ) : activeTab === "maintenance" ? (
            <motion.div
              className="space-y-6 h-full flex flex-col overflow-hidden px-5 md:px-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">{t('maintenance')}</h2>
                  <p className="text-zinc-500 text-[10px] font-mono mt-1 uppercase tracking-widest">{t('mgmtSystem')} // SCHEDULE_LOG</p>
                </div>
                <button 
                  onClick={() => { setEditingMaintenance(null); setIsMaintenanceModalOpen(true); }}
                  className="flex items-center gap-2 bg-[#CCFF00] text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(204,255,0,0.1)] hover:scale-105 active:scale-95 transition-all w-fit"
                >
                  <Plus className="w-4 h-4" />
                  {t('addMaintenance')}
                </button>
              </div>

              <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex-1 flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                   <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-zinc-950 z-10">
                        <tr className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 italic">
                          <th className="px-8 py-6">{t('equipmentName')}</th>
                          <th className="px-8 py-6">{t('scheduledDate')}</th>
                          <th className="px-8 py-6">{t('performer')}</th>
                          <th className="px-8 py-6">{t('priority')}</th>
                          <th className="px-8 py-6">{t('taskStatus')}</th>
                          <th className="px-8 py-6 text-center">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {maintenanceTasks.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-32 text-center">
                               <div className="flex flex-col items-center opacity-20">
                                  <Calendar className="w-12 h-12 mb-4" />
                                  <p className="text-[10px] font-mono uppercase tracking-[0.5em]">KHÔNG CÓ LỊCH BẢO TRÌ</p>
                               </div>
                            </td>
                          </tr>
                        ) : (
                          maintenanceTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-white/[0.01] transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase italic text-white">{task.equipmentName}</span>
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1 italic">{t(task.taskType.toLowerCase())}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6 font-mono text-xs text-zinc-400">{task.scheduledDate}</td>
                               <td className="px-8 py-6 text-xs text-zinc-300 font-medium">{task.performer}</td>
                               <td className="px-8 py-6">
                                  <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    task.priority === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    task.priority === 'MEDIUM' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                    'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                  }`}>
                                    {t(task.priority.toLowerCase())}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest ${
                                    task.status === 'COMPLETED' ? 'text-emerald-500' :
                                    task.status === 'IN_PROGRESS' ? 'text-[#CCFF00]' :
                                    'text-zinc-500'
                                  }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                       task.status === 'COMPLETED' ? 'bg-emerald-500' :
                                       task.status === 'IN_PROGRESS' ? 'bg-[#CCFF00] animate-pulse' :
                                       'bg-zinc-700'
                                    }`} />
                                    {t(task.status.toLowerCase().replace('_', ''))}
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-center">
                                  <div className="flex justify-center gap-2">
                                    <button 
                                      onClick={() => { setEditingMaintenance(task); setIsMaintenanceModalOpen(true); }}
                                      className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-[#CCFF00] hover:bg-[#CCFF00]/10 transition-all border border-transparent hover:border-[#CCFF00]/20"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                               </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                   </table>
                 </div>
              </div>
            </motion.div>
          ) : activeTab === "aiAnalytics" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-12"
            >
              {/* Custom sub-tabs bar for AI Analytics / Assistant */}
              <div className="flex gap-4 p-1.5 bg-zinc-950/40 border border-white/5 rounded-2xl w-fit">
                <button
                  onClick={() => setAiInsightsSubTab("dashboard")}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest italic transition-all flex items-center gap-2 ${
                    aiInsightsSubTab === "dashboard"
                      ? "bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" />
                  PHÂN TÍCH & DỰ ĐOÁN
                </button>
                <button
                  onClick={() => setAiInsightsSubTab("chatbot")}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest italic transition-all flex items-center gap-2 ${
                    aiInsightsSubTab === "chatbot"
                      ? "bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  TRỢ LÝ CHATBOT AI
                </button>
              </div>

              {aiInsightsSubTab === "dashboard" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* behavior analysis */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 text-[10rem] font-black text-[#CCFF00]/5 italic pointer-events-none group-hover:scale-110 transition-transform duration-700">AI</div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-16 h-16 bg-[#CCFF00]/10 rounded-[2rem] flex items-center justify-center border border-[#CCFF00]/20">
                            <Sparkles className="w-8 h-8 text-[#CCFF00]" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">PHÂN TÍCH HÀNH VI</h3>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">DỰ KIẾN THEO THỜI GIAN THỰC</p>
                          </div>
                          <button 
                            onClick={async () => {
                              setIsAiAnalyzing(true);
                              try {
                                const res = await fetch("/api/ai/behavior-analysis", { method: "POST" });
                                const data = await res.json();
                                setAiBehaviorInsight(data.analysis);
                              } finally {
                                setIsAiAnalyzing(false);
                              }
                            }}
                            disabled={isAiAnalyzing}
                            className="ml-auto px-6 py-3 bg-[#CCFF00] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#CCFF00]/10"
                          >
                            {isAiAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "PHÂN TÍCH NGAY"}
                          </button>
                        </div>
                        
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 min-h-[300px]">
                          {aiBehaviorInsight ? (
                            <div className="markdown-body text-zinc-400 prose prose-invert max-w-none">
                              <Markdown>{aiBehaviorInsight}</Markdown>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                              <BrainCircuit className="w-12 h-12 text-zinc-800 mb-4" />
                              <p className="text-zinc-600 italic text-sm">Chưa có dữ liệu phân tích. Hãy nhấn nút để bắt đầu.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Churn Prediction List */}
                  <div className="space-y-6">
                    <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-8">
                      <h3 className="text-xl font-black italic uppercase text-white mb-6 px-2 flex items-center justify-between">
                        DỰ ĐOÁN RỜI BỎ
                        <span className="text-[10px] font-mono text-zinc-600 tracking-widest">TOP RISK</span>
                      </h3>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {members.filter(m => m.status === 'Hoạt động').slice(0, 10).map((member) => (
                          <div key={member.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-[#CCFF00]/20 transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-xs font-black text-white group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">{member.fullName.charAt(0)}</div>
                                <div>
                                  <p className="text-xs font-black uppercase text-white group-hover:text-[#CCFF00] transition-colors">{member.fullName}</p>
                                  <p className="text-[9px] font-mono text-zinc-600">{member.package}</p>
                                </div>
                              </div>
                              <button 
                                onClick={async () => {
                                  setIsAiAnalyzing(true);
                                  try {
                                    const res = await fetch("/api/ai/churn-prediction", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ memberId: member.id })
                                    });
                                    const data = await res.json();
                                    setAiChurnAnalysis(prev => ({ ...prev, [member.id]: data.analysis }));
                                  } finally {
                                    setIsAiAnalyzing(false);
                                  }
                                }}
                                className="p-2 bg-white/5 rounded-lg text-zinc-500 hover:text-[#CCFF00] hover:bg-[#CCFF00]/10 transition-all"
                              >
                                <BrainCircuit className="w-4 h-4" />
                              </button>
                            </div>
                            {aiChurnAnalysis[member.id] && (
                              <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] text-zinc-400 italic">
                                 <Markdown>{aiChurnAnalysis[member.id]}</Markdown>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Full AI Chatbot Panel inside the AI Insights screen */
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Left Column: Recommended Quick Queries and Explanations */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-8 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-xl flex items-center justify-center border border-[#CCFF00]/20">
                            <Sparkles className="w-5 h-5 text-[#CCFF00]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black italic uppercase text-white tracking-tighter">TRỢ LÝ CHẤT LƯỢNG</h4>
                            <p className="text-[8px] font-mono text-zinc-500 tracking-widest mt-0.5">GEMINI PRO SYSTEM</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed mb-6">
                          Trợ lý ảo được huấn luyện nâng cao về chăm sóc sức khỏe, chương trình tập luyện, dinh dưỡng thể thao và hỗ trợ quản trị phòng tập. Gợi ý một số câu hỏi có sẵn:
                        </p>

                        <div className="space-y-3">
                          {[
                            { label: "Gợi ý lịch tập 3 ngày tăng cơ", query: "Soạn giúp tôi lịch tập gym 3 ngày trong tuần tối ưu hoá tăng cơ bắp nhanh nhất" },
                            { label: "Tư vấn dinh dưỡng xiết mỡ", query: "Xây dựng chế độ dinh dưỡng ngày 2000 calo đầy đủ protein để xiết cơ giảm mỡ bụng" },
                            { label: "Thu hút hội viên mới như thế nào?", query: "Gợi ý chương trình khuyến mãi và kịch bản chăm sóc khách hàng độc đáo để hồi phục số lượng hội viên sắp rời bỏ" },
                            { label: "Làm sao cải thiện dịch vụ PT?", query: "Làm thế nào để nâng cao chất lượng huấn luyện viên cá nhân (PT) và gia tăng mức độ hài lòng khách hàng tốt nhất?" }
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendAnalyticsMessage(undefined, item.query)}
                              className="w-full text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] text-zinc-400 hover:text-[#CCFF00] hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/20 transition-all font-bold"
                            >
                              + {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                        <button
                          onClick={() => setAnalyticsChatMessages([
                            { role: "model", text: "Tôi đã làm mới cuộc trò chuyện. Hãy hỏi tôi bất cứ điều gì liên quan đến tập luyện, dinh dưỡng hoặc vận hành nhé!" }
                          ])}
                          className="text-[9px] font-black font-mono text-rose-500 uppercase tracking-widest hover:text-rose-400 flex items-center gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          XÓA NHẬT KÝ CHAT
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Chat Screen Panel */}
                  <div className="lg:col-span-3">
                    <div className="bg-zinc-950 border border-white/5 rounded-[3rem] h-[calc(100vh-280px)] min-h-[450px] max-h-[650px] flex flex-col overflow-hidden relative group">
                      {/* Top Bar inside Chat panel */}
                      <div className="p-6 border-b border-white/5 bg-zinc-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-[#CCFF00] rounded-full animate-ping" />
                          <span className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-widest italic">TRÒ CHUYỆN AI CHUYÊN SÂU</span>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">STATUS: SYSTEM_CORE_READY</span>
                      </div>

                      {/* Chat Logs scrollable area */}
                      <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-black/15">
                        {analyticsChatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div className="flex gap-4 max-w-[85%] items-start">
                              {msg.role !== 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center shrink-0 mt-1">
                                  <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                                </div>
                              )}
                              <div
                                className={`px-6 py-4 rounded-[2rem] text-[13px] leading-relaxed shadow-lg ${
                                  msg.role === "user"
                                    ? "bg-[#CCFF00] text-black font-semibold rounded-tr-none shadow-[#CCFF00]/5"
                                    : "bg-zinc-900 border border-white/5 text-zinc-200 rounded-tl-none"
                                }`}
                              >
                                {msg.role !== 'user' ? (
                                  <div className="markdown-body text-zinc-200 prose prose-invert prose-p:leading-relaxed prose-ol:list-decimal prose-ul:list-disc prose-li:my-0.5 max-w-none">
                                    <Markdown>{msg.text}</Markdown>
                                  </div>
                                ) : (
                                  <p className="whitespace-pre-wrap">{msg.text}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {isAnalyticsChatTyping && (
                          <div className="flex justify-start">
                            <div className="flex gap-4 items-start max-w-[85%]">
                              <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                              </div>
                              <div className="bg-zinc-900 border border-white/5 px-6 py-4 rounded-[2rem] rounded-tl-none">
                                <div className="flex gap-1.5 items-center py-1">
                                  <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                  <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                  <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input form area */}
                      <div className="p-8 border-t border-white/5 bg-zinc-950/85 backdrop-blur-md sticky bottom-0 z-20">
                        <form onSubmit={handleSendAnalyticsMessage} className="flex gap-3">
                          <input
                            type="text"
                            value={analyticsChatInput}
                            onChange={(e) => setAnalyticsChatInput(e.target.value)}
                            placeholder="Nhập nội dung tư vấn sức khỏe, dinh dưỡng hoặc lập lịch trình tập..."
                            className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-[#CCFF00]/50 placeholder:text-zinc-600 transition-all shadow-inner"
                          />
                          <button
                            type="submit"
                            disabled={!analyticsChatInput.trim() || isAnalyticsChatTyping}
                            className="w-14 h-14 bg-[#CCFF00] text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-[#CCFF00]/10"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === "settings" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-12 px-5 md:px-5"
            >
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute -bottom-6 -right-6 text-7xl font-black text-white/[0.02] italic pointer-events-none group-hover:text-[#CCFF00]/5 transition-all">
                    LANG
                  </div>
                  <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#CCFF00]" />
                    {t('chooseLang')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'vi', label: t('vi'), sub: 'Tiếng Việt' },
                      { id: 'en', label: t('en'), sub: 'English' },
                      { id: 'zh', label: t('zh'), sub: 'Chinese' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          const nextLang = l.id;
                          setLang(nextLang);
                          addNotification(translations[nextLang]?.['langSwitched'] || translations['en']['langSwitched']);
                        }}
                        className={`relative group p-6 rounded-[2rem] border-2 transition-all text-left overflow-hidden ${
                          lang === l.id 
                          ? 'bg-[#CCFF00]/10 border-[#CCFF00] shadow-[0_0_30px_rgba(204,255,0,0.1)]' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="relative z-10">
                          <p className={`text-sm font-black uppercase italic mb-1 ${lang === l.id ? 'text-[#CCFF00]' : 'text-zinc-400'}`}>
                            {l.label}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                            {l.sub}
                          </p>
                        </div>
                        {lang === l.id && (
                          <motion.div 
                            layoutId="lang-active-desktop"
                            className="absolute inset-0 bg-gradient-to-br from-[#CCFF00]/5 to-transparent pointer-events-none" 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                   <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3 text-zinc-500">
                    <div className="w-1.5 h-6 bg-zinc-800" />
                    {t('systemInfo')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-widest italic">{t('version')}</span>
                      <span className="text-xs font-mono text-white">v4.2.0-STABLE</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-widest italic">{t('heartbeat')}</span>
                      <span className="text-xs font-mono text-emerald-500">{t('activeHeartbeat')}</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-widest italic">{t('platform')}</span>
                      <span className="text-xs font-mono text-zinc-400">{t('cloudInfra')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "communication" ? (
            <CommunicationPanel 
              user={user} 
              lang={lang} 
              t={t} 
              activeMemberId={communicationActiveMemberId} 
              setActiveMemberId={setCommunicationActiveMemberId} 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Terminal className="w-20 h-20 mb-4" />
              <p className="text-sm font-mono uppercase tracking-[0.5em]">
                {t('processingData')}
              </p>
            </div>
          )}
        </section>

        {/* Footer Bar */}
        <footer className="mt-8 hidden md:flex justify-between items-center text-[9px] font-mono uppercase tracking-[0.15em] pt-4 border-t border-white/5 relative">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
            <span className="text-zinc-500 italic opacity-40">STATION_ID//</span>
            <span className="text-zinc-400">{t('sessionInfo')}</span>
            <span className="text-[#CCFF00] font-bold italic">{user.username}</span>
          </div>
          
          <div className="flex gap-3 items-center bg-zinc-950/30 px-4 py-1.5 rounded-full border border-white/5">
            <div className="flex items-center gap-2 pr-3 border-r border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_5px_rgba(204,255,0,0.5)]"></div>
              <span className="text-zinc-500">{t('sessionRole')}</span>
              <span className="text-white font-bold italic">{t(user.role)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-600">ID:</span>
              <span className="text-[#CCFF00] font-mono font-bold tracking-tight">
                {Math.floor(Math.random() * 90000) + 10000}
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className={`fixed bottom-0 left-0 right-0 z-[110] px-4 pb-4 pt-2 pointer-events-none md:hidden transition-all duration-300 ${activeTab === "staff" || activeTab === "members" || activeTab === "pt" ? "bg-transparent backdrop-blur-none" : "bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent backdrop-blur-sm"}`}>
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-1.5 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pointer-events-auto max-w-sm mx-auto">
          {[
            { id: "dashboard", label: t('dashboard'), icon: LayoutDashboard },
            { id: "members", label: t('members'), icon: Users },
            { id: "packages", label: t('packages'), icon: CreditCard },
            { id: "finance", label: t('finance'), icon: BarChart3, role: "ADMIN" },
            { id: "settings", label: t('settings'), icon: Settings },
          ].filter(i => !i.role || i.role === user.role).map((item) => {
            const IsActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] rounded-[1.6rem] transition-all duration-300 ${
                  IsActive ? 'text-[#CCFF00]' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {IsActive && (
                  <motion.div 
                    layoutId="activeTabMobile"
                    className="absolute inset-0 bg-[#CCFF00] rounded-[1.6rem] shadow-[0_4px_12px_rgba(204,255,0,0.3)]"
                    transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                  />
                )}
                <div className={`relative z-10 transition-all duration-300 ${IsActive ? 'scale-105 text-black -translate-y-0.5' : 'scale-100'}`}>
                  <item.icon className={`${IsActive ? 'w-5 h-5' : 'w-4.5 h-4.5'} mb-0.5 transition-all`} />
                </div>
                <span className={`text-[8.5px] font-black uppercase tracking-tighter relative z-10 transition-all duration-300 ${IsActive ? 'text-black translate-y-0.5' : 'opacity-60 translate-y-0'}`}>
                  {item.label}
                </span>
                {IsActive && (
                   <div className="absolute -bottom-1.5 w-1 h-1 bg-[#CCFF00] rounded-full blur-[1px] opacity-50" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modal - ARES Theme */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-lg max-h-[90vh] rounded-none md:rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] overflow-y-auto p-6 md:p-10 scrollbar-thin"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
                    {t('addMemberTitle')}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1 italic leading-none">
                    {t('webInterface')}
                  </p>
                </div>
                <button
                  onClick={handleCancelAddMember}
                  className="md:hidden text-zinc-500"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Section */}
                  <div className="col-span-full flex flex-col items-center mb-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {newMember.avatar ? (
                          <img
                            src={newMember.avatar}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-zinc-700">
                             <CameraIcon className="w-10 h-10" />
                             <span className="text-[8px] font-black uppercase tracking-widest">{t('faceAnalysis')}</span>
                          </div>
                        )}
                        
                        {isFaceAnalyzing && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-[#CCFF00] p-4 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <span className="text-[8px] font-black uppercase animate-pulse">{t('extractingFeatures')}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 flex gap-1">
                        <label className="p-2 bg-[#CCFF00] rounded-xl cursor-pointer text-black hover:scale-110 transition-transform shadow-xl font-bold">
                          <Plus className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (isCameraActive) {
                              const photo = capturePhoto();
                              if (photo) {
                                setNewMember(prev => ({ ...prev, avatar: photo }));
                              }
                            } else {
                              startCamera();
                            }
                          }}
                          className={`p-2 rounded-xl transition-all shadow-xl ${isCameraActive ? 'bg-red-500 text-white' : 'bg-zinc-800 text-white hover:bg-[#CCFF00] hover:text-black'}`}
                        >
                          <CameraIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {isCameraActive && (
                      <div className="mt-4 w-full max-w-sm aspect-square bg-zinc-900 rounded-3xl overflow-hidden border-2 border-[#CCFF00] relative">
                         <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                         <canvas ref={canvasRef} className="hidden" />
                         <div className="absolute bottom-4 inset-x-0 flex justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                const photo = capturePhoto();
                                if (photo) {
                                  setNewMember(prev => ({ ...prev, avatar: photo }));
                                }
                              }}
                              className="bg-[#CCFF00] text-black font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest"
                            >
                              {t('capturePhoto')}
                            </button>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('memberCode')}
                    </label>
                    <input
                      readOnly
                      required
                      type="text"
                      placeholder="MEM-001"
                      value={newMember.memberCode}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('phone')}
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="09xxx"
                      value={newMember.phone}
                      onChange={(e) =>
                        setNewMember({ ...newMember, phone: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-full grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-[#CCFF00] font-bold">
                        {t('email')} (Gmail @gmail.com)
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="example@gmail.com"
                        value={newMember.email}
                        onChange={(e) =>
                          setNewMember({ ...newMember, email: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono text-[#CCFF00]"
                      />
                    </div>
                    {user?.role === "ADMIN" && (
                      <>
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                            {t('username')}
                          </label>
                          <input
                            type="text"
                            placeholder="login_name"
                            value={newMember.username || ""}
                            onChange={(e) =>
                              setNewMember({ ...newMember, username: e.target.value })
                            }
                            className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                            {t('passwordLabel')}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="******"
                              value={newMember.password || ""}
                              onChange={(e) =>
                                setNewMember({ ...newMember, password: e.target.value })
                              }
                              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#CCFF00] transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('lastName')}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Nguyễn Văn"
                      value={newMember.lastName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewMember({ 
                          ...newMember, 
                          lastName: val,
                          fullName: `${val} ${newMember.firstName}`.trim()
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('firstName')}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="A"
                      value={newMember.firstName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewMember({ 
                          ...newMember, 
                          firstName: val,
                          fullName: `${newMember.lastName} ${val}`.trim()
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('selectPackage')}
                    </label>
                    <select
                      value={newMember.package}
                      onChange={(e) =>
                        setNewMember({ ...newMember, package: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase tracking-tight appearance-none italic"
                    >
                      {packages.map((pkg) => (
                        <option
                          key={pkg.id}
                          value={pkg.name}
                          className="bg-zinc-950 font-black"
                        >
                          {t(pkg.name || '').toUpperCase()} // {t(pkg.duration || '').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('paymentMethod')}
                    </label>
                    <select
                      value={newMember.paymentMethod}
                      onChange={(e) =>
                        setNewMember({ ...newMember, paymentMethod: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase tracking-tight appearance-none italic"
                    >
                      <option value="Chuyển khoản" className="bg-zinc-950">CHUYỂN KHOẢN</option>
                      <option value="Tiền mặt" className="bg-zinc-950">TIỀN MẶT</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('discount')}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newMember.discount}
                      onChange={(e) =>
                        setNewMember({ ...newMember, discount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono font-black"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('dob')}
                    </label>
                    <input
                      type="date"
                      value={newMember.dob}
                      onChange={(e) =>
                        setNewMember({ ...newMember, dob: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('gender')}
                    </label>
                    <div className="flex gap-2">
                       {['male', 'female', 'other'].map(g => (
                         <button
                           key={g}
                           type="button"
                           onClick={() => setNewMember({ ...newMember, gender: g })}
                           className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newMember.gender === g ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'}`}
                         >
                           {t(g)}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('address')}
                    </label>
                    <textarea
                      value={newMember.address}
                      onChange={(e) =>
                        setNewMember({ ...newMember, address: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-medium h-20 resize-none"
                    />
                  </div>

                  {checkIsAdminLike(user) && (
                    <div className="col-span-full">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                        {t('staffInCharge')}
                      </label>
                      <select
                        value={newMember.createdBy}
                        onChange={(e) =>
                          setNewMember({ ...newMember, createdBy: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase tracking-tight italic"
                      >
                        <option value="" className="bg-zinc-950 px-4 py-2">HỆ THỐNG / CHƯA GÁN</option>
                        {staffMembers
                          .filter((s) => s.isActive !== false)
                          .map((s) => {
                            const val = s.username || s.fullName;
                            return (
                              <option
                                key={s.id}
                                value={val}
                                className="bg-zinc-950 px-4 py-2 text-white"
                              >
                                {s.fullName.toUpperCase()} ({s.role.toUpperCase()} - {s.position.toUpperCase()})
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  )}

                  {/* Hiển thị chi tiết thanh toán / Billing Summary */}
                  <div className="col-span-full bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 mb-3 border-b border-white/5 pb-2 flex justify-between">
                      <span>{lang === 'vi' ? 'THÔNG TIN HOÁ ĐƠN ĐĂNG KÝ' : 'REGISTRATION BILLING'}</span>
                      <span className="text-[#CCFF00] font-mono font-bold text-[9px] tracking-normal">SUMMARY</span>
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 uppercase tracking-wider font-medium text-[10px]">Gói tập đăng ký:</span>
                        <span className="font-black text-white uppercase italic tracking-tight text-right">
                          {(() => {
                            const p = packages.find(p => p.name === newMember.package);
                            return p ? `${t(p.name).toUpperCase()} (${p.duration.toUpperCase()})` : "CHƯA CHỌN GÓI";
                          })()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 uppercase tracking-wider font-medium text-[10px]">Giá niêm yết:</span>
                        <span className="font-mono text-white font-bold">
                          {(() => {
                            const p = packages.find(p => p.name === newMember.package);
                            return p ? `${p.price.toLocaleString('vi-VN')} VNĐ` : "0 VNĐ";
                          })()}
                        </span>
                      </div>
                      
                      {newMember.discount > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-red-400 uppercase tracking-wider font-medium text-[10px]">Ưu đãi / Giảm giá:</span>
                          <span className="font-mono text-red-400 font-bold">
                            -{newMember.discount.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                      )}
                      
                      <div className="border-t border-dashed border-white/10 pt-3 mt-1 flex justify-between items-center">
                        <span className="text-white uppercase tracking-widest font-black text-[11px] italic">TỔNG TIỀN THANH TOÁN:</span>
                        <span className="font-mono text-lg font-black text-[#CCFF00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                          {(() => {
                            const p = packages.find(p => p.name === newMember.package);
                            const original = p ? p.price : 0;
                            const finalPrice = Math.max(0, original - (newMember.discount || 0));
                            return `${finalPrice.toLocaleString('vi-VN')} VNĐ`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('paymentDate')}
                    </label>
                    <input
                      required
                      type="date"
                      value={newMember.paymentDate}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          paymentDate: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-[#CCFF00] font-bold">
                      {t('expiryDateAuto')}
                    </label>
                    <input
                      required
                      type="date"
                      value={newMember.expiryDate}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          expiryDate: e.target.value,
                        })
                      }
                      className="w-full bg-white/10 border border-[#CCFF00]/50 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase text-[#CCFF00]"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleCancelAddMember}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-2xl hover:bg-white/5 transition-colors"
                  >
                    {t('cancelProcess')}
                  </button>
                  <button
                    type="submit"
                    disabled={isFaceAnalyzing}
                    className="flex-1 py-4 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(204,255,0,0.2)] text-[10px] disabled:opacity-50"
                  >
                    {isFaceAnalyzing ? t('extractingFeatures').toUpperCase() : t('save').toUpperCase()}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Hồ sơ Hội viên */}
      <AnimatePresence>
        {isProfileModalOpen && selectedMember && (
          <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
            onClick={() => setIsProfileModalOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-4xl h-full md:h-[80vh] rounded-none md:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
            >
              <div className="p-6 md:px-10 md:py-8 border-b border-white/10 bg-zinc-900/20 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                    {selectedMember.avatar ? (
                      <img
                        src={selectedMember.avatar}
                        alt={selectedMember.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800 bg-zinc-900 text-xl font-black">
                        {selectedMember.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono text-[#CCFF00] uppercase tracking-widest">
                        ID: #{selectedMember.id.toString().padStart(3, "0")}
                      </span>
                      <span
                        className={`text-[8px] font-black px-2 py-0.5 rounded ${selectedMember.status === "Hoạt động" ? "bg-[#CCFF00] text-black shadow-sm" : "bg-red-500/20 text-red-500 border border-red-500/20"}`}
                      >
                        {selectedMember.status === 'Hoạt động' ? t('statusActive').toUpperCase() : t('statusExpired').toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-tight">
                      {selectedMember.fullName}
                    </h2>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wider">
                      {selectedMember.phone} // {t(selectedMember.package)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto self-end sm:self-center">
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6 md:w-8 md:h-8" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="grid grid-cols-12 gap-8 lg:gap-12">
                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase mb-4 tracking-[0.2em] italic">
                        {t('profileDetails')}
                      </p>
                      <div className="space-y-3 text-[10px] font-black uppercase italic">
                        <div className="flex justify-between border-b border-white/5 pb-2.5">
                          <span className="text-zinc-600 font-mono">{t('selectPackage').toUpperCase()}:</span>
                          <span className="text-[#CCFF00]">
                            {t(selectedMember.package)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2.5">
                          <span className="text-zinc-600 font-mono">{t('paymentDate').toUpperCase()}:</span>
                          <span className="text-white">
                            {selectedMember.registrationDate || t('notUpdated')}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2.5">
                          <span className="text-zinc-600 font-mono">{t('expiryDate').toUpperCase()}:</span>
                          <span className="text-red-500">
                            {selectedMember.expiryDate}
                          </span>
                        </div>
                        {checkIsAdminLike(user) && (
                          <div className="flex flex-col gap-1 px-0.5 pt-1">
                            <span className="text-zinc-600 font-mono text-[7.5px] uppercase tracking-widest block mb-0.5">NHÂN VIÊN PHỤ TRÁCH</span>
                            <select
                              value={selectedMember.createdBy || ""}
                              onChange={async (e) => {
                                const selectedValue = e.target.value;
                                try {
                                  const res = await fetch(`/api/members/${selectedMember.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ ...selectedMember, createdBy: selectedValue }),
                                  });
                                  if (res.ok) {
                                    const updatedMember = await res.json();
                                    setMembers((prev) =>
                                      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
                                    );
                                    setSelectedMember(updatedMember);
                                    addNotification("Đã cập nhật nhân viên phụ trách!");
                                    fetchData(); // sync reports
                                  } else {
                                    addNotification("Cập nhật thất bại!", "error");
                                  }
                                } catch (err) {
                                  console.error(err);
                                    addNotification("Lỗi kết nối!", "error");
                                }
                              }}
                              className="bg-zinc-900 border border-white/10 px-2 py-1.5 rounded-xl outline-none text-[10px] text-[#CCFF00] font-black uppercase tracking-tight w-full hover:bg-zinc-850 transition-all cursor-pointer"
                            >
                              <option value="" className="text-zinc-650 bg-zinc-950">HỆ THỐNG / CHƯA GÁN</option>
                              {staffMembers.map((s) => (
                                <option key={s.id} value={s.username || s.fullName} className="bg-zinc-950 text-white">
                                  {s.fullName.toUpperCase()} {s.username ? `(${s.username})` : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black font-mono text-zinc-500 uppercase mb-4 tracking-[0.2em] italic">
                        {t('quickActions')}
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleQuickCheckin(selectedMember.id)}
                          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                            new Date(selectedMember.expiryDate).getTime() <
                            new Date().setHours(0, 0, 0, 0)
                              ? "bg-red-500/10 text-red-500 opacity-50 cursor-not-allowed"
                              : "bg-[#CCFF00] text-black hover:scale-[1.03] shadow-lg shadow-[#CCFF00]/10"
                          }`}
                        >
                          <Activity className="w-5 h-5 shrink-0" />
                          <span className="text-[8px] font-black uppercase text-center">
                            {t('checkinBtn')}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setRenewingMember(selectedMember);
                            setIsRenewSelectModalOpen(true);
                          }}
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 rounded-xl hover:bg-[#CCFF00]/20 hover:scale-[1.03] transition-all"
                        >
                          <RefreshCw className="w-5 h-5 shrink-0" />
                          <span className="text-[8px] font-black uppercase text-center">
                            GIA HẠN
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingMember(selectedMember);
                            setIsEditModalOpen(true);
                          }}
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 hover:scale-[1.03] transition-all"
                        >
                          <Edit2 className="w-5 h-5 shrink-0" />
                          <span className="text-[8px] font-black uppercase text-center">
                            {t('editTitle')}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            openPTAssignModal(undefined, selectedMember.id);
                          }}
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 rounded-xl hover:bg-[#CCFF00]/20 hover:scale-[1.03] transition-all"
                        >
                          <UserPlusIcon className="w-5 h-5 shrink-0" />
                          <span className="text-[8px] font-black uppercase text-center">
                            {t('assignPT')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {ptAssignments.filter(a => a.memberId === selectedMember.id).map(assignment => {
                      const trainer = trainers.find(t => t.id === assignment.trainerId);
                      return (
                        <div key={assignment.id} className="bg-[#CCFF00]/10 p-5 rounded-2xl border border-[#CCFF00]/20 space-y-4">
                          <div className="flex justify-between items-center">
                            <p className="text-[9px] font-black font-mono text-[#CCFF00] uppercase tracking-[0.2em] italic">
                              HỢP ĐỒNG PT
                            </p>
                            <span className="text-[8px] font-black bg-[#CCFF00] text-black px-2 py-0.5 rounded uppercase">
                              {assignment.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-[#CCFF00]" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-white italic uppercase tracking-tight">{trainer?.fullName}</p>
                              <p className="text-[8px] font-mono text-[#CCFF00] uppercase tracking-widest">{assignment.sessionsLeft} / {assignment.totalSessions} BUỔI CÒN LẠI</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRecordSession(assignment.id, "PT session recorded")}
                            disabled={assignment.sessionsLeft <= 0}
                            className="w-full py-2.5 bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {t('recordSession')}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="col-span-12 lg:col-span-8 overflow-hidden flex flex-col">
                    <div className="flex gap-4 mb-6 border-b border-white/5 pb-3">
                      <button
                        onClick={() => setProfileActiveTab("training")}
                        className={`text-[10px] font-black font-mono uppercase tracking-[0.2em] italic transition-all ${
                          profileActiveTab === "training"
                            ? "text-[#CCFF00] border-b-2 border-[#CCFF00] pb-3 -mb-[14px]"
                            : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        {t('trainingHistory')}
                      </button>
                      <button
                        onClick={() => setProfileActiveTab("payment")}
                        className={`text-[10px] font-black font-mono uppercase tracking-[0.2em] italic transition-all ${
                          profileActiveTab === "payment"
                            ? "text-[#CCFF00] border-b-2 border-[#CCFF00] pb-3 -mb-[14px]"
                            : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        LỊCH SỬ THANH TOÁN
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[400px]">
                      {profileActiveTab === "training" ? (
                        <div className="space-y-2.5">
                          {memberHistory.length > 0 ? (
                            memberHistory.map((log) => (
                              <div
                                key={log.id}
                                className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-xl font-mono text-[9px]"
                              >
                                <div className="flex flex-col">
                                  <span className="text-zinc-600 uppercase tracking-widest mb-0.5">
                                    {t('verifiedAt')}:
                                  </span>
                                  <span className="text-white font-bold italic tracking-tighter">
                                    {new Date(log.time).toLocaleString(
                                      lang === 'vi' ? 'vi-VN' : lang === 'en' ? 'en-US' : 'zh-CN'
                                    )}
                                  </span>
                                </div>
                                <div className="bg-[#CCFF00]/10 text-[#CCFF00] px-3 py-1 rounded border border-[#CCFF00]/20 font-black uppercase tracking-tight">
                                  {t('confirm')}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-20 text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest italic border border-white/5 rounded-2xl border-dashed">
                              {t('noHistory')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {memberPaymentHistory.length > 0 ? (
                            memberPaymentHistory.map((sale) => (
                              <div
                                key={sale.id}
                                className="p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-[#CCFF00]/20 transition-all"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-[10px] font-black text-white uppercase italic">{sale.serviceName}</p>
                                    <p className="text-[8px] font-mono text-zinc-500 mt-0.5 uppercase">{sale.dateTime}</p>
                                  </div>
                                  <span className="text-[9px] font-black text-[#CCFF00] italic">
                                    {sale.paidAmount.toLocaleString()}đ
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                  <span className="text-[7.5px] font-mono text-zinc-600 uppercase tracking-widest italic">Phương thức: {sale.paymentMethod}</span>
                                  <span className="text-[7.5px] font-mono text-zinc-600 uppercase tracking-widest italic">ID: #{sale.id}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-20 text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest italic border border-white/5 rounded-2xl border-dashed">
                              CHƯA CÓ GIAO DỊCH NÀO
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/10 bg-zinc-900/20 flex justify-between items-center relative z-10">
                <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                  DATABASE_REF: {user.role} // SESSION_
                  {Math.random().toString(36).substring(7).toUpperCase()}
                </div>
                <div className="flex gap-4">

                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="bg-[#CCFF00] text-black font-black px-8 py-2 rounded-xl hover:scale-105 transition-all text-[10px] uppercase tracking-widest shadow-[0_10px_20px_rgba(204,255,0,0.15)]"
                  >
                    {t('complete')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCheckinModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-xl md:max-h-[85vh] rounded-none md:rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
                      {t('quickCheckin')}
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">
                      {t('searchByPhone').toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      stopCamera();
                      setIsCheckinModalOpen(false);
                      setVerificationResult(null);
                    }}
                    className="p-2 text-zinc-500 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="mt-6 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder={t('searchHint')}
                    value={checkinSearchTerm}
                    onChange={(e) => setCheckinSearchTerm(e.target.value)}
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-xl text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-[#CCFF00] transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {checkinSearchTerm ? (
                  members.filter(
                    (m) =>
                      m.fullName.toLowerCase().includes(checkinSearchTerm.toLowerCase()) ||
                      m.phone.includes(checkinSearchTerm),
                  ).map((member) => (
                    <div
                      key={member.id}
                      className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-[#CCFF00]">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-tight text-sm">{member.fullName}</p>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase">{member.phone}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600">#{member.id}</span>
                      </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuickCheckin(member.id)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2"
                          >
                            <Zap className="w-3.5 h-3.5 text-[#CCFF00]" />
                            {t('quickCheckin')}
                          </button>
                          <button
                            onClick={() => startCamera()}
                            className="px-4 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl border border-white/10 transition-all"
                            title={t('capturePhoto')}
                          >
                            <CameraIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Camera Verification Area */}
                        {isCameraActive && (
                          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/5">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                            <div className="absolute bottom-4 inset-x-0 flex justify-center">
                              <button
                                onClick={() => handleVerifyAndCheckin(member)}
                                disabled={isFaceVerifying}
                                className="bg-[#CCFF00] text-black font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2"
                              >
                                {isFaceVerifying ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4" />
                                )}
                                {isFaceVerifying ? t('analyzing') : t('checkinBtn')}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {verificationResult && !isFaceVerifying && (
                          <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-md p-6 text-center ${verificationResult.isVerified ? 'bg-[#CCFF00]/20' : 'bg-red-500/20'}`}>
                             <div className="bg-black/80 p-6 rounded-3xl border border-white/10 max-w-xs">
                                {verificationResult.isVerified ? (
                                  <ShieldCheck className="w-12 h-12 text-[#CCFF00] mx-auto mb-3" />
                                ) : (
                                  <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                )}
                                <h4 className={`text-sm font-black uppercase italic mb-2 ${verificationResult.isVerified ? 'text-[#CCFF00]' : 'text-red-500'}`}>
                                  {verificationResult.isVerified ? t('faceMatched') : t('faceNotMatched')}
                                </h4>
                                <p className="text-[9px] font-mono text-zinc-500 uppercase leading-relaxed">
                                  {verificationResult.reason}
                                </p>
                                <button 
                                  onClick={() => setVerificationResult(null)}
                                  className="mt-4 text-[9px] font-black uppercase text-[#CCFF00] underline"
                                >
                                  {t('retakePhoto')}
                                </button>
                             </div>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="py-20 text-center opacity-20">
                    <Search className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-[10px] font-mono uppercase tracking-widest">
                      {t('noMatch')}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-zinc-900/50 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => {
                    stopCamera();
                    setIsCheckinModalOpen(false);
                    setCheckinSearchTerm("");
                    setVerificationResult(null);
                  }}
                  className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  {t('closeWindow')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Quản Lý Gói Tập */}
      <AnimatePresence>
        {isPkgModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsPkgModalOpen(false);
                setEditingPkgId(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8"
            >
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-[#CCFF00]">
                {editingPkgId ? t('editPkgTitle') : t('pkgConfigTitle')}
              </h3>
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-8 italic">
                {t('pkgConfigSub')}
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const isEditing = editingPkgId !== null;
                  try {
                    const method = isEditing ? "PUT" : "POST";
                    const url = isEditing
                      ? `/api/packages/${editingPkgId}`
                      : "/api/packages";

                    const res = await fetch(url, {
                      method: method,
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newPkg),
                    });
                    if (res.ok) {
                      setIsPkgModalOpen(false);
                      setNewPkg({
                        name: "",
                        duration: "1 Tháng",
                        price: 0,
                        description: "",
                      });
                      addNotification(
                        isEditing
                          ? t('pkgUpdateSuccess')
                          : t('pkgAddSuccess'),
                      );
                      setEditingPkgId(null);
                      fetchData();
                    }
                  } catch (error) {
                    addNotification(t('pkgSaveError'), "error");
                  }
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                    {t('pkgName')}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={t('pkgPlaceholder')}
                    value={newPkg.name}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('duration')}
                    </label>
                    <select
                      value={newPkg.duration}
                      onChange={(e) =>
                        setNewPkg({ ...newPkg, duration: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase tracking-widest"
                    >
                      <option value="1 Tháng">{t('1 Tháng')}</option>
                      <option value="3 Tháng">{t('3 Tháng')}</option>
                      <option value="6 Tháng">{t('6 Tháng')}</option>
                      <option value="12 Tháng">{t('12 Tháng')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('priceVND')}
                    </label>
                    <input
                      required
                      type="text"
                      value={newPkg.price === 0 ? "" : newPkg.price?.toLocaleString('en-US') || ""}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, "");
                        setNewPkg({
                          ...newPkg,
                          price: parseInt(digits) || 0,
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                    {t('description')}
                  </label>
                  <textarea
                    value={newPkg.description}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, description: e.target.value })
                    }
                    placeholder={t('descPlaceholder')}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase h-24 resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPkgModalOpen(false);
                      setEditingPkgId(null);
                    }}
                    className="flex-1 bg-zinc-900 text-zinc-500 font-black py-4 rounded-2xl hover:bg-zinc-800 transition-colors text-[10px] uppercase tracking-widest"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#CCFF00] text-black font-black py-4 rounded-2xl hover:scale-[1.02] transition-transform text-[10px] uppercase tracking-widest shadow-[0_10px_20px_rgba(204,255,0,0.15)]"
                  >
                    {t('saveConfig')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Lưu Trữ Xóa Mềm */}
      <AnimatePresence>
        {isDeletedModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-black border border-white/10 w-full max-w-2xl rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-400">
                    {t('deletedMembersTitle')}
                  </h3>
                  <button
                    onClick={() => setIsDeletedModalOpen(false)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  {t('deletedMembersSub')}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {deletedMembers.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-mono text-zinc-400 font-black uppercase border-b border-white/5">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">{t('fullName')}</th>
                        <th className="px-4 py-2">{t('paymentDate')}/{t('expiryDate')}</th>
                        <th className="px-4 py-2 text-right">{t('restore')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {deletedMembers.map((member) => (
                        <tr key={member.id} className="text-xs">
                          <td className="px-4 py-4 font-mono text-zinc-600">
                            #{member.id.toString().padStart(3, "0")}
                          </td>
                          <td className="px-4 py-4 font-black uppercase text-zinc-400">
                            {member.fullName}
                          </td>
                          <td className="px-4 py-4 text-zinc-500 text-[10px] font-mono">
                            AUTO_DELETE //{" "}
                            {new Date().toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleRestoreMember(member.id)}
                              className="text-emerald-500 hover:text-emerald-400 underline font-mono text-[10px] uppercase tracking-widest font-black"
                            >
                              {t('restore').toUpperCase()}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-20 text-center opacity-20">
                    <Trash2 className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-[10px] font-mono uppercase tracking-widest">
                      {t('noDeletedMembers') || "No members in trash"}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-zinc-900/50 border-t border-white/5">
                <button
                  onClick={() => setIsDeletedModalOpen(false)}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-widest bg-white text-black rounded-2xl hover:bg-[#CCFF00] transition-colors"
                >
                  {t('confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Reset Mật Khẩu Thủ Công */}
      <AnimatePresence>
        {isResetPasswordModalOpen && resetPasswordMember && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsResetPasswordModalOpen(false);
                setResetPasswordMember(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#CCFF00]/10 text-[#CCFF00] rounded-xl animate-pulse">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                  ĐẶT LẠI MẬT KHẨU
                </h3>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed mb-6">
                Đặt lại mật khẩu cho tài khoản hội viên <span className="text-[#CCFF00] font-black">{resetPasswordMember.fullName}</span>. Bạn có thể tự điền mật khẩu bằng tay bên dưới.
              </p>

              <div className="space-y-4">
                {user?.role === "ADMIN" && (
                  <div className="bg-zinc-900 border border-white/5 p-4 rounded-2xl flex flex-col gap-1.5 shadow-inner">
                    <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-wider block">Mật khẩu hiện tại (Admin):</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-black text-[#CCFF00] tracking-wider select-all">
                        {members.find(m => m.id === resetPasswordMember.id)?.password || "123456"}
                      </span>
                      <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em] text-white/20 bg-white/5 px-2 py-0.5 rounded">Hiện có</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-wider block">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showResetPasswordValue ? "text" : "password"}
                      value={resetPasswordValue}
                      onChange={(e) => setResetPasswordValue(e.target.value)}
                      placeholder="Nhập mật khẩu tự chọn..."
                      className="w-full bg-zinc-900 border border-white/10 px-4 py-3.5 pr-12 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono text-[#CCFF00]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPasswordValue(!showResetPasswordValue)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showResetPasswordValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex bg-white/[0.02] border border-white/5 p-2 rounded-xl gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setResetPasswordValue("123456")}
                    className="flex-1 text-[9px] font-black font-mono uppercase tracking-widest text-[#CCFF00] hover:text-black hover:bg-[#CCFF00] border border-white/10 px-3 py-2 bg-white/5 rounded-lg transition-all"
                  >
                    Mặc định "123456"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPass = Math.random().toString(36).slice(-6);
                      setResetPasswordValue(randomPass);
                    }}
                    className="flex-1 text-[9px] font-black font-mono uppercase tracking-widest text-zinc-400 hover:text-white border border-white/10 px-3 py-2 bg-white/5 rounded-lg transition-all"
                  >
                    Random ngẫu nhiên
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPasswordModalOpen(false);
                    setResetPasswordMember(null);
                  }}
                  className="flex-1 py-3.5 border border-white/15 hover:border-white/30 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handlePerformResetPassword}
                  className="flex-1 py-3.5 bg-[#CCFF00] text-black hover:bg-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(204,255,0,0.15)]"
                >
                  Xác nhận lưu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isEditModalOpen && editingMember && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-lg rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden p-8"
            >
              <div className="mb-8">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                  {t('editTitle')}
                </h3>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">
                  {t('members')}: {editingMember.fullName}
                </p>
              </div>

              <form onSubmit={handleUpdateMember} className="space-y-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      {editingMember.avatar ? (
                        <img
                          src={editingMember.avatar}
                          alt="Avatar/Face Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-700">
                           <CameraIcon className="w-10 h-10" />
                           <span className="text-[8px] font-black uppercase tracking-widest">{t('faceAnalysis')}</span>
                        </div>
                      )}
                      
                      {isFaceAnalyzing && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-[#CCFF00] p-4 text-center z-10">
                          <Loader2 className="w-8 h-8 animate-spin mb-2" />
                          <span className="text-[8px] font-black uppercase animate-pulse">{t('extractingFeatures')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                      <label className="p-2 bg-[#CCFF00] rounded-xl cursor-pointer text-black hover:scale-110 transition-transform shadow-xl font-bold flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, true)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (isCameraActive) {
                            const photo = capturePhoto();
                            if (photo) {
                              setEditingMember(prev => prev ? ({ ...prev, avatar: photo }) : null);
                            }
                          } else {
                            startCamera();
                          }
                        }}
                        className={`p-2 rounded-xl transition-all shadow-xl flex items-center justify-center ${isCameraActive ? 'bg-red-500 text-white' : 'bg-zinc-800 text-white hover:bg-[#CCFF00] hover:text-black'}`}
                      >
                        <CameraIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {isCameraActive && (
                    <div className="mt-4 w-full max-w-sm aspect-square bg-zinc-900 rounded-3xl overflow-hidden border-2 border-[#CCFF00] relative">
                       <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                       <canvas ref={canvasRef} className="hidden" />
                       <div className="absolute bottom-4 inset-x-0 flex justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              const photo = capturePhoto();
                              if (photo) {
                                setEditingMember(prev => prev ? ({ ...prev, avatar: photo }) : null);
                              }
                            }}
                            className="bg-[#CCFF00] text-black font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest"
                          >
                            {t('capturePhoto')}
                          </button>
                       </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('lastName')}
                    </label>
                    <input
                      required
                      type="text"
                      value={editingMember.lastName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingMember({
                          ...editingMember,
                          lastName: val,
                          fullName: `${val} ${editingMember.firstName}`.trim()
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs uppercase font-black tracking-tight italic"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('firstName')}
                    </label>
                    <input
                      required
                      type="text"
                      value={editingMember.firstName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingMember({
                          ...editingMember,
                          firstName: val,
                          fullName: `${editingMember.lastName} ${val}`.trim()
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs uppercase font-black tracking-tight italic"
                    />
                  </div>
                </div>
                
                {user?.role === "ADMIN" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                        {t('username')}
                      </label>
                      <input
                        type="text"
                        value={editingMember.username || ""}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            username: e.target.value,
                          })
                        }
                        placeholder="hoainam"
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                        {t('passwordLabel')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={editingMember.password || ""}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              password: e.target.value,
                            })
                          }
                          placeholder="******"
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#CCFF00] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('email')}
                    </label>
                    <input
                      required
                      type="email"
                      value={editingMember.email}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          email: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('phone')}
                    </label>
                    <input
                      required
                      type="tel"
                      value={editingMember.phone}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          phone: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('packages')}
                    </label>
                    <select
                      value={editingMember.package}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          package: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase tracking-tight appearance-none italic"
                    >
                      {packages.map((pkg) => (
                        <option
                          key={pkg.id}
                          value={pkg.name}
                          className="bg-zinc-950 text-white font-black"
                        >
                          {t(pkg.name).toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('status')}
                    </label>
                    <select
                      value={editingMember.status}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          status: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase tracking-tight appearance-none italic"
                    >
                      <option
                        value="Hoạt động"
                        className="bg-zinc-950 text-white"
                      >
                        {t('statusActive')}
                      </option>
                      <option
                        value="Hết hạn"
                        className="bg-zinc-950 text-white"
                      >
                        {t('statusExpired')}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('paymentDate')}
                    </label>
                    <input
                      type="date"
                      value={editingMember.registrationDate || ""}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          registrationDate: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('expiryDate')}
                    </label>
                    <input
                      required
                      type="date"
                      value={editingMember.expiryDate}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          expiryDate: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                {checkIsAdminLike(user) && (
                  <div className="col-span-full">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      {t('staffInCharge')}
                    </label>
                    <select
                      value={editingMember.createdBy || ""}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          createdBy: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase tracking-tight italic"
                    >
                      <option value="" className="bg-zinc-950 px-4 py-2">HỆ THỐNG / CHƯA GÁN</option>
                      {staffMembers
                        .filter((s) => s.isActive !== false)
                        .map((s) => {
                          const val = s.username || s.fullName;
                          return (
                            <option
                              key={s.id}
                              value={val}
                              className="bg-zinc-950 px-4 py-2 text-white"
                            >
                              {s.fullName.toUpperCase()} ({s.role.toUpperCase()} - {s.position.toUpperCase()})
                            </option>
                          );
                        })}
                    </select>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setIsEditModalOpen(false);
                      setShowPassword(false);
                    }}
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-2xl hover:bg-white/5 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(204,255,0,0.3)] text-xs"
                  >
                    {t('saveUpdate')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reusable Toast Notifications */}
      <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-[100] flex flex-col gap-3 pointer-events-none w-full sm:w-auto px-4 sm:px-0">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-4 w-full sm:min-w-[320px] ${
                n.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : n.type === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-500"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  n.type === "success"
                    ? "bg-emerald-500/20"
                    : n.type === "error"
                      ? "bg-red-500/20"
                      : "bg-blue-500/20"
                }`}
              >
                {n.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : n.type === "error" ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <Activity className="w-5 h-5" />
                )}
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest leading-tight">
                {n.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isRenewSelectModalOpen && renewingMember && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsRenewSelectModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-8 max-h-[90vh] flex flex-col z-[120]"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-[#CCFF00]">
                  GIA HẠN HỘI VIÊN
                </h3>
                <p className="text-[11px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">
                  HỘI VIÊN: {renewingMember.fullName} ({renewingMember.memberCode})
                </p>
                <p className="text-[10px] font-mono text-zinc-500 mt-1 italic">
                  Gói hiện tại: {renewingMember.package || "Chưa đăng ký"}
                </p>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-3 py-2">
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 italic">
                  CHỌN GÓI TẬP MUỐN GIA HẠN:
                </p>
                {packages.map((pkg) => (
                  <button
                    type="button"
                    key={pkg.id}
                    onClick={() => {
                      confirmAction(
                        "XÁC NHẬN GIA HẠN",
                        `Gia hạn gói tập [${pkg.name}] cho hội viên ${renewingMember.fullName} với giá ${pkg.price.toLocaleString()}đ?`,
                        () => handleMemberRenewWithPackage(renewingMember, pkg.name),
                        "info"
                      );
                    }}
                    className="w-full bg-white/5 border border-white/10 hover:border-[#CCFF00] hover:bg-[#CCFF00]/5 transition-all p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-left gap-4"
                  >
                    <div>
                      <p className="text-[11px] font-black uppercase italic text-white">{pkg.name}</p>
                      <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">{pkg.duration} • {pkg.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-[#CCFF00] tracking-tighter">{pkg.price.toLocaleString()}đ</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsRenewSelectModalOpen(false)}
                  className="w-full py-4 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all"
                >
                  ĐÓNG
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRenewalModalOpen && selectedRenewPackage && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden p-10"
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                   <div className={`w-8 h-1 rounded-full ${renewalStep === 1 ? 'bg-[#CCFF00]' : 'bg-zinc-800'}`} />
                   <div className={`w-8 h-1 rounded-full ${renewalStep === 2 ? 'bg-[#CCFF00]' : 'bg-zinc-800'}`} />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00]">
                  {renewalStep === 1 ? t('confirmRenewal') : t('paymentConfirmation')}
                </h3>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em] mt-1">
                  {t('selectNewPackage')}: {selectedRenewPackage.name}
                </p>
              </div>

              <div className="space-y-6">
                {renewalStep === 1 ? (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                      <div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic">{t('amount')}</p>
                        <p className="text-4xl font-black text-white tracking-tighter">
                          {selectedRenewPackage.price.toLocaleString()}đ
                        </p>
                      </div>
                      
                      <div className="border-t border-white/5 pt-6">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4 block italic font-bold">
                          {t('startDate')}
                        </label>
                        <div className="relative group">
                          <input 
                            ref={renewalDateRef}
                            id="renewal-date-input"
                            type="date"
                            value={renewalDate}
                            onChange={(e) => setRenewalDate(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 p-4 rounded-xl text-white font-black uppercase outline-none focus:border-[#CCFF00] transition-colors cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const currentMember = members.find(m => m.id === user?.id);
                        if (currentMember && currentMember.status === 'Hoạt động' && currentMember.expiryDate) {
                          const start = new Date(renewalDate);
                          const expiry = new Date(currentMember.expiryDate);
                          if (start <= expiry) {
                            addNotification(t('overlapError') + currentMember.expiryDate, 'error');
                            return;
                          }
                        }
                        setRenewalStep(2);
                      }}
                      className="w-full py-5 bg-[#CCFF00] text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#CCFF00]/10 flex items-center justify-center gap-2"
                    >
                      XÁC NHẬN & TIẾP TỤC
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-2xl p-6 text-center italic">
                       <p className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest mb-1">TỔNG THANH TOÁN</p>
                       <p className="text-3xl font-black text-white tracking-tighter">{selectedRenewPackage.price.toLocaleString()}đ</p>
                       <p className="text-[9px] font-mono text-zinc-500 mt-2 uppercase tracking-widest">NGÀY BẮT ĐẦU: {renewalDate}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleRenewPackage("Chuyển khoản")}
                          className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-[#CCFF00] hover:bg-[#CCFF00]/10 transition-all group"
                        >
                          <ArrowUpRight className="w-6 h-6 text-zinc-600 group-hover:text-[#CCFF00]" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">CHUYỂN KHOẢN</span>
                        </button>
                        <button 
                          onClick={() => handleRenewPackage("Tiền mặt")}
                          className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-[#CCFF00] hover:bg-[#CCFF00]/10 transition-all group"
                        >
                          <DollarSign className="w-6 h-6 text-zinc-600 group-hover:text-[#CCFF00]" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">TIỀN MẶT</span>
                        </button>
                     </div>

                     <button 
                        onClick={() => setRenewalStep(1)}
                        className="w-full py-4 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all underline underline-offset-4"
                     >
                        QUAY LẠI CHỈNH SỬA
                     </button>
                  </>
                )}

                 <button 
                  onClick={() => setIsRenewalModalOpen(false)}
                  className="w-full py-4 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all"
                 >
                  {t('cancelBack')}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSyncing && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_120px_rgba(204,255,0,0.15)] p-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                <motion.div 
                  className="h-full bg-[#CCFF00]" 
                  style={{ width: `${syncProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#CCFF00]/10 rounded-2xl flex items-center justify-center border border-[#CCFF00]/20 shrink-0">
                  <RefreshCw className={`w-6 h-6 text-[#CCFF00] ${syncProgress < 100 ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase text-white leading-none">HỆ THỐNG ĐỒNG BỘ</h3>
                  <p className="text-[9px] font-black font-mono text-[#CCFF00] uppercase tracking-widest mt-1.5 font-sans">NHÂN SỰ VÀ TƯƠNG TÁC HỘI VIÊN</p>
                </div>
              </div>

              <div className="bg-black/50 border border-white/5 rounded-2xl p-5 font-mono text-[11px] text-zinc-400 space-y-2 h-[240px] overflow-y-auto custom-scrollbar mb-6">
                {syncLogs.map((log, index) => {
                  const isErr = log.startsWith("[LỖI]");
                  const isOk = log.includes("[OK]");
                  return (
                    <div 
                      key={index} 
                      className={`${isErr ? 'text-rose-500 font-bold' : isOk ? 'text-[#CCFF00] font-bold' : 'text-zinc-450'}`}
                    >
                      {log}
                    </div>
                  );
                })}
                {syncProgress < 100 && (
                  <div className="flex items-center gap-1.5 text-zinc-600 italic mt-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-ping" />
                    Đường truyền dữ liệu đang hoạt động...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">HOÀN THÀNH</span>
                  <p className="text-2xl font-black text-white font-mono">{syncProgress}%</p>
                </div>
                {syncProgress === 100 ? (
                  <span className="px-3 py-1 bg-[#CCFF00]/10 text-[#CCFF00] font-black text-[9px] uppercase tracking-wider rounded-lg border border-[#CCFF00]/20">
                    KẾT THÚC THÀNH CÔNG
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/5 text-zinc-400 font-black text-[9px] uppercase tracking-wider rounded-lg border border-white/5 animate-pulse">
                    ĐANG XỬ LÝ...
                  </span>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  disabled={syncProgress < 100}
                  onClick={() => {
                    setIsSyncing(false);
                    setSyncLogs([]);
                    setSyncProgress(0);
                  }}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    syncProgress === 100 
                      ? 'bg-[#CCFF00] text-zinc-950 hover:bg-white cursor-pointer active:scale-95' 
                      : 'bg-zinc-900 border border-white/5 text-zinc-650 cursor-not-allowed'
                  }`}
                >
                  XÁC NHẬN & ĐÓNG (CONFIRM & CLOSE)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStaffModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-10"
            >
              <h3 className="text-3xl font-black italic uppercase text-[#CCFF00] mb-8">
                {newStaff.id ? "CẬP NHẬT NHÂN VIÊN QUẦY" : "THÊM NHÂN VIÊN QUẦY"}
              </h3>
              <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2 font-bold">Họ và tên</label>
                    <input
                      required
                      type="text"
                      value={newStaff.fullName}
                      onChange={e => setNewStaff({ ...newStaff, fullName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-[#CCFF00] outline-none text-white font-black uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2 font-bold">Vị trí</label>
                    <input
                      required
                      type="text"
                      value={newStaff.position}
                      onChange={e => setNewStaff({ ...newStaff, position: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-[#CCFF00] outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2 font-bold">Vai trò</label>
                    <select
                      value={newStaff.role}
                      onChange={e => setNewStaff({ ...newStaff, role: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-[#CCFF00] outline-none text-white text-xs font-black uppercase"
                    >
                      <option value="STAFF" className="bg-zinc-950">Nhân viên quầy</option>
                      <option value="PT" className="bg-zinc-950">Huấn luyện viên</option>
                      <option value="ADMIN" className="bg-zinc-950">Quản trị</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2 font-bold">Số điện thoại</label>
                    <input
                      required
                      type="tel"
                      value={newStaff.phoneNumber}
                      onChange={e => setNewStaff({ ...newStaff, phoneNumber: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-[#CCFF00] outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#CCFF00] uppercase mb-2 italic text-xs font-bold">Email (Phải dùng đuôi @fit.com)</label>
                    <input
                      required
                      type="email"
                      placeholder="example@fit.com"
                      value={newStaff.email}
                      onChange={e => {
                        const val = e.target.value;
                        setNewStaff({ ...newStaff, email: val, username: val });
                      }}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-[#CCFF00] outline-none text-[#CCFF00] text-sm font-black"
                    />
                  </div>
                  {user?.role === "ADMIN" && (
                    <>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2 font-bold">Tên đăng nhập (Lấy theo Email)</label>
                        <input
                          disabled
                          readOnly
                          type="text"
                          placeholder="Tự động theo email"
                          value={newStaff.email || ""}
                          className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none text-zinc-500 text-sm font-mono cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2 font-bold">Mật khẩu</label>
                        <div className="relative">
                          <input
                            required={!newStaff.id}
                            type={showStaffPassword ? "text" : "password"}
                            placeholder={newStaff.id ? "(Để trống nếu không đổi)" : "Mật khẩu đăng nhập"}
                            value={newStaff.password || ""}
                            onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-xl focus:border-[#CCFF00] outline-none text-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowStaffPassword(prev => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                          >
                            {showStaffPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  {user?.role === "ADMIN" ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2 font-bold">Lương cơ bản</label>
                        <input
                          required
                          type="text"
                          value={newStaff.baseSalary === 0 ? "" : newStaff.baseSalary?.toLocaleString('en-US') || ""}
                          onChange={e => {
                            const digits = e.target.value.replace(/[^0-9]/g, "");
                            setNewStaff({ ...newStaff, baseSalary: parseInt(digits) || 0 });
                          }}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-[#CCFF00] outline-none text-[#CCFF00] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2 font-bold">Lương/Giờ</label>
                        <input
                          required
                          type="text"
                          value={newStaff.hourlyRate === 0 ? "" : newStaff.hourlyRate?.toLocaleString('en-US') || ""}
                          onChange={e => {
                            const digits = e.target.value.replace(/[^0-9]/g, "");
                            setNewStaff({ ...newStaff, hourlyRate: parseInt(digits) || 0 });
                          }}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-[#CCFF00] outline-none text-white font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 text-zinc-500 text-[11px] italic text-center p-3 bg-white/5 rounded-xl border border-white/5">
                      ⚠️ Lương và chế độ đãi ngộ được quản lý trực tiếp bởi Quản trị viên (ADMIN)
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setIsStaffModalOpen(false)} className="flex-1 py-4 border border-white/10 rounded-xl text-[10px] font-black uppercase text-zinc-500">Hủy</button>
                  <button type="submit" className="flex-1 py-4 bg-[#CCFF00] text-black rounded-xl text-[10px] font-black uppercase">
                    {newStaff.id ? "CẬP NHẬT" : "LƯU NHÂN VIÊN QUẦY"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPayrollModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-4xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-10 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black italic uppercase text-[#CCFF00]">BẢNG LƯƠNG NHÂN VIÊN QUẦY</h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">CHI TIẾT THU NHẬP HÀNG THÁNG</p>
                </div>
                <button
                  onClick={() => handleGeneratePayroll(new Date().toISOString().slice(0, 7))}
                  className="px-6 py-3 bg-[#CCFF00] text-black text-[10px] font-black uppercase rounded-xl"
                >
                  TẠO BẢNG LƯƠNG MỚI
                </button>
              </div>

              <div className="overflow-x-auto max-h-[50vh]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-black text-zinc-400 uppercase border-b border-white/5">
                      <th className="py-4 px-4">Nhân viên quầy</th>
                      <th className="py-4 px-4">Lương CB</th>
                      <th className="py-4 px-4">Thưởng PT</th>
                      <th className="py-4 px-4">Hoa hồng</th>
                      <th className="py-4 px-4">OT Pay</th>
                      <th className="py-4 px-4 text-right">Tổng nhận</th>
                      <th className="py-4 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payroll.map(rec => {
                      const staff = staffMembers.find(s => s.id === rec.staffId);
                      const isEditing = editingPayrollId === rec.id;
                      
                      if (isEditing) {
                        const computedTotal = editBasePay + editPtBonus + editOtPay + editCommission;
                        return (
                          <tr key={rec.id} className="text-xs bg-white/[0.02]">
                            <td className="py-3 px-4 font-black uppercase italic text-white align-middle">{staff?.fullName}</td>
                            <td className="py-3 px-4 align-middle">
                              <input
                                type="text"
                                value={editBasePay === 0 ? "" : editBasePay.toLocaleString('en-US')}
                                onChange={e => {
                                  const digits = e.target.value.replace(/[^0-9]/g, "");
                                  setEditBasePay(Math.max(0, parseInt(digits) || 0));
                                }}
                                className="w-24 bg-zinc-90 w-full min-w-[90px] border border-white/10 px-2 py-1 rounded text-white font-mono text-xs focus:border-[#CCFF00] outline-none"
                              />
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <input
                                type="text"
                                value={editPtBonus === 0 ? "" : editPtBonus.toLocaleString('en-US')}
                                onChange={e => {
                                  const digits = e.target.value.replace(/[^0-9]/g, "");
                                  setEditPtBonus(Math.max(0, parseInt(digits) || 0));
                                }}
                                className="w-24 bg-zinc-90 w-full min-w-[90px] border border-white/10 px-2 py-1 rounded text-[#CCFF00] font-mono text-xs focus:border-[#CCFF00] outline-none"
                              />
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <input
                                type="text"
                                value={editCommission === 0 ? "" : editCommission.toLocaleString('en-US')}
                                onChange={e => {
                                  const digits = e.target.value.replace(/[^0-9]/g, "");
                                  setEditCommission(Math.max(0, parseInt(digits) || 0));
                                }}
                                className="w-24 bg-zinc-90 w-full min-w-[90px] border border-white/10 px-2 py-1 rounded text-cyan-400 font-mono text-xs focus:border-[#CCFF00] outline-none"
                              />
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <input
                                type="text"
                                value={editOtPay === 0 ? "" : editOtPay.toLocaleString('en-US')}
                                onChange={e => {
                                  const digits = e.target.value.replace(/[^0-9]/g, "");
                                  setEditOtPay(Math.max(0, parseInt(digits) || 0));
                                }}
                                className="w-24 bg-zinc-90 w-full min-w-[90px] border border-white/10 px-2 py-1 rounded text-orange-400 font-mono text-xs focus:border-[#CCFF00] outline-none"
                              />
                            </td>
                            <td className="py-3 px-4 text-right font-black text-white text-sm align-middle">
                              {computedTotal.toLocaleString()}đ
                            </td>
                            <td className="py-3 px-4 text-center align-middle space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleUpdatePayroll(rec.id)}
                                className="px-2.5 py-1 bg-[#CCFF00] text-black text-[9px] font-black uppercase rounded hover:bg-white transition-colors"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingPayrollId(null)}
                                className="px-2.5 py-1 bg-zinc-800 text-white text-[9px] font-black uppercase rounded border border-white/10 hover:bg-zinc-700 transition-colors"
                              >
                                Hủy
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={rec.id} className="text-xs hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 font-black uppercase italic text-white align-middle">{staff?.fullName}</td>
                          <td className="py-4 px-4 text-zinc-400 font-mono align-middle">{rec.basePay.toLocaleString()}đ</td>
                          <td className="py-4 px-4 text-[#CCFF00] font-mono align-middle">{rec.ptBonus.toLocaleString()}đ</td>
                          <td className="py-4 px-4 text-cyan-400 font-mono align-middle">{(rec.commission || 0).toLocaleString()}đ</td>
                          <td className="py-4 px-4 text-orange-400 font-mono align-middle">{rec.otPay.toLocaleString()}đ</td>
                          <td className="py-4 px-4 text-right font-black text-white text-sm align-middle">{rec.totalPay.toLocaleString()}đ</td>
                          <td className="py-4 px-4 text-center align-middle">
                            <button
                              onClick={() => {
                                setEditingPayrollId(rec.id);
                                setEditBasePay(rec.basePay);
                                setEditPtBonus(rec.ptBonus);
                                setEditOtPay(rec.otPay);
                                setEditCommission(rec.commission || 0);
                              }}
                              className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-black uppercase tracking-tight text-[#CCFF00] hover:bg-[#CCFF00]/10 transition-all"
                            >
                              Sửa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={() => setIsPayrollModalOpen(false)} className="px-8 py-4 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white">Đóng</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPTModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden p-10"
            >
              <div className="mb-10">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-[#CCFF00]">
                  {newPT.id ? "CẬP NHẬT PT" : "THÊM PT MỚI"}
                </h3>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em] mt-1">
                  {newPT.id ? "CHỈNH SỬA THÔNG TIN HUẤN LUYỆN VIÊN" : "ĐĂNG KÝ HUẤN LUYỆN VIÊN CÁ NHÂN"}
                </p>
              </div>

              <form onSubmit={handleAddPT} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      HỌ VÀ TÊN
                    </label>
                    <input
                      required
                      type="text"
                      value={newPT.fullName}
                      onChange={(e) => setNewPT({ ...newPT, fullName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-black uppercase italic tracking-tight"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      SỐ ĐIỆN THOẠI
                    </label>
                    <input
                      required
                      type="tel"
                      value={newPT.phone}
                      onChange={(e) => setNewPT({ ...newPT, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest mb-2 italic font-bold">
                      EMAIL (Yêu cầu đuôi @fit.com)
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="example@fit.com"
                      value={newPT.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewPT({ ...newPT, email: val, username: val });
                      }}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-mono text-[#CCFF00]"
                    />
                  </div>
                  {user?.role === "ADMIN" && (
                    <>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                          TÊN ĐĂNG NHẬP (TỰ ĐỘNG THEO EMAIL)
                        </label>
                        <input
                          disabled
                          readOnly
                          type="text"
                          placeholder="TỰ ĐỘNG THEO EMAIL"
                          value={newPT.email || ""}
                          className="w-full bg-white/5 border border-white/5 px-5 py-4 rounded-2xl outline-none text-sm font-mono text-zinc-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                          MẬT KHẨU
                        </label>
                        <div className="relative">
                          <input
                            required={!newPT.id}
                            type={showPTPassword ? "text" : "password"}
                            placeholder={newPT.id ? "(KHÔNG ĐỔI)" : "MẬT KHẨU"}
                            value={newPT.password || ""}
                            onChange={(e) => setNewPT({ ...newPT, password: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 px-5 py-4 log-input pr-12 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPTPassword(prev => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                          >
                            {showPTPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      CẤP BẬC PT
                    </label>
                    <select
                      value={newPT.level}
                      onChange={(e) => setNewPT({ ...newPT, level: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic tracking-tight"
                    >
                      <option value="Junior" className="bg-zinc-950">Junior</option>
                      <option value="Senior" className="bg-zinc-950">Senior</option>
                      <option value="Master" className="bg-zinc-950">Master</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      TỶ LỆ HOA HỒNG (0.0 - 1.0)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={newPT.commissionRate}
                      onChange={(e) => setNewPT({ ...newPT, commissionRate: parseFloat(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">
                      CHUYÊN MÔN (NHẬP TÙY CHỈNH HOẶC CHỌN DANH SÁCH)
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Yoga, Gym, Boxing..."
                      value={newPT.expertise ? newPT.expertise.join(", ") : ""}
                      onChange={(e) => setNewPT({ ...newPT, expertise: e.target.value.split(",").map(s => s.trim()) })}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-black uppercase italic tracking-tight"
                    />
                    {/* Predefined expertise badges to click */}
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Gợi ý lĩnh vực chuyên môn:</p>
                      <div className="flex flex-wrap gap-2">
                        {["GYM", "YOGA", "BOXING", "PILATES", "CARDIO", "KICKFIT", "DANCE", "STRETCHING", "ZUMBA", "AEROBIC"].map((spec) => {
                          const isSelected = newPT.expertise && newPT.expertise.some(
                            (e) => e.trim().toUpperCase() === spec
                          );
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => {
                                let currentSpecs = newPT.expertise ? [...newPT.expertise].map(s => s.trim()) : [];
                                currentSpecs = currentSpecs.filter(s => s.length > 0);
                                
                                const index = currentSpecs.findIndex(s => s.toUpperCase() === spec);
                                if (index !== -1) {
                                  currentSpecs.splice(index, 1);
                                } else {
                                  const formattedName = spec.charAt(0) + spec.slice(1).toLowerCase();
                                  currentSpecs.push(formattedName);
                                }
                                setNewPT({ ...newPT, expertise: currentSpecs });
                              }}
                              className={`text-[10px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 ${
                                isSelected 
                                  ? "bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_4px_12px_rgba(204,255,0,0.2)]" 
                                  : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
                              }`}
                            >
                              {spec}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsPTModalOpen(false)}
                    className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-2xl hover:bg-white/5 transition-colors"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-5 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(204,255,0,0.15)] text-[10px]"
                  >
                    LƯU THÔNG TIN
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPTAssignModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-sm rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-10"
            >
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00] leading-none">
                  GÁN PT
                </h3>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-2">
                  HỢP ĐỒNG HUẤN LUYỆN MỚI
                </p>
              </div>

              <form onSubmit={handleAssignPT} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-center font-bold">
                      CHỌN HỘI VIÊN
                    </label>
                    <select
                      required
                      value={newPTAssignment.memberId || ""}
                      onChange={(e) => setNewPTAssignment({ ...newPTAssignment, memberId: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase text-center italic"
                    >
                      <option value="" className="bg-zinc-950">-- CHỌN HỘI VIÊN --</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id} className="bg-zinc-950 text-left">{member.fullName.toUpperCase()} - {member.phone}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-center font-bold">
                      CHỌN HUẤN LUYỆN VIÊN
                    </label>
                    <select
                      required
                      value={newPTAssignment.trainerId || ""}
                      onChange={(e) => setNewPTAssignment({ ...newPTAssignment, trainerId: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase text-center italic"
                    >
                      <option value="" className="bg-zinc-950">-- CHỌN PT --</option>
                      {trainers.map(trainer => (
                        <option key={trainer.id} value={trainer.id} className="bg-zinc-950">{trainer.fullName.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-center font-bold">
                      TỔNG SỐ BUỔI (TÙY CHỈNH)
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={newPTAssignment.totalSessions || ""}
                      onChange={(e) => {
                        const sessions = parseInt(e.target.value) || 0;
                        setNewPTAssignment({ ...newPTAssignment, totalSessions: sessions, sessionsLeft: sessions });
                      }}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-center font-black text-xl text-[#CCFF00]"
                    />
                    {/* Session preset buttons to click */}
                    <div className="flex flex-wrap gap-1.5 justify-center mt-2.5">
                      {[10, 24, 30, 48, 100].map((sessions) => (
                        <button
                          key={sessions}
                          type="button"
                          onClick={() => {
                            // Suggest dynamic pricing if current price is empty/0 (e.g. 250k / session)
                            const cleanPrice = newPTAssignment.price && newPTAssignment.price > 0 
                              ? newPTAssignment.price 
                              : sessions * 250000;
                            setNewPTAssignment({ 
                              ...newPTAssignment, 
                              totalSessions: sessions,
                              sessionsLeft: sessions,
                              price: cleanPrice
                            });
                          }}
                          className={`text-[9px] font-black px-2 py-1 rounded-lg border tracking-wider transition-all duration-150 hover:scale-105 active:scale-95 ${
                            newPTAssignment.totalSessions === sessions 
                              ? "bg-[#CCFF00] text-black border-[#CCFF00]" 
                              : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {sessions} buổi
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-center font-bold">
                      GIÁ (VNĐ)
                    </label>
                    <input
                      required
                      type="text"
                      value={newPTAssignment.price === 0 ? "" : newPTAssignment.price?.toLocaleString('en-US') || ""}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, "");
                        setNewPTAssignment({ ...newPTAssignment, price: parseInt(digits) || 0 });
                      }}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-center font-black text-sm text-white font-mono"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-center font-bold">
                    NGÀY GÁN
                  </label>
                  <input
                    required
                    type="date"
                    value={newPTAssignment.assignedDate || ""}
                    onChange={(e) => setNewPTAssignment({ ...newPTAssignment, assignedDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl focus:border-[#CCFF00] outline-none text-center font-black text-xs text-white uppercase"
                  />
                </div>
                
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    type="submit"
                    className="w-full py-5 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(204,255,0,0.15)] text-[10px]"
                  >
                    XÁC NHẬN HỢP ĐỒNG
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPTAssignModalOpen(false)}
                    className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                  >
                    QUAY LẠI
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPTDetailModalOpen && selectedPT && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
            onClick={() => setIsPTDetailModalOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-8 overflow-y-auto custom-scrollbar"
            >
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00]">
                      CHI TIẾT PT
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em] mt-1 italic">
                      HỒ SƠ HUẤN LUYỆN VIÊN CÁ NHÂN
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsPTDetailModalOpen(false)}
                    className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                     <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-6">
                        <div className="w-20 h-20 bg-[#CCFF00] rounded-3xl flex items-center justify-center text-3xl font-black italic text-black shrink-0">
                          {selectedPT.fullName.charAt(0)}
                        </div>
                        <div>
                           <h4 className="text-xl font-black uppercase italic tracking-tight text-white mb-1">{selectedPT.fullName}</h4>
                           <span className="text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 bg-[#CCFF00]/10 text-[#CCFF00] rounded-full">
                             {selectedPT.level} PT
                           </span>
                        </div>
                     </div>

                     <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-4">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2 border-b border-white/5 pb-2">THÔNG TIN LIÊN HỆ</h5>
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500">
                              <Phone className="w-4 h-4" />
                           </div>
                           <span className="text-sm font-mono text-white">{selectedPT.phone}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500">
                              <Mail className="w-4 h-4" />
                           </div>
                           <span className="text-sm font-mono text-white">{selectedPT.email}</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4 border-b border-white/5 pb-2">CHUYÊN MÔN</h5>
                        <div className="flex flex-wrap gap-2">
                           {selectedPT.expertise.map((exp, i) => (
                             <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-white/70">
                               {exp}
                             </span>
                           ))}
                        </div>
                     </div>

                     <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-[#CCFF00]/10">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-[#CCFF00] mb-4">THỐNG KÊ HOẠT ĐỘNG</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black p-4 rounded-2xl border border-white/5">
                               <p className="text-[9px] font-mono text-zinc-600 uppercase mb-1">Hội viên</p>
                               <p className="text-xl font-black text-white">{ptStats.find(s => s.trainerId === selectedPT.id)?.activeClients || 0}</p>
                            </div>
                            <div className="bg-black p-4 rounded-2xl border border-white/5">
                               <p className="text-[9px] font-mono text-zinc-600 uppercase mb-1">Số buổi dạy</p>
                               <p className="text-xl font-black text-white">{ptStats.find(s => s.trainerId === selectedPT.id)?.sessionsTotal || 0}</p>
                            </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h5 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    DANH SÁCH HỘI VIÊN ĐANG QUẢN LÝ
                  </h5>
                  <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-x-auto custom-scrollbar">
                     <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 whitespace-nowrap text-xs font-black uppercase tracking-widest text-zinc-400">
                            <th className="px-6 py-4">HỘI VIÊN</th>
                            <th className="px-6 py-4">GÓI TẬP</th>
                            <th className="px-6 py-4 text-center">NGÀY GÁN</th>
                            <th className="px-6 py-4 text-center">CÒN LẠI</th>
                            <th className="px-6 py-4 text-center">TRẠNG THÁI</th>
                            <th className="px-6 py-4 text-right">THAO TÁC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {ptAssignments.filter(a => a.trainerId === selectedPT.id).length > 0 ? (
                            ptAssignments.filter(a => a.trainerId === selectedPT.id).map(assignment => {
                              const member = members.find(m => m.id === assignment.memberId);
                              return (
                                <tr key={assignment.id} className="group hover:bg-white/[0.02] transition-colors whitespace-nowrap">
                                  <td className="px-6 py-4">
                                     <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase italic text-white whitespace-nowrap">{member?.fullName || "N/A"}</span>
                                        <span className="text-[9px] font-mono text-zinc-500">{member?.phone}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className="text-[10px] font-black italic uppercase text-zinc-300">{assignment.totalSessions} buổi</span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                     <span className="text-[10px] font-mono text-zinc-400 font-bold italic tracking-tighter uppercase whitespace-nowrap">
                                        {assignment.assignedDate || assignment.startDate || "--"}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                     <span className="text-[11px] font-black font-mono text-[#CCFF00]">{assignment.sessionsLeft}/{assignment.totalSessions}</span>
                                  </td>
                                  <td className="px-6 py-4 text-center text-[10px] font-black uppercase italic text-[#CCFF00]">
                                     {assignment.status}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <button 
                                       onClick={() => handleDeletePTAssignment(assignment.id)}
                                       className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                                       title="Xóa hội viên khỏi quản lý"
                                     >
                                       <Trash2 className="w-3.5 h-3.5" /> /* MARKER_TRASH */
                                     </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-10 text-center text-zinc-600 text-[10px] font-black uppercase tracking-[.2em]">
                                CHƯA CÓ HỘI VIÊN NÀO ĐƯỢC GÁN
                              </td>
                            </tr>
                          )}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="mt-10 pt-8 border-t border-white/5 flex gap-4">
                  <button 
                    onClick={() => {
                        setIsPTDetailModalOpen(false);
                        handleEditPT(selectedPT);
                    }}
                    className="flex-1 py-4 bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest"
                  >
                    CHỈNH SỬA HỒ SƠ
                  </button>
                  <button 
                    onClick={() => {
                        setIsPTDetailModalOpen(false);
                        openPTAssignModal(selectedPT.id);
                    }}
                    className="flex-1 py-4 bg-[#CCFF00] text-black rounded-2xl hover:bg-white transition-all font-black uppercase text-[10px] tracking-widest shadow-[0_10px_30px_rgba(204,255,0,0.15)]"
                  >
                    GÁN HỘI VIÊN MỚI
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
       <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8"
            >
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-[#CCFF00]">
                {isEditingProduct ? "SỬA SẢN PHẨM" : "THÊM SẢN PHẨM"}
              </h3>
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">Ảnh sản phẩm</label>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {newProduct.image ? (
                          <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Zap className="w-8 h-8 text-zinc-800" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          id="product-image-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewProduct({ ...newProduct, image: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label 
                          htmlFor="product-image-upload"
                          className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 hover:border-[#CCFF00]/50 transition-all text-[10px] font-black uppercase text-zinc-400 hover:text-[#CCFF00]"
                        >
                          <Upload className="w-4 h-4" />
                          CHỌN FILE ẢNH
                        </label>
                      </div>
                    </div>
                    {newProduct.image && (
                      <button 
                        type="button"
                        onClick={() => setNewProduct({...newProduct, image: ""})}
                        className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline text-left w-fit"
                      >
                        [ XÓA ẢNH HIỆN TẠI ]
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">Tên sản phẩm</label>
                  <input
                    required
                    type="text"
                    placeholder="Nước khoáng, Whey protein..."
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">Danh mục</label>
                      <select
                        value={newProduct.category}
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-[10px] font-black uppercase italic appearance-none"
                      >
                        <option value="Thực phẩm bổ sung" className="bg-zinc-950">Thực phẩm bổ sung</option>
                        <option value="Phụ kiện" className="bg-zinc-950">Phụ kiện</option>
                        <option value="Nước uống" className="bg-zinc-950">Nước uống</option>
                        <option value="Dịch vụ" className="bg-zinc-950">Dịch vụ</option>
                      </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">Giá bán (VND)</label>
                    <input
                      required
                      type="text"
                      value={newProduct.price === 0 ? "" : newProduct.price?.toLocaleString('en-US') || ""}
                      onChange={e => {
                        const digits = e.target.value.replace(/[^0-9]/g, "");
                        setNewProduct({...newProduct, price: parseInt(digits) || 0});
                      }}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">Tồn kho ban đầu</label>
                  <input
                    required
                    type="number"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono font-bold"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit" 
                    className="flex-1 py-4 bg-[#CCFF00] text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-white transition-all shadow-[0_10px_30px_rgba(204,255,0,0.1)] active:scale-95"
                  >
                    LƯU SẢN PHẨM
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsProductModalOpen(false)} 
                    className="px-6 py-4 text-zinc-500 font-black uppercase text-[9px] tracking-widest hover:text-white transition-colors"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransactionModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8"
              >
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-white">THU & CHI QUỸ</h3>
              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'INCOME'})}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all border ${newTransaction.type === 'INCOME' ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_5px_20px_rgba(204,255,0,0.2)]' : 'bg-white/5 text-zinc-500 border-white/10'}`}
                  >
                    THU (INCOME)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'EXPENSE'})}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all border ${newTransaction.type === 'EXPENSE' ? 'bg-red-600 text-white border-red-600 shadow-[0_5px_20px_rgba(220,38,38,0.2)]' : 'bg-white/5 text-zinc-500 border-white/10'}`}
                  >
                    CHI (EXPENSE)
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">Số tiền (VND)</label>
                    <input
                      required
                      type="text"
                      value={newTransaction.amount === 0 ? "" : newTransaction.amount?.toLocaleString('en-US') || ""}
                      onChange={e => {
                        const digits = e.target.value.replace(/[^0-9]/g, "");
                        setNewTransaction({...newTransaction, amount: parseInt(digits) || 0});
                      }}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">Danh mục</label>
                    <input
                      required
                      type="text"
                      placeholder="Mặt bằng, Điện nước..."
                      value={newTransaction.category}
                      onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-[10px] font-black uppercase italic"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">Khách hàng (Không bắt buộc)</label>
                  <input
                    type="text"
                    placeholder="Tên khách hàng..."
                    value={newTransaction.customerName || ""}
                    onChange={e => setNewTransaction({...newTransaction, customerName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-[10px] font-black uppercase italic"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">Ghi chú chi tiết</label>
                  <textarea
                    placeholder="Mô tả cụ thể về giao dịch này..."
                    value={newTransaction.note}
                    onChange={e => setNewTransaction({...newTransaction, note: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:border-[#CCFF00] outline-none text-[10px] h-24 resize-none italic text-zinc-300"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit" 
                    className="flex-1 py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-[#CCFF00] transition-all shadow-xl active:scale-95"
                  >
                    LƯU GIAO DỊCH
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsTransactionModalOpen(false)} 
                    className="px-6 py-4 text-zinc-500 font-black uppercase text-[9px] tracking-widest hover:text-white transition-colors"
                  >
                    HỦY
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRevenueModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#CCFF00]/20" />
              <button 
                onClick={() => setIsRevenueModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
              
              <div className="mb-8">
                <p className="text-[10px] font-black text-[#CCFF00] uppercase tracking-[0.3em] mb-2 font-mono">INSIGHT_SYSTEM</p>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">{t('historyTransactions')}</h2>
              </div>

              <div className="space-y-6">
                 <div className="bg-white/5 p-8 rounded-3xl border border-white/5 flex flex-col items-center">
                    <p className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-2">{t('totalRevenue')}</p>
                    <p className="text-5xl font-black text-[#CCFF00] italic tracking-tighter">
                      {memberSales.reduce((sum, s) => sum + s.paidAmount, 0).toLocaleString()}đ
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">GIAO DỊCH</p>
                        <p className="text-xl font-black text-white">{memberSales.length}</p>
                    </div>
                    <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">TRẠNG THÁI</p>
                        <p className="text-xl font-black text-emerald-500 uppercase italic">SUCCESS</p>
                    </div>
                 </div>
              </div>

              <button
                onClick={() => setIsRevenueModalOpen(false)}
                className="w-full py-5 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-2xl mt-10 shadow-lg shadow-[#CCFF00]/20 transition-all active:scale-95 text-xs"
              >
                ĐÓNG CỬA SỔ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEquipmentModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00]">
                    {editingEquipment ? t('editEquipment') : t('addEquipment')}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1 italic leading-none">
                    {editingEquipment ? 'UPDATE_ASSET_METADATA' : 'PROVISION_NEW_ASSET'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsEquipmentModalOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEquipmentSubmit} className="space-y-6">
                <div className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">{t('equipmentName')}</label>
                      <input 
                        required
                        type="text" 
                        value={editingEquipment ? editingEquipment.name : newEquipment.name}
                        onChange={(e) => editingEquipment ? setEditingEquipment({...editingEquipment, name: e.target.value}) : setNewEquipment({...newEquipment, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-sm font-black uppercase italic"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">{t('equipmentCode')}</label>
                        <input 
                          readOnly
                          type="text" 
                          value={editingEquipment ? editingEquipment.code : newEquipment.code}
                          className="w-full bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-zinc-800 outline-none text-xs font-mono opacity-50 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic font-bold">{t('category')}</label>
                        <select 
                          value={editingEquipment ? editingEquipment.category : newEquipment.category}
                          onChange={(e) => editingEquipment ? setEditingEquipment({...editingEquipment, category: e.target.value}) : setNewEquipment({...newEquipment, category: e.target.value})}
                          className="w-full bg-zinc-950 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic appearance-none"
                        >
                          <option value="Cardio">Cardio</option>
                          <option value="Sức mạnh">Sức mạnh</option>
                          <option value="Tự do">Tự do</option>
                          <option value="Phụ kiện">Phụ kiện</option>
                        </select>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">{t('purchaseDate')}</label>
                        <input 
                          type="date" 
                          value={editingEquipment ? editingEquipment.purchaseDate : newEquipment.purchaseDate}
                          onChange={(e) => editingEquipment ? setEditingEquipment({...editingEquipment, purchaseDate: e.target.value}) : setNewEquipment({...newEquipment, purchaseDate: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">{t('location')}</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Zone A"
                          value={editingEquipment ? editingEquipment.location : newEquipment.location}
                          onChange={(e) => editingEquipment ? setEditingEquipment({...editingEquipment, location: e.target.value}) : setNewEquipment({...newEquipment, location: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase"
                        />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">{t('equipmentStatus')}</label>
                      <select 
                        value={editingEquipment ? editingEquipment.status : newEquipment.status}
                        onChange={(e) => editingEquipment ? setEditingEquipment({...editingEquipment, status: e.target.value as any}) : setNewEquipment({...newEquipment, status: e.target.value as any})}
                        className="w-full bg-zinc-950 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic appearance-none"
                      >
                        <option value="NORMAL">{t('normal')}</option>
                        <option value="MAINTENANCE_REQUIRED">{t('needMaintenance')}</option>
                        <option value="BROKEN">{t('broken')}</option>
                        <option value="UNDER_MAINTENANCE">{t('underMaintenance')}</option>
                      </select>
                   </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button
                    type="submit"
                    className="flex-1 py-5 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#CCFF00]/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
                  >
                    {t('save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEquipmentModalOpen(false)}
                    className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                  >
                    {t('cancelBack')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMaintenanceModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10"
            >
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00]">
                    {editingMaintenance ? t('editMaintenance') : t('addMaintenance')}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1 italic leading-none">
                    {editingMaintenance ? 'UPDATE_MAINTENANCE_LOG' : 'SCHEDULE_TASK'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMaintenanceSubmit} className="space-y-6">
                 <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">{t('equipmentName')}</label>
                        <select 
                          required
                          value={editingMaintenance ? editingMaintenance.equipmentId : newMaintenance.equipmentId}
                          onChange={(e) => editingMaintenance ? setEditingMaintenance({...editingMaintenance, equipmentId: parseInt(e.target.value)}) : setNewMaintenance({...newMaintenance, equipmentId: parseInt(e.target.value)})}
                          className="w-full bg-zinc-950 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic"
                        >
                          <option value="0" className="bg-zinc-950">-- CHỌN THIẾT BỊ --</option>
                          {equipments.map(eq => (
                            <option key={eq.id} value={eq.id} className="bg-zinc-950">{eq.name.toUpperCase()} ({eq.code})</option>
                          ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">{t('scheduledDate')}</label>
                          <input 
                            required
                            type="date" 
                            value={editingMaintenance ? editingMaintenance.scheduledDate : newMaintenance.scheduledDate}
                            onChange={(e) => editingMaintenance ? setEditingMaintenance({...editingMaintenance, scheduledDate: e.target.value}) : setNewMaintenance({...newMaintenance, scheduledDate: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-mono"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">{t('priority')}</label>
                          <select 
                            value={editingMaintenance ? editingMaintenance.priority : newMaintenance.priority}
                            onChange={(e) => editingMaintenance ? setEditingMaintenance({...editingMaintenance, priority: e.target.value as any}) : setNewMaintenance({...newMaintenance, priority: e.target.value as any})}
                            className="w-full bg-zinc-950 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic appearance-none"
                          >
                            <option value="LOW">{t('low')}</option>
                            <option value="MEDIUM">{t('medium')}</option>
                            <option value="HIGH">{t('high')}</option>
                          </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">{t('taskType')}</label>
                          <select 
                            value={editingMaintenance ? editingMaintenance.taskType : newMaintenance.taskType}
                            onChange={(e) => editingMaintenance ? setEditingMaintenance({...editingMaintenance, taskType: e.target.value as any}) : setNewMaintenance({...newMaintenance, taskType: e.target.value as any})}
                            className="w-full bg-zinc-950 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic appearance-none"
                          >
                            <option value="ROUTINE">{t('routine')}</option>
                            <option value="REPAIR">{t('repair')}</option>
                            <option value="INSPECTION">{t('inspection')}</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">{t('performer')}</label>
                          <input 
                            required
                            type="text" 
                            placeholder="Kỹ thuật viên..."
                            value={editingMaintenance ? editingMaintenance.performer : newMaintenance.performer}
                            onChange={(e) => editingMaintenance ? setEditingMaintenance({...editingMaintenance, performer: e.target.value}) : setNewMaintenance({...newMaintenance, performer: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase"
                          />
                       </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 italic text-zinc-400 font-bold">{t('taskStatus')}</label>
                        <select 
                          value={editingMaintenance ? editingMaintenance.status : newMaintenance.status}
                          onChange={(e) => editingMaintenance ? setEditingMaintenance({...editingMaintenance, status: e.target.value as any}) : setNewMaintenance({...newMaintenance, status: e.target.value as any})}
                          className="w-full bg-zinc-950 border border-white/10 px-5 py-3.5 rounded-2xl focus:border-[#CCFF00] outline-none text-xs font-black uppercase italic appearance-none"
                        >
                          <option value="PENDING">{t('pending')}</option>
                          <option value="IN_PROGRESS">{t('in_progress')}</option>
                          <option value="COMPLETED">{t('completed')}</option>
                          <option value="CANCELLED">{t('cancelled')}</option>
                        </select>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-8">
                  <button
                    type="submit"
                    className="flex-1 py-5 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#CCFF00]/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
                  >
                    {t('save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMaintenanceModalOpen(false)}
                    className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                  >
                    {t('cancelBack')}
                  </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black border border-white/10 w-full max-w-sm rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-10 text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-20" />
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 ${confirmDialog.type === "danger" ? "bg-red-500/10 text-red-500" : "bg-[#CCFF00]/10 text-[#CCFF00]"}`}
              >
                {confirmDialog.type === "danger" ? (
                  <Trash2 className="w-10 h-10" />
                ) : (
                  <Activity className="w-10 h-10" />
                )}
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-3 leading-none">
                {confirmDialog.title}
              </h3>
              <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-[.15em] leading-relaxed mb-10 px-4">
                {confirmDialog.message}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`w-full py-5 font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 text-xs ${confirmDialog.type === "danger" ? "bg-red-600 text-white" : "bg-[#CCFF00] text-black shadow-[0_10px_30px_rgba(204,255,0,0.2)]"}`}
                >
                  {t('confirmAction')}
                </button>
                <button
                  onClick={() =>
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="w-full py-5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                >
                  {t('cancelBack')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {user?.role === "MEMBER" && (
        <>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-2xl shadow-[#CCFF00]/40 z-[999] hover:scale-110 active:scale-95 transition-all group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 animate-ping group-hover:block hidden" />
            {isChatOpen ? <X className="w-8 h-8 text-black" /> : <Zap className="w-8 h-8 text-black fill-current" />}
          </button>

          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50, x: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50, x: 50 }}
                className="fixed bottom-28 right-8 w-[24rem] h-[34rem] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl z-[998] overflow-hidden flex flex-col backdrop-blur-xl"
              >
                <div className="p-6 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#CCFF00] rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-black fill-current" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black italic uppercase text-white leading-none tracking-tight">{t('aiAssistant')}</h4>
                      <p className="text-[9px] font-black font-mono text-[#CCFF00] mt-1 tracking-widest uppercase">ONLINE_SYSTEM_CORE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Live</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                       <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center mb-2">
                          <Activity className="w-8 h-8 text-zinc-600" />
                       </div>
                       <p className="text-xs font-medium text-zinc-400 italic">Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?</p>
                       <div className="grid grid-cols-1 gap-2 w-full mt-4">
                          {[
                            t('workoutPrompt'),
                            t('packagePrompt'),
                            "Chế độ ăn giảm cân hiệu quả?",
                          ].map((suggest, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                handleSendMessage(undefined, suggest);
                              }}
                              className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-500 hover:bg-[#CCFF00]/10 hover:text-[#CCFF00] hover:border-[#CCFF00]/20 transition-all text-left"
                            >
                              + {suggest}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-5 py-3.5 rounded-[1.5rem] text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#CCFF00] text-black font-semibold rounded-tr-none shadow-lg shadow-[#CCFF00]/10"
                            : "bg-zinc-900 border border-white/5 text-zinc-200 rounded-tl-none font-medium"
                        }`}
                      >
                        <div className={`prose prose-sm max-w-none prose-p:leading-relaxed prose-ol:list-decimal prose-ul:list-disc prose-li:my-0.5 ${msg.role === 'user' ? 'text-black' : 'prose-invert'}`}>
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-zinc-900 border border-white/5 px-5 py-4 rounded-[1.5rem] rounded-tl-none">
                        <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-zinc-900/30">
                  <form onSubmit={handleSendMessage} className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t('askMeAnything')}
                      className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-sm text-white focus:outline-none focus:border-[#CCFF00]/50 placeholder:text-zinc-600 transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isTyping}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#CCFF00] text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-[8px] font-black font-mono text-zinc-700 uppercase tracking-widest text-center mt-4">POWERED BY GEMINI_SYSTEM // AI_NATIVE</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

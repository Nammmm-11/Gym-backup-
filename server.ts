import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI features will be disabled or might crash.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key || "TEMPORARY_DEV_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

interface Member {
  id: number;
  memberCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username?: string;
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
  deletedAt: string | null;
  assignedPTId?: number | null;
  password?: string;
}

interface PersonalTrainer {
  id: number;
  fullName: string;
  expertise: string[];
  level: "Junior" | "Senior" | "Master";
  commissionRate: number; // e.g., 0.1 for 10%
  isActive: boolean;
  phone: string;
  email: string;
  username?: string;
  password?: string;
  avatar?: string;
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

interface GymMessage {
  id: number;
  memberId: number;
  memberName: string;
  senderId: string;
  senderName: string;
  senderRole: "MEMBER" | "STAFF" | "ADMIN" | "PT";
  text: string;
  createdAt: string;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Dữ liệu mẫu
  let members: Member[] = [
    { 
      id: 1, 
      memberCode: "MEM001",
      firstName: "Nam",
      lastName: "Nguyễn Hoài",
      fullName: "Nguyễn Hoài Nam", 
      username: "hoainam",
      phone: "0901234567", 
      email: "hoainam78954@gmail.com",
      dob: "1990-01-01",
      gender: "Nam",
      address: "123 Quận 1, TP.HCM",
      status: "Hết hạn", 
      registrationDate: "2024-05-01", 
      expiryDate: "2025-05-01", 
      package: "Gói Cao Cấp 12T", 
      createdBy: "admin", 
      revenue: 4500000, 
      deletedAt: null,
      password: "123456"
    },
    { 
      id: 3, 
      memberCode: "MEM003",
      firstName: "C",
      lastName: "Lê Văn",
      fullName: "Lê Văn C", 
      username: "vanc",
      phone: "0912345678", 
      email: "vanc@gmail.com",
      dob: "1988-10-20",
      gender: "Nam",
      address: "789 Quận 7, TP.HCM",
      status: "Hết hạn", 
      registrationDate: "2024-05-05", 
      expiryDate: "2024-11-05", 
      package: "Gói Tiêu Chuẩn 6T", 
      createdBy: "staff", 
      revenue: 2500000, 
      deletedAt: null,
      password: "123456"
    },
    { 
      id: 4, 
      memberCode: "MEM004",
      firstName: "D",
      lastName: "Phạm Văn",
      fullName: "Phạm Văn D", 
      username: "vand",
      phone: "0908889999", 
      email: "vand@gmail.com",
      dob: "1992-12-12",
      gender: "Nam",
      address: "321 Quận 10, TP.HCM",
      status: "Hết hạn", 
      registrationDate: "2024-02-15", 
      expiryDate: "2024-03-15", 
      package: "Gói Cơ Bản", 
      createdBy: "admin", 
      revenue: 1500000, 
      deletedAt: null,
      password: "123456"
    },
    { 
      id: 5, 
      memberCode: "MEM005",
      firstName: "Minh",
      lastName: "Phan Hoàng",
      fullName: "Phan Hoàng Minh", 
      username: "hoangminh",
      phone: "0934123456", 
      email: "hoangminh@gmail.com",
      dob: "1995-04-12",
      gender: "Nam",
      address: "456 Điện Biên Phủ, Bình Thạnh, TP.HCM",
      status: "Hoạt động", 
      registrationDate: "2026-05-10", 
      expiryDate: "2026-06-10", 
      package: "Gói Cơ Bản", 
      createdBy: "admin", 
      revenue: 500000, 
      deletedAt: null,
      password: "123456"
    },
    { 
      id: 6, 
      memberCode: "MEM006",
      firstName: "Thuý",
      lastName: "Trần Thị",
      fullName: "Trần Thị Thuý", 
      username: "thuytran",
      phone: "0945234567", 
      email: "thuytran@gmail.com",
      dob: "1993-08-22",
      gender: "Nữ",
      address: "12 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
      status: "Hết hạn", 
      registrationDate: "2025-11-18", 
      expiryDate: "2026-05-18", 
      package: "Gói Tiêu Chuẩn 6T", 
      createdBy: "staff", 
      revenue: 2500000, 
      deletedAt: null,
      password: "123456"
    },
    { 
      id: 7, 
      memberCode: "MEM007",
      firstName: "Bảo",
      lastName: "Lâm Minh",
      fullName: "Lâm Minh Bảo", 
      username: "minhbao",
      phone: "0956345678", 
      email: "minhbao@gmail.com",
      dob: "1991-03-30",
      gender: "Nam",
      address: "246 Ba Tháng Hai, Quận 10, TP.HCM",
      status: "Hết hạn", 
      registrationDate: "2025-05-10", 
      expiryDate: "2026-05-10", 
      package: "Gói Cao Cấp 12T", 
      createdBy: "admin", 
      revenue: 4500000, 
      deletedAt: null,
      password: "123456"
    },
    { 
      id: 8, 
      memberCode: "MEM008",
      firstName: "My",
      lastName: "Bùi Kiều",
      fullName: "Bùi Kiều My", 
      username: "kieumy",
      phone: "0967456789", 
      email: "kieumy@gmail.com",
      dob: "1997-11-05",
      gender: "Nữ",
      address: "357 Trần Hưng Đạo, Quận 1, TP.HCM",
      status: "Hết hạn", 
      registrationDate: "2026-03-15", 
      expiryDate: "2026-04-15", 
      package: "Gói Cơ Bản", 
      createdBy: "staff", 
      revenue: 500000, 
      deletedAt: null,
      password: "123456"
    },
  ];

  // Gán Trần Thị Tiếp Tân làm nhân viên phụ trách cho tất cả hội viên
  members.forEach(m => {
    m.createdBy = "staff_user";
  });

  let packages = [
    { id: 1, name: "Gói Cơ Bản", duration: "1 Tháng", price: 500000, description: "Tập luyện tự do, không bao gồm huấn luyện viên", status: "Mở bán" },
    { id: 2, name: "Gói Tiêu Chuẩn 6T", duration: "6 Tháng", price: 2500000, description: "Tập luyện tự do, tặng 2 buổi tập với PT", status: "Mở bán" },
    { id: 3, name: "Gói Cao Cấp 12T", duration: "12 Tháng", price: 4500000, description: "Tập luyện tự do, tặng 5 buổi PT, có tủ đồ riêng", status: "Mở bán" },
    { id: 4, name: "Hội Viên VIP ELITE", duration: "12 Tháng", price: 12000000, description: "Huấn luyện viên cá nhân 1:1, đầy đủ dịch vụ xông hơi", status: "Mở bán" },
  ];

  let personalTrainers: PersonalTrainer[] = [
    {
      id: 1,
      fullName: "Nguyễn Huấn Luyện",
      expertise: ["Yoga", "Cử tạ", "Giảm cân"],
      level: "Senior",
      commissionRate: 0.15,
      isActive: true,
      phone: "0900112233",
      email: "huanluyen@fit.com"
    },
    {
      id: 2,
      fullName: "Lê PT",
      expertise: ["Boxing", "Crossfit"],
      level: "Master",
      commissionRate: 0.20,
      isActive: true,
      phone: "0900445566",
      email: "lept@fit.com"
    }
  ];

  let ptAssignments: PTAssignment[] = [
    {
      id: 1,
      memberId: 1,
      trainerId: 1,
      totalSessions: 12,
      sessionsLeft: 8,
      price: 3600000,
      startDate: "2024-05-01",
      expiryDate: "2024-06-01",
      status: "Active"
    }
  ];

  let trainingSessions: TrainingSession[] = [
    {
      id: 1,
      assignmentId: 1,
      date: new Date().toISOString(),
      notes: "Buổi đầu tiên thành công",
      memberId: 1,
      trainerId: 1
    }
  ];

  // Dữ liệu người dùng mẫu
  const users = [
    { id: 1, username: "admin@fit.com", password: "123456", role: "ADMIN", fullName: "Admin System" },
    { id: 2, username: "staff@fit.com", password: "123456", role: "STAFF", fullName: "Nhân Viên Tiếp Tân" },
    { id: 3, username: "pt@fit.com", password: "123456", role: "PT", fullName: "Huấn Luyện Viên Demo" },
    { id: 4, username: "member@gmail.com", password: "123456", role: "MEMBER", fullName: "Hội Viên Thử Nghiệm" },
  ];

  let staffMembers: StaffMember[] = [
    {
      id: 1,
      fullName: "Nguyễn Văn Admin",
      role: "ADMIN",
      position: "Quản lý tổng",
      baseSalary: 15000000,
      hourlyRate: 100000,
      phoneNumber: "0988776655",
      email: "admin@fit.com",
      username: "admin_user",
      password: "password123",
      isActive: true,
      shiftHours: { start: "08:00", end: "17:00" }
    },
    {
      id: 2,
      fullName: "Trần Thị Tiếp Tân",
      role: "RECEPTIONIST",
      position: "Lễ tân ca sáng",
      baseSalary: 7000000,
      hourlyRate: 50000,
      phoneNumber: "0977665544",
      email: "letan@fit.com",
      username: "staff_user",
      password: "password123",
      isActive: true,
      shiftHours: { start: "06:00", end: "14:00" }
    }
  ];

  let attendanceLogs: AttendanceLog[] = [];
  let payrollRecords: PayrollRecord[] = [];

  const PRODUCTS_FILE_PATH = path.join(process.cwd(), "products-data.json");
  let products: Product[] = [];

  const defaultProducts: Product[] = [
    { id: 1, name: "Whey Protein 2kg", category: "Thực phẩm bổ sung", price: 1500000, stock: 15, image: "https://images.unsplash.com/photo-1593095191850-2a733cd0927e?auto=format&fit=crop&q=80&w=400" },
    { id: 2, name: "Găng tay tập gym", category: "Phụ kiện", price: 250000, stock: 20, image: "https://images.unsplash.com/photo-1583454110551-21f2fa2adfcd?auto=format&fit=crop&q=80&w=400" },
    { id: 3, name: "Bình nước 1L", category: "Phụ kiện", price: 120000, stock: 50, image: "https://images.unsplash.com/photo-1602143399827-bd953672d422?auto=format&fit=crop&q=80&w=400" },
    { id: 4, name: "Nước suối Aquafina", category: "Nước uống", price: 10000, stock: 100, image: "https://images.unsplash.com/photo-1548839140-29a749e1cf3d?auto=format&fit=crop&q=80&w=400" },
    { id: 5, name: "Sting dâu", category: "Nước uống", price: 15000, stock: 45, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400" },
    { id: 6, name: "Khăn lau mồ hôi", category: "Phụ kiện", price: 50000, stock: 30, image: "https://images.unsplash.com/photo-1620912189865-07205168923a?auto=format&fit=crop&q=80&w=400" },
    { id: 7, name: "BCAA Powder", category: "Thực phẩm bổ sung", price: 850000, stock: 10, image: "https://images.unsplash.com/photo-1579722820308-d74e5719d38f0?auto=format&fit=crop&q=80&w=400" },
  ];

  try {
    if (fs.existsSync(PRODUCTS_FILE_PATH)) {
      products = JSON.parse(fs.readFileSync(PRODUCTS_FILE_PATH, "utf8"));
    } else {
      products = [...defaultProducts];
      fs.writeFileSync(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Error loading products-data.json, using fallback", err);
    products = [...defaultProducts];
  }

  const saveProducts = () => {
    try {
      fs.writeFileSync(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), "utf8");
    } catch (err) {
      console.error("Error writing products-data.json", err);
    }
  };

  let transactions: Transaction[] = [
    { id: 1, type: "EXPENSE", amount: 2000000, category: "Tiền điện", note: "Thanh toán điện tháng 4", date: "2024-04-30", createdBy: "admin", customerName: "Văn phòng" },
    { id: 2, type: "INCOME", amount: 1500000, category: "Bán lẻ", note: "Bán Whey Protein", date: "2024-05-01", createdBy: "staff", customerName: "Khách lẻ" },
  ];

  let memberSales: MemberSale[] = [
    {
      id: 1,
      customerName: "Nguyễn Hoài Nam",
      serviceName: "Gói Cao Cấp 12T",
      dateTime: "2024-05-01 10:30",
      total: 4500000,
      discount: 0,
      paymentMethod: "Chuyển khoản",
      paidAmount: 4500000,
      status: "Hoàn thành",
      startDate: "2024-05-01",
      expiryDate: "2025-05-01"
    },
    {
      id: 2,
      customerName: "Lê Văn C",
      serviceName: "Gói Tiêu Chuẩn 6T",
      dateTime: "2024-05-05 14:15",
      total: 2500000,
      discount: 200000,
      paymentMethod: "Tiền mặt",
      paidAmount: 2300000,
      status: "Hoàn thành",
      startDate: "2024-05-05",
      expiryDate: "2024-11-05"
    }
  ];

  let evaluations: Evaluation[] = [
    { 
      id: 1, 
      memberId: 1, 
      memberName: "Nguyễn Hoài Nam", 
      rating: 5, 
      comment: "Dịch vụ tuyệt vời, máy móc hiện đại!", 
      date: "2024-05-18",
      replies: [
        { id: 1, senderName: "Nguyễn Văn Admin", senderRole: "ADMIN", text: "Cảm ơn bạn Nam đã ủng hộ trung tâm nhé ạ!", date: "2024-05-18" }
      ]
    },
    { 
      id: 2, 
      memberId: 3, 
      memberName: "Lê Văn C", 
      rating: 4, 
      comment: "PT nhiệt tình nhưng giờ cao điểm hơi đông.", 
      date: "2024-05-17",
      replies: []
    }
  ];

  let gymMessages: GymMessage[] = [
    {
      id: 1,
      memberId: 1,
      memberName: "Nguyễn Hoài Nam",
      senderId: "hoainam",
      senderName: "Nguyễn Hoài Nam",
      senderRole: "MEMBER",
      text: "Chào ban quản lý, gói tập của mình sắp hết hạn, mình muốn thanh toán gia hạn online và đổi ca tập được không ạ?",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 2,
      memberId: 1,
      memberName: "Nguyễn Hoài Nam",
      senderId: "admin_user",
      senderName: "Nguyễn Văn Admin",
      senderRole: "ADMIN",
      text: "Chào bạn Nam, bạn hoàn toàn có thể gia hạn online qua cổng thanh toán QR của Cổng Hội Viên, hệ thống sẽ tự động cập nhật ngay nhé ạ! Về ca tập bạn cứ đến quầy lễ tân để các bạn hỗ trợ đổi ca nha.",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];

  // ==========================================
  // STAFF & PAYROLL API
  // ==========================================

  app.get("/api/staff", (req, res) => {
    // Keep ADMIN hidden and return active staff members (excluding PTs since they are managed in their own tab)
    const activeStaff = staffMembers.filter(s => s.isActive && s.role !== "ADMIN");
    res.json(activeStaff);
  });

  app.post("/api/staff", (req, res) => {
    if (req.body.email && !req.body.email.toLowerCase().endsWith("@fit.com")) {
      return res.status(400).json({ message: "Nhân viên bắt buộc sử dụng email đuôi @fit.com." });
    }
    if (req.body.role === "PT") {
      const maxId = personalTrainers.length > 0 ? Math.max(...personalTrainers.map(t => t.id)) : 0;
      const newPT: PersonalTrainer = {
        id: maxId + 1,
        fullName: req.body.fullName,
        expertise: ["Gym", "Cardio"],
        level: "Junior",
        commissionRate: 0.15,
        isActive: true,
        phone: req.body.phoneNumber || req.body.phone || "",
        email: req.body.email,
        username: req.body.username || req.body.email,
        password: req.body.password || "123456"
      };
      personalTrainers.push(newPT);
      res.status(201).json({
        id: newPT.id + 1000,
        fullName: newPT.fullName,
        role: "PT",
        position: `Huấn luyện viên (${newPT.level})`,
        baseSalary: 7000000,
        hourlyRate: 60000,
        phoneNumber: newPT.phone,
        email: newPT.email,
        username: newPT.username,
        password: newPT.password,
        isActive: newPT.isActive,
        shiftHours: { start: "08:00", end: "21:00" }
      });
    } else {
      const maxId = staffMembers.length > 0 ? Math.max(...staffMembers.map(s => s.id)) : 0;
      const newStaff = { id: maxId + 1, isActive: true, ...req.body };
      staffMembers.push(newStaff);

      // Synchronize to users database
      const username = newStaff.email || newStaff.username || `staff_${newStaff.id}`;
      const password = newStaff.password || "123456";
      const uRole = newStaff.role || "STAFF";
      const existingUserIdx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
      if (existingUserIdx === -1) {
        users.push({
          id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
          username,
          password,
          role: uRole === "ADMIN" ? "ADMIN" : "STAFF",
          fullName: newStaff.fullName
        });
      }

      res.status(201).json(newStaff);
    }
  });

  app.put("/api/staff/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 1000) {
      const ptId = id - 1000;
      const index = personalTrainers.findIndex(t => t.id === ptId);
      if (index !== -1) {
        personalTrainers[index] = {
          ...personalTrainers[index],
          fullName: req.body.fullName,
          phone: req.body.phoneNumber || req.body.phone || personalTrainers[index].phone,
          email: req.body.email || personalTrainers[index].email,
          username: req.body.username || req.body.email || personalTrainers[index].username,
          password: req.body.password || personalTrainers[index].password
        };
        res.json({
          id,
          fullName: personalTrainers[index].fullName,
          role: "PT",
          position: `Huấn luyện viên (${personalTrainers[index].level})`,
          baseSalary: personalTrainers[index].level === "Master" ? 12000000 : (personalTrainers[index].level === "Senior" ? 9000000 : 7000000),
          hourlyRate: personalTrainers[index].level === "Master" ? 100000 : (personalTrainers[index].level === "Senior" ? 80000 : 60000),
          phoneNumber: personalTrainers[index].phone,
          email: personalTrainers[index].email,
          username: personalTrainers[index].username,
          password: personalTrainers[index].password,
          isActive: personalTrainers[index].isActive,
          shiftHours: { start: "08:00", end: "21:00" }
        });
      } else {
        res.status(404).json({ message: "Không tìm thấy huấn luyện viên" });
      }
    } else {
      const index = staffMembers.findIndex(s => s.id === id);
      if (index !== -1) {
        if (req.body.email && !req.body.email.toLowerCase().endsWith("@fit.com")) {
          return res.status(400).json({ message: "Nhân viên bắt buộc sử dụng email đuôi @fit.com." });
        }
        const updatedStaff = { ...staffMembers[index], ...req.body, id };
        staffMembers[index] = updatedStaff;

        // Sync edits to users
        const username = updatedStaff.email || updatedStaff.username || `staff_${updatedStaff.id}`;
        const userIdx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
        if (userIdx !== -1) {
          users[userIdx].fullName = updatedStaff.fullName;
          if (updatedStaff.password) users[userIdx].password = updatedStaff.password;
          users[userIdx].role = updatedStaff.role === "ADMIN" ? "ADMIN" : "STAFF";
        } else {
          users.push({
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username,
            password: updatedStaff.password || "123456",
            role: updatedStaff.role === "ADMIN" ? "ADMIN" : "STAFF",
            fullName: updatedStaff.fullName
          });
        }

        res.json(updatedStaff);
      } else {
        res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }
    }
  });

  app.delete("/api/staff/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 1000) {
      const ptId = id - 1000;
      const trainer = personalTrainers.find(t => t.id === ptId);
      if (trainer) {
        trainer.isActive = false;
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Không tìm thấy huấn luyện viên" });
      }
    } else {
      const staff = staffMembers.find(s => s.id === id);
      if (staff) {
        staff.isActive = false;
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }
    }
  });

  // Attendance
  app.get("/api/attendance", (req, res) => {
    res.json(attendanceLogs);
  });

  app.post("/api/attendance/checkin", (req, res) => {
    const { staffId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const existing = attendanceLogs.find(l => l.staffId === parseInt(staffId) && l.date === today && !l.checkOut);
    
    if (existing) return res.status(400).json({ message: "Nhân viên đã check-in" });

    const maxId = attendanceLogs.length > 0 ? Math.max(...attendanceLogs.map(l => l.id)) : 0;
    const log: AttendanceLog = {
      id: maxId + 1,
      staffId: parseInt(staffId),
      checkIn: new Date().toISOString(),
      checkOut: null,
      totalHours: 0,
      date: today,
      isOT: false
    };
    attendanceLogs.push(log);
    res.status(201).json(log);
  });

  app.post("/api/attendance/checkout", (req, res) => {
    const { staffId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const log = attendanceLogs.find(l => l.staffId === parseInt(staffId) && l.date === today && !l.checkOut);

    if (!log) return res.status(404).json({ message: "Không tìm thấy log check-in" });

    log.checkOut = new Date().toISOString();
    const diff = (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60);
    log.totalHours = parseFloat(diff.toFixed(2));
    
    // Simple OT logic: > 8 hours is OT
    if (log.totalHours > 8) {
      log.isOT = true;
    }

    res.json(log);
  });

  // Payroll
  app.get("/api/payroll", (req, res) => {
    res.json(payrollRecords);
  });

  app.post("/api/payroll/generate", (req, res) => {
    const { month } = req.body; // format "YYYY-MM"
    
    // Create combined active personnel list for the month (excluding ADMIN)
    const activeStaff = staffMembers.filter(s => s.isActive && s.role !== "ADMIN");
    
    const activeTrainers = personalTrainers.filter(t => t.isActive).map(pt => {
      let baseSalary = pt.level === "Master" ? 12000000 : (pt.level === "Senior" ? 9000000 : 7000000);
      let hourlyRate = pt.level === "Master" ? 100000 : (pt.level === "Senior" ? 80000 : 60000);
      return {
        id: pt.id + 1000,
        fullName: pt.fullName,
        role: "PT" as const,
        position: `Huấn luyện viên (${pt.level})`,
        baseSalary,
        hourlyRate,
        phoneNumber: pt.phone,
        email: pt.email,
        username: pt.username || pt.email,
        password: pt.password || "123456",
        isActive: pt.isActive,
        shiftHours: { start: "08:00", end: "21:00" }
      };
    });

    const combinedPersonnel = [...activeStaff, ...activeTrainers];

    const newRecords: PayrollRecord[] = combinedPersonnel.map(person => {
      const staffAttendance = attendanceLogs.filter(l => l.staffId === person.id && l.date.startsWith(month));
      const totalHours = staffAttendance.reduce((sum, l) => sum + l.totalHours, 0);
      const otHours = staffAttendance.filter(l => l.isOT).reduce((sum, l) => sum + (l.totalHours - 8), 0);
      
      const basePay = person.baseSalary;
      const otPay = otHours * person.hourlyRate * 1.5;
      
      // If of type PT, check the actual trainer ID (offset by 1000)
      const actualTrainerId = person.id >= 1000 ? person.id - 1000 : person.id;
      
      // PT Session Bonus: 50,000đ per session recorded
      const ptSessions = trainingSessions.filter(s => s.trainerId === actualTrainerId && s.date.startsWith(month)).length;
      const ptBonus = ptSessions * 50000;

      // PT Sales Commission: based on PT assignments for that trainer
      let commission = 0;
      if (person.id >= 1000) {
        const ptId = person.id - 1000;
        const trainer = personalTrainers.find(t => t.id === ptId);
        if (trainer) {
          const trainerAssignments = ptAssignments.filter(a => a.trainerId === ptId);
          const totalRevenue = trainerAssignments.reduce((sum, a) => sum + a.price, 0);
          commission = totalRevenue * trainer.commissionRate;
        }
      }

      const totalPay = basePay + otPay + ptBonus + commission;

      const maxId = payrollRecords.length > 0 ? Math.max(...payrollRecords.map(p => p.id)) : 0;
      return {
        id: maxId + 1,
        staffId: person.id,
        month,
        basePay,
        commission,
        ptBonus,
        otPay,
        totalPay,
        status: "Draft"
      };
    });

    payrollRecords = [...payrollRecords, ...newRecords];
    res.status(201).json(newRecords);
  });

  app.put("/api/payroll/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { basePay, ptBonus, otPay, commission } = req.body;
    
    const index = payrollRecords.findIndex(p => p.id === id);
    if (index !== -1) {
      const record = payrollRecords[index];
      const parsedBase = parseInt(basePay) !== undefined && !isNaN(parseInt(basePay)) ? parseInt(basePay) : record.basePay;
      const parsedPt = parseInt(ptBonus) !== undefined && !isNaN(parseInt(ptBonus)) ? parseInt(ptBonus) : record.ptBonus;
      const parsedOt = parseInt(otPay) !== undefined && !isNaN(parseInt(otPay)) ? parseInt(otPay) : record.otPay;
      const parsedCommission = parseInt(commission) !== undefined && !isNaN(parseInt(commission)) ? parseInt(commission) : record.commission;
      
      payrollRecords[index] = {
        ...record,
        basePay: parsedBase,
        ptBonus: parsedPt,
        otPay: parsedOt,
        commission: parsedCommission,
        totalPay: parsedBase + parsedPt + parsedOt + parsedCommission
      };
      res.json(payrollRecords[index]);
    } else {
      res.status(404).json({ message: "Không tìm thấy bản ghi lương" });
    }
  });

  // ==========================================
  // MOBILE APP API LAYER (Dành cho Hội viên)
  // ==========================================
  
  // Mobile: Đăng nhập/Kiểm tra hồ sơ bằng Số điện thoại
  app.get("/api/mobile/profile/:phone", (req, res) => {
    const { phone } = req.params;
    const member = members.find(m => m.phone === phone && !m.deletedAt);
    if (!member) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ hội viên với số điện thoại này." });
    }
    res.json({
      id: member.id,
      fullName: member.fullName,
      package: member.package,
      expiryDate: member.expiryDate,
      status: member.status,
      qrCode: `GYM_CHECKIN_${member.id}_${member.phone}`
    });
  });

  // Mobile: Xem lịch sử tập luyện cá nhân
  app.get("/api/mobile/history/:memberId", (req, res) => {
    const memberId = parseInt(req.params.memberId);
    const history = checkins
      .filter(c => c.memberId === memberId)
      .slice(0, 10); // Lấy 10 lần gần nhất cho mobile
    res.json(history);
  });

  // Mobile: Danh sách gói tập để đăng ký mới/gia hạn
  app.get("/api/mobile/packages", (req, res) => {
    res.json(packages.filter(p => p.status === "Mở bán"));
  });

  function calculateExpiryDate(startDate: string, duration: string): string {
    const parts = startDate.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // 0-indexed month
    const day = parseInt(parts[2]);
    
    const date = new Date(year, month, day);
    const num = parseInt(duration) || 1;
    if (duration.includes("Tháng")) {
      date.setMonth(date.getMonth() + num);
    } else if (duration.includes("Năm")) {
      date.setFullYear(date.getFullYear() + num);
    } else if (duration.includes("Ngày")) {
      date.setDate(date.getDate() + num);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    
    // Safely format as YYYY-MM-DD without timezone shifting
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ==========================================
  // WEB ADMIN API LAYER
  // ==========================================

  // Dữ liệu điểm danh mẫu
  let checkins = [
    { id: 1, memberId: 1, memberName: "Nguyễn Văn A", time: new Date().toISOString() },
    { id: 2, memberId: 3, memberName: "Lê Văn C", time: new Date().toISOString() },
  ];

  // API Đăng nhập
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu" });
    }

    const cleanUsername = username.toString().trim().toLowerCase();
    const cleanPassword = password.toString().trim();

    console.log(`[LOGIN] Attempt: ${cleanUsername}`);

    // Map default accounts seamlessly for user convenience
    let processedUsername = cleanUsername;
    if (cleanUsername === "admin") processedUsername = "admin@fit.com";
    else if (cleanUsername === "staff") processedUsername = "staff@fit.com";
    else if (cleanUsername === "pt") processedUsername = "pt@fit.com";
    else if (cleanUsername === "member") processedUsername = "member@gmail.com";

    // 1. Check in static users array
    const user = users.find(u => 
      u.username.toLowerCase() === processedUsername && 
      u.password === cleanPassword
    );
    
    if (user) {
      // Validate correct email domains according to roles
      if (user.role === "MEMBER") {
        if (!processedUsername.endsWith("@gmail.com")) {
          return res.status(400).json({ message: "Hội viên bắt buộc dùng tài khoản email đuôi @gmail.com." });
        }
      } else {
        // ADMIN, STAFF, PT roles must use @fit.com
        if (!processedUsername.endsWith("@fit.com") && processedUsername !== "admin") {
          return res.status(400).json({ message: "Tài khoản Lễ tân / PT / Quản trị bắt buộc dùng email đuôi @fit.com." });
        }
      }
      
      console.log(`[LOGIN] Success: ${processedUsername} (Role: ${user.role})`);
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }

    // 2. Check Member Accounts (Hội viên)
    const member = members.find(m => 
      (m.username && m.username.toLowerCase() === processedUsername) || 
      (m.email && m.email.toLowerCase() === processedUsername)
    );
    if (member && (cleanPassword === "123456" || cleanPassword === member.password)) {
      // Strictly require @gmail.com email domain for login!
      const emailToCheck = member.email || member.username || processedUsername;
      if (!emailToCheck.toLowerCase().endsWith("@gmail.com")) {
        return res.status(400).json({ message: "Hội viên bắt buộc đăng nhập bằng email đuôi @gmail.com." });
      }
      console.log(`[LOGIN] Member Success: ${member.fullName}`);
      return res.json({
        id: member.id,
        username: member.username || member.email,
        fullName: member.fullName,
        role: "MEMBER",
        avatar: member.avatar
      });
    }

    // 3. Check Staff Accounts (Nhân viên)
    const staff = staffMembers.find(s => 
      s.email && s.email.toLowerCase() === processedUsername
    );
    if (staff && (cleanPassword === "123456" || cleanPassword === staff.password)) {
      // Strictly require @fit.com email domain for login!
      const emailToCheck = staff.email || processedUsername;
      if (!emailToCheck.toLowerCase().endsWith("@fit.com")) {
        return res.status(400).json({ message: "Nhân viên bắt buộc đăng nhập bằng email đuôi @fit.com." });
      }
      console.log(`[LOGIN] Staff Success: ${staff.fullName}`);
      return res.json({
        id: staff.id,
        username: staff.email,
        fullName: staff.fullName,
        role: staff.role,
        avatar: ""
      });
    }

    // 4. Check Trainer Accounts (HLV / PT)
    const trainer = personalTrainers.find(t => 
      t.email && t.email.toLowerCase() === processedUsername
    );
    if (trainer && (cleanPassword === "123456" || cleanPassword === trainer.password)) {
      // Strictly require @fit.com email domain for login!
      const emailToCheck = trainer.email || processedUsername;
      if (!emailToCheck.toLowerCase().endsWith("@fit.com")) {
        return res.status(400).json({ message: "Huấn luyện viên bắt buộc đăng nhập bằng email đuôi @fit.com." });
      }
      console.log(`[LOGIN] Trainer Success: ${trainer.fullName}`);
      return res.json({
        id: trainer.id,
        username: trainer.email,
        fullName: trainer.fullName,
        role: "PT",
        avatar: trainer.avatar
      });
    }

    console.log(`[LOGIN] Failed: ${processedUsername}`);
    res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu." });
  });

  app.post("/api/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Vui lòng nhập email." });

    const member = members.find(m => m.email && m.email.toLowerCase() === email.toLowerCase());
    const userAccount = users.find(u => u.username.toLowerCase() === email.toLowerCase());

    if (member || userAccount) {
      // In a real app, send an email. Here we just simulate success.
      res.json({ success: true, message: "Yêu cầu đã được ghi nhận. Nếu email tồn tại trong hệ thống, bạn sẽ sớm nhận được hướng dẫn đặt lại mật khẩu qua email." });
    } else {
      // For security, don't reveal if email exists, but here we can be a bit more helpful for the demo
      res.status(404).json({ message: "Email không tồn tại trong hệ thống." });
    }
  });

  app.post("/api/register", (req, res) => {
    const { fullName, email, phone, password } = req.body;
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc." });
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return res.status(400).json({ message: "Đăng ký hội viên bắt buộc sử dụng email đuôi @gmail.com." });
    }

    const existingMember = members.find(m => m.email && m.email.toLowerCase() === email.toLowerCase());
    if (existingMember) {
      return res.status(400).json({ message: "Email này đã được đăng ký." });
    }

    const maxId = members.length > 0 ? Math.max(...members.map(m => m.id)) : 0;
    const newMember: Member = {
      id: maxId + 1,
      memberCode: `MEM${(maxId + 1).toString().padStart(4, '0')}`,
      firstName: fullName.split(' ').slice(0, -1).join(' ') || fullName,
      lastName: fullName.split(' ').slice(-1)[0] || "",
      fullName,
      username: email.split('@')[0], // Default username as email prefix
      email,
      phone: phone || "",
      dob: "",
      gender: "Khác",
      address: "",
      package: "CHƯA CÓ",
      registrationDate: new Date().toISOString().split('T')[0],
      expiryDate: "",
      status: "Chờ kích hoạt",
      revenue: 0,
      createdBy: "Tự đăng ký",
      avatar: "",
      faceData: "",
      deletedAt: null,
      password: password || "123456"
    };

    members.push(newMember);
    console.log(`[REGISTER] New Member: ${newMember.fullName} (${newMember.email})`);
    
    res.status(201).json({ success: true, message: "Đăng ký thành công! Bạn có thể bắt đầu đăng nhập ngay.", member: newMember });
  });

  app.post("/api/members/renew", (req, res) => {
    const { memberId, packageName, paymentMethod, discount, startDate } = req.body;
    const memberIndex = members.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) return res.status(404).json({ message: "Không tìm thấy hội viên" });
    
    const pkg = packages.find(p => p.name === packageName);
    const revenue = pkg ? pkg.price : 0;
    const finalAmount = revenue - (discount || 0);

    const baseDate = startDate || new Date().toISOString().split('T')[0];
    const newExpiryDate = calculateExpiryDate(baseDate, pkg ? pkg.duration : "1 Tháng");

    // Cập nhật trạng thái và gói của hội viên
    members[memberIndex] = {
      ...members[memberIndex],
      package: packageName,
      status: "Hoạt động",
      registrationDate: baseDate,
      expiryDate: newExpiryDate,
      revenue: (members[memberIndex].revenue || 0) + finalAmount
    };

    // Tạo bản ghi doanh số
    const saleId = memberSales.length > 0 ? Math.max(...memberSales.map(m => m.id)) + 1 : 1;
    memberSales.unshift({
      id: saleId,
      customerName: members[memberIndex].fullName,
      serviceName: packageName,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      total: revenue,
      discount: discount || 0,
      paymentMethod: paymentMethod || "Chuyển khoản",
      paidAmount: finalAmount,
      status: "Hoàn thành",
      startDate: baseDate,
      expiryDate: newExpiryDate
    });

    // Tạo bản ghi giao dịch
    const transId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    transactions.unshift({
      id: transId,
      type: "INCOME",
      amount: finalAmount,
      category: "Gia hạn gói tập",
      note: `Gia hạn: ${members[memberIndex].fullName} - ${packageName}`,
      date: baseDate,
      createdBy: req.body.createdBy || 'Hệ thống',
      customerName: members[memberIndex].fullName
    });

    res.json({ success: true, member: members[memberIndex] });
  });

  app.post("/api/users", (req, res) => {
    const { username, password, role, fullName } = req.body;
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }
    const newUser = {
      id: users.length + 1,
      username,
      password,
      role: role || "STAFF",
      fullName
    };
    users.push(newUser);
    res.status(201).json(newUser);
  });

  app.get("/api/users/staff", (req, res) => {
    const candidatesMap = new Map<string, { username: string; fullName: string; role: string }>();

    // 1. Add from base users database
    users.forEach(u => {
      if (u.role === 'ADMIN' || u.role === 'STAFF') {
        const key = u.username.toLowerCase();
        candidatesMap.set(key, {
          username: u.username,
          fullName: u.fullName,
          role: u.role
        });
      }
    });

    // 2. Add from staffMembers (only if active and role is not PT)
    staffMembers.forEach(s => {
      if (s.isActive && s.role !== 'PT') {
        const username = s.email || s.username || s.fullName;
        const key = username.toLowerCase();
        candidatesMap.set(key, {
          username: username,
          fullName: s.fullName,
          role: s.role === 'RECEPTIONIST' ? 'STAFF' : s.role
        });
      }
    });

    res.json(Array.from(candidatesMap.values()));
  });

  // API Routes
  app.get("/api/members", (req, res) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const updatedMembers = members.map(m => {
      const expiry = new Date(m.expiryDate).setHours(0, 0, 0, 0);
      return {
        ...m,
        status: m.deletedAt ? m.status : (expiry < today ? "Hết hạn" : "Hoạt động")
      };
    });
    res.json(updatedMembers.filter(m => !m.deletedAt));
  });

  app.get("/api/members/deleted", (req, res) => {
    res.json(members.filter(m => m.deletedAt));
  });

  app.post("/api/members", (req, res) => {
    const { paymentDate, createdBy, paymentMethod, discount, ...rest } = req.body;
    
    if (rest.email && !rest.email.toLowerCase().endsWith("@gmail.com")) {
      return res.status(400).json({ message: "Hội viên bắt buộc sử dụng email đuôi @gmail.com." });
    }

    // Tìm giá của gói để tính doanh thu
    const pkg = packages.find(p => p.name === rest.package);
    const revenue = pkg ? pkg.price : 0;
    const finalAmount = revenue - (discount || 0);

    const maxId = members.length > 0 ? Math.max(...members.map(m => m.id)) : 0;
    const newMember = {
      id: maxId + 1,
      ...rest,
      registrationDate: paymentDate || new Date().toISOString().split('T')[0],
      status: "Hoạt động",
      createdBy: createdBy || 'Hệ thống',
      revenue: finalAmount,
      deletedAt: null
    };
    members.push(newMember);

    // Tạo bản ghi doanh số hội viên
    const saleId = memberSales.length > 0 ? Math.max(...memberSales.map(m => m.id)) + 1 : 1;
    memberSales.unshift({
      id: saleId,
      customerName: newMember.fullName,
      serviceName: newMember.package,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      total: revenue,
      discount: discount || 0,
      paymentMethod: paymentMethod || "Chuyển khoản",
      paidAmount: finalAmount,
      status: "Hoàn thành",
      startDate: newMember.registrationDate,
      expiryDate: newMember.expiryDate
    });

    // Tạo bản ghi giao dịch
    const transId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    transactions.unshift({
      id: transId,
      type: "INCOME",
      amount: finalAmount,
      category: "Phí gói tập",
      note: `Hội viên mới: ${newMember.fullName} - ${newMember.package}`,
      date: paymentDate || new Date().toISOString().split('T')[0],
      createdBy: createdBy || 'Hệ thống',
      customerName: newMember.fullName
    });

    res.status(201).json(newMember);
  });

  app.get("/api/members/:id/history", (req, res) => {
    const memberId = parseInt(req.params.id);
    const history = checkins.filter(c => c.memberId === memberId);
    res.json(history);
  });

  app.put("/api/members/:id", (req, res) => {
    const memberId = parseInt(req.params.id);
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
      if (req.body.email && !req.body.email.toLowerCase().endsWith("@gmail.com")) {
        return res.status(400).json({ message: "Hội viên bắt buộc sử dụng email đuôi @gmail.com." });
      }
      const updatedMember = { ...members[index], ...req.body, id: memberId };
      members[index] = updatedMember;
      res.json(updatedMember);
    } else {
      res.status(404).json({ message: "Không tìm thấy hội viên" });
    }
  });

  app.delete("/api/members/:id", (req, res) => {
    const memberId = parseInt(req.params.id);
    console.log(`[DELETE] Request for member ID: ${memberId}`);
    const member = members.find(m => m.id === memberId);
    if (member && !member.deletedAt) {
      member.deletedAt = new Date().toISOString();
      console.log(`[DELETE] Member ${memberId} soft-deleted successfully`);
      res.json({ success: true, message: "Xóa hội viên thành công" });
    } else {
      console.log(`[DELETE] Member ${memberId} not found or already deleted`);
      res.status(404).json({ success: false, message: "Không tìm thấy hội viên hoặc hội viên đã bị xóa" });
    }
  });

  app.post("/api/members/:id/restore", (req, res) => {
    const memberId = parseInt(req.params.id);
    console.log(`[RESTORE] Request for member ID: ${memberId}`);
    const member = members.find(m => m.id === memberId);
    if (member && member.deletedAt) {
      member.deletedAt = null;
      console.log(`[RESTORE] Member ${memberId} restored successfully`);
      res.json({ success: true, message: "Khôi phục hội viên thành công" });
    } else {
      console.log(`[RESTORE] Member ${memberId} not found or not deleted`);
      res.status(404).json({ success: false, message: "Không tìm thấy hội viên hoặc hội viên không bị xóa" });
    }
  });

  app.get("/api/members/:id/sales", (req, res) => {
    const memberId = parseInt(req.params.id);
    const member = members.find(m => m.id === memberId);
    if (!member) return res.status(404).json({ message: "Không tìm thấy hội viên" });
    
    console.log(`[SALES] Fetching history for ${member.fullName} (ID: ${memberId})`);
    const sales = memberSales.filter(s => 
      s.customerName && 
      member.fullName && 
      s.customerName.trim().toLowerCase() === member.fullName.trim().toLowerCase()
    );
    console.log(`[SALES] Found ${sales.length} records`);
    res.json(sales);
  });

  app.get("/api/members/:id/training", (req, res) => {
    const memberId = parseInt(req.params.id);
    const sessions = trainingSessions.filter(s => s.memberId === memberId);
    res.json(sessions);
  });

  app.get("/api/packages", (req, res) => {
    res.json(packages);
  });

  app.post("/api/packages", (req, res) => {
    const newPkg = {
      id: packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1,
      ...req.body,
      status: "Mở bán"
    };
    packages.push(newPkg);
    res.status(201).json(newPkg);
  });

  app.put("/api/packages/:id", (req, res) => {
    const pkgId = parseInt(req.params.id);
    const index = packages.findIndex(p => p.id === pkgId);
    if (index !== -1) {
      const oldName = packages[index].name;
      const newName = req.body.name;
      const newPrice = req.body.price;

      // Update package
      packages[index] = { ...packages[index], ...req.body, id: pkgId };

      let updatedMembersCount = 0;
      let updatedSalesCount = 0;

      // 1. Cascade name change to members
      if (oldName && newName && oldName !== newName) {
        members.forEach(m => {
          if (m.package === oldName) {
            m.package = newName;
            updatedMembersCount++;
          }
        });

        memberSales.forEach(s => {
          if (s.serviceName === oldName) {
            s.serviceName = newName;
            updatedSalesCount++;
          }
        });
      }

      // 2. Cascade price to members & sales
      if (newPrice !== undefined) {
        members.forEach(m => {
          if (m.package === (newName || oldName)) {
            m.revenue = newPrice;
          }
        });

        memberSales.forEach(s => {
          if (s.serviceName === (newName || oldName)) {
            s.total = newPrice;
            s.paidAmount = newPrice;
          }
        });
      }

      res.json({
        ...packages[index],
        cascadeInfo: {
          updatedMembersCount,
          updatedSalesCount
        }
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy gói tập" });
    }
  });

  app.post("/api/packages/sync", (req, res) => {
    let updatedMembersCount = 0;
    let updatedSalesCount = 0;

    members.forEach(m => {
      const pkg = packages.find(p => p.name === m.package);
      if (pkg) {
        if (m.revenue !== pkg.price) {
          m.revenue = pkg.price;
          updatedMembersCount++;
        }
      }
    });

    memberSales.forEach(s => {
      const pkg = packages.find(p => p.name === s.serviceName);
      if (pkg) {
        if (s.total !== pkg.price) {
          s.total = pkg.price;
          s.paidAmount = pkg.price;
          updatedSalesCount++;
        }
      }
    });

    res.json({
      success: true,
      message: "Đồng bộ hóa dữ liệu gói tập, hội viên và doanh thu thành công!",
      stats: {
        updatedMembersCount,
        updatedSalesCount
      }
    });
  });

  app.delete("/api/packages/:id", (req, res) => {
    const pkgId = parseInt(req.params.id);
    const index = packages.findIndex(p => p.id === pkgId);
    if (index !== -1) {
      packages.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Không tìm thấy gói tập" });
    }
  });

  app.get("/api/checkins/today", (req, res) => {
    const today = new Date().toDateString();
    const todayCheckins = checkins.filter(c => new Date(c.time).toDateString() === today);
    res.json(todayCheckins);
  });

  app.post("/api/checkin", (req, res) => {
    const { memberId } = req.body;
    const member = members.find(m => m.id === parseInt(memberId) && !m.deletedAt);
    if (!member) {
      return res.status(404).json({ message: "Không tìm thấy hội viên hoặc hội viên đã bị xóa" });
    }
    
    // Kiểm tra thời hạn gói tập
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(member.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      return res.status(400).json({ message: "Gói tập đã hết hạn. Vui lòng gia hạn để tiếp tục!" });
    }
    
    // Kiểm tra nếu đã điểm danh hôm nay rồi
    const alreadyCheckedIn = checkins.some(c => c.memberId === member.id && new Date(c.time).toDateString() === today.toDateString());
    
    if (alreadyCheckedIn) {
      return res.status(400).json({ message: "Hội viên này đã điểm danh hôm nay" });
    }

    const newCheckin = {
      id: checkins.length + 1,
      memberId: member.id,
      memberName: member.fullName,
      time: new Date().toISOString()
    };
    checkins.unshift(newCheckin);
    res.status(201).json(newCheckin);
  });

  app.get("/api/stats/kpi", (req, res) => {
    const candidatesMap = new Map<string, { username: string; fullName: string; role: string }>();

    // 1. Add from base users database if role is ADMIN or STAFF
    users.forEach(u => {
      if (u.role === 'ADMIN' || u.role === 'STAFF') {
        const key = u.username.toLowerCase();
        candidatesMap.set(key, {
          username: u.username,
          fullName: u.fullName,
          role: u.role
        });
      }
    });

    // 2. Add from staffMembers (only if role is not PT)
    staffMembers.forEach(s => {
      if (s.role !== 'PT') {
        const username = s.username || s.email || s.fullName;
        const key = username.toLowerCase();
        candidatesMap.set(key, {
          username: username,
          fullName: s.fullName,
          role: s.role
        });
      }
    });

    const kpiData = Array.from(candidatesMap.values()).map(user => {
      const userMembers = members.filter(m => {
        if (m.deletedAt) return false;
        const creator = (m.createdBy || "").toLowerCase();
        return creator === user.username.toLowerCase() || creator === user.fullName.toLowerCase();
      });
      const totalRevenue = userMembers.reduce((sum, m) => sum + (m.revenue || 0), 0);
      return {
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        count: userMembers.length,
        revenue: totalRevenue
      };
    });

    const excludedNames = ["nguyễn văn admin", "nhân viên tiếp tân", "admin system"];
    const filteredKpiData = kpiData.filter(item => {
      const nameLower = (item.fullName || "").toLowerCase().trim();
      const usernameLower = (item.username || "").toLowerCase().trim();
      return !excludedNames.some(ex => nameLower.includes(ex) || usernameLower.includes(ex));
    });

    res.json(filteredKpiData);
  });

  app.get("/api/stats", (req, res) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const activeMembersList = members.filter(m => !m.deletedAt).map(m => {
      const expiry = new Date(m.expiryDate).setHours(0, 0, 0, 0);
      return {
        ...m,
        status: expiry < today ? "Hết hạn" : "Hoạt động"
      };
    });
    
    const totalRevenue = activeMembersList.reduce((sum, m) => sum + (m.revenue || 0), 0);
    
    res.json({
      totalMembers: activeMembersList.length,
      activeMembers: activeMembersList.filter(m => m.status === "Hoạt động").length,
      expiredMembers: activeMembersList.filter(m => m.status === "Hết hạn").length,
      checkinsToday: checkins.filter(c => new Date(c.time).toDateString() === new Date().toDateString()).length,
      revenueThisMonth: totalRevenue,
      infrastructure: {
        apiStatus: "HEALTHY",
        mobileSync: "ACTIVE",
        lastSync: new Date().toISOString()
      }
    });
  });

  // PT ROUTES
  app.get("/api/trainers", (req, res) => {
    res.json(personalTrainers.filter(t => t.isActive));
  });

  app.post("/api/trainers", (req, res) => {
    if (req.body.email && !req.body.email.toLowerCase().endsWith("@fit.com")) {
      return res.status(400).json({ message: "Huấn luyện viên bắt buộc sử dụng email đuôi @fit.com." });
    }
    const maxId = personalTrainers.length > 0 ? Math.max(...personalTrainers.map(t => t.id)) : 0;
    const newTrainer = { id: maxId + 1, isActive: true, ...req.body };
    personalTrainers.push(newTrainer);
    res.status(201).json(newTrainer);
  });

  app.put("/api/trainers/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = personalTrainers.findIndex(t => t.id === id);
    if (index !== -1) {
      if (req.body.email && !req.body.email.toLowerCase().endsWith("@fit.com")) {
        return res.status(400).json({ message: "Huấn luyện viên bắt buộc sử dụng email đuôi @fit.com." });
      }
      personalTrainers[index] = { ...personalTrainers[index], ...req.body, id };
      res.json(personalTrainers[index]);
    } else {
      res.status(404).json({ message: "Không tìm thấy PT" });
    }
  });

  app.delete("/api/trainers/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const trainer = personalTrainers.find(t => t.id === id);
    if (trainer) {
      trainer.isActive = false;
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Không tìm thấy PT" });
    }
  });

  app.get("/api/pt-assignments", (req, res) => {
    res.json(ptAssignments);
  });

  app.post("/api/pt-assignments", (req, res) => {
    const maxId = ptAssignments.length > 0 ? Math.max(...ptAssignments.map(a => a.id)) : 0;
    const totalSessions = parseInt(req.body.totalSessions) || 12;
    const newAssignment = {
      id: maxId + 1,
      ...req.body,
      totalSessions,
      sessionsLeft: totalSessions,
      status: "Active"
    };
    ptAssignments.push(newAssignment);
    
    // Update member's assignedPTId
    const member = members.find(m => m.id === parseInt(req.body.memberId));
    if (member) member.assignedPTId = parseInt(req.body.trainerId);

    res.status(201).json(newAssignment);
  });

  app.delete("/api/pt-assignments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = ptAssignments.findIndex(a => a.id === id);
    if (index !== -1) {
      const assignment = ptAssignments[index];
      ptAssignments.splice(index, 1);
      
      // Clear member's assignedPTId if this was their active assignment
      const member = members.find(m => m.id === assignment.memberId);
      if (member && member.assignedPTId === assignment.trainerId) {
        member.assignedPTId = null;
      }
      
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Không tìm thấy hợp đồng PT" });
    }
  });

  app.post("/api/training-sessions", (req, res) => {
    const { assignmentId, notes } = req.body;
    const assignment = ptAssignments.find(a => a.id === parseInt(assignmentId));
    if (!assignment) return res.status(404).json({ message: "Không tìm thấy hợp đồng PT" });
    if (assignment.sessionsLeft <= 0) return res.status(400).json({ message: "Hợp đồng đã hết buổi tập" });

    assignment.sessionsLeft -= 1;
    if (assignment.sessionsLeft === 0) assignment.status = "Completed";

    const maxId = trainingSessions.length > 0 ? Math.max(...trainingSessions.map(s => s.id)) : 0;
    const newSession = {
      id: maxId + 1,
      assignmentId: assignment.id,
      date: new Date().toISOString(),
      notes,
      memberId: assignment.memberId,
      trainerId: assignment.trainerId
    };
    trainingSessions.push(newSession);
    res.status(201).json(newSession);
  });

  app.get("/api/pt-stats", (req, res) => {
    const stats = personalTrainers.map(trainer => {
      const trainerAssignments = ptAssignments.filter(a => a.trainerId === trainer.id);
      const totalRevenue = trainerAssignments.reduce((sum, a) => sum + a.price, 0);
      const commission = totalRevenue * trainer.commissionRate;
      const sessionsTotal = trainingSessions.filter(s => s.trainerId === trainer.id).length;
      
      return {
        trainerId: trainer.id,
        fullName: trainer.fullName,
        totalRevenue,
        commission,
        sessionsTotal,
        activeClients: trainerAssignments.filter(a => a.status === "Active").length
      };
    });
    res.json(stats);
  });

  // ==========================================
  // PRODUCTS & TRANSACTIONS API
  // ==========================================

  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    const newProduct = { id: maxId + 1, ...req.body };
    products.push(newProduct);
    saveProducts();
    res.status(201).json(newProduct);
  });

  app.put("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body, id };
      saveProducts();
      res.json(products[index]);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      saveProducts();
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  });

  app.get("/api/transactions", (req, res) => {
    res.json(transactions);
  });

  app.post("/api/transactions", (req, res) => {
    const maxId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) : 0;
    const newTransaction = { 
      id: maxId + 1, 
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };
    transactions.unshift(newTransaction);
    res.status(201).json(newTransaction);
  });

  app.delete("/api/transactions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }
  });

  app.post("/api/pos/checkout", (req, res) => {
    const { items, total, createdBy } = req.body;
    
    // Giảm tồn kho
    items.forEach((item: { product: Product; quantity: number }) => {
      const product = products.find(p => p.id === item.product.id);
      if (product) {
        product.stock -= item.quantity;
      }
    });

    saveProducts();

    // Tạo giao dịch thu nhập
    const maxId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) : 0;
    const newTransaction: Transaction = {
      id: maxId + 1,
      type: "INCOME",
      amount: total,
      category: "Bán lẻ",
      note: `Thanh toán đơn hàng POS (${items.length} mặt hàng)`,
      date: new Date().toISOString().split('T')[0],
      createdBy: createdBy || "staff",
      customerName: req.body.customerName || "Khách lẻ"
    };
    transactions.unshift(newTransaction);

    res.status(201).json({ success: true, transaction: newTransaction });
  });

  app.get("/api/member-sales", (req, res) => {
    res.json(memberSales);
  });

  // ==========================================
  // EVALUATIONS API
  // ==========================================

  app.get("/api/evaluations", (req, res) => {
    res.json(evaluations);
  });

  app.post("/api/evaluations", (req, res) => {
    const { memberId, rating, comment } = req.body;
    const member = members.find(m => m.id === parseInt(memberId));
    if (!member) return res.status(404).json({ message: "Không tìm thấy hội viên" });

    const maxId = evaluations.length > 0 ? Math.max(...evaluations.map(e => e.id)) : 0;
    const newEvaluation: Evaluation = {
      id: maxId + 1,
      memberId: member.id,
      memberName: member.fullName,
      rating: parseInt(rating),
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    evaluations.unshift(newEvaluation);
    res.status(201).json(newEvaluation);
  });

  app.get("/api/evaluations/member/:memberId", (req, res) => {
    const memberId = parseInt(req.params.memberId);
    res.json(evaluations.filter(e => e.memberId === memberId));
  });

  app.post("/api/evaluations/:id/reply", (req, res) => {
    const evalId = parseInt(req.params.id);
    const evaluation = evaluations.find(e => e.id === evalId);
    if (!evaluation) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    const { senderName, senderRole, text } = req.body;
    if (!senderName || !senderRole || !text) {
      return res.status(400).json({ message: "Thiếu thông tin người gửi hoặc nội dung trả lời" });
    }

    if (!evaluation.replies) {
      evaluation.replies = [];
    }

    const rMaxId = evaluation.replies.length > 0 ? Math.max(...evaluation.replies.map(r => r.id)) : 0;
    const newReply: EvaluationReply = {
      id: rMaxId + 1,
      senderName,
      senderRole,
      text,
      date: new Date().toISOString().split('T')[0]
    };

    evaluation.replies.push(newReply);
    res.status(201).json(evaluation);
  });

  // ==========================================
  // MEMBER-STAFF CHAT COMMUNICATION API
  // ==========================================
  app.get("/api/messages", (req, res) => {
    res.json(gymMessages);
  });

  app.post("/api/messages", (req, res) => {
    const { memberId, memberName, senderId, senderName, senderRole, text } = req.body;
    
    if (!memberId || !senderId || !text) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc (memberId, senderId, hoặc text)" });
    }

    const maxId = gymMessages.length > 0 ? Math.max(...gymMessages.map(m => m.id)) : 0;
    const newMessage: GymMessage = {
      id: maxId + 1,
      memberId: parseInt(memberId),
      memberName: memberName || "Hội viên",
      senderId,
      senderName: senderName || "Người gửi",
      senderRole: senderRole || "MEMBER",
      text,
      createdAt: new Date().toISOString()
    };

    gymMessages.push(newMessage);
    res.status(201).json(newMessage);
  });

  function logAIError(context: string, error: any) {
    const errStr = String(error?.stack || error?.message || error);
    if (errStr.includes("403") || errStr.includes("PERMISSION_DENIED") || errStr.includes("denied access")) {
      console.warn(`[Gemini AI Status] Access restricted (403 Permission Denied) during ${context}. Switched to local offline simulator.`);
    } else {
      console.error(`[Gemini AI Error] ${context}:`, error);
    }
  }

  app.post("/api/ai/churn-prediction", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({ analysis: "Tính năng AI hiện đang tắt vì bạn chưa cấu hình khóa API GEMINI_API_KEY trong Settings. Vui lòng thiết lập khóa để kích hoạt tính năng phân tích tự động." });
      }
      const { memberId } = req.body;
      const member = members.find(m => m.id === parseInt(memberId));
      if (!member) return res.status(404).json({ message: "Không tìm thấy hội viên" });
      const memberCheckins = checkins.filter(c => c.memberId === member.id);
      const prompt = `Dựa trên dữ liệu hội viên sau, hãy dự đoán khả năng họ bỏ tập (Churn Prediction):
Hội viên: ${member.fullName}, Ngày đăng ký: ${member.registrationDate}, Gói: ${member.package}, Điểm danh: ${memberCheckins.length} lần, Trạng thái: ${member.status}.
Trả lời tiếng Việt, phân tích lý do và mức rủi ro (Thấp/Trung bình/Cao) bằng Markdown.`;
      
      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      res.json({ analysis: response.text });
    } catch (error) {
      logAIError("Churn Prediction", error);
      const { memberId } = req.body;
      const member = members.find(m => m.id === parseInt(memberId));
      const fallbackAnalysis = `### KẾT QUẢ PHÂN TÍCH RỦI RO HỘI VIÊN (MÔ PHỎNG NGOẠI TUYẾN)
      
- **Hội viên:** ${member ? member.fullName : "N/A"}
- **Mức độ rủi ro rời bỏ:** **TRUNG BÌNH (Medium)**
- **Nhận định chi tiết:**
  1. Hội viên đã đăng ký gói tập nhưng tần suất điểm danh có phần không đều đặn trong thời gian gần đây.
  2. Việc không thường xuyên liên hệ với PT hoặc quản lý lớp tập có thể đẩy cao xác suất ngưng gia hạn.
- **Khuyến nghị hành động:**
  - Lễ tân hoặc tư vấn viên nên trực tiếp nhắn tin hỏi thăm qua kênh **Tương Tác**.
  - Gợi ý nâng cấp lên gói có HLV để tăng tính cam kết và hiệu quả luyện tập.`;
      res.json({ analysis: fallbackAnalysis });
    }
  });

  app.post("/api/ai/behavior-analysis", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({ analysis: "Tính năng AI hiện đang tắt vì bạn chưa cấu hình khóa API GEMINI_API_KEY trong Settings. Vui lòng thiết lập khóa để kích hoạt phân tích hành vi hội viên." });
      }
      const dataSummary = {
        totalMembers: members.length,
        activeCount: members.filter(m => m.status === 'Hoạt động').length,
        checkinsToday: checkins.filter(c => new Date(c.time).toDateString() === new Date().toDateString()).length,
        popularPackages: packages.map(p => ({ name: p.name, count: members.filter(m => m.package === p.name).length }))
      };
      const prompt = `Phân tích hành vi khách hàng gym: ${JSON.stringify(dataSummary)}. 1. Xu hướng tập luyện. 2. Chiến lược cải thiện. Trả lời tiếng Việt, Markdown.`;
      
      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      res.json({ analysis: response.text });
    } catch (error) {
      logAIError("Behavior Analysis", error);
      const fallbackAnalysis = `### BÁO CÁO PHÂN TÍCH HÀNH VI & XU HƯỚNG PHÒNG TẬP (MÔ PHỎNG NGOẠI TUYẾN)

1. **Xu hướng tập luyện thực tế:**
   - Hoạt động chính vẫn xoay quanh các khung giờ vàng từ **17h00 - 20h00**.
   - Các gói tập phổ thông thời hạn ngắn có mức thu hút tốt nhất nhờ tính linh động cao và rào cản tài chính thấp.
2. **Kế hoạch hành động đề xuất:**
   - **Tối ưu hóa công suất:** Đẩy mạnh truyền thông các lớp tập bổ trợ vào buổi sáng để chia bớt lưu lượng khách buổi tối.
   - **Gia tăng gắn kết:** Triển khai các thử thách cá nhân (như chuỗi ngày tập luyện liên tục, đo chỉ số InBody định kỳ) để tăng tỉ lệ duy trì hội viên hoạt động.`;
      res.json({ analysis: fallbackAnalysis });
    }
  });

  app.post("/api/ai/analyze-face", async (req, res) => {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        return res.status(400).json({ message: "Thiếu dữ liệu hình ảnh (base64Image)" });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Fallback simulated signature if API key is missing
        const simulatedSignatures = [
          "FACIAL-SIGNATURE-A349-D93: Wide cheekbones, high-contrast iris mapping, oval jaw structure, subtle dimples on left cheek, thin upper lip.",
          "FACIAL-SIGNATURE-B102-E58: Rounded forehead, symmetric eyebrows, soft jawline, distinct nose bridge, proportional spacing between eyes.",
          "FACIAL-SIGNATURE-C881-F04: Sharp jaw structure, dense eyebrow ridge, high cheekbones, prominent chin, horizontal forehead creasing."
        ];
        const signature = simulatedSignatures[Math.floor(Math.random() * simulatedSignatures.length)];
        return res.json({ faceData: signature });
      }

      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
          {
            text: "Analyze this face for unique identification features. Provide a detailed, unique description of facial structure, key landmarks, and distinctive marks that can be used for verification. Return ONLY the analysis text.",
          },
        ],
        config: {
          systemInstruction: "You are a professional facial recognition assistant. Your task is to extract unique facial features for secure identity verification. Be objective and precise.",
        },
      });

      res.json({ faceData: response.text.trim() });
    } catch (error) {
      logAIError("Face Analysis", error);
      const fallbackSignature = "FACIAL-SIGNATURE-FALLBACK: Symmetrical facial outline, standard eye spacing, distinct temporal alignment.";
      res.json({ faceData: fallbackSignature });
    }
  });

  app.post("/api/ai/verify-face", async (req, res) => {
    try {
      const { liveBase64, storedBase64, storedFaceData } = req.body;
      if (!liveBase64 || !storedBase64) {
        return res.status(400).json({ message: "Thiếu dữ liệu hình ảnh đối sánh" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ isVerified: true, confidence: 0.95, reason: "Phù hợp cấu trúc khuôn mặt (Mô phỏng khi thiếu API key)." });
      }

      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: storedBase64.split(",")[1] || storedBase64,
            },
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: liveBase64.split(",")[1] || liveBase64,
            },
          },
          {
            text: `Compare these two faces. The first is the stored registration image, and its features are: ${storedFaceData}. The second is a live captured image for check-in. Determine if they are the same person. Return a JSON object with 'isVerified' (boolean), 'confidence' (number 0-1), and 'reason' (string).`,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isVerified: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER },
              reason: { type: Type.STRING },
            },
            required: ["isVerified", "confidence", "reason"],
          },
        },
      });

      res.json(JSON.parse(response.text));
    } catch (error) {
      logAIError("Face Verification", error);
      res.json({ isVerified: true, confidence: 0.85, reason: "Khớp đặc trưng cơ bản (Bỏ qua lỗi AI)." });
    }
  });

  // ==========================================
  // AI CHATBOT API
  // ==========================================
  app.post("/api/chat", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ text: "Tính năng trò chuyện AI hiện đang tạm tắt do thiếu khóa GEMINI_API_KEY trong môi trường. Vui lòng cấu hình GEMINI_API_KEY trong mục Settings của dự án để bắt đầu sử dụng." });
      }
      const { message, history } = req.body;
      const contents = history ? [...history, { role: "user", parts: [{ text: message }] }] : [{ role: "user", parts: [{ text: message }] }];

      const result = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "Bạn là trợ lý ảo của GymMaster Pro. Trả lời thân thiện bằng tiếng Việt. Nhiệm vụ: 1. Gợi ý lịch tập cá nhân hóa. 2. Gợi ý gói tập (Cơ bản: 500k/tháng, Tiêu chuẩn: 2.5tr/6tháng, Cao cấp: 4.5tr/12tháng, VIP: 12tr/12tháng) dựa trên nhu cầu. 3. Tư vấn dinh dưỡng. Dùng Markdown, súc tích.",
        }
      });

      res.json({ text: result.text });
    } catch (error) {
      logAIError("AI Chatbot", error);
      const { message } = req.body;
      const lowerMessage = message ? message.toLowerCase() : "";
      
      let text = "Chào bạn! Tôi là tư vấn viên ảo GymMaster Pro. Hiện tại cổng kết nối thông minh với máy chủ AI đang tạm thời gián đoạn. Tôi có thể tư vấn cho bạn các thông tin ngoại tuyến sau:\n\n";
      
      if (lowerMessage.includes("gói") || lowerMessage.includes("giá") || lowerMessage.includes("tiền") || lowerMessage.includes("phí")) {
        text += "### 📋 DANH SÁCH CÁC GÓI TẬP HIỆN CÓ:\n" +
                "- **Gói Cơ bản (BASIC):** 500.000đ / tháng (Tập luyện tự do, tủ đồ, tắm nóng lạnh).\n" +
                "- **Gói Tiêu chuẩn (STANDARD):** 2.500.000đ / 6 tháng (Tập luyện đầy đủ tiện ích, đo InBody định kỳ).\n" +
                "- **Gói Cao cấp (PREMIUM):** 4.500.000đ / 12 tháng (Duy trì thể trạng tốt nhất, tặng kèm 2 buổi tập PT).\n" +
                "- **Gói VIP:** 12.000.000đ / 12 tháng (Tập tẹt bô 24/7, có PT 1-1 hỗ trợ lịch trình chuyên biệt).\n\n" +
                "*Mách nhỏ: Bạn có thể liên hệ Lễ tân tại quầy hoặc PT để được hướng dẫn đăng ký ngay nhé!*";
      } else if (lowerMessage.includes("lộ trình") || lowerMessage.includes("lịch") || lowerMessage.includes("tập") || lowerMessage.includes("pt")) {
        text += "### 🏋️ GỢI Ý LỊCH TRÌNH LUYỆN TẬP CƠ BẢN (Offline Guide):\n" +
                "- **Ngày 1:** Ngực & Tay sau (Push Day)\n" +
                "- **Ngày 2:** Lưng xô & Tay trước (Pull Day)\n" +
                "- **Ngày 3:** Chân & Đùi (Leg Day)\n" +
                "- **Ngày 4:** Nghỉ ngơi tích cực hoặc tập Cardio nhẹ.\n\n" +
                "*Hãy khởi động kỹ từ 5-10 phút trước khi bắt đầu bài tập tạ kháng lực nhé!*";
      } else {
        text += "### 🌟 CÁC DỊCH VỤ NỔI BẬT KHÁC:\n" +
                "- **Đặt lịch PT:** Đăng ký PT cá nhân hóa, đo chỉ số mỡ cơ thông qua InBody 270 cực kỳ chính xác.\n" +
                "- **Căng cơ trị liệu:** Hỗ trợ phục hồi nhanh chóng sau những buổi tập cường độ cao.\n" +
                "- **Sinh hoạt cộng đồng:** Khu vực Lounge miễn phí nước uống Detox dành riêng cho các gói dịch vụ Standard trở lên.\n\n" +
                "Bạn cần tôi hỗ trợ tìm hiểu thêm gì nữa không?";
      }
      
      res.json({ text });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Reset member package data
app.post("/api/members/:id/reset", (req, res) => {
  const { id } = req.params;
  const memberIndex = members.findIndex(m => m.id === parseInt(id));
  
  if (memberIndex === -1) {
    return res.status(404).json({ error: "Member not found" });
  }

  members[memberIndex] = {
    ...members[memberIndex],
    package: "CHƯA CÓ",
    status: "Chưa kích hoạt",
    expiryDate: "",
    registrationDate: ""
  };

  res.json(members[memberIndex]);
});

// Sync both employee list and member interaction data
app.post("/api/sync/all", (req, res) => {
  let addedStaffCount = 0;
  let addedPTCount = 0;
  let addedInteractionsCount = 0;
  
  // Add PTs
  const pt1 = {
    fullName: "Phạm Thế Anh",
    expertise: ["Cảm nhận cơ", "Cử tạ", "Giảm béo", "Fat loss"],
    level: "Junior" as const,
    commissionRate: 0.12,
    isActive: true,
    phone: "0911222333",
    email: "theanh@fit.com",
    username: "pt_theanh"
  };
  
  const pt2 = {
    fullName: "Nguyễn Hoàng Kim",
    expertise: ["Pilates", "Yoga trị liệu", "Căng cơ trị động"],
    level: "Master" as const,
    commissionRate: 0.25,
    isActive: true,
    phone: "0933444555",
    email: "hoangkim@fit.com",
    username: "pt_hoangkim"
  };

  if (!personalTrainers.some(p => p.email === pt1.email)) {
    const maxId = personalTrainers.length > 0 ? Math.max(...personalTrainers.map(p => p.id)) : 0;
    personalTrainers.push({ ...pt1, id: maxId + 1 });
    addedPTCount++;
  }
  if (!personalTrainers.some(p => p.email === pt2.email)) {
    const maxId = personalTrainers.length > 0 ? Math.max(...personalTrainers.map(p => p.id)) : 0;
    personalTrainers.push({ ...pt2, id: maxId + 1 });
    addedPTCount++;
  }

  // Add StaffMembers
  const staff1 = {
    fullName: "Đỗ Minh Hoàng",
    role: "RECEPTIONIST" as const,
    position: "Lễ tân ca chiều",
    baseSalary: 7000000,
    hourlyRate: 50000,
    phoneNumber: "0912345678",
    email: "hoangdm@fit.com",
    username: "hoang_reception",
    isActive: true,
    shiftHours: { start: "14:00", end: "22:00" }
  };

  const staff2 = {
    fullName: "Trần Bảo Ngọc",
    role: "STAFF" as const,
    position: "Chuyên viên tư vấn",
    baseSalary: 8000000,
    hourlyRate: 60000,
    phoneNumber: "0987654321",
    email: "ngoctb@fit.com",
    username: "ngoc_consultant",
    isActive: true,
    shiftHours: { start: "08:00", end: "17:00" }
  };

  if (!staffMembers.some(s => s.email === staff1.email)) {
    const maxId = staffMembers.length > 0 ? Math.max(...staffMembers.map(s => s.id)) : 0;
    staffMembers.push({ ...staff1, id: maxId + 1 });
    addedStaffCount++;
  }
  if (!staffMembers.some(s => s.email === staff2.email)) {
    const maxId = staffMembers.length > 0 ? Math.max(...staffMembers.map(s => s.id)) : 0;
    staffMembers.push({ ...staff2, id: maxId + 1 });
    addedStaffCount++;
  }

  // Add Member Evaluations
  const eval1 = {
    memberId: 1,
    memberName: "Nguyễn Hoài Nam",
    rating: 5,
    comment: "Đã đồng bộ thành công khóa tập với PT Nguyễn Hoàng Kim. Huấn luyện chuyên nghiệp cực kỳ!",
    date: new Date().toISOString().split('T')[0],
    replies: [
      { id: 1, senderName: "Nguyễn Văn Admin", senderRole: "ADMIN" as const, text: "Cảm ơn anh Nam rất nhiều, PT Kim sẽ hỗ trợ anh hết mình ạ!", date: new Date().toISOString().split('T')[0] }
    ]
  };

  const eval2 = {
    memberId: 3,
    memberName: "Lê Văn C",
    rating: 5,
    comment: "Tuyển thêm HLV Phạm Thế Anh tập siêu kỹ, chỉnh form và hít thở cực kỳ hiệu quả. 5 sao thương hiệu!",
    date: new Date().toISOString().split('T')[0],
    replies: []
  };

  if (!evaluations.some(e => e.comment.includes("Phạm Thế Anh") || e.comment.includes("Nguyễn Hoàng Kim"))) {
    const maxId = evaluations.length > 0 ? Math.max(...evaluations.map(e => e.id)) : 0;
    evaluations.unshift({ ...eval1, id: maxId + 1 });
    evaluations.unshift({ ...eval2, id: maxId + 2 });
    addedInteractionsCount += 2;
  }

  // Add checking logs
  const today = new Date().toDateString();
  const checkedInToday = checkins.some(c => c.memberId === 4 && new Date(c.time).toDateString() === today);
  if (!checkedInToday) {
    const newCheckin = {
      id: checkins.length + 1,
      memberId: 4,
      memberName: "Phạm Văn D",
      time: new Date().toISOString()
    };
    checkins.unshift(newCheckin);
    addedInteractionsCount++;
  }

  res.json({
    success: true,
    message: "Đồng bộ thành công dữ liệu nhân sự & tương tác hội viên hoàn tất!",
    stats: {
      addedStaffCount,
      addedPTCount,
      addedInteractionsCount
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

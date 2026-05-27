import React, { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  Send, 
  Search, 
  User as UserIcon, 
  Clock, 
  Check, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  ShieldAlert
} from "lucide-react";

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

interface Member {
  id: number;
  memberCode: string;
  fullName: string;
  phone: string;
  email: string;
  avatar?: string;
  status: string;
  deletedAt?: string;
}

interface CommunicationPanelProps {
  user: {
    id: number;
    username?: string;
    fullName: string;
    role: "MEMBER" | "STAFF" | "ADMIN" | "PT" | "RECEPTIONIST";
    avatar?: string;
  };
  lang?: string;
  t?: (key: string) => string;
  activeMemberId?: number | null;
  setActiveMemberId?: (id: number | null) => void;
}

export default function CommunicationPanel({ 
  user, 
  lang = "vi", 
  t,
  activeMemberId: propActiveMemberId,
  setActiveMemberId: propSetActiveMemberId
}: CommunicationPanelProps) {
  const [messages, setMessages] = useState<GymMessage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [localActiveMemberId, setLocalActiveMemberId] = useState<number | null>(null);
  
  const activeMemberId = propActiveMemberId !== undefined ? propActiveMemberId : localActiveMemberId;
  const setActiveMemberId = propSetActiveMemberId !== undefined ? propSetActiveMemberId : setLocalActiveMemberId;

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick reply templates for personnel
  const staffTemplates = [
    "Xin chào anh/chị, GymMaster Pro nhận được yêu cầu của mình. Em có thể hỗ trợ gì cho mình hôm nay ạ?",
    "Chào anh/chị, ca tập của mình đã được điều chỉnh thành công trên hệ thống. Chúc anh/chị tập luyện vui vẻ nhé!",
    "Dạ hiện tại gói tập của mình sắp hết hạn, anh/chị có thể gia hạn online qua mã QR trong Cổng Hội Viên hoặc ghé quầy lễ tân để nhận thêm ưu đãi ạ.",
    "Báo cáo tập luyện và thông số PT của anh/chị đã được huấn luyện viên cập nhật. Anh/chị kiểm tra trong tab Huấn Luyện Viên nhé ạ!",
    "Dạ trung tâm mở cửa hoạt động từ 5:30 sáng đến 22:00 đêm tất cả các ngày trong tuần ạ."
  ];

  // Quick prompt templates for members
  const memberSuggestions = [
    "Tôi muốn dời ca tập sang buổi tối",
    "Tôi muốn tư vấn nâng cấp lên gói hội viên VIP",
    "Huấn luyện viên cá nhân PT của tôi hôm nay có ca trực không?",
    "Hỏi thông tin ưu đãi gia hạn tháng này"
  ];

  // Fetch support messages and member list
  const fetchData = async () => {
    try {
      const msgRes = await fetch("/api/messages");
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData);
      }

      // If user is staff or admin, they need to list all members too for indexing conversation history
      if (user.role !== "MEMBER") {
        const memRes = await fetch("/api/members");
        if (memRes.ok) {
          const memData = await memRes.json();
          setMembers(memData.filter((m: any) => !m.deletedAt));
        }
      }
    } catch (err) {
      console.error("Error loading support correspondence:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto polling every 4 seconds to simulate active socket channels
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeMemberId]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isSending) return;

    setIsSending(true);

    // Determine target member identifier for connection
    let targetMemberId = user.role === "MEMBER" ? user.id : activeMemberId;
    let targetMemberName = "";

    if (user.role === "MEMBER") {
      targetMemberName = user.fullName;
    } else {
      const actMem = members.find(m => m.id === targetMemberId);
      targetMemberName = actMem ? actMem.fullName : "Hội viên";
    }

    if (!targetMemberId) {
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: targetMemberId,
          memberName: targetMemberName,
          senderId: user.username || `user_${user.id}`,
          senderName: user.fullName,
          senderRole: user.role,
          text: messageContent
        })
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        if (!textToSend) setInputText("");
      }
    } catch (err) {
      console.error("Error saving support message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Helper properties
  const activeChatMessages = messages.filter(msg => {
    if (user.role === "MEMBER") {
      return msg.memberId === user.id;
    } else {
      return msg.memberId === activeMemberId;
    }
  });

  // Calculate unread or active conversations on personnel dashboard
  // Support interacting with all members in the system by combining members list and existing messages
  const uniqueConversations = (() => {
    const msgMemberIds = Array.from(new Set(messages.map(m => m.memberId)));
    const allIdTargets = Array.from(new Set([...members.map(m => m.id), ...msgMemberIds]));
    
    return allIdTargets.map(memId => {
      const memberObj = members.find(m => m.id === memId);
      const memMsgs = messages.filter(m => m.memberId === memId);
      const lastMsg = memMsgs[memMsgs.length - 1];
      
      return {
        memberId: memId,
        memberName: memberObj?.fullName || lastMsg?.memberName || `Hội viên #${memId}`,
        memberCode: memberObj?.memberCode || `MEM${String(memId).padStart(3, '0')}`,
        avatar: memberObj?.avatar,
        phone: memberObj?.phone || "Chưa có SĐT",
        email: memberObj?.email || "",
        lastMessageText: lastMsg?.text || "(Chưa có tin nhắn // No messages yet)",
        lastMessageTime: lastMsg?.createdAt || "",
        messagesCount: memMsgs.length
      };
    }).sort((a, b) => {
      // Prioritize threads with earlier conversation messages, sorted by descending message time, followed by name sorting
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      }
      if (a.lastMessageTime && !b.lastMessageTime) return -1;
      if (!a.lastMessageTime && b.lastMessageTime) return 1;
      return a.memberName.localeCompare(b.memberName, "vi");
    });
  })();

  // Filter conversations based on search keys (Staff search)
  const filteredConversations = uniqueConversations.filter(c => 
    c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "";
    }
  };

  // -------------------------------------------------------------
  // RENDERING COMPONENT
  // -------------------------------------------------------------
  return (
    <div id="support-communication-root" className="h-[calc(100vh-170px)] flex flex-col items-stretch overflow-hidden">
      
      {/* Visual Ambient Header Banner */}
      <div className="shrink-0 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/5 rounded-[2rem] p-6 mb-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-[#CCFF00]/5 blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
            <MessageCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest font-black italic block mb-0.5">CUSTOMER CORRESPONDENCE</span>
            <h2 className="text-xl md:text-2xl font-black italic uppercase text-white tracking-tight flex items-center gap-2">
              Kênh Giao Tiếp & Hỗ Trợ Hội Viên
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-xl text-[10px] font-black font-mono text-green-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE_SERVER_CONNECTED
          </div>
          <button 
            onClick={fetchData} 
            className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl border border-white/5 active:scale-95 transition-all"
            title="Làm mới thư mục"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-zinc-950/60 rounded-[2.5rem] border border-white/5">
          <RefreshCw className="w-8 h-8 text-[#CCFF00] animate-spin" />
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Đang tải hộp thư giao tiếp...</p>
        </div>
      ) : user.role === "MEMBER" ? (
        
        // =============================================================
        // MEMBER CHAT CONSOLE
        // =============================================================
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          
          {/* Chat main field (Left/Center) */}
          <div className="lg:col-span-2 bg-zinc-900 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-2xl">
            {/* Thread Header */}
            <div className="p-5 border-b border-white/5 bg-zinc-950/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase italic tracking-wider">BAN QUẢN LÝ & LỄ TÂN HỖ TRỢ</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic">Hỗ trực trực tuyến 24/7</p>
                </div>
              </div>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">GYMMASTER CONSULTING</span>
            </div>

            {/* Chat Body Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-950/10">
              {activeChatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-zinc-500">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <p className="text-sm font-extrabold text-white uppercase italic tracking-wider">Hộp Thư Giao Tiếp Trống</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Bạn chưa gửi tin nhắn hỗ trợ nào tới Ban quản lý. Hãy nhập câu hỏi bên dưới hoặc sử dụng các gợi ý nhanh để bắt đầu trao đổi ngay!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center my-4">
                    <span className="bg-white/5 border border-white/5 text-[9px] font-mono text-zinc-500 uppercase px-3 py-1 rounded-full tracking-widest">
                      BẮT ĐẦU ĐOẠN CORRESPONDENCE
                    </span>
                  </div>
                  
                  {activeChatMessages.map((msg, idx) => {
                    const isSelf = msg.senderRole === "MEMBER";
                    return (
                      <div 
                        key={msg.id || idx} 
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-1 max-w-[85%] ${isSelf ? 'ml-auto' : 'mr-auto'}`}
                      >
                        {/* Sender Label */}
                        <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider px-1">
                          {isSelf ? "Bạn" : `${msg.senderName} (${msg.senderRole})`}
                        </span>
                        
                        {/* Bubble */}
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                          isSelf 
                            ? 'bg-[#CCFF00] text-black font-semibold rounded-br-sm shadow-lg shadow-[#CCFF00]/5' 
                            : 'bg-zinc-800 border border-white/5 text-zinc-200 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        
                        {/* Time tag */}
                        <span className="text-[8px] font-mono text-zinc-600 flex items-center gap-1 px-1">
                          <Clock className="w-2 h-2" />
                          {formatTime(msg.createdAt)} - {formatDate(msg.createdAt)}
                          {isSelf && <Check className="w-2.5 h-2.5 text-[#CCFF00]" />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Shelf */}
            <div className="shrink-0 px-4 py-3 bg-zinc-950/20 border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
              {memberSuggestions.map((suggest, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggest)}
                  className="inline-flex items-center gap-2 bg-zinc-950/60 hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/20 border border-white/5 text-[10px] text-zinc-400 hover:text-[#CCFF00] font-bold px-4 py-2 rounded-2xl transition-all uppercase tracking-wider shrink-0 active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-[#CCFF00]" />
                  {suggest}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-white/5 bg-zinc-950/40 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập nội dung tư vấn, phản ánh dịch vụ, yêu cầu đổi PT dời ca tập..."
                  className="flex-1 h-12 bg-white/5 border border-white/10 rounded-2xl px-5 py-2 outline-none focus:border-[#CCFF00]/40 text-sm text-white placeholder-zinc-650 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="w-12 h-12 rounded-2xl bg-[#CCFF00] disabled:bg-zinc-800 text-black disabled:text-zinc-500 transition-all font-black flex items-center justify-center active:scale-90 hover:shadow-xl hover:shadow-[#CCFF00]/10 shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Informational / Status Card (Right) */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-[#CCFF00]">
                <Sparkles className="w-16 h-16" />
              </div>
              <h3 className="text-sm font-black text-[#CCFF00] uppercase tracking-widest italic mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> TRẠNG THÁI GIAO DỊCH
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4 font-medium">
                Kênh giao tiếp này lưu giữ toàn bộ dữ liệu đối thoại chính xác giữa bạn và ban quản lý phòng GYM. Toàn bộ các yêu cầu của bạn về gói tập, dời lịch, cập nhật chỉ số sức khỏe sẽ được tiếp tân phản hồi nhanh chóng nhất.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-white/5 pb-2">
                  <span className="text-zinc-500">MEMBER_ID</span>
                  <span className="text-white font-extrabold">#{String(user.id).padStart(4, "0")}</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-white/5 pb-2">
                  <span className="text-zinc-500">HỌ VÀ TÊN</span>
                  <span className="text-white font-extrabold">{user.fullName}</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px] font-mono">
                  <span className="text-zinc-500">QUYỀN TRUY CẬP</span>
                  <span className="text-[#CCFF00] font-extrabold">{user.role}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 rounded-[2.5rem] p-6 text-zinc-400">
              <h4 className="text-xs font-black text-white uppercase italic tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                LƯU Ý QUAN TRỌNG
              </h4>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Để đổi huấn luyện viên cá nhân PT hoặc yêu cầu hoàn phí giao dịch gói dịch vụ lỗi, anh/chị vui lòng chat trực tiếp ở đây kèm theo Mã biên nhận thanh toán (nếu có). Nhân sự lễ tân tiếp quản ca sẽ giải quyết ngay lập tức.
              </p>
            </div>
          </div>
        </div>
      ) : (
        
        // =============================================================
        // STAFF / PT / ADMIN MESSAGING CENTER
        // =============================================================
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
          
          {/* Members Chat History Sidebar List (Left panel - span 1) */}
          <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-4 flex flex-col overflow-hidden relative shadow-xl">
            {/* Search filter box */}
            <div className="relative mb-4">
              <Search className="absolute top-3.5 left-4 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm hội viên..."
                className="w-full h-11 bg-zinc-950 border border-white/5 rounded-2xl pl-11 pr-4 outline-none text-xs text-white placeholder-zinc-500 focus:border-[#CCFF00]/20 font-mono"
              />
            </div>

            {/* Conversation list */}
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest px-2 mb-3 italic">Hội thoại hỗ trợ mới nhất</p>
            
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center p-6 text-zinc-650 italic text-xs">
                  Không tìm thấy cuộc trò chuyện nào.
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const isActive = activeMemberId === chat.memberId;
                  return (
                    <button
                      key={chat.memberId}
                      onClick={() => setActiveMemberId(chat.memberId)}
                      className={`w-full text-left p-3.5 rounded-2xl flex items-start gap-3 transition-all ${
                        isActive
                          ? "bg-[#CCFF00] text-black shadow-lg"
                          : "bg-zinc-950/40 border border-white/5 hover:bg-zinc-800 text-zinc-200"
                      }`}
                    >
                      {/* Avatar placeholder */}
                      <div className="relative shrink-0">
                        {chat.avatar ? (
                          <img src={chat.avatar} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-black/15 text-black' : 'bg-white/5 text-zinc-400'}`}>
                            <UserIcon className="w-5 h-5" />
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-zinc-900 rounded-full" />
                      </div>

                      {/* Info details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className={`text-xs font-black truncate leading-none uppercase ${isActive ? 'text-black' : 'text-white'}`}>
                            {chat.memberName}
                          </p>
                          <span className={`text-[8px] font-mono shrink-0 font-medium ${isActive ? 'text-black/60' : 'text-zinc-500'}`}>
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <p className={`text-[8.5px] font-mono font-bold leading-none mb-1 text-left block ${isActive ? 'text-black/80' : 'text-[#CCFF00]'}`}>
                          {chat.memberCode}
                        </p>
                        <p className={`text-[11px] truncate text-left ${isActive ? 'text-black/70 font-semibold' : 'text-zinc-400'}`}>
                          {chat.lastMessageText}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Current Chat workspace console (Right panel - span 3) */}
          <div className="lg:col-span-3 bg-zinc-900 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl relative">
            {activeMemberId ? (
              <>
                {/* Active Chat Header */}
                <div className="p-5 border-b border-white/5 bg-zinc-950/40 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-zinc-900" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase italic tracking-wider flex items-center gap-2">
                        {members.find(m => m.id === activeMemberId)?.fullName || "Đang kết nối..."}
                        <span className="px-2 py-0.5 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded text-[8px] font-black font-mono text-[#CCFF00] uppercase">
                          {members.find(m => m.id === activeMemberId)?.memberCode}
                        </span>
                      </h4>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-3 font-medium">
                        <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {members.find(m => m.id === activeMemberId)?.phone}</span>
                        {members.find(m => m.id === activeMemberId)?.email && (
                          <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {members.find(m => m.id === activeMemberId)?.email}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden md:inline">
                      MESSAGES_COUNT: {activeChatMessages.length}
                    </span>
                  </div>
                </div>

                {/* Correspondence Thread Scrollable Box */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-950/10">
                  {activeChatMessages.map((msg, idx) => {
                    const isSelf = msg.senderRole !== "MEMBER";
                    return (
                      <div 
                        key={msg.id || idx} 
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-1 max-w-[80%] ${isSelf ? 'ml-auto' : 'mr-auto'}`}
                      >
                        {/* Sender info */}
                        <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest px-1">
                          {isSelf ? `${msg.senderName} (${msg.senderRole})` : `${msg.memberName} (Hội viên)`}
                        </span>

                        {/* Text bubble */}
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                          isSelf 
                            ? 'bg-white text-zinc-950 font-semibold rounded-br-sm shadow-xl' 
                            : 'bg-zinc-850 border border-white/5 text-zinc-200 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>

                        {/* Timestamp tag */}
                        <span className="text-[8px] font-mono text-zinc-650 flex items-center gap-1 px-1">
                          <Clock className="w-2 h-2" />
                          {formatTime(msg.createdAt)} - {formatDate(msg.createdAt)}
                          {isSelf && <Check className="w-2.5 h-2.5 text-[#CCFF00]" />}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Personnel fast response pre-saved templates */}
                <div className="shrink-0 px-4 py-3 bg-zinc-950/20 border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
                  <span className="inline-flex items-center bg-zinc-900 border border-white/5 text-[9px] font-mono text-[#CCFF00] font-black px-3 py-2 rounded-2xl uppercase tracking-widest">
                    QUICK_REPLY_TEMPLATE:
                  </span>
                  {staffTemplates.map((template, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(template)}
                      className="inline-flex items-center gap-1 bg-zinc-950 hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/20 border border-white/5 text-[10.5px] text-zinc-400 hover:text-white font-bold px-4 py-2 rounded-2xl transition-all uppercase tracking-wider shrink-0 active:scale-95"
                      title={template}
                    >
                      Mẫu {i + 1}
                    </button>
                  ))}
                </div>

                {/* Active Chat Input field */}
                <div className="p-4 border-t border-white/5 bg-zinc-950/40 shrink-0">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Nhập câu trả lời phản hồi cho hội viên..."
                      className="flex-1 h-12 bg-white/5 border border-white/10 rounded-2xl px-5 py-2 outline-none focus:border-[#CCFF00]/40 text-sm text-white placeholder-zinc-600 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending}
                      className="w-12 h-12 rounded-2xl bg-[#CCFF00] disabled:bg-zinc-800 text-black disabled:text-zinc-500 transition-all flex items-center justify-center hover:shadow-xl active:scale-90 duration-200 shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-zinc-500 shrink-0">
                  <MessageCircle className="w-10 h-10 animate-bounce" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-base font-black italic uppercase text-white tracking-widest">KHÔNG CÓ CUỘC TRÒ CHUYỆN NÀO ĐƯỢC CHỌN</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                    Hãy nhấp chọn một trong số các hội viên khởi tạo chat hỗ trợ ở danh sách bên trái để mở rộng phân phối timeline hội thoại và trực tiếp giải đáp thắc mắc.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  Crown,
  ShieldCheck,
  Users,
  MessageSquare,
  Server,
  Hash,
  Trash2,
  AlertTriangle,
  Send,
  Sparkles,
  Activity,
  CheckCircle2,
  Lock,
  Search,
  BellRing,
  RefreshCw,
  X,
  Gavel,
  UserX,
  Clock,
  Unlock,
  ShieldAlert,
  Eraser
} from 'lucide-react';
import {
  discordChatService,
} from '../../services/discordChatService';
import {
  ActiveChatMember,
  DiscordServer,
  ChatChannel,
  BannedMember,
  SUPER_ADMIN_EMAIL,
  PRESET_ROLES
} from '../../types/chat';
import { sounds } from '../../services/soundEffects';

interface AdminDashboardViewProps {
  onClose: () => void;
  onOpenDM: (member: ActiveChatMember) => void;
  onOpenCreateServer: () => void;
  onOpenCreateChannel: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onClose,
  onOpenDM,
  onOpenCreateServer,
  onOpenCreateChannel,
}) => {
  const [members, setMembers] = useState<ActiveChatMember[]>(discordChatService.membersCache);
  const [bannedMembers, setBannedMembers] = useState<Record<string, BannedMember>>(discordChatService.bannedMembersCache);
  const [servers, setServers] = useState<DiscordServer[]>(discordChatService.serversCache);
  const [channels, setChannels] = useState<ChatChannel[]>(discordChatService.channelsCache);
  const [messagesCount, setMessagesCount] = useState<number>(discordChatService.messagesCache.length);

  const [searchMember, setSearchMember] = useState('');
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  // Moderation Dialogs
  const [memberToBan, setMemberToBan] = useState<ActiveChatMember | null>(null);
  const [banReason, setBanReason] = useState('Violation of community fellowship guidelines');
  const [memberToKick, setMemberToKick] = useState<ActiveChatMember | null>(null);
  const [kickReason, setKickReason] = useState('Kicked by Super Admin');
  const [memberToTimeout, setMemberToTimeout] = useState<ActiveChatMember | null>(null);
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(60);
  const [modSuccessMsg, setModSuccessMsg] = useState<string | null>(null);

  // Announcement State
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('Official Fellowship Apostolic Notice');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Filter members
  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchMember.toLowerCase())) ||
      (m.role && m.role.toLowerCase().includes(searchMember.toLowerCase()))
  );

  const bannedList = Object.values(bannedMembers);

  // Handle Role Assignment
  const handleAssignRole = (memberId: string, roleName: string, roleColor: string) => {
    sounds.playTap();
    discordChatService.assignMemberRole(memberId, roleName, roleColor);
    setMembers([...discordChatService.membersCache]);
    showToast(`Role updated to ${roleName}`);
  };

  // Toast notification
  const showToast = (msg: string) => {
    setModSuccessMsg(msg);
    setTimeout(() => setModSuccessMsg(null), 4000);
  };

  // Handle Ban
  const handleConfirmBan = () => {
    if (!memberToBan) return;
    sounds.playPurgeSound();
    discordChatService.banMember(memberToBan.id, banReason);
    setMembers([...discordChatService.membersCache]);
    setBannedMembers({ ...discordChatService.bannedMembersCache });
    showToast(`Banned @${memberToBan.name} permanently from Fellowship`);
    setMemberToBan(null);
  };

  // Handle Unban
  const handleUnban = (memberId: string, memberName: string) => {
    sounds.playTap();
    discordChatService.unbanMember(memberId);
    setBannedMembers({ ...discordChatService.bannedMembersCache });
    showToast(`Unbanned @${memberName}`);
  };

  // Handle Kick
  const handleConfirmKick = () => {
    if (!memberToKick) return;
    sounds.playTap();
    discordChatService.kickMember(memberToKick.id, kickReason);
    setMembers([...discordChatService.membersCache]);
    showToast(`Kicked @${memberToKick.name} from servers`);
    setMemberToKick(null);
  };

  // Handle Timeout
  const handleConfirmTimeout = () => {
    if (!memberToTimeout) return;
    sounds.playTap();
    discordChatService.timeoutMember(memberToTimeout.id, timeoutMinutes);
    setMembers([...discordChatService.membersCache]);
    showToast(`Muted @${memberToTimeout.name} for ${timeoutMinutes} minutes`);
    setMemberToTimeout(null);
  };

  // Handle Purge Specific User Messages
  const handlePurgeUserMsgs = (member: ActiveChatMember) => {
    sounds.playPurgeSound();
    discordChatService.purgeUserMessages(member.id);
    setMessagesCount(discordChatService.messagesCache.length);
    showToast(`Purged all messages sent by @${member.name}`);
  };

  // Handle Purge All Chat Messages
  const handlePurgeAll = () => {
    sounds.playPurgeSound();
    discordChatService.purgeAllMessages();
    setMessagesCount(discordChatService.messagesCache.length);
    setShowPurgeConfirm(false);
    setPurgeSuccess(true);
    setTimeout(() => setPurgeSuccess(false), 4000);
  };

  // Handle Broadcast Global Announcement
  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    sounds.playTap();
    const cleanText = announcementText.trim();
    const cleanTitle = announcementTitle.trim() || 'Official Notice';

    setAnnouncementText('');

    await discordChatService.sendMessage({
      channelId: 'chan_announcements',
      serverId: 'server_fellowship',
      text: `📢 **GLOBAL ANNOUNCEMENT FROM APP OWNER**\n\n${cleanText}`,
      embed: {
        title: `👑 ${cleanTitle}`,
        description: cleanText,
        color: '#F59E0B',
        author: 'Anthony Williams (App Owner & Super Admin)',
        footer: 'Broadcasted across Fellowship Global network',
      },
    });

    await discordChatService.sendMessage({
      channelId: 'general',
      serverId: 'server_fellowship',
      text: `📢 **GLOBAL ANNOUNCEMENT FROM APP OWNER**\n\n${cleanText}`,
      embed: {
        title: `👑 ${cleanTitle}`,
        description: cleanText,
        color: '#F59E0B',
        author: 'Anthony Williams (App Owner & Super Admin)',
        footer: 'Broadcasted across Fellowship Global network',
      },
    });

    setAnnouncementSuccess(true);
    setTimeout(() => setAnnouncementSuccess(false), 4000);
  };

  return (
    <div className="flex-1 bg-[#1e1f22] text-[#dbdee1] flex flex-col h-full overflow-hidden relative">
      {/* Top Header Bar */}
      <header className="h-14 px-4 sm:px-6 bg-[#2b2d31] border-b border-[#1f2023] flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              Super Admin Command Center
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                App Owner
              </span>
            </h2>
            <p className="text-[11px] text-[#949ba4] hidden sm:block">
              Authorized session for <span className="text-white font-medium">{SUPER_ADMIN_EMAIL}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WebSocket Broker Active (Sub-50ms)</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#35373c] text-stone-300 hover:text-white transition-colors"
            title="Exit Admin Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        {/* Toast / Banner Messages */}
        {modSuccessMsg && (
          <div className="p-3.5 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-amber-400" />
            <span>{modSuccessMsg}</span>
          </div>
        )}

        {purgeSuccess && (
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>Successfully purged all message history! Clean slate broadcasted across all devices.</span>
          </div>
        )}

        {announcementSuccess && (
          <div className="p-3.5 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs font-bold animate-fadeIn">
            <Sparkles className="w-5 h-5 shrink-0 text-amber-400" />
            <span>Global announcement successfully broadcasted to #announcements and #general-fellowship!</span>
          </div>
        )}

        {/* 1. KEY METRICS STATS CARDS */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#949ba4] mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Live Server & System Statistics</span>
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-[#2b2d31] border border-[#3f4147] rounded-xl flex flex-col justify-between shadow-sm hover:border-[#5865F2]/50 transition-all">
              <div className="flex items-center justify-between text-[#949ba4] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Messages</span>
                <MessageSquare className="w-4 h-4 text-[#5865F2]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">{messagesCount}</div>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                ● Live synchronized
              </span>
            </div>

            <div className="p-4 bg-[#2b2d31] border border-[#3f4147] rounded-xl flex flex-col justify-between shadow-sm hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between text-[#949ba4] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Believers</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">{members.length + 1}</div>
              <span className="text-[10px] text-emerald-400 font-bold mt-1">Multi-device real-time</span>
            </div>

            <div className="p-4 bg-[#2b2d31] border border-[#3f4147] rounded-xl flex flex-col justify-between shadow-sm hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between text-[#949ba4] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Fellowship Servers</span>
                <Server className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">{servers.length}</div>
              <button
                onClick={onOpenCreateServer}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold mt-1 text-left flex items-center gap-1"
              >
                + Add new server
              </button>
            </div>

            <div className="p-4 bg-[#2b2d31] border border-[#3f4147] rounded-xl flex flex-col justify-between shadow-sm hover:border-sky-500/50 transition-all">
              <div className="flex items-center justify-between text-[#949ba4] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Banned Users</span>
                <Gavel className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">{bannedList.length}</div>
              <span className="text-[10px] text-rose-400 font-bold mt-1">Blocked from network</span>
            </div>
          </div>
        </div>

        {/* 2. USER ROLE & MODERATION TABLE */}
        <div className="p-4 sm:p-5 bg-[#2b2d31] border border-[#3f4147] rounded-xl space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3f4147] pb-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Member Moderation & Role Manager</span>
              </h3>
              <p className="text-[11px] text-[#949ba4]">
                Ban, kick, timeout, purge messages, or assign roles to any user.
              </p>
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Search member or role..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#3f4147] text-[10px] uppercase font-black tracking-wider text-[#949ba4]">
                  <th className="py-2 px-3">Member</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Assign Role</th>
                  <th className="py-2 px-3 text-right">Owner Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f4147]/50">
                {/* App Owner Row */}
                <tr className="bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                        👑
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>Anthony Williams</span>
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <span className="text-[10px] text-amber-300/80">{SUPER_ADMIN_EMAIL}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                      👑 Super Admin
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-400 text-[11px] italic">
                    Immutable (Root Owner)
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[10px] font-bold text-amber-400">Full Root Authority</span>
                  </td>
                </tr>

                {/* Other Members */}
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#35373c]/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{ backgroundColor: member.roleColor || '#10B981' }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm"
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            {member.name}
                            {member.mutedUntil && member.mutedUntil > Date.now() && (
                              <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold px-1 rounded flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> Muted
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400">
                            {member.email || `#${member.discriminator || '7777'}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        style={{
                          backgroundColor: `${member.roleColor || '#10B981'}20`,
                          color: member.roleColor || '#10B981',
                          borderColor: `${member.roleColor || '#10B981'}40`,
                        }}
                        className="px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider"
                      >
                        {member.role || 'Believer'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {PRESET_ROLES.filter((r) => r.name !== 'Super Admin').map((role) => {
                          const isCurrent = member.role === role.name;
                          return (
                            <button
                              key={role.name}
                              onClick={() => handleAssignRole(member.id, role.name, role.color)}
                              style={{
                                backgroundColor: isCurrent ? role.color : 'transparent',
                                color: isCurrent ? '#FFFFFF' : role.color,
                                borderColor: role.color,
                              }}
                              className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase border transition-all hover:scale-105"
                            >
                              {role.icon} {role.name}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 1-on-1 DM */}
                        <button
                          onClick={() => onOpenDM(member)}
                          className="px-2 py-1 rounded bg-[#5865F2] hover:bg-[#4752c4] text-white text-[10px] font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                          title="Direct Message"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>DM</span>
                        </button>

                        {/* Timeout */}
                        <button
                          onClick={() => setMemberToTimeout(member)}
                          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                          title="Timeout / Mute user"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Mute</span>
                        </button>

                        {/* Purge Messages */}
                        <button
                          onClick={() => handlePurgeUserMsgs(member)}
                          className="px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                          title="Purge all messages from this user"
                        >
                          <Eraser className="w-3 h-3" />
                          <span>Purge</span>
                        </button>

                        {/* Kick */}
                        <button
                          onClick={() => setMemberToKick(member)}
                          className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                          title="Kick user from fellowship"
                        >
                          <UserX className="w-3 h-3" />
                          <span>Kick</span>
                        </button>

                        {/* Ban */}
                        <button
                          onClick={() => setMemberToBan(member)}
                          className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                          title="Ban user permanently"
                        >
                          <Gavel className="w-3 h-3" />
                          <span>Ban</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. BANNED MEMBERS / UNBAN PORTAL */}
        {bannedList.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#2b2d31] border border-rose-500/30 rounded-xl space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-rose-400 flex items-center gap-2">
                <Gavel className="w-4 h-4" />
                <span>Banned Accounts ({bannedList.length})</span>
              </h3>
              <span className="text-[10px] text-stone-400">Blocked from sending messages</span>
            </div>

            <div className="divide-y divide-[#3f4147]/50">
              {bannedList.map((b) => (
                <div key={b.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{b.name}</span>
                      {b.email && <span className="text-stone-400 font-normal">({b.email})</span>}
                    </div>
                    <div className="text-[11px] text-rose-300/80">Reason: {b.reason}</div>
                  </div>

                  <button
                    onClick={() => handleUnban(b.id, b.name)}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow transition-all"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unban User</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. BROADCAST GLOBAL ANNOUNCEMENT */}
        <div className="p-4 sm:p-5 bg-[#2b2d31] border border-[#3f4147] rounded-xl space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-white font-extrabold text-sm">
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>Broadcast Apostolic Notice / Global Announcement</span>
          </div>
          <p className="text-xs text-[#949ba4]">
            Instantly pushes a high-priority official announcement embed across all channels and devices.
          </p>

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-3 pt-1">
            <div>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Announcement Title..."
                className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
            <div>
              <textarea
                rows={3}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Write message to be broadcasted to all believers..."
                className="w-full px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-amber-500 font-normal leading-relaxed"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!announcementText.trim()}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Notice to All Servers</span>
              </button>
            </div>
          </form>
        </div>

        {/* 5. DANGER ZONE: PURGE ALL CHAT HISTORY */}
        <div className="p-4 sm:p-5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone: Global Chat Purge</span>
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Super Admin Only
            </span>
          </div>

          <p className="text-xs text-rose-200/80 leading-relaxed">
            Purging all chat history will clear all messages across all servers and 1-on-1 direct messages, resetting the live stream for all devices connected worldwide.
          </p>

          <div className="pt-1">
            <button
              onClick={() => setShowPurgeConfirm(true)}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge All Chat History</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM BAN MODAL */}
      {memberToBan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#313338] border border-rose-500/50 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-black text-base border-b border-[#3f4147] pb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <Gavel className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="leading-tight">Ban @{memberToBan.name}?</h4>
                <p className="text-xs text-stone-400 font-normal">Blocks user permanently from all servers</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#949ba4] mb-1">
                Reason for Ban
              </label>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for ban..."
                className="w-full px-3 py-2 rounded bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#3f4147]">
              <button
                onClick={() => setMemberToBan(null)}
                className="px-4 py-2 rounded text-xs font-bold text-stone-300 hover:bg-[#35373c]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Gavel className="w-4 h-4" />
                <span>Confirm Ban</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM KICK MODAL */}
      {memberToKick && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#313338] border border-rose-500/50 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-black text-base border-b border-[#3f4147] pb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <UserX className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="leading-tight">Kick @{memberToKick.name}?</h4>
                <p className="text-xs text-stone-400 font-normal">Removes user from active servers</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#949ba4] mb-1">
                Reason for Kick
              </label>
              <input
                type="text"
                value={kickReason}
                onChange={(e) => setKickReason(e.target.value)}
                placeholder="Reason for kick..."
                className="w-full px-3 py-2 rounded bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#3f4147]">
              <button
                onClick={() => setMemberToKick(null)}
                className="px-4 py-2 rounded text-xs font-bold text-stone-300 hover:bg-[#35373c]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmKick}
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <UserX className="w-4 h-4" />
                <span>Confirm Kick</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM TIMEOUT / MUTE MODAL */}
      {memberToTimeout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#313338] border border-amber-500/50 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-amber-400 font-black text-base border-b border-[#3f4147] pb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="leading-tight">Mute / Timeout @{memberToTimeout.name}</h4>
                <p className="text-xs text-stone-400 font-normal">Temporarily prevents sending messages</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#949ba4] mb-1">
                Timeout Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 15, 60, 1440].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTimeoutMinutes(mins)}
                    className={`py-2 rounded text-xs font-bold border transition-all ${
                      timeoutMinutes === mins
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow'
                        : 'bg-[#1e1f22] border-[#3f4147] text-stone-300'
                    }`}
                  >
                    {mins < 60 ? `${mins}m` : mins === 60 ? '1 hour' : '24 hours'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#3f4147]">
              <button
                onClick={() => setMemberToTimeout(null)}
                className="px-4 py-2 rounded text-xs font-bold text-stone-300 hover:bg-[#35373c]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTimeout}
                className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Clock className="w-4 h-4" />
                <span>Set Timeout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM PURGE MODAL */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#313338] border border-rose-500/50 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-black text-base border-b border-[#3f4147] pb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="leading-tight">Purge All Chat History?</h4>
                <p className="text-xs text-stone-400 font-normal">This action is irreversible.</p>
              </div>
            </div>

            <p className="text-xs text-[#dbdee1] leading-relaxed">
              Are you sure you want to purge all messages across all servers and channels? Every device currently online will instantly clear its messages and receive a clean slate.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#3f4147]">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="px-4 py-2 rounded-md text-xs font-bold text-stone-300 hover:bg-[#35373c]"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAll}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Purge Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

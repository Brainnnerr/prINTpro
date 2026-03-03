import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
    AlertTriangle,
    CheckCircle,
    Loader2,
    Mail,
    MessageSquare,
    Trash2,
    User,
    X,
} from "lucide-react";

export default function MessagesTab() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<boolean>(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) setMessages(data);
        setLoading(false);
    };

    const deleteMessage = async () => {
        if (!deleteId) return;
        const { error } = await supabase.from("messages").delete().eq(
            "id",
            deleteId,
        );
        if (!error) {
            setMessages((prev) => prev.filter((m) => m.id !== deleteId));
            setDeleteId(null);
            setFeedback(true);
            setTimeout(() => setFeedback(false), 2000);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Info */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Customer Inquiries
                        </h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            Manage feedback and support tickets
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">
                        {messages.length}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Total Messages
                    </p>
                </div>
            </div>

            {/* Messages List */}
            <div className="grid gap-3">
                {loading
                    ? (
                        <div className="py-20 flex justify-center">
                            <Loader2
                                className="animate-spin text-emerald-500"
                                size={40}
                            />
                        </div>
                    )
                    : messages.length > 0
                    ? (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between group hover:border-emerald-200 transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">
                                            {msg.name}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {msg.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden md:block text-right">
                                        <p className="text-[10px] font-black text-slate-300 uppercase mb-0.5">
                                            Received
                                        </p>
                                        <p className="text-xs font-bold text-slate-500">
                                            {new Date(msg.created_at)
                                                .toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedMsg(msg)}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(msg.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            title="Delete Message"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                    : (
                        <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                            <MessageSquare
                                className="mx-auto text-slate-100 mb-4"
                                size={64}
                            />
                            <p className="text-slate-400 font-bold">
                                Your inbox is empty.
                            </p>
                        </div>
                    )}
            </div>

            {/* VIEW MODAL */}
            {selectedMsg && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in">
                        <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm text-emerald-500">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight">
                                        Message Detail
                                    </h3>
                                    <p className="font-bold text-slate-800">
                                        {selectedMsg.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedMsg(null)}
                                title="Close Message"
                                aria-label="Close Message"
                                className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Sender Name
                                    </p>
                                    <p className="font-bold text-slate-800">
                                        {selectedMsg.full_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Email Address
                                    </p>
                                    <p className="font-bold text-emerald-600">
                                        {selectedMsg.email}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Content
                                </p>
                                <div className="bg-slate-50 p-6 rounded-3xl text-sm font-medium text-slate-600 leading-relaxed italic">
                                    "{selectedMsg.message}"
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedMsg(null)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl"
                            >
                                CLOSE MESSAGE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteId && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in zoom-in">
                    <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase">
                            Delete Message?
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mt-2">
                            This action is permanent and cannot be reversed.
                        </p>
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={deleteMessage}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs shadow-lg"
                            >
                                DELETE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS TOAST */}
            {feedback && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4">
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
                        <div className="bg-emerald-500 p-1 rounded-full">
                            <CheckCircle size={14} className="text-white" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">
                            Inbox Updated
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

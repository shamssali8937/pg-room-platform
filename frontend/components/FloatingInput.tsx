export default function FloatingInput({ icon: Icon, type, value, onChange, label }: any) {
    return (
        <div className="relative">
            <div className="flex items-center gap-2 border border-white/10 bg-white/5 rounded-xl px-3 pt-5 pb-2">
                <Icon size={16} />
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className="bg-transparent outline-none w-full text-sm"
                />
            </div>
            <label className={`absolute left-10 text-xs text-gray-400 ${value ? "top-1" : "top-3"}`}>
                {label}
            </label>
        </div>
    );
}
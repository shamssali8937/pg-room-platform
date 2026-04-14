export default function PasswordChecklist({ password }: { password: string }) {
    const checks = [
        { label: "At least 8 characters", valid: password.length >= 8 },
        { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "Number", valid: /[0-9]/.test(password) },
        { label: "Special character", valid: /[^A-Za-z0-9]/.test(password) },
    ];

    return (
        <div className="text-xs mt-2 space-y-1">
            {checks.map((c, i) => (
                <div key={i} className={c.valid ? "text-green-400" : "text-gray-400"}>
                    • {c.label}
                </div>
            ))}
        </div>
    );
}
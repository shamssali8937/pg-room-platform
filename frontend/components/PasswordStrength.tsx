import zxcvbn from "zxcvbn";

export default function PasswordStrength({ password }: { password: string }) {
    const score = zxcvbn(password).score;
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];

    return (
        <div className="h-2 rounded bg-white/10 mt-1 overflow-hidden">
            <div className={`${colors[score]} h-full`} style={{ width: `${(score + 1) * 20}%` }} />
        </div>
    );
}
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-card p-6 shadow-[0_1px_0_rgba(28,25,23,0.04)] ${className}`}
      {...props}
    />
  );
}

export function Label({
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-1.5 block text-sm font-medium text-stone-800 ${className}`}
      {...props}
    />
  );
}

const controlClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-stone-900 placeholder:text-stone-400";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlClass} ${className}`} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlClass} ${className}`} {...props} />;
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${controlClass} ${className}`} {...props} />;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function buttonClass(variant: ButtonProps["variant"] = "primary") {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  if (variant === "secondary") {
    return `${base} border border-line bg-white text-stone-900 hover:bg-stone-50`;
  }
  if (variant === "ghost") {
    return `${base} text-stone-700 hover:bg-stone-200/60`;
  }
  if (variant === "danger") {
    return `${base} bg-danger text-white hover:bg-red-900`;
  }
  return `${base} bg-accent text-white hover:bg-accent-hover`;
}

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return <button className={`${buttonClass(variant)} ${className}`} {...props} />;
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger"
    >
      {message}
    </p>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="text-center">
      <h2 className="text-xl text-stone-900">{title}</h2>
      <div className="mt-2 text-muted">{children}</div>
    </Card>
  );
}

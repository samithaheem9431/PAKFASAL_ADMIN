import { Link } from "react-router-dom";
import { FileText, GitBranch } from "lucide-react";

export function LearningHome() {
  const cards = [
    {
      to: "/learning/articles",
      title: "Learning articles",
      titleUr: "مضامین",
      desc: "Markdown content, tags, publish status",
      icon: FileText,
    },
    {
      to: "/learning/cultivation",
      title: "Cultivation stages",
      titleUr: "کاشت کے مراحل",
      desc: "Per-crop step sequences",
      icon: GitBranch,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Learning module</h1>
      <p className="mt-1 text-slate-600">Articles and cultivation content</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map(({ to, title, titleUr, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-300"
          >
            <Icon className="h-8 w-8 text-brand-600" />
            <h2 className="mt-3 font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500" dir="rtl">
              {titleUr}
            </p>
            <p className="mt-2 text-sm text-slate-600">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 text-3xl">
        🔍
      </div>
      <h1 className="text-2xl font-extrabold text-text-primary mb-2">
        Page introuvable
      </h1>
      <p className="text-sm text-text-secondary mb-8 max-w-xs">
        Désolé, nous n&apos;avons pas trouvé cette page. 
        Le pro a peut-être déménagé.
      </p>
      <Link href="/" className="btn-primary">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}

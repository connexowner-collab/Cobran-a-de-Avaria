'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="text-slate-500">Carregando documentação...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Documentação da API</h1>
        <p className="mt-1 text-slate-600">
          Swagger/OpenAPI 3.0 — Gestão de clientes/Externo do Portal do Cliente. Especificação em{' '}
          <a href="/openapi.yaml" className="text-primary-600 hover:underline" download>
            /openapi.yaml
          </a>
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white [&_.swagger-ui]:!font-sans">
        <SwaggerUI
          url="/openapi.yaml"
          docExpansion="list"
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={3}
          persistAuthorization
        />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/lib/api-context';
import { StatusIndicator } from './status-indicator';

const FIELD_TYPES_DOC = [
  {
    type: 'text',
    description: 'Input teks satu baris',
    render: '<input type="text" />',
  },
  {
    type: 'number',
    description: 'Input angka',
    render: '<input type="number" />',
  },
  {
    type: 'email',
    description: 'Input email dengan validasi format',
    render: '<input type="email" />',
  },
  {
    type: 'date',
    description: 'Pemilih tanggal (date picker)',
    render: '<input type="date" />',
  },
  {
    type: 'textarea',
    description: 'Area teks multi-baris',
    render: '<textarea></textarea>',
  },
  {
    type: 'select',
    description: 'Dropdown pilihan (backend harus kirim options[])',
    render: '<select><option>...</option></select>',
  },
  {
    type: 'boolean',
    description: 'Checkbox true/false',
    render: '<input type="checkbox" />',
  },
];

const SCHEMA_EXAMPLE_COMPLETE = `{
  "student": {
    "name": "Muhammad Nouval Habibie",
    "nim": "2211521020"
  },
  "resource": {
    "name": "books",
    "label": "Data Buku",
    "description": "Aplikasi untuk mengelola data buku"
  },
  "fields": [
    {
      "name": "title",
      "label": "Judul Buku",
      "type": "text",
      "required": true,
      "showInTable": true
    },
    {
      "name": "author",
      "label": "Penulis",
      "type": "text",
      "required": true,
      "showInTable": true
    },
    {
      "name": "year",
      "label": "Tahun Terbit",
      "type": "number",
      "required": false,
      "showInTable": true
    },
    {
      "name": "category",
      "label": "Kategori",
      "type": "select",
      "options": ["Fiksi", "Non-Fiksi", "Teknologi", "Sejarah"],
      "required": true,
      "showInTable": true
    },
    {
      "name": "description",
      "label": "Deskripsi",
      "type": "textarea",
      "required": false,
      "showInTable": false
    }
  ],
  "endpoints": {
    "list": "/items",
    "detail": "/items/{id}",
    "create": "/items",
    "update": "/items/{id}",
    "delete": "/items/{id}"
  }
}`;

const BACKEND_EXAMPLE = `app.get("/schema", (req, res) => {
  res.json({
    resource: "berita",
    fields: [
      { name: "title",   label: "Judul Berita",  type: "text",     required: true },
      { name: "author",  label: "Penulis",        type: "text",     required: true },
      { name: "category",label: "Kategori",       type: "select",
        options: ["Olahraga","Teknologi","Ekonomi","Politik","Hiburan"] },
      { name: "published_at", label: "Tanggal Terbit", type: "date" },
      { name: "content", label: "Isi Berita",     type: "textarea", required: true },
    ],
    endpoints: {
      list: "/items", detail: "/items/{id}",
      create: "/items", update: "/items/{id}", delete: "/items/{id}"
    }
  });
});`;

const FIELD_PROPERTIES = [
  { prop: 'name', type: 'string (wajib)', desc: 'Nama field, dikirim sebagai key di request API' },
  { prop: 'label', type: 'string (wajib)', desc: 'Label yang ditampilkan di form dan tabel' },
  { prop: 'type', type: 'string (wajib)', desc: 'Salah satu: text, number, email, date, textarea, select, boolean' },
  { prop: 'required', type: 'boolean', desc: 'Jika true, field ditandai wajib diisi' },
  { prop: 'showInTable', type: 'boolean', desc: 'Jika true, field muncul di tabel (default: true)' },
  { prop: 'options', type: 'string[]', desc: 'Hanya untuk type "select". Daftar pilihan dropdown' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/80 hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
      title="Salin ke clipboard"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

export function SchemaGuide() {
  const api = useApi();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Logo_Unand_PTNBH.png/1920px-Logo_Unand_PTNBH.png"
              alt="Logo Unand"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Panduan Format Skema</h1>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span>Tugas Besar Cloud Computing 2026</span>
                {mounted && api.student && (
                  <div className="flex items-center gap-2 pl-4 border-l border-border">
                    <span className="font-medium">{api.student.name}</span>
                    <span>•</span>
                    <span>{api.student.nim}</span>
                  </div>
                )}
              </div>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <StatusIndicator />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Intro */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Tentang Skema API</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Frontend ini dapat membaca skema secara otomatis dari endpoint <code className="text-primary font-mono text-xs px-1">GET /schema</code> di backend Anda. 
            Setelah backend menyediakan endpoint tersebut, frontend akan otomatis men-generate form input dan tabel -- tanpa perlu definisi manual.
          </p>
        </div>

        {/* Field Types */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Tipe Field yang Didukung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FIELD_TYPES_DOC.map((ft) => (
              <div key={ft.type} className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border">
                <code className="text-primary font-mono text-sm font-semibold whitespace-nowrap min-w-[80px]">
                  {ft.type}
                </code>
                <div>
                  <p className="text-sm text-foreground font-medium">{ft.description}</p>
                  <code className="text-[11px] text-muted-foreground font-mono">{ft.render}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Field Properties */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Properti Field (Lengkap)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold text-foreground">Properti</th>
                  <th className="text-left py-2 px-3 font-semibold text-foreground">Tipe</th>
                  <th className="text-left py-2 px-3 font-semibold text-foreground">Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {FIELD_PROPERTIES.map((p) => (
                  <tr key={p.prop} className="border-b border-border last:border-0">
                    <td className="py-2.5 px-3">
                      <code className="text-primary font-mono text-xs">{p.prop}</code>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-muted-foreground font-mono">{p.type}</span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Complete Schema Format */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Format Lengkap Schema JSON</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Format lengkap dengan student, resource, endpoints, dan fields. Digunakan oleh endpoint <code className="text-primary font-mono text-xs px-1">GET /schema</code> di backend dan fitur Import JSON di frontend.
          </p>
          <div className="relative">
            <pre className="p-4 bg-muted rounded-lg text-[12px] text-foreground font-mono overflow-x-auto border border-border leading-relaxed">
              {SCHEMA_EXAMPLE_COMPLETE}
            </pre>
            <CopyButton text={SCHEMA_EXAMPLE_COMPLETE} />
          </div>
        </section>

        {/* Backend Endpoint */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Backend: Implementasi Endpoint /schema</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Contoh implementasi endpoint <code className="text-primary font-mono text-xs px-1">GET /schema</code> di backend Express/Node.js:
          </p>
          <div className="relative">
            <pre className="p-4 bg-muted rounded-lg text-[12px] text-foreground font-mono overflow-x-auto border border-border leading-relaxed">
              {BACKEND_EXAMPLE}
            </pre>
            <CopyButton text={BACKEND_EXAMPLE} />
          </div>
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground font-medium">Alur Kerja:</p>
            <ol className="mt-2 text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Backend menyediakan endpoint <code className="text-primary font-mono text-xs">GET /schema</code></li>
              <li>User memasukkan URL backend di halaman Dashboard</li>
              <li>Frontend otomatis memanggil <code className="text-primary font-mono text-xs">/schema</code> dan membaca definisi field</li>
              <li>Tabel data dan form input langsung tampil tanpa konfigurasi manual</li>
              <li>User dapat melakukan Create, Read, Update, Delete (CRUD) melalui antarmuka</li>
            </ol>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-8">
          <p>Universitas Andalas — Tugas Besar Cloud Computing 2026</p>
          <p className="mt-1">Muhammad Nouval Habibie — 2211521020 dan Mustafa Fathur Rahman — 2211522026</p>
        </div>
      </div>
    </div>
  );
}

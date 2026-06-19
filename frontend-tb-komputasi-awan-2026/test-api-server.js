const http = require('http');

const schemaData = {
  student: {
    name: "Muhammad Nouval Habibie",
    nim: "2211521020"
  },
  resource: {
    name: "books",
    label: "Data Buku",
    description: "Aplikasi untuk mengelola data buku"
  },
  fields: [
    {
      name: "title",
      label: "Judul Buku",
      type: "text",
      required: true,
      showInTable: true
    },
    {
      name: "author",
      label: "Penulis",
      type: "text",
      required: true,
      showInTable: true
    },
    {
      name: "year",
      label: "Tahun Terbit",
      type: "number",
      required: false,
      showInTable: true
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "textarea",
      required: false,
      showInTable: false
    }
  ],
  endpoints: {
    list: "/books",
    detail: "/books/{id}",
    create: "/books",
    update: "/books/{id}",
    delete: "/books/{id}"
  }
};

const books = [
  { id: 1, title: "Harry Potter", author: "J.K. Rowling", year: 1997 },
  { id: 2, title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937 },
  { id: 3, title: "1984", author: "George Orwell", year: 1949 }
];

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/schema' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(schemaData));
  } else if (req.url === '/books' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ items: books, total: books.length }));
  } else if (req.url.match(/^\/books\/\d+$/) && req.method === 'GET') {
    const id = parseInt(req.url.split('/')[2]);
    const book = books.find(b => b.id === id);
    if (book) {
      res.writeHead(200);
      res.end(JSON.stringify(book));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: 'Not found' }));
    }
  } else if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Test API Server' }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Not found' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Test API Server running at http://localhost:${PORT}`);
  console.log(`Schema available at http://localhost:${PORT}/schema`);
});

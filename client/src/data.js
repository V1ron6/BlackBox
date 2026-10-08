export const CATEGORIES = ['All', 'Documents', 'Media', 'Student', 'Work'];

// kind: 'client' runs in the browser, 'server' posts to /api/tools/:id/run
export const TOOLS = [
  { id: 'pdf-merge', name: 'Merge PDFs', desc: 'Combine several PDFs into one.', category: 'Documents', icon: 'FilePlus2', kind: 'server', accept: '.pdf', multiple: true },
  { id: 'word-to-pdf', name: 'Word to PDF', desc: 'Convert Word documents to PDF.', category: 'Documents', icon: 'FileText', kind: 'server', accept: '.doc,.docx,.odt,.rtf,.txt' },
  { id: 'video', name: 'Video Downloader', desc: 'Save a video or its audio from a link.', category: 'Media', icon: 'Download', kind: 'server',
    fields: [{ name: 'url', label: 'Video URL' }, { name: 'format', label: 'Format', options: ['video', 'audio'] }] },
  { id: 'podcast', name: 'Podcast Downloader', desc: 'Find a show and download episodes.', category: 'Media', icon: 'Podcast', kind: 'server',
    fields: [{ name: 'query', label: 'Podcast name or RSS URL' }] },
  { id: 'gpa', name: 'GPA Calculator', desc: 'Work out your GPA from grades and credits.', category: 'Student', icon: 'GraduationCap', kind: 'client' },
  { id: 'word-count', name: 'Word Counter', desc: 'Words, characters, sentences, reading time.', category: 'Student', icon: 'Type', kind: 'client' },
  { id: 'qr', name: 'QR Generator', desc: 'Turn text or a link into a QR code.', category: 'Work', icon: 'QrCode', kind: 'client' },
];

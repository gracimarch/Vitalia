"""
Vitalia Local Dev Server
Mimics Vercel's rewrite rules so clean URLs like /rutinas/slug work locally.
All unmatched routes fall back to /404.html, which then runs 404-router.js.
"""
import http.server
import socketserver
import os

PORT = 3000

# Must match vercel.json rewrites (prefix → template HTML)
REWRITES = {
    'rutinas':     '/pages/rutina.html',
    'dietas':      '/pages/dieta.html',
    'lecturas':    '/pages/lectura.html',
    'blog':        '/pages/blog.html',
    'mi-espacio':  '/pages/mi-espacio.html',
    'formulario':  '/pages/form.html',
}


class VitaliaHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Strip query string
        raw_path = self.path.split('?')[0].rstrip('/')

        # Root
        if raw_path == '' or raw_path == '/index.html':
            self.path = '/index.html'
            return super().do_GET()

        # Split into segments: /rutinas/slug → ['rutinas', 'slug']
        parts = [p for p in raw_path.split('/') if p]

        if parts:
            prefix = parts[0]

            # Match a known rewrite prefix
            if prefix in REWRITES:
                # Serve the template HTML — VitaliaRouter will read the clean
                # URL from sessionStorage (set by 404-router) or window.location
                self.path = REWRITES[prefix]
                return super().do_GET()

            # Static asset or known file → serve normally
            physical = self.translate_path(raw_path)
            if os.path.isfile(physical):
                self.path = raw_path
                return super().do_GET()

            # Directory with index.html
            if os.path.isdir(physical) and os.path.isfile(os.path.join(physical, 'index.html')):
                self.path = raw_path + '/index.html'
                return super().do_GET()

        # Fallback: 404.html (runs 404-router.js)
        self.path = '/404.html'
        return super().do_GET()

    def log_message(self, format, *args):
        # Minimal log
        print(f'[Vitalia] {args[0]} → {args[1]}')


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(('', PORT), VitaliaHandler) as httpd:
        httpd.allow_reuse_address = True
        print(f'\n✅  Vitalia Dev Server → http://localhost:{PORT}\n')
        httpd.serve_forever()

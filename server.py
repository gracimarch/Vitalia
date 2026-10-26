#!/usr/bin/env python3
"""
Vitalia Legacy Local Server
Handles clean URL rewrites matching vercel.json and serves custom 404.html.
"""

import http.server
import socketserver
import urllib.parse
import os
import re
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

REWRITES = [
    (r"^/blog/?$", "/pages/blog.html"),
    (r"^/mi-espacio/?$", "/pages/mi-espacio.html"),
    (r"^/iniciar-sesion/?$", "/pages/login.html"),
    (r"^/crear-cuenta/?$", "/pages/form.html"),
    (r"^/perfil/?$", "/pages/perfil.html"),
    (r"^/privacidad/?$", "/pages/privacidad.html"),
    (r"^/terminos/?$", "/pages/terminos.html"),
    (r"^/lecturas/(?P<slug>[^/]+)/?$", "/pages/lectura.html"),
    (r"^/dietas/(?P<slug>[^/]+)/?$", "/pages/dieta.html"),
    (r"^/rutinas/(?P<slug>[^/]+)/?$", "/pages/rutina.html"),
]

class VitaliaLegacyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path)
        clean_path = parsed.path

        # 1. Exact rewrite check
        for pattern, destination in REWRITES:
            m = re.match(pattern, clean_path)
            if m:
                slug = m.groupdict().get("slug")
                query_parts = []
                if parsed.query:
                    query_parts.append(parsed.query)
                if slug and "slug=" not in parsed.query:
                    query_parts.append(f"slug={urllib.parse.quote(slug)}")
                new_query = "&".join(query_parts)
                self.path = destination + (f"?{new_query}" if new_query else "")
                return super().do_GET()

        # 2. Check if static file or directory exists
        translated = self.translate_path(self.path)
        if os.path.exists(translated):
            return super().do_GET()

        # 3. Check if clean path + .html exists (e.g. /pages/blog -> /pages/blog.html)
        candidate_html = translated + ".html"
        if os.path.exists(candidate_html):
            self.path = clean_path + ".html" + (f"?{parsed.query}" if parsed.query else "")
            return super().do_GET()

        # 4. Fallback: serve 404.html with 404 status
        not_found_file = os.path.join(DIRECTORY, "404.html")
        if os.path.exists(not_found_file):
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            with open(not_found_file, "rb") as f:
                content = f.read()
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        return super().do_GET()

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"  [{self.log_date_time_string()}] {format % args}\n")

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == "__main__":
    with ThreadedTCPServer(("", PORT), VitaliaLegacyHandler) as httpd:
        print(f"\n  ╔════════════════════════════════════════╗")
        print(f"  ║        Vitalia Legacy Server           ║")
        print(f"  ║   HTML/CSS version (pre-Next.js)       ║")
        print(f"  ╚════════════════════════════════════════╝")
        print(f"\n  → http://localhost:{PORT}")
        print(f"  → Press Ctrl+C to stop\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server stopped.")

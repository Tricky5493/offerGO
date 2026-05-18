#!/usr/bin/env python3
"""
OfferGO 统一开发服务器
单端口同时提供：静态文件 + /api/optimize 代理
零 CORS 问题，零跨域
"""

import json
import os
import sys
import mimetypes
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 8765
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_KEY = "sk-e6113262c73345e899f216fa56127147"

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
}


class Server(BaseHTTPRequestHandler):

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/":
            path = "/OfferGO_V2.3.0.html"
        filepath = os.path.join(FRONTEND_DIR, path.lstrip("/"))
        if os.path.isfile(filepath) and os.path.commonpath([os.path.abspath(filepath), FRONTEND_DIR]) == FRONTEND_DIR:
            ext = os.path.splitext(filepath)[1]
            self.send_response(200)
            self.send_header("Content-Type", MIME.get(ext, "application/octet-stream"))
            self.end_headers()
            with open(filepath, "rb") as f:
                self.wfile.write(f.read())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def do_POST(self):
        if self.path != "/api/optimize":
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error":"not found"}')
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}

            if "model" not in body or "messages" not in body:
                self._json(400, {"error": "缺少必要字段: model, messages"})
                return

            resp = requests.post(
                DEEPSEEK_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {DEEPSEEK_KEY}",
                },
                json=body,
                timeout=60,
            )
            self._json(resp.status_code, resp.json())

        except requests.exceptions.Timeout:
            self._json(504, {"error": "DeepSeek API 超时"})
        except requests.exceptions.RequestException as e:
            self._json(502, {"error": f"DeepSeek 请求失败: {e}"})
        except Exception as e:
            self._json(500, {"error": f"服务器错误: {e}"})

    def _json(self, code, data):
        try:
            self.send_response(code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))
        except (BrokenPipeError, ConnectionResetError):
            pass  # 客户端已断开，忽略

    def log_message(self, fmt, *args):
        print(f"  [{self.command}] {self.path}")


def main():
    os.chdir(FRONTEND_DIR)
    print(f"OfferGO Dev Server  http://localhost:{PORT}")
    print(f"  静态文件: {FRONTEND_DIR}")
    print(f"  API 代理: /api/optimize → {DEEPSEEK_URL}")
    print("  Ctrl+C to stop\n")
    HTTPServer(("127.0.0.1", PORT), Server).serve_forever()


if __name__ == "__main__":
    main()

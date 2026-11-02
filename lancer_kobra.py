"""Serve Kobra on one stable local address so browser storage persists."""

from pathlib import Path
from threading import Timer
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import webbrowser
import traceback


APP_DIRECTORY = Path(__file__).resolve().parent
ADDRESS = "127.0.0.1"
PORT = 8765
URL = f"http://{ADDRESS}:{PORT}/index.html"
LOG_FILE = APP_DIRECTORY / "kobra-server.log"


def log(message):
    with LOG_FILE.open("a", encoding="utf-8") as log_file:
        log_file.write(message.rstrip() + "\n")


class KobraHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIRECTORY), **kwargs)

    def log_message(self, format_string, *args):
        log("HTTP " + (format_string % args))


def main():
    try:
        server = ThreadingHTTPServer((ADDRESS, PORT), KobraHandler)
    except OSError as error:
        # A previous hidden instance may already be serving Kobra.
        log(f"Port {PORT} indisponible: {error}. Tentative d’ouverture de {URL}")
        try:
            webbrowser.open(URL)
        except Exception:
            log(traceback.format_exc())
        return

    log(f"Serveur lancé sur {URL}")
    Timer(0.8, lambda: webbrowser.open(URL)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    except Exception:
        log(traceback.format_exc())
    finally:
        server.server_close()
        log("Serveur arrêté.")


if __name__ == "__main__":
    main()

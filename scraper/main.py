import os
import re
import json
import time
import subprocess
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright

# ==========================
# CONFIG
# ==========================
BASE = os.path.dirname(os.path.dirname(__file__))
ARQ = os.path.join(BASE, "frontend", "public", "conquistas.json")

URL = "https://br.twstats.com/br141/index.php?page=ennoblements"

DIAS_HISTORICO = 7
MAX_RETRY = 3

# ==========================
def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def carregar():
    if not os.path.exists(ARQ):
        return []
    try:
        with open(ARQ, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def salvar(lista):
    with open(ARQ, "w", encoding="utf-8") as f:
        json.dump(lista, f, ensure_ascii=False, indent=2)

def limpar(lista):
    limite = datetime.now() - timedelta(days=DIAS_HISTORICO)
    nova = []

    for x in lista:
        try:
            dt = datetime.strptime(x["data_hora_conquista"], "%Y-%m-%d %H:%M:%S")
            if dt >= limite:
                nova.append(x)
        except:
            pass

    return nova

def baixar_html():
    for tentativa in range(MAX_RETRY):
        try:
            log("Abrindo navegador...")

            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=["--no-sandbox"]
                )

                page = browser.new_page()
                page.goto(URL, wait_until="domcontentloaded")
                page.wait_for_timeout(10000)

                html = page.content()

                browser.close()

                return html

        except Exception as e:
            log(str(e))
            time.sleep(5)

    raise Exception("Falha ao acessar")

def parse_player(txt):
    txt = " ".join(txt.split())

    if "Aldeia de Bárbaros" in txt:
        return "Aldeia de Bárbaros", None

    m = re.match(r"(.+?)\s*\[(.+?)\]$", txt)

    if m:
        return m.group(1), m.group(2)

    return txt, None

def extrair(html):
    soup = BeautifulSoup(html, "html.parser")
    linhas = soup.select("tr.r1, tr.r2")

    eventos = []

    for tr in linhas:
        try:
            tds = tr.find_all("td")
            if len(tds) < 5:
                continue

            coord = re.search(r"\((\d+\|\d+)\)", tds[0].get_text()).group(1)

            anterior = tds[2].get_text(" ", strip=True)
            novo = tds[3].get_text(" ", strip=True)
            data = tds[4].get_text(" ", strip=True).replace(" - ", " ")

            pa, ta = parse_player(anterior)
            pn, tn = parse_player(novo)

            eventos.append({
                "coordenadas": coord,
                "proprietario_anterior": pa,
                "tribo_anterior": ta,
                "proprietario_novo": pn,
                "tribo_nova": tn,
                "data_hora_conquista": data
            })

        except:
            pass

    return eventos

def git_push():
    log("Enviando GitHub...")

    subprocess.run("git add .", shell=True)
    subprocess.run('git commit -m "update radar" || true', shell=True)
    subprocess.run("git push", shell=True)

def main():
    log("Iniciando")

    banco = limpar(carregar())
    html = baixar_html()
    eventos = extrair(html)

    chaves = set(
        f'{x["coordenadas"]}|{x["data_hora_conquista"]}'
        for x in banco
    )

    novos = []

    for e in eventos:
        chave = f'{e["coordenadas"]}|{e["data_hora_conquista"]}'

        if chave not in chaves:
            novos.append(e)

    banco = novos + banco
    banco = limpar(banco)

    salvar(banco)

    log(f"{len(novos)} novos")

    git_push()

main()
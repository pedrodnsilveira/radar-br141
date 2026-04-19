import os
import re
import json
import time
#import requests
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

# ======================================================
# CONFIG
# ======================================================
BASE = os.path.dirname(os.path.dirname(__file__))
ARQ = os.path.join(BASE, "frontend", "public", "conquistas.json")

DIAS_HISTORICO = 7
TIMEOUT = 25
MAX_RETRY = 3

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

# ======================================================
# HELPERS
# ======================================================
def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def garantir_pasta():
    os.makedirs(os.path.dirname(ARQ), exist_ok=True)

def carregar():
    if not os.path.exists(ARQ):
        return []

    try:
        with open(ARQ, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def salvar(dados):
    with open(ARQ, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

def limpar_antigos(lista):
    limite = datetime.now() - timedelta(days=DIAS_HISTORICO)

    nova = []

    for item in lista:
        try:
            dt = datetime.strptime(
                item["data_hora_conquista"],
                "%Y-%m-%d %H:%M:%S"
            )

            if dt >= limite:
                nova.append(item)

        except:
            pass

    return nova

def ordenar(lista):
    return sorted(
        lista,
        key=lambda x: x["data_hora_conquista"],
        reverse=True
    )

def parse_player(txt):
    """
    Exemplos:
    MONTEIRO1 [DuMau]
    - Bjorn Ironside [FN]
    Aldeia de Bárbaros
    """

    txt = " ".join(txt.split()).strip()

    if not txt:
        return None, None

    if "Aldeia de Bárbaros" in txt:
        return "Aldeia de Bárbaros", None

    m = re.match(r"(.+?)\s*\[(.+?)\]$", txt)

    if m:
        return m.group(1).strip(), m.group(2).strip()

    return txt, None

def baixar_html():
    for tentativa in range(1, MAX_RETRY + 1):
        try:
            log(f"Baixando página... tentativa {tentativa}")

            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-blink-features=AutomationControlled"
                    ]
                )

                page = browser.new_page(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
                    viewport={"width": 1366, "height": 768},
                    locale="pt-BR"
                )

                page.goto(URL, wait_until="networkidle", timeout=60000)

                html = page.content()

                browser.close()

                return html

        except Exception as e:
            log(f"Erro: {e}")

            if tentativa < MAX_RETRY:
                time.sleep(3)
            else:
                raise

def baixar_html_requests():
    for tentativa in range(1, MAX_RETRY + 1):
        try:
            log(f"Baixando página... tentativa {tentativa}")

            r = requests.get(
                URL,
                headers=HEADERS,
                timeout=TIMEOUT
            )

            r.raise_for_status()

            return r.text

        except Exception as e:
            log(f"Erro: {e}")

            if tentativa < MAX_RETRY:
                time.sleep(3)
            else:
                raise

# ======================================================
# SCRAPING
# ======================================================
def extrair_eventos(html):
    soup = BeautifulSoup(html, "html.parser")

    linhas = soup.select("tr.r1, tr.r2")

    eventos = []

    for tr in linhas:
        try:
            tds = tr.find_all("td")

            if len(tds) < 5:
                continue

            # -----------------------------------------
            # Coordenadas
            # -----------------------------------------
            aldeia = tds[0].get_text(" ", strip=True)

            m = re.search(r"\((\d+\|\d+)\)", aldeia)

            coord = m.group(1) if m else None

            if not coord:
                continue

            # -----------------------------------------
            # Detectar formato:
            #
            # NORMAL:
            # [0] aldeia
            # [1] pontos
            # [2] anterior
            # [3] novo
            # [4] data
            #
            # BÁRBAROS:
            # [0] aldeia
            # [1] pontos
            # [2] hidden barbaros
            # [3] novo
            # [4] data
            # -----------------------------------------

            if len(tds) == 5 and "hidden" not in tds[2].get("class", []):
                anterior_txt = tds[2].get_text(" ", strip=True)
                novo_txt = tds[3].get_text(" ", strip=True)
                data = tds[4].get_text(" ", strip=True)

                proprietario_anterior, tribo_anterior = parse_player(anterior_txt)
                proprietario_novo, tribo_nova = parse_player(novo_txt)

            else:
                proprietario_anterior = "Aldeia de Bárbaros"
                tribo_anterior = None

                novo_txt = tds[3].get_text(" ", strip=True)
                proprietario_novo, tribo_nova = parse_player(novo_txt)

                data = tds[4].get_text(" ", strip=True)

            data = data.replace(" - ", " ")

            eventos.append({
                "coordenadas": coord,
                "proprietario_anterior": proprietario_anterior,
                "tribo_anterior": tribo_anterior,
                "proprietario_novo": proprietario_novo,
                "tribo_nova": tribo_nova,
                "data_hora_conquista": data
            })

        except:
            continue

    return eventos

# ======================================================
# MAIN
# ======================================================
def main():
    log("Iniciando scraping")

    garantir_pasta()

    banco = carregar()
    banco = limpar_antigos(banco)

    chaves = set(
        f'{x["coordenadas"]}|{x["data_hora_conquista"]}'
        for x in banco
    )

    html = baixar_html()
    eventos = extrair_eventos(html)

    log(f"{len(eventos)} eventos encontrados")

    novos = []

    for e in eventos:
        chave = f'{e["coordenadas"]}|{e["data_hora_conquista"]}'

        if chave in chaves:
            continue

        novos.append(e)
        chaves.add(chave)

    banco = novos + banco
    banco = limpar_antigos(banco)
    banco = ordenar(banco)

    salvar(banco)

    log(f"{len(novos)} novos registros")
    log(f"{len(banco)} total salvo")
    log("Finalizado com sucesso")

#inicial
#n=10;
#for i in range(1, 11): 
#    URL = 'https://br.twstats.com/br141/index.php?page=ennoblements&pn='+str(n)
#    n=n-1
#    main()
#    time.sleep(2)

#rotina
URL = "https://br.twstats.com/br141/index.php?page=ennoblements&live=live"
if __name__ == "__main__":
    main()
import os
import re
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

URL = "https://br.twstats.com/br141/index.php?page=ennoblements&live=live"

BASE = os.path.dirname(os.path.dirname(__file__))
DATA = os.path.join(BASE, "data")
ARQ = os.path.join(DATA, "conquistas.json")

os.makedirs(DATA, exist_ok=True)

def carregar():
    if not os.path.exists(ARQ):
        return []
    with open(ARQ, "r", encoding="utf-8") as f:
        return json.load(f)

def salvar(dados):
    with open(ARQ, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

def limpar_antigos(lista):
    limite = datetime.now() - timedelta(days=7)
    nova = []

    for item in lista:
        dt = datetime.strptime(item["data_hora_conquista"], "%Y-%m-%d %H:%M:%S")
        if dt >= limite:
            nova.append(item)

    return nova

def parse_player(txt):
    # yacabo [RIP]
    m = re.match(r"(.+?)\s*\[(.+?)\]$", txt.strip())
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return txt.strip(), None

def main():
    html = requests.get(URL, timeout=20).text
    soup = BeautifulSoup(html, "html.parser")

    linhas = soup.select("tr.r1, tr.r2")

    banco = carregar()
    chaves = set(
        f'{x["coordenadas"]}|{x["data_hora_conquista"]}'
        for x in banco
    )

    ultimos_donos = {}

    for item in banco:
        ultimos_donos[item["coordenadas"]] = {
            "player": item["proprietario_novo"],
            "tribo": item["tribo_nova"]
        }

    novos = []

    for tr in linhas:
        tds = tr.find_all("td")
        if len(tds) < 5:
            continue

        aldeia = tds[0].get_text(" ", strip=True)
        coord = re.search(r"\((\d+\|\d+)\)", aldeia)
        coord = coord.group(1) if coord else None

        player_txt = tds[3].get_text(" ", strip=True)
        novo_player, nova_tribo = parse_player(player_txt)

        data = tds[4].get_text(" ", strip=True).replace(" - ", " ")

        chave = f"{coord}|{data}"
        if chave in chaves:
            continue

        anterior = ultimos_donos.get(coord, {})

        registro = {
            "coordenadas": coord,
            "proprietario_anterior": anterior.get("player"),
            "tribo_anterior": anterior.get("tribo"),
            "proprietario_novo": novo_player,
            "tribo_nova": nova_tribo,
            "data_hora_conquista": data
        }

        novos.append(registro)

    banco = novos + banco
    banco = limpar_antigos(banco)
    salvar(banco)

if __name__ == "__main__":
    main()
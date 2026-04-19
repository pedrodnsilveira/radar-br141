import requests

BOT_TOKEN = "7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA"
CHAT_ID = "-1003745250406"

TRIBOS_ALERTA = ["RIP", "GALOS", "GAL0S"]

RANGES = [
    ("K44", 400, 499, 400, 499),
    ("K53", 500, 599, 300, 399),
    ("K54", 500, 599, 400, 499),
    ("K55", 500, 599, 500, 599),
    ("K58", 500, 599, 800, 899),
    ("K67", 600, 699, 700, 799),
    ("K68", 600, 699, 800, 899),
]

def enviar_telegram(msg):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    payload = {
        "chat_id": CHAT_ID,
        "text": msg
    }

    requests.post(url, data=payload, timeout=20)


def coord_em_range(coord):
    try:
        x, y = coord.split("|")
        x = int(x)
        y = int(y)

        for nome, min_x, max_x, min_y, max_y in RANGES:
            if min_x <= x <= max_x and min_y <= y <= max_y:
                return nome

        return None

    except:
        return None


def eh_tribo_alerta(nome_tribo):
    if not nome_tribo:
        return False

    return nome_tribo.upper() in TRIBOS_ALERTA


def notificar_conquistas(lista_novos):
    enviados = []

    for item in lista_novos:

        coord = item["coordenadas"]
        tribo_nova = item["tribo_nova"]

        k = coord_em_range(coord)

        if not k:
            continue

        cabecalho = "Nova conquista detectada!"

        if eh_tribo_alerta(tribo_nova):
            cabecalho = "🚨 ATENÇÃO! Nova conquista detectada! 🚨"

        msg = f"""{cabecalho}

🗺 Continente: {k}
📍 Coordenadas: {coord}

👤 Novo dono: {item['proprietario_novo']}
🏰 Tribo nova: {tribo_nova}

👤 Antigo dono: {item['proprietario_anterior']}
🏰 Tribo anterior: {item['tribo_anterior']}

🕒 {item['data_hora_conquista']}
"""

        enviar_telegram(msg)
        enviados.append(coord)

    return enviados

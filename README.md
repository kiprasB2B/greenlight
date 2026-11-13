# Greenlight

**Greenlight** – lošimo automatas, kuris išsuka viral verslo idėją. Startuoliui „gauti žalią šviesą“ reiškia pradėti.

Svetainė: https://kiprasb2b.github.io/greenlight/

## Kaip veikia

- **3 būgnai:** 01 Niša · 02 Auditorija · 03 Strategija. Trečias būgnas visada sustoja ties efektyviausia strategija tai nišos ir auditorijos porai (vertinama pagal žymas, rodomas tinkamumo %).
- **Sukimas:** mygtukas **IŠSUK**, svirtis dešinėje arba **tarpo** klavišas. Būgnai sustoja paeiliui, su sulėtėjimu ir blur efektu.
- **Konfeti** aplink kiekvieną sustojusį būgną, pabaigoje – aplink visą automatą.
- **7 7 7 jackpot:** atsitiktinai ~1 iš 22 sukimų arba paspaudus klavišą **7** tris kartus.
- **Užraktai:** kiekvieną būgną galima užrakinti, o pirmus du – pakeisti savo įrašu.
- **Rezultatas:** prekės ženklas, idėja, problema / sprendimas / kodėl plis, pirmas video hook'as ir 14 dienų planas su laiko juosta (D01–D14) ir pažymimais langeliais.
- **Katalogas:** visos 13 strategijų, surikiuotos pagal tinkamumą; laimėjusią galima pakeisti kita.
- **localStorage:** paskutinių sukimų istorija, pažymėti plano žingsniai ir garso nustatymas.

## Failai

| Failas | Paskirtis |
| --- | --- |
| `index.html` | Puslapio struktūra |
| `styles.css` | Dizainas (Neo Green paletė, 60/30/10) |
| `data.js` | Nišos, auditorijos ir strategijos |
| `app.js` | Būgnai, sukimas, konfeti, garsas, rezultatas, katalogas, istorija |

Jokio build žingsnio – tai grynas statinis puslapis.

## Paleisti vietoje

```bash
python3 -m http.server 8000
```

Tada atidaryk http://localhost:8000.

## Dizainas

- **Spalvos (60/30/10):** kreminė `#F5F3E9` (fonas) · tamsiai žalia `#0D211B` ir miško žalia `#174C3A` (tekstas, automatas, tamsios kortelės) · lime `#C5F36B` tik tam, ką spaudžiama ar reikia paryškinti · pagalbinė smaragdinė `#3E8E68`.
- **Šriftai:** Inter Tight 800/900 (antraštės), Inter (tekstas), JetBrains Mono (etiketės).
- Veikia telefone (390 px be horizontalaus slinkimo), gerbia `prefers-reduced-motion`, turi matomą klaviatūros fokusą.

## AI planas (dar neprijungtas)

AI strategijos dokumentą generuos Cloudflare Worker per `POST /api/plan`. Anthropic API raktas bus laikomas **tik** Workerio slaptažodžiuose, niekada ne frontende.

Kol Workeris neparuoštas, `index.html` faile `window.GREENLIGHT_API` yra tuščias, todėl AI skiltis rodo aiškų pranešimą, o visa kita veikia.

Kai Workeris bus paruoštas, įrašyk jo adresą:

```html
<script>window.GREENLIGHT_API = "https://greenlight-api.<vardas>.workers.dev";</script>
```

Frontendas siunčia JSON: `{ brand, title, niche, audience, pain, strategy: { id, name, tag, what } }` ir tikisi atsakymo su laukais `pozicionavimas`, `sukis`, `vertybes`, `auditorija { kas, skausmai, kur }`, `swot { stiprybes, silpnybes, galimybes, gresmes }`, `konkurentai [{ tipas, silpnybe }]`, `rinkos_spraga`, `hookai`, `planas [{ diena, veiksmas }]`, `kpi`, `pajamos`.

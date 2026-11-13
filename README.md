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
| `tokens.css` | Design tokens: spalvos, šriftai, mastelis (clamp) |
| `styles.css` | Dizainas – „editorial poster“ stilius |
| `data.js` | Nišos, auditorijos ir strategijos |
| `app.js` | Būgnai, sukimas, konfeti, garsas, rezultatas, katalogas, istorija |

Jokio build žingsnio – tai grynas statinis puslapis.

## Paleisti vietoje

```bash
python3 -m http.server 8000
```

Tada atidaryk http://localhost:8000.

## Dizainas

„Editorial poster“ stilius: milžiniškas žodis **GREENLIGHT** per visą plotį, ant kurio užlipa automatas; dideli ploni skaičiai kaip grafika (tinkamumas %, 14 dienų, [13⁺] strategijų); sąrašai be kortelių – plonos linijos ir taškinės vedamosios linijos; prisegta CTA juosta apačioje.

- **Spalvos (60/30/10):** šviesi `#F5F3E9` · tamsi `#0D211B` · akcentas lime `#C5F36B` (tik CTA, aktyvios būsenos, paryškinimai). Visos – `tokens.css`.
- **Šriftai:** Inter Tight 900 / 200 (antraštės, skaičiai), Inter (tekstas), JetBrains Mono (meta žymos).
- **Judesys:** „flat → poster“ įėjimas, raidžių iškilimas, scroll reveal, parallax; viskas išjungiama su `prefers-reduced-motion`.
- Mobile first (390 px), adaptacija 768 ir 1440 px, matomas klaviatūros fokusas.

## AI planas (dar neprijungtas)

AI strategijos dokumentą generuos Cloudflare Worker per `POST /api/plan`. Anthropic API raktas bus laikomas **tik** Workerio slaptažodžiuose, niekada ne frontende.

Kol Workeris neparuoštas, `index.html` faile `window.GREENLIGHT_API` yra tuščias, todėl AI skiltis rodo aiškų pranešimą, o visa kita veikia.

Kai Workeris bus paruoštas, įrašyk jo adresą:

```html
<script>window.GREENLIGHT_API = "https://greenlight-api.<vardas>.workers.dev";</script>
```

Frontendas siunčia JSON: `{ brand, title, niche, audience, pain, strategy: { id, name, tag, what } }` ir tikisi atsakymo su laukais `pozicionavimas`, `sukis`, `vertybes`, `auditorija { kas, skausmai, kur }`, `swot { stiprybes, silpnybes, galimybes, gresmes }`, `konkurentai [{ tipas, silpnybe }]`, `rinkos_spraga`, `hookai`, `planas [{ diena, veiksmas }]`, `kpi`, `pajamos`.

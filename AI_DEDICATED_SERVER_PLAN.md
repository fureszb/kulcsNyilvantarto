# Forgatókönyv B — Teljes leválasztás a saját gépről (dedikált szerver + Claude Haiku mint elsődleges LLM)

**Kapcsolódik:** `AI_COST_STRATEGY.md` (előző audit — ott alap, itt egy alternatív, egyszerűbb architektúra)
**Cél:** a fejlesztői/otthoni gép teljesen kikerüljön az éles AI-pipeline-ból; az adatok egy dedikált Linux szerveren maradjanak; a válaszgenerálás alapból a Claude Haiku 4.5 API-n menjen (nem csak eszkalációként).

---

## 0. Mielőtt belevágunk — jogi/biztonsági tisztázás

A kérdésed két külön dologra vonatkozik, amiket érdemes szétválasztani: **(A) ki üzemelteti a szervert** és **(B) ki viseli a jogi/pénzügyi felelősséget adatszivárgás esetén**. A kettő **nem ugyanaz**, és ez a legfontosabb pont, amit tisztázni kell, mielőtt bármit megépítünk.

### 0.1 "Ha lokálisan futtatnám, nekem kéne védekeznem" — helyes megérzés

A saját gépeden futtatott produkciós rendszer több okból is rossz ötlet, nem csak a feltörés miatt:

- **Nincs redundancia** — ha a gép lefagy, kikapcsolják, elviszik javításra, vagy elmegy az áram, leáll az ügyfelek szolgáltatása.
- **Lakossági internet-előfizetés** — dinamikus IP, és a legtöbb hazai ISP lakossági ÁSZF-je kifejezetten tiltja az üzleti szerver-üzemeltetést.
- **Nincs hálózati szélen DDoS-szűrés** — egy otthoni router semmilyen szintű védelmet nem nyújt egy célzott támadás ellen.
- **Kevert használat** — ugyanazon a gépen fut a fejlesztői böngészés, esetleg magánhasználat is, ami növeli a támadási felületet a termelési adatok mellett.

**Tehát igen — helyes az ösztön, hogy ezt ki kell venni a képből, függetlenül attól, mire jutunk a jogi kérdésben.**

### 0.2 "A szolgáltató kivédi a támadásokat, nekem nem kell kiberbiztonsággal foglalkoznom" — csak részben igaz

Ez az úgynevezett **megosztott felelősségi modell** (shared responsibility model). Egy dedikált szerver / VPS szolgáltató (pl. Hetzner, amit már használtok a Laravel-appnál) jellemzően **ezt** védi ingyenesen vagy a havidíjban:

- Fizikai adatközponti biztonság
- Hálózati szintű (L3/L4) DDoS-szűrés — ez Hetzner/OVH-nál **alapból ingyenes**, nem kell külön fizetni érte
- A hardver/hypervisor réteg

Ez **NEM** tartozik bele, hacsak nem fizetsz kifejezetten drágább "fully managed" csomagért:

- Az operációs rendszer frissítése/patch-elése
- A Docker-konténerek és az alkalmazás saját biztonsági rései (gyenge jelszó, rossz jogosultság-beállítás, SQL injection stb.)
- SSH-hozzáférés védelme, tűzfalszabályok
- Titkosítás, backup, naplózás

**A jó hír:** ez a maradék rész nem igényel főállású biztonsági szakembert — egy **egyszeri, néhány órás hardening** (lásd 3. fejezet) plusz egy **ingyenes Cloudflare-réteg** a nyilvános domain elé (DDoS + WAF + rate limit, $0-ért) gyakorlatilag helyettesíti egy elit biztonsági csapat munkájának nagy részét egy ekkora rendszernél.

### 0.3 "Átvezetjük a felelősséget a szolgáltatóra, nem nekünk kell fizetni pert" — ez a fő tévedés

**GDPR alapján a ti cégetek (mint adatkezelő) marad jogilag felelős**, függetlenül attól, hogy hol fut a szerver, vagy melyik AI-szolgáltatót használjátok. A hosting cég és az Anthropic is csak **adatfeldolgozó** (GDPR 28. cikk) — szerződéses partner, akinek a te utasításaid szerint kell dolgoznia, de a szabályozó (NAIH) és az érintettek (pl. dolgozók, ügyfelek) felé **titeket** terhel a felelősség:

- **Nektek** kell bejelenteni a NAIH-nak 72 órán belül adatszivárgás esetén (33. cikk)
- **Nektek** kell értesíteni az érintetteket magas kockázat esetén (34. cikk)
- **Titeket** bírságolhatnak, ha nem tudjátok igazolni a "megfelelő technikai és szervezési intézkedéseket" (32. cikk) — függetlenül attól, kié a szerver
- Az érintettek **titeket** perelhetnek, mint adatkezelőt, nem közvetlenül a hosting céget vagy az Anthropicot

**Amivel a pénzügyi kockázat ténylegesen csökkenthető** (ezek a valódi eszközök, nem a szolgáltató kiválasztása önmagában):

1. **Adatfeldolgozási szerződés (DPA)** minden alvállalkozóval — a hosting céggel és az Anthropickal is. Ez GDPR-kötelező is, és ha a feldolgozó hibázik, ez alapján **ti** tudtok kártérítést követelni **tőlük** — de ez szerződéses visszkereset, nem automatikus felelősség-átvállalás.
2. **Saját kiberbiztosítás (cyber liability insurance)** — ez az igazi eszköz a perköltség/kártérítés pénzügyi kockázatának áthárítására, és **nektek** kell megkötni, nem a hosting-választással "jár". Egy induló, kis csapatra szabott ilyen biztosítás éves díja jellemzően néhány száz–pár ezer eurótól indul — a pontos ár a kezelt adat mennyiségétől/típusától függ, kérj konkrét ajánlatot 1-2 biztosítótól.
3. **A hosting cég ÁSZF-jét érdemes elolvasni** — a legtöbb szolgáltató a saját felelősségét nagyon alacsonyra korlátozza (gyakran csak a havidíj visszatérítésére), tehát nem lehet rá "biztosítékként" számítani nagyobb kár esetén.
4. **Alapvető biztonsági intézkedéseket ettől függetlenül nektek is meg kell tenni** (titkosítás, hozzáférés-kezelés, backup) — ez nem spórolható meg a hosting-választással, mert a NAIH azt fogja kérdezni, **ti** milyen intézkedéseket tettetek, nem azt, hogy kinél béreltétek a vasat.

**Összegzés erre a konkrét kérdésre:** a terv jó irányba megy (ki a saját gépből, jó hosting, ZDR-es API), de a *felelősség* nem "tolható át" a szolgáltatóra — a *kockázat* viszont igen, csökkenthető. A kettő között a különbség: DPA + kiberbiztosítás + alap hardening = tényleges védelem; "jó szolgáltatót választok" önmagában = csak kevesebb az esély a bajra, de ha mégis megtörténik, jogilag és pénzügyileg ti maradtok az elsődleges célpont, hacsak nincs mögötte biztosítás és megfelelő szerződés.

---

## 1. Az új architektúra — mi változik

A legnagyobb bónusz, amit a "Claude Haiku legyen az alapértelmezett, nem csak eszkaláció" döntés hoz: **GPU-ra egyáltalán nincs többé szükség.** A `setupLlmRag.md`-ben dokumentált teljes "5 dolognak egyszerre kell futnia, natív Windows Ollama AMD GPU miatt" törékenység **megszűnik**.

### Mi marad helyben (dedikált Linux szerver, CPU-only):

| Komponens | Miért marad helyben | Erőforrás-igény |
|---|---|---|
| **Qdrant** | Az adatok (vektorok, dokumentum-szövegek) a ti infrastruktúrátokon maradnak | CPU + RAM, kicsi |
| **BGE-M3 embedding** | Kicsi modell (~1-2 GB), gyors CPU-n is; nem éri meg API-ra vinni | CPU, ~2-3 GB RAM |
| **BGE-reranker-v2-m3** (új, az előző auditból) | Ugyanaz — kicsi, CPU-n is gyors | CPU, ~1-1,5 GB RAM |
| **Piper TTS** | Már CPU-alapú, ingyenes | CPU, elhanyagolható |
| **Redis, Laravel, queue worker** | Már így működik | CPU |

### Mi kerül a Claude Haiku 4.5 API-ra (alapértelmezettként, nem csak eszkalációként):

| Komponens | Változás |
|---|---|
| **Válaszgenerálás (LLM)** | A `rag.py` `stream_answer` mostantól nem a helyi Ollama `/api/chat`-et hívja, hanem az Anthropic Messages API-t (streamelve), a jelenlegi szigorú `SYSTEM_PROMPT` / `SYSTEM_PROMPT_NO_SOURCES` logikával. A retrieval (embedding+keresés+rerank) helyben történik, csak a végső, kontextusba ágyazott kérdés-válasz megy ki az API-ra. |

> **Fontos adatvédelmi különbség az előző (hibrid) tervhez képest:** mivel a Haiku most **minden** kérdésnél fut (nem csak a bizonytalan/jogi eseteknél), a visszakeresett dokumentum-részletek **minden egyes kérdésnél** kimennek az Anthropic API-ra. Ez elfogadható, **ha**:
> 1. Az Anthropic ZDR (Zero Data Retention) szerződés érvényben van (lásd `AI_COST_STRATEGY.md` 1.1. fejezet),
> 2. Van aláírt DPA az Anthropickal,
> 3. A nemzetközi adattovábbítás jogalapja rendezett — mivel az Anthropic egy amerikai cég, EU-s személyes adat (pl. dolgozói nevek a műszakbeosztásban) az ő szerverükre küldése GDPR V. fejezet szerinti garanciát igényel (Standard Szerződési Klauzulák / SCC, vagy ha az Anthropic él vele, az EU-US Data Privacy Framework-höz való öncsatlakozás — **ezt érdemes konkrétan ellenőrizni az Anthropic trust/compliance oldalán, mielőtt élesítitek**, mert ez pontosan az a papírmunka, ami a 0.3. pontban leírt jogi felelősséget kezeli).
> 4. Ezt a saját adatkezelési tájékoztatótokban (GDPR 13-14. cikk) fel kell tüntetni alfeldolgozóként.

---

## 2. Szerver-kiválasztás — "legjobb ár/érték, ami kivédi a támadásokat"

Mivel nincs GPU-igény, a szerver-választás sokkal olcsóbb és egyszerűbb lesz, mint egy GPU-bérlés (lásd `AI_COST_STRATEGY.md` 1.2. fejezet — ott a bérelt GPU 210-500 USD/hó volt).

**Javaslat:** maradjatok a már bevált **Hetzner**-nél (EU-s, német adatközpont — ez GDPR szempontból is előny, nincs harmadik országbeli adattovábbítási kérdés a szerver oldalán), és vagy bővítsétek a meglévő VPS-t, vagy indítsatok mellé egy második, szerény CPU-instance-t kifejezetten az AI-rétegnek:

| Elem | Ajánlás | Havi költség (kb.) |
|---|---|---:|
| Szerver | Hetzner Cloud CPX31/CPX41-osztály (4-8 vCPU, 16 GB RAM) | ~€15-30 |
| DDoS/WAF réteg | **Cloudflare (ingyenes tier)** a nyilvános domain elé | $0 |
| Offsite titkosított backup | Hetzner Storage Box vagy Backblaze B2 | ~€3-5 |
| Claude Haiku 4.5 (elsődleges LLM, teljes forgalom) | lásd 4. fejezet | forgalomfüggő |

A Hetzner hálózati DDoS-védelme alapból, ingyenesen jár minden csomaghoz. A Cloudflare hozzáadása **$0-ért** ad L7-es (alkalmazásszintű) DDoS-védelmet, WAF-ot (webalkalmazás-tűzfal) és rate limitinget — ez az, ami egy drága "managed security" szolgáltatás nagy részét kiváltja induló cég költségvetéssel.

**Amit nem old meg a Cloudflare/Hetzner:** az OS-patchelés, a Docker-konfiguráció, a hozzáférés-kezelés — ez marad nálatok (lásd 3. fejezet, ~fél nap egyszeri munka).

---

## 3. Hardening-checklist a dedikált szerverhez (egyszeri, ~fél napos munka)

- [ ] SSH: csak kulcsos authentikáció, jelszavas belépés letiltva
- [ ] `ufw`/`iptables`: csak 80/443 nyitva publikusan; Qdrant (6333), Redis (6379), rag-api (8100) portja **soha ne legyen** a nyilvános interfészen — ez a jelenlegi kódban már jól van (`127.0.0.1:8100:8100`), csak szerveren is be kell tartani
- [ ] `unattended-upgrades` (Ubuntu/Debian): automatikus biztonsági frissítések
- [ ] `fail2ban`: brute-force SSH/HTTP védelem
- [ ] Cloudflare "Full (strict)" mód + a szerver tűzfala csak Cloudflare IP-tartományokról fogadjon 443-on — így a domain mögé rejtett origin IP közvetlenül nem támadható
- [ ] Docker: nem-root felhasználó a konténerekben (a `rag-service/Dockerfile`-ban ez már megvan), image-ek rendszeres frissítése
- [ ] Titkos kulcsok (`RAG_INTERNAL_TOKEN`, `ANTHROPIC_API_KEY`) kizárólag Coolify env-változóként, soha git-ben
- [ ] Rendszeres, titkosított, offsite backup (Qdrant snapshot + tenant SQLite fájlok) — teszteljétek is a visszaállítást, ne csak a mentést

Ez a lista lefedi azt, amit egy "managed security" szolgáltatás pénzért csinálna — csak egyszeri beállítás, nem folyamatos üzemeltetési teher.

---

## 4. Költségbecslés — teljes AI-réteg, saját gép és GPU nélkül

Feltételezve, hogy a Claude Haiku most **minden** kérdésnél fut (nem csak eszkalációként), a korábbi auditban számolt **~$4 / 1000 lekérdezés** most a teljes forgalomra vonatkozik, nem csak egy szeletére:

| Havi lekérdezésszám | Claude Haiku 4.5 költség/hó |
|---:|---:|
| 2 000 | ~$8 |
| 10 000 | ~$40 |
| 50 000 | ~$200 |

| Tétel | Havi költség |
|---|---:|
| Hetzner CPU-szerver | ~€15-30 |
| Cloudflare | $0 |
| Offsite backup | ~€3-5 |
| Claude Haiku (2-10k kérdés/hó) | ~$8-40 |
| **Összesen (kis forgalomnál)** | **kb. $30-80 / hó** |

Ez **GPU-bérlés és saját gép nélkül**, teljesen kiszervezve — összehasonlítva az előző audit ~$210-500/hó-s GPU-bérlési forgatókönyvével, ez a legolcsóbb és legkevesebb üzemeltetési teherrel járó opció, cserébe egyetlen külső LLM-szolgáltatótól (Anthropic) függtök a válaszgenerálásban.

**Ezt a függést érdemes tudatosan vállalni, nem véletlenül:** ha az Anthropic API-nak üzemzavara van, a chat-funkció leáll (a retrieval/feltöltés helyben továbbra is működik). Ha ez elfogadhatatlan kockázat, egy olcsó, egyszerű mitigáció: tartsatok meg egy **kis, CPU-n futtatható tartalék-modellt** (pl. egy jóval kisebb kvantált Gemma/Llama, csak vészhelyzeti "üzemzavar van, egyszerűsített válasz" módra) — ez opcionális, és nem szükséges a kiinduláshoz, csak egy lehetőség, ha a rendelkezésre állás kritikus.

---

## 5. Következő lépések (sorrendben)

1. **Jogi:** DPA aláírása a hosting céggel és az Anthropickal; adatkezelési tájékoztató frissítése az új alfeldolgozókkal; kiberbiztosítási ajánlat bekérése 1-2 biztosítótól.
2. **Infrastruktúra:** Hetzner CPU-instance felállítása, hardening-checklist (3. fejezet) végrehajtása, Cloudflare bekötése.
3. **Kód:** `rag.py` `stream_answer` átírása Anthropic Messages API hívásra (streamelve, `claude-haiku-4-5` modellel), a meglévő rendszerprompt és hallucináció-védelem megtartásával; Ollama csak embedding+rerank célra marad, GPU-profil és natív Windows-Ollama dokumentáció törölhető.
4. **Migráció:** Qdrant-adatok átmásolása a fejlesztői gépről az új szerverre (snapshot/restore), tesztelés, majd a fejlesztői gép AI-szerepének leállítása.

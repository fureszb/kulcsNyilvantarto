# AI RAG rendszer — üzemeltetési kézikönyv

Ez a leírás a helyi AI asszisztens (dokumentum-feltöltés + chat) elindításáról és
hibaelhárításáról szól. **A leggyakoribb hiba: a dokumentum „Feldolgozás…"
állapotban ragad** — ennek oka szinte mindig az, hogy valamelyik háttérszolgáltatás
nem fut (leggyakrabban a Docker leállt gépújraindítás után).

---

## 1. A rendszer felépítése — mi miért kell

A dokumentum-feldolgozáshoz **öt dolognak kell egyszerre futnia**. Ha bármelyik áll,
a feltöltés „Feldolgozás…"-ban ragad, vagy a chat nem válaszol.

| # | Szolgáltatás | Hol fut | Mit csinál |
|---|---|---|---|
| 1 | **Docker Desktop** | Windows háttér | Ő futtatja a 2–4. konténereket |
| 2 | **rag-api** (FastAPI) | Docker konténer (port 8100) | PDF/DOCX/XLSX/TXT feldolgozás, chat, felolvasás |
| 3 | **Qdrant** | Docker konténer (port 6333) | Vektor-adatbázis (a dokumentumok „memóriája") |
| 4 | **Redis** | Docker konténer (port 6379) | Sorkezelés / gyorsítótár |
| 5 | **Ollama** | **Natív Windowson** (port 11434) | Az LLM (gemma3:12b) és az embedding (bge-m3) motorja |

> **Miért fut az Ollama natívan, nem Dockerben?** A gépben **AMD Radeon** GPU van, és a
> Docker NVIDIA-GPU-átadása AMD-vel nem működik. Ezért az Ollama közvetlenül Windowson
> fut (kihasználja a GPU-t), a konténeres rag-api pedig a `host.docker.internal:11434`
> címen éri el. Ezt az `ai-rag/.env` `OLLAMA_BASE_URL` sora rögzíti.

Ezen felül a webalkalmazáshoz kell még:

| Szolgáltatás | Parancs | Mit csinál |
|---|---|---|
| **Laravel webszerver** | `php artisan serve --port=8000` | Maga a weboldal |
| **Queue worker** | `php artisan queue:work` | A feltöltött fájlokat átadja a rag-api-nak feldolgozásra |
| **ngrok** (opcionális) | `ngrok http 8000` | Publikus HTTPS URL telefonos teszthez |

**FONTOS:** a **queue worker** nélkül a feltöltött dokumentum SOHA nem dolgozódik fel
(örökre „Várakozik"/„Feldolgozás…" marad), akkor is, ha minden más fut. Ez a másik
leggyakoribb hiba.

---

## 2. „Feldolgozás…"-ban ragadt a dokumentum — gyors hibaelhárítás

Végezd el sorban. A legtöbb esetben az 1. lépés (Docker) megoldja.

### 2.1 Fut a Docker Desktop?

Nyisd meg a Docker Desktop alkalmazást (Start menü). Várd meg, míg a bal alsó sarokban
zöld lesz („Engine running"). Ellenőrzés terminálból:

```bash
docker info
```

Ha hibát ad (pl. „dockerDesktopLinuxEngine … 500"), a Docker **nem fut** — indítsd el és
várj ~30–60 másodpercet.

### 2.2 Futnak a konténerek?

```bash
cd C:\Users\frszb\Desktop\GIT_PROJEKT\KulcsNyilvantarto\ai-rag
docker compose ps
```

Ha a `rag-api`, `rag-qdrant`, `rag-redis` nincs a listában vagy nem „Up/healthy",
indítsd el őket:

```bash
docker compose up -d
```

Ellenőrzés, hogy a rag-api válaszol-e:

```bash
curl http://127.0.0.1:8100/health
# elvárt: {"status":"ok"}
```

### 2.3 Fut a natív Ollama?

```bash
curl http://127.0.0.1:11434/api/version
# elvárt: {"version":"..."}
```

Ha nem válaszol, indítsd el (külön terminálablakban, hagyd nyitva):

```bash
ollama serve
```

Ellenőrizd, hogy a modellek megvannak (első alkalommal le kell tölteni, több GB):

```bash
ollama ls
# kell benne: gemma3:12b  ÉS  bge-m3
```

Ha hiányzik valamelyik:

```bash
ollama pull gemma3:12b
ollama pull bge-m3
```

### 2.4 Fut a queue worker?

Ez a leggyakrabban kifelejtett lépés. Nyiss egy terminált a projektmappában és indítsd:

```bash
cd C:\Users\frszb\Desktop\GIT_PROJEKT\KulcsNyilvantarto
php artisan queue:work --timeout=900
```

Hagyd ezt a terminált nyitva — amíg fut, dolgozza fel a feltöltéseket. Ha bezárod,
a feldolgozás leáll.

### 2.5 A beragadt dokumentum újrafeldolgozása

Miután a fenti 4 szolgáltatás fut, a beragadt dokumentumot újra kell indítani
(mert a régi próbálkozásai már „elfogytak"). A legegyszerűbb: **töröld a felületen
a ragadt dokumentumot, és töltsd fel újra.** Ilyenkor a friss queue-job azonnal
feldolgozza (pár másodperc egy néhány oldalas PDF-nél).

---

## 3. Teljes rendszer felállítása nulláról (vagy gépújraindítás után)

Gépújraindítás után **ebben a sorrendben** indítsd el a szolgáltatásokat.
Mindegyik külön terminálablakban fut, amit **nyitva kell hagyni**.

### 1. lépés — Docker Desktop
Indítsd el a Docker Desktop alkalmazást, várd meg a zöld „Engine running" állapotot.

### 2. lépés — Ollama (natív)
```bash
ollama serve
```
(Ha a Windows már automatikusan futtatja az Ollamát a tálcán, ez a lépés kihagyható —
ellenőrizd a `curl http://127.0.0.1:11434/api/version` paranccsal.)

### 3. lépés — AI RAG konténerek
```bash
cd C:\Users\frszb\Desktop\GIT_PROJEKT\KulcsNyilvantarto\ai-rag
docker compose up -d
```
Várd meg, míg a `rag-api /health` OK-t ad (lásd 2.2). Az első indulásnál a rag-api
„bemelegíti" az Ollama modelleket — az első kérdés/feldolgozás ezért lassabb (~20–40 mp),
utána gyors.

### 4. lépés — Laravel webszerver
```bash
cd C:\Users\frszb\Desktop\GIT_PROJEKT\KulcsNyilvantarto
php artisan serve --port=8000
```

### 5. lépés — Queue worker (KÖTELEZŐ a feldolgozáshoz)
```bash
cd C:\Users\frszb\Desktop\GIT_PROJEKT\KulcsNyilvantarto
php artisan queue:work --timeout=900
```

### 6. lépés (opcionális) — ngrok publikus URL telefonhoz
```bash
ngrok http 8000
```

Ezután a `http://localhost:8000/h2o-offices/ai` (vagy az ngrok URL) oldalon
működik a feltöltés és a chat.

---

## 4. Egészség-ellenőrző lista (mind zöld kell legyen)

```bash
docker info                                   # Docker fut
curl http://127.0.0.1:8100/health             # rag-api: {"status":"ok"}
curl http://127.0.0.1:11434/api/version       # Ollama: {"version":...}
ollama ls                                     # gemma3:12b + bge-m3 megvan
curl http://127.0.0.1:6333/healthz            # Qdrant (vagy: docker compose ps)
curl -o /dev/null -w "%{http_code}" http://localhost:8000/   # Laravel: 200
```

A queue workernek is futnia kell (a saját terminálablakában látszik, ahogy
felveszi a jobokat).

---

## 5. Gyakori hibák és okuk

| Tünet | Ok | Megoldás |
|---|---|---|
| Dokumentum „Feldolgozás…"-ban ragad | Docker vagy queue worker nem fut | 2.1 / 2.4 lépés |
| Dokumentum „Várakozik" marad | Queue worker nem fut | `php artisan queue:work` |
| Dokumentum „Hiba" státusz | A rag-api elérhető, de a fájl hibás/olvashatatlan | Nézd a dokumentum hibaüzenetét; próbáld másik fájllal |
| Chat nem válaszol / „nem érhető el" | rag-api vagy Ollama áll | 2.2 / 2.3 lépés |
| Chat első kérdése nagyon lassú | Ollama modell most töltődik a VRAM-ba | Normális, a 2. kérdéstől gyors |
| Hang-asszisztens néma | rag-api (Piper TTS) áll | 2.2 lépés |
| `docker … 500 dockerDesktopLinuxEngine` | Docker Desktop nem fut | Indítsd el a Docker Desktopot |

---

## 6. Hasznos diagnosztikai parancsok

```bash
# rag-api naplója (mit dolgozott fel, hibázott-e)
docker logs rag-api --tail 40

# konténerek állapota
cd ai-rag && docker compose ps

# egy dokumentum állapota a tenant adatbázisban (h2o-offices példa)
php artisan tinker --execute="config(['database.connections.tenant.database' => storage_path('database/tenants/h2o-offices.sqlite')]); DB::purge('tenant'); App\Models\AiDocument::latest()->limit(5)->get(['id','original_name','status','chunk_count','error_message'])->each(fn(\$d) => print(\$d->id.' '.\$d->original_name.' → '.\$d->status.' ('.\$d->chunk_count.' chunk) '.\$d->error_message.PHP_EOL));"

# várakozó / hibás sor-jobok
php artisan tinker --execute="echo 'jobs: '.DB::table('jobs')->count().' | failed: '.DB::table('failed_jobs')->count();"

# a betöltött Ollama modellek (GPU-ban vannak-e)
ollama ps
```

---

## 7. Éles (Coolify) környezet — megjegyzés

Éles szerveren (Linux) a stack `docker compose`-ból megy, és a queue worker
**Supervisor / Coolify service**-ként fut folyamatosan (nem kézzel indítva).
Linux + NVIDIA GPU esetén az Ollama is konténerben futhat a `--profile bundled-ollama`
kapcsolóval. A részletes architektúra és a forráskód az **AI_RAG.md** fájlban van.

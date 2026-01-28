
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));
    let packs = {
      "5309": { nome: "5309 Caixas e Bancos - Pack 1" },
      "5283": { nome: "5283 Compras - Pack 1" },
      "5285": { nome: "5285 Compras - Pack 3 / MD-e/DF-e" },
      "5354": { nome: "5354 Conciliacao Bancaria Automatica OFX - Pack 2.1" },
      "5284": { nome: "5284 Cotacao - Pack 2" },
      "5292": { nome: "5292 Estocagem - Pack 1" },
      "5316": { nome: "5316 Fiscal - Pack 1 / Livro e SPED Fiscal" },
      "5317": { nome: "5317 Fiscal - Pack 2 / SPED Contribuicoes" },
      "5318": { nome: "5318 Fiscal - Pack 3 / EFD Reinf" },
      "5313": { nome: "5313 Gerenciais - Pack 1" },
      "5312": { nome: "5312 Gerenciais - Pack 2" },
      "5302": { nome: "5302 Pagamentos - Pack 1" },
      "5352": { nome: "5352 Pagamentos - Pack 2 / Centro de Resultado" },
      "5291": { nome: "5291 Precificacao - Pack 1" },
      "5304": { nome: "5304 Recebimentos - Pack 1" },
      "5294": { nome: "5294 Vendas - Pack 1" },
      "5297": { nome: "5297 Vendas - Pack 4 / NFSe" },
    };
    // Catálogo (MVP): dados do pedido por FAP
    // Em produção, isso viria do ERP/CRM (ex.: Sankhya) via API.
        let fapCatalog = {
      "1010": {
        cliente: "ITC INDUSTRIA DE TERCEIRIZACAO DE COSMETICOS",
        gp: "Isabel Vieira",
        filial: "Filial Belo Horizonte",
        lider: "Renata Pinheiro",
        gestorPMO: "Andreia Comaccio",
        packIds: ["5309","5283","5284"]
      },
      "100001": { cliente: "Politintas", gp: "Renata", filial: "Slim BH" },
      "100002": { cliente: "Atacadista de Fraldas", gp: "Andreia", filial: "Slim Uberl�ndia" },
      "100003": { cliente: "AGC", gp: "Carol", filial: "Slim ES" },
      "31200": {
        cliente: "Labor Engenharia e Tecnologia SA",
        gp: "Milca Delmonico",
        filial: "Slim BH",
        lider: "Adriano Goncalves",
        gestorPMO: "Kassius Lima",
        packIds: ["5316","5317","5318"]
      },
      "32100": {
        cliente: "Labor Engenharia e Tecnologia SA",
        gp: "Milca Delmonico",
        filial: "Slim BH",
        lider: "Adriano Goncalves",
        gestorPMO: "Kassius Lima",
        packIds: ["5316","5317","5318"]
      }
    };


    const etapasPadrao = ["Validação de Escopo","Simulação","Go-live","Entrada em Produção"];

    let consultoresBase = [
      { codusu:"U001", nome:"MARCELO.AVELAR",  sub:"FILIAL DC SUDESTE", nivel:"Senior" },
      { codusu:"U002", nome:"BRUNA.BOLT",      sub:"TERCEIROS",          nivel:"Pleno"  },
      { codusu:"U003", nome:"DANILO.BOLT",     sub:"TERCEIROS",          nivel:"Junior" },
      { codusu:"U004", nome:"NAYRA.SILVA",     sub:"FILIAL ES",          nivel:"Pleno"  },
      { codusu:"U005", nome:"HERMES.LIMA",     sub:"FILIAL BH",          nivel:"Senior" },
      { codusu:"U006", nome:"MARCO.AURELIO",   sub:"BP",                 nivel:"Senior" },
      { codusu:"U007", nome:"MARINA.ROCHA",    sub:"DELIVERY CENTER",    nivel:"Junior" },
      { codusu:"U008", nome:"HENRIQUE.PINTO",  sub:"DELIVERY CENTER",    nivel:"Senior" },
      { codusu:"U009", nome:"ANDRES.PIPET",    sub:"DELIVERY CENTER",    nivel:"Pleno"  },
      { codusu:"U010", nome:"THIAGO.BOLT",     sub:"TERCEIROS",          nivel:"Senior" },
      { codusu:"U011", nome:"GUILHERME.BRION", sub:"TERCEIROS",          nivel:"Senior" },
    ];

    let cert = {
      "5309": ["U007","U008","U009","U010","U011","U006"],
      "5283": ["U007","U008","U009","U010","U011","U006"],
      "5285": [],
      "5354": [],
      "5284": ["U007","U008","U009","U010","U011"],
      "5292": ["U007","U008","U009","U010","U011"],
      "5316": ["U007","U010"],
      "5317": ["U007","U010"],
      "5318": ["U007"],
      "5313": ["U009"],
      "5312": ["U009"],
      "5302": ["U007","U008","U009","U010","U011"],
      "5352": [],
      "5291": ["U007","U008","U009","U010","U011"],
      "5304": ["U007","U008","U009","U010","U011"],
      "5294": ["U007","U008","U009","U010","U011"],
      "5297": ["U007"],
    };

    function baseStatusLR(seed, dayIndex, turno){
      const n = (seed*17 + dayIndex*7 + (turno==="M"?1:2)) % 9;
      return (n === 0 || n === 4) ? "R" : "L";
    }

    let reservas = [];
    // Seeds de teste: Marco Aurelio (BP) reservado em datas entre 01/01/2026 e 01/03/2026
    reservas.push(
      { fap:"TESTE", packId:"5283", codusu:"U006", dataISO:"2026-01-02", turno:"M", etapa:"Simulacao", modalidade:"Remoto", justPJ:"Teste BP" },
      { fap:"TESTE", packId:"5283", codusu:"U006", dataISO:"2026-01-10", turno:"T", etapa:"Simulacao", modalidade:"Remoto", justPJ:"Teste BP" },
      { fap:"TESTE", packId:"5283", codusu:"U006", dataISO:"2026-02-05", turno:"M", etapa:"Go-live", modalidade:"Presencial", justPJ:"Teste BP" },
      { fap:"TESTE", packId:"5283", codusu:"U006", dataISO:"2026-02-20", turno:"T", etapa:"Go-live", modalidade:"Presencial", justPJ:"Teste BP" },
      { fap:"TESTE", packId:"5283", codusu:"U006", dataISO:"2026-03-01", turno:"M", etapa:"Entrada em Producao", modalidade:"Remoto", justPJ:"Teste BP" }
    );
    let reprogramReasonsByFap = {}; // fap -> {reason, detail, whenISO}
    let perFapData = {}; // fap -> {dtIni, dtFim, packIds, obs, validationComment}
    let resumoRowsCache = [];

    // PersistÃªncia simples (localStorage)
    const STORAGE_KEY = "locacao-recursos-v1";

    function scheduleSave(){
      try{
        updatePerFapData();
        const payload = {
          state,
          reservas,
          validationStatusByFap,
          sentToValidation,
          acceptedChangesByFap,
          leaderChanges,
          reprogramReasonsByFap,
          perFapData
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }catch(e){
        console.warn("Falha ao salvar dados locais.", e);
      }
    }

    async function loadData(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return null;
        return JSON.parse(raw);
      }catch(e){
        console.warn("Falha ao carregar dados locais.", e);
        return null;
      }
    }

    function applyData(data){
      if(!data || typeof data !== "object") return;
      if(data.state && typeof data.state === "object"){
        Object.assign(state, data.state);
      }
      if(Array.isArray(data.reservas)){
        reservas = data.reservas;
      }
      if(data.validationStatusByFap && typeof data.validationStatusByFap === "object"){
        validationStatusByFap = data.validationStatusByFap;
      }
      if(data.sentToValidation && typeof data.sentToValidation === "object"){
        sentToValidation = data.sentToValidation;
      }
      if(data.acceptedChangesByFap && typeof data.acceptedChangesByFap === "object"){
        acceptedChangesByFap = data.acceptedChangesByFap;
      }
      if(Array.isArray(data.leaderChanges)){
        leaderChanges = data.leaderChanges;
      }
      if(data.reprogramReasonsByFap && typeof data.reprogramReasonsByFap === "object"){
        reprogramReasonsByFap = data.reprogramReasonsByFap;
      }
      if(data.perFapData && typeof data.perFapData === "object"){
        perFapData = data.perFapData;
      }
    }

        function applyStateToUI(){
      const fapEl = document.getElementById("fap");
      if(fapEl) fapEl.value = state.fap || "";
      const dtIniEl = document.getElementById("dtIni");
      if(dtIniEl && state.dtIni) dtIniEl.value = state.dtIni;
      const dtFimEl = document.getElementById("dtFim");
      if(dtFimEl && state.dtFim) dtFimEl.value = state.dtFim;
      const obsEl = document.getElementById("obs");
      if(obsEl) obsEl.value = state.obs || "";
      const p4Comment = document.getElementById("p4ValidationComment");
      if(p4Comment) p4Comment.value = state.validationComment || "";

      const packSet = new Set((state.packIds || []).filter(Boolean));
      document.querySelectorAll('input[name="packs"]').forEach((cb) => {
        cb.checked = packSet.has(cb.value);
      });

      applyEditLockUI();
    }
    function getReservaEtapaStatus(etapa){
      // Retorna: "none" | "partial" | "full"
      try{
        const packsSel = (state.packIds || []).filter(Boolean);
        if(packsSel.length === 0) return "none";

        const reserved = new Set(
          reservas
            .filter(r => r.fap===state.fap && (r.etapa||'')===etapa && (r.packId||''))
            .map(r => r.packId)
        );

        if(packsSel.length === 1){
          return reserved.has(packsSel[0]) ? "full" : "none";
        }

        let count = 0;
        packsSel.forEach(pid => { if(reserved.has(pid)) count++; });

        if(count === 0) return "none";
        if(count < packsSel.length) return "partial";
        return "full";
      }catch(e){
        return "none";
      }
    }

    function badgeReservaEtapaHTML(etapa){
      const st = getReservaEtapaStatus(etapa);
      if(st === "full"){
        return `<span class="badge" style="margin-left:8px; background:rgba(34,197,94,.18); border:1px solid rgba(34,197,94,.45); color:#a7f3d0;">Agenda reservada</span>`;
      }
      if(st === "partial"){
        return `<span class="badge" style="margin-left:8px; background:rgba(245,158,11,.18); border:1px solid rgba(245,158,11,.55); color:#fde68a;">Agenda reservada parcial</span>`;
      }
      return ``;
    }

    // {fap, packId, codusu, dataISO, turno('M'|'T'), etapa, modalidade('Presencial'|'Remoto'), justPJ?}
    let leaderChanges = []; // {whenISO, fap, action, detail}
    let validationStatusByFap = {};
    let sentToValidation = {}; // fap -> true/false
    let acceptedChangesByFap = {}; // fap -> true/false (aceite do GP) // fap -> "Pendente" | "Enviado" | "Validado"
    const STATUS_CLIENT_VALIDATED = "Cronograma Atualizado e validado pelo Cliente";

    function isEditLocked(){
      if(!state.fap) return false;
      const st = validationStatusByFap[state.fap] || "";
      if(!isClientValidatedStatus(st)) return false;
      return !reprogramReasonsByFap[state.fap];
    }

    function guardEdit(){
      if(isEditLocked()){
        alert("Cronograma validado com cliente. Para alterar, clique em Reprogramar cronograma e agendas.");
        return true;
      }
      return false;
    }

    function updatePerFapData(){
      if(!state.fap) return;
      perFapData[state.fap] = {
        dtIni: state.dtIni || "",
        dtFim: state.dtFim || "",
        packIds: Array.isArray(state.packIds) ? state.packIds.slice() : [],
        obs: state.obs || "",
        validationComment: state.validationComment || ""
      };
    }    function applyEditLockUI(){
      const locked = isEditLocked();
      const allow = new Set(["fap","btnBuscarProjeto","btnReprogramStart","btnReprogramConfirm","btnReprogramCancel","btnReprogramClose","reprogramReason","reprogramDetail","btnVoltarAgenda","btnResumoPdf","btnResumoCsv","btnGotoResumoP4","btnGotoResumoP5","btnReprogramYes","btnReprogramView"]);
      document.querySelectorAll("input, select, textarea, button").forEach((el) => {
        if(allow.has(el.id)) return;
        if(locked){
          if(!el.disabled){
            el.setAttribute("data-lock-disabled", "1");
            el.disabled = true;
            if(el.tagName === "BUTTON") el.classList.add("isDisabled");
          }
          return;
        }
        if(el.getAttribute("data-lock-disabled") === "1"){
          el.disabled = false;
          el.removeAttribute("data-lock-disabled");
          if(el.tagName === "BUTTON") el.classList.remove("isDisabled");
        }
      });
    }
    function isClientValidatedStatus(st){
      const normalized = (st || "").toLowerCase();
      return normalized === STATUS_CLIENT_VALIDATED.toLowerCase()
        || normalized === "cronograma atualizado e validado pelo cliente";
    }

    let currentEligible = [];
    let currentDays = [];
    let selectedSlots = []; // [{codusu, nome, iso, turno, idx}]
    let selectedCodusu = null;
    let lastSelectedIdx = null;


    const state = { fap:"", dtIni:"", dtFim:"", packIds:[], obs:"", validationComment:"", cliente:"", gp:"", filial:"", lider:"", gestorPMO:"", searched:false };
    let pendingFap = "";

    // Mostrar packs somente após informar FAP
    function togglePacksVisibility(){
      const wrap = document.getElementById("packsWrapper");
      if(!wrap) return;

      const show = !!state.fap; // ✅ igual comportamento da v5: só depende do FAP
      wrap.style.display = show ? "block" : "none";

      // Se limpou FAP, resetar packs/etapas
      if(!show){
        const checks = Array.from(document.querySelectorAll('input[name="packs"]'));
        checks.forEach(c => c.checked = false);
        state.packIds = [];
        state.searched = false;
        renderStepsP1();
        toggleStepsByPacks();
        updateActionButtons();
      }
    }

function toggleStepsByPacks(){
      const sw = document.getElementById("stepsWrapper");
      if(!sw) return;
      // Mostrar etapas da metodologia no lado esquerdo SOMENTE após "Buscar disponibilidade"
      const hasPacks = (state.packIds && state.packIds.length);
      sw.style.display = (hasPacks && state.searched) ? "block" : "none";
    }

    function updateActionButtons(){
      const ok = validatePedido(false);
      const btnBuscar = document.getElementById("btnBuscar");
      const btnIrAgenda = document.getElementById("btnIrAgenda");
      const btnAvancar = document.getElementById("btnAvancar1");
      if(btnBuscar) btnBuscar.disabled = !ok;
      if(btnIrAgenda) btnIrAgenda.disabled = !ok;
      if(btnAvancar) btnAvancar.disabled = !ok;
    }


    const pad = n => String(n).padStart(2,"0");
    function toISODate(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
    function fmtBR(iso){
      if(!iso) return "—";
      const [y,m,d]=iso.split("-");
      return `${d}/${m}/${y}`;
    }
    function addDays(d, n){
      const x = new Date(d);
      x.setDate(x.getDate()+n);
      return x;
    }
    function buildDaysRange(iniISO, fimISO){
      const ini = new Date(iniISO + "T00:00:00");
      const fim = new Date(fimISO + "T00:00:00");
      const out = [];
      let cur = ini;
      while(cur <= fim){
        out.push(new Date(cur));
        cur = addDays(cur, 1);
      }
      return out;
    }
    
    function hasCltAvailabilityInPeriod(){
      // Se existir ao menos 1 consultor CLT elegível com qualquer slot L no período, retorna true
      const clts = currentEligible.filter(c => vinculoFromSub(c.sub) === "CLT");
      if(!clts.length) return false;
      if(!state.dtIni || !state.dtFim) return false;
      const days = buildDaysRange(state.dtIni, state.dtFim);
      for(const c of clts){
        const seed = c.seed || 1;
        for(let di=0; di<days.length; di++){
          const iso = toISODate(days[di]);
          const baseM = baseStatusLR(seed, di, "M");
          const baseT = baseStatusLR(seed, di, "T");
          const m = getSlotStatusLR(c.codusu, iso, "M", baseM);
          const t = getSlotStatusLR(c.codusu, iso, "T", baseT);
          if(m === "L" || t === "L") return true;
        }
      }
      return false;
    }

    function vinculoFromSub(sub){
      const s = (sub || "").toUpperCase();
      if(s.includes("BP")) return "BP";
      return s.includes("TERCEIR") ? "PJ" : "CLT";
    }

    function nowISO(){
      const d = new Date();
      return d.toISOString();
    }

    function logLeaderChange(action, detail){
      leaderChanges.push({ whenISO: nowISO(), fap: state.fap, action, detail });
    }


    function packsLabel(ids){
      if(!ids || !ids.length) return "—";
      return ids.map(pid => packs[pid]?.nome || pid).join(" • ");
    }

    // Navegação
    const tabs = document.querySelectorAll(".tab");
    function goto(pageId){
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      document.getElementById(pageId).classList.add("active");
      tabs.forEach(t => t.classList.toggle("active", t.dataset.page === pageId));
      if(pageId === "p2"){ syncP2(); renderAgenda();
      renderStepsP1(); }
      if(pageId === "p3"){ renderResumo(); }
      if(pageId === "p4"){ guardP4(); if(sentToValidation[state.fap]){ renderLeaderResList(); renderP4ThirdPartyAlerts(); } }
      if(pageId === "p5"){ guardP5(); if(sentToValidation[state.fap]){ renderValidated(); } }
      window.scrollTo({top:0, behavior:"smooth"});
    }
    tabs.forEach(t => t.addEventListener("click", () => goto(t.dataset.page)));

    // Página 1
    const elFap = document.getElementById("fap");
    const elIni = document.getElementById("dtIni");
    const elFim = document.getElementById("dtFim");
    const elPackChecks = Array.from(document.querySelectorAll('input[name="packs"]'));
    const elObs = document.getElementById("obs");
    const elP4Comment = document.getElementById("p4ValidationComment");

    function applyFapSelection(fapVal){
      state.fap = fapVal;
      const info = fapCatalog[state.fap];
      state.cliente = info?.cliente || "";
      state.gp      = info?.gp || "";
      state.filial  = info?.filial || "";
      state.lider   = info?.lider || "";
      state.gestorPMO = info?.gestorPMO || "";
      if(Array.isArray(info?.packIds) && info.packIds.length){
        state.packIds = info.packIds.slice();
      }
      state.searched = false;
      togglePacksVisibility();
      refreshPreview();
    }

    elFap.addEventListener("input", () => {
      pendingFap = elFap.value.trim();
    });
    const btnBuscarProjeto = document.getElementById("btnBuscarProjeto");
    if(btnBuscarProjeto){
      btnBuscarProjeto.addEventListener("click", () => {
        const prevFap = state.fap || "";
        const fapVal = (pendingFap || elFap.value || "").trim();
        if(!fapVal){
          alert("Informe a FAP para buscar o projeto.");
          return;
        }

        const st = validationStatusByFap[fapVal] || "";
        if(isClientValidatedStatus(st)){
          openReprogramChoice(fapVal, prevFap);
          return;
        }

        applyFapSelection(fapVal);

        const snap = perFapData[fapVal] || {};
        if(snap.dtIni) state.dtIni = snap.dtIni;
        if(snap.dtFim) state.dtFim = snap.dtFim;
        if(Array.isArray(snap.packIds) && snap.packIds.length) state.packIds = snap.packIds.slice();
        if(typeof snap.obs === "string") state.obs = snap.obs;
        if(typeof snap.validationComment === "string") state.validationComment = snap.validationComment;

        if(!state.packIds || state.packIds.length === 0){
          const fromRes = reservas
            .filter(r => r.fap === fapVal)
            .map(r => r.packId)
            .filter(Boolean);
          state.packIds = Array.from(new Set(fromRes));
        }

        state.searched = false;
        togglePacksVisibility();
        toggleStepsByPacks();
        refreshPreview();
        computeEligible();

        applyStateToUI();
        renderStepsP1();
        try{ syncP2(); }catch(e){}
        renderResumo();
        renderAgenda();
        scheduleSave();
      });
    }
    elIni.addEventListener("change", () => { state.dtIni = elIni.value; state.searched = false; togglePacksVisibility(); refreshPreview(); });
    elFim.addEventListener("change", () => { state.dtFim = elFim.value; state.searched = false; togglePacksVisibility(); refreshPreview(); });
    elObs.addEventListener("input", () => { state.obs = elObs.value; });
    if(elP4Comment){
      elP4Comment.addEventListener("input", () => { state.validationComment = elP4Comment.value; });
    }

    ["p1Vinculo","p1Sort"].forEach(id => {
      const el = document.getElementById(id);
      if(el){
        el.addEventListener("change", () => {
          if(id === "p1Vinculo"){
            const v = el.value;
            if(v === "ALL" || v === "BP"){
              alert("Atencao: esta opcao nao e a melhor pratica. De preferencia para CLT e Terceiros. As agendas reservadas BP passarao por validacao do Lider da Torre e vera possibilidade de negociar com BP.");
            }
          }
          renderAgenda();
        });
        el.addEventListener("input", renderAgenda);
      }
    });

    elPackChecks.forEach(cb => cb.addEventListener("change", () => {
      state.packIds = elPackChecks.filter(x => x.checked).map(x => x.value);
      state.searched = false;
      renderStepsP1();
      togglePacksVisibility();
      toggleStepsByPacks();
      updateActionButtons();
      refreshPreview();
    }));

function renderStepsP1(){
      const box = document.getElementById("steps");
      const preview = document.getElementById("previewSteps");
      box.innerHTML = "";
      preview.innerHTML = "";

      if(!state.packIds.length){
        box.innerHTML = `<div class="muted">Selecione pelo menos 1 pack para carregar as etapas padrão.</div>`;
        preview.innerHTML = `<div class="muted">—</div>`;
        return;
      }

      etapasPadrao.forEach((s, i) => {
        const div = document.createElement("div");
        div.className = "step";
        div.innerHTML = `<div><b>${i+1}. ${s}</b><div class="muted">Etapa padrão</div></div><span class="badge metodologia">Metodologia</span>${badgeReservaEtapaHTML(s)}`;
        box.appendChild(div);

        const it = document.createElement("div");
        it.className = "item";
        it.innerHTML = `<div><b>${i+1}. ${s}</b><div>Planejamento automático por packs</div></div><span class="tag">Etapa</span>`;
        preview.appendChild(it);
      });
    }

    function refreshPreview(){
      document.getElementById("kpiFap").textContent = state.fap || "—";
      const per = (state.dtIni && state.dtFim) ? `${fmtBR(state.dtIni)} → ${fmtBR(state.dtFim)}` : "—";
      document.getElementById("kpiPeriodo").textContent = per;
      document.getElementById("kpiPacks").textContent = packsLabel(state.packIds);
      const elCli = document.getElementById("kpiCliente"); if(elCli) elCli.textContent = state.cliente || "—";
      const elGP = document.getElementById("kpiGP"); if(elGP) elGP.textContent = state.gp || "—";
      const elFil = document.getElementById("kpiFilial"); if(elFil) elFil.textContent = state.filial || "—";

      const ok = !!(state.fap && state.dtIni && state.dtFim && state.packIds.length && state.dtFim >= state.dtIni);
      const pill = document.getElementById("pillStatus");
      pill.textContent = ok ? "Pronto para buscar" : "Preencha e avance";
      pill.className = "pill " + (ok ? "ok" : "info");

      toggleStepsByPacks();
      updateActionButtons();
    }

    document.getElementById("btnAvancar1").addEventListener("click", () => goto("p2"));
    document.getElementById("btnIrAgenda").addEventListener("click", () => goto("p2"));

    document.getElementById("btnBuscar").addEventListener("click", () => {
      if(guardEdit()) return;
      const mp = document.getElementById("metodologiaPreview"); if(mp) mp.classList.remove("hidden");
      if(!validatePedido(true)) return;

      // Marca que o usuário executou a busca (para liberar visualização das etapas no lado esquerdo)
      state.searched = true;
      toggleStepsByPacks();

      computeEligible();
      goto("p2");
    });

    function validatePedido(showAlert){
      if(!state.fap || !state.dtIni || !state.dtFim || !state.packIds.length){
        if(showAlert) alert("Preencha FAP, datas e selecione pelo menos 1 Pack.");
        return false;
      }
      if(state.dtFim < state.dtIni){
        if(showAlert) alert("Data fim não pode ser menor que data início.");
        return false;
      }
      return true;
    }

    function computeEligible(){
      if(!state.packIds.length){
        currentEligible = [];
        return;
      }

      const lists = state.packIds.map(pid => new Set(cert[pid] || []));
      let inter = new Set(lists[0]);
      for(let i=1;i<lists.length;i++){
        inter = new Set([...inter].filter(x => lists[i].has(x)));
      }

      currentEligible = consultoresBase
        .filter(c => inter.has(c.codusu))
        .map((c, i) => ({...c, seed: i+1}));
    }

    // Página 2
    function syncP2(){
      document.getElementById("p2Fap").textContent = state.fap || "—";
      document.getElementById("p2Ini").textContent = fmtBR(state.dtIni);
      document.getElementById("p2Fim").textContent = fmtBR(state.dtFim);
      document.getElementById("p2Packs").textContent = packsLabel(state.packIds);

      const cEl=document.getElementById("p2Cliente"); if(cEl) cEl.textContent = state.cliente || "—";
      const gEl=document.getElementById("p2GP"); if(gEl) gEl.textContent = state.gp || "—";
      const fEl=document.getElementById("p2Filial"); if(fEl) fEl.textContent = state.filial || "—";


      const box = document.getElementById("p2Steps");
      box.innerHTML = "";
      if(state.packIds.length){
        etapasPadrao.forEach((s, i) => {
          const div = document.createElement("div");
          div.className = "step";
          div.innerHTML = `<div><b>${i+1}. ${s}</b><div class="muted">Etapa padrão</div></div><span class="badge metodologia">Metodologia</span>${badgeReservaEtapaHTML(s)}`;
          box.appendChild(div);
        });
      }

      const mPack = document.getElementById("mPack");
      mPack.innerHTML = "";
      state.packIds.forEach(pid => {
        const opt = document.createElement("option");
        opt.value = pid;
        opt.textContent = packs[pid]?.nome || pid;
        mPack.appendChild(opt);
      });

      const sel = document.getElementById("mEtapa");
      sel.innerHTML = `<option value="">Selecione...</option>`;
      etapasPadrao.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        sel.appendChild(opt);
      });

      if(currentEligible.length === 0 && state.packIds.length){
        computeEligible();
      }
    }

    document.getElementById("btnVoltarPedido").addEventListener("click", () => goto("p1"));
    document.getElementById("btnIrResumo").addEventListener("click", () => goto("p3"));

    function getFilteredEligible(){
      const vincSel = document.getElementById("p1Vinculo")?.value || "REC";
      const sortSel = document.getElementById("p1Sort")?.value || "SMART";

      let list = currentEligible.map(c => {
        const v = (c.vinculo || vinculoFromSub(c.sub) || "").toUpperCase();
        const pct = periodAvailabilityPct(c.codusu);
        return { ...c, _v: v, _pct: pct };
      });

      if(vincSel !== "ALL"){
        if(vincSel === "REC"){
          list = list.filter(c => c._v === "CLT" || c._v === "PJ");
        }else{
          list = list.filter(c => c._v === vincSel);
        }
      }

      if(sortSel === "NAME"){
        list.sort((a,b) => (a.nome||"").localeCompare(b.nome||""));
      }else if(sortSel === "AVAIL"){
        list.sort((a,b) => (b._pct - a._pct) || (a.nome||"").localeCompare(b.nome||""));
      }else{
        list.sort((a,b) => {
          const aScore = (a._v==="CLT"? 1000:0) + Math.round(a._pct*100);
          const bScore = (b._v==="CLT"? 1000:0) + Math.round(b._pct*100);
          return (bScore - aScore) || (a.nome||"").localeCompare(b.nome||"");
        });
      }

      return list;
    }

    function renderAgenda(){
      if(!validatePedido(false)){
        document.getElementById("pillCount").textContent = `0 consultores`;
        document.getElementById("theadRow").innerHTML = `<th>NOME</th>`;
        document.getElementById("tbody").innerHTML = "";
        return;
      }

      currentDays = buildDaysRange(state.dtIni, state.dtFim);

      const head = document.getElementById("theadRow");
      head.innerHTML = `<th>NOME</th>`;
      currentDays.forEach(d => {
        const iso = toISODate(d);
        head.innerHTML += `<th>${iso.slice(8,10)}/${iso.slice(5,7)}</th>`;
      });

      const tbody = document.getElementById("tbody");
      tbody.innerHTML = "";

      const list = getFilteredEligible();
      document.getElementById("pillCount").textContent = `${list.length} consultores`;

      list.forEach(c => {
        const tr = document.createElement("tr");

        const tdName = document.createElement("td");
        tdName.innerHTML = `
          <div class="name">${c.nome}</div>
          <div class="sub">${c.sub}</div>
          <div class="sub">Nível: <b style="color:#e5e7eb">${c.nivel}</b></div>
          <div class="sub">Vínculo: <b style="color:#e5e7eb">${c.vinculo}</b></div>
        `;
        tr.appendChild(tdName);

        currentDays.forEach((d, dayIndex) => {
          const iso = toISODate(d);
          const m = getSlotStatusLR(c.codusu, iso, "M", baseStatusLR(c.seed, dayIndex, "M"));
          const t = getSlotStatusLR(c.codusu, iso, "T", baseStatusLR(c.seed, dayIndex, "T"));

          const td = document.createElement("td");
          td.innerHTML = `
            <div class="slot">
              <div class="chip ${m}" data-codusu="${c.codusu}" data-nome="${c.nome}" data-iso="${iso}" data-turno="M" data-idx="${dayIndex*2}">
                <span>Manhã</span><small>${m}</small>
              </div>
              <div class="chip ${t}" data-codusu="${c.codusu}" data-nome="${c.nome}" data-iso="${iso}" data-turno="T" data-idx="${dayIndex*2+1}">
                <span>Tarde</span><small>${t}</small>
              </div>
            </div>
          `;
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      tbody.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", (ev) => {
          const status = [...chip.classList].find(x => ["L","R"].includes(x));
          if(status !== "L"){
            alert("Este slot já está reservado (R).");
            return;
          }

          const codusu = chip.dataset.codusu;
          const nome = chip.dataset.nome;
          const iso = chip.dataset.iso;
          const turno = chip.dataset.turno;
          const idx = Number(chip.dataset.idx);

          // Regra: seleção múltipla apenas no MESMO consultor
          if(selectedCodusu && selectedCodusu !== codusu){
            alert("Seleção múltipla permitida apenas para o mesmo consultor. Limpe a seleção para escolher outro.");
            return;
          }

          const isShift = !!ev.shiftKey;
          const isCtrl = !!(ev.ctrlKey || ev.metaKey);

          // SHIFT: selecionar intervalo (precisa de âncora)
          if(isShift && lastSelectedIdx !== null){
            selectedCodusu = selectedCodusu || codusu;
            const a = Math.min(lastSelectedIdx, idx);
            const b = Math.max(lastSelectedIdx, idx);

            const chipsSame = [...tbody.querySelectorAll(`.chip[data-codusu="${codusu}"]`)];
            chipsSame.forEach(ch => {
              const st = [...ch.classList].find(x => ["L","R"].includes(x));
              if(st !== "L") return;
              const cidx = Number(ch.dataset.idx);
              if(cidx < a || cidx > b) return;

              const ciso = ch.dataset.iso, cturno = ch.dataset.turno;
              const key = `${codusu}|${ciso}|${cturno}`;
              if(!selectedSlots.some(s => `${s.codusu}|${s.iso}|${s.turno}` === key)){
                selectedSlots.push({codusu, nome, iso: ciso, turno: cturno, idx: cidx});
              }
              ch.classList.add("sel");
            });

            updateMultiBar();
            return;
          }

          // CTRL/CMD ou clique simples: toggle unitário
          selectedCodusu = selectedCodusu || codusu;
          const key = `${codusu}|${iso}|${turno}`;
          const i = selectedSlots.findIndex(s => `${s.codusu}|${s.iso}|${s.turno}` === key);
          if(i >= 0){
            selectedSlots.splice(i,1);
            chip.classList.remove("sel");
          }else{
            selectedSlots.push({codusu, nome, iso, turno, idx});
            chip.classList.add("sel");
            lastSelectedIdx = idx;
          }

          // Se zerou seleção, limpa contexto
          if(selectedSlots.length === 0){
            selectedCodusu = null;
            lastSelectedIdx = null;
          }

          updateMultiBar();
        });
      });

      // Atualiza a UI da barra ao renderizar a agenda
      updateMultiBar();
    }

    function clearSelected(){
      selectedSlots = [];
      selectedCodusu = null;
      lastSelectedIdx = null;
      document.querySelectorAll(".chip.sel").forEach(el => el.classList.remove("sel"));
      updateMultiBar();
    }

    function updateMultiBar(){
      const bar = document.getElementById("multiBar");
      const cnt = document.getElementById("multiCount");
      if(!bar || !cnt) return;
      const n = selectedSlots.length;
      if(n >= 1){
        cnt.textContent = `${n} selecionado(s)`;
        bar.classList.add("show");
      }else{
        bar.classList.remove("show");
      }
    }

function getSlotStatusLR(codusu, iso, turno, baseLR){
      const has = reservas.some(r =>
        r.fap===state.fap &&
        r.codusu===codusu &&
        r.dataISO===iso &&
        r.turno===turno
      );
      if(has) return "R";
      return baseLR;
    }

    // Modal / Reservas
    const modalBack = document.getElementById("modalBack");
    let modalCtx = null;

    function openModal(ctx){
      modalCtx = ctx;
      document.getElementById("mConsultor").textContent = ctx.nome;
      document.getElementById("mData").textContent = ctx.slots ? `Múltiplos dias (${ctx.slots.length})` : fmtBR(ctx.iso);
      document.getElementById("mTurno").textContent = ctx.slots ? "Períodos selecionados" : (ctx.turno === "M" ? "Manhã" : "Tarde");

      // Lista de períodos selecionados (seleção múltipla)
      const selLbl = document.getElementById("mSelectedLabel");
      const selBox = document.getElementById("mSelected");
      if(selLbl && selBox){
        if(ctx.slots && ctx.slots.length){
          selLbl.style.display = "";
          selBox.style.display = "";
          // Monta lista ordenada por data/turno
          const items = ctx.slots.slice().sort((a,b)=> (a.iso===b.iso ? (a.turno>b.turno?1:-1) : (a.iso>b.iso?1:-1)));
          selBox.innerHTML = items.map(s => {
            const t = (s.turno==="M") ? "Manhã" : "Tarde";
            return `<div class="rowItem"><div><b>${fmtBR(s.iso)}</b></div><div class="muted">${t}</div></div>`;
          }).join("");
        }else{
          selLbl.style.display = "none";
          selBox.style.display = "none";
          selBox.innerHTML = "";
        }
      }
      document.getElementById("mEtapa").value = "";
      const mPack = document.getElementById("mPack");
      if(mPack && mPack.options.length) mPack.selectedIndex = 0;

      // Regra TERCEIRO: justificativa obrigatória sempre
      const byId = Object.fromEntries(consultoresBase.map(c => [c.codusu, c]));
      const cSel = byId[ctx.codusu];
      const vSel = vinculoFromSub(cSel?.sub);
      const needJust = (vSel === "PJ" || vSel === "BP");
      const lbl = document.getElementById("lblJustPJ");
      const ta = document.getElementById("mJustPJ");
      if(lbl && ta){
        lbl.style.display = needJust ? "block" : "none";
        ta.style.display  = needJust ? "block" : "none";
        if(!needJust) ta.value = "";
      }

      // Ajustes para seleção múltipla
      const btnHalf = document.getElementById("btnReserveHalf");
      const btnDay = document.getElementById("btnReserveDay");
      if(ctx.slots){
        if(btnHalf) btnHalf.textContent = "Reservar";
        if(btnDay) btnDay.style.display = "none";
      }else{
        if(btnHalf) btnHalf.textContent = "Reservar só este turno";
        if(btnDay) btnDay.style.display = "";
      }

      modalBack.classList.add("show");
    }
    function closeModal(){
      modalCtx = null;
      modalBack.classList.remove("show");
    }

    document.getElementById("btnCloseModal").addEventListener("click", closeModal);
    document.getElementById("btnCloseModal2").addEventListener("click", closeModal);
    modalBack.addEventListener("click", (e) => { if(e.target === modalBack) closeModal(); });

    document.getElementById("btnReserveHalf").addEventListener("click", () => {
      if(guardEdit()) return;
      if(!modalCtx) return;

      // Lote (seleção múltipla): mesma Etapa + mesma Modalidade para todos os períodos selecionados
      if(modalCtx.slots && modalCtx.slots.length){
        const etapa = (document.getElementById("mEtapa").value || "").trim();
        if(!etapa){ alert("Selecione uma etapa (obrigatória) para salvar a reserva."); return; }

        const packId = document.getElementById("mPack").value || (state.packIds[0] || "");
        const modalidadeEl = document.querySelector('input[name="modalidadeAgenda"]:checked');
        const modalidade = modalidadeEl ? modalidadeEl.value : "";
        if(!modalidade){ alert("⚠️ Selecione se a agenda é Remota ou Presencial."); return; }

        const slots = modalCtx.slots.slice();
        const byId = Object.fromEntries(consultoresBase.map(c => [c.codusu, c]));
        const c = byId[modalCtx.codusu];
        const vSel = vinculoFromSub(c?.sub);
        const needJust = (vSel === "PJ" || vSel === "BP");
        const just = (document.getElementById("mJustPJ")?.value || "").trim();
        if(needJust && !just){
          alert("Justificativa obrigatória: informe o motivo da escolha do TERCEIRO ou BP.");
          return;
        }
        let ok = 0, skipR = 0;

        slots.forEach(s => {
          const already = reservas.some(r => r.fap===state.fap && r.codusu===s.codusu && r.dataISO===s.iso && r.turno===s.turno);
          if(already){ skipR++; return; }
          // grava reserva com mesma etapa, pack e modalidade
          reservas.push({
            fap: state.fap,
            packId: packId,
            codusu: s.codusu,
            dataISO: s.iso,
            turno: s.turno,
            etapa: etapa,
            modalidade: modalidade,
            justPJ: document.getElementById("mJustPJ")?.value || ""
          });
          ok++;
        });

        closeModal();
        clearSelected();
        renderAgenda();
        try{ syncP2(); }catch(e){}
        renderStepsP1();
        renderResumo();
        alert(`Reserva concluída: ${ok} reservado(s), ${skipR} ignorado(s) (já reservados).`);
        return;
      }

      // Unitário
      reserve(modalCtx.codusu, modalCtx.iso, [modalCtx.turno]);
      closeModal();
      renderAgenda();
      try{ syncP2(); }catch(e){}
      renderStepsP1();
    });

    document.getElementById("btnReserveDay").addEventListener("click", () => {
      if(guardEdit()) return;
      if(!modalCtx) return;
      reserve(modalCtx.codusu, modalCtx.iso, ["M","T"]);
      closeModal();
      renderAgenda();
      try{ syncP2(); }catch(e){}
      renderStepsP1();
      renderStepsP1();
    });

    document.getElementById("btnCancelReserve").addEventListener("click", () => {
      if(guardEdit()) return;
      if(!modalCtx) return;
      const before = reservas.length;
      reservas = reservas.filter(r => !(r.fap===state.fap && r.codusu===modalCtx.codusu && r.dataISO===modalCtx.iso));
      const after = reservas.length;
      alert(before===after ? "Nenhuma reserva encontrada para este dia." : "Reserva(s) cancelada(s).");
      scheduleSave();
      closeModal();
      renderAgenda();
      try{ syncP2(); }catch(e){}
      renderStepsP1();
    });

    
    function reserve(codusu, iso, turnos){
      if(guardEdit()) return;
      const etapa = (document.getElementById("mEtapa").value || "").trim();
      if(!etapa){
        alert("Selecione uma etapa (obrigatória) para salvar a reserva.");
        return;
      }
      const packId = document.getElementById("mPack").value || (state.packIds[0] || "");

      
      // Modalidade (obrigatória): Remoto / Presencial
      const modalidadeEl = document.querySelector('input[name="modalidadeAgenda"]:checked');
      const modalidade = modalidadeEl ? modalidadeEl.value : "";
      if(!modalidade){
        alert("⚠️ Selecione se a agenda é Remota ou Presencial.");
        return;
      }
const byId = Object.fromEntries(consultoresBase.map(c => [c.codusu, c]));
      const c = byId[codusu];
      const vSel = vinculoFromSub(c?.sub);
      const needJust = (vSel === "PJ" || vSel === "BP");
      const just = (document.getElementById("mJustPJ")?.value || "").trim();

      if(needJust && !just){
        alert("Justificativa obrigatória: informe o motivo da escolha do TERCEIRO ou BP.");
        return;
      }

      // conflito: se já existe reserva para o consultor naquele turno (qualquer pack) bloqueia
      for(const t of turnos){
        const exists = reservas.some(r =>
          r.fap===state.fap &&
          r.codusu===codusu &&
          r.dataISO===iso &&
          r.turno===t
        );
        if(exists){
          alert("Conflito: já existe reserva nesse turno para este consultor.");
          return;
        }
      }

      turnos.forEach(t => reservas.push({
        fap: state.fap,
        modalidade: modalidade,
        packId,
        codusu,
        dataISO: iso,
        turno: t,
        etapa,
        justPJ: needJust ? just : ""
      }));
    }

    // Resumo
document.getElementById("btnVoltarAgenda").addEventListener("click", () => goto("p2"));
document.getElementById("btnLimpar").addEventListener("click", () => {
      if(guardEdit()) return;
      if(!confirm("Deseja limpar TODAS as reservas deste FAP?")) return;
      reservas = reservas.filter(r => r.fap !== state.fap);
      scheduleSave();
      renderResumo();
      renderAgenda();
      renderStepsP1();
    });
    // ===== Barra de seleção múltipla (Aba 2) =====
    // handlers registrados via delegação no final do script (captura)

	const btnSendVal = document.getElementById("btnSendValidationFromResumo");
    if(btnSendVal){
      btnSendVal.addEventListener("click", () => sendToValidation());
      // Atualiza indicador no lado esquerdo (Aba 2)
      try{ renderStepsP1(); }catch(e){}

    }

    function canExportResumo(){
      const st = validationStatusByFap[state.fap] || "";
      return !!acceptedChangesByFap[state.fap] || st === "Pronto para Validar cronograma com Cliente" || isClientValidatedStatus(st);
    }

    function exportResumoCSV(){
      if(!resumoRowsCache.length){ alert("Não há dados no resumo para exportar."); return; }
      const header = ["Etapa","Pack","Consultor","Data início","Data fim","Período","Remoto/Presencial"];
      const rows = resumoRowsCache.map(r => [
        r.etapa, r.pack, r.consultor, r.dtIni, r.dtFim, r.periodo, r.modalidade
      ]);
      const csv = [header, ...rows].map(line => line.map(v => `"${String(v||"").replace(/\"/g,'""')}"`).join(";")).join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `resumo_${state.fap || "cronograma"}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    }

    function exportResumoPDF(){
      if(!resumoRowsCache.length){ alert("Não há dados no resumo para exportar."); return; }
      const win = window.open("", "_blank");
      if(!win){ alert("Pop-up bloqueado. Permita abrir nova janela para gerar o PDF."); return; }
      const rowsHtml = resumoRowsCache.map(r => `
        <tr>
          <td>${r.etapa}</td>
          <td>${r.pack}</td>
          <td>${r.consultor}</td>
          <td>${r.dtIni}</td>
          <td>${r.dtFim}</td>
          <td>${r.periodo}</td>
          <td>${r.modalidade}</td>
        </tr>
      `).join("");
      const genAt = new Date().toLocaleString("pt-BR");
      win.document.write(`
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Resumo das Agendas</title>
            <style>
              body{font-family:Arial,sans-serif; padding:20px;}
              h2{margin:0 0 12px;}
              .meta{font-size:12px; color:#374151; margin-bottom:10px;}
              table{width:100%; border-collapse:collapse; font-size:12px;}
              th,td{border:1px solid #ddd; padding:6px 8px; text-align:left;}
              th{background:#f3f4f6;}
            </style>
          </head>
          <body>
            <h2>Resumo das Agendas - FAP ${state.fap || "—"}</h2>
            <div class="meta"><b>Projeto:</b> ${state.cliente || "—"} &nbsp;•&nbsp; <b>Gerente de Projeto:</b> ${state.gp || "—"} &nbsp;•&nbsp; <b>Gerado em:</b> ${genAt}</div>
            <table>
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Pack</th>
                  <th>Consultor</th>
                  <th>Data início</th>
                  <th>Data fim</th>
                  <th>Período</th>
                  <th>Remoto/Presencial</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      win.print();
    }

    function renderResumo(){
      document.getElementById("kpi3Fap").textContent = state.fap || "—";
      document.getElementById("kpi3Packs").textContent = packsLabel(state.packIds);
      const cEl=document.getElementById("kpi3Cliente"); if(cEl) cEl.textContent = state.cliente || "—";
      const gEl=document.getElementById("kpi3GP"); if(gEl) gEl.textContent = state.gp || "—";
      const fEl=document.getElementById("kpi3Filial"); if(fEl) fEl.textContent = state.filial || "—";
      const elL = document.getElementById("kpi3Lider"); if(elL) elL.textContent = state.lider || "—";
      const elPMO = document.getElementById("kpi3GestorPMO"); if(elPMO) elPMO.textContent = state.gestorPMO || "—";

      const list = reservas
        .filter(r => r.fap===state.fap)
        .sort((a,b) => (a.dataISO+a.turno).localeCompare(b.dataISO+b.turno));

      document.getElementById("kpi3Res").textContent = String(list.length);

      const tbody = document.getElementById("resumoBody");
      const empty = document.getElementById("resumoEmpty");
      const exportsBox = document.getElementById("resumoExports");
      if(tbody) tbody.innerHTML = "";
      if(empty) empty.style.display = "none";
      if(exportsBox) exportsBox.style.display = canExportResumo() ? "block" : "none";

      if(!tbody){
        // fallback (se alguém remover a tabela no HTML)
        const resList = document.getElementById("resList");
        if(resList){
          resList.innerHTML = list.length ? "" : `<div class="muted">Nenhuma reserva registrada ainda.</div>`;
        }
        return;
      }

      if(list.length === 0){
        if(empty) empty.style.display = "block";
        return;
      }

      const byId = Object.fromEntries(consultoresBase.map(c => [c.codusu, c]));

      // --- Agrupar por Etapa + Pack + Consultor + Modalidade e consolidar datas consecutivas ---
      const groups = new Map(); // key -> array reservas
      const keyOf = (r) => `${r.etapa||"—"}|${r.packId||"—"}|${r.codusu||"—"}|${(r.modalidade||"—")}`;
      list.forEach(r => {
        const k = keyOf(r);
        if(!groups.has(k)) groups.set(k, []);
        groups.get(k).push(r);
      });
      const pad = n => String(n).padStart(2,"0");
      function add1DayISO(iso){
        const [y,m,d]=iso.split("-").map(Number);
        const dt = new Date(y, m-1, d);
        dt.setDate(dt.getDate()+1);
        return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
      }

      function periodoFromTurns(turnsSet){
        const hasM = turnsSet.has("M");
        const hasT = turnsSet.has("T");
        if(hasM && hasT) return "Dia todo";
        if(hasM) return "Manhã";
        if(hasT) return "Tarde";
        return "—";
      }

      // Linhas finais
      const rows = [];

      for(const [k, arr] of groups.entries()){
        const [etapa, packId, codusu, modalidade] = k.split("|");
        // map dia -> set(turnos)
        const byDay = new Map();
        arr.forEach(r => {
          const day = r.dataISO;
          if(!byDay.has(day)) byDay.set(day, new Set());
          byDay.get(day).add(r.turno);
        });

        const days = Array.from(byDay.keys()).sort();
        let runStart = null;
        let runEnd = null;
        let runPeriodo = null;

        for(let i=0;i<days.length;i++){
          const day = days[i];
          const periodo = periodoFromTurns(byDay.get(day));

          if(runStart === null){
            runStart = day; runEnd = day; runPeriodo = periodo;
            continue;
          }

          const expectedNext = add1DayISO(runEnd);
          const canExtend = (day === expectedNext) && (periodo === runPeriodo);

          if(canExtend){
            runEnd = day;
          }else{
            rows.push({etapa, packId, codusu, modalidade, dtIni: runStart, dtFim: runEnd, periodo: runPeriodo});
            runStart = day; runEnd = day; runPeriodo = periodo;
          }
        }

        if(runStart !== null){
          rows.push({etapa, packId, codusu, modalidade, dtIni: runStart, dtFim: runEnd, periodo: runPeriodo});
        }
      }

      // Ordenar por data início / consultor / pack
      rows.sort((a,b) => (a.dtIni + a.codusu + a.packId).localeCompare(b.dtIni + b.codusu + b.packId));

      const exportRows = [];

      rows.forEach(r => {
        const c = byId[r.codusu];
        const nome = c?.nome || r.codusu;
        const nivel = c?.nivel ? ` • ${c.nivel}` : "";
        const vincRaw = c ? vinculoFromSub(c.sub) : "";
        const vinc = vincRaw ? ` • ${vincRaw === "PJ" ? "TERCEIRO" : vincRaw}` : "";
        const packNome = packs[r.packId]?.nome || r.packId || "—";
        const mod = (r.modalidade && r.modalidade !== "—") ? r.modalidade : "—";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="text-align:left">${r.etapa || "—"}</td>
          <td style="text-align:left">${packNome}</td>
          <td style="text-align:left"><b>${nome}</b><span class="muted">${nivel}${vinc}</span></td>
          <td>${fmtBR(r.dtIni)}</td>
          <td>${fmtBR(r.dtFim)}</td>
          <td>${r.periodo || "—"}</td>
          <td>${mod}</td>
        `;
        tbody.appendChild(tr);

        exportRows.push({
          etapa: r.etapa || "—",
          pack: packNome,
          consultor: `${nome}${nivel}${vinc}`,
          dtIni: fmtBR(r.dtIni),
          dtFim: fmtBR(r.dtFim),
          periodo: r.periodo || "—",
          modalidade: mod
        });
      });
      resumoRowsCache = exportRows;
    }



    // ===== Validação / Ajustes do Líder =====
    
    function sendToValidation(){
      if(!state.fap){
        const fapFromInput = (document.getElementById("fap")?.value || "").trim();
        const fapFromP2 = (document.getElementById("p2Fap")?.textContent || "").trim();
        state.fap = fapFromInput || (fapFromP2 !== "—" ? fapFromP2 : "");
      }
      if(!state.fap){
        alert("Informe a FAP antes de enviar para validação.");
        return;
      }
      sentToValidation[state.fap] = true;
      validationStatusByFap[state.fap] = "Em validação Líder da Torre";
      scheduleSave();
      alert("Cronograma enviado para validação do Líder da Torre.");
      goto("p4");
    }

    function guardP4(){
      const guard = document.getElementById("p4Guard");
      const content = document.getElementById("p4Content");
      if(!guard || !content) return;
      const ok = !!sentToValidation[state.fap];
      guard.style.display = ok ? "none" : "block";
      content.style.display = ok ? "block" : "none";
    }


    
function guardP5(){
  const guard = document.getElementById("p5Guard");
  const content = document.getElementById("p5Content");
  if(!guard || !content) return;
  const ok = !!sentToValidation[state.fap];
  guard.style.display = ok ? "none" : "block";
  content.style.display = ok ? "block" : "none";
}
    function renderLeaderResList(){
      const box = document.getElementById("leaderResList");
      if(!box) return;

      const list = reservas
        .filter(r => r.fap===state.fap)
        .sort((a,b) => (a.dataISO+a.turno).localeCompare(b.dataISO+b.turno));

      if(list.length === 0){
        box.innerHTML = `<div class="muted">Nenhuma reserva para ajustar.</div>`;
        return;
      }

      const byId = Object.fromEntries(consultoresBase.map(c => [c.codusu, c]));
      const cltAvail = hasCltAvailabilityInPeriod();
      box.innerHTML = "";

      list.forEach((r, idx) => {
        const c = byId[r.codusu];
        const nome = c?.nome || r.codusu;
        const turno = r.turno === "M" ? "Manhã" : "Tarde";
        const packNome = packs[r.packId]?.nome || r.packId || "—";
        const vincRaw = vinculoFromSub(c?.sub);
        const vincLabel = vincRaw === "PJ" ? "TERCEIRO" : vincRaw;
        const warnClt = (vincRaw === "PJ" && cltAvail)
          ? `<div style="margin-top:4px; color:#fde68a"><b>Alerta:</b> há CLT disponível no período.</div>`
          : "";

        const wrap = document.createElement("div");
        wrap.className = "item";

        wrap.innerHTML = `
          <div>
            <b>${nome} • ${vincLabel}</b>
            <div>${fmtBR(r.dataISO)} • ${turno} • Pack: ${packNome}${r.modalidade ? " • " + r.modalidade : ""}</div>
            ${warnClt}
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end">
            <button class="ghost" onclick="leaderCancel(${idx})" style="width:auto; padding:8px 10px">Cancelar</button>
            <button class="secondary" onclick="leaderSwap(${idx})" style="width:auto; padding:8px 10px">Trocar</button>
          </div>
        `;
        box.appendChild(wrap);
      });
    
    }

// ===== Ações globais (fallback) para Etapa 4: Cancelar/Trocar =====
    // Uso: onclick direto nos botões para evitar problemas de binding em re-render.
    window.leaderCancel = function(i){
      if(guardEdit()) return;
      try{
        const list2 = reservas
          .filter(r => r.fap===state.fap)
          .sort((a,b) => (a.dataISO+a.turno).localeCompare(b.dataISO+b.turno));
        const r = list2[i];
        if(!r){ alert("Reserva não encontrada."); return; }

        reservas = reservas.filter(x => !(x.fap===r.fap && x.codusu===r.codusu && x.dataISO===r.dataISO && x.turno===r.turno));
        logLeaderChange("Cancelamento", `Cancelou ${r.codusu} em ${fmtBR(r.dataISO)} (${r.turno}) Pack ${r.packId}`);
        scheduleSave();
        alert("Reserva cancelada (log registrado).");
        renderLeaderResList();
        renderAgenda();
      renderStepsP1();
      }catch(e){
        console.error(e);
        alert("Falha ao cancelar. Verifique o console.");
      }
    };

    window.leaderSwap = function(i){
      try{
        const list2 = reservas
          .filter(r => r.fap===state.fap)
          .sort((a,b) => (a.dataISO+a.turno).localeCompare(b.dataISO+b.turno));
        const r = list2[i];
        if(!r){ alert("Reserva não encontrada."); return; }
        if(typeof openSwapModal !== "function"){
          alert("Função de troca não encontrada (openSwapModal).");
          return;
        }
        openSwapModal(r);
      }catch(e){
        console.error(e);
        alert("Falha ao abrir a troca. Verifique o console.");
      }
    };




// Etapa 5: Aceite/Não Aceite do Gerente de Projeto
const btnGpAccept = document.getElementById("btnGpAccept");
if(btnGpAccept){
  btnGpAccept.addEventListener("click", () => {
    if(!state.fap){ alert("Informe a FAP."); return; }
    const stNow = validationStatusByFap[state.fap] || "Pendente";
    if(stNow !== "Aguardando Aceite do Gerente de Projeto"){
      alert("Este cronograma não está aguardando aceite do Gerente de Projeto.");
      return;
    }
    acceptedChangesByFap[state.fap] = true;
    validationStatusByFap[state.fap] = "Pronto para Validar cronograma com Cliente";
    scheduleSave();
    alert("Aceite registrado. Cronograma concluído.");
    renderResumo();
    renderValidated();
  });
}

const btnGpReject = document.getElementById("btnGpReject");
if(btnGpReject){
  btnGpReject.addEventListener("click", () => {
    if(!state.fap){ alert("Informe a FAP."); return; }
    const stNow = validationStatusByFap[state.fap] || "Pendente";
    if(stNow !== "Aguardando Aceite do Gerente de Projeto"){
      alert("Este cronograma n�o est� aguardando aceite do Gerente de Projeto.");
      return;
    }
    // Solicita ajustes ao L�der da Torre
    acceptedChangesByFap[state.fap] = false;
    validationStatusByFap[state.fap] = "Em ajustes pelo L�der da Torre";
    scheduleSave();
    alert("Solicita��o de ajustes enviada ao L�der da Torre. Retornando para a Etapa 4.");
    goto("p4");
  });
}

function handleClientValidated(){
  if(!state.fap){ alert("Informe a FAP."); return; }
  const stNow = validationStatusByFap[state.fap] || "Pendente";
  if(stNow !== "Pronto para Validar cronograma com Cliente"){
    alert("Cronograma validado com cliente e atualizado.");
    return;
  }
  validationStatusByFap[state.fap] = STATUS_CLIENT_VALIDATED;
  scheduleSave();

  const finalMsg = document.getElementById("p5FinalMsg");
  const clientArea = document.getElementById("p5ClientArea");
  const clientFinalMsg = document.getElementById("p5ClientFinalMsg");
  if(finalMsg) finalMsg.style.display = "none";
  if(clientArea) clientArea.style.display = "none";
  if(clientFinalMsg) clientFinalMsg.style.display = "block";
  renderValidated();
}

const btnClientValidated = document.getElementById("btnClientValidated");
if(btnClientValidated){
  btnClientValidated.addEventListener("click", handleClientValidated);
}
const btnReprogramStart = document.getElementById("btnReprogramStart");
if(btnReprogramStart){
  btnReprogramStart.addEventListener("click", () => {
    if(!state.fap){ alert("Informe a FAP."); return; }
    openReprogramModal(state.fap, () => {
      goto("p1");
      document.getElementById("fap")?.focus();
    });
  });
}
function renderValidated(){
      document.getElementById("kpi5Fap").textContent = state.fap || "—";
      document.getElementById("kpi5Packs").textContent = packsLabel(state.packIds);
      const cEl=document.getElementById("kpi5Cliente"); if(cEl) cEl.textContent = state.cliente || "—";
      const gEl=document.getElementById("kpi5GP"); if(gEl) gEl.textContent = state.gp || "—";
      const fEl=document.getElementById("kpi5Filial"); if(fEl) fEl.textContent = state.filial || "—";
      const st = validationStatusByFap[state.fap] || "Pendente";
      document.getElementById("kpi5Status").textContent = st;
      const p5Comment = document.getElementById("p5ValidationComment");
      if(p5Comment) p5Comment.value = state.validationComment || "";
      const reprogramArea = document.getElementById("p5ReprogramArea");
      if(reprogramArea) reprogramArea.style.display = isClientValidatedStatus(st) ? "block" : "none";
      updateClientValidationUI(st);

      const box = document.getElementById("leaderChangesList");
      const acceptArea = document.getElementById("p5AcceptArea");
      const finalMsg = document.getElementById("p5FinalMsg");
      if(!box) return;

      const logs = leaderChanges
        .filter(x => x.fap === state.fap)
        .sort((a,b) => a.whenISO.localeCompare(b.whenISO));

      box.innerHTML = "";

      const hasChanges = logs.length > 0;
      const accepted = !!acceptedChangesByFap[state.fap];

      // Caso 1: Sem alterações -> depende do STATUS (não pode concluir antes da Etapa 4)
if(!hasChanges){
  const stNow = validationStatusByFap[state.fap] || "Pendente";
  const isWaitingGp = stNow === "Aguardando Aceite do Gerente de Projeto";
  const isDone = stNow.toLowerCase().startsWith("concluído") || stNow.toLowerCase().startsWith("concluido") || stNow === "Pronto para Validar cronograma com Cliente" || isClientValidatedStatus(stNow);

  // Em validação do Líder (Etapa 4 ainda não concluída): não exibe mensagem de concluído
  if(stNow === "Em validação Líder da Torre"){
    if(acceptArea) acceptArea.style.display = "none";
    if(finalMsg) finalMsg.style.display = "none";

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div>
        <b>Em validação do Líder da Torre</b>
        <div>O cronograma está em análise. Nenhuma decisão final foi registrada ainda.</div>
      </div>
      <span class="tag">EM VALIDAÇÃO</span>
    `;
    box.appendChild(div);
    return;
  }

  // Validação do Líder concluída: pode ir para aceite do GP (mesmo sem alterações)
  if(isWaitingGp){
    if(acceptArea) acceptArea.style.display = "block";
    if(finalMsg) finalMsg.style.display = "none";

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div>
        <b>Validação do Líder da Torre concluída</b>
        <div>Nenhuma alteração foi necessária. Aguardando aceite do Gerente de Projeto.</div>
      </div>
      <span class="tag">AGUARDANDO GP</span>
    `;
    box.appendChild(div);
    return;
  }

  // Concluído: exibe mensagem final
  if(isDone){
  if(acceptArea) acceptArea.style.display = "none";
  if(finalMsg) finalMsg.style.display = "block";
  updateClientValidationUI(stNow);

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div>
        <b>Cronograma aprovado</b>
        <div>Nenhuma alteração foi necessária.</div>
      </div>
      <span class="tag">CONCLUÍDO</span>
    `;
    box.appendChild(div);
    return;
  }

  // Outros estados: padrão (não mostra final nem aceite)
  if(acceptArea) acceptArea.style.display = "none";
  if(finalMsg) finalMsg.style.display = "none";
  updateClientValidationUI(stNow);
  const div = document.createElement("div");
  div.className = "item";
  div.innerHTML = `
    <div>
      <b>Status: ${stNow}</b>
      <div>Acompanhe o fluxo para avançar.</div>
    </div>
    <span class="tag">STATUS</span>
  `;
  box.appendChild(div);
  return;
}

function updateClientValidationUI(stNow){
  const clientArea = document.getElementById("p5ClientArea");
  const btn = document.getElementById("btnClientValidated");
  const note = document.getElementById("p5ClientNote");
  if(clientArea) clientArea.style.display = "block";
  const ready = stNow === "Pronto para Validar cronograma com Cliente";
  if(btn){
    btn.disabled = false;
    btn.classList.toggle("isDisabled", !ready);
  }
  if(note){
    note.textContent = ready
      ? "Ao confirmar, registraremos que todas as agendas foram confirmadas e que o cronograma foi enviado para o Sankhya Experience para validação final."
      : "Disponível após o aceite do Gerente de Projeto.";
  }
}


      // Caso 2: Com alterações -> listar alterações
      logs.forEach(l => {
        const d = new Date(l.whenISO);
        const when = d.toLocaleString("pt-BR");
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
          <div>
            <b>${l.action}</b>
            <div>${when} • ${l.detail}</div>
          </div>
          <span class="tag">ALTERAÇÃO</span>
        `;
        box.appendChild(div);
      });

        // Regra de exibição na Etapa 5 baseada em STATUS
  const stNow = validationStatusByFap[state.fap] || "Pendente";
  const isWaitingGp = stNow === "Aguardando Aceite do Gerente de Projeto";
  const isDone = stNow.toLowerCase().startsWith("concluído") || stNow.toLowerCase().startsWith("concluido") || stNow === "Pronto para Validar cronograma com Cliente" || isClientValidatedStatus(stNow);

  if(isWaitingGp){
    if(acceptArea) acceptArea.style.display = "block";
    if(finalMsg) finalMsg.style.display = "none";
    updateClientValidationUI(stNow);
  }else if(isDone){
        if(acceptArea) acceptArea.style.display = "none";
        if(finalMsg) finalMsg.style.display = "block";
        updateClientValidationUI(stNow);
      }else{
    // Demais estados: não pede aceite do GP ainda
    if(acceptArea) acceptArea.style.display = "none";
    if(finalMsg) finalMsg.style.display = "none";
    updateClientValidationUI(stNow);
  }
  applyEditLockUI();
}

    // Etapa 4/5 botões
// Etapa 4: ao concluir (enviar para GP), muda status para "Aguardando Aceite do Gerente de Projeto"
const btnEnviar = document.getElementById("btnEnviarValidacao");
if(btnEnviar){
  btnEnviar.addEventListener("click", () => {
    if(!state.fap){
      alert("Informe a FAP antes de enviar.");
      return;
    }
    if(!sentToValidation[state.fap]){
      alert("Envie primeiro para validação do Líder da Torre (Etapa 3).");
      return;
    }
    validationStatusByFap[state.fap] = "Aguardando Aceite do Gerente de Projeto";
    scheduleSave();
    alert("Validação do Líder concluída. Aguardando aceite do Gerente de Projeto.");
    goto("p5");
  });
}

    const btnVoltarP4 = document.getElementById("btnVoltarP4");
    if(btnVoltarP4){
      btnVoltarP4.addEventListener("click", () => goto("p4"));
    }

    const btnAprovarFinal = document.getElementById("btnAprovarFinal");
    if(btnAprovarFinal){
      btnAprovarFinal.addEventListener("click", () => {
        validationStatusByFap[state.fap] = "Validado";
        scheduleSave();
        alert("Cronograma marcado como VALIDADO (MVP).");
        renderValidated();
      });
    }



    function renderP4ThirdPartyAlerts(){
      const box = document.getElementById("p4ThirdPartyAlerts");
      if(!box) return;

      // Contexto do pedido (FAP/Cliente/GP/Filial)
      const elFap = document.getElementById("p4Fap"); if(elFap) elFap.textContent = state.fap || "—";
      const elCli = document.getElementById("p4Cliente"); if(elCli) elCli.textContent = state.cliente || "—";
      const elGP  = document.getElementById("p4GP"); if(elGP) elGP.textContent = state.gp || "—";
      const elFil = document.getElementById("p4Filial"); if(elFil) elFil.textContent = state.filial || "—";
      const elL = document.getElementById("p4Lider"); if(elL) elL.textContent = state.lider || "—";
      const elPMO = document.getElementById("p4GestorPMO"); if(elPMO) elPMO.textContent = state.gestorPMO || "—";
      const valComment = document.getElementById("p4ValidationComment");
      if(valComment) valComment.value = state.validationComment || "";
      const obsWrap = document.getElementById("p4ObsWrap");
      const obsText = document.getElementById("p4ObsText");
      if(obsWrap && obsText){
        const t = (state.obs || "").trim();
        if(t){
          obsText.textContent = t;
          obsWrap.style.display = "block";
        }else{
          obsWrap.style.display = "none";
        }
      }




      const byId = Object.fromEntries(consultoresBase.map(c => [c.codusu, c]));
      const logs = reservas
        .filter(r => r.fap === state.fap && (r.justPJ || "").trim().length > 0)
        .map(r => {
          const c = byId[r.codusu];
          return {
            codusu: r.codusu,
            nome: c?.nome || r.codusu,
            sub: c?.sub || "",
            dataISO: r.dataISO,
            turno: r.turno,
            packId: r.packId,
            etapa: r.etapa,
            modalidade: r.modalidade || "",
            just: r.justPJ
          };
        });

      // Somente quando for TERCEIRO ou BP
      const thirds = logs.filter(x => {
        const v = vinculoFromSub(x.sub);
        return v === "PJ" || v === "BP";
      });

      if(thirds.length === 0){
        box.innerHTML = `<div class="muted">Nenhum alerta de TERCEIRO/BP nesta FAP.</div>`;
        return;
      }

      // Compactar por consultor + justificativa (para não repetir demais)
      const key = (x) => `${x.codusu}||${x.just}`;
      const seen = new Set();
      const unique = [];
      for(const x of thirds){
        const k = key(x);
        if(seen.has(k)) continue;
        seen.add(k);
        unique.push(x);
      }

      box.innerHTML = "";
      unique.forEach(x => {
        const div = document.createElement("div");
        div.className = "item";
        const turno = x.turno === "M" ? "Manhã" : "Tarde";
        const packNome = packs[x.packId]?.nome || x.packId;
        const v = vinculoFromSub(x.sub);
        const vLabel = v === "PJ" ? "TERCEIRO" : "BP";
        div.innerHTML = `
          <div>
            <b>${x.nome} • ${vLabel}</b>
            <div>${fmtBR(x.dataISO)} • ${turno} • Pack: ${packNome}${x.modalidade ? " • "+x.modalidade : ""}</div>
            <div style="margin-top:4px; color:#fde68a"><b>Justificativa:</b> ${x.just}</div>
          </div>
          <span class="tag">ALERTA</span>
        `;
        box.appendChild(div);
      });
    }



    const btnAccept = document.getElementById("btnAcceptChanges");
    if(btnAccept){
      btnAccept.addEventListener("click", () => {
        if(!state.fap) return;
        acceptedChangesByFap[state.fap] = true;
        validationStatusByFap[state.fap] = "Concluído - Alocação de recurso";
        alert("Alterações aceitas. Seu cronograma foi validado Pelo Líder da torre e esta pronto para ser validado cliente.");
        renderValidated();
      });
    }


    // Init
    function initDefaults(){
      const today = new Date();
      const in7 = addDays(today, 7);
      const dtIniEl = document.getElementById("dtIni");
      const dtFimEl = document.getElementById("dtFim");
      const todayISO = toISODate(today);
      if(dtIniEl){
        dtIniEl.min = todayISO;
        dtIniEl.value = state.dtIni || todayISO;
        state.dtIni = dtIniEl.value;
        dtIniEl.addEventListener("change", () => {
          if(dtIniEl.value !== todayISO){
            dtIniEl.value = todayISO;
            state.dtIni = todayISO;
            alert("Data inicio e sempre a data de hoje (MVP).");
            togglePacksVisibility();
            refreshPreview();
            scheduleSave();
          }
        });
      }
      if(dtFimEl){
        dtFimEl.min = todayISO;
        dtFimEl.value = state.dtFim || toISODate(in7);
        state.dtFim = dtFimEl.value;
      }

      if(!state.packIds || state.packIds.length === 0){
        const firstCb = document.querySelector('input[name="packs"]');
        if(firstCb) firstCb.checked = true;
        state.packIds = firstCb ? [firstCb.value] : [];
      }

      renderStepsP1();
      togglePacksVisibility();
      toggleStepsByPacks();
      updateActionButtons();
      refreshPreview();
    }

    async function initApp(){
      const stored = await loadData();
      if(stored) applyData(stored);
      initDefaults();
      applyStateToUI();
      if(state.packIds && state.packIds.length){
        computeEligible();
      }
      renderAgenda();
      renderResumo();
      if(sentToValidation[state.fap]){ renderValidated(); }
      if(!stored) scheduleSave();
    }
    initApp();
  
    /* ===== Etapa 4 – Troca de consultor com verificação de recursos (modal) ===== */
let swapCtx = { open:false, reserva:null, selected:null, needJust:false, dateISO:null, turno:null };
let reprogramCtx = { open:false, fap:null, onConfirm:null, prevFap:"", confirmed:false };

    function openSwapModal(reserva){
      // Garante que a lista de elegíveis esteja atualizada (Etapa 4 pode ser acessada sem ter passado pela Etapa 2)
      try{ if(typeof syncP2 === 'function'){ syncP2(); } }catch(e){}

      swapCtx.open = true;
      swapCtx.reserva = reserva;
      swapCtx.selected = null;
      swapCtx.dateISO = reserva.dataISO;
      swapCtx.turno = reserva.turno;
      // Contexto
      const packNome = (packs[reserva.packId]?.nome || reserva.packId);
      const turno = reserva.turno === "M" ? "Manhã" : (reserva.turno === "T" ? "Tarde" : reserva.turno);
      $("#swapContext").innerHTML = `<b>FAP ${reserva.fap}</b> • Atual: ${fmtBR(reserva.dataISO)} • ${turno} • Pack: <b>${packNome}</b>`;

      // Badges
      $("#swapBadgeSlot").textContent = `Slot atual: ${fmtBR(reserva.dataISO)} • ${turno}`;
      const cltAvail = hasCltAvailabilityInPeriod();
      $("#swapBadgeRule").textContent = `Regra PJ/CLT: ${cltAvail ? "há CLT disponível no período" : "sem CLT disponível no período"}`;

      // Preenche box atual
      const atual = consultoresBase.find(c => c.codusu===reserva.codusu);
      $("#swapCurrentBox").innerHTML = renderPersonMini(atual, reserva, true, swapCtx.dateISO, swapCtx.turno, reserva);

      // Reset UI
      swapCtx.selected = atual || null;
      $("#swapSelectedBox").innerHTML = swapCtx.selected
        ? renderPersonMini(swapCtx.selected, reserva, false, swapCtx.dateISO, swapCtx.turno, reserva)
        : "Selecione um consultor na lista";
      updateCompareHighlight(atual, swapCtx.selected);
      $("#swapJustText").value = "";
      $("#swapJustBox").style.display = "none";
      const btnSwap = $("#btnSwapConfirm");
      if(swapCtx.selected){
        btnSwap?.classList?.remove("isDisabled");
        if(btnSwap) delete btnSwap.dataset.disabled;
      }else{
        btnSwap?.classList?.add("isDisabled");
        if(btnSwap) btnSwap.dataset.disabled = "1";
      }
      swapCtx.needJust = false;

      // Inputs data/turno
      if($("#swapDate")) $("#swapDate").value = reserva.dataISO;
      if($("#swapTurno")) $("#swapTurno").value = reserva.turno;

      // Defaults
      $("#swapOnlyFree").checked = true;
      $("#swapVinculo").value = "REC";
      $("#swapSort").value = "SMART";
      $("#swapSearch").value = "";

      updateSwapSlotUI();

      // Render candidates
      renderSwapCandidates();

      // Open
      $("#swapBackdrop").style.display = "flex";
      $("#swapBackdrop").setAttribute("aria-hidden","false");
    }

    function closeSwapModal(){
      swapCtx.open = false;
      swapCtx.reserva = null;
      swapCtx.selected = null;
      $("#swapBackdrop").style.display = "none";
      $("#swapBackdrop").setAttribute("aria-hidden","true");
    }

    let reprogramChoiceCtx = { open:false, fap:null, prevFap:"" };

    function openReprogramChoice(fap, prevFap=""){
      reprogramChoiceCtx.open = true;
      reprogramChoiceCtx.fap = fap;
      reprogramChoiceCtx.prevFap = prevFap || "";
      const ctx = document.getElementById("reprogramChoiceText");
      if(ctx) ctx.textContent = `FAP ${fap}`;
      const back = document.getElementById("reprogramChoiceBackdrop");
      if(back){
        back.style.display = "flex";
        back.setAttribute("aria-hidden","false");
      }
    }

    function closeReprogramChoice(restoreFap=true){
      const prev = reprogramChoiceCtx.prevFap || "";
      reprogramChoiceCtx.open = false;
      reprogramChoiceCtx.fap = null;
      reprogramChoiceCtx.prevFap = "";
      const back = document.getElementById("reprogramChoiceBackdrop");
      if(back){
        back.style.display = "none";
        back.setAttribute("aria-hidden","true");
      }
      if(restoreFap){
        const fapEl = document.getElementById("fap");
        if(fapEl) fapEl.value = prev;
      }
    }
function openReprogramModal(fap, onConfirm, prevFap=""){
      reprogramCtx.open = true;
      reprogramCtx.fap = fap;
      reprogramCtx.onConfirm = onConfirm || null;
      reprogramCtx.prevFap = prevFap || "";
      reprogramCtx.confirmed = false;
      const ctx = document.getElementById("reprogramContext");
      if(ctx) ctx.textContent = `FAP ${fap}`;
      const reason = document.getElementById("reprogramReason");
      const detail = document.getElementById("reprogramDetail");
      const badge = document.getElementById("reprogramBadge");
      if(reason) reason.value = "";
      if(detail) detail.value = "";
      if(badge) badge.textContent = "Motivo obrigatório";
      const wrap = document.getElementById("reprogramDetailWrap");
      if(wrap) wrap.style.display = "none";
      const back = document.getElementById("reprogramBackdrop");
      if(back){
        back.style.display = "flex";
        back.setAttribute("aria-hidden","false");
      }
    }

    function closeReprogramModal(){
      const prev = reprogramCtx.prevFap || "";
      const wasConfirmed = !!reprogramCtx.confirmed;
      reprogramCtx.open = false;
      reprogramCtx.fap = null;
      reprogramCtx.onConfirm = null;
      reprogramCtx.prevFap = "";
      reprogramCtx.confirmed = false;
      const back = document.getElementById("reprogramBackdrop");
      if(back){
        back.style.display = "none";
        back.setAttribute("aria-hidden","true");
      }
      if(!wasConfirmed){
        const fapEl = document.getElementById("fap");
        if(fapEl) fapEl.value = prev;
      }
    }

    function renderPersonMini(c, reserva, isCurrent=false, slotDateISO=null, slotTurno=null, ignoreReserva=null){
      if(!c) return `<div class="muted">—</div>`;
      const vinc = (c.vinculo || vinculoFromSub(c.sub) || "").toUpperCase();
      const checkDate = slotDateISO || reserva.dataISO;
      const checkTurno = slotTurno || reserva.turno;
      const slotFree = isSlotFreeConsideringSwap(c.codusu, checkDate, checkTurno, ignoreReserva);
      const badge = slotFree ? `<span class="badge ok">Livre no slot</span>` : `<span class="badge off">Ocupado no slot</span>`;
      const periodPct = Math.round(periodAvailabilityPct(c.codusu) * 100);
      const typeChip = vinc === "CLT"
        ? `<span class="chip good">CLT</span>`
        : (vinc === "BP" ? `<span class="chip warn">BP</span>` : `<span class="chip warn">TERCEIRO</span>`);
      return `
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start">
          <div>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap">
              <b>${c.nome}</b>
              <span class="chip">${c.codusu}</span>
              ${typeChip}
            </div>
            <div class="muted" style="margin-top:4px">${(c.sub||"").trim() || "—"}</div>
            <div class="meta" style="margin-top:8px">${badge} <span class="badge">${periodPct}% livre no período</span></div>
          </div>
          ${isCurrent ? `<span class="badge">Atual</span>` : ``}
        </div>
      `;
    }

    function isSlotFree(codusu, dataISO, turno){
      // Considera conflito em qualquer FAP (simulação de agenda corporativa)
      return !reservas.some(x => x.codusu===codusu && x.dataISO===dataISO && x.turno===turno);
    }

    function isSlotFreeConsideringSwap(codusu, dataISO, turno, ignoreReserva){
      const hasRealConflict = reservas.some(x => {
        if(x.codusu!==codusu || x.dataISO!==dataISO || x.turno!==turno) return false;
        if(!ignoreReserva) return true;
        return !(x.fap===ignoreReserva.fap && x.codusu===ignoreReserva.codusu && x.dataISO===ignoreReserva.dataISO && x.turno===ignoreReserva.turno);
      });
      if(hasRealConflict) return false;

      const simStatus = getSimulatedStatusLR(codusu, dataISO, turno, ignoreReserva);
      return simStatus !== "R";
    }

    function getSimulatedStatusLR(codusu, dataISO, turno, ignoreReserva){
      if(!state.dtIni || !state.dtFim) return "L";
      const days = buildDaysRange(state.dtIni, state.dtFim);
      const dayIndex = days.findIndex(d => toISODate(d) === dataISO);
      const baseLR = dayIndex >= 0 ? baseStatusLR(seedFor(codusu), dayIndex, turno) : "L";
      const hasSameFap = reservas.some(r => {
        if(r.fap!==state.fap || r.codusu!==codusu || r.dataISO!==dataISO || r.turno!==turno) return false;
        if(!ignoreReserva) return true;
        return !(r.fap===ignoreReserva.fap && r.codusu===ignoreReserva.codusu && r.dataISO===ignoreReserva.dataISO && r.turno===ignoreReserva.turno);
      });
      return hasSameFap ? "R" : baseLR;
    }

    function periodAvailabilityPct(codusu){
      if(!state.dtIni || !state.dtFim) return 0;
      const days = buildDaysRange(state.dtIni, state.dtFim);
      let total = 0, free = 0;
      for(const d of days){
        const iso = toISODate(d);
        for(const t of ["M","T"]){
          total += 1;
          const base = baseStatusLR(seedFor(codusu), days.indexOf(d), t);
          const st = getSlotStatusLR(codusu, iso, t, base);
          if(st === "L") free += 1;
        }
      }
      return total ? (free/total) : 0;
    }

    function seedFor(codusu){
      const cElig = currentEligible?.find(x => x.codusu===codusu);
      if(cElig?.seed) return cElig.seed;
      const c = consultoresBase.find(x => x.codusu===codusu);
      return (c?.seed || 1);
    }

    function getSwapTargetSlot(){
      const r = swapCtx.reserva;
      const domDate = document.getElementById("swapDate")?.value;
      const domTurno = document.getElementById("swapTurno")?.value;
      return {
        dateISO: domDate || swapCtx.dateISO || r?.dataISO,
        turno: domTurno || swapCtx.turno || r?.turno
      };
    }

    function updateSwapSlotUI(){
      const r = swapCtx.reserva;
      if(!r) return;
      const { dateISO, turno } = getSwapTargetSlot();
      const packNome = packs[r.packId]?.nome || r.packId || "—";
      const curTurno = r.turno === "M" ? "Manhã" : "Tarde";
      const newTurno = turno === "M" ? "Manhã" : "Tarde";
      const curLabel = `${fmtBR(r.dataISO)} • ${curTurno}`;
      const newLabel = `${fmtBR(dateISO)} • ${newTurno}`;
      $("#swapContext").innerHTML = `<b>FAP ${r.fap}</b> • Atual: ${curLabel} • Novo: ${newLabel} • Pack: <b>${packNome}</b>`;
      $("#swapBadgeSlot").textContent = (r.dataISO===dateISO && r.turno===turno)
        ? `Slot: ${newLabel}`
        : `Slot atual: ${curLabel} • Novo: ${newLabel}`;

      const atual = consultoresBase.find(c => c.codusu===r.codusu);
      $("#swapCurrentBox").innerHTML = renderPersonMini(atual, r, true, dateISO, turno, r);
      if(swapCtx.selected){
        $("#swapSelectedBox").innerHTML = renderPersonMini(swapCtx.selected, r, false, dateISO, turno, r);
      }
      updateCompareHighlight(atual, swapCtx.selected);
    }

    function updateCompareHighlight(atual, novo){
      const curEl = document.getElementById("swapCurrentBox");
      const newEl = document.getElementById("swapSelectedBox");
      if(!curEl || !newEl) return;
      curEl.classList.remove("compareBetter");
      newEl.classList.remove("compareBetter");
      if(!atual || !novo) return;
      const curPct = periodAvailabilityPct(atual.codusu);
      const newPct = periodAvailabilityPct(novo.codusu);
      if(newPct > curPct){
        newEl.classList.add("compareBetter");
      }else if(curPct > newPct){
        curEl.classList.add("compareBetter");
      }
    }

    function renderSwapCandidates(){
      if(!swapCtx.reserva) return;
      const r = swapCtx.reserva;
      const { dateISO, turno } = getSwapTargetSlot();

      const q = ($("#swapSearch").value || "").trim().toLowerCase();
      const vinc = $("#swapVinculo").value;
      const onlyFree = $("#swapOnlyFree").checked;
      const sort = $("#swapSort").value;

      // Lista base: elegíveis
      let cands = currentEligible
        .map(c => {
          const slotFree = isSlotFreeConsideringSwap(c.codusu, dateISO, turno, r);
          const pct = periodAvailabilityPct(c.codusu);
          const v = (c.vinculo || vinculoFromSub(c.sub) || "").toUpperCase();
          return { ...c, _slotFree: slotFree, _pct: pct, _v: v };
        })
        .filter(c => c.codusu !== r.codusu); // evita sugerir o mesmo

      // Filtros
      if(q){
        cands = cands.filter(c => (c.nome||"").toLowerCase().includes(q) || (c.codusu||"").toLowerCase().includes(q));
      }
      if(vinc !== "ALL"){
        if(vinc === "REC"){
          cands = cands.filter(c => c._v === "CLT" || c._v === "PJ");
        }else{
          cands = cands.filter(c => c._v === vinc);
        }
      }
      if(onlyFree){
        cands = cands.filter(c => c._slotFree);
      }

      // Ordenação
      if(sort === "NAME"){
        cands.sort((a,b) => (a.nome||"").localeCompare(b.nome||""));
      }else if(sort === "AVAIL"){
        cands.sort((a,b) => (b._pct - a._pct) || (a.nome||"").localeCompare(b.nome||""));
      }else{
        // SMART: preferir CLT, depois slotFree, depois disponibilidade
        cands.sort((a,b) => {
          const aScore = (a._v==="CLT"? 1000:0) + (a._slotFree?100:0) + Math.round(a._pct*100);
          const bScore = (b._v==="CLT"? 1000:0) + (b._slotFree?100:0) + Math.round(b._pct*100);
          return (bScore - aScore) || (a.nome||"").localeCompare(b.nome||"");
        });
      }

      // Render
      const box = $("#swapCandList");
      box.innerHTML = "";
      if(!cands.length){
        box.innerHTML = `<div class="muted">Nenhum consultor encontrado com os filtros atuais.</div>`;
        return;
      }

      const atual = consultoresBase.find(x => x.codusu===r.codusu);
      const atualPct = atual ? periodAvailabilityPct(atual.codusu) : 0;

      for(const c of cands){
        const slotBadge = c._slotFree ? `<span class="badge ok">Livre no slot</span>` : `<span class="badge off">Ocupado</span>`;
        const typeChip = c._v === "CLT"
          ? `<span class="chip good">CLT</span>`
          : (c._v === "BP" ? `<span class="chip warn">BP</span>` : `<span class="chip warn">TERCEIRO</span>`);
        const pct = Math.round(c._pct*100);

        const el = document.createElement("div");
        const isBetter = c._pct > atualPct;
        el.className = "cand" + (swapCtx.selected?.codusu===c.codusu ? " selected" : "") + (isBetter ? " better" : "");
        el.dataset.codusu = c.codusu;
        el.innerHTML = `
          <div>
            <h4>${c.nome}</h4>
            <div class="meta">
              <span class="chip">${c.codusu}</span>
              ${typeChip}
              ${slotBadge}
              <span class="badge">${pct}% livre no período</span>
            </div>
            <div class="muted" style="margin-top:6px">${(c.sub||"").trim() || "—"}</div>
          </div>
          <div class="right">
            <div class="kpi"><b>${c._v==="CLT" ? "Preferencial" : "Exceção"}</b><br/><span class="muted">regra PJ/CLT</span></div>
            <button class="secondary" style="width:auto; padding:8px 10px" type="button">Selecionar</button>
          </div>
        `;

        el.querySelector("button").addEventListener("click", () => selectSwapCandidate(c));
        el.addEventListener("click", (ev) => { if(ev.target.tagName !== "BUTTON") selectSwapCandidate(c); });
        box.appendChild(el);
      }
    }

    function selectSwapCandidate(c){
      swapCtx.selected = c;

      // Render selecionado
      const { dateISO, turno } = getSwapTargetSlot();
      $("#swapSelectedBox").innerHTML = renderPersonMini(c, swapCtx.reserva, false, dateISO, turno, swapCtx.reserva);
      const atual = consultoresBase.find(x => x.codusu===swapCtx.reserva?.codusu);
      updateCompareHighlight(atual, c);

      // Regras PJ/CLT
      const cltAvail = hasCltAvailabilityInPeriod();
      const isPJ = (c._v || (c.vinculo||"").toUpperCase()) === "PJ";
      swapCtx.needJust = isPJ && cltAvail;

      $("#swapJustBox").style.display = swapCtx.needJust ? "block" : "none";
      const b=$("#btnSwapConfirm"); if(b){ b.classList.remove("isDisabled"); delete b.dataset.disabled; }

      // Atualiza seleção visual
      renderSwapCandidates();
    }

    
    // Fallback robusto: confirma troca mesmo se o swapCtx.selected não tiver sido setado por algum motivo
    function forceConfirmSwap(){
      try{
        if(!swapCtx || !swapCtx.reserva){
          alert("Não há contexto de troca aberto.");
          return;
        }

        // Se não houver selecionado no contexto, tenta recuperar do DOM (.cand.selected)
        if(!swapCtx.selected){
          const sel = document.querySelector("#swapCandList .cand.selected");
          const cod = sel?.dataset?.codusu;
          if(cod){
            const cand = currentEligible.find(x => x.codusu === cod);
            if(cand){
              // preserva campos auxiliares se existirem
              swapCtx.selected = cand;
            }
          }
        }

        if(!swapCtx.selected){
          alert("Selecione um consultor na lista antes de confirmar a troca.");
          return;
        }

        confirmSwap();
      }catch(e){
        console.error(e);
        alert("Falha ao confirmar a troca. Verifique o console.");
      }
    }

function confirmSwap(){
      if(guardEdit()) return;
      try{
        console.log('confirmSwap called', swapCtx);
      const r = swapCtx.reserva;
      const c = swapCtx.selected;
      if(!r){ alert("Reserva inválida."); return; }
      if(!c){ alert("Selecione um consultor na lista antes de confirmar a troca."); return; }

      const { dateISO, turno } = getSwapTargetSlot();
      if(!dateISO || !turno){
        alert("Informe a data e o turno.");
        return;
      }

      if(c.codusu === r.codusu && dateISO === r.dataISO && turno === r.turno){
        alert("Nenhuma alteraÃ§Ã£o detectada (mesmo consultor, data e turno).");
        return;
      }

      // Valida slot livre (conflito)
      if(!isSlotFreeConsideringSwap(c.codusu, dateISO, turno, r)){
        alert("Conflito: este consultor já está ocupado nesse slot (data/turno).");
        return;
      }
    // Garantia: confirmSwap acessível globalmente
    window.confirmSwap = confirmSwap;

      // Valida elegibilidade (segurança)
      if(!currentEligible.some(x => x.codusu===c.codusu)){
        alert("Consultor não é elegível para os packs selecionados.");
        return;
      }

      // Justificativa quando PJ com CLT disponível
      let just = "";
      if(swapCtx.needJust){
        just = ($("#swapJustText").value || "").trim();
        if(!just){
          alert("Justificativa obrigatória para escolher Terceiro quando há CLT disponível no período.");
          return;
        }
      }

      const old = r.codusu;
      const oldDateISO = r.dataISO;
      const oldTurno = r.turno;
      const byId = Object.fromEntries(consultoresBase.map(c => [c.codusu, c]));
      const oldName = byId[old]?.nome || old;
      const newName = byId[c.codusu]?.nome || c.codusu;
      const idxReal = reservas.findIndex(x => x.fap===r.fap && x.codusu===r.codusu && x.dataISO===r.dataISO && x.turno===r.turno);
      if(idxReal >= 0){
        reservas[idxReal].codusu = c.codusu;
        reservas[idxReal].justPJ = swapCtx.needJust ? just : "";
        reservas[idxReal].dataISO = dateISO;
        reservas[idxReal].turno = turno;
      }
      scheduleSave();

      const turnoLabel = turno === "M" ? "ManhÃ£" : "Tarde";
      const oldTurnoLabel = oldTurno === "M" ? "ManhÃ£" : "Tarde";
      const actionLabel = (old === c.codusu) ? "Ajuste de data/turno" : "Troca de consultor";
      const packNomeLog = packs[r.packId]?.nome || r.packId || "â€”";
      const etapaLog = r.etapa ? ` â€¢ Etapa: ${r.etapa}` : "";
      const modLog = r.modalidade ? ` â€¢ ${r.modalidade}` : "";
      const slotLog = (oldDateISO === dateISO && oldTurno === turno)
        ? `${fmtBR(dateISO)} (${turnoLabel})`
        : `${fmtBR(oldDateISO)} (${oldTurnoLabel}) -> ${fmtBR(dateISO)} (${turnoLabel})`;
      logLeaderChange(actionLabel, `${oldName} -> ${newName} â€¢ Slot: ${slotLog} â€¢ Pack: ${packNomeLog}${etapaLog}${modLog}`);
      alert("AlteraÃ§Ã£o registrada (log registrado).");

      closeSwapModal();
      renderLeaderResList();
      renderAgenda();
      renderStepsP1();
      if(typeof renderP4ThirdPartyAlerts==='function'){ renderP4ThirdPartyAlerts(); }
      }catch(e){
        console.error(e);
        alert('Falha ao confirmar a troca. Verifique o console.');
      }
    }

    // Events do modal
    document.addEventListener("click", (e) => {
      const ry = e.target?.closest?.("#btnReprogramYes");
      if(ry){
        e.preventDefault();
        const fapVal = reprogramChoiceCtx.fap;
        const prev = reprogramChoiceCtx.prevFap;
        closeReprogramChoice(false);
        if(fapVal){
          openReprogramModal(fapVal, () => {
            applyFapSelection(fapVal);
            goto("p1");
            document.getElementById("fap")?.focus();
          }, prev);
        }
        return;
      }
      const rv = e.target?.closest?.("#btnReprogramView");
      if(rv){
        e.preventDefault();
        const fapVal = reprogramChoiceCtx.fap;
        closeReprogramChoice(false);
        if(fapVal){
          applyFapSelection(fapVal);
          goto("p3");
          applyEditLockUI();
        }
        return;
      }
      // Confirmar troca (delegado): funciona mesmo que o HTML do modal esteja após o <script>
const cbtn = e.target?.closest?.("#btnSwapConfirm");
if(cbtn){
  e.preventDefault();
  try{ confirmSwap(); }catch(err){ console.error(err); alert("Falha ao confirmar a troca. Verifique o console."); }
  return;
}
      const btn = e.target?.closest?.("#btnSwapClose, #btnSwapCancel");
      if(btn) closeSwapModal();
      // Fecha clicando fora do modal
      if(e.target?.id === "swapBackdrop") closeSwapModal();
      // Quick reasons
      const rr = e.target?.closest?.("[data-reason]");
      if(rr && $("#swapJustText")){
        const t = $("#swapJustText");
        const reason = rr.getAttribute("data-reason");
        t.value = (t.value ? (t.value.trim() + " • ") : "") + reason;
        t.focus();
      }

      const vbtn = e.target?.closest?.("#btnClientValidated");
      if(vbtn){
        e.preventDefault();
        handleClientValidated();
      }

      const rbtn = e.target?.closest?.("#btnReprogramClose, #btnReprogramCancel");
      if(rbtn) closeReprogramModal();
      if(e.target?.id === "reprogramBackdrop") closeReprogramModal();
      if(e.target?.id === "reprogramChoiceBackdrop") closeReprogramChoice();
      const rConfirm = e.target?.closest?.("#btnReprogramConfirm");
      if(rConfirm){
        const reason = document.getElementById("reprogramReason")?.value || "";
        const detail = (document.getElementById("reprogramDetail")?.value || "").trim();
        if(!reason){
          alert("Selecione o motivo da reprogramação.");
          return;
        }
        if(reason === "Outro" && !detail){
          alert("Descreva o motivo da reprogramação.");
          return;
        }
        const fap = reprogramCtx.fap || state.fap;
        reprogramReasonsByFap[fap] = { reason, detail, whenISO: nowISO() };
        scheduleSave();
        reprogramCtx.confirmed = true;
        closeReprogramModal();
        if(typeof reprogramCtx.onConfirm === "function"){
          reprogramCtx.onConfirm();
        }
        applyEditLockUI();
      }
    });

    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape" && swapCtx.open) closeSwapModal();
      if(e.key === "Escape" && reprogramCtx.open) closeReprogramModal();
      if(e.key === "Escape" && reprogramChoiceCtx.open) closeReprogramChoice();
    });

    ["swapSearch","swapVinculo","swapSort","swapOnlyFree"].forEach(id => {
      const el = document.getElementById(id);
      if(el){
        el.addEventListener("input", renderSwapCandidates);
        el.addEventListener("change", renderSwapCandidates);
      }
    });

    const reprogramReasonEl = document.getElementById("reprogramReason");
    if(reprogramReasonEl){
      reprogramReasonEl.addEventListener("change", () => {
        const wrap = document.getElementById("reprogramDetailWrap");
        if(wrap) wrap.style.display = (reprogramReasonEl.value === "Outro") ? "block" : "none";
      });
    }

    ["swapDate","swapTurno"].forEach(id => {
      const el = document.getElementById(id);
      if(el){
        el.addEventListener("input", () => {
          if(!swapCtx.reserva) return;
          swapCtx.dateISO = $("#swapDate").value || swapCtx.reserva.dataISO;
          swapCtx.turno = $("#swapTurno").value || swapCtx.reserva.turno;
          updateSwapSlotUI();
          renderSwapCandidates();
        });
        el.addEventListener("change", () => {
          if(!swapCtx.reserva) return;
          swapCtx.dateISO = $("#swapDate").value || swapCtx.reserva.dataISO;
          swapCtx.turno = $("#swapTurno").value || swapCtx.reserva.turno;
          updateSwapSlotUI();
          renderSwapCandidates();
        });
      }
    });

    // Delegação segura para inputs do modal (HTML pode estar após o script)
    document.addEventListener("input", (e) => {
      const id = e.target?.id;
      if(id !== "swapDate" && id !== "swapTurno") return;
      if(!swapCtx.reserva) return;
      swapCtx.dateISO = $("#swapDate").value || swapCtx.reserva.dataISO;
      swapCtx.turno = $("#swapTurno").value || swapCtx.reserva.turno;
      updateSwapSlotUI();
      renderSwapCandidates();
    });
    document.addEventListener("change", (e) => {
      const id = e.target?.id;
      if(id !== "swapDate" && id !== "swapTurno") return;
      if(!swapCtx.reserva) return;
      swapCtx.dateISO = $("#swapDate").value || swapCtx.reserva.dataISO;
      swapCtx.turno = $("#swapTurno").value || swapCtx.reserva.turno;
      updateSwapSlotUI();
      renderSwapCandidates();
    });

    const btnConfirm = document.getElementById("btnSwapConfirm");
    if(btnConfirm) btnConfirm.addEventListener("click", confirmSwap);


    // ===== Ação robusta: abrir modal de reserva para seleção múltipla =====
    function openSelectedModal(){
      if(guardEdit()) return;
      if(!selectedSlots || selectedSlots.length < 1){
        alert("Selecione pelo menos 1 período antes de reservar.");
        return;
      }
      const cod = selectedSlots[0].codusu;
      if(selectedSlots.some(s => s.codusu !== cod)){
        alert("Seleção múltipla permitida apenas para o mesmo consultor.");
        return;
      }
      const first = selectedSlots[0];
      const slots = selectedSlots.slice().sort((a,b)=>a.idx-b.idx);
      openModal({
        codusu: first.codusu,
        nome: first.nome,
        iso: first.iso,
        turno: first.turno,
        slots: slots
      });
    }
      // Disponível para onclick inline
      window.openSelectedModal = openSelectedModal;


      // Bind seguro do botão de multi-seleção
      document.addEventListener('DOMContentLoaded', () => {
        const b = document.getElementById('btnReserveSelected');
        if(b){
          b.addEventListener('click', (e)=>{ e.preventDefault(); openSelectedModal(); });
        }
      });


function ensureModalidadeUI(){
  const body = document.querySelector('#modalBack .modal .body');
  if(!body || body.querySelector('[name="modalidadeAgenda"]')) return;

  const div = document.createElement('div');
  div.className = 'form-group';
  div.innerHTML = `
    <label><strong>Modalidade da Agenda <span style="color:red">*</span></strong></label>
    <div class="modalidadeRow">
      <label class="modalidadeOption"><input type="radio" name="modalidadeAgenda" value="Remoto" checked> <span>Remoto</span></label>
      <label class="modalidadeOption"><input type="radio" name="modalidadeAgenda" value="Presencial"> <span>Presencial</span></label>
    </div>`;

  // Posição desejada: após o select de Etapa e ANTES dos botões de reserva
  const btnRow = body.querySelector('.btnRow');
  if(btnRow){
    body.insertBefore(div, btnRow);
    return;
  }

  // Fallback: abaixo do campo Etapa
  const etapaEl = document.getElementById('mEtapa');
  if(etapaEl && etapaEl.parentNode){
    etapaEl.parentNode.insertBefore(div, etapaEl.nextSibling);
    return;
  }

  // fallback final
  body.appendChild(div);
}
const _openModal = openModal;
openModal = function(ctx){
  _openModal(ctx);
  ensureModalidadeUI();
  const r = document.querySelector('input[name="modalidadeAgenda"][value="Remoto"]');
  if(r) r.checked = true;
}
function getModalidade(){
  const r = document.querySelector('input[name="modalidadeAgenda"]:checked');
  if(!r){ alert('⚠️ Selecione se a agenda é Remota ou Presencial.'); return null; }
  return r.value;
}
// patch reserve buttons
document.getElementById("btnReserveHalf")?.addEventListener("click", (e)=>{
  const m = getModalidade(); if(!m){ e.stopImmediatePropagation(); return; }
  modalCtx.modalidade = m;
});
document.getElementById("btnResumoPdf")?.addEventListener("click", () => {
  if(!canExportResumo()){ alert("O export só fica disponível após o aceite do Gerente de Projeto."); return; }
  exportResumoPDF();
});
document.getElementById("btnResumoCsv")?.addEventListener("click", () => {
  if(!canExportResumo()){ alert("O export só fica disponível após o aceite do Gerente de Projeto."); return; }
  exportResumoCSV();
});
document.getElementById("btnReserveDay")?.addEventListener("click", (e)=>{
  const m = getModalidade(); if(!m){ e.stopImmediatePropagation(); return; }
  modalCtx.modalidade = m;
});


(function(){
  const LS_KEY = "mvp_projects_v3";

  function getSlaDaysByOrigem(origem){
    const map = {
      "Projeto Novo": 30,
      "Projeto Segunda Fase": 10,
      "Demandas Base": 3,
      "Reprogramacao Agendas": 5
    };
    return map[origem] || 7;
  }

  function soldPacksCatalog(){
    return [
      { id: "5324", nome: "Atacado / Distribuidor - Pack 1" },
      { id: "5325", nome: "Atacado / Distribuidor - Pack 2 / MDFe" },
      { id: "5326", nome: "Atacado / Distribuidor - Pack 3 / CTe" },
      { id: "5309", nome: "Caixas e Bancos - Pack 1" },
      { id: "5283", nome: "Compras - Pack 1" },
      { id: "5285", nome: "Compras - Pack 3 / MD-e/DF-e" },
      { id: "5729", nome: "Compras - Pack 5 / Gestao de Verbas" },
      { id: "5354", nome: "Conciliacao Bancaria Automatica OFX - Pack 2.1" },
      { id: "5310", nome: "Conciliacao Cartoes de Credito/Debito - Pack 2" },
      { id: "5336", nome: "Controle de Veiculos - Pack 2" },
      { id: "5388", nome: "Dashboard (Editor de Dashboard) - Pack 4" },
      { id: "5292", nome: "Estocagem - Pack 1" },
      { id: "5316", nome: "Fiscal - Pack 1 / Livro e SPED Fiscal" },
      { id: "5317", nome: "Fiscal - Pack 2 / SPED Constribuicoes" },
      { id: "5318", nome: "Fiscal - Pack 3 / EFD Reinf" },
      { id: "5313", nome: "Gerenciais - Pack 1" },
      { id: "5312", nome: "Gerenciais - Pack 2" },
      { id: "5295", nome: "Metas Simplificadas - Pack 2" },
      { id: "5930", nome: "Pack 1 - Consulta e monitoramento de regra tributaria" },
      { id: "5302", nome: "Pagamentos - Pack 1" },
      { id: "5352", nome: "Pagamentos - Pack 2 / Centro de Resultado" },
      { id: "5391", nome: "Plataforma de Personalizacao - Pack 1" },
      { id: "5291", nome: "Precificacao - Pack 1" },
      { id: "5304", nome: "Recebimentos - Pack 1" },
      { id: "5294", nome: "Vendas - Pack 1" },
      { id: "5297", nome: "Vendas - Pack 4 / NFSe" }
    ];
  }

  function mkTask(id, wbsCode, parentId, nome, durationDays, tipo, effort){
    return {
      id,
      wbsCode,
      parentId,
      nome,
      durationDays,
      tipo,
      effort: effort == null ? undefined : effort,
      start: "",
      finish: "",
      earlyStart: "",
      earlyFinish: "",
      lateStart: "",
      lateFinish: "",
      float: 0,
      isCritical: false,
      baselineStart: "",
      baselineFinish: ""
    };
  }

  function defaultEntrada(){
    return {
      projectCode: "",
      cliente: "",
      origem: "Projeto Novo",
      tipoRecurso: "Homologados",
      perfilPapel: "Consultor ERP",
      perfilProficiencia: "Executor",
      modalidadeProjeto: "Remoto",
      permissaoAtendimento: {
        diasSemana: {
          seg: { manha: true, tarde: true },
          ter: { manha: true, tarde: true },
          qua: { manha: true, tarde: true },
          qui: { manha: true, tarde: true },
          sex: { manha: true, tarde: true }
        }
      },
      esforcoSlots: "",
      dtInicio: "",
      dtFim: "",
      slaDias: getSlaDaysByOrigem("Projeto Novo"),
      packs: soldPacksCatalog().map((p)=> ({ id: p.id, nome: p.nome, selected: false }))
    };
  }

  function defaultCronograma(){
    return {
      calendar: { workingDays: [1,2,3,4,5], holidays: [] },
      tasks: [
        mkTask("t1", "1", null, "Kickoff", 1, "tarefa", 1),
        mkTask("t2", "1.1", "t1", "Levantamento", 2, "tarefa", 2),
        mkTask("t3", "1.2", "t1", "Parametrizacao", 3, "tarefa", 3),
        mkTask("t4", "1.3", "t1", "Treinamento", 2, "tarefa", 2),
        mkTask("m1", "2", null, "Go-Live", 0, "marco", null)
      ],
      dependencies: [
        { predecessorId: "t1", successorId: "t2", type: "FS", lag: 0 },
        { predecessorId: "t2", successorId: "t3", type: "FS", lag: 0 },
        { predecessorId: "t3", successorId: "t4", type: "FS", lag: 0 },
        { predecessorId: "t4", successorId: "m1", type: "FS", lag: 0 }
      ],
      baseline: { capturedAt: null }
    };
  }

  function load(){
    try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch(e){ return null; }
  }

  const state = load() || {
    entrada: defaultEntrada(),
    consultores: seedConsultores(),
    reservas: [],
    cronograma: defaultCronograma()
  };

  let selected = { consultorId: null, slotIds: [] };
  let lastClickedIndex = null;
  const packUi = { open: false };
  const msUi = {
    selectedTaskId: null,
    collapsed: new Set(),
    compareBaseline: false
  };

  function el(id){ return document.getElementById(id); }
  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  function uuid(){ return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16); }

  function normalizeTipoRecursoLabel(tipo){
    if(tipo === "Terceiro") return "Homologados";
    if(tipo === "CLT") return "Recurso Sankhya";
    if(tipo === "Terceiro + CLT") return "Homologados + Recurso Sankhya";
    return tipo;
  }

  function normalizeProficienciaLabel(label){
    if(label === "Pleno") return "Autônomo";
    if(label === "Senior") return "Proficiente";
    if(label === "Especialista") return "Referência";
    if(label === "Autonomo") return "Autônomo";
    if(label === "Referencia") return "Referência";
    return label || "Executor";
  }

  function normalizeCronograma(cr){
    const d = defaultCronograma();
    cr.calendar = cr.calendar || d.calendar;
    cr.calendar.workingDays = Array.isArray(cr.calendar.workingDays) ? cr.calendar.workingDays : d.calendar.workingDays;
    cr.calendar.holidays = Array.isArray(cr.calendar.holidays) ? cr.calendar.holidays : [];
    cr.tasks = Array.isArray(cr.tasks) ? cr.tasks : d.tasks;
    cr.dependencies = Array.isArray(cr.dependencies) ? cr.dependencies : d.dependencies;
    cr.baseline = cr.baseline || { capturedAt: null };
    cr.tasks = cr.tasks.map((t)=> ({
      id: String(t.id || uuid()),
      wbsCode: String(t.wbsCode || ""),
      parentId: t.parentId == null || t.parentId === "" ? null : String(t.parentId),
      nome: String(t.nome || "Sem nome"),
      durationDays: Number.isFinite(Number(t.durationDays)) ? Number(t.durationDays) : 1,
      tipo: t.tipo === "marco" ? "marco" : "tarefa",
      effort: t.effort == null || t.effort === "" ? undefined : Number(t.effort),
      sourceFlow: String(t.sourceFlow || ""),
      packId: String(t.packId || ""),
      reservaId: String(t.reservaId || ""),
      etapa: String(t.etapa || ""),
      fixedDates: Boolean(t.fixedDates),
      start: String(t.start || ""),
      finish: String(t.finish || ""),
      earlyStart: String(t.earlyStart || ""),
      earlyFinish: String(t.earlyFinish || ""),
      lateStart: String(t.lateStart || ""),
      lateFinish: String(t.lateFinish || ""),
      float: Number(t.float || 0),
      isCritical: Boolean(t.isCritical),
      baselineStart: String(t.baselineStart || ""),
      baselineFinish: String(t.baselineFinish || "")
    }));
    cr.dependencies = cr.dependencies
      .filter((d0)=>d0 && d0.predecessorId && d0.successorId)
      .map((d0)=> ({
        predecessorId: String(d0.predecessorId),
        successorId: String(d0.successorId),
        type: ["FS","SS","FF","SF"].includes(d0.type) ? d0.type : "FS",
        lag: Number.isFinite(Number(d0.lag)) ? Number(d0.lag) : 0,
        sourceFlow: String(d0.sourceFlow || "")
      }));
  }

  function normalizeState(){
    const d = defaultEntrada();
    if(!state.entrada) state.entrada = d;
    if(!state.entrada.projectCode && state.entrada.fap) state.entrada.projectCode = state.entrada.fap;
    if(state.entrada.origem === "Venda" || state.entrada.origem === "Vendas") state.entrada.origem = "Projeto Novo";
    if(state.entrada.origem === "Base") state.entrada.origem = "Projeto Segunda Fase";
    if(state.entrada.origem === "Reprogramacao") state.entrada.origem = "Reprogramacao Agendas";
    if(state.entrada.origem === "Avulsa" || state.entrada.origem === "Avulso") state.entrada.origem = "Demandas Base";
    state.entrada.tipoRecurso = normalizeTipoRecursoLabel(state.entrada.tipoRecurso || d.tipoRecurso);
    state.entrada.projectCode = state.entrada.projectCode || d.projectCode;
    state.entrada.cliente = state.entrada.cliente || d.cliente;
    state.entrada.origem = state.entrada.origem || d.origem;
    state.entrada.tipoRecurso = state.entrada.tipoRecurso || d.tipoRecurso;
    state.entrada.perfilPapel = state.entrada.perfilPapel || d.perfilPapel;
    if(!state.entrada.perfilProficiencia && state.entrada.perfilSenioridade){
      state.entrada.perfilProficiencia = state.entrada.perfilSenioridade;
    }
    state.entrada.perfilProficiencia = normalizeProficienciaLabel(state.entrada.perfilProficiencia || d.perfilProficiencia);
    state.entrada.modalidadeProjeto = state.entrada.modalidadeProjeto || d.modalidadeProjeto;
    if(!state.entrada.permissaoAtendimento){
      state.entrada.permissaoAtendimento = d.permissaoAtendimento;
    } else {
      const pa = state.entrada.permissaoAtendimento;
      pa.diasSemana = pa.diasSemana || {};
      // Backward compat: old format had booleans per day + global periodos
      const oldPeriodos = pa.periodos || { manha: true, tarde: true };
      ["seg","ter","qua","qui","sex"].forEach((k)=> {
        const cur = pa.diasSemana[k];
        if(typeof cur === "boolean"){
          pa.diasSemana[k] = {
            manha: cur ? (oldPeriodos.manha !== false) : false,
            tarde: cur ? (oldPeriodos.tarde !== false) : false
          };
        } else {
          pa.diasSemana[k] = pa.diasSemana[k] || {};
          pa.diasSemana[k].manha = pa.diasSemana[k].manha !== false;
          pa.diasSemana[k].tarde = pa.diasSemana[k].tarde !== false;
        }
      });
      delete pa.periodos;
    }
    state.entrada.esforcoSlots = String(state.entrada.esforcoSlots || d.esforcoSlots);
    state.entrada.dtInicio = state.entrada.dtInicio || d.dtInicio;
    state.entrada.dtFim = state.entrada.dtFim || d.dtFim;
    state.entrada.slaDias = Number(state.entrada.slaDias || getSlaDaysByOrigem(state.entrada.origem));
    state.entrada.packs = Array.isArray(state.entrada.packs) ? state.entrada.packs : d.packs;
    // Reconcile with official sold packs catalog and preserve previous selection by ID.
    const selectedById = new Map((state.entrada.packs || []).map((p)=> [String(p.id), Boolean(p.selected)]));
    state.entrada.packs = soldPacksCatalog().map((p)=> ({
      id: p.id,
      nome: p.nome,
      selected: selectedById.get(String(p.id)) || false
    }));

    if(!Array.isArray(state.consultores) || state.consultores.length === 0){
      state.consultores = seedConsultores();
    } else {
      state.consultores.forEach((c)=> {
        c.tipo = normalizeTipoRecursoLabel(c.tipo || "");
        c.proficiencia = normalizeProficienciaLabel(c.proficiencia || c.senioridade || "Executor");
        c.papel = c.papel || "Consultor ERP";
        c.modalidades = Array.isArray(c.modalidades) && c.modalidades.length ? c.modalidades : ["Remoto"];
      });
    }
    if(!Array.isArray(state.reservas)) state.reservas = [];
    if(!state.cronograma) state.cronograma = defaultCronograma();
    normalizeCronograma(state.cronograma);
  }

  function etapaRank(etapa){
    const ordem = ["Kickoff","Levantamento","Parametrizacao","Treinamento","Testes","Go-Live","Base"];
    const i = ordem.indexOf(etapa);
    return i >= 0 ? i : 999;
  }

  function syncCronogramaFromFluxo(){
    const cr = state.cronograma;
    normalizeCronograma(cr);
    const selectedPackList = selectedPacks();
    const selectedPackIds = new Set(selectedPackList.map((p)=>p.id));
    const packById = new Map(selectedPackList.map((p)=>[p.id, p]));
    const reservasById = new Map(state.reservas.map((r)=>[r.id, r]));

    // Remove tasks that came from flow and no longer exist in selected packs/reservas
    cr.tasks = cr.tasks.filter((t)=> {
      if(t.sourceFlow === "pack_summary") return selectedPackIds.has(t.packId);
      if(t.sourceFlow === "reserva_task") return reservasById.has(t.reservaId) && selectedPackIds.has(t.packId);
      return true;
    });
    const taskById = new Map(cr.tasks.map((t)=>[t.id, t]));

    // Ensure one summary task per selected pack
    selectedPackList.forEach((p)=> {
      const id = `pack_${p.id}`;
      let t = taskById.get(id);
      if(!t){
        t = {
          id,
          wbsCode: "",
          parentId: null,
          nome: `Pack: ${p.nome}`,
          durationDays: 1,
          tipo: "tarefa",
          effort: undefined,
          sourceFlow: "pack_summary",
          packId: p.id,
          reservaId: "",
          etapa: "",
          fixedDates: false,
          start: "",
          finish: "",
          earlyStart: "",
          earlyFinish: "",
          lateStart: "",
          lateFinish: "",
          float: 0,
          isCritical: false,
          baselineStart: "",
          baselineFinish: ""
        };
        cr.tasks.push(t);
        taskById.set(id, t);
      } else {
        t.nome = `Pack: ${p.nome}`;
        t.packId = p.id;
        t.sourceFlow = "pack_summary";
        t.parentId = null;
      }
    });

    // Ensure one child task per confirmed reservation
    state.reservas.forEach((r)=> {
      if(!selectedPackIds.has(r.packId)) return;
      const id = `res_${r.id}`;
      const parentId = `pack_${r.packId}`;
      const dur = (r.periodo === "Manha" || r.periodo === "Tarde") ? 0.5 : 1;
      let t = taskById.get(id);
      if(!t){
        t = {
          id,
          wbsCode: "",
          parentId,
          nome: `${r.consultorNome} - ${r.periodo}`,
          durationDays: dur,
          tipo: "tarefa",
          effort: dur,
          sourceFlow: "reserva_task",
          packId: r.packId,
          reservaId: r.id,
          etapa: r.etapa || "",
          fixedDates: Boolean(r.inicio),
          start: r.inicio || "",
          finish: (r.fim || r.inicio || ""),
          earlyStart: "",
          earlyFinish: "",
          lateStart: "",
          lateFinish: "",
          float: 0,
          isCritical: false,
          baselineStart: "",
          baselineFinish: ""
        };
        cr.tasks.push(t);
      } else {
        t.parentId = parentId;
        t.nome = `${r.consultorNome} - ${r.periodo}`;
        t.durationDays = dur;
        t.effort = dur;
        t.packId = r.packId;
        t.reservaId = r.id;
        t.etapa = r.etapa || "";
        if(r.inicio){
          t.fixedDates = true;
          t.start = r.inicio;
          t.finish = r.fim || r.inicio;
        }
      }
    });

    // Rebuild automatic stage dependencies, keep manual dependencies intact
    cr.dependencies = cr.dependencies.filter((d)=> d.sourceFlow !== "etapa_auto");
    selectedPackList.forEach((p)=> {
      const tasksPack = cr.tasks
        .filter((t)=>t.sourceFlow === "reserva_task" && t.packId === p.id)
        .slice()
        .sort((a,b)=> {
          const ea = etapaRank(a.etapa);
          const eb = etapaRank(b.etapa);
          if(ea !== eb) return ea - eb;
          return String(a.start || "").localeCompare(String(b.start || ""));
        });
      if(tasksPack.length < 2) return;
      let prev = tasksPack[0];
      for(let i=1;i<tasksPack.length;i++){
        const cur = tasksPack[i];
        if(etapaRank(cur.etapa) > etapaRank(prev.etapa)){
          cr.dependencies.push({
            predecessorId: prev.id,
            successorId: cur.id,
            type: "FS",
            lag: 0,
            sourceFlow: "etapa_auto"
          });
        }
        prev = cur;
      }
    });

    renumberWbs();
  }

  function formatDateBR(iso){
    if(!iso) return "-";
    const [y,m,d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function toDateAtNoon(iso){
    const [y,m,d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }

  function toIso(d){
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }

  function addDaysISO(iso, days){
    if(!iso) return "";
    const d = toDateAtNoon(iso);
    d.setDate(d.getDate() + days);
    return toIso(d);
  }

  function dateDiffDaysInclusive(startIso, endIso){
    if(!startIso || !endIso) return 0;
    const s = toDateAtNoon(startIso);
    const e = toDateAtNoon(endIso);
    return Math.floor((e - s) / (24 * 60 * 60 * 1000)) + 1;
  }

  function maxIso(a,b){ if(!a) return b; if(!b) return a; return a >= b ? a : b; }
  function minIso(a,b){ if(!a) return b; if(!b) return a; return a <= b ? a : b; }

  function isBusinessDay(iso){
    const c = state.cronograma.calendar;
    const d = toDateAtNoon(iso);
    const day = d.getDay();
    if(!c.workingDays.includes(day)) return false;
    if(c.holidays.includes(iso)) return false;
    return true;
  }

  function nextBusinessDay(iso){
    if(!iso) return "";
    let cur = iso;
    let guard = 0;
    while(!isBusinessDay(cur) && guard < 600){ cur = addDaysISO(cur, 1); guard++; }
    return cur;
  }

  function shiftBusinessDays(iso, delta){
    if(!iso) return "";
    if(delta === 0) return nextBusinessDay(iso);
    const step = delta > 0 ? 1 : -1;
    let remaining = Math.abs(delta);
    let cur = iso;
    while(remaining > 0){
      cur = addDaysISO(cur, step);
      if(isBusinessDay(cur)) remaining--;
    }
    return nextBusinessDay(cur);
  }

  function getTaskDuration(task){
    const d = Number(task.durationDays);
    if(task.tipo === "marco") return 0;
    if(!Number.isFinite(d)) return 1;
    return Math.max(0.5, d);
  }

  function finishFromStart(task, startIso){
    if(!startIso) return "";
    const dur = getTaskDuration(task);
    if(dur <= 1) return nextBusinessDay(startIso);
    return shiftBusinessDays(nextBusinessDay(startIso), dur - 1);
  }

  function startFromFinish(task, finishIso){
    if(!finishIso) return "";
    const dur = getTaskDuration(task);
    if(dur <= 1) return nextBusinessDay(finishIso);
    return shiftBusinessDays(nextBusinessDay(finishIso), -(dur - 1));
  }

  function businessDistance(startIso, endIso){
    if(!startIso || !endIso) return 0;
    if(startIso === endIso) return 0;
    let cur = startIso;
    let cnt = 0;
    const step = startIso < endIso ? 1 : -1;
    let guard = 0;
    while(cur !== endIso && guard < 2000){
      cur = addDaysISO(cur, step);
      if(isBusinessDay(cur)) cnt += step;
      guard++;
    }
    return cnt;
  }

  function topologicalOrder(tasks, deps){
    const byId = new Map(tasks.map((t)=>[t.id, t]));
    const indeg = new Map(tasks.map((t)=>[t.id, 0]));
    const out = new Map(tasks.map((t)=>[t.id, []]));
    deps.forEach((d)=> {
      if(!byId.has(d.predecessorId) || !byId.has(d.successorId)) return;
      indeg.set(d.successorId, (indeg.get(d.successorId) || 0) + 1);
      out.get(d.predecessorId).push(d.successorId);
    });
    const q = [];
    tasks.forEach((t)=> { if((indeg.get(t.id) || 0) === 0) q.push(t.id); });
    const res = [];
    while(q.length){
      const id = q.shift();
      res.push(id);
      out.get(id).forEach((to)=> {
        indeg.set(to, indeg.get(to) - 1);
        if(indeg.get(to) === 0) q.push(to);
      });
    }
    const hasCycle = res.length !== tasks.length;
    return { order: hasCycle ? [] : res, hasCycle };
  }

  function validateDependencies(tasks, deps){
    const errors = [];
    const byId = new Set(tasks.map((t)=>t.id));
    const seen = new Set();
    deps.forEach((d, idx)=> {
      if(!byId.has(d.predecessorId)) errors.push(`Dependencia ${idx + 1}: predecessorId inexistente (${d.predecessorId}).`);
      if(!byId.has(d.successorId)) errors.push(`Dependencia ${idx + 1}: successorId inexistente (${d.successorId}).`);
      if(d.predecessorId === d.successorId) errors.push(`Dependencia ${idx + 1}: ciclo direto em ${d.predecessorId}.`);
      const key = `${d.predecessorId}|${d.successorId}|${d.type}|${d.lag}`;
      if(seen.has(key)) errors.push(`Dependencia ${idx + 1}: duplicada (${key}).`);
      seen.add(key);
    });
    const topo = topologicalOrder(tasks, deps);
    if(topo.hasCycle) errors.push("Dependencias invalidas: ciclo detectado no grafo.");
    return { valid: errors.length === 0, errors, order: topo.order };
  }

  function recalcCronograma(){
    const cr = state.cronograma;
    normalizeCronograma(cr);
    const tasks = cr.tasks;
    const deps = cr.dependencies;
    const validation = validateDependencies(tasks, deps);
    if(!validation.valid){
      tasks.forEach((t)=> {
        t.earlyStart = "";
        t.earlyFinish = "";
        t.lateStart = "";
        t.lateFinish = "";
        t.float = 0;
        t.isCritical = false;
      });
      return { ok: false, errors: validation.errors };
    }
    const byId = new Map(tasks.map((t)=>[t.id, t]));
    const depBySucc = new Map(tasks.map((t)=>[t.id, []]));
    const depByPred = new Map(tasks.map((t)=>[t.id, []]));
    deps.forEach((d)=> {
      if(!byId.has(d.predecessorId) || !byId.has(d.successorId)) return;
      depBySucc.get(d.successorId).push(d);
      depByPred.get(d.predecessorId).push(d);
    });

    const order = validation.order;
    const projectStartRaw = state.entrada.dtInicio || toIso(new Date());
    const projectStart = nextBusinessDay(projectStartRaw);

    order.forEach((taskId)=> {
      const t = byId.get(taskId);
      if(t.fixedDates && t.start){
        t.earlyStart = nextBusinessDay(t.start);
        t.earlyFinish = t.finish ? nextBusinessDay(t.finish) : finishFromStart(t, t.earlyStart);
        t.start = t.earlyStart;
        t.finish = t.earlyFinish;
        return;
      }
      let est = nextBusinessDay(t.start || projectStart);
      const incoming = depBySucc.get(taskId) || [];
      incoming.forEach((dep)=> {
        const pred = byId.get(dep.predecessorId);
        if(!pred) return;
        const lag = Number(dep.lag || 0);
        let cand = est;
        if(dep.type === "FS") cand = shiftBusinessDays(pred.earlyFinish, lag);
        else if(dep.type === "SS") cand = shiftBusinessDays(pred.earlyStart, lag);
        else if(dep.type === "FF") cand = startFromFinish(t, shiftBusinessDays(pred.earlyFinish, lag));
        else if(dep.type === "SF") cand = startFromFinish(t, shiftBusinessDays(pred.earlyStart, lag));
        est = maxIso(est, cand);
      });
      t.earlyStart = nextBusinessDay(est);
      t.earlyFinish = finishFromStart(t, t.earlyStart);
      t.start = t.earlyStart;
      t.finish = t.earlyFinish;
    });

    let projectFinish = projectStart;
    tasks.forEach((t)=> { projectFinish = maxIso(projectFinish, t.earlyFinish); });

    order.slice().reverse().forEach((taskId)=> {
      const t = byId.get(taskId);
      const outgoing = depByPred.get(taskId) || [];
      if(outgoing.length === 0){
        t.lateFinish = projectFinish;
        t.lateStart = startFromFinish(t, t.lateFinish);
      } else {
        let lateStartLimit = "";
        outgoing.forEach((dep)=> {
          const succ = byId.get(dep.successorId);
          if(!succ) return;
          const lag = Number(dep.lag || 0);
          let allowedStart = "";
          if(dep.type === "FS") allowedStart = startFromFinish(t, shiftBusinessDays(succ.lateStart, -lag));
          else if(dep.type === "SS") allowedStart = shiftBusinessDays(succ.lateStart, -lag);
          else if(dep.type === "FF") allowedStart = startFromFinish(t, shiftBusinessDays(succ.lateFinish, -lag));
          else if(dep.type === "SF") allowedStart = shiftBusinessDays(succ.lateFinish, -lag);
          lateStartLimit = lateStartLimit ? minIso(lateStartLimit, allowedStart) : allowedStart;
        });
        t.lateStart = lateStartLimit || t.earlyStart;
        t.lateFinish = finishFromStart(t, t.lateStart);
      }
      t.float = businessDistance(t.earlyStart, t.lateStart);
      t.isCritical = t.float === 0;
    });

    if(!state.entrada.dtFim && projectFinish) state.entrada.dtFim = projectFinish;
    return { ok: true, errors: [] };
  }

  function setBaselineSnapshot(){
    recalcCronograma();
    state.cronograma.tasks.forEach((t)=> {
      t.baselineStart = t.start || "";
      t.baselineFinish = t.finish || "";
    });
    state.cronograma.baseline.capturedAt = new Date().toISOString();
  }

  function toast(title, msg){
    const t = el("toast");
    el("toastTitle").textContent = title;
    el("toastMsg").textContent = msg;
    t.style.display = "block";
    clearTimeout(toast._tm);
    toast._tm = setTimeout(()=> t.style.display = "none", 3200);
  }

  function nextDaysISO(n){
    const out = [];
    const now = new Date();
    for(let i=0;i<n;i++){
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      out.push(toIso(d));
    }
    return out;
  }

  function seedConsultores(){
    const baseDates = nextDaysISO(12);
    const mkSlots = (consultorId) => {
      const slots = [];
      baseDates.forEach((dt, i)=> {
        ["Manha","Tarde"].forEach((per)=> {
          const id = `${consultorId}_${dt}_${per}`;
          const reserved = (i % 5 === 0 && per === "Tarde") || (i % 7 === 0 && per === "Manha");
          slots.push({ id, date: dt, periodo: per, state: reserved ? "R" : "L" });
        });
      });
      return slots;
    };
    return [
      { id:"c1", nome:"Renata Alves", proficiencia:"Proficiente", tipo:"Recurso Sankhya", parceiro:"Sankhya", papel:"Consultor ERP", modalidades:["Remoto","Presencial"], slots:mkSlots("c1") },
      { id:"c2", nome:"Kassius Lima", proficiencia:"Autônomo", tipo:"Homologados", parceiro:"Parceiro Alfa", papel:"Instrutor", modalidades:["Remoto"], slots:mkSlots("c2") },
      { id:"c3", nome:"Andreia Souza", proficiencia:"Proficiente", tipo:"Homologados + Recurso Sankhya", parceiro:"Sankhya", papel:"Especialista Fiscal", modalidades:["Remoto","Presencial"], slots:mkSlots("c3") },
      { id:"c4", nome:"Leonardo Tega", proficiencia:"Referência", tipo:"Recurso Sankhya", parceiro:"Sankhya", papel:"Arquiteto de Solucao", modalidades:["Presencial"], slots:mkSlots("c4") },
      { id:"c5", nome:"Isabel Vieira", proficiencia:"Autônomo", tipo:"Homologados", parceiro:"Parceiro Beta", papel:"Consultor ERP", modalidades:["Remoto","Presencial"], slots:mkSlots("c5") }
    ];
  }

  function selectedPacks(){ return state.entrada.packs.filter((p)=>p.selected); }
  function proficiencyRank(label){
    return ({ "Executor":1, "Autônomo":2, "Proficiente":3, "Referência":4 })[normalizeProficienciaLabel(label)] || 0;
  }
  function matchesTipoRecurso(c){
    const req = state.entrada.tipoRecurso;
    if(req === "Recurso Sankhya") return c.tipo.includes("Recurso Sankhya");
    if(req === "Homologados") return c.tipo.includes("Homologados");
    return true;
  }
  function matchesProficiencia(c){ return proficiencyRank(c.proficiencia) >= proficiencyRank(state.entrada.perfilProficiencia); }
  function matchesPapel(c){ return c.papel === state.entrada.perfilPapel; }
  function matchesModalidade(c){ return c.modalidades.includes(state.entrada.modalidadeProjeto); }
  function isInPrazo(dateIso){
    const ini = state.entrada.dtInicio;
    const fim = state.entrada.dtFim;
    if(!ini || !fim) return true;
    return dateIso >= ini && dateIso <= fim;
  }

  function weekdayKeyFromIso(iso){
    const d = toDateAtNoon(iso);
    const day = d.getDay();
    if(day === 1) return "seg";
    if(day === 2) return "ter";
    if(day === 3) return "qua";
    if(day === 4) return "qui";
    if(day === 5) return "sex";
    return "";
  }

  function slotAllowedByPermissao(slot){
    const pa = state.entrada.permissaoAtendimento;
    if(!pa) return true;
    const wk = weekdayKeyFromIso(slot.date);
    if(!wk || !pa.diasSemana[wk]) return false;
    const p = (slot.periodo || "").toLowerCase();
    if(p === "manha") return Boolean(pa.diasSemana[wk].manha);
    if(p === "tarde") return Boolean(pa.diasSemana[wk].tarde);
    return true;
  }

  function summarizePermissao(){
    const pa = state.entrada.permissaoAtendimento;
    if(!pa) return "-";
    const out = [];
    const lbl = { seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex" };
    ["seg","ter","qua","qui","sex"].forEach((k)=> {
      const d = pa.diasSemana[k];
      const per = [];
      if(d && d.manha) per.push("Manha");
      if(d && d.tarde) per.push("Tarde");
      if(per.length) out.push(`${lbl[k]}: ${per.join("/")}`);
    });
    return out.join(" • ") || "-";
  }
  function eligibleConsultores(){ return state.consultores.filter((c)=>matchesTipoRecurso(c) && matchesProficiencia(c) && matchesPapel(c) && matchesModalidade(c)); }

  function analyzeCapacity(){
    const elegiveis = eligibleConsultores();
    let livresNoPrazo = 0;
    elegiveis.forEach((c)=> { livresNoPrazo += c.slots.filter((s)=> s.state === "L" && isInPrazo(s.date)).length; });
    const effort = Number(state.entrada.esforcoSlots || 0);
    const gap = Math.max(0, effort - livresNoPrazo);
    const cobertura = effort > 0 ? Math.round((livresNoPrazo / effort) * 100) : 0;
    const slaLimite = state.entrada.dtInicio ? addDaysISO(state.entrada.dtInicio, Math.max(0, Number(state.entrada.slaDias) - 1)) : "";
    const prazoDentroSla = (!state.entrada.dtFim || !slaLimite) ? true : state.entrada.dtFim <= slaLimite;
    const prazoDias = (state.entrada.dtInicio && state.entrada.dtFim) ? Math.max(0, dateDiffDaysInclusive(state.entrada.dtInicio, state.entrada.dtFim)) : 0;
    const slaDias = Number(state.entrada.slaDias || 0);
    const percentualSla = (slaDias > 0 && prazoDias > 0) ? Math.round((prazoDias / slaDias) * 100) : 0;
    const saldoDias = (prazoDias > 0 && slaDias > 0) ? (slaDias - prazoDias) : 0;
    let slaStatus = "Indefinido";
    if(slaDias > 0 && prazoDias > 0){
      if(percentualSla > 100) slaStatus = "Atraso";
      else if(percentualSla > 85) slaStatus = "No limite";
      else slaStatus = "No prazo";
    }
    let risco = "Indefinido";
    if(effort > 0 && state.entrada.dtInicio && state.entrada.dtFim){
      if(!prazoDentroSla || gap > 0) risco = "Alto";
      else if(cobertura < 120) risco = "Medio";
      else risco = "Baixo";
    }
    return { elegiveis, elegiveisCount:elegiveis.length, livresNoPrazo, effort, gap, cobertura, slaLimite, prazoDentroSla, risco, prazoDias, percentualSla, saldoDias, slaStatus };
  }

  function riskPillClass(r){ if(r === "Alto") return "pill red"; if(r === "Medio") return "pill orange"; if(r === "Baixo") return "pill green"; return "pill"; }
  function slaPillClass(s){ if(s === "Atraso") return "pill red"; if(s === "No limite") return "pill orange"; if(s === "No prazo") return "pill green"; return "pill"; }
  function resetSelection(){ selected.consultorId = null; selected.slotIds = []; lastClickedIndex = null; }
  function currentConsultor(){ return state.consultores.find((c)=>c.id === selected.consultorId) || null; }
  function setReserveBar(){
    const count = selected.slotIds.length;
    el("selCount").textContent = `${count} slot(s) selecionado(s)`;
    el("btnReservarSel").disabled = (count === 0);
  }

  function renderPacks(){
    const wrap = el("packChips");
    const adminList = el("packAdminList");
    const toggleBtn = el("btnSelectAllPacks");
    wrap.innerHTML = "";
    if(adminList) adminList.style.display = "none";
    if(toggleBtn){
      toggleBtn.textContent = packUi.open ? "Fechar lista de packs vendidos" : "Selecionar todos os packs vendidos";
    }
    if(!packUi.open){
      wrap.innerHTML = `<div class="empty" style="padding:10px 12px"><b>Lista fechada</b><div style="margin-top:6px">Clique no botão acima para abrir os packs vendidos.</div></div>`;
      return;
    }
    if(state.entrada.packs.length === 0){
      wrap.innerHTML = `<div class="empty" style="padding:10px 12px"><b>Nenhum pack cadastrado</b><div style="margin-top:6px">Cadastre packs abaixo para usar no fluxo.</div></div>`;
    }
    state.entrada.packs.forEach((p, idx)=> {
      const row = document.createElement("label");
      row.className = "packRow";
      row.title = p.id;
      row.innerHTML = `
        <input type="checkbox" ${p.selected ? "checked" : ""} />
        <span>${escapeHtml(p.nome)}</span>
        <span class="packId">${escapeHtml(p.id)}</span>
      `;
      const check = row.querySelector('input[type="checkbox"]');
      check.addEventListener("change", ()=> {
        state.entrada.packs[idx].selected = check.checked;
        syncCronogramaFromFluxo();
        recalcCronograma();
        save();
        renderPacks();
        renderProjetoKVs();
      });
      wrap.appendChild(row);
    });
  }

  function toggleListaPacksVendidos(){
    packUi.open = !packUi.open;
    renderPacks();
    if(packUi.open && !state.entrada.packs.length){
      toast("Packs", "Nao ha packs cadastrados para listar.");
    }
  }

  function renderProjetoKVs(){
    const kvs = el("kvsProjeto");
    const a = analyzeCapacity();
    recalcCronograma();
    const tasks = state.cronograma.tasks;
    const crit = tasks.filter((t)=>t.isCritical).length;
    kvs.innerHTML = "";
    [
      ["Numero FAP", state.entrada.projectCode || "-"],
      ["Cliente", state.entrada.cliente || "-"],
      ["Origem", state.entrada.origem || "-"],
      ["Duracao Projeto em Dias", String(state.entrada.slaDias || "-")],
      ["Tipo de Recurso", state.entrada.tipoRecurso || "-"],
      ["Perfil", `${state.entrada.perfilPapel} / ${state.entrada.perfilProficiencia}`],
      ["Modalidade", state.entrada.modalidadeProjeto || "-"],
      ["Permissao Atendimento", summarizePermissao()],
      ["Prazo", `${formatDateBR(state.entrada.dtInicio)} ate ${formatDateBR(state.entrada.dtFim)}`],
      ["Esforco estimado", `${state.entrada.esforcoSlots || "0"} slot(s)`],
      ["Packs selecionados", selectedPacks().map((p)=>p.nome).join(", ") || "-"],
      ["Capacidade livre no prazo", `${a.livresNoPrazo} slot(s)`],
      ["Risco de SLA", a.risco],
      ["Cronograma (tarefas)", `${tasks.length} (${crit} criticas)`]
    ].forEach(([k,v])=> {
      const d = document.createElement("div");
      d.className = "kv";
      d.innerHTML = `<b>${k}</b><span>${escapeHtml(v)}</span>`;
      kvs.appendChild(d);
    });
    el("pillProjeto").textContent = `Project: ${state.entrada.projectCode || "-"} • ${state.entrada.cliente || "-"}`;
  }

  function renderCapacityKVs(){
    const kvs = el("kvsCapacidade");
    const a = analyzeCapacity();
    const prazoText = `${formatDateBR(state.entrada.dtInicio)} ate ${formatDateBR(state.entrada.dtFim)}`;
    const slaText = a.slaLimite ? `${state.entrada.slaDias} dias (limite ${formatDateBR(a.slaLimite)})` : `${state.entrada.slaDias} dias`;
    const saldoLabel = a.saldoDias >= 0 ? `Folga: ${a.saldoDias} dia(s)` : `Atraso: ${Math.abs(a.saldoDias)} dia(s)`;
    kvs.innerHTML = "";
    [
      ["Prazo solicitado", prazoText],
      ["SLA aplicavel", slaText],
      ["SLA consumido", `${a.percentualSla}% (${a.prazoDias} dia(s))`],
      ["Status SLA", `${a.slaStatus} • ${saldoLabel}`],
      ["Recursos elegiveis", `${a.elegiveisCount}`],
      ["Capacidade livre no prazo", `${a.livresNoPrazo} slot(s)`],
      ["Esforco estimado", `${a.effort} slot(s)`],
      ["Gap de capacidade", `${a.gap} slot(s)`],
      ["Cobertura", `${a.cobertura}%`],
      ["Risco de SLA", a.risco]
    ].forEach(([k,v])=> {
      const d = document.createElement("div");
      d.className = "kv";
      d.innerHTML = `<b>${k}</b><span>${escapeHtml(v)}</span>`;
      kvs.appendChild(d);
    });
    const pill = el("pillRisco");
    pill.className = riskPillClass(a.risco);
    pill.id = "pillRisco";
    pill.textContent = `Risco SLA: ${a.risco}`;
    const pillSla = el("pillSlaStatus");
    pillSla.className = slaPillClass(a.slaStatus);
    pillSla.id = "pillSlaStatus";
    pillSla.textContent = `SLA: ${a.percentualSla}% • ${saldoLabel}`;
  }

  function renderTab1(){
    el("projectCode").value = state.entrada.projectCode;
    el("cliente").value = state.entrada.cliente;
    el("origem").value = state.entrada.origem;
    el("tipoRecurso").value = state.entrada.tipoRecurso;
    el("perfilPapel").value = state.entrada.perfilPapel;
    el("perfilProficiencia").value = state.entrada.perfilProficiencia;
    el("modalidadeProjeto").value = state.entrada.modalidadeProjeto;
    el("permSegManha").checked = state.entrada.permissaoAtendimento.diasSemana.seg.manha;
    el("permSegTarde").checked = state.entrada.permissaoAtendimento.diasSemana.seg.tarde;
    el("permTerManha").checked = state.entrada.permissaoAtendimento.diasSemana.ter.manha;
    el("permTerTarde").checked = state.entrada.permissaoAtendimento.diasSemana.ter.tarde;
    el("permQuaManha").checked = state.entrada.permissaoAtendimento.diasSemana.qua.manha;
    el("permQuaTarde").checked = state.entrada.permissaoAtendimento.diasSemana.qua.tarde;
    el("permQuiManha").checked = state.entrada.permissaoAtendimento.diasSemana.qui.manha;
    el("permQuiTarde").checked = state.entrada.permissaoAtendimento.diasSemana.qui.tarde;
    el("permSexManha").checked = state.entrada.permissaoAtendimento.diasSemana.sex.manha;
    el("permSexTarde").checked = state.entrada.permissaoAtendimento.diasSemana.sex.tarde;
    el("esforcoSlots").value = state.entrada.esforcoSlots;
    el("dtInicio").value = state.entrada.dtInicio;
    el("dtFim").value = state.entrada.dtFim;
    state.entrada.slaDias = getSlaDaysByOrigem(state.entrada.origem);
    el("slaDias").value = String(state.entrada.slaDias);
    renderPacks();
    renderProjetoKVs();
    renderResumoKVs();
  }

  function validateEntrada(){
    if(!state.entrada.projectCode) return "Informe o Numero FAP.";
    if(!state.entrada.cliente) return "Informe o cliente.";
    if(!state.entrada.dtInicio || !state.entrada.dtFim) return "Informe data de inicio e data de fim.";
    if(state.entrada.dtFim < state.entrada.dtInicio) return "Data fim nao pode ser menor que data inicio.";
    const pa = state.entrada.permissaoAtendimento;
    const anyAllowed = ["seg","ter","qua","qui","sex"].some((k)=> {
      const d = pa.diasSemana[k];
      return d && (d.manha || d.tarde);
    });
    if(!anyAllowed){
      return "Selecione pelo menos 1 periodo em algum dia da semana.";
    }
    if(Number(state.entrada.esforcoSlots || 0) <= 0) return "Esforco estimado precisa ser maior que zero.";
    if(selectedPacks().length === 0) return "Selecione pelo menos 1 pack.";
    return "";
  }

  normalizeState();
  syncCronogramaFromFluxo();
  recalcCronograma();

  el("origem").addEventListener("change", ()=> {
    state.entrada.origem = el("origem").value;
    state.entrada.slaDias = getSlaDaysByOrigem(state.entrada.origem);
    el("slaDias").value = String(state.entrada.slaDias);
    renderProjetoKVs();
  });
  el("btnSelectAllPacks").addEventListener("click", toggleListaPacksVendidos);

  el("btnSalvarEntrada").addEventListener("click", ()=> {
    state.entrada.projectCode = el("projectCode").value.trim();
    state.entrada.cliente = el("cliente").value.trim();
    state.entrada.origem = el("origem").value;
    state.entrada.tipoRecurso = el("tipoRecurso").value;
    state.entrada.perfilPapel = el("perfilPapel").value;
    state.entrada.perfilProficiencia = el("perfilProficiencia").value;
    state.entrada.modalidadeProjeto = el("modalidadeProjeto").value;
    state.entrada.permissaoAtendimento = {
      diasSemana: {
        seg: { manha: el("permSegManha").checked, tarde: el("permSegTarde").checked },
        ter: { manha: el("permTerManha").checked, tarde: el("permTerTarde").checked },
        qua: { manha: el("permQuaManha").checked, tarde: el("permQuaTarde").checked },
        qui: { manha: el("permQuiManha").checked, tarde: el("permQuiTarde").checked },
        sex: { manha: el("permSexManha").checked, tarde: el("permSexTarde").checked }
      }
    };
    state.entrada.esforcoSlots = el("esforcoSlots").value.trim();
    state.entrada.dtInicio = el("dtInicio").value;
    state.entrada.dtFim = el("dtFim").value;
    state.entrada.slaDias = getSlaDaysByOrigem(state.entrada.origem);
    const err = validateEntrada();
    if(err){ toast("Dados obrigatorios", err); return; }
    syncCronogramaFromFluxo();
    recalcCronograma();
    save();
    renderProjetoKVs();
    toast("Project criado", "Agora siga para a aba 2) Capacidade & Alocacao.");
    showTab("tab2");
  });

  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panes = ["tab1","tab2","tab3","tab4"].map((id)=>el(id));
  function showTab(id){
    tabs.forEach((t)=> t.classList.toggle("active", t.dataset.tab === id));
    panes.forEach((p)=> p.style.display = (p.id === id) ? "" : "none");
    if(id === "tab1") renderTab1();
    if(id === "tab2") renderTab2();
    if(id === "tab3") renderTab3();
    if(id === "tab4") renderTab4();
  }
  tabs.forEach((t)=> t.addEventListener("click", ()=> showTab(t.dataset.tab)));

  function renderTab2(){
    const analysis = analyzeCapacity();
    const filtroTipo = el("filtroRecursos").value;
    const q = el("buscarConsultor").value.trim().toLowerCase();
    el("pillProjeto").textContent = `Project: ${state.entrada.projectCode || "-"} • ${state.entrada.cliente || "-"}`;
    el("pillFiltro").textContent = `Filtro: ${filtroTipo}`;
    renderCapacityKVs();
    const container = el("consultoresContainer");
    container.innerHTML = "";
    const list = analysis.elegiveis.filter((c)=> {
      const okTipo = (filtroTipo === "Todos") ? true : (c.tipo === filtroTipo);
      const hay = `${c.nome} ${c.proficiencia} ${c.parceiro} ${c.tipo} ${c.papel}`.toLowerCase();
      const okQ = q ? hay.includes(q) : true;
      return okTipo && okQ;
    });
    if(list.length === 0){
      container.innerHTML = `<div class="empty"><b>Nenhum recurso elegivel</b><div style="margin-top:6px">Revise o perfil solicitado ou o filtro aplicado.</div></div>`;
      setReserveBar();
      return;
    }
    list.forEach((consultor)=> {
      const box = document.createElement("div");
      box.className = "consultant";
      const top = document.createElement("div");
      top.className = "top";
      top.innerHTML = `
        <div class="name">
          ${escapeHtml(consultor.nome)}
          <span class="badge">${escapeHtml(consultor.proficiencia)}</span>
          <span class="badge">${escapeHtml(consultor.tipo)}</span>
          <span class="badge">${escapeHtml(consultor.papel)}</span>
          <span class="badge">${escapeHtml(consultor.modalidades.join("/"))}</span>
        </div>
        <div class="hint">Clique em slots <b>L</b> para selecionar • <b>R</b> nao seleciona</div>
      `;
      box.appendChild(top);
      const slotsWrap = document.createElement("div");
      slotsWrap.className = "slots";
      consultor.slots.forEach((s, idx)=> {
        if(!isInPrazo(s.date) || !slotAllowedByPermissao(s)) return;
        const slot = document.createElement("div");
        const isFree = s.state === "L";
        slot.className = "slot " + (isFree ? "free" : "reserved") + (selected.slotIds.includes(s.id) ? " selected" : "");
        slot.innerHTML = `
          <div class="d">${formatDateBR(s.date)}</div>
          <div class="p">${s.periodo === "Manha" ? `<span class="pill green">Manha</span>` : `<span class="pill purple">Tarde</span>`}</div>
          <div class="state">${isFree ? "L" : "R"}</div>
        `;
        slot.addEventListener("click", (ev)=> {
          if(!isFree){ toast("Slot reservado", "Este periodo ja esta reservado."); return; }
          if(selected.consultorId && selected.consultorId !== consultor.id){ toast("Regra MVP", "Selecao permitida somente no mesmo consultor. A selecao atual foi mantida."); return; }
          if(!selected.consultorId) selected.consultorId = consultor.id;
          const isCtrl = ev.ctrlKey || ev.metaKey;
          const isShift = ev.shiftKey;
          if(isShift && lastClickedIndex !== null){
            const c = state.consultores.find((x)=>x.id === consultor.id);
            const a = Math.min(lastClickedIndex, idx);
            const b = Math.max(lastClickedIndex, idx);
            const range = c.slots.slice(a, b + 1).filter((x)=>x.state === "L" && isInPrazo(x.date)).map((x)=>x.id);
            selected.slotIds = Array.from(new Set([...selected.slotIds, ...range]));
          } else if(isCtrl){
            if(selected.slotIds.includes(s.id)) selected.slotIds = selected.slotIds.filter((x)=>x !== s.id);
            else selected.slotIds = [...selected.slotIds, s.id];
          } else {
            if(selected.slotIds.length === 1 && selected.slotIds[0] === s.id){ selected.slotIds = []; selected.consultorId = null; lastClickedIndex = null; }
            else selected.slotIds = [s.id];
          }
          if(selected.slotIds.length === 0){ selected.consultorId = null; lastClickedIndex = null; } else lastClickedIndex = idx;
          setReserveBar();
          renderTab2();
        });
        slotsWrap.appendChild(slot);
      });
      box.appendChild(slotsWrap);
      container.appendChild(box);
    });
    setReserveBar();
  }

  el("filtroRecursos").addEventListener("change", ()=> renderTab2());
  el("buscarConsultor").addEventListener("input", ()=> renderTab2());
  el("btnLimparSel").addEventListener("click", ()=> { resetSelection(); setReserveBar(); renderTab2(); });

  const modalBack = el("modalBack");
  const modalPack = el("modalPack");
  const modalEtapa = el("modalEtapa");
  const modalModalidade = el("modalModalidade");
  const kvsReserva = el("kvsReserva");
  const modalObs = el("modalObs");

  function summarizePeriodos(slots){
    const m = slots.filter((s)=>s.periodo === "Manha").length;
    const t = slots.filter((s)=>s.periodo === "Tarde").length;
    const parts = [];
    if(m) parts.push(`Manha: ${m}`);
    if(t) parts.push(`Tarde: ${t}`);
    return parts.join(" • ") || "-";
  }

  function openModal(){
    const packs = selectedPacks();
    if(packs.length === 0){ toast("Sem pack selecionado", "Volte na aba 1 e selecione pelo menos 1 pack."); showTab("tab1"); return; }
    const err = validateEntrada();
    if(err){ toast("Project incompleto", err); showTab("tab1"); return; }
    modalPack.innerHTML = packs.map((p)=>`<option value="${escapeAttr(p.id)}">${escapeHtml(p.nome)}</option>`).join("");
    modalEtapa.value = "";
    modalModalidade.value = state.entrada.modalidadeProjeto;
    modalObs.value = "";
    const c = currentConsultor();
    const slots = c ? c.slots.filter((s)=>selected.slotIds.includes(s.id)) : [];
    const dates = slots.map((s)=>s.date).sort();
    const analysis = analyzeCapacity();
    kvsReserva.innerHTML = "";
    [
      ["Project", state.entrada.projectCode || "-"],
      ["Cliente", state.entrada.cliente || "-"],
      ["Consultor", c ? c.nome : "-"],
      ["Qtde de slots", String(selected.slotIds.length)],
      ["Inicio", dates[0] ? formatDateBR(dates[0]) : "-"],
      ["Fim", dates[0] ? formatDateBR(dates[dates.length - 1]) : "-"],
      ["Periodos", summarizePeriodos(slots)],
      ["Packs disponiveis", packs.map((p)=>p.nome).join(", ")],
      ["Risco SLA", analysis.risco]
    ].forEach(([k,v])=> {
      const d = document.createElement("div");
      d.className = "kv";
      d.innerHTML = `<b>${k}</b><span>${escapeHtml(v)}</span>`;
      kvsReserva.appendChild(d);
    });
    modalBack.style.display = "flex";
  }

  function closeModal(){ modalBack.style.display = "none"; }
  el("btnReservarSel").addEventListener("click", openModal);
  el("btnFecharModal").addEventListener("click", closeModal);
  el("btnCancelarReserva").addEventListener("click", closeModal);
  modalBack.addEventListener("click", (e)=> { if(e.target === modalBack) closeModal(); });

  el("btnConfirmarReserva").addEventListener("click", ()=> {
    const etapa = modalEtapa.value;
    const modalidade = modalModalidade.value;
    const pack = state.entrada.packs.find((p)=>p.id === modalPack.value);
    if(!etapa){ toast("Etapa obrigatoria", "Selecione a etapa antes de confirmar."); return; }
    if(!modalidade){ toast("Modalidade obrigatoria", "Selecione Remoto ou Presencial."); return; }
    if(!pack){ toast("Pack invalido", "Selecione um pack valido."); return; }
    const c = currentConsultor();
    if(!c){ toast("Erro de selecao", "Nenhum consultor selecionado."); return; }
    const chosenSlots = c.slots.filter((s)=> selected.slotIds.includes(s.id) && s.state === "L");
    if(chosenSlots.length === 0){ toast("Nada para reservar", "Somente slots livres podem ser reservados."); closeModal(); return; }
    const analysis = analyzeCapacity();
    chosenSlots.forEach((s)=> {
      s.state = "R";
      state.reservas.push({
        id: uuid(),
        projectCode: state.entrada.projectCode || "",
        cliente: state.entrada.cliente || "",
        origem: state.entrada.origem || "",
        slaDias: state.entrada.slaDias || 0,
        riscoSla: analysis.risco,
        packId: pack.id,
        packNome: pack.nome,
        etapa,
        modalidade,
        consultorId: c.id,
        consultorNome: c.nome,
        inicio: s.date,
        fim: s.date,
        periodo: s.periodo,
        obs: modalObs.value.trim()
      });
    });
    syncCronogramaFromFluxo();
    recalcCronograma();
    save();
    closeModal();
    toast("Reservas confirmadas", `${chosenSlots.length} slot(s) reservado(s) para ${c.nome}.`);
    resetSelection();
    setReserveBar();
    renderTab2();
    renderTab3();
  });

  function renderResumoKVs(){
    const kvs = el("kvsResumo");
    if(!kvs) return;
    const a = analyzeCapacity();
    recalcCronograma();
    const tasks = state.cronograma.tasks;
    const crit = tasks.filter((t)=>t.isCritical).length;
    const baselineAt = state.cronograma.baseline.capturedAt ? new Date(state.cronograma.baseline.capturedAt).toLocaleString("pt-BR") : "-";
    kvs.innerHTML = "";
    [
      ["Project", state.entrada.projectCode || "-"],
      ["Cliente", state.entrada.cliente || "-"],
      ["Origem", state.entrada.origem || "-"],
      ["Duracao Projeto em Dias", `${state.entrada.slaDias} dias`],
      ["SLA consumido", `${a.percentualSla}% (${a.prazoDias} dia(s))`],
      ["Status SLA", `${a.slaStatus} (${a.saldoDias >= 0 ? "Folga" : "Atraso"}: ${Math.abs(a.saldoDias)} dia(s))`],
      ["Packs selecionados", selectedPacks().map((p)=>p.nome).join(", ") || "-"],
      ["Total de reservas", String(state.reservas.length)],
      ["Capacidade livre no prazo", `${a.livresNoPrazo} slot(s)`],
      ["Risco de SLA", a.risco],
      ["Cronograma WBS", `${tasks.length} tarefas (${crit} criticas)`],
      ["Baseline", baselineAt],
      ["Ultima atualizacao", new Date().toLocaleString("pt-BR")]
    ].forEach(([k,v])=> {
      const d = document.createElement("div");
      d.className = "kv";
      d.innerHTML = `<b>${k}</b><span>${escapeHtml(v)}</span>`;
      kvs.appendChild(d);
    });
  }

  function renderGridResumo(){
    const wrap = el("gridResumoWrap");
    syncCronogramaFromFluxo();
    recalcCronograma();
    const rows = state.reservas.slice().sort((a,b)=> (a.consultorNome + a.inicio + a.periodo).localeCompare(b.consultorNome + b.inicio + b.periodo));
    if(rows.length === 0){
      wrap.innerHTML = `<div class="empty"><b>Sem reservas</b><div style="margin-top:6px">Faca reservas na aba 2) Capacidade & Alocacao.</div></div>`;
      return;
    }
    const rowsHtml = rows.map((r)=> {
      const t = state.cronograma.tasks.find((x)=>x.reservaId === r.id || x.id === `res_${r.id}`);
      const wbs = t ? t.wbsCode : "-";
      const crit = t ? (t.isCritical ? "Sim" : "Nao") : "-";
      const critClass = t && t.isCritical ? "pill red" : "pill green";
      return `
        <tr>
          <td><b>${escapeHtml(r.projectCode || "-")}</b></td>
          <td>${escapeHtml(wbs)}</td>
          <td><span class="pill">${escapeHtml(r.etapa)}</span></td>
          <td><span class="pill">${escapeHtml(r.packNome)}</span></td>
          <td><b>${escapeHtml(r.consultorNome)}</b></td>
          <td>${formatDateBR(r.inicio)}</td>
          <td><span class="${r.periodo === "Manha" ? "pill green" : "pill purple"}">${escapeHtml(r.periodo)}</span></td>
          <td><span class="${r.modalidade === "Remoto" ? "pill purple" : "pill green"}">${escapeHtml(r.modalidade)}</span></td>
          <td><span class="${riskPillClass(r.riscoSla || "Indefinido")}">${escapeHtml(r.riscoSla || "-")}</span></td>
          <td><span class="${critClass}">${escapeHtml(crit)}</span></td>
          <td style="max-width:240px; color:var(--muted)">${escapeHtml(r.obs || "-")}</td>
          <td><button class="btn" data-del="${escapeAttr(r.id)}">Excluir</button></td>
        </tr>
      `;
    }).join("");
    wrap.innerHTML = `
      <table class="table">
        <thead>
          <tr><th>Project</th><th>WBS</th><th>Etapa</th><th>Pack</th><th>Consultor</th><th>Data</th><th>Periodo</th><th>Modalidade</th><th>Risco SLA</th><th>Critica?</th><th>Obs.</th><th>Acoes</th></tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
    wrap.querySelectorAll("[data-del]").forEach((btn)=> btn.addEventListener("click", ()=> deleteReserva(btn.getAttribute("data-del"))));
  }

  function renderCronogramaGrid(){
    const wrap = el("cronogramaWrap");
    if(!wrap) return;
    const calc = recalcCronograma();
    const tasks = state.cronograma.tasks.slice().sort((a,b)=>a.wbsCode.localeCompare(b.wbsCode, undefined, { numeric:true }));
    if(tasks.length === 0){
      wrap.innerHTML = `<div class="empty"><b>Cronograma vazio</b><div style="margin-top:6px">Importe um JSON de cronograma ou adicione tarefas.</div></div>`;
      return;
    }
    const depMap = new Map(tasks.map((t)=>[t.id, []]));
    state.cronograma.dependencies.forEach((d)=> {
      if(depMap.has(d.successorId)) depMap.get(d.successorId).push(d);
    });
    const warning = calc.ok ? "" : `<div class="empty" style="margin-bottom:8px"><b>Erros de dependencias</b><div style="margin-top:6px">${escapeHtml(calc.errors.join(" | "))}</div></div>`;
    wrap.innerHTML = `
      ${warning}
      <div class="hd" style="margin-bottom:8px; border:1px solid var(--line); border-radius:12px; padding:10px; background:rgba(255,255,255,.03)"><h2 style="margin:0; font-size:13px">Cronograma (conceito MS Project)</h2></div>
      <table class="table">
        <thead>
          <tr><th>WBS</th><th>Tarefa</th><th>Tipo</th><th>Duracao</th><th>Dependencias</th><th>Esforco</th><th>Inicio</th><th>Fim</th><th>Early</th><th>Late</th><th>Float</th><th>Critica</th><th>Baseline</th></tr>
        </thead>
        <tbody>
          ${tasks.map((t)=>`
            <tr>
              <td>${escapeHtml(t.wbsCode)}</td>
              <td>${escapeHtml(t.nome)}</td>
              <td><span class="pill">${escapeHtml(t.tipo)}</span></td>
              <td><input type="number" min="0" step="1" data-task-dur="${escapeAttr(t.id)}" value="${escapeAttr(String(t.durationDays))}" style="width:88px" /></td>
              <td><input data-task-deps="${escapeAttr(t.id)}" value="${escapeAttr(formatDependenciesForTask(depMap.get(t.id) || []))}" placeholder="pred:FS:0,pred2:SS:1" style="min-width:220px" /></td>
              <td>${escapeHtml(t.effort == null ? "-" : String(t.effort))}</td>
              <td>${formatDateBR(t.start)}</td>
              <td>${formatDateBR(t.finish)}</td>
              <td>${formatDateBR(t.earlyStart)} → ${formatDateBR(t.earlyFinish)}</td>
              <td>${formatDateBR(t.lateStart)} → ${formatDateBR(t.lateFinish)}</td>
              <td>${escapeHtml(String(t.float))}</td>
              <td><span class="${t.isCritical ? "pill red" : "pill green"}">${t.isCritical ? "Sim" : "Nao"}</span></td>
              <td>${formatDateBR(t.baselineStart)} → ${formatDateBR(t.baselineFinish)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    wrap.querySelectorAll("[data-task-dur]").forEach((input)=> {
      input.addEventListener("change", ()=> {
        const id = input.getAttribute("data-task-dur");
        const t = state.cronograma.tasks.find((x)=>x.id === id);
        if(!t) return;
        const val = Number(input.value);
        t.durationDays = Number.isFinite(val) ? Math.max(0, val) : t.durationDays;
        if(t.tipo === "marco") t.durationDays = 0;
        const res = recalcCronograma();
        save();
        renderTab3();
        if(!res.ok) toast("Dependencias invalidas", res.errors[0] || "Erro no cronograma.");
      });
    });
    wrap.querySelectorAll("[data-task-deps]").forEach((input)=> {
      input.addEventListener("change", ()=> {
        const taskId = input.getAttribute("data-task-deps");
        const parsed = parseDependenciesInput(input.value, taskId);
        if(!parsed.ok){
          toast("Formato invalido", parsed.error);
          input.value = formatDependenciesForTask((state.cronograma.dependencies || []).filter((d)=>d.successorId === taskId));
          return;
        }
        state.cronograma.dependencies = state.cronograma.dependencies.filter((d)=>d.successorId !== taskId).concat(parsed.deps);
        const res = recalcCronograma();
        if(!res.ok){
          toast("Dependencias invalidas", res.errors[0] || "Erro no cronograma.");
        }
        save();
        renderTab3();
      });
    });
  }

  function wbsCompare(a, b){
    const aa = String(a || "").split(".").map((x)=>Number(x));
    const bb = String(b || "").split(".").map((x)=>Number(x));
    const n = Math.max(aa.length, bb.length);
    for(let i=0;i<n;i++){
      const av = Number.isFinite(aa[i]) ? aa[i] : -1;
      const bv = Number.isFinite(bb[i]) ? bb[i] : -1;
      if(av !== bv) return av - bv;
    }
    return String(a || "").localeCompare(String(b || ""));
  }

  function sortTasksByWbs(tasks){
    return tasks.slice().sort((x,y)=> wbsCompare(x.wbsCode, y.wbsCode));
  }

  function buildChildrenMap(tasks){
    const map = new Map();
    const all = sortTasksByWbs(tasks);
    all.forEach((t)=> map.set(t.id, []));
    map.set("__root__", []);
    all.forEach((t)=> {
      const pid = t.parentId && map.has(t.parentId) ? t.parentId : "__root__";
      map.get(pid).push(t);
    });
    return map;
  }

  function getOutlineRows(){
    const tasks = state.cronograma.tasks;
    const children = buildChildrenMap(tasks);
    const rows = [];
    function walk(parentId, depth){
      (children.get(parentId) || []).forEach((t)=> {
        const hasChildren = (children.get(t.id) || []).length > 0;
        rows.push({ task: t, depth, hasChildren });
        if(!msUi.collapsed.has(t.id)) walk(t.id, depth + 1);
      });
    }
    walk("__root__", 0);
    return rows;
  }

  function renumberWbs(){
    const tasks = state.cronograma.tasks;
    const children = buildChildrenMap(tasks);
    function walk(parentId, prefix){
      const arr = children.get(parentId) || [];
      arr.forEach((t, idx)=> {
        const code = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
        t.wbsCode = code;
        walk(t.id, code);
      });
    }
    walk("__root__", "");
  }

  function predecessorLabel(dep){
    const pred = state.cronograma.tasks.find((t)=>t.id === dep.predecessorId);
    const ref = pred ? pred.wbsCode : dep.predecessorId;
    const lag = Number(dep.lag || 0);
    const lagTxt = lag === 0 ? "" : (lag > 0 ? `+${lag}d` : `${lag}d`);
    return `${ref}${dep.type}${lagTxt}`;
  }

  function formatMsPredecessoras(taskId){
    const deps = state.cronograma.dependencies.filter((d)=>d.successorId === taskId);
    return deps.map(predecessorLabel).join(";");
  }

  function formatMsPredBadgesHtml(taskId){
    const deps = state.cronograma.dependencies.filter((d)=>d.successorId === taskId);
    if(!deps.length) return "";
    return deps.map((d)=> {
      const mode = d.sourceFlow === "etapa_auto" ? "auto" : "manual";
      const tag = d.sourceFlow === "etapa_auto" ? "AUTO" : "MANUAL";
      return `<span class="msPredBadge ${mode}">${escapeHtml(predecessorLabel(d))} • ${tag}</span>`;
    }).join("");
  }

  function parseMsPredecessoras(raw, successorId){
    const txt = String(raw || "").trim();
    if(!txt) return { ok: true, deps: [] };
    const deps = [];
    const tokens = txt.split(";").map((x)=>x.trim()).filter(Boolean);
    const byId = new Map(state.cronograma.tasks.map((t)=>[t.id, t]));
    const byWbs = new Map(state.cronograma.tasks.map((t)=>[t.wbsCode, t]));
    for(const tok of tokens){
      const m = tok.match(/^(.+?)(FS|SS|FF|SF)([+-]\d+d?)?$/i);
      if(!m) return { ok: false, error: `Formato invalido: ${tok}` };
      const ref = m[1].trim();
      const type = m[2].toUpperCase();
      const lagRaw = (m[3] || "").replace(/d$/i, "");
      const lag = lagRaw ? Number(lagRaw) : 0;
      if(!Number.isFinite(lag)) return { ok: false, error: `Lag invalido em ${tok}` };
      const pred = byWbs.get(ref) || byId.get(ref);
      if(!pred) return { ok: false, error: `Predecessora nao encontrada: ${ref}` };
      deps.push({ predecessorId: pred.id, successorId, type, lag });
    }
    return { ok: true, deps };
  }

  function diffCalendarDays(a, b){
    if(!a || !b) return 0;
    const da = toDateAtNoon(a);
    const db = toDateAtNoon(b);
    return Math.floor((db - da) / (24 * 60 * 60 * 1000));
  }

  function renderMsGridAndGantt(){
    syncCronogramaFromFluxo();
    const calc = recalcCronograma();
    const rows = getOutlineRows();
    const grid = el("msGridWrap");
    const gantt = el("msGanttWrap");
    if(!grid || !gantt) return;
    if(rows.length === 0){
      grid.innerHTML = `<div class="empty"><b>Sem tarefas</b></div>`;
      gantt.innerHTML = `<div class="empty"><b>Sem dados de Gantt</b></div>`;
      return;
    }
    const warning = calc.ok ? "" : `<div class="empty" style="margin:8px"><b>Erros de dependencias</b><div style="margin-top:6px">${escapeHtml(calc.errors.join(" | "))}</div></div>`;
    grid.innerHTML = `
      ${warning}
      <table class="msTable">
        <thead>
          <tr>
            <th>WBS</th><th>Nome</th><th>Duracao</th><th>Predecessoras</th><th>Inicio</th><th>Fim</th><th>Folga</th><th>Critica</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r)=>`
            <tr data-ms-row="${escapeAttr(r.task.id)}" class="${msUi.selectedTaskId === r.task.id ? "msRowSel" : ""}">
              <td>${escapeHtml(r.task.wbsCode)}</td>
              <td>
                <div class="msNameCell" style="padding-left:${r.depth * 16}px">
                  ${r.hasChildren ? `<button class="msToggle" data-ms-toggle="${escapeAttr(r.task.id)}">${msUi.collapsed.has(r.task.id) ? "+" : "-"}</button>` : `<span class="msLeaf">•</span>`}
                  <input class="msNameInput" data-ms-name="${escapeAttr(r.task.id)}" value="${escapeAttr(r.task.nome)}" />
                </div>
              </td>
              <td><input class="msDurInput" type="number" min="0" step="1" data-ms-dur="${escapeAttr(r.task.id)}" value="${escapeAttr(String(r.task.durationDays))}" ${r.task.tipo === "marco" ? "readonly" : ""} /></td>
              <td>
                <input class="msPredInput" data-ms-pred="${escapeAttr(r.task.id)}" value="${escapeAttr(formatMsPredecessoras(r.task.id))}" placeholder="12FS+2d;15SS" />
                <div class="msPredBadges">${formatMsPredBadgesHtml(r.task.id)}</div>
              </td>
              <td>${formatDateBR(r.task.start)}</td>
              <td>${formatDateBR(r.task.finish)}</td>
              <td>${escapeHtml(String(r.task.float || 0))}</td>
              <td><span class="${r.task.isCritical ? "pill red" : "pill green"}">${r.task.isCritical ? "Sim" : "Nao"}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    const allDates = [];
    rows.forEach((r)=> {
      if(r.task.start) allDates.push(r.task.start);
      if(r.task.finish) allDates.push(r.task.finish);
      if(msUi.compareBaseline){
        if(r.task.baselineStart) allDates.push(r.task.baselineStart);
        if(r.task.baselineFinish) allDates.push(r.task.baselineFinish);
      }
    });
    const minDate = allDates.sort()[0];
    const maxDate = allDates.sort().reverse()[0];
    if(!minDate || !maxDate){
      gantt.innerHTML = `<div class="empty"><b>Sem datas calculadas</b></div>`;
    } else {
      const unit = 24;
      const totalDays = Math.max(1, diffCalendarDays(minDate, maxDate) + 1);
      const days = [];
      for(let i=0;i<totalDays;i++) days.push(addDaysISO(minDate, i));
      gantt.innerHTML = `
        <div class="msGantt" style="width:${totalDays * unit}px">
          <div class="msGanttHeader">
            ${days.map((d)=>`<div class="msGDay">${escapeHtml(d.slice(8,10))}</div>`).join("")}
          </div>
          <div class="msGBody">
            ${rows.map((r)=> {
              const t = r.task;
              const left = diffCalendarDays(minDate, t.start) * unit;
              const width = Math.max(unit, (diffCalendarDays(t.start, t.finish) + 1) * unit);
              const bLeft = diffCalendarDays(minDate, t.baselineStart) * unit;
              const bWidth = Math.max(unit, (diffCalendarDays(t.baselineStart, t.baselineFinish) + 1) * unit);
              const isMarco = t.tipo === "marco" || Number(t.durationDays) === 0;
              const bar = isMarco
                ? `<div class="msMilestone" style="left:${left + (unit / 2) - 7}px"></div>`
                : `<div class="msBar ${t.isCritical ? "critical" : ""}" style="left:${left}px; width:${width}px"></div>`;
              const baseline = (msUi.compareBaseline && t.baselineStart && t.baselineFinish)
                ? `<div class="msBaseline" style="left:${bLeft}px; width:${bWidth}px"></div>`
                : "";
              return `<div class="msGRow">${baseline}${bar}</div>`;
            }).join("")}
          </div>
        </div>
      `;
    }

    grid.querySelectorAll("[data-ms-row]").forEach((row)=> {
      row.addEventListener("click", ()=> {
        msUi.selectedTaskId = row.getAttribute("data-ms-row");
        renderTab4();
      });
    });
    grid.querySelectorAll("[data-ms-toggle]").forEach((btn)=> {
      btn.addEventListener("click", (ev)=> {
        ev.stopPropagation();
        const id = btn.getAttribute("data-ms-toggle");
        if(msUi.collapsed.has(id)) msUi.collapsed.delete(id);
        else msUi.collapsed.add(id);
        renderTab4();
      });
    });
    grid.querySelectorAll("[data-ms-name]").forEach((input)=> {
      input.addEventListener("change", ()=> {
        const id = input.getAttribute("data-ms-name");
        const t = state.cronograma.tasks.find((x)=>x.id === id);
        if(!t) return;
        t.nome = input.value.trim() || t.nome;
        save();
      });
    });
    grid.querySelectorAll("[data-ms-dur]").forEach((input)=> {
      input.addEventListener("change", ()=> {
        const id = input.getAttribute("data-ms-dur");
        const t = state.cronograma.tasks.find((x)=>x.id === id);
        if(!t) return;
        const v = Number(input.value);
        t.durationDays = t.tipo === "marco" ? 0 : (Number.isFinite(v) ? Math.max(1, v) : t.durationDays);
        const res = recalcCronograma();
        save();
        renderTab4();
        if(!res.ok) toast("Dependencias invalidas", res.errors[0] || "Erro no cronograma.");
      });
    });
    grid.querySelectorAll("[data-ms-pred]").forEach((input)=> {
      input.addEventListener("change", ()=> {
        const taskId = input.getAttribute("data-ms-pred");
        const parsed = parseMsPredecessoras(input.value, taskId);
        if(!parsed.ok){
          toast("Formato invalido", parsed.error);
          input.value = formatMsPredecessoras(taskId);
          return;
        }
        state.cronograma.dependencies = state.cronograma.dependencies.filter((d)=>d.successorId !== taskId).concat(parsed.deps);
        const res = recalcCronograma();
        save();
        renderTab4();
        if(!res.ok) toast("Dependencias invalidas", res.errors[0] || "Erro no cronograma.");
      });
    });
  }

  function createTaskLikeSelected(tipo){
    const id = `t_${Date.now().toString(16)}_${Math.random().toString(16).slice(2,6)}`;
    const sel = state.cronograma.tasks.find((t)=>t.id === msUi.selectedTaskId) || null;
    const task = {
      id,
      wbsCode: "0",
      parentId: sel ? sel.parentId : null,
      nome: tipo === "marco" ? "Novo Marco" : "Nova Tarefa",
      durationDays: tipo === "marco" ? 0 : 1,
      tipo,
      effort: tipo === "marco" ? undefined : 1,
      start: "",
      finish: "",
      earlyStart: "",
      earlyFinish: "",
      lateStart: "",
      lateFinish: "",
      float: 0,
      isCritical: false,
      baselineStart: "",
      baselineFinish: ""
    };
    const arr = state.cronograma.tasks;
    if(sel){
      const idx = arr.findIndex((t)=>t.id === sel.id);
      arr.splice(idx + 1, 0, task);
    } else {
      arr.push(task);
    }
    msUi.selectedTaskId = id;
    renumberWbs();
    recalcCronograma();
    save();
    renderTab4();
  }

  function indentSelected(){
    const rows = getOutlineRows();
    const idx = rows.findIndex((r)=>r.task.id === msUi.selectedTaskId);
    if(idx <= 0) return;
    const cur = rows[idx].task;
    const prev = rows[idx - 1].task;
    cur.parentId = prev.id;
    renumberWbs();
    recalcCronograma();
    save();
    renderTab4();
  }

  function outdentSelected(){
    const cur = state.cronograma.tasks.find((t)=>t.id === msUi.selectedTaskId);
    if(!cur || !cur.parentId) return;
    const parent = state.cronograma.tasks.find((t)=>t.id === cur.parentId);
    cur.parentId = parent ? parent.parentId : null;
    renumberWbs();
    recalcCronograma();
    save();
    renderTab4();
  }

  function deleteSelectedMsTask(){
    const id = msUi.selectedTaskId;
    if(!id){
      toast("Selecione uma tarefa", "Escolha uma linha na grade para excluir.");
      return;
    }
    const task = state.cronograma.tasks.find((t)=>t.id === id);
    if(!task){
      toast("Tarefa nao encontrada", "Selecione uma tarefa valida.");
      return;
    }
    const hasChildren = state.cronograma.tasks.some((t)=>t.parentId === id);
    if(hasChildren){
      toast("Exclusao bloqueada", "A tarefa possui subtarefas. Remova ou mova as subtarefas antes.");
      return;
    }
    const linkedDeps = state.cronograma.dependencies.filter((d)=>d.predecessorId === id || d.successorId === id);
    if(linkedDeps.length > 0){
      toast("Exclusao bloqueada", `A tarefa possui ${linkedDeps.length} dependencia(s). Remova as dependencias antes.`);
      return;
    }
    const prev = sortTasksByWbs(state.cronograma.tasks).filter((t)=>t.id !== id);
    state.cronograma.tasks = state.cronograma.tasks.filter((t)=>t.id !== id);
    msUi.collapsed.delete(id);
    msUi.selectedTaskId = prev.length ? prev[Math.max(0, prev.length - 1)].id : null;
    renumberWbs();
    recalcCronograma();
    save();
    renderTab4();
    toast("Tarefa excluida", "A tarefa selecionada foi removida com sucesso.");
  }

  function renderTab4(){
    renderMsGridAndGantt();
  }

  function formatDependenciesForTask(deps){
    return deps.map((d)=> `${d.predecessorId}:${d.type}:${d.lag}`).join(",");
  }

  function parseDependenciesInput(raw, successorId){
    const txt = String(raw || "").trim();
    if(!txt) return { ok: true, deps: [] };
    const parts = txt.split(",").map((p)=>p.trim()).filter(Boolean);
    const deps = [];
    for(const p of parts){
      const tokens = p.split(":").map((x)=>x.trim());
      if(tokens.length < 2 || tokens.length > 3){
        return { ok: false, error: "Use formato predecessor:tipo:lag, ex.: t1:FS:0" };
      }
      const predecessorId = tokens[0];
      const type = tokens[1].toUpperCase();
      const lag = tokens.length === 3 ? Number(tokens[2]) : 0;
      if(!["FS","SS","FF","SF"].includes(type)){
        return { ok: false, error: `Tipo invalido: ${type}. Use FS, SS, FF ou SF.` };
      }
      if(!Number.isFinite(lag)){
        return { ok: false, error: `Lag invalido em ${p}.` };
      }
      deps.push({ predecessorId, successorId, type, lag });
    }
    return { ok: true, deps };
  }

  function deleteReserva(reservaId){
    const r = state.reservas.find((x)=>x.id === reservaId);
    if(!r) return;
    const c = state.consultores.find((x)=>x.id === r.consultorId);
    if(c){
      const slotId = `${c.id}_${r.inicio}_${r.periodo}`;
      const s = c.slots.find((x)=>x.id === slotId);
      if(s) s.state = "L";
    }
    state.reservas = state.reservas.filter((x)=>x.id !== reservaId);
    syncCronogramaFromFluxo();
    recalcCronograma();
    save();
    toast("Reserva excluida", "O slot foi liberado.");
    renderTab3();
    renderTab2();
  }

  function renderTab3(){ renderResumoKVs(); renderGridResumo(); renderCronogramaGrid(); }

  el("btnLimparResumo").addEventListener("click", ()=> {
    state.consultores = seedConsultores();
    state.reservas = [];
    syncCronogramaFromFluxo();
    recalcCronograma();
    save();
    toast("Resumo limpo", "Reservas apagadas e agenda resetada.");
    renderTab3();
    renderTab2();
  });

  el("btnExportCronograma").addEventListener("click", ()=> {
    recalcCronograma();
    const data = JSON.stringify(state.cronograma, null, 2);
    const blob = new Blob([data], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cronograma_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Cronograma exportado", "JSON do cronograma baixado com sucesso.");
  });

  el("btnImportCronograma").addEventListener("click", ()=> el("cronogramaFile").click());
  el("cronogramaFile").addEventListener("change", async (ev)=> {
    const f = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if(!f) return;
    try{
      const txt = await f.text();
      const data = JSON.parse(txt);
      normalizeCronograma(data);
      state.cronograma = data;
      recalcCronograma();
      save();
      renderTab3();
      toast("Cronograma importado", "Importacao concluida com sucesso.");
    }catch(err){
      toast("Erro na importacao", "JSON invalido de cronograma.");
    }
  });

  el("btnBaselineCronograma").addEventListener("click", ()=> {
    setBaselineSnapshot();
    save();
    renderTab3();
    toast("Baseline gerada", "Snapshot de baseline registrado.");
  });

  el("btnMsAddTask").addEventListener("click", ()=> createTaskLikeSelected("tarefa"));
  el("btnMsAddMilestone").addEventListener("click", ()=> createTaskLikeSelected("marco"));
  el("btnMsIndent").addEventListener("click", indentSelected);
  el("btnMsOutdent").addEventListener("click", outdentSelected);
  el("btnMsDeleteTask").addEventListener("click", deleteSelectedMsTask);
  el("btnMsBaseline").addEventListener("click", ()=> {
    setBaselineSnapshot();
    save();
    renderTab4();
    toast("Baseline definida", "Baseline atualizada para o cronograma.");
  });
  el("btnMsCompareBaseline").addEventListener("click", ()=> {
    msUi.compareBaseline = !msUi.compareBaseline;
    renderTab4();
  });

  el("btnGoResumo").addEventListener("click", ()=> showTab("tab3"));
  el("btnReset").addEventListener("click", ()=> { localStorage.removeItem(LS_KEY); toast("Reset concluido", "Recarregue a pagina (F5) para iniciar do zero."); });
  el("btnExport").addEventListener("click", ()=> {
    recalcCronograma();
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export_projects_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Exportado", "Arquivo JSON baixado com sucesso.");
  });

  function escapeHtml(str){
    str = String(str ?? "");
    return str.replace(/[&<>"']/g, (s)=>({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[s]));
  }
  function escapeAttr(str){ return escapeHtml(str).replace(/"/g, "&quot;"); }

  // Quick console tests:
  // window.cronoTests.runSample()
  // window.cronoTests.runCycleTest()
  // window.cronoTests.runCalendarTest()
  window.cronoTests = {
    runSample: function(){
      const backup = JSON.parse(JSON.stringify(state.cronograma));
      state.cronograma = defaultCronograma();
      const res = recalcCronograma();
      const rows = state.cronograma.tasks.map((t)=> ({
        id: t.id,
        wbs: t.wbsCode,
        earlyStart: t.earlyStart,
        earlyFinish: t.earlyFinish,
        lateStart: t.lateStart,
        lateFinish: t.lateFinish,
        float: t.float,
        isCritical: t.isCritical
      }));
      console.table(rows);
      state.cronograma = backup;
      recalcCronograma();
      return { ok: res.ok, errors: res.errors, rows };
    },
    runCycleTest: function(){
      const backup = JSON.parse(JSON.stringify(state.cronograma));
      const c = defaultCronograma();
      c.dependencies = [
        { predecessorId: "t1", successorId: "t2", type: "FS", lag: 0 },
        { predecessorId: "t2", successorId: "t1", type: "FS", lag: 0 }
      ];
      state.cronograma = c;
      const res = recalcCronograma();
      console.log("Cycle test:", res);
      state.cronograma = backup;
      recalcCronograma();
      return res;
    },
    runCalendarTest: function(){
      const backup = JSON.parse(JSON.stringify(state.cronograma));
      const c = defaultCronograma();
      const today = toIso(new Date());
      c.calendar.holidays = [today];
      c.tasks = [mkTask("a", "1", null, "A", 2, "tarefa", 2)];
      c.dependencies = [];
      state.cronograma = c;
      const res = recalcCronograma();
      console.table(state.cronograma.tasks.map((t)=> ({
        id: t.id,
        start: t.start,
        finish: t.finish,
        holidayBlocked: c.calendar.holidays.includes(t.start)
      })));
      state.cronograma = backup;
      recalcCronograma();
      return res;
    }
  };

  renderTab1();
})();

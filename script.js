//  ELEMENTOS 
const corpoTabela = document.getElementById("corpoTabela");
const corpoDistribuicao = document.getElementById("corpoDistribuicao");

const btnNovaLinha = document.getElementById("btnNovaLinha");
const btnNovaDistribuicao = document.getElementById("btnNovaDistribuicao");
const btnSalvar = document.getElementById("btnSalvar");
const btnImportar = document.getElementById("btnImportar");

const msgSalvo = document.getElementById("msgSalvo");
const inputBackup = document.getElementById("inputBackup");

//  DADOS 
let dados = JSON.parse(localStorage.getItem("locacoes")) || [];
let distribuicoes = JSON.parse(localStorage.getItem("distribuicoes")) || [];

//STORAGE 
function salvarStorage() {
    localStorage.setItem("locacoes", JSON.stringify(dados));
    localStorage.setItem("distribuicoes", JSON.stringify(distribuicoes));
}

//  TABELA PRINCIPAL 
function criarLinha(item = {}) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td><input type="date" value="${item.data || ""}"></td>

        <td>
            <select>
                <option value="">Selecione</option>
                <option value="Eletronica" ${item.loja === "Eletronica" ? "selected" : ""}>Eletrônica</option>
                <option value="Casa do Norte" ${item.loja === "Casa do Norte" ? "selected" : ""}>Casa do Norte</option>
                <option value="Bar" ${item.loja === "Bar" ? "selected" : ""}>Bar</option>
                <option value="Hotel" ${item.loja === "Hotel" ? "selected" : ""}>Hotel</option>
            </select>
        </td>

        <td>
            <select>
                <option value="">Selecione</option>
                <option value="entrada" ${item.lancamento === "entrada" ? "selected" : ""}>Entrada</option>
                <option value="saida" ${item.lancamento === "saida" ? "selected" : ""}>Saída</option>
            </select>
        </td>

        <td>
            <input type="number" step="0.01" value="${item.valor ? Math.abs(item.valor) : ""}">
        </td>

        <td class="saldo">0.00</td>

        <td>
            <input type="text" value="${item.observacao || ""}">
        </td>

        <td>
            <button class="btn-delete">🗑️</button>
        </td>
    `;

    tr.querySelector(".btn-delete").onclick = () => {
        tr.remove();
        atualizarSistema();
    };

    tr.querySelectorAll("input, select").forEach(el =>
        el.addEventListener("change", atualizarSistema)
    );

    corpoTabela.appendChild(tr);
}

function atualizarSistema() {
    let saldo = 0;
    dados = [];

    [...corpoTabela.children].forEach(tr => {
      const data = tr.children[0].querySelector("input").value;
const loja = tr.children[1].querySelector("select").value;
const tipo = tr.children[2].querySelector("select").value;
const valorBase = parseFloat(tr.children[3].querySelector("input").value) || 0;
const obs = tr.children[5].querySelector("input").value;

        const valor = tipo === "saida" ? -valorBase : valorBase;
        saldo += valor;

        tr.querySelector(".saldo").innerText = saldo.toFixed(2);

       dados.push({
    data,
    loja,
    lancamento: tipo,
    valor,
    observacao: obs,
    saldo
});
    });

    salvarStorage();
    atualizarDashboard();
    atualizarDashboardDistribuicao();
    atualizarPainelLojas();
}

//  DASHBOARD PRINCIPAL 
function atualizarDashboard() {
    let totalEntradas = 0;
    let totalSaidas = 0;

    let maiorEntrada = 0;
    let maiorSaida = 0; // valor absoluto

    dados.forEach(d => {
        if (typeof d.valor !== "number") return;

        // ENTRADAS
        if (d.valor > 0) {
            totalEntradas += d.valor;

            if (d.valor > maiorEntrada) {
                maiorEntrada = d.valor;
            }
        }

        // SAÍDAS
        if (d.valor < 0) {
            totalSaidas += Math.abs(d.valor);

            if (Math.abs(d.valor) > maiorSaida) {
                maiorSaida = Math.abs(d.valor);
            }
        }
    });

    const saldoAtual = dados.length
        ? dados[dados.length - 1].saldo
        : 0;

    const lucroMetade = saldoAtual > 0 ? saldoAtual / 2 : 0;

    // ================= ATUALIZA DASHBOARD =================
    document.getElementById("dashSaldo").innerText =
        `R$ ${saldoAtual.toFixed(2)}`;

    document.getElementById("dashEntradas").innerText =
        `R$ ${totalEntradas.toFixed(2)}`;

    document.getElementById("dashSaidas").innerText =
        `R$ ${totalSaidas.toFixed(2)}`;

    document.getElementById("dashQtd").innerText =
        dados.length;

    document.getElementById("dashMaiorEntrada").innerText =
        `R$ ${maiorEntrada.toFixed(2)}`;

    document.getElementById("dashMaiorSaida").innerText =
        `R$ ${maiorSaida.toFixed(2)}`;

    document.getElementById("dashLucroSandra").innerText =
        `R$ ${lucroMetade.toFixed(2)}`;

    document.getElementById("dashLucroSuely").innerText =
        `R$ ${lucroMetade.toFixed(2)}`;
}
//  DISTRIBUIÇÃO 
function criarLinhaDistribuicao(item = {}) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td><input type="month" value="${item.mes || ""}"></td>
        <td><input type="date" value="${item.data || ""}"></td>
        <td>
            <select>
                <option value="Sandra" ${item.pessoa === "Sandra" ? "selected" : ""}>Sandra</option>
                <option value="Suely" ${item.pessoa === "Suely" ? "selected" : ""}>Suely</option>
            </select>
        </td>
        <td>
            <select>
                <option value="entrada" ${item.tipo === "entrada" ? "selected" : ""}>Saque</option>
                <option value="saida" ${item.tipo === "saida" ? "selected" : ""}>Deposito</option>
            </select>
        </td>
        <td><input type="number" step="0.01" value="${item.valor ? Math.abs(item.valor) : ""}"></td>
        <td class="saldo">0.00</td>
        <td><input type="text" value="${item.observacao || ""}"></td>
        <td><button class="btn-delete">🗑️</button></td>
    `;

    tr.querySelector(".btn-delete").onclick = () => {
        tr.remove();
        atualizarDistribuicao();
    };

    tr.querySelectorAll("input, select").forEach(el =>
        el.addEventListener("change", atualizarDistribuicao)
    );

    corpoDistribuicao.appendChild(tr);
}

function atualizarDistribuicao() {
    let acumulado = 0;
    distribuicoes = [];

    [...corpoDistribuicao.children].forEach(tr => {
        const mes = tr.children[0].querySelector("input").value;
        const data = tr.children[1].querySelector("input").value;
        const pessoa = tr.children[2].querySelector("select").value;
        const tipo = tr.children[3].querySelector("select").value;
        const valorBase = parseFloat(tr.children[4].querySelector("input").value) || 0;
        const obs = tr.children[6].querySelector("input").value;

        const valor = tipo === "saida" ? -valorBase : valorBase;
        acumulado += valor;

        tr.querySelector(".saldo").innerText = acumulado.toFixed(2);

        distribuicoes.push({ mes, data, pessoa, tipo, valor, observacao: obs });
    });

    salvarStorage();
    atualizarDashboardDistribuicao();
}

//  DASHBOARD DISTRIBUIÇÃO 
function atualizarDashboardDistribuicao() {
    let distribuido = 0;
    let sandra = 0;
    let suely = 0;
    let ultimaData = null;
    let ultimoMes = null;

    distribuicoes.forEach(d => {
        distribuido += d.valor;

        if (d.pessoa === "Sandra") sandra += d.valor;
        if (d.pessoa === "Suely") suely += d.valor;

        if (d.data) {
            const dt = new Date(d.data);
            if (!ultimaData || dt > ultimaData) ultimaData = dt;
        }

        if (d.mes) {
            const m = new Date(d.mes + "-01");
            if (!ultimoMes || m > ultimoMes) ultimoMes = m;
        }
    });

    const lucroTotal = dados.length ? dados[dados.length - 1].saldo : 0;

    document.getElementById("dashLucroTotal").innerText = `R$ ${lucroTotal.toFixed(2)}`;
    document.getElementById("dashDistribuido").innerText = `R$ ${distribuido.toFixed(2)}`;
    document.getElementById("dashPendente").innerText = `R$ ${(lucroTotal - distribuido).toFixed(2)}`;
    document.getElementById("dashDistribuidoSandra").innerText = `R$ ${sandra.toFixed(2)}`;
    document.getElementById("dashDistribuidoSuely").innerText = `R$ ${suely.toFixed(2)}`;
    document.getElementById("dashQtdEnvios").innerText = distribuicoes.length;
    document.getElementById("dashUltimaData").innerText = ultimaData ? ultimaData.toLocaleDateString("pt-BR") : "—";
    document.getElementById("dashUltimoMes").innerText = ultimoMes
        ? ultimoMes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
        : "—";
}

//  EVENTOS 
btnNovaLinha.onclick = () => criarLinha();
btnNovaDistribuicao.onclick = () => criarLinhaDistribuicao();
btnSalvar.onclick = salvarManual;
btnImportar.onclick = () => inputBackup.click();

//  BACKUP 
function salvarManual() {
    atualizarSistema();
    atualizarDistribuicao();

    const backup = {
        data: new Date().toISOString(),
        locacoes: dados,
        distribuicoes: distribuicoes
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-locacoes.json";
    a.click();

    URL.revokeObjectURL(url);
}

//  IMPORTAR 
inputBackup.addEventListener("change", () => {
    const file = inputBackup.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        const backup = JSON.parse(e.target.result);

        dados = backup.locacoes || [];
        distribuicoes = backup.distribuicoes || [];

        corpoTabela.innerHTML = "";
        corpoDistribuicao.innerHTML = "";

        dados.forEach(criarLinha);
        distribuicoes.forEach(criarLinhaDistribuicao);

        salvarStorage();
        atualizarSistema();
        atualizarDistribuicao();
    };

    reader.readAsText(file);
});

//  INIT 
dados.forEach(criarLinha);
distribuicoes.forEach(criarLinhaDistribuicao);
atualizarSistema();
atualizarDistribuicao();

//  DASHBOARD MENSAL 
const filtroMes = document.getElementById("filtroMes");

filtroMes.addEventListener("change", atualizarDashboardMensal);

function atualizarDashboardMensal() {
    const mesSelecionado = filtroMes.value;
    if (!mesSelecionado) return;

    let entradas = 0;
    let saidas = 0;
    let sandra = 0;
    let suely = 0;

    //  LOCAÇÕES 
    dados.forEach(d => {
        if (d.data && d.data.startsWith(mesSelecionado)) {
            if (d.valor > 0) entradas += d.valor;
            else saidas += d.valor;
        }
    });

    //  DISTRIBUIÇÕES
    distribuicoes.forEach(d => {
        if (d.mes === mesSelecionado) {
            if (d.pessoa === "Sandra") sandra += d.valor;
            if (d.pessoa === "Suely") suely += d.valor;
        }
    });

    const resultado = entradas + saidas; // saidas já é negativo

    document.getElementById("dashMesEntradas").innerText =
        `R$ ${entradas.toFixed(2)}`;

    document.getElementById("dashMesSaidas").innerText =
        `R$ ${Math.abs(saidas).toFixed(2)}`;

    document.getElementById("dashMesSandra").innerText =
        `R$ ${sandra.toFixed(2)}`;

    document.getElementById("dashMesSuely").innerText =
        `R$ ${suely.toFixed(2)}`;

    document.getElementById("dashMesResultado").innerText =
        `R$ ${resultado.toFixed(2)}`;
}

function atualizarPainelLojas() {
    const lojas = ["Eletronica", "Casa do Norte", "Bar", "Hotel"];
    const painel = document.getElementById("painelLojas");

    painel.innerHTML = "";

    lojas.forEach(loja => {
        const registros = dados.filter(d => d.loja === loja);

        let status = "🔴";
        let classe = "alerta";
        let textoStatus = "Sem movimentação";

        if (registros.length) {
            const ultimo = registros[registros.length - 1];

            if (ultimo.valor > 0) {
                status = "🟢";
                classe = "entrada";
                textoStatus = "Entrada registrada";
            } else {
                status = "🟡";
                classe = "saida";
                textoStatus = "Somente saída";
            }

            painel.innerHTML += `
                <div class="card ${classe}">
                    <h3>${status} ${loja}</h3>
                    <p><strong>Última data:</strong> ${ultimo.data || "—"}</p>
                    <p><strong>Tipo:</strong> ${ultimo.lancamento}</p>
                    <p><strong>Valor:</strong> R$ ${Math.abs(ultimo.valor).toFixed(2)}</p>
                    <small>${textoStatus}</small>
                </div>
            `;
        } else {
            painel.innerHTML += `
                <div class="card alerta">
                    <h3>🔴 ${loja}</h3>
                    <p>Sem lançamentos registrados</p>
                    <small>⚠️ Verificar pagamento</small>
                </div>
            `;
        }
    });
}

